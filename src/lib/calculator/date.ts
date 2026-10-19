import type { DateRange } from "@/types/living-cost.types";

export function toLocalISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayISO(now: Date = new Date()): string {
  return toLocalISODate(now);
}

export function getMonthRange(now: Date = new Date()): DateRange {
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    startDate: toLocalISODate(start),
    endDate: toLocalISODate(end),
  };
}

export function getDaysInMonth(now: Date = new Date()): number {
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

export function getRemainingDays(
  now: Date = new Date(),
  includeToday: boolean = true,
): number {
  const daysInMonth = getDaysInMonth(now);
  const elapsed = now.getDate() - (includeToday ? 1 : 0);
  return Math.max(0, daysInMonth - elapsed);
}

export function isDateInRange(date: string, range: DateRange): boolean {
  return date >= range.startDate && date <= range.endDate;
}

export function isSameMonth(date: string, now: Date = new Date()): boolean {
  return date.startsWith(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
  );
}
