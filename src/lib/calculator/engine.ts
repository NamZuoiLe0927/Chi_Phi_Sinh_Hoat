import {
  CATEGORY_DEFINITIONS,
  MONTHLY_DAYS,
  MONTHS_PER_YEAR,
} from "@/constants/finance";
import type {
  CategoryGroup,
  CategoryGroupSummary,
  DailyTransaction,
  ExpenseItem,
  ExpenseItemComputed,
  FinancialHealthGrade,
  FinancialHealthSnapshot,
  Profile,
  RealHourlyWageInput,
  RealHourlyWageResult,
  WorkTimeConversion,
} from "@/types/living-cost.types";
import { clamp } from "@/lib/utils";
import {
  analyzeBudgetRule,
  calculateDailySafeToSpend,
  type AnalyzeBudgetRuleOptions,
} from "./budget";
import { calculateExpenseItemCosts, normalizeToMonthly } from "./frequency";
import { calculateFinancialRunway } from "./runway";

export const WORK_RELATED_ITEM_IDS = [
  "item-transport",
  "item-parking",
  "item-lunch",
] as const;

export const WORK_RELATED_KEYWORDS = [
  "xăng",
  "grab",
  "gửi xe",
  "đi lại",
  "bảo dưỡng",
  "ăn trưa",
  "văn phòng",
] as const;

export function calculateIncome(profile: Profile): number {
  return profile.monthlyIncome + profile.extraIncome;
}

export function estimateWorkRelatedExpenses(
  expenseItems: ExpenseItem[],
): number {
  return expenseItems
    .filter((item) => item.isEnabled)
    .filter((item) => {
      if ((WORK_RELATED_ITEM_IDS as readonly string[]).includes(item.id)) {
        return true;
      }

      const normalizedName = item.name.toLowerCase();
      return WORK_RELATED_KEYWORDS.some((keyword) =>
        normalizedName.includes(keyword),
      );
    })
    .reduce((total, item) => total + normalizeToMonthly(item), 0);
}

export function calculateRealHourlyWage(
  input: RealHourlyWageInput,
): RealHourlyWageResult {
  const monthlyIncome = Math.max(0, input.monthlyIncome);
  const workRelatedExpenses = Math.max(0, input.workRelatedExpenses);
  const workHoursPerDay = Math.max(0, input.workHoursPerDay);
  const commuteHoursPerDay = Math.max(0, input.commuteHoursPerDay);
  const workDaysPerMonth = Math.max(0, input.workDaysPerMonth);

  const dailyWorkHours = workHoursPerDay + commuteHoursPerDay;
  const monthlyWorkHours = dailyWorkHours * workDaysPerMonth;
  const netIncome = monthlyIncome - workRelatedExpenses;
  const realHourlyWage =
    monthlyWorkHours > 0 ? Math.max(0, netIncome) / monthlyWorkHours : 0;

  return {
    monthlyIncome,
    workRelatedExpenses,
    netIncome,
    dailyWorkHours,
    monthlyWorkHours,
    realHourlyWage,
  };
}

