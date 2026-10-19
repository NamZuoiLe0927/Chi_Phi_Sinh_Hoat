"use client";

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Target,
  TrendingDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLivingCostStore } from "@/store/useLivingCostStore";
import {
  cn,
  formatPercentage,
  formatQuantity,
  formatVnd,
} from "@/lib/utils";
import type { OptimizationResult } from "@/types/living-cost.types";

interface OptimizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: OptimizationResult;
  onApplied?: () => void;
}

export function OptimizationDialog({
  open,
  onOpenChange,
  result,
  onApplied,
}: OptimizationDialogProps) {
  const applyOptimization = useLivingCostStore(
    (state) => state.applyOptimization,
  );
  const revertOptimization = useLivingCostStore(
    (state) => state.revertOptimization,
  );
  const lastOptimizationChanges = useLivingCostStore(
    (state) => state.lastOptimizationChanges,
  );

  function handleApply() {
    if (result.suggestions.length === 0) {
      onOpenChange(false);
      return;
    }

    applyOptimization(result);
    onOpenChange(false);
    onApplied?.();
  }

  function handleRevert() {
    revertOptimization();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            AI tự động tối ưu chi tiêu
          </DialogTitle>
          <DialogDescription>
            Ưu tiên cắt các khoản linh hoạt, giữ nguyên chi phí cố định và
            khoản tiết kiệm theo mặc định.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <SummaryTile
            label="Mục tiêu/tháng"
            value={formatVnd(result.targetMonthlyExpense)}
            icon={<Target className="h-3.5 w-3.5 text-sky-400" />}
          />
          <SummaryTile
            label="Hiện tại"
            value={formatVnd(result.currentMonthlyExpense)}
            icon={<TrendingDown className="h-3.5 w-3.5 text-amber-400" />}
          />
          <SummaryTile
            label="Có thể tiết kiệm"
            value={formatVnd(result.totalMonthlySavings)}
            icon={<Sparkles className="h-3.5 w-3.5 text-emerald-400" />}
            tone="emerald"
          />
          <SummaryTile
            label="Sau tối ưu"
            value={formatVnd(result.achievedMonthlyExpense)}
            icon={
              result.isTargetAchieved ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
              )
            }
            tone={result.isTargetAchieved ? "emerald" : "rose"}
          />
        </div>

        <div
          className={cn(
            "rounded-xl border px-3.5 py-3 text-xs leading-relaxed",
            result.isTargetAchieved
              ? "border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-200/90"
              : "border-rose-500/20 bg-rose-500/[0.07] text-rose-200/90",
          )}
        >
          {result.isTargetAchieved ? (
            <span className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              Đã đạt mục tiêu chi tiêu. Bạn có thể áp dụng ngay các gợi ý bên
              dưới.
            </span>
          ) : (
            <span className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
              Chưa thể đạt mục tiêu nếu giữ nguyên khoản cố định và tiết kiệm.
              Hãy áp dụng các gợi ý linh hoạt rồi điều chỉnh thêm bằng tay.
            </span>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
              Gợi ý cắt giảm ({result.suggestions.length})
            </p>
            {result.suggestions.length > 0 ? (
              <span className="text-[11px] text-emerald-300">
                Tổng tiết kiệm {formatVnd(result.totalMonthlySavings)}
              </span>
            ) : null}
          </div>

          {result.suggestions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/30 px-4 py-8 text-center">
              <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-400" />
              <p className="mt-2 text-sm font-medium text-slate-200">
                Không còn khoản linh hoạt nào để cắt
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Kế hoạch hiện tại đã ở mức tối ưu theo chiến lược đã chọn.
              </p>
            </div>
          ) : (
            result.suggestions.map((suggestion) => (
              <div
                key={suggestion.expenseItemId}
                className="rounded-xl border border-slate-800 bg-slate-950/45 p-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="truncate text-sm font-medium text-slate-100">
                        {suggestion.name}
                      </p>
                      <Badge
                        variant="secondary"
                        className="px-1.5 py-0 text-[9px] font-medium"
                      >
                        {suggestion.groupName}
                      </Badge>
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                      <span>
                        {formatQuantity(suggestion.currentQuantity)} →{" "}
                        <strong className="font-medium text-slate-300">
                          {formatQuantity(suggestion.suggestedQuantity)}
                        </strong>
                      </span>
                      <ArrowRight className="h-3 w-3" />
                      <span className="text-slate-400">
                        -{formatPercentage(suggestion.reductionRate)}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold tabular-nums text-emerald-300">
                      -{formatVnd(suggestion.monthlySavings)}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {formatVnd(suggestion.suggestedMonthlyCost)}/tháng
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <div>
            {lastOptimizationChanges.length > 0 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRevert}
                className="text-slate-400 hover:text-amber-200"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Hoàn tác lần tối ưu gần nhất
              </Button>
            ) : null}
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleApply}
              disabled={result.suggestions.length === 0}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Áp dụng gợi ý
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface SummaryTileProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone?: "default" | "emerald" | "rose";
}

function SummaryTile({
  label,
  value,
  icon,
  tone = "default",
}: SummaryTileProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/45 p-2.5">
      <p className="flex items-center gap-1 text-[9px] uppercase tracking-[0.12em] text-slate-500">
        {icon}
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-xs font-semibold tabular-nums",
          tone === "emerald"
            ? "text-emerald-300"
            : tone === "rose"
              ? "text-rose-300"
              : "text-slate-200",
        )}
      >
        {value}
      </p>
    </div>
  );
}
