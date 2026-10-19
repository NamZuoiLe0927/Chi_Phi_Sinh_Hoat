import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PROFILE_ID = "default-profile";

type GroupValue = "NEEDS" | "WANTS" | "SAVINGS_DEBT";

type FrequencyValue = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

interface SeedCategoryGroup {
  code: GroupValue;
  name: string;
  description: string;
  color: string;
  icon: string;
  sortOrder: number;
}

interface SeedExpenseItem {
  id: string;
  name: string;
  group: GroupValue;
  icon: string;
  color: string;
  frequency: FrequencyValue;
  unitPrice: number;
  quantityPerPeriod: number;
  isFixed: boolean;
  isEnabled: boolean;
  priority: number;
  note: string | null;
  sortOrder: number;
}

const profileSeed = {
  id: PROFILE_ID,
  name: "Nguyễn Văn Minh",
  monthlyIncome: 20000000,
  extraIncome: 0,
  cityTier: "HANOI_HCM",
  lifestyle: "BALANCED",
  dependents: 0,
  budgetRule: "RULE_50_30_20",
  savingsGoalAmount: 4000000,
  inflationRate: 0.04,
  workHoursPerDay: 8,
  workDaysPerMonth: 22,
  commuteHoursPerDay: 1,
  currentSavings: 50000000,
  initialSavingsFund: 50000000,
};

const categoryGroups: SeedCategoryGroup[] = [
  {
    code: "NEEDS",
    name: "Thiết yếu",
    description: "Chi phí bắt buộc để duy trì cuộc sống và công việc hằng ngày",
    color: "#10b981",
    icon: "Home",
    sortOrder: 1,
  },
  {
    code: "WANTS",
    name: "Mong muốn",
    description: "Chi phí giải trí, hưởng thụ và nâng cao chất lượng sống",
    color: "#f59e0b",
    icon: "Coffee",
    sortOrder: 2,
  },
  {
    code: "SAVINGS_DEBT",
    name: "Tiết kiệm & Trả nợ",
    description: "Quỹ dự phòng, đầu tư và các khoản trả góp",
    color: "#38bdf8",
    icon: "PiggyBank",
    sortOrder: 3,
  },
];

