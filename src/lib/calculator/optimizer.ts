import { CATEGORY_DEFINITIONS } from "@/constants/finance";
import type {
  CategoryGroupCode,
  ExpenseItem,
  OptimizationOptions,
  OptimizationResult,
  OptimizationSuggestion,
  OptimizationStrategy,
} from "@/types/living-cost.types";
import { normalizeToMonthly } from "./frequency";
import { clamp, roundTo } from "@/lib/utils";

export type AutoOptimizeOptions = Partial<OptimizationOptions> & {
  targetMonthlyExpense: number;
};

const DEFAULT_GROUP_ORDER: CategoryGroupCode[] = [
  "WANTS",
  "NEEDS",
  "SAVINGS_DEBT",
];

const DEFAULT_MIN_PRIORITY = 3;
const DEFAULT_MAX_REDUCTION_RATE = 50;
const MAX_PASSES = 50;
const EPSILON = 0.01;

function getGroupOrder(
  strategy: OptimizationStrategy,
  prioritizeGroups?: CategoryGroupCode[],
): CategoryGroupCode[] {
  if (prioritizeGroups && prioritizeGroups.length > 0) {
    return [
      ...prioritizeGroups,
      ...DEFAULT_GROUP_ORDER.filter((group) => !prioritizeGroups.includes(group)),
    ];
  }

  if (strategy === "LOWEST_PRIORITY_FIRST") {
    return ["WANTS", "NEEDS", "SAVINGS_DEBT"];
  }

  return DEFAULT_GROUP_ORDER;
}

function sortCandidates(
  items: ExpenseItem[],
  groupOrder: CategoryGroupCode[],
  strategy: OptimizationStrategy,
): ExpenseItem[] {
  const groupRank = new Map(groupOrder.map((group, index) => [group, index]));

  return [...items].sort((a, b) => {
    if (strategy === "LOWEST_PRIORITY_FIRST") {
      if (a.priority !== b.priority) return b.priority - a.priority;
      const groupDifference =
        (groupRank.get(a.group) ?? 99) - (groupRank.get(b.group) ?? 99);
      if (groupDifference !== 0) return groupDifference;
    } else {
      const groupDifference =
        (groupRank.get(a.group) ?? 99) - (groupRank.get(b.group) ?? 99);
      if (groupDifference !== 0) return groupDifference;
      if (a.priority !== b.priority) return b.priority - a.priority;
    }

    return normalizeToMonthly(b) - normalizeToMonthly(a);
  });
}

