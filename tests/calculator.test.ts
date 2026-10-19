import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  analyzeBudgetRule,
  autoOptimizeLivingCost,
  buildCalendarHeatmap,
  buildSimulationApplyPayload,
  calculateCategorySummaries,
  calculateDailySafeToSpend,
  calculateExpenseItemCosts,
  calculateFinancialHealth,
  calculateFinancialRunway,
  calculateFutureValue,
  calculateLatteFactor,
  calculateMonthlyVariableBudget,
  calculateRealHourlyWage,
  calculateVietnamElectricityBill,
  computeVaultBalance,
  convertMoneyToWorkTime,
  createMonthlyRecords,
  estimateWorkRelatedExpenses,
  getMonthRange,
  getRemainingDays,
  getTodayISO,
  isDateInRange,
  normalizeToDaily,
  normalizeToMonthly,
  normalizeToYearly,
  parseVietnameseExpenses,
  resolveMonthlyLedger,
  simulateWhatIf,
} from "@/lib/calculator";
import { LIFE_EVENT_PRESETS } from "@/constants/life-events";
import { backupPayloadSchema } from "@/lib/validators/backup";
import { createDemoTransactions } from "@/data/demo-transactions";
import {
  MOCK_CATEGORY_GROUPS,
  MOCK_EXPENSE_ITEMS,
  MOCK_PROFILE,
  MOCK_TRANSACTIONS,
} from "@/data/mock-data";

function assertClose(
  actual: number,
  expected: number,
  tolerance = 0.000001,
): void {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `Expected ${actual} to be close to ${expected}`,
  );
}

describe("normalize frequency", () => {
  it("converts DAILY to monthly with 30.44 days", () => {
    assertClose(
      normalizeToMonthly({
        unitPrice: 35_000,
        quantityPerPeriod: 1,
        frequency: "DAILY",
      }),
      1_065_400,
    );
  });

  it("converts WEEKLY to monthly with 4.345 weeks", () => {
    assertClose(
      normalizeToMonthly({
        unitPrice: 300_000,
        quantityPerPeriod: 2,
        frequency: "WEEKLY",
      }),
      2_607_000,
    );
  });

  it("keeps MONTHLY unchanged", () => {
    assertClose(
      normalizeToMonthly({
        unitPrice: 4_500_000,
        quantityPerPeriod: 1,
        frequency: "MONTHLY",
      }),
      4_500_000,
    );
  });

  it("converts YEARLY to a monthly sinking fund", () => {
    assertClose(
      normalizeToMonthly({
        unitPrice: 12_000_000,
        quantityPerPeriod: 1,
        frequency: "YEARLY",
      }),
      1_000_000,
    );
  });

  it("normalizes to daily and yearly consistently", () => {
    const item = {
      unitPrice: 4_500_000,
      quantityPerPeriod: 1,
      frequency: "MONTHLY" as const,
    };
    assertClose(normalizeToDaily(item), 147_831.800_262_812_1);
    assertClose(normalizeToYearly(item), 54_000_000);

    const costs = calculateExpenseItemCosts(item);
    assertClose(costs.monthly, 4_500_000);
    assertClose(costs.daily, normalizeToDaily(item));
    assertClose(costs.yearly, 54_000_000);
  });

  it("rejects negative amounts", () => {
    assert.throws(
      () =>
        normalizeToMonthly({
          unitPrice: -1,
          quantityPerPeriod: 1,
          frequency: "MONTHLY",
        }),
      RangeError,
    );
  });
});

