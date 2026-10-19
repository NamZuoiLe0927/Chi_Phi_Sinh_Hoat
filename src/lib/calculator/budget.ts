import { BUDGET_RULES, MONTHLY_DAYS } from "@/constants/finance";
import type {
  BudgetRule,
  BudgetRuleAnalysis,
  BudgetRuleTarget,
  DailySafeToSpend,
  DailyTransaction,
  ExpenseItem,
  MonthlyBreakdown,
  Profile,
} from "@/types/living-cost.types";
import {
  getMonthRange,
  getRemainingDays,
  getTodayISO,
  isDateInRange,
} from "./date";
import { normalizeToMonthly } from "./frequency";

export interface AnalyzeBudgetRuleOptions {
  now?: Date;
  customTarget?: BudgetRuleTarget;
  includeTodayInRemainingDays?: boolean;
}

export function getBudgetRuleTarget(
  rule: BudgetRule,
  customTarget?: BudgetRuleTarget,
): BudgetRuleTarget {
  if (rule === "CUSTOM" && customTarget) {
    return customTarget;
  }
  return BUDGET_RULES[rule].target;
}

export function calculateMonthlyBreakdown(
  items: ExpenseItem[],
): MonthlyBreakdown {
  const breakdown: MonthlyBreakdown = {
    needs: 0,
    wants: 0,
    savingsDebt: 0,
    total: 0,
  };

  for (const item of items) {
    if (!item.isEnabled) continue;
    const monthlyCost = normalizeToMonthly(item);

    if (item.group === "NEEDS") {
      breakdown.needs += monthlyCost;
    } else if (item.group === "WANTS") {
      breakdown.wants += monthlyCost;
    } else {
      breakdown.savingsDebt += monthlyCost;
    }

    breakdown.total += monthlyCost;
  }

  return breakdown;
}

export function sumVariableTransactions(
  transactions: DailyTransaction[],
  expenseItems: ExpenseItem[],
  dateRange?: { startDate: string; endDate: string },
): number {
  const itemById = new Map(expenseItems.map((item) => [item.id, item]));

  return transactions.reduce((total, transaction) => {
    if (dateRange && !isDateInRange(transaction.date, dateRange)) {
      return total;
    }

    const linkedItem = transaction.expenseItemId
      ? itemById.get(transaction.expenseItemId)
      : undefined;

    if (linkedItem?.isFixed || linkedItem?.group === "SAVINGS_DEBT") {
      return total;
    }

    return total + transaction.amount;
  }, 0);
}

export function calculateMonthlyVariableBudget(
  profile: Profile,
  expenseItems: ExpenseItem[],
): number {
  const monthlyIncome = profile.monthlyIncome + profile.extraIncome;

  const fixedNonSavingsCost = expenseItems
    .filter(
      (item) =>
        item.isEnabled && item.isFixed && item.group !== "SAVINGS_DEBT",
    )
    .reduce((total, item) => total + normalizeToMonthly(item), 0);

  const plannedSavingsDebtCost = expenseItems
    .filter((item) => item.isEnabled && item.group === "SAVINGS_DEBT")
    .reduce((total, item) => total + normalizeToMonthly(item), 0);

  const savingsReserve = Math.max(
    profile.savingsGoalAmount,
    plannedSavingsDebtCost,
  );

  return Math.max(
    0,
    monthlyIncome - fixedNonSavingsCost - savingsReserve,
  );
}

export function calculateDailySafeToSpend(
  profile: Profile,
  expenseItems: ExpenseItem[],
  transactions: DailyTransaction[] = [],
  options: AnalyzeBudgetRuleOptions = {},
): DailySafeToSpend {
  const now = options.now ?? new Date();
  const monthRange = getMonthRange(now);
  const variableBudget = calculateMonthlyVariableBudget(profile, expenseItems);

  const actualVariableSpent = sumVariableTransactions(
    transactions,
    expenseItems,
    monthRange,
  );

  const remainingBudget = Math.max(0, variableBudget - actualVariableSpent);
  const remainingDays = getRemainingDays(
    now,
    options.includeTodayInRemainingDays ?? true,
  );
  const amountPerDay = remainingDays > 0 ? remainingBudget / remainingDays : 0;

  const today = getTodayISO(now);
  const spentToday = sumVariableTransactions(
    transactions,
    expenseItems,
    { startDate: today, endDate: today },
  );

  let status: DailySafeToSpend["status"] = "ON_TRACK";
  if (spentToday === 0) {
    status = "NO_SPEND";
  } else if (spentToday > amountPerDay) {
    status = "OVER_SPENT";
  }

  return {
    remainingBudget,
    remainingDays,
    amountPerDay,
    spentToday,
    remainingToday: Math.max(0, amountPerDay - spentToday),
    status,
  };
}

export function analyzeBudgetRule(
  profile: Profile,
  expenseItems: ExpenseItem[],
  transactions: DailyTransaction[] = [],
  options: AnalyzeBudgetRuleOptions = {},
): BudgetRuleAnalysis {
  const monthlyIncome = profile.monthlyIncome + profile.extraIncome;
  const actual = calculateMonthlyBreakdown(expenseItems);
  const targetPercentages = getBudgetRuleTarget(
    profile.budgetRule,
    options.customTarget,
  );

  const targetAmounts: MonthlyBreakdown = {
    needs: (monthlyIncome * targetPercentages.needs) / 100,
    wants: (monthlyIncome * targetPercentages.wants) / 100,
    savingsDebt: (monthlyIncome * targetPercentages.savingsDebt) / 100,
    total: monthlyIncome,
  };

  const percentageOfIncome = (amount: number) =>
    monthlyIncome > 0 ? (amount / monthlyIncome) * 100 : 0;

  const actualPercentages: BudgetRuleTarget = {
    needs: percentageOfIncome(actual.needs),
    wants: percentageOfIncome(actual.wants),
    savingsDebt: percentageOfIncome(actual.savingsDebt),
  };

  const variance: MonthlyBreakdown = {
    needs: actual.needs - targetAmounts.needs,
    wants: actual.wants - targetAmounts.wants,
    savingsDebt: actual.savingsDebt - targetAmounts.savingsDebt,
    total: actual.total - targetAmounts.total,
  };

  const isNeedsOver = actual.needs > targetAmounts.needs;
  const isWantsOver = actual.wants > targetAmounts.wants;
  const isSavingsUnder = actual.savingsDebt < targetAmounts.savingsDebt;
  const isOverBudget = actual.total > monthlyIncome;

  const safeToSpend = calculateDailySafeToSpend(
    profile,
    expenseItems,
    transactions,
    options,
  );

  let status: BudgetRuleAnalysis["status"] = "HEALTHY";
  if (isOverBudget || actual.savingsDebt < 0) {
    status = "CRITICAL";
  } else if (isNeedsOver || isWantsOver || isSavingsUnder) {
    status = "WARNING";
  }

  return {
    monthlyIncome,
    actual,
    targetAmounts,
    targetPercentages,
    actualPercentages,
    variance,
    isNeedsOver,
    isWantsOver,
    isSavingsUnder,
    isOverBudget,
    remainingAmount: monthlyIncome - actual.total,
    remainingDays: safeToSpend.remainingDays,
    safeToSpendPerDay: safeToSpend.amountPerDay,
    status,
  };
}

export function calculateMonthlyBurnRate(expenseItems: ExpenseItem[]): number {
  const monthlyTotal = expenseItems
    .filter((item) => item.isEnabled)
    .reduce((total, item) => total + normalizeToMonthly(item), 0);

  return monthlyTotal / MONTHLY_DAYS;
}
