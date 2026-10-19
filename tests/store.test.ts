import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { useLivingCostStore } from "@/store/useLivingCostStore";
import { autoOptimizeLivingCost } from "@/lib/calculator/optimizer";
import type { BackupPayload } from "@/types/living-cost.types";

function resetStore(): void {
  useLivingCostStore.getState().resetAll();
}

describe("living cost Zustand store", () => {
  beforeEach(() => {
    resetStore();
  });

  it("starts with complete Vietnamese mock data", () => {
    const state = useLivingCostStore.getState();

    assert.equal(state.profile.name, "Nguyễn Văn Minh");
    assert.equal(state.profile.monthlyIncome, 20_000_000);
    assert.equal(state.categoryGroups.length, 3);
    assert.equal(state.expenseItems.length, 26);
    assert.equal(state.transactions.length, 0);
    assert.equal(state.hydrated, true);
    assert.equal(state.ui.activeView, "HEALTH");
  });

  it("updates the profile and quick setup values", () => {
    const store = useLivingCostStore.getState();
    store.updateProfile({ monthlyIncome: 25_000_000 });
    store.applyQuickSetup({
      monthlyIncome: 30_000_000,
      savingsGoalPercentage: 20,
      presetId: "SINGLE_PROFESSIONAL",
    });

    assert.equal(useLivingCostStore.getState().profile.monthlyIncome, 30_000_000);
    assert.equal(
      useLivingCostStore.getState().profile.savingsGoalAmount,
      6_000_000,
    );
  });

  it("adds, updates, toggles and removes an expense item safely", () => {
    const store = useLivingCostStore.getState();
    const item = store.addExpenseItem({
      name: "Học tiếng Anh",
      group: "WANTS",
      icon: "BookOpen",
      color: "#60a5fa",
      frequency: "MONTHLY",
      unitPrice: 500_000,
      quantityPerPeriod: 1,
      isFixed: false,
      isEnabled: true,
      priority: 3,
      note: null,
      sortOrder: 0,
    });

    assert.equal(useLivingCostStore.getState().expenseItems.length, 27);
    assert.equal(item.profileId, "default-profile");

    useLivingCostStore.getState().updateExpenseItem(item.id, {
      unitPrice: 650_000,
    });
    assert.equal(
      useLivingCostStore
        .getState()
        .expenseItems.find((expenseItem) => expenseItem.id === item.id)
        ?.unitPrice,
      650_000,
    );

    useLivingCostStore.getState().toggleExpenseItem(item.id, false);
    assert.equal(
      useLivingCostStore
        .getState()
        .expenseItems.find((expenseItem) => expenseItem.id === item.id)
        ?.isEnabled,
      false,
    );

    const transaction = useLivingCostStore.getState().addTransaction({
      expenseItemId: item.id,
      title: "Thanh toán học phí",
      amount: 650_000,
      date: "2026-10-19",
      paymentMethod: "BANK_TRANSFER",
      paymentSource: "CASH",
      categoryCode: "OTHER",
      note: null,
      source: "MANUAL",
    });

    useLivingCostStore.getState().removeExpenseItem(item.id);
    const state = useLivingCostStore.getState();
    assert.equal(state.expenseItems.length, 26);
    assert.equal(
      state.transactions.find((entry) => entry.id === transaction.id)
        ?.expenseItemId,
      null,
    );
  });

  it("applies and reverts an optimization plan", () => {
    const stateBefore = useLivingCostStore.getState();
    const coffeeBefore = stateBefore.expenseItems.find(
      (item) => item.id === "item-coffee",
    );
    assert.ok(coffeeBefore);

    const result = autoOptimizeLivingCost(stateBefore.expenseItems, {
      targetMonthlyExpense: 18_000_000,
    });
    stateBefore.applyOptimization(result);

    const optimized = useLivingCostStore.getState();
    assert.ok(optimized.lastOptimization);
    assert.equal(
      optimized.lastOptimizationChanges.length,
      result.suggestions.length,
    );

    const coffeeAfter = optimized.expenseItems.find(
      (item) => item.id === "item-coffee",
    );
    assert.ok(coffeeAfter);
    assert.ok(coffeeAfter.quantityPerPeriod < coffeeBefore.quantityPerPeriod);

    optimized.revertOptimization();
    const reverted = useLivingCostStore.getState();
    assert.equal(reverted.lastOptimization, null);
    assert.equal(
      reverted.expenseItems.find((item) => item.id === "item-coffee")
        ?.quantityPerPeriod,
      coffeeBefore.quantityPerPeriod,
    );
  });

  it("exports and imports a backup without losing data", () => {
    const backup = useLivingCostStore.getState().exportBackup();
    assert.equal(backup.metadata.currency, "VND");
    assert.equal(backup.expenseItems.length, 26);

    useLivingCostStore.getState().updateProfile({
      monthlyIncome: 99_000_000,
    });
    assert.equal(useLivingCostStore.getState().profile.monthlyIncome, 99_000_000);

    const result = useLivingCostStore.getState().importBackup(backup);
    assert.equal(result.success, true);
    assert.equal(result.importedExpenseItems, 26);
    assert.equal(useLivingCostStore.getState().profile.monthlyIncome, 20_000_000);
  });

  it("rejects an invalid backup payload", () => {
    const backup = useLivingCostStore.getState().exportBackup();
    const invalid = {
      ...backup,
      expenseItems: null,
    } as unknown as BackupPayload;

    const result = useLivingCostStore.getState().importBackup(invalid);
    assert.equal(result.success, false);
    assert.equal(result.importedExpenseItems, 0);
    assert.ok(result.issues.length > 0);
  });

  it("applies a what-if simulation payload", () => {
    useLivingCostStore.getState().applySimulation({
      incomeDelta: 2_000_000,
      expenseItemChanges: [
        { expenseItemId: "item-coffee", quantityPerPeriod: 8 },
      ],
      temporaryMonthlyExpenseDelta: 500_000,
    });

    const state = useLivingCostStore.getState();
    assert.equal(state.profile.monthlyIncome, 22_000_000);
    assert.equal(
      state.expenseItems.find((item) => item.id === "item-coffee")
        ?.quantityPerPeriod,
      8,
    );
    assert.equal(state.simulationExpenseDelta, 500_000);

    state.resetSimulation();
    assert.equal(useLivingCostStore.getState().simulationExpenseDelta, 0);
  });

  it("adds simulated expense drafts to the main budget", () => {
    useLivingCostStore.getState().applySimulation({
      incomeDelta: 0,
      expenseItemChanges: [],
      temporaryMonthlyExpenseDelta: 0,
      newExpenseItems: [
        {
          name: "Mua xe trả góp",
          group: "SAVINGS_DEBT",
          icon: "CircleDollarSign",
          color: "#fbbf24",
          frequency: "MONTHLY",
          unitPrice: 2_500_000,
          quantityPerPeriod: 1,
          isFixed: true,
          isEnabled: true,
          priority: 2,
          note: "Kịch bản giả lập 12 tháng",
          sortOrder: 90,
        },
      ],
    });

    const state = useLivingCostStore.getState();
    assert.equal(state.expenseItems.length, 27);
    assert.equal(
      state.expenseItems.find((item) => item.name === "Mua xe trả góp")
        ?.unitPrice,
      2_500_000,
    );
  });

  it("loads a full month of demo transactions", () => {
    useLivingCostStore.getState().loadDemoData();

    const state = useLivingCostStore.getState();
    assert.ok(state.transactions.length > 0);
    assert.ok(
      state.transactions.every((transaction) => transaction.source === "DEMO"),
    );
    assert.equal(state.expenseItems.length, 26);
    assert.equal(state.profile.currentSavings, 50_000_000);
  });

  it("manages UI filters, sorting and tabs", () => {
    const store = useLivingCostStore.getState();
    store.setActiveTab("HISTORY");
    store.setViewMode("WORK_TIME");
    store.setActiveView("SETUP");
    store.setFilters({
      groupCodes: ["WANTS"],
      searchQuery: "cà phê",
    });
    store.setSort({ field: "amount", direction: "desc" });

    const state = useLivingCostStore.getState();
    assert.equal(state.ui.activeTab, "HISTORY");
    assert.equal(state.ui.viewMode, "WORK_TIME");
    assert.equal(state.ui.activeView, "SETUP");
    assert.deepEqual(state.ui.filters.groupCodes, ["WANTS"]);
    assert.equal(state.ui.filters.searchQuery, "cà phê");
    assert.deepEqual(state.ui.sort, { field: "amount", direction: "desc" });

    state.resetFilters();
    const reset = useLivingCostStore.getState();
    assert.deepEqual(reset.ui.filters.groupCodes, []);
    assert.equal(reset.ui.filters.searchQuery, "");
    assert.deepEqual(reset.ui.sort, { field: "amount", direction: "desc" });
  });

  it("links monthly ledger balances to the savings vault", () => {
    const store = useLivingCostStore.getState();
    const january = `${new Date().getFullYear()}-01`;

    assert.equal(store.initialSavingsFund, 50_000_000);
    assert.equal(store.monthlyRecords.length, 12);

    store.updateMonthlyRecord(january, {
      manualNetBalance: 4_000_000,
      note: "Thưởng Tết",
      isSettled: true,
    });

    let state = useLivingCostStore.getState();
    assert.equal(state.monthlyRecords[0].manualNetBalance, 4_000_000);
    assert.equal(state.monthlyRecords[0].note, "Thưởng Tết");
    assert.equal(state.monthlyRecords[0].isSettled, true);
    assert.equal(state.profile.currentSavings, 54_000_000);

    state.updateMonthlyRecord(january, {
      manualNetBalance: -2_500_000,
    });

    state = useLivingCostStore.getState();
    assert.equal(state.profile.currentSavings, 47_500_000);

    state.setInitialSavingsFund(60_000_000);
    assert.equal(
      useLivingCostStore.getState().profile.currentSavings,
      57_500_000,
    );
  });

  it("snapshots the auto month when it is settled", () => {
    useLivingCostStore.getState().loadDemoData();
    const state = useLivingCostStore.getState();
    const currentMonthIndex = new Date().getMonth();
    const record = state.monthlyRecords[currentMonthIndex];
    const expectedNet =
      record.income -
      state.transactions
        .filter(
          (transaction) => transaction.date.slice(0, 7) === record.month,
        )
        .reduce((sum, transaction) => sum + transaction.amount, 0);

    assert.equal(record.mode, "AUTO");
    state.updateMonthlyRecord(record.month, { isSettled: true });

    const settled =
      useLivingCostStore.getState().monthlyRecords[currentMonthIndex];
    assert.equal(settled.mode, "MANUAL");
    assert.equal(settled.isSettled, true);
    assert.equal(settled.manualNetBalance, expectedNet);
    assert.equal(
      useLivingCostStore.getState().profile.currentSavings,
      Math.max(0, 50_000_000 + expectedNet),
    );
  });

  it("round-trips the monthly ledger through a backup", () => {
    const store = useLivingCostStore.getState();
    store.updateMonthlyRecord(`${new Date().getFullYear()}-03`, {
      manualNetBalance: -1_250_000,
      note: "Tháng âm",
      isSettled: true,
    });
    store.setInitialSavingsFund(42_000_000);

    const backup = useLivingCostStore.getState().exportBackup();
    assert.equal(backup.initialSavingsFund, 42_000_000);
    assert.equal(backup.monthlyRecords?.length, 12);

    useLivingCostStore.getState().resetAll();
    const result = useLivingCostStore.getState().importBackup(backup);
    assert.equal(result.success, true);
    assert.equal(result.importedMonthlyRecords, 12);

    const state = useLivingCostStore.getState();
    assert.equal(state.initialSavingsFund, 42_000_000);
    assert.equal(state.monthlyRecords[2].manualNetBalance, -1_250_000);
    assert.equal(state.profile.currentSavings, 40_750_000);
  });
});
