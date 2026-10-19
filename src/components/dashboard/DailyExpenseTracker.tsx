"use client";

import {
  CalendarDays,
  Check,
  Pencil,
  PiggyBank,
  Plus,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { ExpenseIcon } from "@/components/dashboard/ExpenseIcon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DAILY_EXPENSE_CATEGORIES,
  PAYMENT_SOURCE_OPTIONS,
  QUICK_EXPENSE_PRESETS,
  type QuickExpensePreset,
} from "@/constants/daily-expenses";
import { toLocalISODate } from "@/lib/calculator/date";
import {
  formatTimelineDayLabel,
  getDailyCategoryDefinition,
  getDailyCategoryGroup,
} from "@/lib/daily";
import { cn, formatCompactVnd, formatVnd } from "@/lib/utils";
import { useLivingCostStore } from "@/store/useLivingCostStore";
import type {
  CalendarHeatmapSummary,
  DailyExpenseCategoryCode,
  DailyTransaction,
  PaymentSource,
} from "@/types/living-cost.types";

interface DailyExpenseTrackerProps {
  calendar: CalendarHeatmapSummary;
}

interface DayGroup {
  date: string;
  items: DailyTransaction[];
  total: number;
}

function formatShortDate(isoDate: string): string {
  const [, month, day] = isoDate.split("-");
  return `${day}/${month}`;
}

