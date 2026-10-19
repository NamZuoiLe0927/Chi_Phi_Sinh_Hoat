"use client";

import { Plus, ReceiptText } from "lucide-react";
import { useMemo, useState } from "react";
import { AddExpenseDialog } from "@/components/dashboard/AddExpenseDialog";
import { ExpenseRow } from "@/components/dashboard/ExpenseRow";
import { Button } from "@/components/ui/button";
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
import {
  CATEGORY_DEFINITIONS,
  FREQUENCY_DEFINITIONS,
} from "@/constants/finance";
import { MOCK_EXPENSE_ITEMS } from "@/data/mock-data";
import { useLivingCostStore } from "@/store/useLivingCostStore";
import { convertMoneyToWorkTime } from "@/lib/calculator";
import { formatCompactVnd, formatVnd } from "@/lib/utils";
import type {
  CategoryGroupCode,
  CategoryGroupSummary,
  ExpenseItem,
  ExpenseItemDraft,
  ViewMode,
} from "@/types/living-cost.types";

const DEFAULT_ITEM_IDS = new Set(MOCK_EXPENSE_ITEMS.map((item) => item.id));

const GROUP_TABS = [
  {
    code: "NEEDS" as const,
    label: "Thiết yếu",
    longLabel: "Chi phí cố định & thiết yếu",
    emoji: "🏠",
  },
  {
    code: "WANTS" as const,
    label: "Mong muốn",
    longLabel: "Ăn uống & giải trí",
    emoji: "☕",
  },
  {
    code: "SAVINGS_DEBT" as const,
    label: "Tiết kiệm",
    longLabel: "Tiết kiệm & dự phòng năm",
    emoji: "💰",
  },
];

interface ExpenseBuilderProps {
  expenseItems: ExpenseItem[];
  computedExpenseItems: ExpenseItem[];
  categorySummaries: CategoryGroupSummary[];
  realHourlyWage: number;
  viewMode: ViewMode;
}

export function ExpenseBuilder({
  expenseItems,
  computedExpenseItems,
  categorySummaries,
  realHourlyWage,
  viewMode,
}: ExpenseBuilderProps) {
  const updateExpenseItem = useLivingCostStore(
    (state) => state.updateExpenseItem,
  );
  const toggleExpenseItem = useLivingCostStore(
    (state) => state.toggleExpenseItem,
  );
  const removeExpenseItem = useLivingCostStore(
    (state) => state.removeExpenseItem,
  );

  const [activeGroup, setActiveGroup] = useState<CategoryGroupCode>("NEEDS");
  const [addOpen, setAddOpen] = useState(false);

  const summaryByGroup = useMemo(
    () =>
      new Map(
        categorySummaries.map((summary) => [summary.groupCode, summary]),
      ),
    [categorySummaries],
  );

  const computedById = useMemo(
    () => new Map(computedExpenseItems.map((item) => [item.id, item])),
    [computedExpenseItems],
  );

  const itemsByGroup = useMemo(() => {
    const groups: Record<CategoryGroupCode, ExpenseItem[]> = {
      NEEDS: [],
      WANTS: [],
      SAVINGS_DEBT: [],
    };

    for (const item of expenseItems) {
      groups[item.group].push(item);
    }

    for (const group of Object.values(groups)) {
      group.sort(
        (left, right) =>
          left.sortOrder - right.sortOrder ||
          left.name.localeCompare(right.name, "vi"),
      );
    }

    return groups;
  }, [expenseItems]);

  function handleUpdate(id: string, patch: Partial<ExpenseItemDraft>) {
    updateExpenseItem(id, patch);
  }

  function openAddDialog() {
    setAddOpen(true);
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-lg">
                Bảng dự toán chi phí
              </CardTitle>
              <CardDescription>
                Bật/tắt, kéo số lượng và chọn tần suất cho từng khoản chi
              </CardDescription>
            </div>
            <Button type="button" size="sm" onClick={openAddDialog}>
              <Plus className="h-3.5 w-3.5" />
              Thêm khoản chi
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs
            value={activeGroup}
            onValueChange={(value) =>
              setActiveGroup(value as CategoryGroupCode)
            }
          >
            <TabsList className="grid h-auto w-full grid-cols-3 gap-1 p-1.5">
              {GROUP_TABS.map((tab) => {
                const summary = summaryByGroup.get(tab.code);
                return (
                  <TabsTrigger
                    key={tab.code}
                    value={tab.code}
                    className="h-auto flex-col items-start gap-1 px-2 py-2.5 text-left sm:flex-row sm:items-center sm:justify-between sm:px-3"
                  >
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold sm:text-xs">
                      <span aria-hidden="true">{tab.emoji}</span>
                      <span>{tab.label}</span>
                    </span>
                    <span className="text-[9px] font-normal tabular-nums text-slate-500 sm:text-[10px]">
                      {formatCompactVnd(summary?.monthlyTotal ?? 0)}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {GROUP_TABS.map((tab) => {
              const items = itemsByGroup[tab.code];
              const summary = summaryByGroup.get(tab.code);
              const definition = CATEGORY_DEFINITIONS[tab.code];

              return (
                <TabsContent key={tab.code} value={tab.code} className="mt-3">
                  <div className="mb-2 flex flex-wrap items-end justify-between gap-2 px-0.5">
                    <div>
                      <p className="text-xs font-medium text-slate-300">
                        {tab.longLabel}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {definition.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold tabular-nums text-slate-200">
                        {formatVnd(summary?.monthlyTotal ?? 0)}
                        <span className="ml-1 text-[10px] font-normal text-slate-500">
                          /tháng
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {summary?.enabledItemCount ?? 0}/
                        {summary?.itemCount ?? items.length} khoản đang bật
                      </p>
                      {viewMode === "WORK_TIME" && realHourlyWage > 0 ? (
                        <p className="mt-0.5 text-[10px] font-medium text-emerald-300/80">
                          ≈{" "}
                          {convertMoneyToWorkTime(
                            summary?.monthlyTotal ?? 0,
                            realHourlyWage,
                          ).formatted}{" "}
                          làm việc
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {items.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-700 bg-slate-950/30 px-4 py-10 text-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800/80 text-slate-500">
                          <ReceiptText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-300">
                            Chưa có khoản chi nào
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Thêm khoản đầu tiên cho nhóm {definition.name.toLowerCase()}.
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={openAddDialog}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Thêm khoản chi
                        </Button>
                      </div>
                    ) : (
                      items.map((item) => {
                        const computedItem = computedById.get(item.id) ?? item;
                        const isCustom = !DEFAULT_ITEM_IDS.has(item.id);

                        return (
                          <ExpenseRow
                            key={item.id}
                            item={item}
                            computedItem={computedItem}
                            isCustom={isCustom}
                            realHourlyWage={realHourlyWage}
                            viewMode={viewMode}
                            onUpdate={handleUpdate}
                            onToggle={toggleExpenseItem}
                            onRemove={removeExpenseItem}
                          />
                        );
                      })
                    )}
                  </div>

                  {items.length > 0 ? (
                    <p className="mt-3 px-0.5 text-[10px] text-slate-600">
                      Tổng {summary?.itemCount ?? items.length} khoản ·{" "}
                      {summary?.enabledItemCount ?? 0} đang bật ·{" "}
                      {FREQUENCY_DEFINITIONS.MONTHLY.label} là quy đổi chuẩn.
                    </p>
                  ) : null}
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      <AddExpenseDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        defaultGroup={activeGroup}
      />
    </>
  );
}
