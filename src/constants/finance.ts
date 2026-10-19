import type {
  BudgetRule,
  BudgetRuleDefinition,
  BudgetRuleTarget,
  CategoryDefinition,
  CategoryGroupCode,
  ElectricityTierDefinition,
  Frequency,
  FrequencyDefinition,
  PaymentMethod,
  PaymentMethodDefinition,
} from "@/types/living-cost.types";

export const MONTHLY_DAYS = 30.44;
export const MONTHLY_WEEKS = 4.345;
export const MONTHS_PER_YEAR = 12;
export const DAYS_PER_YEAR = 365.28;

export const ELECTRICITY_VAT_RATE = 0.08;

export const ELECTRICITY_TIERS: ElectricityTierDefinition[] = [
  {
    tier: 1,
    label: "Bậc 1 (0 - 50 kWh)",
    fromKwh: 1,
    toKwh: 50,
    unitPrice: 1984,
  },
  {
    tier: 2,
    label: "Bậc 2 (51 - 100 kWh)",
    fromKwh: 51,
    toKwh: 100,
    unitPrice: 2050,
  },
  {
    tier: 3,
    label: "Bậc 3 (101 - 200 kWh)",
    fromKwh: 101,
    toKwh: 200,
    unitPrice: 2380,
  },
  {
    tier: 4,
    label: "Bậc 4 (201 - 300 kWh)",
    fromKwh: 201,
    toKwh: 300,
    unitPrice: 2998,
  },
  {
    tier: 5,
    label: "Bậc 5 (301 - 400 kWh)",
    fromKwh: 301,
    toKwh: 400,
    unitPrice: 3350,
  },
  {
    tier: 6,
    label: "Bậc 6 (401 kWh trở lên)",
    fromKwh: 401,
    toKwh: null,
    unitPrice: 3460,
  },
];

export const FREQUENCY_DEFINITIONS: Record<Frequency, FrequencyDefinition> = {
  DAILY: {
    value: "DAILY",
    label: "Hàng ngày",
    shortLabel: "Ngày",
    monthlyMultiplier: MONTHLY_DAYS,
    dailyMultiplier: 1,
    yearlyMultiplier: DAYS_PER_YEAR,
  },
  WEEKLY: {
    value: "WEEKLY",
    label: "Hàng tuần",
    shortLabel: "Tuần",
    monthlyMultiplier: MONTHLY_WEEKS,
    dailyMultiplier: MONTHLY_WEEKS / MONTHLY_DAYS,
    yearlyMultiplier: MONTHLY_WEEKS * MONTHS_PER_YEAR,
  },
  MONTHLY: {
    value: "MONTHLY",
    label: "Hàng tháng",
    shortLabel: "Tháng",
    monthlyMultiplier: 1,
    dailyMultiplier: 1 / MONTHLY_DAYS,
    yearlyMultiplier: MONTHS_PER_YEAR,
  },
  YEARLY: {
    value: "YEARLY",
    label: "Hàng năm",
    shortLabel: "Năm",
    monthlyMultiplier: 1 / MONTHS_PER_YEAR,
    dailyMultiplier: 1 / DAYS_PER_YEAR,
    yearlyMultiplier: 1,
  },
};

export const BUDGET_RULE_TARGETS: Record<
  Exclude<BudgetRule, "CUSTOM">,
  BudgetRuleTarget
> = {
  RULE_50_30_20: {
    needs: 50,
    wants: 30,
    savingsDebt: 20,
  },
  RULE_60_20_20: {
    needs: 60,
    wants: 20,
    savingsDebt: 20,
  },
};

export const BUDGET_RULES: Record<BudgetRule, BudgetRuleDefinition> = {
  RULE_50_30_20: {
    code: "RULE_50_30_20",
    label: "Quy tắc 50/30/20",
    description: "50% thiết yếu, 30% mong muốn, 20% tiết kiệm và trả nợ",
    target: BUDGET_RULE_TARGETS.RULE_50_30_20,
    recommendedFor: ["BALANCED"],
  },
  RULE_60_20_20: {
    code: "RULE_60_20_20",
    label: "Quy tắc 60/20/20",
    description: "60% thiết yếu, 20% mong muốn, 20% tiết kiệm và trả nợ",
    target: BUDGET_RULE_TARGETS.RULE_60_20_20,
    recommendedFor: ["FRUGAL", "COMFORT"],
  },
  CUSTOM: {
    code: "CUSTOM",
    label: "Tùy chỉnh",
    description: "Tỷ lệ do người dùng tự cấu hình",
    target: BUDGET_RULE_TARGETS.RULE_50_30_20,
    recommendedFor: ["BALANCED", "FRUGAL", "COMFORT"],
  },
};

export const CATEGORY_DEFINITIONS: Record<CategoryGroupCode, CategoryDefinition> = {
  NEEDS: {
    code: "NEEDS",
    name: "Thiết yếu",
    description: "Chi phí bắt buộc để duy trì cuộc sống và công việc hằng ngày",
    color: "#10b981",
    icon: "Home",
    targetPercentage: 50,
  },
  WANTS: {
    code: "WANTS",
    name: "Mong muốn",
    description: "Chi phí giải trí, hưởng thụ và nâng cao chất lượng sống",
    color: "#f59e0b",
    icon: "Coffee",
    targetPercentage: 30,
  },
  SAVINGS_DEBT: {
    code: "SAVINGS_DEBT",
    name: "Tiết kiệm & Trả nợ",
    description: "Quỹ dự phòng, đầu tư và các khoản trả góp",
    color: "#38bdf8",
    icon: "PiggyBank",
    targetPercentage: 20,
  },
};

export const PAYMENT_METHOD_DEFINITIONS: Record<
  PaymentMethod,
  PaymentMethodDefinition
> = {
  CASH: {
    value: "CASH",
    label: "Tiền mặt",
    icon: "Banknote",
    color: "#22c55e",
  },
  BANK_TRANSFER: {
    value: "BANK_TRANSFER",
    label: "Chuyển khoản",
    icon: "Landmark",
    color: "#38bdf8",
  },
  CREDIT_CARD: {
    value: "CREDIT_CARD",
    label: "Thẻ tín dụng",
    icon: "CreditCard",
    color: "#a78bfa",
  },
  E_WALLET: {
    value: "E_WALLET",
    label: "Ví điện tử",
    icon: "Wallet",
    color: "#f59e0b",
  },
};

export const LATTE_FACTOR_ANNUAL_RATE = 0.08;
export const LATTE_FACTOR_PROJECTION_YEARS = [1, 5, 10];
export const DEFAULT_SAFE_TO_SPEND_INCLUDE_TODAY = true;
export const RUNWAY_WARNING_MONTHS = 3;
export const RUNWAY_SAFE_MONTHS = 6;
