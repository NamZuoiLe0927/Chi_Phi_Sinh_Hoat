import { CATEGORY_DEFINITIONS } from "@/constants/finance";
import { normalizeToMonthly } from "@/lib/calculator/frequency";
import type {
  BudgetRuleAnalysis,
  BudgetRuleComparisonDatum,
  CategoryDistributionDatum,
  CategoryGroupCode,
  ExpenseItem,
} from "@/types/living-cost.types";

interface DistributionBucket {
  key: string;
  name: string;
  color: string;
  groupCode: CategoryGroupCode;
  itemIds: string[];
}

const DISTRIBUTION_BUCKETS: DistributionBucket[] = [
  {
    key: "housing",
    name: "Tiền nhà",
    color: "#10b981",
    groupCode: "NEEDS",
    itemIds: ["item-rent"],
  },
  {
    key: "food",
    name: "Ăn uống",
    color: "#f59e0b",
    groupCode: "NEEDS",
    itemIds: [
      "item-breakfast",
      "item-lunch",
      "item-groceries",
      "item-coffee",
      "item-dining-out",
    ],
  },
  {
    key: "transport",
    name: "Đi lại",
    color: "#38bdf8",
    groupCode: "NEEDS",
    itemIds: ["item-transport", "item-parking"],
  },
  {
    key: "bills",
    name: "Hóa đơn",
    color: "#818cf8",
    groupCode: "NEEDS",
    itemIds: [
      "item-electricity",
      "item-water",
      "item-internet",
      "item-health-insurance",
    ],
  },
  {
    key: "leisure",
    name: "Giải trí",
    color: "#c084fc",
    groupCode: "WANTS",
    itemIds: [
      "item-netflix",
      "item-spotify",
      "item-youtube",
      "item-chatgpt",
      "item-gym",
      "item-travel",
      "item-entertainment",
    ],
  },
  {
    key: "personal",
    name: "Mua sắm & Cá nhân",
    color: "#f472b6",
    groupCode: "WANTS",
    itemIds: ["item-shopping", "item-grooming"],
  },
  {
    key: "savings",
    name: "Tiết kiệm & Trả nợ",
    color: "#2dd4bf",
    groupCode: "SAVINGS_DEBT",
    itemIds: [],
  },
  {
    key: "other",
    name: "Khác",
    color: "#94a3b8",
    groupCode: "NEEDS",
    itemIds: ["item-household"],
  },
];

const ITEM_BUCKET_MAP = new Map<string, string>(
  DISTRIBUTION_BUCKETS.flatMap((bucket) =>
    bucket.itemIds.map((itemId) => [itemId, bucket.key] as const),
  ),
);

export function buildCategoryDistribution(
  expenseItems: ExpenseItem[],
): CategoryDistributionDatum[] {
  const totals = new Map<string, number>();

  for (const item of expenseItems) {
    if (!item.isEnabled) continue;

    const bucketKey =
      item.group === "SAVINGS_DEBT"
        ? "savings"
        : ITEM_BUCKET_MAP.get(item.id) ?? "other";
    const monthlyCost = normalizeToMonthly(item);
    if (monthlyCost <= 0) continue;

    totals.set(bucketKey, (totals.get(bucketKey) ?? 0) + monthlyCost);
  }

  const totalExpense = Array.from(totals.values()).reduce(
    (total, value) => total + value,
    0,
  );

  return DISTRIBUTION_BUCKETS.filter(
    (bucket) => (totals.get(bucket.key) ?? 0) > 0,
  ).map((bucket) => {
    const value = totals.get(bucket.key) ?? 0;
    return {
      name: bucket.name,
      value,
      percentage: totalExpense > 0 ? (value / totalExpense) * 100 : 0,
      color: bucket.color,
      groupCode: bucket.groupCode,
    };
  });
}

export function buildBudgetRuleComparison(
  analysis: BudgetRuleAnalysis,
): BudgetRuleComparisonDatum[] {
  return [
    {
      groupCode: "NEEDS",
      label: "Thiết yếu",
      color: "#10b981",
      actualPercentage: analysis.actualPercentages.needs,
      targetPercentage: analysis.targetPercentages.needs,
      actualAmount: analysis.actual.needs,
      targetAmount: analysis.targetAmounts.needs,
      isOver: analysis.actualPercentages.needs > 60,
    },
    {
      groupCode: "WANTS",
      label: "Mong muốn",
      color: "#f59e0b",
      actualPercentage: analysis.actualPercentages.wants,
      targetPercentage: analysis.targetPercentages.wants,
      actualAmount: analysis.actual.wants,
      targetAmount: analysis.targetAmounts.wants,
      isOver: analysis.actualPercentages.wants > 30,
    },
    {
      groupCode: "SAVINGS_DEBT",
      label: "Tiết kiệm",
      color: "#38bdf8",
      actualPercentage: analysis.actualPercentages.savingsDebt,
      targetPercentage: analysis.targetPercentages.savingsDebt,
      actualAmount: analysis.actual.savingsDebt,
      targetAmount: analysis.targetAmounts.savingsDebt,
      isOver:
        analysis.actualPercentages.savingsDebt <
        analysis.targetPercentages.savingsDebt,
    },
  ];
}

export function getGroupLabel(groupCode: CategoryGroupCode): string {
  return CATEGORY_DEFINITIONS[groupCode].name;
}