describe("Vietnam electricity bill", () => {
  it("calculates 250 kWh using six tiers plus 8% VAT", () => {
    const bill = calculateVietnamElectricityBill(250);

    assertClose(bill.subtotal, 589_600);
    assertClose(bill.vatAmount, 47_168);
    assertClose(bill.total, 636_768);
    assertClose(bill.averagePricePerKwh, 2_547.072);
    assert.equal(
      bill.tiers.reduce((total, tier) => total + tier.kwh, 0),
      250,
    );
  });

  it("calculates 400 kWh correctly", () => {
    const bill = calculateVietnamElectricityBill(400);

    assertClose(bill.subtotal, 1_074_500);
    assertClose(bill.vatAmount, 85_960);
    assertClose(bill.total, 1_160_460);
  });

  it("calculates the sixth tier for 500 kWh", () => {
    const bill = calculateVietnamElectricityBill(500);

    assertClose(bill.subtotal, 1_420_500);
    assertClose(bill.vatAmount, 113_640);
    assertClose(bill.total, 1_534_140);
  });

  it("accounts for fractional consumption in the first tier", () => {
    const bill = calculateVietnamElectricityBill(0.5);

    assertClose(bill.subtotal, 992);
    assertClose(bill.vatAmount, 79.36);
    assertClose(bill.total, 1_071.36);
  });

  it("returns zero for zero consumption", () => {
    const bill = calculateVietnamElectricityBill(0);

    assert.equal(bill.subtotal, 0);
    assert.equal(bill.vatAmount, 0);
    assert.equal(bill.total, 0);
    assert.equal(bill.averagePricePerKwh, 0);
  });
});

describe("50/30/20 budget analysis", () => {
  const now = new Date(2026, 9, 19);

  it("computes actual totals, percentages and variances", () => {
    const result = analyzeBudgetRule(
      MOCK_PROFILE,
      MOCK_EXPENSE_ITEMS,
      [],
      { now },
    );

    assertClose(result.actual.needs, 11_502_200);
    assertClose(result.actual.wants, 6_430_000);
    assertClose(result.actual.savingsDebt, 3_500_000);
    assertClose(result.actual.total, 21_432_200);

    assertClose(result.targetAmounts.needs, 10_000_000);
    assertClose(result.targetAmounts.wants, 6_000_000);
    assertClose(result.targetAmounts.savingsDebt, 4_000_000);
    assertClose(result.targetAmounts.total, 20_000_000);

    assertClose(result.actualPercentages.needs, 57.511);
    assertClose(result.actualPercentages.wants, 32.15);
    assertClose(result.actualPercentages.savingsDebt, 17.5);

    assert.equal(result.isNeedsOver, true);
    assert.equal(result.isWantsOver, true);
    assert.equal(result.isSavingsUnder, true);
    assert.equal(result.isOverBudget, true);
    assert.equal(result.status, "CRITICAL");
    assertClose(result.remainingAmount, -1_432_200);
    assert.equal(result.remainingDays, 13);
  });

  it("calculates daily safe-to-spend without double-counting savings", () => {
    const safe = calculateDailySafeToSpend(
      MOCK_PROFILE,
      MOCK_EXPENSE_ITEMS,
      [],
      { now },
    );

    assertClose(safe.remainingBudget, 9_657_000);
    assert.equal(safe.remainingDays, 13);
    assertClose(safe.amountPerDay, 742_846.153_846_153_9);
    assert.equal(safe.spentToday, 0);
    assert.equal(safe.status, "NO_SPEND");
  });

  it("detects over-spending today", () => {
    const safe = calculateDailySafeToSpend(
      MOCK_PROFILE,
      MOCK_EXPENSE_ITEMS,
      [
        {
          id: "tx-today",
          profileId: MOCK_PROFILE.id,
          expenseItemId: "item-coffee",
          title: "Cà phê sáng",
          amount: 1_000_000,
          date: "2026-10-19",
          paymentMethod: "E_WALLET",
          paymentSource: "CASH",
          categoryCode: "FOOD",
          note: null,
          source: "MANUAL",
          createdAt: "2026-10-19T08:00:00.000Z",
        },
      ],
      { now },
    );

    assertClose(safe.spentToday, 1_000_000);
    assert.equal(safe.status, "OVER_SPENT");
    assert.equal(safe.remainingToday, 0);
  });

  it("returns category summaries from the same source data", () => {
    const summaries = calculateCategorySummaries(
      MOCK_PROFILE,
      MOCK_CATEGORY_GROUPS,
      MOCK_EXPENSE_ITEMS,
    );

    assert.equal(summaries.length, 3);
    assertClose(summaries[0].monthlyTotal, 11_502_200);
    assertClose(summaries[1].monthlyTotal, 6_430_000);
    assertClose(summaries[2].monthlyTotal, 3_500_000);
    assert.equal(summaries[0].enabledItemCount, 11);
    assert.equal(summaries[0].items.length, 11);
  });

  it("excludes disabled expense items from every total", () => {
    const items = MOCK_EXPENSE_ITEMS.map((item) =>
      item.id === "item-coffee" ? { ...item, isEnabled: false } : item,
    );
    const result = analyzeBudgetRule(MOCK_PROFILE, items, [], { now });

    assertClose(result.actual.wants, 5_755_000);
    assertClose(result.actual.total, 20_757_200);
  });

  it("handles empty expense lists and zero income gracefully", () => {
    const zeroProfile = {
      ...MOCK_PROFILE,
      monthlyIncome: 0,
      extraIncome: 0,
      savingsGoalAmount: 0,
    };
    const result = analyzeBudgetRule(zeroProfile, [], [], { now });

    assert.equal(result.actual.total, 0);
    assert.equal(result.actualPercentages.needs, 0);
    assert.equal(result.targetAmounts.total, 0);
    assert.equal(result.remainingAmount, 0);
    assert.equal(result.status, "HEALTHY");

    const safe = calculateDailySafeToSpend(zeroProfile, [], [], { now });
    assert.equal(safe.remainingBudget, 0);
    assert.equal(safe.amountPerDay, 0);
    assert.equal(safe.status, "NO_SPEND");
  });
});

