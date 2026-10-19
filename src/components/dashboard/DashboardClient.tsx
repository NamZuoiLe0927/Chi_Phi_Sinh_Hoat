"use client";

import { motion } from "framer-motion";
import { CalendarDays, Sparkles, Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { DailyExpenseTracker } from "@/components/dashboard/DailyExpenseTracker";
import { DataManagerDialog } from "@/components/dashboard/DataManagerDialog";
import { ExpenseBuilder } from "@/components/dashboard/ExpenseBuilder";
import { ExportPlanDialog } from "@/components/dashboard/ExportPlanDialog";
import { FinancialAnalysisTabs } from "@/components/dashboard/FinancialAnalysisTabs";
import { FinancialHealthCard } from "@/components/dashboard/FinancialHealthCard";
import { FinancialRunwayCard } from "@/components/dashboard/FinancialRunwayCard";
import { MonthlySavingsLedger } from "@/components/dashboard/MonthlySavingsLedger";
import { OptimizationDialog } from "@/components/dashboard/OptimizationDialog";
import { QuickActionsCard } from "@/components/dashboard/QuickActionsCard";
import { QuickSetupBar } from "@/components/dashboard/QuickSetupBar";
import { SmartCommandInput } from "@/components/dashboard/SmartCommandInput";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useLivingCostStore } from "@/store/useLivingCostStore";
import { resolveDashboardView } from "@/lib/dashboard-view";
import { formatVnd } from "@/lib/utils";
import type { PlanExportInput } from "@/lib/export-plan";
import type { DashboardViewId } from "@/types/living-cost.types";

const VIEW_META: Record<
  DashboardViewId,
  { title: string; description: string }
> = {
  SETUP: {
    title: "Thiết lập chi phí sinh hoạt",
    description:
      "Chỉnh thu nhập, mục tiêu tiết kiệm và từng khoản chi để bảng dự toán sát với thực tế.",
  },
  HEALTH: {
    title: "Sức khỏe tài chính của bạn",
    description:
      "Dòng tiền ròng, quỹ dự phòng và các cảnh báo an toàn được cập nhật theo kế hoạch hiện tại.",
  },
  ANALYSIS: {
    title: "Trung tâm phân tích",
    description:
      "Cơ cấu chi phí, thói quen chi tiêu theo ngày và giả lập các kịch bản tương lai.",
  },
  LEDGER: {
    title: "Chi Tiêu Theo Ngày",
    description:
      "Chạm để ghi chi tiêu hằng ngày; tháng dư cộng vào quỹ, tháng âm trừ thẳng khỏi két sắt tiết kiệm.",
  },
};

