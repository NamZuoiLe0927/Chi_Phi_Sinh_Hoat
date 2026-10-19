import { toLocalISODate } from "@/lib/calculator/date";
import type {
  DailyExpenseCategoryCode,
  DailyTransaction,
  PaymentMethod,
  PaymentSource,
} from "@/types/living-cost.types";

interface DemoTransactionInput {
  profileId: string;
  now?: Date;
}

interface DemoLine {
  title: string;
  amount: number;
  expenseItemId: string | null;
  paymentMethod: PaymentMethod;
  paymentSource: PaymentSource;
  categoryCode: DailyExpenseCategoryCode;
  note: string;
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function randomBetween(random: () => number, min: number, max: number): number {
  return Math.round((min + random() * (max - min)) / 1_000) * 1_000;
}

function createDayLines(
  random: () => number,
  dayOfWeek: number,
  dayOfMonth: number,
): DemoLine[] {
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Deliberate no-spend days make the heatmap celebration state visible.
  if (dayOfMonth % 7 === 0 || dayOfMonth % 13 === 0) {
    return [];
  }

  const lines: DemoLine[] = [
    {
      title: "Ăn sáng - bánh mì trứng",
      amount: randomBetween(random, 28_000, 42_000),
      expenseItemId: "item-breakfast",
      paymentMethod: "CASH",
      paymentSource: "CASH",
      categoryCode: "FOOD",
      note: "Dữ liệu demo",
    },
    {
      title: "Ăn trưa văn phòng",
      amount: randomBetween(random, 40_000, 58_000),
      expenseItemId: "item-lunch",
      paymentMethod: "E_WALLET",
      paymentSource: "CASH",
      categoryCode: "FOOD",
      note: "Dữ liệu demo",
    },
  ];

  if (!isWeekend && random() > 0.35) {
    lines.push({
      title: "Cà phê buổi sáng",
      amount: randomBetween(random, 25_000, 38_000),
      expenseItemId: "item-coffee",
      paymentMethod: "E_WALLET",
      paymentSource: "CASH",
      categoryCode: "FOOD",
      note: "Dữ liệu demo",
    });
  }

  if (!isWeekend && dayOfMonth % 3 === 0) {
    lines.push({
      title: "Đổ xăng đi làm",
      amount: randomBetween(random, 65_000, 95_000),
      expenseItemId: "item-transport",
      paymentMethod: "E_WALLET",
      paymentSource: "CASH",
      categoryCode: "TRANSPORT",
      note: "Dữ liệu demo",
    });
  }

  if (isWeekend) {
    if (random() > 0.2) {
      lines.push({
        title: "Ăn tối cuối tuần cùng bạn bè",
        amount: randomBetween(random, 220_000, 480_000),
        expenseItemId: "item-dining-out",
        paymentMethod: "E_WALLET",
        paymentSource: random() > 0.6 ? "SAVINGS" : "CASH",
        categoryCode: "FOOD",
        note: "Dữ liệu demo cuối tuần",
      });
    }

    if (random() > 0.55) {
      lines.push({
        title: "Xem phim / giải trí",
        amount: randomBetween(random, 110_000, 240_000),
        expenseItemId: "item-entertainment",
        paymentMethod: "CREDIT_CARD",
        paymentSource: "CASH",
        categoryCode: "ENTERTAINMENT",
        note: "Dữ liệu demo cuối tuần",
      });
    }
  }

  if (dayOfMonth % 4 === 0) {
    lines.push({
      title: "Đi chợ nấu ăn tối",
      amount: randomBetween(random, 140_000, 260_000),
      expenseItemId: "item-groceries",
      paymentMethod: "CASH",
      paymentSource: "CASH",
      categoryCode: "SHOPPING",
      note: "Dữ liệu demo",
    });
  }

  if (dayOfMonth % 9 === 0) {
    lines.push({
      title: "Mua đồ dùng cá nhân",
      amount: randomBetween(random, 180_000, 450_000),
      expenseItemId: "item-shopping",
      paymentMethod: "E_WALLET",
      paymentSource: random() > 0.5 ? "SAVINGS" : "CASH",
      categoryCode: "SHOPPING",
      note: "Dữ liệu demo",
    });
  }

  return lines;
}

/**
 * Generates deterministic demo transactions for the current month, up to
 * today. The data deliberately includes no-spend days, within-budget days and
 * weekend overspending so the calendar heatmap has something interesting to
 * show immediately after resetting the demo.
 */
export function createDemoTransactions(
  input: DemoTransactionInput,
): DailyTransaction[] {
  const { profileId } = input;
  const now = input.now ?? new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const transactions: DailyTransaction[] = [];

  for (let dayOfMonth = 1; dayOfMonth <= today; dayOfMonth += 1) {
    const date = new Date(year, month, dayOfMonth, 20, 0, 0, 0);
    const isoDate = toLocalISODate(date);
    const random = mulberry32(year * 10_000 + (month + 1) * 100 + dayOfMonth);
    const lines = createDayLines(random, date.getDay(), dayOfMonth);

    lines.forEach((line, index) => {
      transactions.push({
        id: `demo-${isoDate}-${index + 1}`,
        profileId,
        expenseItemId: line.expenseItemId,
        title: line.title,
        amount: line.amount,
        date: isoDate,
        paymentMethod: line.paymentMethod,
        paymentSource: line.paymentSource,
        categoryCode: line.categoryCode,
        note: line.note,
        source: "DEMO",
        createdAt: new Date(
          year,
          month,
          dayOfMonth,
          20,
          index,
          0,
        ).toISOString(),
      });
    });
  }

  return transactions;
}
