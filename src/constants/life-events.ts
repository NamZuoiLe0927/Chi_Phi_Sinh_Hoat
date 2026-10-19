import type { LifeEventPreset } from "@/types/living-cost.types";

export const LIFE_EVENT_PRESETS: LifeEventPreset[] = [
  {
    id: "installment-purchase",
    type: "INSTALLMENT_PURCHASE",
    label: "Mua xe / điện thoại trả góp",
    description: "+2.500.000đ/tháng trong 12 tháng",
    icon: "🛵",
    monthlyIncomeDelta: 0,
    monthlyExpenseDelta: 2_500_000,
    durationMonths: 12,
    lifestyleCreepRate: 0,
    isCustom: false,
  },
  {
    id: "upgrade-home",
    type: "UPGRADE_HOME",
    label: "Chuyển lên căn hộ tốt hơn",
    description: "Tiền nhà +3.000.000đ, điện +500.000đ mỗi tháng",
    icon: "🏠",
    monthlyIncomeDelta: 0,
    monthlyExpenseDelta: 3_500_000,
    durationMonths: null,
    lifestyleCreepRate: 0,
    isCustom: false,
  },
  {
    id: "pet",
    type: "PET",
    label: "Nuôi thú cưng",
    description: "+1.200.000đ/tháng cho ăn uống, y tế và phụ kiện",
    icon: "🐾",
    monthlyIncomeDelta: 0,
    monthlyExpenseDelta: 1_200_000,
    durationMonths: null,
    lifestyleCreepRate: 0,
    isCustom: false,
  },
  {
    id: "raise-salary",
    type: "RAISE_SALARY",
    label: "Được tăng lương 20%",
    description: "Thu nhập +20%, chi tiêu giải trí tăng thêm 10%",
    icon: "📈",
    monthlyIncomeDelta: 0,
    monthlyExpenseDelta: 0,
    durationMonths: null,
    lifestyleCreepRate: 10,
    isCustom: false,
  },
  {
    id: "new-baby",
    type: "NEW_BABY",
    label: "Chào đón em bé",
    description: "+6.000.000đ/tháng cho sữa, tã và chăm sóc",
    icon: "👶",
    monthlyIncomeDelta: 0,
    monthlyExpenseDelta: 6_000_000,
    durationMonths: null,
    lifestyleCreepRate: 0,
    isCustom: false,
  },
];

export const RAISE_SALARY_INCOME_RATE = 0.2;

export function getLifeEventPreset(id: string): LifeEventPreset | undefined {
  return LIFE_EVENT_PRESETS.find((preset) => preset.id === id);
}
