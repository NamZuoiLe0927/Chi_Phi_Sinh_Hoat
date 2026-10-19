"use client";

import { CalendarDays, Flame, Sparkles, Star, TrendingUp } from "lucide-react";
import type { CSSProperties } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn, formatCompactVnd, formatVnd } from "@/lib/utils";
import type {
  CalendarDay,
  CalendarHeatmapSummary,
} from "@/types/living-cost.types";

interface SpendingCalendarHeatmapProps {
  summary: CalendarHeatmapSummary;
}

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function getCellStyle(day: CalendarDay): CSSProperties {
  if (day.status === "FUTURE") {
    return {};
  }

  if (day.status === "NO_SPEND") {
    return {
      backgroundColor: "rgba(16, 185, 129, 0.08)",
      borderColor: "rgba(52, 211, 153, 0.35)",
    };
  }

  if (day.status === "OVER_BUDGET") {
    return {
      backgroundColor: `rgba(244, 63, 94, ${0.12 + day.intensity * 0.5})`,
      borderColor: "rgba(251, 113, 133, 0.4)",
    };
  }

  return {
    backgroundColor: `rgba(16, 185, 129, ${0.1 + day.intensity * 0.45})`,
    borderColor: "rgba(52, 211, 153, 0.28)",
  };
}

function statusLabel(day: CalendarDay): string {
  if (day.status === "FUTURE") return "Chưa tới";
  if (day.status === "NO_SPEND") return "Không chi tiêu";
  if (day.status === "OVER_BUDGET") return "Vượt định mức";
  return "Trong định mức";
}

export function SpendingCalendarHeatmap({
  summary,
}: SpendingCalendarHeatmapProps) {
  const firstDay = new Date(summary.year, summary.month - 1, 1);
  const leadingEmptyDays = (firstDay.getDay() + 6) % 7;
  const monthLabel = new Intl.DateTimeFormat("vi-VN", {
    month: "long",
    year: "numeric",
  }).format(firstDay);
  const elapsedDays = summary.days.filter(
    (day) => day.status !== "FUTURE",
  ).length;
  const dailyReference =
    summary.days.find((day) => day.safeToSpend > 0)?.safeToSpend ?? 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] p-3">
          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-emerald-300/70">
            <Flame className="h-3 w-3" />
            Saving streak
          </p>
          <p className="mt-1 text-xl font-bold text-emerald-300">
            {summary.savingStreak.current} ngày
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500">
            Kỷ lục {summary.savingStreak.longest} ngày
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-slate-500">
            <Star className="h-3 w-3 text-amber-300" />
            Ngày không chi
          </p>
          <p className="mt-1 text-xl font-bold text-amber-300">
            {summary.noSpendDays} ngày
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500">
            Trên {elapsedDays} ngày đã qua
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-slate-500">
            <TrendingUp className="h-3 w-3 text-sky-300" />
            Đã chi tháng này
          </p>
          <p className="mt-1 text-xl font-bold text-slate-100">
            {formatCompactVnd(summary.totalSpent)}
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500">
            TB {formatCompactVnd(summary.averagePerDay)}/ngày
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-slate-500">
            <CalendarDays className="h-3 w-3 text-violet-300" />
            Vượt định mức
          </p>
          <p className="mt-1 text-xl font-bold text-rose-300">
            {summary.overBudgetDays} ngày
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500">
            Định mức {formatCompactVnd(dailyReference)}/ngày
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold capitalize text-slate-200">
              {monthLabel}
            </p>
            <p className="text-[10px] text-slate-500">
              Mỗi ô là một ngày, màu càng đậm càng chi nhiều so với định mức
            </p>
          </div>
          <Sparkles className="h-4 w-4 text-emerald-400/70" />
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {WEEKDAYS.map((weekday) => (
            <div
              key={weekday}
              className="pb-1 text-center text-[9px] font-medium uppercase tracking-[0.12em] text-slate-600"
            >
              {weekday}
            </div>
          ))}

          {Array.from({ length: leadingEmptyDays }).map((_, index) => (
            <div key={`empty-${index}`} aria-hidden="true" />
          ))}

          {summary.days.map((day) => (
            <div
              key={day.date}
              className={cn(
                "relative flex min-h-[54px] flex-col justify-between rounded-lg border p-1.5 transition-transform hover:scale-[1.03]",
                day.status === "FUTURE" &&
                  "border-slate-800/60 bg-slate-950/25 text-slate-700",
                day.status === "NO_SPEND" &&
                  "border-emerald-400/30 text-emerald-200",
                day.status === "WITHIN_BUDGET" &&
                  "border-emerald-500/20 text-emerald-100",
                day.status === "OVER_BUDGET" &&
                  "border-rose-500/30 text-rose-100",
                day.isToday && "ring-2 ring-sky-400/70 ring-offset-1 ring-offset-slate-950",
              )}
              style={getCellStyle(day)}
              title={`${day.date}: ${statusLabel(day)} · ${formatVnd(day.totalSpent)}`}
            >
              <div className="flex items-start justify-between gap-0.5">
                <span className="text-[10px] font-semibold tabular-nums">
                  {day.dayOfMonth}
                </span>
                {day.status === "NO_SPEND" ? (
                  <Star className="h-2.5 w-2.5 fill-amber-300 text-amber-300" />
                ) : null}
                {day.isToday ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                ) : null}
              </div>
              {day.status !== "FUTURE" && day.totalSpent > 0 ? (
                <span className="text-right text-[9px] font-medium tabular-nums opacity-80">
                  {formatCompactVnd(day.totalSpent)}
                </span>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm border border-emerald-400/35 bg-emerald-500/10" />
            Không chi
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500/40" />
            Trong định mức
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-rose-500/50" />
            Vượt định mức
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm border border-slate-800 bg-slate-950/30" />
            Chưa tới
          </span>
        </div>
      </div>
    </div>
  );
}
