import {
  MONTHLY_DAYS,
  RUNWAY_SAFE_MONTHS,
  RUNWAY_WARNING_MONTHS,
} from "@/constants/finance";
import type {
  RunwayInput,
  RunwayResult,
  RunwayScenario,
  RunwayStatus,
} from "@/types/living-cost.types";

function assertFiniteNonNegative(value: number, field: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${field} phải là số hữu hạn và không âm`);
  }
}

function calculateScenario(
  currentSavings: number,
  monthlyCost: number,
): RunwayScenario {
  if (monthlyCost <= 0) {
    return {
      monthlyCost: 0,
      months: 0,
      days: 0,
      totalDays: 0,
    };
  }

  const totalDays = (currentSavings / monthlyCost) * MONTHLY_DAYS;
  const months = Math.floor(totalDays / MONTHLY_DAYS);
  const days = Math.floor(totalDays - months * MONTHLY_DAYS);

  return {
    monthlyCost,
    months,
    days,
    totalDays,
  };
}

export function calculateFinancialRunway(input: RunwayInput): RunwayResult {
  assertFiniteNonNegative(input.currentSavings, "currentSavings");
  assertFiniteNonNegative(input.monthlyExpense, "monthlyExpense");
  assertFiniteNonNegative(
    input.survivalMonthlyExpense,
    "survivalMonthlyExpense",
  );

  const standard = calculateScenario(
    input.currentSavings,
    input.monthlyExpense,
  );
  const survival = calculateScenario(
    input.currentSavings,
    input.survivalMonthlyExpense,
  );

  const rawStandardMonths =
    input.monthlyExpense > 0
      ? input.currentSavings / input.monthlyExpense
      : Number.POSITIVE_INFINITY;

  let status: RunwayStatus = "SAFE";
  if (rawStandardMonths < RUNWAY_WARNING_MONTHS) {
    status = "DANGER";
  } else if (rawStandardMonths <= RUNWAY_SAFE_MONTHS) {
    status = "WARNING";
  }

  return {
    currentSavings: input.currentSavings,
    standard,
    survival,
    status,
    safeMonthsThreshold: RUNWAY_SAFE_MONTHS,
    warningMonthsThreshold: RUNWAY_WARNING_MONTHS,
  };
}
