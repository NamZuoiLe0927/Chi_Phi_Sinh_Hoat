"use client";

import { Clock3, PiggyBank, Sparkles, UserRound, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  getPresetDefaultIncome,
  QUICK_SETUP_PRESETS,
} from "@/constants/presets";
import { useLivingCostStore } from "@/store/useLivingCostStore";
import { cn, formatCompactVnd, formatVnd } from "@/lib/utils";
import type { LivingCostPresetId } from "@/types/living-cost.types";

const MAX_INCOME = 100_000_000;

export function QuickSetupBar() {
  const profile = useLivingCostStore((state) => state.profile);
  const updateProfile = useLivingCostStore((state) => state.updateProfile);
  const applyQuickSetup = useLivingCostStore((state) => state.applyQuickSetup);

  const activePreset =
    QUICK_SETUP_PRESETS.find(
      (preset) =>
        profile.monthlyIncome >= preset.incomeRange.min &&
        profile.monthlyIncome <= preset.incomeRange.max,
    )?.id ?? "CUSTOM";

  const savingsRate =
    profile.monthlyIncome > 0
      ? (profile.savingsGoalAmount / profile.monthlyIncome) * 100
      : 0;

  const monthlyWorkHours =
    (profile.workHoursPerDay + profile.commuteHoursPerDay) *
    profile.workDaysPerMonth;

  function handleWorkProfileChange(patch: {
    workHoursPerDay?: number;
    workDaysPerMonth?: number;
    commuteHoursPerDay?: number;
  }) {
    updateProfile({
      ...patch,
      ...(patch.workHoursPerDay !== undefined
        ? {
            workHoursPerDay: Math.min(
              16,
              Math.max(1, patch.workHoursPerDay || 1),
            ),
          }
        : {}),
      ...(patch.workDaysPerMonth !== undefined
        ? {
            workDaysPerMonth: Math.min(
              31,
              Math.max(1, patch.workDaysPerMonth || 1),
            ),
          }
        : {}),
      ...(patch.commuteHoursPerDay !== undefined
        ? {
            commuteHoursPerDay: Math.min(
              6,
              Math.max(0, patch.commuteHoursPerDay || 0),
            ),
          }
        : {}),
    });
  }

  function handleNameChange(nextName: string) {
    updateProfile({ name: nextName.slice(0, 60) });
  }

  function handleIncomeChange(nextIncome: number) {
    const safeIncome = Math.min(
      MAX_INCOME,
      Math.max(0, Math.round(nextIncome || 0)),
    );
    const nextSavingsGoal = Math.round(
      (safeIncome * savingsRate) / 100,
    );

    updateProfile({
      monthlyIncome: safeIncome,
      savingsGoalAmount: nextSavingsGoal,
    });
  }

  function handleSavingsRateChange(nextRate: number) {
    const safeRate = Math.min(100, Math.max(0, nextRate || 0));
    updateProfile({
      savingsGoalAmount: Math.round(
        (profile.monthlyIncome * safeRate) / 100,
      ),
    });
  }

  function handlePresetClick(presetId: LivingCostPresetId) {
    const preset = QUICK_SETUP_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;

    applyQuickSetup({
      monthlyIncome: getPresetDefaultIncome(preset),
      savingsGoalPercentage: preset.recommendedSavingsRate,
      presetId: preset.id,
    });
  }

  return (
    <Card className="overflow-hidden border-emerald-500/10 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-emerald-950/20">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              Thiết lập nhanh
            </CardTitle>
            <CardDescription>
              Điều chỉnh thu nhập, mục tiêu tiết kiệm hoặc chọn preset sinh hoạt
            </CardDescription>
          </div>
          <span className="hidden rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300 sm:inline-flex">
            Tự động lưu
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <Label
              htmlFor="profile-name"
              className="flex items-center gap-2 text-slate-200"
            >
              <UserRound className="h-4 w-4 text-violet-400" />
              Tên người dùng
            </Label>
            <span className="text-[10px] text-slate-500">
              Hiển thị trên thẻ Sức khỏe tài chính
            </span>
          </div>
          <Input
            id="profile-name"
            value={profile.name}
            maxLength={60}
            onChange={(event) => handleNameChange(event.target.value)}
            placeholder="VD: Nguyễn Văn Minh"
            className="h-10 text-sm"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <Label
                htmlFor="monthly-income"
                className="flex items-center gap-2 text-slate-200"
              >
                <Wallet className="h-4 w-4 text-emerald-400" />
                Tổng thu nhập hàng tháng
              </Label>
              <span className="text-[11px] text-slate-500">VNĐ</span>
            </div>

            <div className="relative">
              <Input
                id="monthly-income"
                type="number"
                min={0}
                max={MAX_INCOME}
                step={500_000}
                value={profile.monthlyIncome}
                onChange={(event) =>
                  handleIncomeChange(Number(event.target.value))
                }
                className="h-11 pr-9 text-base font-semibold tabular-nums"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                đ
              </span>
            </div>

            <Slider
              className="mt-4"
              min={0}
              max={Math.max(60_000_000, profile.monthlyIncome)}
              step={500_000}
              value={[profile.monthlyIncome]}
              onValueChange={([value]) => handleIncomeChange(value)}
              aria-label="Tổng thu nhập hàng tháng"
            />

            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
              <span>0 đ</span>
              <span>{formatCompactVnd(Math.max(60_000_000, profile.monthlyIncome))}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <Label
                htmlFor="savings-rate"
                className="flex items-center gap-2 text-slate-200"
              >
                <PiggyBank className="h-4 w-4 text-sky-400" />
                Mục tiêu tiết kiệm
              </Label>
              <span className="text-[11px] text-slate-500">% thu nhập</span>
            </div>

            <div className="relative">
              <Input
                id="savings-rate"
                type="number"
                min={0}
                max={100}
                step={1}
                value={Math.round(savingsRate)}
                onChange={(event) =>
                  handleSavingsRateChange(Number(event.target.value))
                }
                className="h-11 pr-9 text-base font-semibold tabular-nums"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                %
              </span>
            </div>

            <Slider
              className="mt-4"
              min={0}
              max={100}
              step={1}
              value={[Math.round(savingsRate)]}
              onValueChange={([value]) => handleSavingsRateChange(value)}
              aria-label="Mục tiêu tiết kiệm phần trăm"
            />

            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
              <span>0%</span>
              <span className="text-sky-300/80">
                {formatVnd(profile.savingsGoalAmount)}/tháng
              </span>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            Preset sinh hoạt
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {QUICK_SETUP_PRESETS.map((preset) => {
              const isActive = activePreset === preset.id;

              return (
                <Button
                  key={preset.id}
                  type="button"
                  variant="outline"
                  onClick={() => handlePresetClick(preset.id)}
                  className={cn(
                    "h-auto items-start justify-start gap-3 rounded-xl px-3 py-3 text-left",
                    isActive &&
                      "border-emerald-500/50 bg-emerald-500/10 text-emerald-100 hover:border-emerald-400/60 hover:bg-emerald-500/15",
                  )}
                >
                  <span className="text-lg leading-none">{preset.icon}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold">
                      {preset.label}
                    </span>
                    <span className="mt-0.5 block text-[10px] font-normal text-slate-500">
                      {preset.description}
                    </span>
                  </span>
                </Button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-xs font-medium text-slate-200">
              <Clock3 className="h-4 w-4 text-emerald-400" />
              Hồ sơ thời gian làm việc
            </p>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium tabular-nums text-emerald-300">
              ≈ {monthlyWorkHours.toLocaleString("vi-VN")} giờ/tháng
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label
                htmlFor="work-hours-per-day"
                className="text-[11px] text-slate-400"
              >
                Giờ làm việc/ngày
              </Label>
              <Input
                id="work-hours-per-day"
                type="number"
                min={1}
                max={16}
                step={0.5}
                value={profile.workHoursPerDay}
                onChange={(event) =>
                  handleWorkProfileChange({
                    workHoursPerDay: Number(event.target.value),
                  })
                }
                className="mt-1.5 h-9 text-sm tabular-nums"
              />
            </div>
            <div>
              <Label
                htmlFor="work-days-per-month"
                className="text-[11px] text-slate-400"
              >
                Ngày làm việc/tháng
              </Label>
              <Input
                id="work-days-per-month"
                type="number"
                min={1}
                max={31}
                step={1}
                value={profile.workDaysPerMonth}
                onChange={(event) =>
                  handleWorkProfileChange({
                    workDaysPerMonth: Number(event.target.value),
                  })
                }
                className="mt-1.5 h-9 text-sm tabular-nums"
              />
            </div>
            <div>
              <Label
                htmlFor="commute-hours-per-day"
                className="text-[11px] text-slate-400"
              >
                Di chuyển/ngày
              </Label>
              <Input
                id="commute-hours-per-day"
                type="number"
                min={0}
                max={6}
                step={0.5}
                value={profile.commuteHoursPerDay}
                onChange={(event) =>
                  handleWorkProfileChange({
                    commuteHoursPerDay: Number(event.target.value),
                  })
                }
                className="mt-1.5 h-9 text-sm tabular-nums"
              />
            </div>
          </div>

          <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
            Dùng để quy đổi mỗi khoản chi ra số giờ lao động thực tế. Bật chế độ
            xem bằng giờ ở thanh tiêu đề để so sánh.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
