"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Database, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatVnd } from "@/lib/utils";

interface QuickActionsCardProps {
  targetMonthlyExpense: number;
  totalMonthlySavings: number;
  notice: string | null;
  onOptimize: () => void;
  onExport: () => void;
  onOpenDataManager: () => void;
}

export function QuickActionsCard({
  targetMonthlyExpense,
  totalMonthlySavings,
  notice,
  onOptimize,
  onExport,
  onOpenDataManager,
}: QuickActionsCardProps) {
  return (
    <Card className="border-emerald-500/15 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-emerald-950/30">
      <CardContent className="space-y-2.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400/80">
              Hành động nhanh
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
              Mục tiêu chi tiêu tháng:{" "}
              <span className="text-slate-300">
                {formatVnd(targetMonthlyExpense)}
              </span>
              {totalMonthlySavings > 0 ? (
                <>
                  {" "}
                  · có thể tiết kiệm{" "}
                  <span className="text-emerald-300">
                    {formatVnd(totalMonthlySavings)}
                  </span>
                </>
              ) : null}
            </p>
          </div>
          <Sparkles className="h-4 w-4 shrink-0 text-emerald-400" />
        </div>

        <Button type="button" className="w-full" onClick={onOptimize}>
          <Sparkles className="h-4 w-4" />
          AI tự động tối ưu chi tiêu
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onExport}
        >
          <Download className="h-4 w-4" />
          Xuất kế hoạch (PDF / Excel)
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full text-slate-400"
          onClick={onOpenDataManager}
        >
          <Database className="h-4 w-4" />
          Quản lý dữ liệu & sao lưu
        </Button>

        <AnimatePresence initial={false}>
          {notice ? (
            <motion.div
              key={notice}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              role="status"
              aria-live="polite"
              className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.08] px-3 py-2 text-[11px] leading-relaxed text-emerald-200/90"
            >
              {notice}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