describe("date boundaries", () => {
  it("handles the leap day in February 2024", () => {
    const now = new Date(2024, 1, 29);
    assert.deepEqual(getMonthRange(now), {
      startDate: "2024-02-01",
      endDate: "2024-02-29",
    });
    assert.equal(getRemainingDays(now), 1);
    assert.equal(getRemainingDays(now, false), 0);
    assert.equal(getTodayISO(now), "2024-02-29");
    assert.equal(
      isDateInRange("2024-02-29", getMonthRange(now)),
      true,
    );
  });

  it("handles the last day of the year", () => {
    const now = new Date(2024, 11, 31);
    assert.deepEqual(getMonthRange(now), {
      startDate: "2024-12-01",
      endDate: "2024-12-31",
    });
    assert.equal(getRemainingDays(now), 1);
    assert.equal(getRemainingDays(now, false), 0);
  });
});

describe("latte factor and compound interest", () => {
  it("uses the annuity-due compound interest formula", () => {
    const monthlySaving = 750_000;
    const annualRate = 8;
    const monthlyRate = annualRate / 100 / 12;
    const months = 12;
    const expected =
      monthlySaving *
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
      (1 + monthlyRate);

    const result = calculateLatteFactor({
      itemName: "Cà phê / Trà sữa",
      monthlySaving,
      annualInterestRate: annualRate,
      projectionYears: [1, 5, 10],
    });

    assertClose(result.oneYear, expected);
    assert.equal(result.projections.length, 3);
    assert.ok(result.fiveYears > result.oneYear);
    assert.ok(result.tenYears > result.fiveYears);
    assertClose(result.projections[0].monthlyRate, 0.6666666666666666);
    assert.ok(result.projections[0].interestEarned > 0);
  });

  it("handles a zero interest rate", () => {
    assertClose(calculateFutureValue(1_000_000, 0, 12), 12_000_000);
  });
});

describe("automatic cost optimization", () => {
  it("reduces low-priority flexible items until the target is met", () => {
    const result = autoOptimizeLivingCost(MOCK_EXPENSE_ITEMS, {
      targetMonthlyExpense: 18_000_000,
    });

    assert.equal(result.isTargetAchieved, true);
    assert.ok(result.achievedMonthlyExpense <= 18_000_000);
    assert.ok(result.totalMonthlySavings >= 3_432_200);
    assert.ok(result.suggestions.length > 0);

    const suggestedIds = new Set(
      result.suggestions.map((suggestion) => suggestion.expenseItemId),
    );
    assert.equal(suggestedIds.has("item-travel"), true);
    assert.equal(suggestedIds.has("item-coffee"), true);
    assert.equal(suggestedIds.has("item-dining-out"), true);
    assert.equal(suggestedIds.has("item-netflix"), false);
    assert.equal(suggestedIds.has("item-gym"), false);
    assert.equal(suggestedIds.has("item-rent"), false);

    for (const suggestion of result.suggestions) {
      const item = MOCK_EXPENSE_ITEMS.find(
        (expenseItem) => expenseItem.id === suggestion.expenseItemId,
      );
      assert.ok(item);
      assert.equal(item.isFixed, false);
      assert.ok(suggestion.suggestedQuantity < suggestion.currentQuantity);
      assert.ok(suggestion.monthlySavings > 0);
    }
  });

  it("does nothing when spending is already within target", () => {
    const result = autoOptimizeLivingCost(MOCK_EXPENSE_ITEMS, {
      targetMonthlyExpense: 25_000_000,
    });

    assert.equal(result.isTargetAchieved, true);
    assert.equal(result.suggestions.length, 0);
    assertClose(result.totalMonthlySavings, 0);
    assertClose(result.achievedMonthlyExpense, result.currentMonthlyExpense);
  });

  it("does not force reductions when the reduction rate is zero", () => {
    const result = autoOptimizeLivingCost(MOCK_EXPENSE_ITEMS, {
      targetMonthlyExpense: 18_000_000,
      maxReductionRate: 0,
    });

    assert.equal(result.isTargetAchieved, false);
    assert.equal(result.suggestions.length, 0);
    assertClose(result.totalMonthlySavings, 0);
    assertClose(result.achievedMonthlyExpense, result.currentMonthlyExpense);
  });
});

