import { FREQUENCY_DEFINITIONS, MONTHLY_DAYS, MONTHS_PER_YEAR } from "@/constants/finance";
import type { ExpenseItem, Frequency } from "@/types/living-cost.types";

export type ExpenseItemCostInput = Pick<
  ExpenseItem,
  "unitPrice" | "quantityPerPeriod" | "frequency"
>;

export interface ExpenseItemCosts {
  monthly: number;
  daily: number;
  yearly: number;
}

function assertFiniteNonNegative(value: number, field: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${field} phải là số hữu hạn và không âm`);
  }
}

export function getFrequencyMultiplier(frequency: Frequency): number {
  const definition = FREQUENCY_DEFINITIONS[frequency];
  if (!definition) {
    throw new RangeError(`Tần suất không hợp lệ: ${frequency}`);
  }
  return definition.monthlyMultiplier;
}

export function normalizeToMonthly(input: ExpenseItemCostInput): number {
  assertFiniteNonNegative(input.unitPrice, "unitPrice");
  assertFiniteNonNegative(input.quantityPerPeriod, "quantityPerPeriod");
  return input.unitPrice * input.quantityPerPeriod * getFrequencyMultiplier(input.frequency);
}

export function normalizeToDaily(input: ExpenseItemCostInput): number {
  return normalizeToMonthly(input) / MONTHLY_DAYS;
}

export function normalizeToYearly(input: ExpenseItemCostInput): number {
  return normalizeToMonthly(input) * MONTHS_PER_YEAR;
}

export function calculateExpenseItemCosts(
  input: ExpenseItemCostInput,
): ExpenseItemCosts {
  const monthly = normalizeToMonthly(input);
  return {
    monthly,
    daily: monthly / MONTHLY_DAYS,
    yearly: monthly * MONTHS_PER_YEAR,
  };
}

export function calculateMonthlyTotal(items: ExpenseItem[]): number {
  return items
    .filter((item) => item.isEnabled)
    .reduce((total, item) => total + normalizeToMonthly(item), 0);
}

export function calculateEnabledMonthlyTotal(items: ExpenseItem[]): number {
  return calculateMonthlyTotal(items);
}

export function calculateMonthlyTotalByGroup(
  items: ExpenseItem[],
  group: ExpenseItem["group"],
): number {
  return items
    .filter((item) => item.isEnabled && item.group === group)
    .reduce((total, item) => total + normalizeToMonthly(item), 0);
}
