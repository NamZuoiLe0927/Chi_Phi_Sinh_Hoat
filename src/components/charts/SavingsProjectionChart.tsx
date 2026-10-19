"use client";

import { TrendingUp } from "lucide-react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartSkeleton } from "@/components/charts/ChartSkeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMounted } from "@/hooks/useMounted";
import { formatCompactVnd, formatVnd } from "@/lib/utils";
import type { SavingsProjectionDatum } from "@/types/living-cost.types";

interface SavingsProjectionChartProps {
  data: SavingsProjectionDatum[];
  netCashflow: number;
}

export function SavingsProjectionChart({
  data,
  netCashflow,
}: SavingsProjectionChartProps) {
  const mounted = useMounted();
  const finalPoint = data[data.length - 1];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-sky-400" />
              Tích lũy 5 năm
            </CardTitle>
            <CardDescription>
              Dựa trên mức dư hàng tháng + lãi kép 8%/năm
            </CardDescription>
          </div>
          <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-[11px] font-medium text-sky-300">
            {netCashflow > 0 ? `+${formatCompactVnd(netCashflow)}/tháng` : "Chưa tích lũy"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {!mounted ? (
          <ChartSkeleton className="h-[200px]" />
        ) : (
          <>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={data}
                  margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                >
                  <defs>
                    <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    stroke="#1e293b"
                    strokeDasharray="3 3"
                  />
                  <XAxis
                    dataKey="year"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    tickFormatter={(value: number) =>
                      value === 0 ? "Nay" : `Năm ${value}`
                    }
                  />
                  <YAxis
                    width={48}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                    tickFormatter={(value: number) => formatCompactVnd(value)}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      formatVnd(Number(value)),
                      name === "balance" ? "Số dư dự kiến" : "Tiền đã góp",
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
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    fill="url(#savingsGradient)"
                  />
                  <Line
                    type="monotone"
                    dataKey="contributed"
                    stroke="#64748b"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-sky-400" />
                Số dư dự kiến
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-slate-500" />
                Tiền đã góp
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  Sau 5 năm
                </p>
                <p className="mt-1 text-sm font-semibold text-sky-300">
                  {finalPoint ? formatVnd(finalPoint.balance) : formatVnd(0)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  Tiền lãi
                </p>
                <p className="mt-1 text-sm font-semibold text-emerald-300">
                  {finalPoint ? formatVnd(finalPoint.interest) : formatVnd(0)}
                </p>
              </div>
            </div>

            {netCashflow <= 0 && (
              <p className="rounded-xl border border-amber-500/20 bg-amber-500/[0.07] p-3 text-[11px] leading-relaxed text-amber-200/90">
                Số dư hàng tháng đang âm hoặc bằng 0. Hãy tối ưu chi tiêu để
                bắt đầu tích lũy.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