export function DashboardClient() {
  const {
    profile,
    rawExpenseItems,
    expenseItems,
    budgetItems,
    financialHealth,
    categorySummaries,
    distribution,
    budgetComparison,
    workTime,
    calendar,
    spendingProgress,
    optimization,
    ledger,
    savingsVault,
  } = useDashboardData();

  const storedActiveView = useLivingCostStore((state) => state.ui.activeView);
  const activeView = resolveDashboardView(storedActiveView);
  const viewMeta = VIEW_META[activeView];

  const optimizationOpen = useLivingCostStore(
    (state) => state.ui.isOptimizationOpen,
  );
  const setOptimizationOpen = useLivingCostStore(
    (state) => state.setOptimizationOpen,
  );
  const viewMode = useLivingCostStore((state) => state.ui.viewMode);
  const setDataManagerOpen = useLivingCostStore(
    (state) => state.setDataManagerOpen,
  );

  const [exportOpen, setExportOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const monthLabel = new Intl.DateTimeFormat("vi-VN", {
    month: "long",
    year: "numeric",
  }).format(new Date());

  const exportInput = useMemo<PlanExportInput>(
    () => ({
      profile,
      expenseItems,
      financialHealth,
    }),
    [profile, expenseItems, financialHealth],
  );

  useEffect(() => {
    if (!notice) return;

    const timeout = window.setTimeout(() => setNotice(null), 6000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  function handleOptimizationApplied() {
    setNotice(
      "Đã áp dụng gợi ý tối ưu. Mở lại hộp thoại tối ưu nếu bạn muốn hoàn tác.",
    );
  }

  function handleExported(format: "csv" | "pdf") {
    setNotice(
      format === "csv"
        ? "Đã tải file CSV. Mở bằng Excel để xem và chỉnh sửa kế hoạch."
        : "Đã mở bản in PDF. Chọn “Lưu dưới dạng PDF” trong hộp thoại in của trình duyệt.",
    );
  }

  const quickActions = (
    <QuickActionsCard
      targetMonthlyExpense={optimization.targetMonthlyExpense}
      totalMonthlySavings={optimization.totalMonthlySavings}
      notice={notice}
      onOptimize={() => setOptimizationOpen(true)}
      onExport={() => setExportOpen(true)}
      onOpenDataManager={() => setDataManagerOpen(true)}
    />
  );

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-950">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-44 -top-24 h-[28rem] w-[28rem] rounded-full bg-emerald-500/[0.07] blur-3xl" />
        <div className="absolute -right-44 top-1/3 h-[30rem] w-[30rem] rounded-full bg-amber-500/[0.05] blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-sky-500/[0.04] blur-3xl" />
      </div>

      <DashboardHeader />
      <DashboardNav />

      <main className="relative mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
        <motion.div
          key={`hero-${activeView}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="mb-4 flex flex-wrap items-end justify-between gap-3"
        >
          <div>
            <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-400/80">
              <CalendarDays className="h-3.5 w-3.5" />
              Kế hoạch {monthLabel}
            </div>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-50 sm:text-2xl">
              {viewMeta.title}
            </h1>
            <p className="mt-1 max-w-2xl text-xs text-slate-500">
              {viewMeta.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-[11px] text-slate-400">
              <Target className="h-3.5 w-3.5 text-sky-400" />
              Mục tiêu tiết kiệm
              <strong className="font-semibold text-slate-200">
                {formatVnd(profile.savingsGoalAmount)}
              </strong>
              <span className="text-slate-600">/tháng</span>
            </div>

            {viewMode === "WORK_TIME" ? (
              <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.07] px-3 py-1.5 text-[11px] text-emerald-300">
                <Sparkles className="h-3.5 w-3.5" />
                Lương thực tế
                <strong className="font-semibold">
                  {formatVnd(workTime.realHourlyWage)}
                </strong>
                <span className="text-emerald-500/70">/giờ</span>
              </div>
            ) : null}
          </div>
        </motion.div>

        {activeView === "SETUP" ? (
          <motion.div
            key="view-setup"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="grid items-start gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(360px,2fr)]"
          >
            <div className="min-w-0 space-y-5">
              <QuickSetupBar />
              <ExpenseBuilder
                expenseItems={rawExpenseItems}
                computedExpenseItems={expenseItems}
                categorySummaries={categorySummaries}
                realHourlyWage={workTime.realHourlyWage}
                viewMode={viewMode}
              />
            </div>

            <div className="min-w-0 space-y-4">
              <SmartCommandInput spendingProgress={spendingProgress} />
              {quickActions}
            </div>
          </motion.div>
        ) : null}

        {activeView === "HEALTH" ? (
          <motion.div
            key="view-health"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="grid items-start gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(360px,2fr)]"
          >
            <div className="min-w-0 space-y-5">
              <FinancialHealthCard profile={profile} health={financialHealth} />
            </div>

            <div className="min-w-0 space-y-4">
              <FinancialRunwayCard
                runway={financialHealth.runway}
                savingsVault={savingsVault}
              />
              {quickActions}
            </div>
          </motion.div>
        ) : null}

        {activeView === "ANALYSIS" ? (
          <motion.div
            key="view-analysis"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="grid items-start gap-5 xl:grid-cols-[minmax(0,3fr)_minmax(340px,2fr)]"
          >
            <div className="min-w-0">
              <FinancialAnalysisTabs
                distribution={distribution}
                totalExpense={financialHealth.totalPlannedExpense}
                monthlyIncome={financialHealth.monthlyIncome}
                dailyBurnRate={financialHealth.dailyBurnRate}
                budgetComparison={budgetComparison}
                calendar={calendar}
                expenseItems={budgetItems}
              />
            </div>

            <div className="min-w-0 space-y-4">{quickActions}</div>
          </motion.div>
        ) : null}

        {activeView === "LEDGER" ? (
          <motion.div
            key="view-ledger"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]"
          >
            <div className="min-w-0">
              <DailyExpenseTracker calendar={calendar} />
            </div>

            <div className="min-w-0">
              <MonthlySavingsLedger ledger={ledger} />
            </div>
          </motion.div>
        ) : null}

        <footer className="mt-8 border-t border-slate-800/60 py-4 text-center text-[10px] leading-relaxed text-slate-600">
          Dữ liệu được lưu cục bộ trên trình duyệt, không gửi lên máy chủ. Bảng
          dự toán chỉ mang tính tham khảo.
        </footer>
      </main>

      <OptimizationDialog
        open={optimizationOpen}
        onOpenChange={setOptimizationOpen}
        result={optimization}
        onApplied={handleOptimizationApplied}
      />

      <ExportPlanDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        input={exportInput}
        onExported={handleExported}
      />

      <DataManagerDialog />
    </div>
  );
}
