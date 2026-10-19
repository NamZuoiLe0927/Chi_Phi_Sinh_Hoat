"use client";

import { useEffect, useMemo } from "react";
import { useLivingCostStore } from "@/store/useLivingCostStore";
import {
  autoOptimizeLivingCost,
  buildCalendarHeatmap,
  calculateCategorySummaries,
  calculateCompoundInterest,
  calculateFinancialHealth,
  calculateMonthlyVariableBudget,
  calculateRealHourlyWage,
  calculateVietnamElectricityBill,
  estimateWorkRelatedExpenses,
  resolveMonthlyLedger,
  sumVariableTransactions,
} from "@/lib/calculator";
import { getMonthRange } from "@/lib/calculator/date";
import { buildBudgetRuleComparison, buildCategoryDistribution } from "@/lib/dashboard";
import { clamp } from "@/lib/utils";
import type {
  BudgetRuleComparisonDatum,
  CategoryDistributionDatum,
  ExpenseItem,
  SavingsProjectionDatum,
} from "@/types/living-cost.types";

export const ELECTRICITY_ITEM_ID = "item-electricity";

export function applyTieredElectricityPricing(
  expenseItems: ExpenseItem[],
): ExpenseItem[] {
  return expenseItems.map((item) => {
    if (
      item.id !== ELECTRICITY_ITEM_ID ||
      item.frequency !== "MONTHLY" ||
      item.quantityPerPeriod <= 0
    ) {
      return item;
    }

    const bill = calculateVietnamElectricityBill(item.quantityPerPeriod);
    return {
      ...item,
      unitPrice: bill.total / item.quantityPerPeriod,
    };
  });
}

export function useDashboardData() {
  const profile = useLivingCostStore((state) => state.profile);
  const categoryGroups = useLivingCostStore((state) => state.categoryGroups);
  const rawExpenseItems = useLivingCostStore((state) => state.expenseItems);
  const transactions = useLivingCostStore((state) => state.transactions);
  const initialSavingsFund = useLivingCostStore(
    (state) => state.initialSavingsFund,
  );
  const monthlyRecords = useLivingCostStore((state) => state.monthlyRecords);
  const updateProfile = useLivingCostStore((state) => state.updateProfile);
  const simulationExpenseDelta = useLivingCostStore(
    (state) => state.simulationExpenseDelta,
  );

  const effectiveExpenseItems = useMemo(
    () => applyTieredElectricityPricing(rawExpenseItems),
    [rawExpenseItems],
  );

  const budgetItems = useMemo<ExpenseItem[]>(() => {
    if (simulationExpenseDelta <= 0) return effectiveExpenseItems;

    const simulationItem: ExpenseItem = {
      id: "__simulation-expense-delta__",
      profileId: profile.id,
      name: "Chi phí kịch bản tạm thời",
      group: "NEEDS",
      icon: "CircleDollarSign",
      color: "#f59e0b",
      frequency: "MONTHLY",
      unitPrice: simulationExpenseDelta,
      quantityPerPeriod: 1,
      isFixed: true,
      isEnabled: true,
      priority: 2,
      note: "Khoản chi tạm thời đang được áp dụng từ What-If Simulator",
      sortOrder: 999,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };

    return [...effectiveExpenseItems, simulationItem];
  }, [effectiveExpenseItems, profile, simulationExpenseDelta]);

  const ledger = useMemo(
    () =>
      resolveMonthlyLedger({
        initialSavingsFund,
        records: monthlyRecords,
        transactions,
      }),
    [initialSavingsFund, monthlyRecords, transactions],
  );

  const savingsVault = Math.max(0, Math.round(ledger.currentVault));

  const healthProfile = useMemo(
    () => ({ ...profile, currentSavings: savingsVault }),
    [profile, savingsVault],
  );

  useEffect(() => {
    if (Math.abs(profile.currentSavings - savingsVault) < 1) return;
    updateProfile({ currentSavings: savingsVault });
  }, [profile.currentSavings, savingsVault, updateProfile]);

  const financialHealth = useMemo(
    () => calculateFinancialHealth(healthProfile, budgetItems, transactions),
    [healthProfile, budgetItems, transactions],
  );

  const categorySummaries = useMemo(
    () => calculateCategorySummaries(profile, categoryGroups, budgetItems),
    [profile, categoryGroups, budgetItems],
  );

  const distribution = useMemo<CategoryDistributionDatum[]>(
    () => buildCategoryDistribution(budgetItems),
    [budgetItems],
  );

  const budgetComparison = useMemo<BudgetRuleComparisonDatum[]>(
    () => buildBudgetRuleComparison(financialHealth.budgetRuleAnalysis),
    [financialHealth.budgetRuleAnalysis],
  );

  const workTime = useMemo(
    () =>
      calculateRealHourlyWage({
        monthlyIncome: financialHealth.monthlyIncome,
        workRelatedExpenses: estimateWorkRelatedExpenses(budgetItems),
        workHoursPerDay: profile.workHoursPerDay,
        workDaysPerMonth: profile.workDaysPerMonth,
        commuteHoursPerDay: profile.commuteHoursPerDay,
      }),
    [budgetItems, financialHealth.monthlyIncome, profile],
  );

  const calendar = useMemo(
    () => buildCalendarHeatmap(profile, budgetItems, transactions),
    [profile, budgetItems, transactions],
  );

  const spendingProgress = useMemo(() => {
    const budget = calculateMonthlyVariableBudget(profile, budgetItems);
    const spent = sumVariableTransactions(
      transactions,
      budgetItems,
      getMonthRange(),
    );

    return {
      budget,
      spent,
      percentage: budget > 0 ? clamp((spent / budget) * 100, 0, 100) : 0,
    };
  }, [profile, budgetItems, transactions]);

  const savingsProjection = useMemo(
    () =>
      calculateCompoundInterest({
        monthlyContribution: Math.max(0, financialHealth.netCashflow),
        annualInterestRate: 8,
        years: 5,
        initialAmount: 0,
      }),
    [financialHealth.netCashflow],
  );

  const savingsData = useMemo<SavingsProjectionDatum[]>(
    () =>
      savingsProjection.projection.map((point) => ({
        year: point.year,
        contributed: point.contributed,
        balance: point.balance,
        interest: point.interest,
        simulatedBalance: null,
      })),
    [savingsProjection],
  );

  const optimization = useMemo(
    () =>
      autoOptimizeLivingCost(budgetItems, {
        targetMonthlyExpense: Math.max(
          0,
          financialHealth.monthlyIncome - profile.savingsGoalAmount,
        ),
        strategy: "WANTS_FIRST",
        minPriority: 3,
        maxReductionRate: 50,
        preserveFixedItems: true,
        preserveSavingsItems: true,
      }),
    [budgetItems, financialHealth.monthlyIncome, profile.savingsGoalAmount],
  );

  return {
    profile,
    categoryGroups,
    rawExpenseItems,
    expenseItems: effectiveExpenseItems,
    budgetItems,
    transactions,
    initialSavingsFund,
    ledger,
    savingsVault,
    financialHealth,
    categorySummaries,
    distribution,
    budgetComparison,
    workTime,
    calendar,
    spendingProgress,
    savingsProjection,
    savingsData,
    optimization,
  };
}
