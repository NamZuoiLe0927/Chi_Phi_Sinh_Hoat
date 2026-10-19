import type {
  LivingCostPreset,
  LivingCostPresetId,
} from "@/types/living-cost.types";

export interface PresetScaling {
  rent: number;
  needs: number;
  wants: number;
  savings: number;
  quantityOverrides: Record<string, number>;
}

export const PRESET_SCALING: Record<LivingCostPresetId, PresetScaling> = {
  STUDENT: {
    rent: 0.45,
    needs: 0.5,
    wants: 0.3,
    savings: 0.15,
    quantityOverrides: {
      "item-electricity": 80,
      "item-water": 4,
      "item-groceries": 0.7,
      "item-dining-out": 1,
    },
  },
  SINGLE_PROFESSIONAL: {
    rent: 1,
    needs: 1,
    wants: 1,
    savings: 1,
    quantityOverrides: {},
  },
  SMALL_FAMILY: {
    rent: 2.2,
    needs: 1.7,
    wants: 1.25,
    savings: 1.5,
    quantityOverrides: {
      "item-electricity": 450,
      "item-water": 16,
      "item-groceries": 2,
      "item-dining-out": 2,
    },
  },
  CUSTOM: {
    rent: 1,
    needs: 1,
    wants: 1,
    savings: 1,
    quantityOverrides: {},
  },
};

export const QUICK_SETUP_PRESETS: LivingCostPreset[] = [
  {
    id: "STUDENT",
    label: "Sinh viên",
    description: "5 - 7 triệu/tháng",
    icon: "🎒",
    incomeRange: { min: 5_000_000, max: 7_000_000 },
    expenseMultiplier: 0.33,
    recommendedSavingsRate: 10,
  },
  {
    id: "SINGLE_PROFESSIONAL",
    label: "Người đi làm độc thân",
    description: "12 - 20 triệu/tháng",
    icon: "💼",
    incomeRange: { min: 12_000_000, max: 20_000_000 },
    expenseMultiplier: 1,
    recommendedSavingsRate: 20,
  },
  {
    id: "SMALL_FAMILY",
    label: "Gia đình nhỏ",
    description: "25 - 40 triệu/tháng",
    icon: "👨‍👩‍👧",
    incomeRange: { min: 25_000_000, max: 40_000_000 },
    expenseMultiplier: 1.55,
    recommendedSavingsRate: 20,
  },
];

export function getPresetDefaultIncome(preset: LivingCostPreset): number {
  const midpoint = (preset.incomeRange.min + preset.incomeRange.max) / 2;
  return Math.round(midpoint / 500_000) * 500_000;
}

export function getPresetById(
  presetId: LivingCostPresetId,
): LivingCostPreset | undefined {
  return QUICK_SETUP_PRESETS.find((preset) => preset.id === presetId);
}