const expenseItems: SeedExpenseItem[] = [
  {
    id: "item-rent",
    name: "Thuê nhà / Trọ",
    group: "NEEDS",
    icon: "Home",
    color: "#10b981",
    frequency: "MONTHLY",
    unitPrice: 4500000,
    quantityPerPeriod: 1,
    isFixed: true,
    isEnabled: true,
    priority: 1,
    note: "Căn hộ một phòng ngủ tại Hà Nội",
    sortOrder: 1,
  },
  {
    id: "item-electricity",
    name: "Điện sinh hoạt (EVN)",
    group: "NEEDS",
    icon: "Zap",
    color: "#f59e0b",
    frequency: "MONTHLY",
    unitPrice: 3500,
    quantityPerPeriod: 250,
    isFixed: false,
    isEnabled: true,
    priority: 1,
    note: "Ước tính 250 kWh/tháng, tính theo bậc thang EVN",
    sortOrder: 2,
  },
  {
    id: "item-water",
    name: "Nước sinh hoạt",
    group: "NEEDS",
    icon: "Droplets",
    color: "#38bdf8",
    frequency: "MONTHLY",
    unitPrice: 12000,
    quantityPerPeriod: 8,
    isFixed: false,
    isEnabled: true,
    priority: 2,
    note: "Khoảng 8 m3/tháng",
    sortOrder: 3,
  },
  {
    id: "item-internet",
    name: "Internet + 4G",
    group: "NEEDS",
    icon: "Wifi",
    color: "#818cf8",
    frequency: "MONTHLY",
    unitPrice: 300000,
    quantityPerPeriod: 1,
    isFixed: true,
    isEnabled: true,
    priority: 1,
    note: "Gói cáp quang gia đình kèm 4G dự phòng",
    sortOrder: 4,
  },
  {
    id: "item-breakfast",
    name: "Ăn sáng",
    group: "NEEDS",
    icon: "Coffee",
    color: "#fbbf24",
    frequency: "DAILY",
    unitPrice: 35000,
    quantityPerPeriod: 1,
    isFixed: false,
    isEnabled: true,
    priority: 2,
    note: "1 bữa/ngày, khoảng 30 bữa mỗi tháng",
    sortOrder: 5,
  },
  {
    id: "item-lunch",
    name: "Ăn trưa văn phòng",
    group: "NEEDS",
    icon: "UtensilsCrossed",
    color: "#34d399",
    frequency: "MONTHLY",
    unitPrice: 50000,
    quantityPerPeriod: 22,
    isFixed: false,
    isEnabled: true,
    priority: 2,
    note: "22 bữa trưa mỗi tháng",
    sortOrder: 6,
  },
  {
    id: "item-groceries",
    name: "Đi chợ nấu ăn tối",
    group: "NEEDS",
    icon: "ShoppingBasket",
    color: "#4ade80",
    frequency: "DAILY",
    unitPrice: 70000,
    quantityPerPeriod: 1,
    isFixed: false,
    isEnabled: true,
    priority: 2,
    note: "1 lần đi chợ/ngày cho bữa tối",
    sortOrder: 7,
  },
  {
    id: "item-transport",
    name: "Xăng xe / Grab",
    group: "NEEDS",
    icon: "Fuel",
    color: "#fb923c",
    frequency: "MONTHLY",
    unitPrice: 40000,
    quantityPerPeriod: 26,
    isFixed: false,
    isEnabled: true,
    priority: 2,
    note: "26 ngày đi làm và di chuyển trong thành phố",
    sortOrder: 8,
  },
  {
    id: "item-parking",
    name: "Gửi xe",
    group: "NEEDS",
    icon: "Car",
    color: "#94a3b8",
    frequency: "MONTHLY",
    unitPrice: 120000,
    quantityPerPeriod: 1,
    isFixed: true,
    isEnabled: true,
    priority: 3,
    note: "Gửi xe máy tại tòa nhà văn phòng",
    sortOrder: 9,
  },
  {
    id: "item-health-insurance",
    name: "Bảo hiểm y tế",
    group: "NEEDS",
    icon: "HeartPulse",
    color: "#f87171",
    frequency: "YEARLY",
    unitPrice: 1500000,
    quantityPerPeriod: 1,
    isFixed: true,
    isEnabled: true,
    priority: 1,
    note: "Bảo hiểm y tế tự nguyện đóng theo năm",
    sortOrder: 10,
  },
  {
    id: "item-household",
    name: "Đồ dùng sinh hoạt",
    group: "NEEDS",
    icon: "Package",
    color: "#a3e635",
    frequency: "MONTHLY",
    unitPrice: 150000,
    quantityPerPeriod: 1,
    isFixed: false,
    isEnabled: true,
    priority: 3,
    note: "Giấy vệ sinh, nước rửa chén, bột giặt",
    sortOrder: 11,
  },
  {
    id: "item-coffee",
    name: "Cà phê / Trà sữa",
    group: "WANTS",
    icon: "CupSoda",
    color: "#f472b6",
    frequency: "MONTHLY",
    unitPrice: 45000,
    quantityPerPeriod: 15,
    isFixed: false,
    isEnabled: true,
    priority: 4,
    note: "15 ly mỗi tháng",
    sortOrder: 12,
  },
  {
    id: "item-dining-out",
    name: "Ăn hàng / Tụ tập cuối tuần",
    group: "WANTS",
    icon: "PartyPopper",
    color: "#fb7185",
    frequency: "WEEKLY",
    unitPrice: 300000,
    quantityPerPeriod: 2,
    isFixed: false,
    isEnabled: true,
    priority: 4,
    note: "Hai buổi cuối tuần mỗi tuần",
    sortOrder: 13,
  },
  {
    id: "item-netflix",
    name: "Netflix",
    group: "WANTS",
    icon: "Tv",
    color: "#ef4444",
    frequency: "MONTHLY",
    unitPrice: 260000,
    quantityPerPeriod: 1,
    isFixed: true,
    isEnabled: true,
    priority: 3,
    note: "Gói tiêu chuẩn",
    sortOrder: 14,
  },
  {
    id: "item-spotify",
    name: "Spotify",
    group: "WANTS",
    icon: "Music",
    color: "#22c55e",
    frequency: "MONTHLY",
    unitPrice: 59000,
    quantityPerPeriod: 1,
    isFixed: true,
    isEnabled: true,
    priority: 3,
    note: "Gói Premium cá nhân",
    sortOrder: 15,
  },
  {
    id: "item-youtube",
    name: "YouTube Premium",
    group: "WANTS",
    icon: "Youtube",
    color: "#f43f5e",
    frequency: "MONTHLY",
    unitPrice: 79000,
    quantityPerPeriod: 1,
    isFixed: true,
    isEnabled: true,
    priority: 3,
    note: "Gói cá nhân",
    sortOrder: 16,
  },
  {
    id: "item-chatgpt",
    name: "ChatGPT Plus",
    group: "WANTS",
    icon: "Bot",
    color: "#a78bfa",
    frequency: "MONTHLY",
    unitPrice: 500000,
    quantityPerPeriod: 1,
    isFixed: true,
    isEnabled: true,
    priority: 3,
    note: "Công cụ hỗ trợ công việc",
    sortOrder: 17,
  },
  {
    id: "item-shopping",
    name: "Mua sắm quần áo / Shopee",
    group: "WANTS",
    icon: "Shirt",
    color: "#e879f9",
    frequency: "MONTHLY",
    unitPrice: 600000,
    quantityPerPeriod: 1,
    isFixed: false,
    isEnabled: true,
    priority: 5,
    note: "Ngân sách mua sắm linh hoạt",
    sortOrder: 18,
  },
  {
    id: "item-gym",
    name: "Gym / Thể thao",
    group: "WANTS",
    icon: "Dumbbell",
    color: "#2dd4bf",
    frequency: "MONTHLY",
    unitPrice: 400000,
    quantityPerPeriod: 1,
    isFixed: true,
    isEnabled: true,
    priority: 4,
    note: "Gói tập tại phòng gym gần nhà",
    sortOrder: 19,
  },
  {
    id: "item-travel",
    name: "Du lịch (quỹ năm)",
    group: "WANTS",
    icon: "Plane",
    color: "#60a5fa",
    frequency: "YEARLY",
    unitPrice: 12000000,
    quantityPerPeriod: 1,
    isFixed: false,
    isEnabled: true,
    priority: 5,
    note: "Quỹ du lịch 12 triệu/năm, chia đều 12 tháng",
    sortOrder: 20,
  },
  {
    id: "item-entertainment",
    name: "Xem phim / Giải trí",
    group: "WANTS",
    icon: "Clapperboard",
    color: "#c084fc",
    frequency: "MONTHLY",
    unitPrice: 150000,
    quantityPerPeriod: 1,
    isFixed: false,
    isEnabled: true,
    priority: 5,
    note: "Vé phim, board game, karaoke",
    sortOrder: 21,
  },
  {
    id: "item-grooming",
    name: "Cắt tóc / Chăm sóc cá nhân",
    group: "WANTS",
    icon: "Scissors",
    color: "#fda4af",
    frequency: "MONTHLY",
    unitPrice: 100000,
    quantityPerPeriod: 1,
    isFixed: false,
    isEnabled: true,
    priority: 4,
    note: "Cắt tóc và sản phẩm chăm sóc cá nhân",
    sortOrder: 22,
  },
  {
    id: "item-emergency-fund",
    name: "Quỹ dự phòng khẩn cấp",
    group: "SAVINGS_DEBT",
    icon: "ShieldCheck",
    color: "#10b981",
    frequency: "MONTHLY",
    unitPrice: 1500000,
    quantityPerPeriod: 1,
    isFixed: true,
    isEnabled: true,
    priority: 1,
    note: "Mục tiêu 6 tháng chi phí sinh hoạt",
    sortOrder: 23,
  },
  {
    id: "item-investment",
    name: "Đầu tư chứng chỉ quỹ / Vàng",
    group: "SAVINGS_DEBT",
    icon: "TrendingUp",
    color: "#fbbf24",
    frequency: "MONTHLY",
    unitPrice: 1000000,
    quantityPerPeriod: 1,
    isFixed: true,
    isEnabled: true,
    priority: 1,
    note: "Đầu tư dài hạn, ưu tiên chứng chỉ quỹ chỉ số",
    sortOrder: 24,
  },
  {
    id: "item-bank-savings",
    name: "Gửi tiết kiệm ngân hàng",
    group: "SAVINGS_DEBT",
    icon: "Landmark",
    color: "#38bdf8",
    frequency: "MONTHLY",
    unitPrice: 500000,
    quantityPerPeriod: 1,
    isFixed: true,
    isEnabled: true,
    priority: 1,
    note: "Gửi tiết kiệm có kỳ hạn",
    sortOrder: 25,
  },
  {
    id: "item-installment",
    name: "Trả góp điện thoại / laptop",
    group: "SAVINGS_DEBT",
    icon: "Smartphone",
    color: "#f97316",
    frequency: "MONTHLY",
    unitPrice: 500000,
    quantityPerPeriod: 1,
    isFixed: true,
    isEnabled: true,
    priority: 2,
    note: "Khoản trả góp cố định hằng tháng",
    sortOrder: 26,
  },
];