export function autoOptimizeLivingCost(
  expenseItems: ExpenseItem[],
  options: AutoOptimizeOptions,
): OptimizationResult {
  const targetMonthlyExpense = Math.max(0, options.targetMonthlyExpense);
  const strategy = options.strategy ?? "WANTS_FIRST";
  const minPriority = options.minPriority ?? DEFAULT_MIN_PRIORITY;
  const maxReductionRate = clamp(
    options.maxReductionRate ?? DEFAULT_MAX_REDUCTION_RATE,
    0,
    100,
  );
  const preserveFixedItems = options.preserveFixedItems ?? true;
  const preserveSavingsItems = options.preserveSavingsItems ?? true;
  const groupOrder = getGroupOrder(strategy, options.prioritizeGroups);

  const currentMonthlyExpense = expenseItems
    .filter((item) => item.isEnabled)
    .reduce((total, item) => total + normalizeToMonthly(item), 0);

  if (currentMonthlyExpense <= targetMonthlyExpense) {
    return {
      targetMonthlyExpense,
      currentMonthlyExpense,
      achievedMonthlyExpense: currentMonthlyExpense,
      totalMonthlySavings: 0,
      isTargetAchieved: true,
      strategy,
      suggestions: [],
      skippedItemIds: expenseItems
        .filter((item) => item.isEnabled)
        .map((item) => item.id),
    };
  }

  const candidates = sortCandidates(
    expenseItems.filter((item) => {
      if (!item.isEnabled) return false;
      if (preserveFixedItems && item.isFixed) return false;
      if (preserveSavingsItems && item.group === "SAVINGS_DEBT") return false;
      if (item.priority < minPriority) return false;
      return normalizeToMonthly(item) > 0;
    }),
    groupOrder,
    strategy,
  );

  const quantities = new Map(
    expenseItems.map((item) => [item.id, item.quantityPerPeriod]),
  );
  const originalCosts = new Map(
    expenseItems.map((item) => [item.id, normalizeToMonthly(item)]),
  );
  const suggestions = new Map<string, OptimizationSuggestion>();
  let remainingDeficit = currentMonthlyExpense - targetMonthlyExpense;

  const applyReduction = (item: ExpenseItem, reductionUnits: number): void => {
    const currentQuantity = quantities.get(item.id) ?? 0;
    if (currentQuantity <= 0 || reductionUnits <= 0) return;

    const nextQuantity = Math.max(
      0,
      roundTo(currentQuantity - reductionUnits, 2),
    );
    if (nextQuantity >= currentQuantity) return;

    const unitMonthlyCost = normalizeToMonthly({
      ...item,
      quantityPerPeriod: 1,
    });
    const nextMonthlyCost = unitMonthlyCost * nextQuantity;
    const previousMonthlyCost = originalCosts.get(item.id) ?? 0;
    const previousSuggestion = suggestions.get(item.id);
    const monthlySavings = (currentQuantity - nextQuantity) * unitMonthlyCost;

    quantities.set(item.id, nextQuantity);
    remainingDeficit -= monthlySavings;

    if (previousSuggestion) {
      previousSuggestion.suggestedQuantity = nextQuantity;
      previousSuggestion.suggestedMonthlyCost = nextMonthlyCost;
      previousSuggestion.monthlySavings += monthlySavings;
      previousSuggestion.reductionRate =
        ((previousSuggestion.currentQuantity - nextQuantity) /
          previousSuggestion.currentQuantity) *
        100;
    } else {
      suggestions.set(item.id, {
        expenseItemId: item.id,
        name: item.name,
        groupCode: item.group,
        groupName: CATEGORY_DEFINITIONS[item.group].name,
        priority: item.priority,
        frequency: item.frequency,
        currentQuantity,
        suggestedQuantity: nextQuantity,
        currentMonthlyCost: previousMonthlyCost,
        suggestedMonthlyCost: nextMonthlyCost,
        monthlySavings,
        reductionRate:
          ((currentQuantity - nextQuantity) / currentQuantity) * 100,
      });
    }
  };

  let pass = 0;
  while (remainingDeficit > EPSILON && pass < MAX_PASSES) {
    let progress = false;

    for (const item of candidates) {
      if (remainingDeficit <= EPSILON) break;

      const currentQuantity = quantities.get(item.id) ?? 0;
      if (currentQuantity <= 0) continue;

      const unitMonthlyCost = normalizeToMonthly({
        ...item,
        quantityPerPeriod: 1,
      });
      if (unitMonthlyCost <= 0) continue;

      const neededUnits = remainingDeficit / unitMonthlyCost;
      const reductionCap =
        maxReductionRate <= 0
          ? 0
          : currentQuantity >= 1
            ? Math.min(
                currentQuantity,
                Math.max(
                  1,
                  Math.floor(
                    currentQuantity * (maxReductionRate / 100),
                  ),
                ),
              )
            : Math.min(
                currentQuantity,
                currentQuantity * (maxReductionRate / 100),
              );

      if (currentQuantity >= 1 && neededUnits < 1) {
        continue;
      }

      const reductionUnits = Math.min(
        reductionCap,
        currentQuantity >= 1
          ? Math.max(1, Math.floor(neededUnits))
          : neededUnits,
      );

      if (reductionUnits <= 0) continue;
      applyReduction(item, reductionUnits);
      progress = true;
    }

    if (!progress && remainingDeficit > EPSILON && maxReductionRate > 0) {
      const fallback = candidates
        .filter((item) => (quantities.get(item.id) ?? 0) >= 1)
        .sort((a, b) => {
          const costA = normalizeToMonthly({
            ...a,
            quantityPerPeriod: quantities.get(a.id) ?? 0,
          });
          const costB = normalizeToMonthly({
            ...b,
            quantityPerPeriod: quantities.get(b.id) ?? 0,
          });
          return costA - costB;
        })[0];

      if (fallback) {
        applyReduction(fallback, 1);
        progress = true;
      }
    }

    if (!progress) break;
    pass += 1;
  }

  const suggestionList = Array.from(suggestions.values()).sort(
    (a, b) => b.monthlySavings - a.monthlySavings,
  );
  const totalMonthlySavings = suggestionList.reduce(
    (total, suggestion) => total + suggestion.monthlySavings,
    0,
  );
  const achievedMonthlyExpense = currentMonthlyExpense - totalMonthlySavings;

  return {
    targetMonthlyExpense,
    currentMonthlyExpense,
    achievedMonthlyExpense,
    totalMonthlySavings,
    isTargetAchieved: achievedMonthlyExpense <= targetMonthlyExpense + EPSILON,
    strategy,
    suggestions: suggestionList,
    skippedItemIds: expenseItems
      .filter((item) => !suggestions.has(item.id))
      .map((item) => item.id),
  };
}
