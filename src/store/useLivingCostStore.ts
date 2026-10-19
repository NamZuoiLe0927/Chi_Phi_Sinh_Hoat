"use client";

import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type {
  AnalysisTabId,
  DailyTransaction,
  DailyTransactionDraft,
  DashboardViewId,
  ExpenseItem,
  ExpenseItemDraft,
  FilterState,
  ImportResult,
  LivingCostState,
  LivingCostStore,
  OptimizationAppliedChange,
  OptimizationResult,
  ParsedTransactionDraft,
  PaymentSource,
  Profile,
  QuickSetupInput,
  SimulationApplyPayload,
  SortState,
  ViewMode,
  WhatIfSimulationResult,
} from "@/types/living-cost.types";
import {
  INITIAL_UI_STATE,
  MOCK_CATEGORY_GROUPS,
  MOCK_EXPENSE_ITEMS,
  MOCK_PROFILE,
  MOCK_TRANSACTIONS,
} from "@/data/mock-data";
import { createDemoTransactions } from "@/data/demo-transactions";
import { normalizeToMonthly } from "@/lib/calculator/frequency";
import { toLocalISODate } from "@/lib/calculator/date";
import {
  computeVaultBalance,
  createMonthlyRecords,
  sumMonthlySpent,
} from "@/lib/calculator/ledger";
import { inferDailyCategoryCode, mapParsedCategoryToCode } from "@/lib/daily";
import {
  DASHBOARD_HOME_VIEW,
  resolveDashboardView,
} from "@/lib/dashboard-view";
import { clamp } from "@/lib/utils";
import { PRESET_SCALING } from "@/constants/presets";
import {
  backupPayloadSchema,
  getBackupValidationIssues,
} from "@/lib/validators/backup";

const STORAGE_KEY = "chi-phi-sinh-hoat-store";
const STORE_VERSION = 1;
const APP_VERSION = "0.1.0";

function createMemoryStorage(): StateStorage {
  const values = new Map<string, string>();

  return {
    getItem: (name) => values.get(name) ?? null,
    setItem: (name, value) => {
      values.set(name, value);
    },
    removeItem: (name) => {
      values.delete(name);
    },
  };
}

const memoryStorage = createMemoryStorage();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function cloneFilters(filters: FilterState): FilterState {
  return {
    ...filters,
    groupCodes: [...filters.groupCodes],
    frequencies: [...filters.frequencies],
    dateRange: filters.dateRange ? { ...filters.dateRange } : null,
  };
}

function cloneSort(sort: SortState): SortState {
  return { ...sort };
}

function createInitialState(): LivingCostState {
  return {
    profile: { ...MOCK_PROFILE },
    categoryGroups: MOCK_CATEGORY_GROUPS.map((group) => ({ ...group })),
    expenseItems: MOCK_EXPENSE_ITEMS.map((item) => ({ ...item })),
    transactions: MOCK_TRANSACTIONS.map((transaction) => ({ ...transaction })),
    initialSavingsFund: MOCK_PROFILE.currentSavings,
    monthlyRecords: createMonthlyRecords(
      new Date().getFullYear(),
      MOCK_PROFILE.monthlyIncome,
    ),
    ui: {
      ...INITIAL_UI_STATE,
      filters: cloneFilters(INITIAL_UI_STATE.filters),
      sort: cloneSort(INITIAL_UI_STATE.sort),
    },
    simulation: null,
    simulationExpenseDelta: 0,
    lastOptimization: null,
    lastOptimizationChanges: [],
    hydrated: false,
    updatedAt: MOCK_PROFILE.updatedAt,
  };
}

function resetToMock(state: LivingCostState): void {
  const initial = createInitialState();
  state.profile = initial.profile;
  state.categoryGroups = initial.categoryGroups;
  state.expenseItems = initial.expenseItems;
  state.transactions = initial.transactions;
  state.initialSavingsFund = initial.initialSavingsFund;
  state.monthlyRecords = initial.monthlyRecords;
  state.ui = initial.ui;
  state.simulation = null;
  state.simulationExpenseDelta = 0;
  state.lastOptimization = null;
  state.lastOptimizationChanges = [];
  state.hydrated = true;
  state.updatedAt = nowIso();
}

