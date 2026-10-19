import { clamp } from "@/lib/utils";
import type {
  CalendarDay,
  CalendarDayStatus,
  CalendarHeatmapSummary,
  DailyTransaction,
  ExpenseItem,
  Profile,
} from "@/types/living-cost.types";
import { calculateMonthlyVariableBudget } from "./budget";
import { getTodayISO, toLocalISODate } from "./date";

export interface CalendarHeatmapOptions {
  now?: Date;
}

/**
 * Builds a month-by-month spending heatmap for the current calendar month.
 *
 * The daily reference budget is the monthly variable budget divided by the
 * number of days in the month. This keeps the colour scale stable while the
 * month is in progress and makes historical days comparable.
 */
export function buildCalendarHeatmap(
  profile: Profile,
  expenseItems: ExpenseItem[],
  transactions: DailyTransaction[] = [],
  options: CalendarHeatmapOptions = {},
): CalendarHeatmapSummary {
  const now = options.now ?? new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = getTodayISO(now);

  const monthlyVariableBudget = calculateMonthlyVariableBudget(
    profile,
    expenseItems,
  );
  const dailySafeToSpend = daysInMonth > 0
    ? monthlyVariableBudget / daysInMonth
    : 0;

  const spentByDate = new Map<string, { amount: number; count: number }>();
  for (const transaction of transactions) {
    const current = spentByDate.get(transaction.date) ?? {
      amount: 0,
      count: 0,
    };
    spentByDate.set(transaction.date, {
      amount: current.amount + transaction.amount,
      count: current.count + 1,
    });
  }

  const days: CalendarDay[] = [];
  let monthTotal = 0;

  for (let dayOfMonth = 1; dayOfMonth <= daysInMonth; dayOfMonth += 1) {
    const date = new Date(year, month, dayOfMonth, 12, 0, 0, 0);
    const isoDate = toLocalISODate(date);
    const spent = spentByDate.get(isoDate) ?? { amount: 0, count: 0 };
    const isFuture = isoDate > today;
    const isToday = isoDate === today;

    let status: CalendarDayStatus;
    if (isFuture) {
      status = "FUTURE";
    } else if (spent.amount === 0) {
      status = "NO_SPEND";
    } else if (spent.amount <= dailySafeToSpend) {
      status = "WITHIN_BUDGET";
    } else {
      status = "OVER_BUDGET";
    }

    const intensity = isFuture || dailySafeToSpend <= 0
      ? 0
      : clamp(spent.amount / dailySafeToSpend, 0, 1);

    monthTotal += spent.amount;

    days.push({
      date: isoDate,
      dayOfMonth,
      totalSpent: spent.amount,
      transactionCount: spent.count,
      safeToSpend: dailySafeToSpend,
      status,
      intensity,
      isToday,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
    });
  }

  const elapsedDays = days.filter((day) => day.status !== "FUTURE");
  const noSpendDays = elapsedDays.filter(
    (day) => day.status === "NO_SPEND",
  ).length;
  const withinBudgetDays = elapsedDays.filter(
    (day) => day.status === "WITHIN_BUDGET",
  ).length;
  const overBudgetDays = elapsedDays.filter(
    (day) => day.status === "OVER_BUDGET",
  ).length;

  let longest = 0;
  let running = 0;
  for (const day of elapsedDays) {
    if (day.status === "OVER_BUDGET") {
      running = 0;
    } else {
      running += 1;
      longest = Math.max(longest, running);
    }
  }

  let current = 0;
  let lastSafeDate: string | null = null;
  for (let index = elapsedDays.length - 1; index >= 0; index -= 1) {
    const day = elapsedDays[index];
    if (day.status === "OVER_BUDGET") break;
    current += 1;
    lastSafeDate = day.date;
  }

  return {
    month: month + 1,
    year,
    days,
    noSpendDays,
    withinBudgetDays,
    overBudgetDays,
    totalSpent: monthTotal,
    averagePerDay: elapsedDays.length > 0
      ? monthTotal / elapsedDays.length
      : 0,
    savingStreak: {
      current,
      longest,
      lastSafeDate,
    },
  };
}