export function DailyExpenseTracker({ calendar }: DailyExpenseTrackerProps) {
  const transactions = useLivingCostStore((state) => state.transactions);
  const addTransaction = useLivingCostStore((state) => state.addTransaction);
  const updateTransaction = useLivingCostStore(
    (state) => state.updateTransaction,
  );
  const removeTransaction = useLivingCostStore(
    (state) => state.removeTransaction,
  );

  const todayIso = useMemo(() => toLocalISODate(new Date()), []);
  const yesterdayIso = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return toLocalISODate(date);
  }, []);
  const monthStart = `${todayIso.slice(0, 7)}-01`;

  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [categoryCode, setCategoryCode] =
    useState<DailyExpenseCategoryCode>("FOOD");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [paymentSource, setPaymentSource] = useState<PaymentSource>("CASH");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!notice) return;

    const timeout = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const safeByDate = useMemo(
    () =>
      new Map(calendar.days.map((day) => [day.date, day.safeToSpend])),
    [calendar.days],
  );
  const defaultDailySafe = calendar.days[0]?.safeToSpend ?? 0;

  const groups = useMemo<DayGroup[]>(() => {
    const byDate = new Map<string, DailyTransaction[]>();

    for (const transaction of transactions) {
      const existing = byDate.get(transaction.date);
      if (existing) existing.push(transaction);
      else byDate.set(transaction.date, [transaction]);
    }

    return Array.from(byDate.entries())
      .sort(([left], [right]) => (left < right ? 1 : left > right ? -1 : 0))
      .map(([date, items]) => ({
        date,
        items: [...items].sort((a, b) =>
          a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0,
        ),
        total: items.reduce((sum, item) => sum + item.amount, 0),
      }));
  }, [transactions]);

  const selectedDaySpent = useMemo(
    () =>
      transactions.reduce(
        (sum, transaction) =>
          transaction.date === selectedDate ? sum + transaction.amount : sum,
        0,
      ),
    [transactions, selectedDate],
  );
  const selectedDaySafe = safeByDate.get(selectedDate) ?? defaultDailySafe;
  const selectedDayRemaining = selectedDaySafe - selectedDaySpent;

  function handleQuickAdd(preset: QuickExpensePreset) {
    addTransaction({
      title: preset.title,
      amount: preset.amount,
      date: selectedDate,
      paymentMethod: preset.paymentMethod,
      paymentSource: "CASH",
      categoryCode: preset.categoryCode,
      note: preset.note,
      source: "MANUAL",
      expenseItemId: null,
    });
    setNotice(
      `Đã thêm ${preset.emoji} ${preset.title} · ${formatVnd(preset.amount)} vào ${formatShortDate(selectedDate)}.`,
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedAmount = Math.round(Number(amount));

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setNotice("Nhập số tiền lớn hơn 0 trước khi lưu.");
      return;
    }

    const category = getDailyCategoryDefinition(categoryCode);
    const trimmedNote = note.trim();

    addTransaction({
      title: trimmedNote || category.label,
      amount: parsedAmount,
      date: selectedDate,
      paymentMethod: "CASH",
      paymentSource,
      categoryCode,
      note: trimmedNote || null,
      source: "MANUAL",
      expenseItemId: null,
    });

    setAmount("");
    setNote("");
    setNotice(
      `Đã lưu ${category.label.toLowerCase()} · ${formatVnd(parsedAmount)} vào ${formatShortDate(selectedDate)}.`,
    );
  }

  function handleStartNoteEdit(transaction: DailyTransaction) {
    setEditingNoteId(transaction.id);
    setNoteDraft(transaction.note ?? "");
  }

  function handleCommitNote() {
    if (!editingNoteId) return;

    updateTransaction(editingNoteId, { note: noteDraft.trim() || null });
    setEditingNoteId(null);
  }

  function handleRemoveTransaction(id: string) {
    removeTransaction(id);
    if (editingNoteId === id) setEditingNoteId(null);
    setNotice("Đã xóa giao dịch bị nhập nhầm.");
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-sky-400" />
              Sổ chi tiêu hằng ngày
            </CardTitle>
            <CardDescription>
              Chạm gợi ý để thêm nhanh, hoặc ghi chi tiết theo ngày.
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="border-sky-500/30 bg-sky-500/10 text-sky-300"
          >
            {transactions.length} giao dịch
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">
              Chạm để chọn nhanh
            </p>
            <p className="text-[10px] text-slate-500">
              Ngày đang chọn:{" "}
              <strong className="font-semibold text-slate-300">
                {formatShortDate(selectedDate)}
              </strong>
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {QUICK_EXPENSE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleQuickAdd(preset)}
                className="group flex items-center gap-1.5 rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1.5 text-[11px] text-slate-300 transition hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-200"
                title={`Thêm ${preset.title} ${formatVnd(preset.amount)} vào ngày đang chọn`}
              >
                <span aria-hidden="true">{preset.emoji}</span>
                <span>{preset.title}</span>
                <span className="tabular-nums text-slate-500 group-hover:text-emerald-300/80">
                  {formatCompactVnd(preset.amount)}
                </span>
                <Plus className="h-3 w-3 opacity-0 transition group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-2.5 rounded-xl border border-slate-800 bg-slate-950/40 p-3 sm:grid-cols-2"
        >
          <div className="space-y-1">
            <Label htmlFor="daily-date" className="text-[11px] text-slate-400">
              Ngày
            </Label>
            <Input
              id="daily-date"
              type="date"
              min={monthStart}
              max={todayIso}
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-slate-400">Danh mục</Label>
            <Select
              value={categoryCode}
              onValueChange={(value) =>
                setCategoryCode(value as DailyExpenseCategoryCode)
              }
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAILY_EXPENSE_CATEGORIES.map((category) => (
                  <SelectItem key={category.code} value={category.code}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label
              htmlFor="daily-amount"
              className="text-[11px] text-slate-400"
            >
              Số tiền (đ)
            </Label>
            <Input
              id="daily-amount"
              type="number"
              min={1_000}
              step={1_000}
              inputMode="numeric"
              placeholder="VD: 50000"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="h-9 text-xs font-semibold tabular-nums"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-slate-400">Nguồn tiền</Label>
            <div className="flex gap-1.5">
              {PAYMENT_SOURCE_OPTIONS.map((option) => {
                const isActive = paymentSource === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPaymentSource(option.value)}
                    aria-pressed={isActive}
                    title={option.description}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-[10px] font-medium transition",
                      isActive
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                        : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200",
                    )}
                  >
                    {option.value === "SAVINGS" ? (
                      <PiggyBank className="h-3.5 w-3.5" />
                    ) : (
                      <Wallet className="h-3.5 w-3.5" />
                    )}
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1 sm:col-span-2">
            <Label
              htmlFor="daily-note"
              className="text-[11px] text-slate-400"
            >
              Ghi chú
            </Label>
            <Input
              id="daily-note"
              placeholder="VD: Ăn trưa với đồng nghiệp"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 sm:col-span-2">
            <p className="text-[10px] leading-relaxed text-slate-500">
              Định mức ngày:{" "}
              <strong className="font-semibold text-slate-300">
                {formatVnd(selectedDaySafe)}
              </strong>{" "}
              · Đã chi{" "}
              <strong className="font-semibold text-slate-300">
                {formatVnd(selectedDaySpent)}
              </strong>{" "}
              ·{" "}
              <strong
                className={cn(
                  "font-semibold tabular-nums",
                  selectedDayRemaining >= 0
                    ? "text-emerald-300"
                    : "text-rose-300",
                )}
              >
                {selectedDayRemaining >= 0
                  ? `Còn ${formatVnd(selectedDayRemaining)}`
                  : `Vượt ${formatVnd(Math.abs(selectedDayRemaining))}`}
              </strong>
            </p>
            <Button type="submit" size="sm">
              <Plus className="h-3.5 w-3.5" />
              Lưu chi tiêu
            </Button>
          </div>
        </form>

        {notice ? (
          <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.07] px-3 py-2 text-[11px] text-emerald-200">
            {notice}
          </p>
        ) : null}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-200">
              Dòng thời gian chi tiêu
            </h3>
            <span className="text-[10px] text-slate-500">
              Tổng đã ghi:{" "}
              {formatVnd(
                transactions.reduce(
                  (sum, transaction) => sum + transaction.amount,
                  0,
                ),
              )}
            </span>
          </div>

          {groups.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-6 text-center text-xs text-slate-500">
              Chưa có khoản chi nào. Chạm vào gợi ý bên trên hoặc nhập tay để
              bắt đầu.
            </div>
          ) : (
            groups.map((group) => {
              const safe = safeByDate.get(group.date) ?? defaultDailySafe;
              const delta = group.total - safe;
              const isOver = delta > 0;

              return (
                <div
                  key={group.date}
                  className="rounded-xl border border-slate-800/80 bg-slate-950/40"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 px-3 py-2">
                    <div>
                      <p className="text-xs font-semibold text-slate-200">
                        {formatTimelineDayLabel(
                          group.date,
                          todayIso,
                          yesterdayIso,
                        )}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {group.items.length} khoản ·{" "}
                        {formatVnd(group.total)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        isOver
                          ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
                          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
                      )}
                    >
                      {isOver
                        ? `Vượt định mức ${formatVnd(delta)}`
                        : `Trong tầm kiểm soát (+${formatVnd(Math.abs(delta))})`}
                    </Badge>
                  </div>

                  <ul className="divide-y divide-slate-800/60">
                    {group.items.map((transaction) => {
                      const category = getDailyCategoryDefinition(
                        transaction.categoryCode ?? "OTHER",
                      );
                      const isEditing = editingNoteId === transaction.id;

                      return (
                        <li key={transaction.id} className="px-3 py-2">
                          <div className="flex items-start gap-2">
                            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-900">
                              <ExpenseIcon
                                name={category.icon}
                                group={getDailyCategoryGroup(
                                  transaction.categoryCode ?? "OTHER",
                                )}
                                color={category.color}
                              />
                            </span>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <p className="truncate text-xs font-medium text-slate-200">
                                  {transaction.title}
                                </p>
                                {transaction.paymentSource === "SAVINGS" ? (
                                  <Badge
                                    variant="outline"
                                    className="border-amber-500/30 bg-amber-500/10 text-[9px] text-amber-300"
                                  >
                                    Rút quỹ
                                  </Badge>
                                ) : null}
                                <span className="text-[9px] uppercase tracking-wide text-slate-600">
                                  {category.label}
                                </span>
                              </div>

                              {isEditing ? (
                                <div className="mt-1 flex items-center gap-1">
                                  <Input
                                    autoFocus
                                    value={noteDraft}
                                    onChange={(event) =>
                                      setNoteDraft(event.target.value)
                                    }
                                    onKeyDown={(event) => {
                                      if (event.key === "Enter") {
                                        event.preventDefault();
                                        handleCommitNote();
                                      }
                                      if (event.key === "Escape") {
                                        setEditingNoteId(null);
                                      }
                                    }}
                                    className="h-7 text-[11px]"
                                    placeholder="Ghi chú cho khoản chi"
                                  />
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    onClick={handleCommitNote}
                                    aria-label="Lưu ghi chú"
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    onClick={() => setEditingNoteId(null)}
                                    aria-label="Hủy sửa ghi chú"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              ) : (
                                <p className="mt-0.5 text-[10px] text-slate-500">
                                  {transaction.note || "Chưa có ghi chú"}
                                </p>
                              )}
                            </div>

                            <div className="flex shrink-0 items-center gap-0.5">
                              <span className="text-xs font-semibold tabular-nums text-slate-100">
                                {formatVnd(transaction.amount)}
                              </span>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => handleStartNoteEdit(transaction)}
                                aria-label="Sửa ghi chú"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-slate-500 hover:text-rose-300"
                                onClick={() =>
                                  handleRemoveTransaction(transaction.id)
                                }
                                aria-label="Xóa giao dịch"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
