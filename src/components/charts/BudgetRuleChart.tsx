"use client";

import { Gauge } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
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
import type { BudgetRuleComparisonDatum } from "@/types/living-cost.types";

interface BudgetRuleChartProps {
  data: BudgetRuleComparisonDatum[];
}

const CHART_COLORS = {
  needs: "#10b981",
  wants: "#f59e0b",
  savings: "#38bdf8",
  over: "#f43f5e",
  targetNeeds: "#10b98155",
  targetWants: "#f59e0b55",
  targetSavings: "#38bdf855",
};

export function BudgetRuleChart({ data }: BudgetRuleChartProps) {
  const mounted = useMounted();
  const byGroup = new Map(data.map((entry) => [entry.groupCode, entry]));
  const needs = byGroup.get("NEEDS");
  const wants = byGroup.get("WANTS");
  const savings = byGroup.get("SAVINGS_DEBT");

  const chartData = [
    {
      name: "Thực tế",
      needs: needs?.actualPercentage ?? 0,
      wants: wants?.actualPercentage ?? 0,
      savings: savings?.actualPercentage ?? 0,
    },
    {
      name: "Mục tiêu",
      needs: needs?.targetPercentage ?? 50,
      wants: wants?.targetPercentage ?? 30,
      savings: savings?.targetPercentage ?? 20,
    },
  ];

  const actualTotal = chartData[0].needs + chartData[0].wants + chartData[0].savings;
  const maxDomain = Math.max(100, Math.ceil((actualTotal + 5) / 10) * 10);
  const warnings = [
    needs?.isOver
      ? "Thiết yếu vượt 60% — chi phí cố định đang tạo áp lực lớn."
      : null,
    wants?.isOver
      ? "Mong muốn vượt 30% — nên ưu tiên cắt giảm các khoản linh hoạt."
      : null,
    savings?.isOver
      ? "Tiết kiệm dưới 20% — chưa đạt mục tiêu tích lũy tối thiểu."
      : null,
  ].filter((warning): warning is string => Boolean(warning));

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-amber-400" />
              Quy tắc 50/30/20
            </CardTitle>
            <CardDescription>
              So sánh tỷ trọng thực tế với chuẩn tài chính
            </CardDescription>
          </div>
          <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-300">
            {formatPercent(actualTotal)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {!mounted ? (
          <ChartSkeleton className="h-[190px]" />
        ) : (
          <>
            <div className="h-[190px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 4, right: 12, bottom: 4, left: 0 }}
                  barSize={22}
                >
                  <CartesianGrid
                    horizontal={false}
                    stroke="#1e293b"
                    strokeDasharray="3 3"
                  />
                  <XAxis type="number" domain={[0, maxDomain]} hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={58}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                  />
                  <ReferenceLine
                    x={100}
                    stroke="#64748b"
                    strokeDasharray="4 4"
                  />
                  <Tooltip
                    cursor={{ fill: "#1e293b44" }}
                    formatter={(value, name) => [
                      `${Number(value).toFixed(1)}%`,
                      String(name),
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
                  <Bar dataKey="needs" stackId="actual" name="Thiết yếu">
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`needs-${entry.name}`}
                        fill={
                          index === 0
                            ? needs?.isOver
                              ? CHART_COLORS.over
                              : CHART_COLORS.needs
                            : CHART_COLORS.targetNeeds
                        }
                      />
                    ))}
                  </Bar>
                  <Bar dataKey="wants" stackId="actual" name="Mong muốn">
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`wants-${entry.name}`}
                        fill={
                          index === 0
                            ? wants?.isOver
                              ? CHART_COLORS.over
                              : CHART_COLORS.wants
                            : CHART_COLORS.targetWants
                        }
                      />
                    ))}
                  </Bar>
                  <Bar dataKey="savings" stackId="actual" name="Tiết kiệm">
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`savings-${entry.name}`}
                        fill={
                          index === 0
                            ? CHART_COLORS.savings
                            : CHART_COLORS.targetSavings
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-slate-400">
              <LegendDot color={CHART_COLORS.needs} label="Thiết yếu" />
              <LegendDot color={CHART_COLORS.wants} label="Mong muốn" />
              <LegendDot color={CHART_COLORS.savings} label="Tiết kiệm" />
              <span className="ml-auto text-slate-500">
                Thực tế · Mục tiêu
              </span>
            </div>

            {warnings.length > 0 && (
              <div className="space-y-1.5 rounded-xl border border-rose-500/20 bg-rose-500/[0.07] p-3">
                {warnings.map((warning) => (
                  <p
                    key={warning}
                    className="flex gap-2 text-[11px] leading-relaxed text-rose-200/90"
                  >
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-rose-400" />
                    {warning}
                  </p>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
