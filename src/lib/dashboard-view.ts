import type { DashboardViewId } from "@/types/living-cost.types";

export const DASHBOARD_HOME_VIEW: DashboardViewId = "HEALTH";

const DASHBOARD_VIEW_IDS: readonly DashboardViewId[] = [
  "SETUP",
  "HEALTH",
  "ANALYSIS",
  "LEDGER",
];

export function resolveDashboardView(value: unknown): DashboardViewId {
  return typeof value === "string" &&
    (DASHBOARD_VIEW_IDS as readonly string[]).includes(value)
    ? (value as DashboardViewId)
    : DASHBOARD_HOME_VIEW;
}
