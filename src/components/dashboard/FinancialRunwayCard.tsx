"use client";

import {
  Clock3,
  Flame,
  ShieldCheck,
  TrendingDown,
  Wallet,
} from "lucide-react";
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
import { useLivingCostStore } from "@/store/useLivingCostStore";
import { cn, formatVnd } from "@/lib/utils";
import type { RunwayResult, RunwayStatus } from "@/types/living-cost.types";

interface FinancialRunwayCardProps {
  runway: RunwayResult;
  savingsVault: number;
}

const STATUS_META: Record<
  RunwayStatus,
  {
    label: string;
    badgeClass: string;
    barClass: string;
    textClass: string;
    insight: string;
  }
> = {
  DANGER: {
    label: "Nguy hiểm",
    badgeClass: "border-rose-500/30 bg-rose-500/10 text-rose-300",
    barClass: "from-rose-500 to-orange-400",
    textClass: "text-rose-300",
    insight:
      "Quỹ dự phòng dưới 3 tháng chi phí. Hãy ưu tiên tích lũy thêm trước khi nâng cấp lối sống.",
  },
  WARNING: {
    label: "Cần củng cố",
    badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    barClass: "from-amber-500 to-yellow-300",
    textClass: "text-amber-300",
    insight:
      "Bạn có 3–6 tháng đệm. Mục tiêu an toàn là tối thiểu 6 tháng chi phí sinh hoạt.",
  },
  SAFE: {
    label: "An toàn",
    badgeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    barClass: "from-emerald-500 to-teal-300",
    textClass: "text-emerald-300",
    insight:
      "Quỹ dự phòng vượt 6 tháng chi phí. Đây là vùng đệm tốt trước các cú sốc thu nhập.",
  },
};

function formatMonthsDays(months: number, days: number): string {
  if (months <= 0 && days <= 0) return "0 ngày";
  if (months <= 0) return `${days} ngày`;
  if (days <= 0) return `${months} tháng`;
  return `${months} tháng ${days} ngày`;
}

export function FinancialRunwayCard({
  runway,
  savingsVault,
}: FinancialRunwayCardProps) {
  const initialSavingsFund = useLivingCostStore(
    (state) => state.initialSavingsFund,
  );
  const setInitialSavingsFund = useLivingCostStore(
    (state) => state.setInitialSavingsFund,
  );
  const status = STATUS_META[runway.status];
  const gaugePercent = Math.min(
    100,
    Math.max(0, (runway.standard.totalDays / (12 * 30.44)) * 100),
  );

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Độ bền tài chính
            </CardTitle>
            <CardDescription>
              Bạn sống được bao lâu nếu mất thu nhập?
            </CardDescription>
          </div>
          <Badge variant="outline" className={status.badgeClass}>
            {status.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <Label
            htmlFor="current-savings"
            className="flex items-center gap-2 text-xs text-slate-400"
          >
            <Wallet className="h-3.5 w-3.5 text-sky-400" />
            Quỹ tiết kiệm ban đầu
          </Label>
          <div className="relative mt-1.5">
            <Input
              id="current-savings"
              type="number"
              min={0}
              step={1_000_000}
              value={Math.round(initialSavingsFund)}
              onChange={(event) =>
                setInitialSavingsFund(
                  Math.max(0, Number(event.target.value) || 0),
                )
              }
              className="h-10 pr-9 text-sm font-semibold tabular-nums"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
              đ
            </span>
          </div>
          <p className="mt-1.5 text-[10px] leading-relaxed text-slate-500">
            Số dư quỹ hiện tại sau ± các tháng:{" "}
            <strong
              className={cn(
                "font-semibold tabular-nums",
                savingsVault > 0 ? "text-emerald-300" : "text-rose-300",
              )}
            >
              {formatVnd(savingsVault)}
            </strong>
          </p>
        </div>

        <div>
          <div className="mb-2 flex items-end justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                Kịch bản tiêu chuẩn
              </p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-slate-50">
                {formatMonthsDays(
                  runway.standard.months,
                  runway.standard.days,
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                Chi phí/tháng
              </p>
              <p className="mt-1 text-xs font-semibold tabular-nums text-slate-300">
                {formatVnd(runway.standard.monthlyCost)}
              </p>
            </div>
          </div>

          <div className="relative h-2.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className={cn(
                "h-full rounded-full bg-gradient-to-r transition-all duration-500",
                status.barClass,
              )}
              style={{ width: `${gaugePercent}%` }}
            />
            <span
              className="absolute inset-y-0 left-1/4 w-px bg-slate-950/70"
              aria-hidden="true"
            />
            <span
              className="absolute inset-y-0 left-1/2 w-px bg-slate-950/70"
              aria-hidden="true"
            />
          </div>
          <div className="mt-1 flex justify-between text-[9px] text-slate-600">
            <span>0</span>
            <span>3 tháng</span>
            <span>6 tháng</span>
            <span>12 tháng</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
            <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-slate-500">
              <TrendingDown className="h-3 w-3 text-rose-400" />
              Sinh tồn
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-200">
              {formatMonthsDays(runway.survival.months, runway.survival.days)}
            </p>
            <p className="mt-0.5 text-[10px] tabular-nums text-slate-500">
              {formatVnd(runway.survival.monthlyCost)}/tháng
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
            <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-slate-500">
              <Flame className="h-3 w-3 text-amber-400" />
              Mốc an toàn
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-200">
              {runway.safeMonthsThreshold} tháng
            </p>
            <p className="mt-0.5 text-[10px] text-slate-500">
              Cần {formatVnd(runway.standard.monthlyCost * runway.safeMonthsThreshold)}
            </p>
          </div>
        </div>

        <p
          className={cn(
            "rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-[11px] leading-relaxed text-slate-400",
          )}
        >
          <Clock3 className={cn("mr-1 inline h-3 w-3", status.textClass)} />
          {status.insight}
        </p>
      </CardContent>
    </Card>
  );
}