describe("real hourly wage and life-energy conversion", () => {
  it("calculates the real hourly wage including commute time", () => {
    const result = calculateRealHourlyWage({
      monthlyIncome: 20_000_000,
      workRelatedExpenses: 2_000_000,
      workHoursPerDay: 8,
      workDaysPerMonth: 22,
      commuteHoursPerDay: 1,
    });

    assert.equal(result.dailyWorkHours, 9);
    assert.equal(result.monthlyWorkHours, 198);
    assert.equal(result.netIncome, 18_000_000);
    assertClose(result.realHourlyWage, 18_000_000 / 198);
  });

  it("estimates work-related expenses from enabled budget items", () => {
    assertClose(
      estimateWorkRelatedExpenses(MOCK_EXPENSE_ITEMS),
      2_260_000,
    );
  });

  it("converts money into hours and minutes", () => {
    assert.equal(
      convertMoneyToWorkTime(150_000, 100_000).formatted,
      "1 giờ 30 phút",
    );
    assert.equal(
      convertMoneyToWorkTime(500_000, 100_000).formatted,
      "5 giờ",
    );
    assert.equal(convertMoneyToWorkTime(0, 100_000).formatted, "0 phút");
    assert.equal(convertMoneyToWorkTime(150_000, 0).formatted, "0 phút");
  });
});

describe("Vietnamese smart text parser", () => {
  it("parses multiple expenses separated by commas", () => {
    const result = parseVietnameseExpenses(
      "Sáng ăn bún bò 45k, chiều cafe 35k, đổ xăng 80k",
    );

    assert.equal(result.drafts.length, 3);
    assert.deepEqual(
      result.drafts.map((draft) => draft.amount),
      [45_000, 35_000, 80_000],
    );
    assert.deepEqual(
      result.drafts.map((draft) => draft.category),
      ["Ăn uống", "Giải trí & Hưởng thụ", "Đi lại"],
    );
    assert.equal(result.totalAmount, 160_000);
  });

  it("supports Vietnamese amount shorthand and thousands separators", () => {
    assert.equal(
      parseVietnameseExpenses("cafe 1,5tr").drafts[0]?.amount,
      1_500_000,
    );
    assert.equal(
      parseVietnameseExpenses("2 củ").drafts[0]?.amount,
      2_000_000,
    );
    assert.equal(
      parseVietnameseExpenses("đổ xăng 45.000đ").drafts[0]?.amount,
      45_000,
    );
    assert.equal(
      parseVietnameseExpenses("45 ngàn").drafts[0]?.amount,
      45_000,
    );
  });

  it("handles the hundreds suffix and bill keywords", () => {
    const result = parseVietnameseExpenses("Đóng tiền điện 850trăm");

    assert.equal(result.drafts[0]?.amount, 85_000_000);
    assert.equal(result.drafts[0]?.category, "Hóa đơn & Nhà ở");
  });

  it("splits a shared meal between people", () => {
    const result = parseVietnameseExpenses(
      "Ăn lẩu cuối tuần 450000 chia 3 người",
    );

    assert.equal(result.drafts[0]?.amount, 150_000);
    assert.equal(result.drafts[0]?.title, "Ăn lẩu cuối tuần");
    assert.equal(result.drafts[0]?.category, "Ăn uống");
  });

  it("keeps segments without an amount in unparsedSegments", () => {
    const result = parseVietnameseExpenses("mua gì đó, cafe 35k");

    assert.equal(result.drafts.length, 1);
    assert.deepEqual(result.unparsedSegments, ["mua gì đó"]);
  });

  it("enforces the maximum item count", () => {
    const result = parseVietnameseExpenses("ăn sáng 45k, cafe 35k, xăng 80k", {
      maxItems: 1,
    });

    assert.equal(result.drafts.length, 1);
    assert.equal(result.unparsedSegments.length, 2);
  });
});

