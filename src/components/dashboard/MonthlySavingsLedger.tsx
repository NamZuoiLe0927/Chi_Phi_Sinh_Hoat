"use client";

import {
  BarChart3,
  Lock,
  LockOpen,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Vault,
} from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartSkeleton } from "@/components/charts/ChartSkeleton";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMounted } from "@/hooks/useMounted";
import {
  formatMonthLabel,
  formatMonthShortLabel,
  getMonthKeyFromDate,
} from "@/lib/calculator/ledger";
import {
  cn,
  formatCompactVnd,
  formatSignedVnd,
  formatVnd,
} from "@/lib/utils";
import { useLivingCostStore } from "@/store/useLivingCostStore";
import type {
  MonthlyLedgerSummary,
  MonthlyRecordResolved,
} from "@/types/living-cost.types";

interface MonthlySavingsLedgerProps {
  ledger: MonthlyLedgerSummary;
}

interface ChartDatum {
  label: string;
  net: number;
  vault: number;
}

function MonthCard({ record }: { record: MonthlyRecordResolved }) {
  const updateMonthlyRecord = useLivingCostStore(
    (state) => state.updateMonthlyRecord,
  );
  const currentMonthKey = getMonthKeyFromDate(new Date());
  const isCurrent = record.month === currentMonthKey;
  const isPositive = record.netBalance >= 0;

  return (
    <div
      className={cn(
        "rounded-xl border p-3 transition",
        isCurrent
          ? "border-emerald-500/40 bg-emerald-500/[0.05] ring-1 ring-emerald-500/20"
          : "border-slate-800 bg-slate-950/40",
        record.isSettled && !isCurrent && "bg-slate-900/60",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1">
            <p className="text-xs font-semibold text-slate-200">
              {formatMonthLabel(record.monthIndex)}
            </p>
            {isCurrent ? (
              <Badge
                variant="outline"
                className="border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0 text-[8px] text-emerald-300"
              >
                Hiện tại
              </Badge>
            ) : null}
            {record.isSettled ? (
              <Badge
                variant="outline"
                className="border-sky-500/30 bg-sky-500/10 px-1.5 py-0 text-[8px] text-sky-300"
              >
                Đã chốt
              </Badge>
            ) : null}
          </div>
          <p className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-slate-600">
            {record.mode === "AUTO" ? "Tự động theo ghi chép" : "Tự ghi âm / dương"}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            updateMonthlyRecord(record.month, {
              isSettled: !record.isSettled,
            })
          }
          title={record.isSettled ? "Mở khóa tháng" : "Chốt sổ tháng"}
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition",
            record.isSettled
              ? "border-sky-500/30 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20"
              : "border-slate-800 bg-slate-900 text-slate-500 hover:border-slate-700 hover:text-slate-300",
          )}
        >
          {record.isSettled ? (
            <LockOpen className="h-3.5 w-3.5" />
          ) : (
            <Lock className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      <div className="mt-2 flex items-end justify-between gap-2">
        <div>
          <p className="text-[9px] uppercase tracking-[0.14em] text-slate-600">
            Số dư tháng
          </p>
          <p
            className={cn(
              "text-lg font-bold tracking-tight tabular-nums",
              isPositive ? "text-emerald-300" : "text-rose-300",
            )}
          >
            {formatSignedVnd(record.netBalance)}
          </p>
        </div>
        {isCurrent && record.mode === "AUTO" ? (
          <span className="text-[9px] text-slate-500">
            {record.isSettled ? "đã chốt" : "dự kiến"}
          </span>
        ) : null}
      </div>

      <div className="mt-2 space-y-1.5">
        {isCurrent ? (
          <div className="flex rounded-lg border border-slate-800 bg-slate-950/60 p-0.5">
            {(["AUTO", "MANUAL"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                disabled={record.isSettled}
                onClick={() =>
                  updateMonthlyRecord(record.month, { mode })
                }
                className={cn(
                  "flex-1 rounded-md px-2 py-1 text-[9px] font-semibold uppercase tracking-wide transition disabled:opacity-50",
                  record.mode === mode
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "text-slate-500 hover:text-slate-300",
                )}
              >
                {mode === "AUTO" ? "Tự động" : "Tự ghi"}
              </button>
            ))}
          </div>
        ) : null}

        {record.mode === "AUTO" ? (
          <>
            <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500">
              <span>Thu nhập</span>
              <span className="font-semibold tabular-nums text-slate-300">
                {formatVnd(record.income)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500">
              <span>Chi tiêu ghi chép</span>
              <span className="font-semibold tabular-nums text-slate-300">
                {formatVnd(record.totalSpent)}
              </span>
            </div>
            <Input
              type="number"
              min={0}
              step={1_000_000}
              value={Math.round(record.income)}
              disabled={record.isSettled}
              onChange={(event) =>
                updateMonthlyRecord(record.month, {
                  income: Math.max(0, Number(event.target.value) || 0),
                })
              }
              className="h-8 text-[11px] font-semibold tabular-nums"
              aria-label={`Thu nhập thực tế tháng ${record.monthIndex}`}
            />
          </>
        ) : (
          <div className="space-y-1">
            <Label className="text-[9px] uppercase tracking-[0.12em] text-slate-600">
              Nhập số âm / dương (đ)
            </Label>
            <Input
              type="number"
              step={100_000}
              placeholder="VD: -2500000"
              value={record.manualNetBalance ?? ""}
              disabled={record.isSettled}
              onChange={(event) =>
                updateMonthlyRecord(record.month, {
                  manualNetBalance:
                    event.target.value === ""
                      ? null
                      : Math.round(Number(event.target.value) || 0),
                })
              }
              className="h-8 text-[11px] font-semibold tabular-nums"
              aria-label={`Số dư thủ công tháng ${record.monthIndex}`}
            />
          </div>
        )}

        <Input
          placeholder="Ghi chú lý do..."
          value={record.note}
          disabled={record.isSettled}
          onChange={(event) =>
            updateMonthlyRecord(record.month, { note: event.target.value })
          }
          className="h-8 text-[11px]"
          aria-label={`Ghi chú tháng ${record.monthIndex}`}
        />
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 border-t border-slate-800/70 pt-2">
        <span className="text-[9px] uppercase tracking-[0.12em] text-slate-600">
          Quỹ sau tháng
        </span>
        <span
          className={cn(
            "text-[11px] font-semibold tabular-nums",
            record.cumulativeVault >= 0
              ? "text-slate-200"
              : "text-rose-300",
          )}
        >
          {formatVnd(record.cumulativeVault)}
        </span>
      </div>
    </div>
  );
}

export function MonthlySavingsLedger({ ledger }: MonthlySavingsLedgerProps) {
  const mounted = useMounted();
  const initialSavingsFund = useLivingCostStore(
    (state) => state.initialSavingsFund,
  );
  const setInitialSavingsFund = useLivingCostStore(
    (state) => state.setInitialSavingsFund,
  );

  const chartData = useMemo<ChartDatum[]>(
    () =>
      ledger.records.map((record) => ({
        label: formatMonthShortLabel(record.monthIndex),
        net: record.netBalance,
        vault: record.cumulativeVault,
      })),
    [ledger.records],
  );

  const isCritical = ledger.currentVault <= 0;
  const isWarning =
    !isCritical &&
    ledger.currentVault < Math.max(1, ledger.initialFund * 0.2);

  return (
    <div className="space-y-4">
      <Card
        className={cn(
          "overflow-hidden",
          isCritical && "border-rose-500/30",
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Vault className="h-4 w-4 text-amber-400" />
                Két sắt Quỹ Tiết Kiệm
              </CardTitle>
              <CardDescription>
                Tháng dương cộng vào quỹ, tháng âm trừ thẳng khỏi quỹ.
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="border-amber-500/30 bg-amber-500/10 text-amber-300"
            >
              Năm {ledger.year}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
              <p className="text-[9px] uppercase tracking-[0.14em] text-slate-500">
                Quỹ gốc ban đầu
              </p>
              <div className="relative mt-1">
                <Input
                  type="number"
                  min={0}
                  step={1_000_000}
                  value={Math.round(initialSavingsFund)}
                  onChange={(event) =>
                    setInitialSavingsFund(
                      Math.max(0, Number(event.target.value) || 0),
                    )
                  }
                  className="h-9 pr-7 text-sm font-semibold tabular-nums"
                  aria-label="Quỹ gốc ban đầu"
                />
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">
                  đ
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
              <p className="flex items-center gap-1 text-[9px] uppercase tracking-[0.14em] text-slate-500">
                {ledger.totalDelta >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-emerald-400" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-rose-400" />
                )}
                Biến động tích lũy
              </p>
              <p
                className={cn(
                  "mt-1 text-lg font-bold tabular-nums",
                  ledger.totalDelta >= 0
                    ? "text-emerald-300"
                    : "text-rose-300",
                )}
              >
                {formatSignedVnd(ledger.totalDelta)}
              </p>
              <p className="text-[10px] text-slate-500">
                {ledger.positiveMonths} tháng dương · {ledger.negativeMonths}{" "}
                tháng âm
              </p>
            </div>

            <div
              className={cn(
                "rounded-xl border p-3",
                isCritical
                  ? "border-rose-500/40 bg-rose-500/[0.08]"
                  : isWarning
                    ? "border-amber-500/40 bg-amber-500/[0.08]"
                    : "border-emerald-500/30 bg-emerald-500/[0.06]",
              )}
            >
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Số dư quỹ thực tế
              </p>
              <p
                className={cn(
                  "mt-1 text-2xl font-bold tracking-tight tabular-nums",
                  isCritical
                    ? "text-rose-300"
                    : isWarning
                      ? "text-amber-300"
                      : "text-emerald-300",
                )}
              >
                {formatVnd(ledger.currentVault)}
              </p>
              <p className="text-[10px] text-slate-500">
                {ledger.settledMonths} tháng đã chốt sổ
              </p>
            </div>
          </div>

          {isCritical ? (
            <p className="rounded-xl border border-rose-500/30 bg-rose-500/[0.08] p-3 text-[11px] leading-relaxed text-rose-200">
              ⚠️ Quỹ tiết kiệm đã cạn hoặc đang âm. Hãy giảm chi tiêu, nhập
              thêm quỹ gốc hoặc điều chỉnh các tháng âm ngay hôm nay.
            </p>
          ) : null}

          {isWarning ? (
            <p className="rounded-xl border border-amber-500/30 bg-amber-500/[0.08] p-3 text-[11px] leading-relaxed text-amber-200">
              ⚠️ Quỹ chỉ còn dưới 20% so với quỹ gốc. Hạn chế rút quỹ cho các
              khoản không thiết yếu để giữ vùng đệm an toàn.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-sky-400" />
                Biểu đồ 12 tháng âm / dương
              </CardTitle>
              <CardDescription>
                Cột xanh = tháng dư, cột đỏ = tháng âm; đường vàng = quỹ lũy
                kế.
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="border-slate-700 bg-slate-900/60 text-slate-400"
            >
              <PiggyBank className="mr-1 h-3 w-3" />
              {formatCompactVnd(ledger.currentVault)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {!mounted ? (
            <ChartSkeleton className="h-[240px]" />
          ) : (
            <>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={chartData}
                    margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      stroke="#1e293b"
                      strokeDasharray="3 3"
                    />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 10 }}
                    />
                    <YAxis
                      width={48}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 10 }}
                      tickFormatter={(value: number) =>
                        formatCompactVnd(value)
                      }
                    />
                    <ReferenceLine y={0} stroke="#475569" />
                    <Tooltip
                      cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
                      formatter={(value, name) => [
                        name === "vault"
                          ? formatVnd(Number(value))
                          : formatSignedVnd(Number(value)),
                        name === "vault" ? "Quỹ lũy kế" : "Âm / Dương tháng",
                      ]}
                      contentStyle={{
                        background: "#0f172a",
                        border: "1px solid #334155",
                        borderRadius: 12,
                        color: "#e2e8f0",
                        fontSize: 12,
                      }}
                      itemStyle={{ color: "#e2e8f0" }}
                    />
                    <Bar
                      dataKey="net"
                      name="Âm / Dương tháng"
                      radius={[4, 4, 0, 0]}
                    >
                      {chartData.map((entry) => (
                        <Cell
                          key={entry.label}
                          fill={entry.net >= 0 ? "#10b981" : "#f43f5e"}
                        />
                      ))}
                    </Bar>
                    <Line
                      type="monotone"
                      dataKey="vault"
                      name="Quỹ lũy kế"
                      stroke="#facc15"
                      strokeWidth={2}
                      dot={{ r: 2, fill: "#facc15" }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Tháng dương
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                  Tháng âm
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  Quỹ lũy kế
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="h-4 w-4 text-emerald-400" />
                Sổ 12 tháng âm / dương
              </CardTitle>
              <CardDescription>
                Tháng hiện tại tự động lấy thu nhập trừ chi tiêu đã ghi; các
                tháng khác nhập trực tiếp số âm hoặc dương.
              </CardDescription>
            </div>
            <span className="text-[10px] text-slate-500">
              Quỹ hiện tại:{" "}
              <strong className="font-semibold text-slate-300">
                {formatVnd(ledger.currentVault)}
              </strong>
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {ledger.records.map((record) => (
              <MonthCard key={record.id} record={record} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
