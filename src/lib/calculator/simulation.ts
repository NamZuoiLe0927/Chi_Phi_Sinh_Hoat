import { RAISE_SALARY_INCOME_RATE } from "@/constants/life-events";
import type {
  CustomLifeEvent,
  ExpenseItem,
  ExpenseItemDraft,
  LifeEventPreset,
  Profile,
  SimulationApplyPayload,
  SimulationComparisonPoint,
  SimulationSnapshot,
  WhatIfSimulationResult,
} from "@/types/living-cost.types";
import { normalizeToMonthly } from "./frequency";

export const SIMULATION_ANNUAL_INTEREST_RATE = 8;
export const SIMULATION_YEARS = 3;

export interface WhatIfSimulationInput {
  profile: Profile;
  expenseItems: ExpenseItem[];
  enabledPresetIds: string[];
  customEvents?: CustomLifeEvent[];
  annualInterestRate?: number;
  years?: number;
  presets?: LifeEventPreset[];
}

interface DurationExpense {
  amount: number;
  months: number;
}

const GROUP_COLORS: Record<string, string> = {
  NEEDS: "#10b981",
  WANTS: "#f59e0b",
  SAVINGS_DEBT: "#fbbf24",
};

function buildSnapshot(
  monthlyIncome: number,
  monthlyExpense: number,
  monthlySavings: number,
): SimulationSnapshot {
  const netCashflow = monthlyIncome - monthlyExpense;
  return {
    monthlyIncome,
    monthlyExpense,
    monthlySavings,
    netCashflow,
    savingsRate:
      monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0,
  };
}

function getPresetGroup(preset: LifeEventPreset): "NEEDS" | "WANTS" | "SAVINGS_DEBT" {
  if (preset.type === "INSTALLMENT_PURCHASE") return "SAVINGS_DEBT";
  if (preset.type === "PET" || preset.type === "RAISE_SALARY") return "WANTS";
  return "NEEDS";
}

export function simulateWhatIf(
  input: WhatIfSimulationInput,
): WhatIfSimulationResult {
  const {
    profile,
    expenseItems,
    enabledPresetIds,
    customEvents = [],
    annualInterestRate = SIMULATION_ANNUAL_INTEREST_RATE,
    years = SIMULATION_YEARS,
    presets = [],
  } = input;

  const enabledItems = expenseItems.filter((item) => item.isEnabled);
  const monthlyIncome = profile.monthlyIncome + profile.extraIncome;
  const monthlyExpense = enabledItems.reduce(
    (total, item) => total + normalizeToMonthly(item),
    0,
  );
  const monthlySavings = enabledItems
    .filter((item) => item.group === "SAVINGS_DEBT")
    .reduce((total, item) => total + normalizeToMonthly(item), 0);
  const monthlyWants = enabledItems
    .filter((item) => item.group === "WANTS")
    .reduce((total, item) => total + normalizeToMonthly(item), 0);

  const baseline = buildSnapshot(
    monthlyIncome,
    monthlyExpense,
    monthlySavings,
  );

  let incomeDelta = 0;
  let expenseDelta = 0;
  let lifestyleCreepAmount = 0;
  const appliedEventIds: string[] = [];
  const durationExpenses: DurationExpense[] = [];

  for (const presetId of enabledPresetIds) {
    const preset = presets.find((entry) => entry.id === presetId);
    if (!preset) continue;

    appliedEventIds.push(preset.id);
    incomeDelta += preset.monthlyIncomeDelta;
    expenseDelta += preset.monthlyExpenseDelta;

    if (preset.type === "RAISE_SALARY") {
      incomeDelta += monthlyIncome * RAISE_SALARY_INCOME_RATE;
      const creep =
        monthlyWants * (preset.lifestyleCreepRate / 100);
      lifestyleCreepAmount += creep;
      expenseDelta += creep;
    } else if (preset.lifestyleCreepRate > 0) {
      const creep = monthlyWants * (preset.lifestyleCreepRate / 100);
      lifestyleCreepAmount += creep;
      expenseDelta += creep;
    }

    if (preset.durationMonths !== null) {
      durationExpenses.push({
        amount: preset.monthlyExpenseDelta,
        months: preset.durationMonths,
      });
    }
  }

  for (const customEvent of customEvents) {
    appliedEventIds.push(customEvent.id);
    incomeDelta += customEvent.monthlyIncomeDelta;
    expenseDelta += customEvent.monthlyExpenseDelta;

    if (customEvent.durationMonths !== null) {
      durationExpenses.push({
        amount: customEvent.monthlyExpenseDelta,
        months: customEvent.durationMonths,
      });
    }
  }

  const simulated = buildSnapshot(
    monthlyIncome + incomeDelta,
    monthlyExpense + expenseDelta,
    monthlySavings,
  );

  // Project free cashflow on top of current savings. Planned savings/debt
  // items are added back to net cashflow so the projection measures wealth
  // accumulation rather than double-counting budgeted savings. A negative
  // contribution draws down the accumulated balance.
  const baselineSavingsCapacity =
    baseline.netCashflow + baseline.monthlySavings;
  const permanentExpenseDelta =
    expenseDelta -
    durationExpenses.reduce((total, event) => total + event.amount, 0);

  const monthlyRate = annualInterestRate / 100 / 12;
  const totalMonths = years * 12;
  const initialBalance = Math.max(0, profile.currentSavings);
  const yearlyProjection: SimulationComparisonPoint[] = [
    { year: 0, baseline: initialBalance, simulated: initialBalance },
  ];

  let baselineBalance = initialBalance;
  let simulatedBalance = initialBalance;

  for (let month = 1; month <= totalMonths; month += 1) {
    const activeTemporaryExpense = durationExpenses.reduce(
      (total, event) => total + (month <= event.months ? event.amount : 0),
      0,
    );

    const baselineContribution = baselineSavingsCapacity;
    const simulatedContribution =
      baselineSavingsCapacity +
      incomeDelta -
      permanentExpenseDelta -
      activeTemporaryExpense;

    baselineBalance = Math.max(
      0,
      baselineBalance * (1 + monthlyRate) + baselineContribution,
    );
    simulatedBalance = Math.max(
      0,
      simulatedBalance * (1 + monthlyRate) + simulatedContribution,
    );

    if (month % 12 === 0) {
      yearlyProjection.push({
        year: month / 12,
        baseline: Math.round(baselineBalance),
        simulated: Math.round(simulatedBalance),
      });
    }
  }

  return {
    baseline,
    simulated,
    adjustment: {
      incomeDelta,
      expenseDelta,
      savingsDelta: 0,
      lifestyleCreepAmount,
      appliedEventIds,
    },
    yearlyProjection,
  };
}