export function convertMoneyToWorkTime(
  amount: number,
  realHourlyWage: number,
): WorkTimeConversion {
  if (
    !Number.isFinite(amount) ||
    amount <= 0 ||
    !Number.isFinite(realHourlyWage) ||
    realHourlyWage <= 0
  ) {
    return {
      hours: 0,
      minutes: 0,
      totalMinutes: 0,
      formatted: "0 phút",
    };
  }

  const totalMinutes = Math.round((amount / realHourlyWage) * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  let formatted = "0 phút";
  if (hours > 0 && minutes > 0) {
    formatted = `${hours} giờ ${minutes} phút`;
  } else if (hours > 0) {
    formatted = `${hours} giờ`;
  } else if (minutes > 0) {
    formatted = `${minutes} phút`;
  }

  return {
    hours,
    minutes,
    totalMinutes,
    formatted,
  };
}

export function calculateExpenseItemComputed(
  item: ExpenseItem,
  profile: Profile,
  categoryGroups: CategoryGroup[],
  totalMonthlyExpense: number,
): ExpenseItemComputed {
  const costs = calculateExpenseItemCosts(item);
  const categoryGroup = categoryGroups.find((group) => group.code === item.group);
  const categoryDefinition = CATEGORY_DEFINITIONS[item.group];
  const monthlyIncome = calculateIncome(profile);

  return {
    ...item,
    normalizedMonthlyCost: costs.monthly,
    normalizedDailyCost: costs.daily,
    normalizedYearlyCost: costs.yearly,
    groupName: categoryGroup?.name ?? categoryDefinition.name,
    groupColor: categoryGroup?.color ?? categoryDefinition.color,
    groupIcon: categoryGroup?.icon ?? categoryDefinition.icon,
    percentageOfIncome:
      monthlyIncome > 0 ? (costs.monthly / monthlyIncome) * 100 : 0,
    percentageOfTotalExpense:
      totalMonthlyExpense > 0 ? (costs.monthly / totalMonthlyExpense) * 100 : 0,
    workTime: null,
  };
}

export function calculateCategorySummaries(
  profile: Profile,
  categoryGroups: CategoryGroup[],
  expenseItems: ExpenseItem[],
): CategoryGroupSummary[] {
  const monthlyIncome = calculateIncome(profile);
  const enabledExpenseItems = expenseItems.filter((item) => item.isEnabled);
  const totalMonthlyExpense = enabledExpenseItems.reduce(
    (total, item) => total + normalizeToMonthly(item),
    0,
  );

  return [...categoryGroups]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((categoryGroup) => {
      const groupItems = expenseItems
        .filter((item) => item.group === categoryGroup.code)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((item) =>
          calculateExpenseItemComputed(
            item,
            profile,
            categoryGroups,
            totalMonthlyExpense,
          ),
        );

      const enabledGroupItems = groupItems.filter((item) => item.isEnabled);
      const monthlyTotal = enabledGroupItems.reduce(
        (total, item) => total + item.normalizedMonthlyCost,
        0,
      );

      return {
        groupCode: categoryGroup.code,
        groupName: categoryGroup.name,
        description: categoryGroup.description,
        color: categoryGroup.color,
        icon: categoryGroup.icon,
        sortOrder: categoryGroup.sortOrder,
        monthlyTotal,
        dailyTotal: monthlyTotal / MONTHLY_DAYS,
        yearlyTotal: monthlyTotal * MONTHS_PER_YEAR,
        percentageOfIncome:
          monthlyIncome > 0 ? (monthlyTotal / monthlyIncome) * 100 : 0,
        percentageOfTotalExpense:
          totalMonthlyExpense > 0
            ? (monthlyTotal / totalMonthlyExpense) * 100
            : 0,
        itemCount: groupItems.length,
        enabledItemCount: enabledGroupItems.length,
        items: groupItems,
      };
    });
}

export function calculateSurvivalMonthlyCost(
  expenseItems: ExpenseItem[],
): number {
  return expenseItems
    .filter(
      (item) =>
        item.isEnabled && item.group === "NEEDS" && item.isFixed,
    )
    .reduce((total, item) => total + normalizeToMonthly(item), 0);
}

export function calculateHealthGrade(score: number): FinancialHealthGrade {
  if (score >= 85) return "EXCELLENT";
  if (score >= 70) return "GOOD";
  if (score >= 55) return "FAIR";
  if (score >= 35) return "RISKY";
  return "CRITICAL";
}

export function calculateFinancialHealth(
  profile: Profile,
  expenseItems: ExpenseItem[],
  transactions: DailyTransaction[] = [],
  options: AnalyzeBudgetRuleOptions = {},
): FinancialHealthSnapshot {
  const budgetRuleAnalysis = analyzeBudgetRule(
    profile,
    expenseItems,
    transactions,
    options,
  );
  const monthlyIncome = budgetRuleAnalysis.monthlyIncome;
  const totalPlannedExpense = budgetRuleAnalysis.actual.total;
  const netCashflow = monthlyIncome - totalPlannedExpense;
  const savingsRate =
    monthlyIncome > 0
      ? (budgetRuleAnalysis.actual.savingsDebt / monthlyIncome) * 100
      : 0;
  const dailyBurnRate = totalPlannedExpense / MONTHLY_DAYS;

  const runway = calculateFinancialRunway({
    currentSavings: profile.currentSavings,
    monthlyExpense: totalPlannedExpense,
    survivalMonthlyExpense: calculateSurvivalMonthlyCost(expenseItems),
  });

  const safeToSpend = calculateDailySafeToSpend(
    profile,
    expenseItems,
    transactions,
    options,
  );

  const savingsScore = clamp((savingsRate / 20) * 40, 0, 40);
  const overBudgetPercentage =
    monthlyIncome > 0 && totalPlannedExpense > monthlyIncome
      ? ((totalPlannedExpense - monthlyIncome) / monthlyIncome) * 100
      : 0;
  const budgetScore =
    overBudgetPercentage > 0
      ? clamp(40 - overBudgetPercentage * 2, 0, 40)
      : 40;
  const runwayScore = clamp(
    (runway.standard.totalDays / (6 * MONTHLY_DAYS)) * 20,
    0,
    20,
  );
  const healthScore = Math.round(
    clamp(savingsScore + budgetScore + runwayScore, 0, 100),
  );

  let healthGrade = calculateHealthGrade(healthScore);
  if (
    budgetRuleAnalysis.isOverBudget &&
    (healthGrade === "EXCELLENT" || healthGrade === "GOOD")
  ) {
    healthGrade = "FAIR";
  }

  return {
    monthlyIncome,
    totalPlannedExpense,
    netCashflow,
    savingsRate,
    dailyBurnRate,
    budgetRuleAnalysis,
    safeToSpend,
    runway,
    healthScore,
    healthGrade,
  };
}