describe("spending calendar heatmap", () => {
  const now = new Date(2026, 9, 19);
  const transactions = [
    {
      id: "tx-1",
      profileId: MOCK_PROFILE.id,
      expenseItemId: "item-coffee",
      title: "Cà phê",
      amount: 100_000,
      date: "2026-10-02",
      paymentMethod: "E_WALLET" as const,
      note: null,
      paymentSource: "CASH" as const,
      categoryCode: "FOOD" as const,
      source: "MANUAL" as const,
      createdAt: "2026-10-02T08:00:00.000Z",
    },
    {
      id: "tx-2",
      profileId: MOCK_PROFILE.id,
      expenseItemId: "item-dining-out",
      title: "Ăn tối",
      amount: 400_000,
      date: "2026-10-03",
      paymentMethod: "E_WALLET" as const,
      note: null,
      paymentSource: "CASH" as const,
      categoryCode: "FOOD" as const,
      source: "MANUAL" as const,
      createdAt: "2026-10-03T20:00:00.000Z",
    },
    {
      id: "tx-3",
      profileId: MOCK_PROFILE.id,
      expenseItemId: "item-coffee",
      title: "Cà phê",
      amount: 50_000,
      date: "2026-10-19",
      paymentMethod: "E_WALLET" as const,
      note: null,
      paymentSource: "CASH" as const,
      categoryCode: "FOOD" as const,
      source: "MANUAL" as const,
      createdAt: "2026-10-19T08:00:00.000Z",
    },
  ];

  it("classifies no-spend, within-budget, over-budget and future days", () => {
    const summary = buildCalendarHeatmap(
      MOCK_PROFILE,
      MOCK_EXPENSE_ITEMS,
      transactions,
      { now },
    );
    const byDate = new Map(summary.days.map((day) => [day.date, day]));

    assert.equal(summary.days.length, 31);
    assert.equal(byDate.get("2026-10-01")?.status, "NO_SPEND");
    assert.equal(byDate.get("2026-10-02")?.status, "WITHIN_BUDGET");
    assert.equal(byDate.get("2026-10-03")?.status, "OVER_BUDGET");
    assert.equal(byDate.get("2026-10-20")?.status, "FUTURE");
    assert.equal(byDate.get("2026-10-19")?.isToday, true);
  });

  it("counts streaks, no-spend days and averages", () => {
    const summary = buildCalendarHeatmap(
      MOCK_PROFILE,
      MOCK_EXPENSE_ITEMS,
      transactions,
      { now },
    );

    assert.equal(summary.noSpendDays, 16);
    assert.equal(summary.withinBudgetDays, 2);
    assert.equal(summary.overBudgetDays, 1);
    assert.equal(summary.totalSpent, 550_000);
    assert.equal(summary.savingStreak.current, 16);
    assert.equal(summary.savingStreak.longest, 16);
    assertClose(summary.averagePerDay, 550_000 / 19);
  });

  it("exposes the monthly variable budget used as the daily reference", () => {
    assertClose(
      calculateMonthlyVariableBudget(MOCK_PROFILE, MOCK_EXPENSE_ITEMS),
      9_657_000,
    );
  });
});