export interface BuildSimulationApplyInput {
  result: WhatIfSimulationResult;
  enabledPresetIds: string[];
  customEvents: CustomLifeEvent[];
  presets: LifeEventPreset[];
}

/**
 * Converts the active what-if events into reusable expense drafts. Income
 * changes are stored on the profile, while each monthly expense delta becomes
 * a transparent budget line the user can later edit or remove.
 */
export function buildSimulationApplyPayload(
  input: BuildSimulationApplyInput,
): SimulationApplyPayload {
  const { result, enabledPresetIds, customEvents, presets } = input;
  const newExpenseItems: ExpenseItemDraft[] = [];
  let sortOrder = 90;

  for (const presetId of enabledPresetIds) {
    const preset = presets.find((entry) => entry.id === presetId);
    if (!preset) continue;

    const group = getPresetGroup(preset);
    const isRaiseSalary = preset.type === "RAISE_SALARY";
    const amount = isRaiseSalary
      ? result.adjustment.lifestyleCreepAmount
      : preset.monthlyExpenseDelta;

    if (amount <= 0) continue;

    newExpenseItems.push({
      name: isRaiseSalary
        ? `${preset.label} - lifestyle creep`
        : preset.label,
      group,
      icon: "CircleDollarSign",
      color: GROUP_COLORS[group],
      frequency: "MONTHLY",
      unitPrice: Math.round(amount),
      quantityPerPeriod: 1,
      isFixed: true,
      isEnabled: true,
      priority: 2,
      note:
        preset.durationMonths !== null
          ? `${preset.description}. Chi phí tạm thời trong ${preset.durationMonths} tháng.`
          : preset.description,
      sortOrder: sortOrder,
    });
    sortOrder += 1;
  }

  for (const customEvent of customEvents) {
    if (customEvent.monthlyExpenseDelta <= 0) continue;
    const group = "NEEDS" as const;
    newExpenseItems.push({
      name: customEvent.label,
      group,
      icon: "CircleDollarSign",
      color: GROUP_COLORS[group],
      frequency: "MONTHLY",
      unitPrice: Math.round(customEvent.monthlyExpenseDelta),
      quantityPerPeriod: 1,
      isFixed: true,
      isEnabled: true,
      priority: 2,
      note:
        customEvent.durationMonths !== null
          ? `Kịch bản giả lập, tạm thời trong ${customEvent.durationMonths} tháng.`
          : "Kịch bản giả lập từ What-If Simulator.",
      sortOrder: sortOrder,
    });
    sortOrder += 1;
  }

  return {
    incomeDelta: Math.round(result.adjustment.incomeDelta),
    expenseItemChanges: [],
    temporaryMonthlyExpenseDelta: 0,
    newExpenseItems,
  };
}
