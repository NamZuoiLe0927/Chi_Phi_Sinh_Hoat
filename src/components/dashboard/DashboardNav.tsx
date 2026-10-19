"use client";

import {
  BarChart3,
  ListChecks,
  MoonStar,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { useLivingCostStore } from "@/store/useLivingCostStore";
import { resolveDashboardView } from "@/lib/dashboard-view";
import { cn } from "@/lib/utils";
import type { DashboardViewId } from "@/types/living-cost.types";

interface DashboardNavItem {
  id: DashboardViewId;
  emoji: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
}

const NAV_ITEMS: DashboardNavItem[] = [
  {
    id: "SETUP",
    emoji: "🧾",
    label: "Thiết Lập Chi Phí",
    shortLabel: "Thiết lập",
    description: "Thu nhập, mục tiêu tiết kiệm và từng khoản chi",
    icon: ListChecks,
  },
  {
    id: "HEALTH",
    emoji: "🩺",
    label: "Sức Khỏe Tài Chính",
    shortLabel: "Sức khỏe",
    description: "Dòng tiền, quỹ dự phòng và mức an toàn",
    icon: ShieldCheck,
  },
  {
    id: "ANALYSIS",
    emoji: "📊",
    label: "Trung Tâm Phân Tích",
    shortLabel: "Phân tích",
    description: "Cơ cấu chi phí, thói quen chi tiêu và giả lập tương lai",
    icon: BarChart3,
  },
  {
    id: "LEDGER",
    emoji: "🌙",
    label: "Chi Tiêu Theo Ngày",
    shortLabel: "Chi tiêu ngày",
    description:
      "Ghi chi tiêu hằng ngày và cộng/trừ trực tiếp vào Quỹ Tiết Kiệm theo từng tháng",
    icon: MoonStar,
  },
];

export function DashboardNav() {
  const storedView = useLivingCostStore((state) => state.ui.activeView);
  const setActiveView = useLivingCostStore((state) => state.setActiveView);
  const activeView = resolveDashboardView(storedView);

  function handleSelect(view: DashboardViewId) {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <nav
      aria-label="Điều hướng trang"
      className="sticky top-0 z-30 border-b border-slate-800/70 bg-slate-950/85 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-[1600px] items-center gap-2 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              aria-current={isActive ? "page" : undefined}
              title={item.description}
              className={cn(
                "group flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-[11px] font-medium transition",
                isActive
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                  : "border-transparent text-slate-400 hover:border-slate-700/80 hover:bg-slate-900/70 hover:text-slate-200",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4",
                  isActive
                    ? "text-emerald-300"
                    : "text-slate-500 group-hover:text-slate-300",
                )}
              />
              <span className="hidden sm:inline">
                {item.emoji} {item.label}
              </span>
              <span className="sm:hidden">
                {item.emoji} {item.shortLabel}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