describe("what-if simulation", () => {
  const baseInput = {
    profile: MOCK_PROFILE,
    expenseItems: MOCK_EXPENSE_ITEMS,
    customEvents: [],
    presets: LIFE_EVENT_PRESETS,
  };
  const baseline = simulateWhatIf({
    ...baseInput,
    enabledPresetIds: [],
  });

  it("builds a baseline snapshot from the current budget", () => {
    assertClose(baseline.baseline.monthlyIncome, 20_000_000);
    assertClose(baseline.baseline.monthlyExpense, 21_432_200);
    assertClose(baseline.baseline.netCashflow, -1_432_200);
    assertClose(baseline.baseline.monthlySavings, 3_500_000);
    assert.equal(
      baseline.yearlyProjection[0].baseline,
      MOCK_PROFILE.currentSavings,
    );
  });

  it("models a 20% raise plus 10% lifestyle creep", () => {
    const result = simulateWhatIf({
      ...baseInput,
      enabledPresetIds: ["raise-salary"],
    });

    assertClose(result.adjustment.incomeDelta, 4_000_000);
    assertClose(result.adjustment.lifestyleCreepAmount, 643_000);
    assertClose(result.adjustment.expenseDelta, 643_000);
    assertClose(result.simulated.monthlyIncome, 24_000_000);
    assertClose(result.simulated.netCashflow, 1_924_800);
    assert.ok(
      result.yearlyProjection.at(-1)!.simulated >
        baseline.yearlyProjection.at(-1)!.baseline,
    );
  });

  it("draws down savings during a 12-month installment scenario", () => {
    const result = simulateWhatIf({
      ...baseInput,
      enabledPresetIds: ["installment-purchase"],
    });

    assertClose(result.adjustment.expenseDelta, 2_500_000);
    assert.ok(
      result.yearlyProjection.at(-1)!.simulated <
        baseline.yearlyProjection.at(-1)!.baseline,
    );
    assert.ok(result.yearlyProjection[1].simulated < result.yearlyProjection[2].simulated);
  });

  it("turns active events into editable expense drafts", () => {
    const result = simulateWhatIf({
      ...baseInput,
      enabledPresetIds: ["installment-purchase"],
    });
    const payload = buildSimulationApplyPayload({
      result,
      enabledPresetIds: ["installment-purchase"],
      customEvents: [],
      presets: LIFE_EVENT_PRESETS,
    });

    assert.equal(payload.incomeDelta, 0);
    assert.equal(payload.newExpenseItems?.length, 1);
    assert.equal(payload.newExpenseItems?.[0].unitPrice, 2_500_000);
    assert.equal(payload.newExpenseItems?.[0].group, "SAVINGS_DEBT");
  });

  it("applies custom events with a limited duration", () => {
    const result = simulateWhatIf({
      ...baseInput,
      enabledPresetIds: [],
      customEvents: [
        {
          id: "custom-1",
          label: "Học tiếng Anh",
          monthlyIncomeDelta: 0,
          monthlyExpenseDelta: 1_000_000,
          durationMonths: 6,
        },
      ],
    });

    assertClose(result.adjustment.expenseDelta, 1_000_000);
    assert.deepEqual(result.adjustment.appliedEventIds, ["custom-1"]);
    assert.ok(
      result.yearlyProjection[1].simulated <
        result.yearlyProjection[2].simulated,
    );
  });
});

describe("demo data and backup validation", () => {
  it("generates deterministic demo transactions only up to today", () => {
    const now = new Date(2026, 9, 19);
    const transactions = createDemoTransactions({
      profileId: MOCK_PROFILE.id,
      now,
    });

    assert.ok(transactions.length > 0);
    assert.ok(
      transactions.every(
        (transaction) =>
          transaction.date >= "2026-10-01" &&
          transaction.date <= "2026-10-19",
      ),
    );
    assert.ok(
      transactions.every((transaction) => transaction.source === "DEMO"),
    );
    assert.ok(
      new Set(transactions.map((transaction) => transaction.date)).size < 19,
    );
  });

  it("validates a complete backup payload with Zod", () => {
    const backup = {
      metadata: {
        version: 1,
        schemaVersion: 1,
        appVersion: "0.1.0",
        exportedAt: "2026-10-19T00:00:00.000Z",
        currency: "VND" as const,
      },
      profile: MOCK_PROFILE,
      categoryGroups: MOCK_CATEGORY_GROUPS,
      expenseItems: MOCK_EXPENSE_ITEMS,
      transactions: MOCK_TRANSACTIONS,
    };

    assert.equal(backupPayloadSchema.safeParse(backup).success, true);
    assert.equal(
      backupPayloadSchema.safeParse({ ...backup, profile: {} }).success,
      false,
    );
  });
});

