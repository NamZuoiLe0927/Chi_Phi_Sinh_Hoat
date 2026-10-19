import {
  ELECTRICITY_TIERS,
  ELECTRICITY_VAT_RATE,
} from "@/constants/finance";
import type {
  ElectricityBillResult,
  ElectricityTierDefinition,
  ElectricityTierUsage,
} from "@/types/living-cost.types";

export interface ElectricityBillOptions {
  vatRate?: number;
  tiers?: ElectricityTierDefinition[];
}

function assertFiniteNonNegative(value: number, field: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${field} phải là số hữu hạn và không âm`);
  }
}

export function getElectricityTierUsage(
  kwh: number,
  tiers: ElectricityTierDefinition[] = ELECTRICITY_TIERS,
): ElectricityTierUsage[] {
  assertFiniteNonNegative(kwh, "kwh");

  return tiers.map((tier) => {
    const upperBound = tier.toKwh ?? Number.POSITIVE_INFINITY;
    const lowerBound = tier.tier === 1 ? 0 : tier.fromKwh - 1;
    const consumed = Math.max(0, Math.min(kwh, upperBound) - lowerBound);

    return {
      tier: tier.tier,
      label: tier.label,
      fromKwh: tier.fromKwh,
      toKwh: tier.toKwh,
      kwh: consumed,
      unitPrice: tier.unitPrice,
      subtotal: consumed * tier.unitPrice,
    };
  });
}

export function calculateVietnamElectricityBill(
  kwh: number,
  options: ElectricityBillOptions = {},
): ElectricityBillResult {
  assertFiniteNonNegative(kwh, "kwh");

  const tiers = options.tiers ?? ELECTRICITY_TIERS;
  const vatRate = options.vatRate ?? ELECTRICITY_VAT_RATE;
  assertFiniteNonNegative(vatRate, "vatRate");

  const usage = getElectricityTierUsage(kwh, tiers);
  const subtotal = usage.reduce((total, tier) => total + tier.subtotal, 0);
  const vatAmount = subtotal * vatRate;
  const total = subtotal + vatAmount;
  const averagePricePerKwh = kwh > 0 ? total / kwh : 0;

  return {
    kwh,
    tiers: usage,
    subtotal,
    vatRate,
    vatAmount,
    total,
    averagePricePerKwh,
  };
}

export function calculateElectricityFromConsumption(
  kwh: number,
  vatRate: number = ELECTRICITY_VAT_RATE,
): ElectricityBillResult {
  return calculateVietnamElectricityBill(kwh, { vatRate });
}
