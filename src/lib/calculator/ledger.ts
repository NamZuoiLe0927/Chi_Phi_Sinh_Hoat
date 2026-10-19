import type {
  DailyTransaction,
  MonthlyLedgerSummary,
  MonthlyRecord,
  MonthlyRecordResolved,
  VndAmount,
} from "@/types/living-cost.types";

export const MONTH_COUNT = 12;

export const MONTH_LABELS: readonly string[] = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

export function getMonthKey(year: number, monthIndex: number): string {
  return `${year}-${String(monthIndex).padStart(2, "0")}`;
}

export function getMonthKeyFromDate(date: Date): string {
  return getMonthKey(date.getFullYear(), date.getMonth() + 1);
}

export function formatMonthLabel(monthIndex: number): string {
  return MONTH_LABELS[monthIndex - 1] ?? `Tháng ${monthIndex}`;
}

export function formatMonthShortLabel(monthIndex: number): string {
  return `T${monthIndex}`;
}

export interface CreateMonthlyRecordsOptions {
  now?: Date;
  timestamp?: string;
}

/**
 * Creates the 12-month ledger for a year. The current month starts in AUTO
 * mode (income − ghi chép chi tiêu), every other month starts in MANUAL mode so
 * the user can type a signed (+/−) balance with a reason.
 */
export function createMonthlyRecords(
  year: number,
  defaultIncome: VndAmount,
  options: CreateMonthlyRecordsOptions = {},
): MonthlyRecord[] {
  const now = options.now ?? new Date();
  const timestamp = options.timestamp ?? now.toISOString();
  const currentMonthIndex = now.getFullYear() === year ? now.getMonth() + 1 : null;
  const income = Math.max(0, Math.round(defaultIncome));

  return Array.from({ length: MONTH_COUNT }, (_, index) => {
    const monthIndex = index + 1;
    const isCurrent = monthIndex === currentMonthIndex;

    const record: MonthlyRecord = {
      id: `ledger-${getMonthKey(year, monthIndex)}`,
      month: getMonthKey(year, monthIndex),
      year,
      monthIndex,
      income: isCurrent ? income : 0,
      manualNetBalance: null,
      note: "",
      mode: isCurrent ? "AUTO" : "MANUAL",
      isSettled: false,
      updatedAt: timestamp,
    };

    return record;
  });
}

export function sumMonthlySpent(
  transactions: DailyTransaction[],
  month: string,
): VndAmount {
  return transactions.reduce(
    (sum, transaction) =>
      transaction.date.slice(0, 7) === month ? sum + transaction.amount : sum,
    0,
  );
}

export function sumTransactionsByMonth(
  transactions: DailyTransaction[],
): Map<string, VndAmount> {
  const totals = new Map<string, VndAmount>();

  for (const transaction of transactions) {
    const key = transaction.date.slice(0, 7);
    totals.set(key, (totals.get(key) ?? 0) + transaction.amount);
  }

  return totals;
}

export function getContributedNet(record: MonthlyRecord): VndAmount {
  if (record.mode === "MANUAL") {
    return record.manualNetBalance ?? 0;
  }

  return 0;
}

export function computeVaultBalance(
  initialSavingsFund: VndAmount,
  records: MonthlyRecord[],
): VndAmount {
  return records.reduce(
    (vault, record) => vault + getContributedNet(record),
    Math.max(0, initialSavingsFund),
  );
}

export interface ResolveMonthlyLedgerInput {
  initialSavingsFund: VndAmount;
  records: MonthlyRecord[];
  transactions?: DailyTransaction[];
}

/**
 * Resolves the 12-month ledger with live AUTO balances, signed manual
 * overrides and the cumulative savings vault after every month.
 */
export function resolveMonthlyLedger(
  input: ResolveMonthlyLedgerInput,
): MonthlyLedgerSummary {
  const initialFund = Math.max(0, Math.round(input.initialSavingsFund));
  const transactions = input.transactions ?? [];
  const spentByMonth = sumTransactionsByMonth(transactions);
  const sorted = [...input.records].sort(
    (left, right) => left.monthIndex - right.monthIndex,
  );

  let cumulative = initialFund;
  let totalDelta = 0;
  let positiveMonths = 0;
  let negativeMonths = 0;
  let settledMonths = 0;
  let year = sorted[0]?.year ?? new Date().getFullYear();

  const records: MonthlyRecordResolved[] = sorted.map((record) => {
    year = record.year;
    const spent = spentByMonth.get(record.month) ?? 0;
    const netBalance =
      record.mode === "AUTO" ? record.income - spent : record.manualNetBalance ?? 0;
    const totalSpent =
      record.mode === "AUTO"
        ? spent
        : record.manualNetBalance !== null && record.income > 0
          ? Math.max(0, record.income - record.manualNetBalance)
          : 0;
    const contributedNet = getContributedNet(record);

    cumulative += contributedNet;
    totalDelta += contributedNet;

    if (contributedNet > 0) positiveMonths += 1;
    if (contributedNet < 0) negativeMonths += 1;
    if (record.isSettled) settledMonths += 1;

    return {
      ...record,
      totalSpent,
      netBalance,
      contributedNet,
      cumulativeVault: cumulative,
    };
  });

  return {
    year,
    initialFund,
    records,
    totalDelta,
    currentVault: cumulative,
    positiveMonths,
    negativeMonths,
    settledMonths,
  };
}