export const useLivingCostStore = create<LivingCostStore>()(
  persist(
    immer((set, get) => ({
      ...createInitialState(),

      updateProfile: (patch) => {
        const timestamp = nowIso();
        set((state) => {
          Object.assign(state.profile, patch);
          state.profile.updatedAt = timestamp;
          state.updatedAt = timestamp;
        });
      },

      applyQuickSetup: (input: QuickSetupInput) => {
        const timestamp = nowIso();
        const income = Math.max(0, input.monthlyIncome);
        const savingsRate = clamp(input.savingsGoalPercentage, 0, 100);
        const scaling = PRESET_SCALING[input.presetId];

        set((state) => {
          state.profile.monthlyIncome = income;
          state.profile.savingsGoalAmount = Math.round(
            (income * savingsRate) / 100,
          );
          state.profile.lifestyle =
            input.presetId === "STUDENT" ? "FRUGAL" : "BALANCED";

          if (input.presetId !== "CUSTOM" && scaling) {
            const baseItems = new Map(
              MOCK_EXPENSE_ITEMS.map((item) => [item.id, item]),
            );

            for (const item of state.expenseItems) {
              const base = baseItems.get(item.id);
              if (!base) continue;

              const multiplier =
                item.group === "SAVINGS_DEBT"
                  ? scaling.savings
                  : item.id === "item-rent"
                    ? scaling.rent
                    : item.group === "WANTS"
                      ? scaling.wants
                      : scaling.needs;

              item.frequency = base.frequency;
              item.isFixed = base.isFixed;
              item.unitPrice = Math.max(
                0,
                Math.round(base.unitPrice * multiplier),
              );
              item.quantityPerPeriod =
                scaling.quantityOverrides[item.id] ?? base.quantityPerPeriod;
              item.updatedAt = timestamp;
            }
          }

          state.profile.updatedAt = timestamp;
          state.updatedAt = timestamp;
        });
      },

      addExpenseItem: (input: ExpenseItemDraft) => {
        const timestamp = nowIso();
        const state = get();
        const sortOrder =
          input.sortOrder > 0
            ? input.sortOrder
            : state.expenseItems.length + 1;

        const item: ExpenseItem = {
          ...input,
          id: createId("item"),
          profileId: state.profile.id,
          sortOrder,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        set((draft) => {
          draft.expenseItems.push(item);
          draft.updatedAt = timestamp;
        });

        return item;
      },

      updateExpenseItem: (id, patch) => {
        const timestamp = nowIso();
        set((state) => {
          const item = state.expenseItems.find(
            (expenseItem) => expenseItem.id === id,
          );
          if (!item) return;

          Object.assign(item, patch);
          item.updatedAt = timestamp;
          state.updatedAt = timestamp;
        });
      },

      removeExpenseItem: (id) => {
        const timestamp = nowIso();
        set((state) => {
          state.expenseItems = state.expenseItems.filter(
            (item) => item.id !== id,
          );

          for (const transaction of state.transactions) {
            if (transaction.expenseItemId === id) {
              transaction.expenseItemId = null;
            }
          }

          state.lastOptimizationChanges = state.lastOptimizationChanges.filter(
            (change) => change.expenseItemId !== id,
          );
          state.updatedAt = timestamp;
        });
      },

      toggleExpenseItem: (id, enabled) => {
        const timestamp = nowIso();
        set((state) => {
          const item = state.expenseItems.find(
            (expenseItem) => expenseItem.id === id,
          );
          if (!item) return;

          item.isEnabled = enabled;
          item.updatedAt = timestamp;
          state.updatedAt = timestamp;
        });
      },

      reorderExpenseItems: (orderedIds) => {
        const timestamp = nowIso();
        set((state) => {
          const order = new Map(
            orderedIds.map((id, index) => [id, index + 1]),
          );
          let nextSortOrder = order.size + 1;

          for (const item of state.expenseItems) {
            item.sortOrder = order.get(item.id) ?? nextSortOrder;
            nextSortOrder += 1;
            item.updatedAt = timestamp;
          }

          state.expenseItems.sort((a, b) => a.sortOrder - b.sortOrder);
          state.updatedAt = timestamp;
        });
      },

      addTransaction: (input: DailyTransactionDraft) => {
        const timestamp = nowIso();
        const transaction: DailyTransaction = {
          ...input,
          id: createId("tx"),
          profileId: get().profile.id,
          createdAt: timestamp,
        };

        set((state) => {
          state.transactions.push(transaction);
          state.updatedAt = timestamp;
        });

        return transaction;
      },

      updateTransaction: (id, patch) => {
        const timestamp = nowIso();
        set((state) => {
          const transaction = state.transactions.find(
            (item) => item.id === id,
          );
          if (!transaction) return;

          Object.assign(transaction, patch);
          state.updatedAt = timestamp;
        });
      },

      removeTransaction: (id) => {
        const timestamp = nowIso();
        set((state) => {
          state.transactions = state.transactions.filter(
            (transaction) => transaction.id !== id,
          );
          state.updatedAt = timestamp;
        });
      },

      addParsedTransactions: (drafts: ParsedTransactionDraft[]) => {
        if (drafts.length === 0) return [];

        const timestamp = nowIso();
        const profileId = get().profile.id;
        const date = toLocalISODate(new Date());

        const transactions: DailyTransaction[] = drafts.map((draft) => ({
          id: createId("tx"),
          profileId,
          expenseItemId: null,
          title: draft.title,
          amount: draft.amount,
          date,
          paymentMethod: draft.paymentMethod,
          paymentSource: "CASH",
          categoryCode: mapParsedCategoryToCode(draft.category),
          note: draft.rawText,
          source: "SMART_PARSER",
          createdAt: timestamp,
        }));

        set((state) => {
          state.transactions.push(...transactions);
          state.updatedAt = timestamp;
        });

        return transactions;
      },

      setInitialSavingsFund: (amount) => {
        const timestamp = nowIso();
        set((state) => {
          state.initialSavingsFund = Math.max(0, Math.round(amount));
          state.profile.currentSavings = Math.max(
            0,
            Math.round(
              computeVaultBalance(
                state.initialSavingsFund,
                state.monthlyRecords,
              ),
            ),
          );
          state.profile.updatedAt = timestamp;
          state.updatedAt = timestamp;
        });
      },

      updateMonthlyRecord: (month, patch) => {
        const timestamp = nowIso();
        set((state) => {
          const record = state.monthlyRecords.find(
            (item) => item.month === month,
          );
          if (!record) return;

          if (patch.mode !== undefined && patch.mode !== record.mode) {
            if (patch.mode === "MANUAL" && record.mode === "AUTO") {
              record.manualNetBalance = Math.round(
                record.income - sumMonthlySpent(state.transactions, record.month),
              );
            }
            record.mode = patch.mode;
          }

          if (patch.income !== undefined) {
            record.income = Math.max(0, Math.round(patch.income));
          }

          if (patch.manualNetBalance !== undefined) {
            record.manualNetBalance =
              patch.manualNetBalance === null
                ? null
                : Math.round(patch.manualNetBalance);
          }

          if (patch.note !== undefined) {
            record.note = patch.note;
          }

          if (patch.isSettled !== undefined) {
            if (patch.isSettled && record.mode === "AUTO") {
              record.manualNetBalance = Math.round(
                record.income - sumMonthlySpent(state.transactions, record.month),
              );
              record.mode = "MANUAL";
            }
            record.isSettled = patch.isSettled;
          }

          record.updatedAt = timestamp;
          state.profile.currentSavings = Math.max(
            0,
            Math.round(
              computeVaultBalance(
                state.initialSavingsFund,
                state.monthlyRecords,
              ),
            ),
          );
          state.profile.updatedAt = timestamp;
          state.updatedAt = timestamp;
        });
      },

      applyOptimization: (result: OptimizationResult) => {
        const timestamp = nowIso();
        set((state) => {
          const changes: OptimizationAppliedChange[] = [];

          for (const suggestion of result.suggestions) {
            const item = state.expenseItems.find(
              (expenseItem) => expenseItem.id === suggestion.expenseItemId,
            );
            if (!item) continue;

            const previousQuantity = item.quantityPerPeriod;
            const previousMonthlyCost = normalizeToMonthly(item);
            item.quantityPerPeriod = suggestion.suggestedQuantity;
            item.updatedAt = timestamp;
            const nextMonthlyCost = normalizeToMonthly(item);

            changes.push({
              expenseItemId: item.id,
              name: item.name,
              previousQuantity,
              nextQuantity: item.quantityPerPeriod,
              previousMonthlyCost,
              nextMonthlyCost,
              monthlySavings: previousMonthlyCost - nextMonthlyCost,
            });
          }

          state.lastOptimization = result;
          state.lastOptimizationChanges = changes;
          state.updatedAt = timestamp;
        });
      },

      revertOptimization: () => {
        const timestamp = nowIso();
        set((state) => {
          for (const change of state.lastOptimizationChanges) {
            const item = state.expenseItems.find(
              (expenseItem) => expenseItem.id === change.expenseItemId,
            );
            if (!item) continue;

            item.quantityPerPeriod = change.previousQuantity;
            item.updatedAt = timestamp;
          }

          state.lastOptimization = null;
          state.lastOptimizationChanges = [];
          state.updatedAt = timestamp;
        });
      },

      setSimulation: (simulation: WhatIfSimulationResult | null) => {
        set((state) => {
          state.simulation = simulation;
        });
      },

      applySimulation: (payload: SimulationApplyPayload) => {
        const timestamp = nowIso();
        set((state) => {
          state.profile.monthlyIncome = Math.max(
            0,
            state.profile.monthlyIncome + payload.incomeDelta,
          );

          for (const change of payload.expenseItemChanges) {
            const item = state.expenseItems.find(
              (expenseItem) => expenseItem.id === change.expenseItemId,
            );
            if (!item) continue;

            item.quantityPerPeriod = Math.max(0, change.quantityPerPeriod);
            item.updatedAt = timestamp;
          }

          for (const draft of payload.newExpenseItems ?? []) {
            state.expenseItems.push({
              ...draft,
              id: createId("item"),
              profileId: state.profile.id,
              createdAt: timestamp,
              updatedAt: timestamp,
            });
          }

          state.simulationExpenseDelta = Math.max(
            0,
            payload.temporaryMonthlyExpenseDelta,
          );
          state.simulation = null;
          state.profile.updatedAt = timestamp;
          state.updatedAt = timestamp;
        });
      },

      resetSimulation: () => {
        set((state) => {
          state.simulation = null;
          state.simulationExpenseDelta = 0;
        });
      },

      loadDemoData: () => {
        set((state) => {
          resetToMock(state);
          state.transactions = createDemoTransactions({
            profileId: state.profile.id,
          });
          state.updatedAt = nowIso();
        });
      },

      importBackup: (payload: unknown) => {
        const parsed = backupPayloadSchema.safeParse(payload);

        if (!parsed.success) {
          return {
            success: false,
            importedProfile: false,
            importedExpenseItems: 0,
            importedTransactions: 0,
            importedMonthlyRecords: 0,
            issues: getBackupValidationIssues(parsed.error),
          };
        }

        const backup = parsed.data;
        const timestamp = nowIso();
        const importedMonthlyRecords = backup.monthlyRecords?.length ?? 0;

        set((state) => {
          state.profile = { ...backup.profile };
          state.categoryGroups = backup.categoryGroups.map((group) => ({
            ...group,
          }));
          state.expenseItems = backup.expenseItems.map((item) => ({
            ...item,
          }));
          state.transactions = backup.transactions.map((transaction) => ({
            ...transaction,
            categoryCode:
              transaction.categoryCode ??
              inferDailyCategoryCode(transaction.title),
            paymentSource: transaction.paymentSource ?? "CASH",
          }));
          state.initialSavingsFund =
            backup.initialSavingsFund ?? backup.profile.currentSavings;
          state.monthlyRecords =
            backup.monthlyRecords && backup.monthlyRecords.length > 0
              ? backup.monthlyRecords.map((record) => ({ ...record }))
              : createMonthlyRecords(
                  new Date().getFullYear(),
                  backup.profile.monthlyIncome,
                );
          state.ui = {
            ...INITIAL_UI_STATE,
            filters: cloneFilters(INITIAL_UI_STATE.filters),
            sort: cloneSort(INITIAL_UI_STATE.sort),
          };
          state.simulation = null;
          state.simulationExpenseDelta = 0;
          state.lastOptimization = null;
          state.lastOptimizationChanges = [];
          state.hydrated = true;
          state.updatedAt = timestamp;
        });

        return {
          success: true,
          importedProfile: true,
          importedExpenseItems: backup.expenseItems.length,
          importedTransactions: backup.transactions.length,
          importedMonthlyRecords,
          issues: [],
        };
      },

      exportBackup: () => {
        const state = get();
        return {
          metadata: {
            version: STORE_VERSION,
            schemaVersion: 1,
            appVersion: APP_VERSION,
            exportedAt: nowIso(),
            currency: "VND",
          },
          profile: { ...state.profile },
          categoryGroups: state.categoryGroups.map((group) => ({ ...group })),
          expenseItems: state.expenseItems.map((item) => ({ ...item })),
          transactions: state.transactions.map((transaction) => ({
            ...transaction,
          })),
          initialSavingsFund: state.initialSavingsFund,
          monthlyRecords: state.monthlyRecords.map((record) => ({
            ...record,
          })),
        };
      },

      setActiveTab: (tab: AnalysisTabId) => {
        set((state) => {
          state.ui.activeTab = tab;
        });
      },

      setViewMode: (mode: ViewMode) => {
        set((state) => {
          state.ui.viewMode = mode;
        });
      },

      setActiveView: (view: DashboardViewId) => {
        set((state) => {
          state.ui.activeView = view;
        });
      },

      setFilters: (filters: Partial<FilterState>) => {
        set((state) => {
          const nextFilters: FilterState = {
            ...state.ui.filters,
            ...filters,
            groupCodes: filters.groupCodes
              ? [...filters.groupCodes]
              : state.ui.filters.groupCodes,
            frequencies: filters.frequencies
              ? [...filters.frequencies]
              : state.ui.filters.frequencies,
          };
          state.ui.filters = nextFilters;
        });
      },

      resetFilters: () => {
        set((state) => {
          state.ui.filters = cloneFilters(INITIAL_UI_STATE.filters);
        });
      },

      setSort: (sort: SortState) => {
        set((state) => {
          state.ui.sort = cloneSort(sort);
        });
      },

      setCommandPaletteOpen: (open) => {
        set((state) => {
          state.ui.isCommandPaletteOpen = open;
        });
      },

      setOptimizationOpen: (open) => {
        set((state) => {
          state.ui.isOptimizationOpen = open;
        });
      },

      setWhatIfOpen: (open) => {
        set((state) => {
          state.ui.isWhatIfOpen = open;
        });
      },

      setDataManagerOpen: (open) => {
        set((state) => {
          state.ui.isDataManagerOpen = open;
        });
      },

      setHydrated: (hydrated) => {
        set((state) => {
          state.hydrated = hydrated;
        });
      },

      resetAll: () => {
        set((state) => {
          resetToMock(state);
        });
      },
    })),
    {
      name: STORAGE_KEY,
      version: STORE_VERSION,
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : memoryStorage,
      ),
      partialize: (state) => ({
        profile: state.profile,
        categoryGroups: state.categoryGroups,
        expenseItems: state.expenseItems,
        transactions: state.transactions,
        initialSavingsFund: state.initialSavingsFund,
        monthlyRecords: state.monthlyRecords,
        ui: {
          ...state.ui,
          activeView: DASHBOARD_HOME_VIEW,
          isCommandPaletteOpen: false,
          isOptimizationOpen: false,
          isWhatIfOpen: false,
          isDataManagerOpen: false,
          selectedExpenseItemId: null,
        },
        simulation: state.simulation,
        simulationExpenseDelta: state.simulationExpenseDelta,
        lastOptimization: state.lastOptimization,
        lastOptimizationChanges: state.lastOptimizationChanges,
        updatedAt: state.updatedAt,
      }),
      merge: (persistedState, currentState) => {
        const persisted = (persistedState ?? {}) as Partial<LivingCostState>;
        const persistedProfile = persisted.profile as Profile | undefined;
        const transactions = Array.isArray(persisted.transactions)
          ? persisted.transactions.map((transaction) => ({
              ...transaction,
              categoryCode:
                transaction.categoryCode ??
                inferDailyCategoryCode(transaction.title),
              paymentSource:
                transaction.paymentSource ?? ("CASH" as PaymentSource),
            }))
          : currentState.transactions;
        const monthlyRecords =
          Array.isArray(persisted.monthlyRecords) &&
          persisted.monthlyRecords.length > 0
            ? persisted.monthlyRecords
            : createMonthlyRecords(
                new Date().getFullYear(),
                persistedProfile?.monthlyIncome ??
                  currentState.profile.monthlyIncome,
              );

        return {
          ...currentState,
          ...persisted,
          profile: persistedProfile
            ? { ...persistedProfile }
            : currentState.profile,
          transactions,
          initialSavingsFund:
            typeof persisted.initialSavingsFund === "number"
              ? persisted.initialSavingsFund
              : persistedProfile?.currentSavings ??
                currentState.initialSavingsFund,
          monthlyRecords,
        } as LivingCostStore;
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          const resolvedView = resolveDashboardView(state.ui.activeView);
          if (resolvedView !== state.ui.activeView) {
            state.setActiveView(resolvedView);
          }
        }
        state?.setHydrated(true);
      },
    },
  ),
);
