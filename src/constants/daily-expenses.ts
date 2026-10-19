import type {
  DailyExpenseCategoryCode,
  PaymentMethod,
  PaymentSource,
} from "@/types/living-cost.types";

export interface DailyExpenseCategoryDefinition {
  code: DailyExpenseCategoryCode;
  label: string;
  icon: string;
  color: string;
}

export const DAILY_EXPENSE_CATEGORIES: DailyExpenseCategoryDefinition[] = [
  { code: "FOOD", label: "Ăn uống", icon: "UtensilsCrossed", color: "#fb923c" },
  { code: "TRANSPORT", label: "Đi lại", icon: "Car", color: "#38bdf8" },
  { code: "BILLS", label: "Hóa đơn", icon: "ReceiptText", color: "#a78bfa" },
  { code: "SHOPPING", label: "Mua sắm", icon: "ShoppingBasket", color: "#f472b6" },
  {
    code: "ENTERTAINMENT",
    label: "Giải trí",
    icon: "Clapperboard",
    color: "#facc15",
  },
  {
    code: "OTHER",
    label: "Phát sinh khác",
    icon: "CircleDollarSign",
    color: "#94a3b8",
  },
];

export interface PaymentSourceOption {
  value: PaymentSource;
  label: string;
  shortLabel: string;
  description: string;
}

export const PAYMENT_SOURCE_OPTIONS: PaymentSourceOption[] = [
  {
    value: "CASH",
    label: "Tiền mặt / Lương tháng này",
    shortLabel: "Tiền mặt",
    description: "Chi trong dòng tiền lương hằng tháng",
  },
  {
    value: "SAVINGS",
    label: "Rút từ Quỹ Tiết Kiệm",
    shortLabel: "Rút quỹ",
    description: "Lấy trực tiếp từ két sắt tiết kiệm",
  },
];

export interface QuickExpensePreset {
  id: string;
  emoji: string;
  title: string;
  amount: number;
  categoryCode: DailyExpenseCategoryCode;
  paymentMethod: PaymentMethod;
  note: string | null;
}

export const QUICK_EXPENSE_PRESETS: QuickExpensePreset[] = [
  {
    id: "preset-breakfast",
    emoji: "🍜",
    title: "Ăn sáng",
    amount: 35_000,
    categoryCode: "FOOD",
    paymentMethod: "CASH",
    note: null,
  },
  {
    id: "preset-lunch",
    emoji: "🍱",
    title: "Ăn trưa",
    amount: 50_000,
    categoryCode: "FOOD",
    paymentMethod: "E_WALLET",
    note: null,
  },
  {
    id: "preset-coffee",
    emoji: "☕",
    title: "Cà phê",
    amount: 40_000,
    categoryCode: "FOOD",
    paymentMethod: "E_WALLET",
    note: null,
  },
  {
    id: "preset-fuel",
    emoji: "🛵",
    title: "Đổ xăng",
    amount: 70_000,
    categoryCode: "TRANSPORT",
    paymentMethod: "E_WALLET",
    note: null,
  },
  {
    id: "preset-groceries",
    emoji: "🛒",
    title: "Đi chợ",
    amount: 150_000,
    categoryCode: "SHOPPING",
    paymentMethod: "CASH",
    note: null,
  },
  {
    id: "preset-milk-tea",
    emoji: "🧋",
    title: "Trà sữa",
    amount: 45_000,
    categoryCode: "FOOD",
    paymentMethod: "E_WALLET",
    note: null,
  },
];
