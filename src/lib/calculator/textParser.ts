import type {
  CategoryKeywordRule,
  ParsedAmount,
  ParsedTransactionDraft,
  TextParserOptions,
  TextParserResult,
} from "@/types/living-cost.types";
import { clamp } from "@/lib/utils";

const DEFAULT_OPTIONS: TextParserOptions = {
  defaultPaymentMethod: "E_WALLET",
  defaultGroupCode: "NEEDS",
  maxItems: 12,
  locale: "vi-VN",
};

export const CATEGORY_KEYWORD_RULES: CategoryKeywordRule[] = [
  {
    groupCode: "NEEDS",
    category: "Ăn uống",
    keywords: [
      "ăn sáng",
      "ăn trưa",
      "ăn tối",
      "ăn",
      "bún",
      "phở",
      "cơm",
      "lẩu",
      "bánh mì",
      "chợ",
      "siêu thị",
      "thực phẩm",
      "nước mắm",
      "rau",
      "thịt",
    ],
    icon: "UtensilsCrossed",
    color: "#10b981",
  },
  {
    groupCode: "NEEDS",
    category: "Đi lại",
    keywords: [
      "xăng",
      "grab",
      "taxi",
      "gửi xe",
      "bảo dưỡng",
      "xe buýt",
      "đi lại",
      "vé tàu",
      "vé xe",
    ],
    icon: "Car",
    color: "#38bdf8",
  },
  {
    groupCode: "WANTS",
    category: "Giải trí & Hưởng thụ",
    keywords: [
      "cafe",
      "cà phê",
      "trà sữa",
      "xem phim",
      "netflix",
      "game",
      "karaoke",
      "giải trí",
      "du lịch",
      "cắm trại",
    ],
    icon: "Coffee",
    color: "#f59e0b",
  },
  {
    groupCode: "NEEDS",
    category: "Hóa đơn & Nhà ở",
    keywords: [
      "tiền điện",
      "điện",
      "tiền nước",
      "nước",
      "wifi",
      "internet",
      "tiền nhà",
      "nhà",
      "trọ",
      "hóa đơn",
      "gas",
      "rác",
    ],
    icon: "ReceiptText",
    color: "#a78bfa",
  },
  {
    groupCode: "WANTS",
    category: "Mua sắm & Cá nhân",
    keywords: [
      "shopee",
      "lazada",
      "mua sắm",
      "áo",
      "quần",
      "giày",
      "túi",
      "mỹ phẩm",
      "cắt tóc",
      "spa",
    ],
    icon: "Shirt",
    color: "#f472b6",
  },
  {
    groupCode: "SAVINGS_DEBT",
    category: "Tiết kiệm & Trả nợ",
    keywords: [
      "tiết kiệm",
      "trả góp",
      "trả nợ",
      "đầu tư",
      "chứng chỉ quỹ",
      "quỹ",
      "nợ",
    ],
    icon: "PiggyBank",
    color: "#fbbf24",
  },
];

const AMOUNT_MULTIPLIERS: Array<{
  suffix: string;
  multiplier: number;
}> = [
  { suffix: "nghìn", multiplier: 1_000 },
  { suffix: "ngàn", multiplier: 1_000 },
  { suffix: "triệu", multiplier: 1_000_000 },
  { suffix: "trăm", multiplier: 100_000 },
  { suffix: "lít", multiplier: 100_000 },
  { suffix: "vnđ", multiplier: 1 },
  { suffix: "vnd", multiplier: 1 },
  { suffix: "k", multiplier: 1_000 },
  { suffix: "tr", multiplier: 1_000_000 },
  { suffix: "củ", multiplier: 1_000_000 },
  { suffix: "đ", multiplier: 1 },
];

const SUFFIX_PATTERN = AMOUNT_MULTIPLIERS.map((entry) =>
  entry.suffix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
)
  .sort((a, b) => b.length - a.length)
  .join("|");

const SUFFIX_AMOUNT_REGEX = new RegExp(
  `(\\d+(?:[.,]\\d+)?)\\s*(${SUFFIX_PATTERN})(?![\\p{L}\\p{N}])`,
  "giu",
);
const PLAIN_AMOUNT_REGEX = /(\d{1,3}(?:[.,]\d{3})+|\d+)(?!\d)/g;
const DIVISION_REGEX =
  /\bchia\s+(?:cho\s+)?(\d+(?:[.,]\d+)?)\s*(?:người|phần|mạng|bạn|con)?\b/iu;

function foldVietnamese(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/giu, "d")
    .toLowerCase();
}

function normalizeNumericText(raw: string, hasSuffix: boolean): number {
  const value = raw.replace(/\s/g, "");
  const hasComma = value.includes(",");
  const hasDot = value.includes(".");

  if (hasComma && hasDot) {
    return Number(value.replace(/\./g, "").replace(/,/g, "."));
  }

  if (hasComma) {
    const parts = value.split(",");
    const lastGroup = parts[parts.length - 1] ?? "";
    if (!hasSuffix && lastGroup.length === 3) {
      return Number(parts.join(""));
    }
    return Number(value.replace(/,/g, "."));
  }

  if (hasDot) {
    const parts = value.split(".");
    const lastGroup = parts[parts.length - 1] ?? "";
    // Dots are thousands separators in Vietnamese money notation, so
    // "45.000đ" means 45.000 VND and "1.5tr" remains a decimal amount.
    if (lastGroup.length === 3) {
      return Number(parts.join(""));
    }
    return Number(value);
  }

  return Number(value);
}

