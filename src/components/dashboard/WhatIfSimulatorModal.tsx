"use client";

import {
  ArrowRight,
  BadgePlus,
  Check,
  RotateCcw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartSkeleton } from "@/components/charts/ChartSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LIFE_EVENT_PRESETS } from "@/constants/life-events";
import { useMounted } from "@/hooks/useMounted";
import {
  buildSimulationApplyPayload,
  simulateWhatIf,
} from "@/lib/calculator/simulation";
import { useLivingCostStore } from "@/store/useLivingCostStore";
import {
  cn,
  formatCompactVnd,
  formatPercentage,
  formatSignedVnd,
  formatVnd,
} from "@/lib/utils";
import type {
  CustomLifeEvent,
  ExpenseItem,
  LifeEventPreset,
} from "@/types/living-cost.types";

interface WhatIfSimulatorPanelProps {
  expenseItems: ExpenseItem[];
}

function presetBadge(preset: LifeEventPreset): string {
  if (preset.durationMonths !== null) {
    return `${preset.durationMonths} tháng`;
  }
  if (preset.type === "RAISE_SALARY") return "+20% thu nhập";
  return "Dài hạn";
}

export function WhatIfSimulatorPanel({
  expenseItems,
}: WhatIfSimulatorPanelProps) {
  const profile = useLivingCostStore((state) => state.profile);
  const simulation = useLivingCostStore((state) => state.simulation);
  const setSimulation = useLivingCostStore((state) => state.setSimulation);
  const applySimulation = useLivingCostStore((state) => state.applySimulation);
  const resetSimulation = useLivingCostStore((state) => state.resetSimulation);
  const mounted = useMounted();

  const [selectedPresetIds, setSelectedPresetIds] = useState<string[]>(() =>
    (simulation?.adjustment.appliedEventIds ?? []).filter((id) =>
      LIFE_EVENT_PRESETS.some((preset) => preset.id === id),
    ),
  );
  const [customEvents, setCustomEvents] = useState<CustomLifeEvent[]>([]);
  const [customLabel, setCustomLabel] = useState("");
  const [customIncome, setCustomIncome] = useState(0);
  const [customExpense, setCustomExpense] = useState(0);
  const [customDuration, setCustomDuration] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);

  const simulationResult = useMemo(
    () =>
      simulateWhatIf({
        profile,
        expenseItems,
        enabledPresetIds: selectedPresetIds,
        customEvents,
        presets: LIFE_EVENT_PRESETS,
      }),
    [profile, expenseItems, selectedPresetIds, customEvents],
  );

  useEffect(() => {
    setSimulation(simulationResult);
  }, [simulationResult, setSimulation]);

  const hasChanges =
    simulationResult.adjustment.incomeDelta !== 0 ||
    simulationResult.adjustment.expenseDelta !== 0;

  function togglePreset(id: string) {
    setNotice(null);
    setSelectedPresetIds((current) =>
      current.includes(id)
        ? current.filter((presetId) => presetId !== id)
        : [...current, id],
    );
  }

  function addCustomEvent() {
    const label = customLabel.trim();
    if (!label || (customIncome <= 0 && customExpense <= 0)) return;

    setCustomEvents((current) => [
      ...current,
      {
        id: `custom-${Date.now()}`,
        label,
        monthlyIncomeDelta: Math.max(0, Math.round(customIncome)),
        monthlyExpenseDelta: Math.max(0, Math.round(customExpense)),
        durationMonths: customDuration > 0 ? customDuration : null,
      },
    ]);
    setCustomLabel("");
    setCustomIncome(0);
    setCustomExpense(0);
    setCustomDuration(0);
    setNotice(null);
  }

  function removeCustomEvent(id: string) {
    setCustomEvents((current) => current.filter((event) => event.id !== id));
  }

  function applyScenario() {
    if (!hasChanges) return;

    const payload = buildSimulationApplyPayload({
      result: simulationResult,
      enabledPresetIds: selectedPresetIds,
      customEvents,
      presets: LIFE_EVENT_PRESETS,
    });

    applySimulation(payload);
    setSelectedPresetIds([]);
    setCustomEvents([]);
    setNotice(
      "Đã áp dụng kịch bản vào Dự toán chính. Các khoản chi mới có thể chỉnh sửa hoặc xóa trong bảng dự toán.",
    );
  }

  function resetScenario() {
    setSelectedPresetIds([]);
    setCustomEvents([]);
    setCustomLabel("");
    setCustomIncome(0);
    setCustomExpense(0);
    setCustomDuration(0);
    resetSimulation();
    setNotice("Đã đặt lại kịch bản giả lập.");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-100">
            <Sparkles className="h-4 w-4 text-violet-400" />
            Điều gì xảy ra nếu...
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Chọn một hoặc nhiều sự kiện để xem tác động lên dòng tiền và tài
            sản tích lũy 3 năm.
          </p>
        </div>
        <Badge
          variant="outline"
          className="border-violet-500/25 bg-violet-500/10 text-violet-300"
        >
          Lãi kép 8%/năm
        </Badge>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {LIFE_EVENT_PRESETS.map((preset) => {
          const active = selectedPresetIds.includes(preset.id);
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => togglePreset(preset.id)}
              className={cn(
                "flex items-start gap-2.5 rounded-xl border p-3 text-left transition-colors",
                active
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : "border-slate-800 bg-slate-950/40 hover:border-slate-700",
              )}
              aria-pressed={active}
            >
              <span className="text-lg leading-none">{preset.icon}</span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-200">
                    {preset.label}
                  </span>
                  {active ? (
                    <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  ) : null}
                </span>
                <span className="mt-0.5 block text-[10px] leading-relaxed text-slate-500">
                  {preset.description}
                </span>
                <span className="mt-1 inline-block rounded-full border border-slate-700 bg-slate-900/70 px-1.5 py-0.5 text-[9px] text-slate-400">
                  {presetBadge(preset)}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <BadgePlus className="h-3.5 w-3.5 text-sky-400" />
            Sự kiện tùy chỉnh
          </p>
          <span className="text-[10px] text-slate-600">
            Thu nhập / chi phí mỗi tháng
          </span>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Label htmlFor="custom-event-label" className="text-[10px] text-slate-500">
              Tên sự kiện
            </Label>
            <Input
              id="custom-event-label"
              value={customLabel}
              onChange={(event) => setCustomLabel(event.target.value)}
              placeholder="VD: Học thêm tiếng Anh"
              className="mt-1 h-8 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="custom-event-income" className="text-[10px] text-slate-500">
              + Thu nhập
            </Label>
            <Input
              id="custom-event-income"
              type="number"
              min={0}
              step={100_000}
              value={customIncome}
              onChange={(event) =>
                setCustomIncome(Math.max(0, Number(event.target.value) || 0))
              }
              className="mt-1 h-8 text-xs tabular-nums"
            />
          </div>
          <div>
            <Label htmlFor="custom-event-expense" className="text-[10px] text-slate-500">
              + Chi phí
            </Label>
            <Input
              id="custom-event-expense"
              type="number"
              min={0}
              step={100_000}
              value={customExpense}
              onChange={(event) =>
                setCustomExpense(Math.max(0, Number(event.target.value) || 0))
              }
              className="mt-1 h-8 text-xs tabular-nums"
            />
          </div>
          <div>
            <Label htmlFor="custom-event-duration" className="text-[10px] text-slate-500">
              Số tháng
            </Label>
            <Input
              id="custom-event-duration"
              type="number"
              min={0}
              max={120}
              step={1}
              value={customDuration || ""}
              onChange={(event) =>
                setCustomDuration(Math.max(0, Number(event.target.value) || 0))
              }
              placeholder="Dài hạn"
              className="mt-1 h-8 text-xs tabular-nums"
            />
          </div>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={addCustomEvent}
          disabled={!customLabel.trim() || (customIncome <= 0 && customExpense <= 0)}
          className="mt-2 h-8 gap-1.5 text-[11px]"
        >
          <BadgePlus className="h-3.5 w-3.5" />
          Thêm sự kiện
        </Button>

        {customEvents.length > 0 ? (
          <div className="mt-2 space-y-1">
            {customEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-900/50 px-2.5 py-1.5 text-[11px]"
              >
                <span className="truncate text-slate-300">{event.label}</span>
                <span className="shrink-0 tabular-nums text-slate-500">
                  {event.monthlyIncomeDelta > 0
                    ? `+${formatCompactVnd(event.monthlyIncomeDelta)} thu nhập`
                    : ""}
                  {event.monthlyIncomeDelta > 0 &&
                  event.monthlyExpenseDelta > 0
                    ? " · "
                    : ""}
                  {event.monthlyExpenseDelta > 0
                    ? `+${formatCompactVnd(event.monthlyExpenseDelta)} chi phí`
                    : ""}
                </span>
                <button
                  type="button"
                  onClick={() => removeCustomEvent(event.id)}
                  className="shrink-0 text-slate-600 transition-colors hover:text-rose-300"
                  aria-label={`Xóa sự kiện ${event.label}`}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {[
          {
            label: "Hiện tại",
            snapshot: simulationResult.baseline,
            className: "border-slate-800 bg-slate-950/40",
          },
          {
            label: "Kịch bản mới",
            snapshot: simulationResult.simulated,
            className: hasChanges
              ? "border-emerald-500/30 bg-emerald-500/[0.06]"
              : "border-slate-800 bg-slate-950/40",
          },
        ].map((column) => (
          <div
            key={column.label}
            className={cn("rounded-xl border p-3", column.className)}
          >
            <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
              {column.label}
            </p>
            <div className="mt-2 space-y-1 text-[11px]">
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Thu nhập</span>
                <span className="font-medium tabular-nums text-slate-200">
                  {formatVnd(column.snapshot.monthlyIncome)}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Chi phí</span>
                <span className="font-medium tabular-nums text-slate-200">
                  {formatVnd(column.snapshot.monthlyExpense)}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Dòng tiền ròng</span>
                <span
                  className={cn(
                    "font-semibold tabular-nums",
                    column.snapshot.netCashflow >= 0
                      ? "text-emerald-300"
                      : "text-rose-300",
                  )}
                >
                  {formatSignedVnd(column.snapshot.netCashflow)}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Tỷ lệ tiết kiệm</span>
                <span className="font-medium tabular-nums text-sky-300">
                  {formatPercentage(column.snapshot.savingsRate, 1)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-slate-300">
            Tài sản tích lũy sau 3 năm
          </p>
          <span className="text-[10px] text-slate-500">
            {hasChanges
              ? `Chênh lệch ${formatSignedVnd(
                  (simulationResult.yearlyProjection.at(-1)?.simulated ?? 0) -
                    (simulationResult.yearlyProjection.at(-1)?.baseline ?? 0),
                )}`
              : "Chưa chọn sự kiện"}
          </span>
        </div>

        {!mounted ? (
          <ChartSkeleton className="h-[220px]" />
        ) : (
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={simulationResult.yearlyProjection}
                margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="#1e293b"
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="year"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                  tickFormatter={(value: number) =>
                    value === 0 ? "Nay" : `Năm ${value}`
                  }
                />
                <YAxis
                  width={50}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                  tickFormatter={(value: number) => formatCompactVnd(value)}
                />
                <Tooltip
                  formatter={(value, name) => [
                    formatVnd(Number(value)),
                    name === "baseline" ? "Hiện tại" : "Kịch bản mới",
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
                <Legend
                  formatter={(value) =>
                    value === "baseline" ? "Hiện tại" : "Kịch bản mới"
                  }
                  wrapperStyle={{ fontSize: 10, color: "#94a3b8" }}
                />
                <Line
                  type="monotone"
                  dataKey="baseline"
                  stroke="#64748b"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="simulated"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {notice ? (
        <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.07] px-2.5 py-2 text-[11px] text-emerald-300">
          {notice}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] text-slate-600">
          Áp dụng sẽ cập nhật thu nhập và thêm các khoản chi vào bảng dự toán
          chính.
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={resetScenario}
            className="h-8 gap-1.5 text-[11px] text-slate-400"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Đặt lại
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={applyScenario}
            disabled={!hasChanges}
            className="h-8 gap-1.5 text-[11px]"
          >
            <Check className="h-3.5 w-3.5" />
            Áp dụng vào Dự toán chính
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
