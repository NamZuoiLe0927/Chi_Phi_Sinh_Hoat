"use client";

import { Database, Eye, EyeOff, RotateCcw, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLivingCostStore } from "@/store/useLivingCostStore";
import { DASHBOARD_HOME_VIEW } from "@/lib/dashboard-view";
import { cn } from "@/lib/utils";

export function DashboardHeader() {
  const hydrated = useLivingCostStore((state) => state.hydrated);
  const resetAll = useLivingCostStore((state) => state.resetAll);
  const viewMode = useLivingCostStore((state) => state.ui.viewMode);
  const setViewMode = useLivingCostStore((state) => state.setViewMode);
  const setActiveView = useLivingCostStore((state) => state.setActiveView);
  const setDataManagerOpen = useLivingCostStore(
    (state) => state.setDataManagerOpen,
  );
  const isWorkTime = viewMode === "WORK_TIME";

  const today = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  function handleResetDemo() {
    const confirmed = window.confirm(
      "Khôi phục toàn bộ dữ liệu mẫu? Các thay đổi hiện tại trên trình duyệt sẽ bị thay thế.",
    );
    if (confirmed) resetAll();
  }

  function handleGoHome() {
    setActiveView(DASHBOARD_HOME_VIEW);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <header className="relative z-20 border-b border-slate-800/70 bg-slate-950/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={handleGoHome}
          title="Về Trang Đầu — Sức Khỏe Tài Chính"
          className="group flex items-center gap-3 rounded-xl text-left transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 ring-1 ring-inset ring-emerald-500/25 transition group-hover:bg-emerald-500/25">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold tracking-tight text-slate-50">
                SmartCost
              </p>
              <Badge
                variant="secondary"
                className="px-2 py-0 text-[9px] uppercase tracking-[0.12em]"
              >
                Local-first
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500">
              Dự toán & tối ưu chi phí sinh hoạt
            </p>
          </div>
        </button>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="hidden text-xs capitalize text-slate-500 md:inline">
            {today}
          </span>

          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium",
              hydrated
                ? "border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-300"
                : "border-amber-500/20 bg-amber-500/[0.08] text-amber-300",
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                hydrated ? "bg-emerald-400" : "animate-pulse bg-amber-400",
              )}
            />
            {hydrated ? "Đã lưu cục bộ" : "Đang đồng bộ"}
          </span>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setDataManagerOpen(true)}
            className="h-8 gap-1.5 px-2.5 text-[11px] text-slate-400 hover:text-sky-200"
            title="Xuất / nhập dữ liệu JSON hoặc nạp dữ liệu demo"
          >
            <Database className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Quản lý dữ liệu</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setViewMode(isWorkTime ? "MONEY" : "WORK_TIME")}
            aria-pressed={isWorkTime}
            className={cn(
              "h-8 gap-1.5 px-2.5 text-[11px]",
              isWorkTime
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15"
                : "border-slate-700 bg-slate-900/60 text-slate-400 hover:text-slate-200",
            )}
            title="Quy đổi mọi khoản chi ra số giờ lao động thực tế"
          >
            {isWorkTime ? (
              <Eye className="h-3.5 w-3.5" />
            ) : (
              <EyeOff className="h-3.5 w-3.5" />
            )}
            <span className="hidden md:inline">
              {isWorkTime
                ? "Đang xem theo Giờ Lao Động"
                : "Hiển thị theo Giờ Lao Động"}
            </span>
            <span className="md:hidden">Giờ lao động</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetDemo}
            className="h-8 gap-1.5 px-2.5 text-[11px] text-slate-400"
            title="Khôi phục dữ liệu mẫu"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Dữ liệu mẫu</span>
          </Button>

          <span className="hidden items-center gap-1 text-[10px] text-slate-600 lg:inline-flex">
            <Database className="h-3 w-3" />
            SQLite · Zustand
          </span>
        </div>
      </div>
    </header>
  );
}