describe("financial runway and health", () => {
  it("compares standard and survival runway", () => {
    const result = calculateFinancialRunway({
      currentSavings: 50_000_000,
      monthlyExpense: 20_000_000,
      survivalMonthlyExpense: 5_000_000,
    });

    assert.equal(result.status, "DANGER");
    assert.equal(result.standard.months, 2);
    assert.equal(result.standard.days, 15);
    assert.equal(result.survival.months, 10);
    assert.equal(result.safeMonthsThreshold, 6);
    assert.equal(result.warningMonthsThreshold, 3);
  });

  it("handles zero monthly expenses without dividing by zero", () => {
    const result = calculateFinancialRunway({
      currentSavings: 50_000_000,
      monthlyExpense: 0,
      survivalMonthlyExpense: 0,
    });

    assert.equal(result.status, "SAFE");
    assert.equal(result.standard.months, 0);
    assert.equal(result.survival.months, 0);
  });

  it("builds a complete financial health snapshot", () => {
    const health = calculateFinancialHealth(
      MOCK_PROFILE,
      MOCK_EXPENSE_ITEMS,
      [],
      { now: new Date(2026, 9, 19) },
    );

    assertClose(health.monthlyIncome, 20_000_000);
    assertClose(health.totalPlannedExpense, 21_432_200);
    assertClose(health.netCashflow, -1_432_200);
    assertClose(health.savingsRate, 17.5);
    assert.equal(health.budgetRuleAnalysis.status, "CRITICAL");
    assert.equal(health.runway.status, "DANGER");
    assert.equal(health.healthGrade, "FAIR");
    assert.equal(health.healthScore, 68);
  });
});

describe("monthly savings ledger", () => {
  const now = new Date(2026, 9, 19);

  it("creates 12 months with the current month in auto mode", () => {
    const records = createMonthlyRecords(2026, 20_000_000, { now });

    assert.equal(records.length, 12);
    assert.equal(records[0].month, "2026-01");
    assert.equal(records[0].mode, "MANUAL");
    assert.equal(records[9].month, "2026-10");
    assert.equal(records[9].mode, "AUTO");
    assert.equal(records[9].income, 20_000_000);
    assert.equal(records[11].mode, "MANUAL");
  });

  it("adds recorded manual months to the vault and keeps auto net live", () => {
    const records = createMonthlyRecords(2026, 20_000_000, { now });
    records[0].manualNetBalance = 4_000_000;
    records[0].note = "Thưởng Tết";
    records[1].manualNetBalance = -2_500_000;
    records[1].note = "Sửa xe";

    const ledger = resolveMonthlyLedger({
      initialSavingsFund: 50_000_000,
      records,
      transactions: [
        {
          id: "tx-oct",
          profileId: MOCK_PROFILE.id,
          expenseItemId: null,
          title: "Ăn trưa",
          amount: 1_000_000,
          date: "2026-10-19",
          paymentMethod: "CASH",
          paymentSource: "CASH",
          categoryCode: "FOOD",
          note: null,
          source: "MANUAL",
          createdAt: "2026-10-19T08:00:00.000Z",
        },
      ],
    });

    assert.equal(ledger.totalDelta, 1_500_000);
    assert.equal(ledger.currentVault, 51_500_000);
    assert.equal(ledger.records[0].cumulativeVault, 54_000_000);
    assert.equal(ledger.records[1].cumulativeVault, 51_500_000);
    assert.equal(ledger.records[9].totalSpent, 1_000_000);
    assert.equal(ledger.records[9].netBalance, 19_000_000);
    assert.equal(ledger.records[9].contributedNet, 0);
    assert.equal(ledger.records[9].cumulativeVault, 51_500_000);
    assert.equal(ledger.positiveMonths, 1);
    assert.equal(ledger.negativeMonths, 1);
    assert.equal(computeVaultBalance(50_000_000, records), 51_500_000);
  });

  it("includes a settled month snapshot in the vault", () => {
    const records = createMonthlyRecords(2026, 20_000_000, { now });
    records[9].mode = "MANUAL";
    records[9].manualNetBalance = 5_000_000;
    records[9].isSettled = true;

    const ledger = resolveMonthlyLedger({
      initialSavingsFund: 10_000_000,
      records,
    });

    assert.equal(ledger.currentVault, 15_000_000);
    assert.equal(ledger.settledMonths, 1);
  });
});

