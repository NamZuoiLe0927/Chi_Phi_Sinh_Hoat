import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactVnd(amount: number): string {
  const absolute = Math.abs(amount);
  if (absolute >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)} tỷ`;
  }
  if (absolute >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)} tr`;
  }
  if (absolute >= 1_000) {
    return `${Math.round(amount / 1_000)}k`;
  }
  return `${Math.round(amount)}`;
}

export function formatSignedVnd(amount: number): string {
  return amount > 0 ? `+${formatVnd(amount)}` : formatVnd(amount);
}

export function formatQuantity(quantity: number): string {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 2,
  }).format(quantity);
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function roundTo(value: number, decimals = 0): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
