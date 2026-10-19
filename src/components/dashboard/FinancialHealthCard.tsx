"use client";

import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  Flame,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { AnimatedCounter } from "@/components/dashboard/AnimatedCounter";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn, formatPercentage, formatSignedVnd, formatVnd } from "@/lib/utils";
import type {
  FinancialHealthGrade,
  FinancialHealthSnapshot,
  Profile,
} from "@/types/living-cost.types";

interface FinancialHealthCardProps {
  profile: Profile;
  health: FinancialHealthSnapshot;
}

const GRADE_META: Record<
  FinancialHealthGrade,
  { label: string; className: string; barClassName: string }
> = {
  EXCELLENT: {
    label: "Xuất sắc",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    barClassName: "bg-emerald-400",
  },
  GOOD: {
    label: "Tốt",
    className: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
    barClassName: "bg-emerald-400",
  },
  FAIR: {
    label: "Ổn định",
    className: "border-amber-500/25 bg-amber-500/10 text-amber-300",
    barClassName: "bg-amber-400",
  },
  RISKY: {
    label: "Rủi ro",
    className: "border-rose-500/25 bg-rose-500/10 text-rose-300",
    barClassName: "bg-rose-400",
  },
  CRITICAL: {
    label: "Nguy hiểm",
    className: "border-rose-500/30 bg-rose-500/10 text-rose-300",
    barClassName: "bg-rose-400",
  },
};

export function FinancialHealthCard({
  profile,
  health,
}: FinancialHealthCardProps) {
  const grade = GRADE_META[health.healthGrade];
  const isPositive = health.netCashflow >= 0;
  const score = Math.max(0, Math.min(100, health.healthScore));

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <Card className="relative overflow-hidden border-emerald-500/15 bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/35">
        <div className="pointer-events-none absolute -right-20 -top-24 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-44 w-44 rounded-full bg-amber-500/[0.06] blur-3xl" />

        <div className="relative p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
                Sức khỏe tài chính
              </p>
              <h2 className="mt-1 text-lg font-semibold text-slate-50">
                {profile.name}
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                {profile.lifestyle === "FRUGAL"
                  ? "Phong cách tiết kiệm"
                  : profile.lifestyle === "COMFORT"
                    ? "Phong cách thoải mái"
                    : "Phong cách cân bằng"}
                {profile.dependents > 0
                  ? ` · ${profile.dependents} người phụ thuộc`
                  : ""}
              </p>
            </div>

            <div className="text-right">
              <Badge className={cn("border", grade.className)}>
                <Sparkles className="mr-1 h-3 w-3" />
                {grade.label}
              </Badge>
              <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-slate-500">
                Điểm sức khỏe
              </p>
              <p className="text-xl font-bold tabular-nums text-slate-100">
                {Math.round(score)}
                <span className="text-xs font-normal text-slate-500">/100</span>
              </p>
            </div>
          </div>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={cn("h-full rounded-full", grade.barClassName)}
            />
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <MetricTile
              label="Thu nhập"
              value={health.monthlyIncome}
              icon={<Wallet className="h-3.5 w-3.5" />}
              tone="emerald"
            />
            <MetricTile
              label="Dự toán chi"
              value={health.totalPlannedExpense}
              icon={<ArrowDownRight className="h-3.5 w-3.5" />}
              tone="amber"
            />
            <MetricTile
              label="Số dư cuối tháng"
              value={health.netCashflow}
              icon={
                isPositive ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )
              }
              tone={isPositive ? "emerald" : "rose"}
              signed
            />
          </div>

          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-500/15 bg-amber-500/[0.06] px-3 py-3">
            <Flame className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <p className="text-xs leading-relaxed text-amber-100/80">
              Trung bình một ngày mở mắt ra bạn tốn{" "}
              <AnimatedCounter
                value={health.dailyBurnRate}
                formatter={(value) => formatVnd(value)}
                className="font-semibold text-amber-200"
              />{" "}
              cho các khoản đang bật.
            </p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-slate-800 bg-slate-950/45 p-3">
              <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-slate-500">
                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                An toàn/ngày
              </p>
              <p className="mt-1 text-sm font-semibold tabular-nums text-emerald-300">
                {formatVnd(health.safeToSpend.amountPerDay)}
              </p>
              <p className="mt-0.5 text-[10px] text-slate-500">
                còn {health.safeToSpend.remainingDays} ngày
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/45 p-3">
              <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-slate-500">
                {isPositive ? (
                  <TrendingUp className="h-3 w-3 text-emerald-400" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-rose-400" />
                )}
                Tỷ lệ tiết kiệm
              </p>
              <p
                className={cn(
                  "mt-1 text-sm font-semibold tabular-nums",
                  isPositive ? "text-emerald-300" : "text-rose-300",
                )}
              >
                {formatPercentage(health.savingsRate)}
              </p>
              <p className="mt-0.5 text-[10px] text-slate-500">
                mục tiêu {formatVnd(profile.savingsGoalAmount)}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

interface MetricTileProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: "emerald" | "amber" | "rose";
  signed?: boolean;
}

const TONE_CLASSES = {
  emerald: "text-emerald-300",
  amber: "text-amber-300",
  rose: "text-rose-300",
};

function MetricTile({ label, value, icon, tone, signed }: MetricTileProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/45 p-3">
      <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-slate-500">
        {icon}
        {label}
      </p>
      <AnimatedCounter
        value={value}
        formatter={signed ? formatSignedVnd : formatVnd}
        className={cn(
          "mt-1 block text-sm font-semibold tabular-nums",
          TONE_CLASSES[tone],
        )}
      />
    </div>
  );
}