const monthlyMultiplier: Record<FrequencyValue, number> = {
  DAILY: 30.44,
  WEEKLY: 4.345,
  MONTHLY: 1,
  YEARLY: 1 / 12,
};

function toMonthlyCost(item: SeedExpenseItem): number {
  return item.unitPrice * item.quantityPerPeriod * monthlyMultiplier[item.frequency];
}

function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

async function main() {
  const profile = await prisma.profile.upsert({
    where: { id: PROFILE_ID },
    update: {},
    create: profileSeed,
  });

  for (const group of categoryGroups) {
    await prisma.categoryGroup.upsert({
      where: { code: group.code },
      update: {
        name: group.name,
        description: group.description,
        color: group.color,
        icon: group.icon,
        sortOrder: group.sortOrder,
      },
      create: group,
    });
  }

  let createdCount = 0;
  let updatedCount = 0;

  for (const item of expenseItems) {
    const { id, ...itemData } = item;
    const existing = await prisma.expenseItem.findUnique({ where: { id } });

    if (existing) {
      await prisma.expenseItem.update({
        where: { id },
        data: itemData,
      });
      updatedCount += 1;
      continue;
    }

    await prisma.expenseItem.create({
      data: {
        id,
        profileId: profile.id,
        ...itemData,
      },
    });
    createdCount += 1;
  }

  const totals: Record<GroupValue, number> = {
    NEEDS: 0,
    WANTS: 0,
    SAVINGS_DEBT: 0,
  };

  for (const item of expenseItems) {
    totals[item.group] += toMonthlyCost(item);
  }

  const totalMonthly = totals.NEEDS + totals.WANTS + totals.SAVINGS_DEBT;

  console.log("");
  console.log("[seed] Hồ sơ: Nguyễn Văn Minh - Hà Nội/TP.HCM - 20.000.000đ/tháng");
  console.log(`[seed] Nhóm ngân sách: ${categoryGroups.length}`);
  console.log(`[seed] Khoản mục: ${expenseItems.length} (tạo mới: ${createdCount}, cập nhật: ${updatedCount})`);
  console.log("");
  console.log(`[seed] Thiết yếu (NEEDS):        ${formatVnd(totals.NEEDS)}/tháng`);
  console.log(`[seed] Mong muốn (WANTS):        ${formatVnd(totals.WANTS)}/tháng`);
  console.log(`[seed] Tiết kiệm & Trả nợ:       ${formatVnd(totals.SAVINGS_DEBT)}/tháng`);
  console.log(`[seed] Tổng dự toán:             ${formatVnd(totalMonthly)}/tháng`);
  console.log(`[seed] Chênh lệch so thu nhập:   ${formatVnd(profile.monthlyIncome - totalMonthly)}/tháng`);
  console.log("");
}

main()
  .catch((error) => {
    console.error("[seed] Failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
