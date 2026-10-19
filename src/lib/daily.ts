import { DAILY_EXPENSE_CATEGORIES } from "@/constants/daily-expenses";
import type {
  CategoryGroupCode,
  DailyExpenseCategoryCode,
} from "@/types/living-cost.types";

export function getDailyCategoryDefinition(
  code: DailyExpenseCategoryCode,
): (typeof DAILY_EXPENSE_CATEGORIES)[number] {
  return (
    DAILY_EXPENSE_CATEGORIES.find((category) => category.code === code) ??
    DAILY_EXPENSE_CATEGORIES[DAILY_EXPENSE_CATEGORIES.length - 1]
  );
}

const CATEGORY_GROUP: Record<DailyExpenseCategoryCode, CategoryGroupCode> = {
  FOOD: "NEEDS",
  TRANSPORT: "NEEDS",
  BILLS: "NEEDS",
  SHOPPING: "WANTS",
  ENTERTAINMENT: "WANTS",
  OTHER: "NEEDS",
};

export function getDailyCategoryGroup(
  code: DailyExpenseCategoryCode,
): CategoryGroupCode {
  return CATEGORY_GROUP[code];
}

const CATEGORY_KEYWORDS: Array<{
  code: DailyExpenseCategoryCode;
  keywords: string[];
}> = [
  {
    code: "FOOD",
    keywords: [
      "ăn",
      "uống",
      "cafe",
      "cà phê",
      "trà sữa",
      "bún",
      "phở",
      "cơm",
      "bánh",
      "lẩu",
      "nhậu",
      "chợ",
      "sáng",
      "trưa",
      "tối",
    ],
  },
  {
    code: "TRANSPORT",
    keywords: ["xăng", "grab", "taxi", "xe", "bus", "gửi xe", "vé", "đi lại"],
  },
  {
    code: "BILLS",
    keywords: [
      "điện",
      "nước",
      "internet",
      "wifi",
      "hóa đơn",
      "điện thoại",
      "rác",
      "phí",
      "bảo hiểm",
    ],
  },
  {
    code: "SHOPPING",
    keywords: [
      "mua",
      "đồ dùng",
      "quần",
      "áo",
      "giày",
      "mỹ phẩm",
      "siêu thị",
      "shop",
    ],
  },
  {
    code: "ENTERTAINMENT",
    keywords: ["phim", "game", "giải trí", "du lịch", "karaoke", "nhạc"],
  },
];

export function inferDailyCategoryCode(
  title: string,
): DailyExpenseCategoryCode {
  const normalized = title.toLowerCase();

  for (const entry of CATEGORY_KEYWORDS) {
    if (entry.keywords.some((keyword) => normalized.includes(keyword))) {
      return entry.code;
    }
  }

  return "OTHER";
}

const PARSED_CATEGORY_MAP: Record<string, DailyExpenseCategoryCode> = {
  "Ăn uống": "FOOD",
  "Đi lại": "TRANSPORT",
  "Hóa đơn & Nhà ở": "BILLS",
  "Mua sắm & Cá nhân": "SHOPPING",
  "Giải trí & Hưởng thụ": "ENTERTAINMENT",
  "Tiết kiệm & Trả nợ": "OTHER",
  "Chi phí khác": "OTHER",
};

export function mapParsedCategoryToCode(
  category: string,
): DailyExpenseCategoryCode {
  return PARSED_CATEGORY_MAP[category] ?? inferDailyCategoryCode(category);
}

function toLocalDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1, 12, 0, 0, 0);
}

export function formatTimelineDayLabel(
  isoDate: string,
  todayIso: string,
  yesterdayIso: string,
): string {
  const date = toLocalDate(isoDate);
  const dayLabel = `${String(date.getDate()).padStart(2, "0")}/${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}`;

  if (isoDate === todayIso) return `Hôm nay - ${dayLabel}`;
  if (isoDate === yesterdayIso) return `Hôm qua - ${dayLabel}`;

  const weekday = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
  }).format(date);

  return `${weekday} - ${dayLabel}`;
}
