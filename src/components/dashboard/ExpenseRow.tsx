"use client";

import { Clock3, Minus, Plus, Trash2, Zap } from "lucide-react";
import { useMemo } from "react";
import { ExpenseIcon } from "@/components/dashboard/ExpenseIcon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { FREQUENCY_DEFINITIONS } from "@/constants/finance";
import {
  calculateVietnamElectricityBill,
  convertMoneyToWorkTime,
} from "@/lib/calculator";
import { normalizeToMonthly } from "@/lib/calculator/frequency";
import {
  cn,
  formatQuantity,
  formatVnd,
} from "@/lib/utils";
import type {
  ExpenseItem,
  ExpenseItemDraft,
  Frequency,
  ViewMode,
} from "@/types/living-cost.types";

interface ExpenseRowProps {
  item: ExpenseItem;
  computedItem: ExpenseItem;
  isCustom: boolean;
  realHourlyWage: number;
  viewMode: ViewMode;
  onUpdate: (id: string, patch: Partial<ExpenseItemDraft>) => void;
  onToggle: (id: string, enabled: boolean) => void;
  onRemove: (id: string) => void;
}

export function ExpenseRow({
  item,
  computedItem,
  isCustom,
  realHourlyWage,
  viewMode,
  onUpdate,
  onToggle,
  onRemove,
}: ExpenseRowProps) {
  const isElectricity = item.id === "item-electricity";
  const monthlyCost = normalizeToMonthly(computedItem);
  const dailyCost = monthlyCost / 30.44;
  const frequency = FREQUENCY_DEFINITIONS[item.frequency];
  const showWorkTime = viewMode === "WORK_TIME" && realHourlyWage > 0;
  const monthlyWorkTime = showWorkTime
    ? convertMoneyToWorkTime(monthlyCost, realHourlyWage)
    : null;
  const dailyWorkTime = showWorkTime
    ? convertMoneyToWorkTime(dailyCost, realHourlyWage)
    : null;

  const electricityBill = useMemo(
    () =>
      isElectricity
        ? calculateVietnamElectricityBill(item.quantityPerPeriod)
        : null,
    [isElectricity, item.quantityPerPeriod],
  );

  const quantityStep = isElectricity ? 10 : 1;
  const quantityMax = Math.max(
    isElectricity
      ? 800
      : item.frequency === "DAILY"
        ? 10
        : item.frequency === "WEEKLY"
          ? 8
          : item.frequency === "YEARLY"
            ? 8
            : 12,
    Math.ceil(item.quantityPerPeriod * 2),
  );
  const displayUnitPrice = electricityBill
    ? electricityBill.averagePricePerKwh
    : item.unitPrice;

  const unitPriceStep = item.frequency === "YEARLY" ? 100_000 : 10_000;

  function setQuantity(nextQuantity: number) {
    onUpdate(item.id, {
      quantityPerPeriod: Math.max(0, Math.min(quantityMax, nextQuantity)),
    });
  }

  function setUnitPrice(nextUnitPrice: number) {
    onUpdate(item.id, {
      unitPrice: Math.max(0, Math.round(nextUnitPrice || 0)),
    });
  }

  function handleRemove() {
    const confirmed = window.confirm(
      `Xóa khoản chi "${item.name}"? Các giao dịch đã ghi vẫn được giữ lại.`,
    );
    if (confirmed) onRemove(item.id);
  }

  return (
    <div
      className={cn(
        "rounded-xl border p-3 transition-colors",
        item.isEnabled
          ? "border-slate-800 bg-slate-950/45"
          : "border-slate-800/60 bg-slate-950/20 opacity-60",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${item.color}18` }}
        >
          <ExpenseIcon
            name={item.icon}
            group={item.group}
            color={item.color}
            className="h-[18px] w-[18px]"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="truncate text-sm font-medium text-slate-100">
                  {item.name}
                </p>
                {item.isFixed ? (
                  <Badge
                    variant="secondary"
                    className="px-1.5 py-0 text-[9px] font-medium"
                  >
                    Cố định
                  </Badge>
                ) : null}
                {isCustom ? (
                  <Badge
                    variant="outline"
                    className="px-1.5 py-0 text-[9px] font-medium text-slate-400"
                  >
                    Tự thêm
                  </Badge>
                ) : null}
              </div>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {formatVnd(displayUnitPrice)}{" "}
                {isElectricity ? "bình quân/kWh" : `/ ${frequency.shortLabel.toLowerCase()}`}
              </p>
              {item.note ? (
                <p className="mt-0.5 truncate text-[10px] text-slate-600">
                  {item.note}
                </p>
              ) : null}
            </div>

            <div className="text-right">
              <p className="text-sm font-semibold tabular-nums text-slate-100">
                {formatVnd(monthlyCost)}
                <span className="ml-1 text-[10px] font-normal text-slate-500">
                  /tháng
                </span>
              </p>
              <p className="text-[10px] tabular-nums text-slate-500">
                {formatVnd(dailyCost)}/ngày
              </p>
              {monthlyWorkTime ? (
                <p className="mt-1 inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium tabular-nums text-emerald-300">
                  <Clock3 className="h-2.5 w-2.5" />
                  {monthlyWorkTime.formatted}
                </p>
              ) : null}
              {dailyWorkTime ? (
                <p className="mt-1 text-[10px] tabular-nums text-emerald-400/70">
                  ≈ {dailyWorkTime.formatted}/ngày
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Switch
              checked={item.isEnabled}
              onCheckedChange={(checked) => onToggle(item.id, checked)}
              aria-label={`Bật hoặc tắt ${item.name}`}
            />
            <span className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
              {item.isEnabled ? "Đang bật" : "Đang tắt"}
            </span>

            <div className="ml-auto flex flex-wrap items-center gap-1.5">
              {!isElectricity ? (
                <div className="flex items-center gap-1">
                  <span className="hidden text-[10px] text-slate-500 sm:inline">
                    Đơn giá
                  </span>
                  <div className="relative">
                    <Input
                      type="number"
                      min={0}
                      step={unitPriceStep}
                      value={item.unitPrice}
                      onChange={(event) =>
                        setUnitPrice(Number(event.target.value))
                      }
                      disabled={!item.isEnabled}
                      aria-label={`Đơn giá ${item.name}`}
                      className="h-7 w-[116px] pr-6 text-[11px] tabular-nums"
                    />
                    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-500">
                      đ
                    </span>
                  </div>
                </div>
              ) : null}

              <Select
                value={item.frequency}
                onValueChange={(value) =>
                  onUpdate(item.id, { frequency: value as Frequency })
                }
                disabled={isElectricity}
              >
                <SelectTrigger
                  className="h-7 w-[108px] rounded-md px-2 text-[11px]"
                  aria-label={`Tần suất ${item.name}`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(FREQUENCY_DEFINITIONS).map((definition) => (
                    <SelectItem
                      key={definition.value}
                      value={definition.value}
                      className="text-xs"
                    >
                      {definition.shortLabel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-7 w-7 rounded-md"
                onClick={() => setQuantity(item.quantityPerPeriod - quantityStep)}
                disabled={item.quantityPerPeriod <= 0}
                aria-label={`Giảm số lượng ${item.name}`}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-12 text-center text-[11px] tabular-nums text-slate-300">
                {formatQuantity(item.quantityPerPeriod)}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-7 w-7 rounded-md"
                onClick={() => setQuantity(item.quantityPerPeriod + quantityStep)}
                disabled={item.quantityPerPeriod >= quantityMax}
                aria-label={`Tăng số lượng ${item.name}`}
              >
                <Plus className="h-3 w-3" />
              </Button>

              {isCustom ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-md text-slate-500 hover:text-rose-300"
                  onClick={handleRemove}
                  aria-label={`Xóa ${item.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              ) : null}
            </div>
          </div>

          <div className="mt-2.5 flex items-center gap-3">
            <Slider
              min={0}
              max={quantityMax}
              step={quantityStep}
              value={[item.quantityPerPeriod]}
              onValueChange={([value]) => setQuantity(value)}
              disabled={!item.isEnabled}
              aria-label={`Số lượng ${item.name}`}
              className="flex-1"
            />
            <span className="w-16 text-right text-[10px] tabular-nums text-slate-500">
              {formatQuantity(item.quantityPerPeriod)}{" "}
              {frequency.shortLabel.toLowerCase()}
            </span>
          </div>

          {electricityBill && item.isEnabled ? (
            <div className="mt-2 flex items-start gap-2 rounded-lg border border-amber-500/15 bg-amber-500/[0.06] px-2.5 py-2 text-[10px] leading-relaxed text-amber-200/85">
              <Zap className="mt-0.5 h-3 w-3 shrink-0 text-amber-400" />
              <span>
                Hóa đơn EVN 6 bậc + VAT 8%:{" "}
                <strong className="font-semibold text-amber-200">
                  {formatVnd(electricityBill.total)}
                </strong>{" "}
                · {formatVnd(electricityBill.averagePricePerKwh)}/kWh
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