function parseAmount(
  segment: string,
): { amount: ParsedAmount; matchText: string } | null {
  const divisionMatch = segment.match(DIVISION_REGEX);
  let divisor = 1;
  let workingSegment = segment;

  if (divisionMatch) {
    const parsedDivisor = normalizeNumericText(divisionMatch[1], false);
    if (Number.isFinite(parsedDivisor) && parsedDivisor > 0) {
      divisor = parsedDivisor;
    }
    workingSegment = segment.replace(divisionMatch[0], " ");
  }

  SUFFIX_AMOUNT_REGEX.lastIndex = 0;
  PLAIN_AMOUNT_REGEX.lastIndex = 0;
  const suffixMatches = [...workingSegment.matchAll(SUFFIX_AMOUNT_REGEX)];
  const suffixMatch = suffixMatches[suffixMatches.length - 1];
  if (suffixMatch) {
    const numericValue = normalizeNumericText(suffixMatch[1], true);
    const suffix = suffixMatch[2].toLowerCase();
    const multiplier =
      AMOUNT_MULTIPLIERS.find((entry) => entry.suffix === suffix)
        ?.multiplier ?? 1;
    const value = Math.round((numericValue * multiplier) / divisor);

    return {
      amount: {
        raw: suffixMatch[0],
        value,
        multiplier,
        divisor,
      },
      matchText: suffixMatch[0],
    };
  }

  const plainMatches = [...workingSegment.matchAll(PLAIN_AMOUNT_REGEX)];
  const plainMatch = plainMatches[plainMatches.length - 1];
  if (!plainMatch) return null;

  const numericValue = normalizeNumericText(plainMatch[1], false);
  if (!Number.isFinite(numericValue)) return null;

  // In casual Vietnamese, a bare number under 1.000 is usually shorthand for
  // thousands ("45" -> 45.000đ). Full amounts like 450000 stay unchanged.
  const multiplier = numericValue > 0 && numericValue < 1_000 ? 1_000 : 1;
  const value = Math.round((numericValue * multiplier) / divisor);

  return {
    amount: {
      raw: plainMatch[0],
      value,
      multiplier,
      divisor,
    },
    matchText: plainMatch[0],
  };
}

function matchCategory(segment: string): {
  rule: CategoryKeywordRule | null;
  keyword: string | null;
} {
  const foldedSegment = foldVietnamese(segment);
  let bestRule: CategoryKeywordRule | null = null;
  let bestKeyword: string | null = null;

  for (const rule of CATEGORY_KEYWORD_RULES) {
    for (const keyword of rule.keywords) {
      const foldedKeyword = foldVietnamese(keyword);
      const escapedKeyword = foldedKeyword.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
      );
      const keywordRegex = new RegExp(
        `(?<![\\p{L}\\p{N}])${escapedKeyword}(?![\\p{L}\\p{N}])`,
        "u",
      );
      if (!keywordRegex.test(foldedSegment)) continue;

      if (!bestKeyword || keyword.length > bestKeyword.length) {
        bestRule = rule;
        bestKeyword = keyword;
      }
    }
  }

  return { rule: bestRule, keyword: bestKeyword };
}

function buildTitle(segment: string, amountText: string): string {
  const cleaned = segment
    .replace(amountText, " ")
    .replace(DIVISION_REGEX, " ")
    .replace(/\s+/g, " ")
    .replace(/^[\s,;:+\-–—]+|[\s,;:+\-–—]+$/g, "")
    .trim();

  if (!cleaned) return "Khoản chi";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function splitSegments(input: string): string[] {
  const normalized = input.replace(/(\d),(\d)/g, "$1.$2");
  return normalized
    .split(/\s*(?:[;,\n+]|\bvà\b)\s*/iu)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);
}

/**
 * Parses a free-form Vietnamese expense sentence into transaction drafts.
 *
 * Supported examples:
 * - "Sáng ăn bún bò 45k, chiều cafe 35k"
 * - "Đổ xăng 80k, mua áo shopee 250k"
 * - "Ăn lẩu cuối tuần 450000 chia 3 người"
 * - "Đóng tiền điện 850trăm"
 */
export function parseVietnameseExpenses(
  input: string,
  options: Partial<TextParserOptions> = {},
): TextParserResult {
  const resolvedOptions: TextParserOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
    locale: "vi-VN",
  };
  const rawInput = input;
  const trimmedInput = input.trim();

  if (!trimmedInput) {
    return {
      rawInput,
      drafts: [],
      unparsedSegments: [],
      totalAmount: 0,
    };
  }

  const segments = splitSegments(trimmedInput);
  const drafts: ParsedTransactionDraft[] = [];
  const unparsedSegments: string[] = [];

  for (const segment of segments) {
    const parsedAmount = parseAmount(segment);
    if (!parsedAmount || parsedAmount.amount.value <= 0) {
      unparsedSegments.push(segment);
      continue;
    }

    if (drafts.length >= resolvedOptions.maxItems) {
      unparsedSegments.push(segment);
      continue;
    }

    const { rule, keyword } = matchCategory(segment);
    const title = buildTitle(segment, parsedAmount.matchText);
    const confidence = clamp(
      60 + (rule ? 25 : 0) + (keyword && keyword.length >= 4 ? 10 : 0),
      35,
      98,
    );

    drafts.push({
      id: `parsed-${Date.now().toString(36)}-${drafts.length + 1}`,
      title,
      amount: parsedAmount.amount.value,
      category: rule?.category ?? "Chi phí khác",
      groupCode: rule?.groupCode ?? resolvedOptions.defaultGroupCode,
      rawText: segment,
      confidence,
      matchedKeyword: keyword,
      paymentMethod: resolvedOptions.defaultPaymentMethod,
    });
  }

  return {
    rawInput,
    drafts,
    unparsedSegments,
    totalAmount: drafts.reduce((total, draft) => total + draft.amount, 0),
  };
}

export const parseExpenseText = parseVietnameseExpenses;
