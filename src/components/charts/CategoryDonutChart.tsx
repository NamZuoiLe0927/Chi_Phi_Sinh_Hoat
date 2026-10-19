"use client";

import { PieChart } from "lucide-react";
import {
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
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
import { formatCompactVnd, formatPercentage, formatVnd } from "@/lib/utils";
import type { CategoryDistributionDatum } from "@/types/living-cost.types";

interface CategoryDonutChartProps {
  data: CategoryDistributionDatum[];
  totalExpense: number;
  monthlyIncome: number;
  centerValue?: string;
  centerLabel?: string;
}

export function CategoryDonutChart({
  data,
  totalExpense,
  monthlyIncome,
  centerValue,
  centerLabel,
}: CategoryDonutChartProps) {
  const mounted = useMounted();
  const usageRate = monthlyIncome > 0 ? (totalExpense / monthlyIncome) * 100 : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-emerald-400" />
              Cơ cấu chi phí
            </CardTitle>
            <CardDescription>
              Tỷ trọng từng nhóm trên tổng dự toán tháng
            </CardDescription>
          </div>
          <span className="rounded-full border border-slate-700 bg-slate-800/70 px-2.5 py-1 text-[11px] font-medium text-slate-300">
            {formatCompactVnd(totalExpense)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {!mounted ? (
          <ChartSkeleton className="h-[210px]" />
        ) : data.length === 0 ? (
          <div className="flex h-[210px] items-center justify-center rounded-xl border border-dashed border-slate-700 text-sm text-slate-500">
            Chưa có khoản chi nào đang bật
          </div>
        ) : (
          <>
            <div className="relative h-[210px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="62%"
                    outerRadius="88%"
                    paddingAngle={2}
                    stroke="none"
                  >
                    {data.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [
                      formatVnd(Number(value)),
                      name ? String(name) : "Chi phí",
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
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold tracking-tight text-slate-50">
                  {centerValue ?? formatPercentage(usageRate, 0)}
                </span>
                <span className="mt-1 max-w-[120px] text-center text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  {centerLabel ?? "thu nhập đã dùng"}
                </span>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
              {data.map((entry) => (
                <div
                  key={entry.name}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <span className="flex min-w-0 items-center gap-2 text-slate-400">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="truncate">{entry.name}</span>
                  </span>
                  <span className="shrink-0 font-medium text-slate-200">
                    {formatPercentage(entry.percentage, 0)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
