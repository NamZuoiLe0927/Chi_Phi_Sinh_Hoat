"use client";

import { BarChart3, CalendarHeart, LineChart, Sparkles } from "lucide-react";
import { CategoryDonutChart } from "@/components/charts/CategoryDonutChart";
import { BudgetRuleChart } from "@/components/charts/BudgetRuleChart";
import { SpendingCalendarHeatmap } from "@/components/dashboard/SpendingCalendarHeatmap";
import { WhatIfSimulatorPanel } from "@/components/dashboard/WhatIfSimulatorModal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useLivingCostStore } from "@/store/useLivingCostStore";
import { formatCompactVnd } from "@/lib/utils";
import type {
  AnalysisTabId,
  BudgetRuleComparisonDatum,
  CalendarHeatmapSummary,
  CategoryDistributionDatum,
  ExpenseItem,
} from "@/types/living-cost.types";

interface FinancialAnalysisTabsProps {
  distribution: CategoryDistributionDatum[];
  totalExpense: number;
  monthlyIncome: number;
  dailyBurnRate: number;
  budgetComparison: BudgetRuleComparisonDatum[];
  calendar: CalendarHeatmapSummary;
  expenseItems: ExpenseItem[];
}

const ANALYSIS_TABS: Array<{
  id: AnalysisTabId;
  label: string;
  shortLabel: string;
  emoji: string;
}> = [
  {
    id: "SPENDING",
    label: "Phân tích Chi phí",
    shortLabel: "Chi phí",
    emoji: "📊",
  },
  {
    id: "HISTORY",
    label: "Lịch sử & Thói quen",
    shortLabel: "Thói quen",
    emoji: "🔥",
  },
  {
    id: "SIMULATOR",
    label: "Giả lập Tương lai",
    shortLabel: "Tương lai",
    emoji: "🔮",
  },
];

export function FinancialAnalysisTabs({
  distribution,
  totalExpense,
  monthlyIncome,
  dailyBurnRate,
  budgetComparison,
  calendar,
  expenseItems,
}: FinancialAnalysisTabsProps) {
  const activeTab = useLivingCostStore((state) => state.ui.activeTab);
  const setActiveTab = useLivingCostStore((state) => state.setActiveTab);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-400" />
              Trung tâm phân tích
            </CardTitle>
            <CardDescription>
              Chi phí, thói quen chi tiêu và kịch bản tương lai trong một nơi
            </CardDescription>
          </div>
          <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-[10px] font-medium text-violet-300">
            {formatCompactVnd(dailyBurnRate)}/ngày
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as AnalysisTabId)}
        >
          <TabsList className="grid h-auto w-full grid-cols-3 gap-1 p-1.5">
            {ANALYSIS_TABS.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="h-auto flex-col gap-0.5 px-2 py-2 text-[11px] sm:flex-row sm:gap-1.5 sm:text-xs"
              >
                <span aria-hidden="true">{tab.emoji}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="SPENDING" className="mt-3">
            <div className="grid gap-3 xl:grid-cols-2">
              <CategoryDonutChart
                data={distribution}
                totalExpense={totalExpense}
                monthlyIncome={monthlyIncome}
                centerValue={formatCompactVnd(dailyBurnRate)}
                centerLabel="định mức/ngày"
              />
              <BudgetRuleChart data={budgetComparison} />
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-600">
              <BarChart3 className="h-3 w-3" />
              Vòng tròn hiển thị cơ cấu chi phí; biểu đồ thanh so sánh với quy
              tắc 50/30/20.
            </div>
          </TabsContent>

          <TabsContent value="HISTORY" className="mt-3">
            <SpendingCalendarHeatmap summary={calendar} />
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-600">
              <CalendarHeart className="h-3 w-3" />
              Chuỗi ngày không vượt định mức được tính từ đầu tháng đến hôm nay.
            </div>
          </TabsContent>

          <TabsContent
            value="SIMULATOR"
            className="mt-3 data-[state=inactive]:hidden"
            forceMount
          >
            <WhatIfSimulatorPanel expenseItems={expenseItems} />
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-600">
              <LineChart className="h-3 w-3" />
              Dự phóng dòng tiền dựa trên lãi kép 8%/năm và các sự kiện đang
              chọn.
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
