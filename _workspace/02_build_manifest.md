# BUILD MANIFEST — PROMPT 1

## 1. Phạm vi

Prompt 1: khởi tạo cấu trúc thư mục và đặc tả đầy đủ type system cho dự án
Smart Living Cost Estimator.

## 2. File tạo mới

| File | Mô tả |
|---|---|
| `src/types/living-cost.types.ts` | Toàn bộ interface/type contracts của ứng dụng |
| `src/components/dashboard/.gitkeep` | Thư mục component dashboard |
| `src/components/forms/.gitkeep` | Thư mục component form nhập liệu |
| `src/components/modals/.gitkeep` | Thư mục modal (Optimization, What-If, Data Manager) |
| `src/components/layout/.gitkeep` | Thư mục layout/header/sidebar |
| `src/components/providers/.gitkeep` | Thư mục React context/provider |
| `src/hooks/.gitkeep` | Thư mục custom hooks |
| `src/data/.gitkeep` | Thư mục mock data và preset |
| `src/constants/.gitkeep` | Thư mục hằng số (biểu giá điện, quy tắc ngân sách) |
| `src/lib/validators/.gitkeep` | Thư mục Zod schemas |
| `_workspace/01_analysis_requirements.md` | Đặc tả yêu cầu Prompt 1 |
| `_workspace/02_build_manifest.md` | Manifest này |

## 3. File chỉnh sửa

| File | Thay đổi |
|---|---|
| `prisma/schema.prisma` | Bổ sung trường `source` cho `DailyTransaction` để khớp type `DailyTransaction.source` |
| `next.config.mjs` | Tách thư mục build: dev dùng `.next-dev`, production dùng `.next` để tránh xung đột cache |
| `.gitignore` | Bổ sung `.next-dev/` |

## 4. Nhóm type đã xuất

### Thực thể lõi

| Type | Vai trò |
|---|---|
| `Profile` | Cấu hình thu nhập, khu vực, lối sống, quy tắc ngân sách |
| `CategoryGroup` | 3 nhóm NEEDS / WANTS / SAVINGS_DEBT |
| `ExpenseItem` | Hạng mục dự toán với tần suất, đơn giá, số lượng, priority |
| `DailyTransaction` | Nhật ký chi tiêu thực tế |

### Dữ liệu dẫn xuất

| Type | Vai trò |
|---|---|
| `ExpenseItemComputed` | Chi phí quy đổi tháng/ngày/năm, % thu nhập, giờ lao động |
| `CategoryGroupSummary` | Tổng hợp theo nhóm ngân sách |
| `MonthlyBreakdown` | Cơ cấu Needs / Wants / SavingsDebt |
| `BudgetRuleAnalysis` | Phân tích 50/30/20 và hạn mức an toàn |
| `DailySafeToSpend` | Hạn mức chi tiêu còn lại của ngày |
| `FinancialHealthSnapshot` | Ảnh chụp sức khỏe tài chính tổng hợp |

### Tính toán nâng cao

| Type | Vai trò |
|---|---|
| `ElectricityBillInput` / `ElectricityBillResult` | Tiền điện bậc thang EVN + VAT |
| `LatteFactorInput` / `LatteFactorResult` | Hiệu ứng ly cà phê và lãi kép |
| `CompoundInterestInput` / `CompoundInterestResult` | Mô phỏng tích lũy |
| `OptimizationOptions` / `OptimizationResult` | Thuật toán tự động cắt giảm |
| `RealHourlyWageInput` / `RealHourlyWageResult` | Quy đổi lương thực tế theo giờ |
| `WorkTimeConversion` | Quy đổi tiền ra giờ/phút lao động |
| `RunwayInput` / `RunwayResult` | Độ bền tài chính khi thất nghiệp |

### Mô phỏng & parser

| Type | Vai trò |
|---|---|
| `LifeEventPreset` / `LifeEventSelection` / `CustomLifeEvent` | Sự kiện cuộc sống |
| `WhatIfSimulationResult` / `SimulationComparisonPoint` | So sánh Baseline vs Simulated |
| `ParsedAmount` / `ParsedTransactionDraft` / `TextParserResult` | Smart Quick-Add parser |
| `CategoryKeywordRule` | Từ điển keyword phân loại |

### Lịch, backup, biểu đồ

| Type | Vai trò |
|---|---|
| `CalendarDay` / `CalendarHeatmapSummary` / `SavingStreak` | Heatmap và chuỗi ngày an toàn |
| `BackupPayload` / `ImportResult` / `ValidationResult<T>` | Export/Import JSON + Zod |
| `CategoryDistributionDatum` / `BudgetRuleComparisonDatum` / `SavingsProjectionDatum` | Dữ liệu Recharts |
| `DualLineDatum` / `SankeyData` / `SunburstNodeDatum` / `HeatmapCellDatum` | Biểu đồ nâng cao |

### Store & API

| Type | Vai trò |
|---|---|
| `LivingCostState` / `LivingCostActions` / `LivingCostStore` | Hợp đồng Zustand store |
| `UIState` / `FilterState` / `SortState` | Trạng thái giao diện |
| `ProfileDTO` / `ExpenseItemDTO` / `DailyTransactionDTO` | DTO cho Prisma/API |
| `ApiResponse<T>` / `PaginatedResult<T>` | Response contracts |
| `FrequencyDefinition` / `CategoryDefinition` / `LivingCostPreset` | Metadata cấu hình |

## 5. Lệnh kiểm chứng

```powershell
npm run typecheck
npm run build
```

---

# BUILD MANIFEST — PROMPT 2

## 1. File chỉnh sửa

| File | Thay đổi |
|---|---|
| `prisma/schema.prisma` | Đổi `ExpenseItem.groupCode` → `group`; thêm index `group`; đổi quan hệ Profile sang `onDelete: Restrict` để bảo vệ dữ liệu |
| `prisma/seed.ts` | Viết lại toàn bộ: 1 profile, 3 category group, 26 expense item thực tế Việt Nam; log tổng dự toán theo nhóm |
| `src/types/living-cost.types.ts` | Đồng bộ `ExpenseItem.group` với schema |
| `README.md` | Cập nhật mô tả seed 26 khoản mục |

## 2. Dữ liệu seed

| Nhóm | Số khoản mục | Tổng/tháng |
|---|---:|---:|
| NEEDS — Thiết yếu | 11 | 11.502.200đ |
| WANTS — Mong muốn | 11 | 6.430.000đ |
| SAVINGS_DEBT — Tiết kiệm & Trả nợ | 4 | 3.500.000đ |
| **Tổng** | **26** | **21.432.200đ** |

Thu nhập mẫu: 20.000.000đ/tháng → thâm hụt 1.432.200đ/tháng, phù hợp để
demo cảnh báo ngân sách và thuật toán tối ưu ở Prompt 3.

## 3. Hợp đồng dữ liệu

| Kiểm tra | Kết quả |
|---|---|
| `Profile.monthlyIncome = 20.000.000` | PASS |
| `CategoryGroup.code` unique 3 giá trị | PASS |
| `ExpenseItem.group` khớp union `CategoryGroupCode` | PASS |
| `DailyTransaction.source` khớp `TransactionSource` | PASS |
| Seed idempotent (chạy lại: 0 tạo mới, 26 cập nhật) | PASS |

## 4. Lệnh kiểm chứng

```powershell
npx prisma db push
npm run db:seed
npm run typecheck
npm run build
```

---

# BUILD MANIFEST — PROMPT 3

## 1. File tạo mới

| File | Mô tả |
|---|---|
| `src/constants/finance.ts` | Hệ số tần suất, biểu giá điện EVN 6 bậc, quy tắc 50/30/20, metadata nhóm và payment method |
| `src/lib/calculator/date.ts` | ISO date, khoảng tháng, số ngày còn lại, kiểm tra ngày trong tháng |
| `src/lib/calculator/frequency.ts` | `normalizeToMonthly`, `normalizeToDaily`, `normalizeToYearly`, `calculateExpenseItemCosts` |
| `src/lib/calculator/electricity.ts` | `calculateVietnamElectricityBill`, chi tiết từng bậc và VAT 8% |
| `src/lib/calculator/budget.ts` | `analyzeBudgetRule`, `calculateDailySafeToSpend`, `calculateMonthlyBreakdown` |
| `src/lib/calculator/latte-factor.ts` | `calculateLatteFactor`, `calculateFutureValue`, `calculateCompoundInterest` |
| `src/lib/calculator/optimizer.ts` | `autoOptimizeLivingCost` với chiến lược ưu tiên và giới hạn cắt giảm |
| `src/lib/calculator/runway.ts` | `calculateFinancialRunway` cho kịch bản tiêu chuẩn và sinh tồn |
| `src/lib/calculator/engine.ts` | Tổng hợp category summaries và `FinancialHealthSnapshot` |
| `src/lib/calculator/index.ts` | Barrel export cho toàn bộ engine |
| `src/data/mock-data.ts` | Profile, 3 nhóm ngân sách, 26 khoản mục mock khớp seed, UI state mặc định |
| `src/store/useLivingCostStore.ts` | Zustand + Immer + persist, CRUD, optimization, backup, simulation, UI actions |
| `tests/calculator.test.ts` | Test công thức tài chính và edge cases |
| `tests/store.test.ts` | Test store CRUD, optimization, backup, simulation, UI |

## 2. File chỉnh sửa

| File | Thay đổi |
|---|---|
| `package.json` | Thêm script `npm test` chạy Node test runner qua `tsx` |
| `src/types/living-cost.types.ts` | Thêm `simulationExpenseDelta` vào state và action `setHydrated` |
| `README.md` | Cập nhật mô tả engine/store và lệnh test |

## 3. API chính

### Quy đổi & ngân sách

| Hàm | Kết quả |
|---|---|
| `normalizeToMonthly(input)` | Chi phí quy đổi tháng |
| `normalizeToDaily(input)` | Chi phí quy đổi ngày |
| `calculateExpenseItemCosts(input)` | `{ monthly, daily, yearly }` |
| `calculateVietnamElectricityBill(kwh)` | Chi tiết 6 bậc, subtotal, VAT, tổng, giá trung bình |
| `analyzeBudgetRule(profile, items, transactions, options)` | `BudgetRuleAnalysis` đầy đủ |
| `calculateDailySafeToSpend(...)` | `DailySafeToSpend` |
| `calculateLatteFactor(input)` | Dự phóng 1/5/10 năm |
| `autoOptimizeLivingCost(items, options)` | `OptimizationResult` |
| `calculateFinancialHealth(...)` | `FinancialHealthSnapshot` |
| `calculateCategorySummaries(...)` | `CategoryGroupSummary[]` |

### Store actions

`updateProfile`, `applyQuickSetup`, `addExpenseItem`, `updateExpenseItem`,
`removeExpenseItem`, `toggleExpenseItem`, `reorderExpenseItems`, `addTransaction`,
`updateTransaction`, `removeTransaction`, `addParsedTransactions`,
`applyOptimization`, `revertOptimization`, `setSimulation`, `applySimulation`,
`resetSimulation`, `loadDemoData`, `importBackup`, `exportBackup`,
`setActiveTab`, `setViewMode`, `setFilters`, `resetFilters`, `setSort`,
`setCommandPaletteOpen`, `setOptimizationOpen`, `setWhatIfOpen`,
`setDataManagerOpen`, `setHydrated`, `resetAll`.

## 4. Công thức & quyết định kỹ thuật

- Tần suất: `30.44` ngày/tháng, `4.345` tuần/tháng, `1/12` cho YEARLY.
- Điện: 6 bậc theo Quyết định 1279/QĐ-BCT (10/05/2025), VAT 8%.
- Safe-to-Spend: không trừ trùng khoản tiết kiệm; dự trữ = max(savings goal,
  tổng kế hoạch SAVINGS_DEBT).
- Latte Factor: annuity-due, lãi suất tháng = năm / 12.
- Optimizer: mặc định chỉ cắt khoản linh hoạt priority >= 3, giữ khoản cố định và
  tiết kiệm; mỗi vòng giảm tối đa 50% số lượng, lặp đến khi đạt mục tiêu.
- Persist dùng localStorage khi có `window`, fallback memory storage khi SSR/test.

## 5. Kiểm chứng

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

Kết quả: 35 test PASS, typecheck PASS, lint PASS, production build PASS.

---

# BUILD MANIFEST — PROMPT 4

## 1. File tạo mới

| File | Mô tả |
|---|---|
| `src/constants/presets.ts` | 3 preset sinh hoạt, khoảng thu nhập, tỷ lệ tiết kiệm gợi ý và `PRESET_SCALING` |
| `src/lib/dashboard.ts` | Tạo dữ liệu donut cơ cấu chi phí và so sánh 50/30/20 |
| `src/lib/export-plan.ts` | Tạo CSV UTF-8 BOM, tải file, tạo HTML bản in PDF và mở cửa sổ in |
| `src/hooks/useDashboardData.ts` | Gom profile, chi phí đã định giá điện, financial health, chart data, optimization |
| `src/hooks/useMounted.ts` | Guard mount cho Recharts/ResponsiveContainer |
| `src/components/dashboard/AnimatedCounter.tsx` | Số liệu nhảy số bằng Framer Motion |
| `src/components/dashboard/DashboardHeader.tsx` | Header local-first, trạng thái lưu, ngày, nút khôi phục dữ liệu mẫu |
| `src/components/dashboard/DashboardClient.tsx` | Ghép bố cục 60/40, action bar, modal và footer |
| `src/components/dashboard/QuickSetupBar.tsx` | Nhập thu nhập, mục tiêu tiết kiệm, chọn preset |
| `src/components/dashboard/ExpenseBuilder.tsx` | 3 tab, summary nhóm, danh sách khoản chi, nút thêm |
| `src/components/dashboard/ExpenseRow.tsx` | Switch, frequency, slider/stepper, chi phí tháng/ngày, hóa đơn điện |
| `src/components/dashboard/ExpenseIcon.tsx` | Map icon Lucide theo tên khoản mục/nhóm |
| `src/components/dashboard/AddExpenseDialog.tsx` | Form modal thêm khoản chi tùy chỉnh |
| `src/components/dashboard/FinancialHealthCard.tsx` | Hero card sức khỏe tài chính và daily burn rate |
| `src/components/dashboard/OptimizationDialog.tsx` | Modal gợi ý AI, áp dụng và hoàn tác |
| `src/components/dashboard/ExportPlanDialog.tsx` | Modal chọn CSV hoặc PDF/bản in |
| `src/components/charts/ChartSkeleton.tsx` | Skeleton chờ mount biểu đồ |
| `src/components/charts/CategoryDonutChart.tsx` | Donut cơ cấu chi phí + legend + % thu nhập đã dùng |
| `src/components/charts/BudgetRuleChart.tsx` | Stacked bar thực tế/mục tiêu 50/30/20 + cảnh báo |
| `src/components/charts/SavingsProjectionChart.tsx` | Area + line tích lũy 5 năm, lãi kép 8%/năm |
| `src/components/ui/badge.tsx` | Shadcn Badge |
| `src/components/ui/button.tsx` | Shadcn Button |
| `src/components/ui/card.tsx` | Shadcn Card |
| `src/components/ui/dialog.tsx` | Shadcn Dialog |
| `src/components/ui/input.tsx` | Shadcn Input |
| `src/components/ui/label.tsx` | Shadcn Label |
| `src/components/ui/progress.tsx` | Shadcn Progress |
| `src/components/ui/select.tsx` | Shadcn Select |
| `src/components/ui/slider.tsx` | Shadcn Slider |
| `src/components/ui/switch.tsx` | Shadcn Switch |
| `src/components/ui/tabs.tsx` | Shadcn Tabs |

## 2. File chỉnh sửa

| File | Thay đổi |
|---|---|
| `src/app/page.tsx` | Thay placeholder setup bằng `<DashboardClient />` |
| `src/store/useLivingCostStore.ts` | `applyQuickSetup` áp dụng `PRESET_SCALING` cho các item mock đã biết |
| `src/lib/utils.ts` | Bổ sung `formatCompactVnd`, `formatSignedVnd`, `formatQuantity`, `formatPercentage` |
| `README.md` | Cập nhật mô tả dashboard, cấu trúc component và cách kiểm tra |
| `_workspace/01_analysis_requirements.md` | Bổ sung đặc tả Prompt 4 |
| `_workspace/02_build_manifest.md` | Manifest này |
| `_workspace/03_qa_report.md` | Báo cáo QA Prompt 4 |

## 3. Kiến trúc UI

```text
HomePage (server)
└── DashboardClient (client)
    ├── DashboardHeader
    ├── QuickSetupBar
    ├── ExpenseBuilder
    │   ├── Tabs (NEEDS / WANTS / SAVINGS_DEBT)
    │   ├── ExpenseRow
    │   └── AddExpenseDialog
    ├── FinancialHealthCard
    ├── CategoryDonutChart
    ├── BudgetRuleChart
    ├── SavingsProjectionChart
    ├── Action Bar
    │   ├── OptimizationDialog
    │   └── ExportPlanDialog
    └── Footer
```

`useDashboardData` tạo một nguồn dữ liệu dẫn xuất duy nhất:

- `rawExpenseItems`: dữ liệu store dùng để chỉnh sửa.
- `expenseItems`: đã thay đơn giá điện bằng giá bình quân từ hóa đơn EVN.
- `financialHealth`: tổng, net cashflow, safe-to-spend, health score.
- `categorySummaries`, `distribution`, `budgetComparison`, `savingsData`.
- `optimization`: kết quả `autoOptimizeLivingCost` theo mục tiêu hiện tại.

## 4. Quyết định kỹ thuật

- **Điện bậc thang:** dashboard tính `bill.total / kWh` cho item điện; store giữ
  `unitPrice` gốc 3.500đ. Vì vậy mock 250 kWh hiển thị 636.768đ thay vì 875.000đ.
- **Preset:** chỉ reset các item có ID trong `MOCK_EXPENSE_ITEMS`; item tự thêm
  và trạng thái `isEnabled` được giữ nguyên.
- **Biểu đồ:** tất cả component Recharts là client component, có `useMounted` và
  skeleton để tránh render responsive container trên server.
- **Biểu đồ tích lũy:** dùng `ComposedChart` để vẽ đồng thời Area (số dư) và Line
  (tiền đã góp); nếu net cashflow âm, hiển thị cảnh báo thay vì tạo số liệu ảo.
- **Optimizer:** `WANTS_FIRST`, `minPriority=3`, `maxReductionRate=50`,
  giữ khoản cố định và SAVINGS_DEBT; modal cho phép áp dụng/hoàn tác.
- **Export:** CSV có BOM `EF BB BF`; PDF dùng HTML in trong cửa sổ mới, không thêm
  thư viện. Đã bỏ `noopener` khỏi `window.open` để tránh trình duyệt trả `null`
  dù cửa sổ vẫn mở.

## 5. Kiểm chứng

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

Kết quả Prompt 4: typecheck PASS, lint PASS, 35/35 test PASS, production build PASS.
Route `/` có First Load JS khoảng 325 kB (bao gồm Recharts).

---

# BUILD MANIFEST — PROMPT 5

## 1. File tạo mới

| File | Mô tả |
|---|---|
| `src/lib/calculator/calendar.ts` | `buildCalendarHeatmap`, phân loại ngày, saving streak, average/ngày |
| `src/lib/calculator/textParser.ts` | Parser tiếng Việt, keyword phân loại, shorthand tiền tệ, chia người |
| `src/lib/calculator/simulation.ts` | `simulateWhatIf`, dự phóng 3 năm, `buildSimulationApplyPayload` |
| `src/constants/life-events.ts` | 5 preset sự kiện và tỷ lệ tăng lương/creep |
| `src/data/demo-transactions.ts` | Sinh giao dịch demo xác định từ ngày 1 đến hôm nay |
| `src/lib/validators/backup.ts` | Zod schema cho profile, item, transaction, metadata backup |
| `src/components/dashboard/FinancialRunwayCard.tsx` | Quỹ hiện có, runway chuẩn/sinh tồn, gauge màu |
| `src/components/dashboard/SpendingCalendarHeatmap.tsx` | Heatmap tháng + streak + legend |
| `src/components/dashboard/WhatIfSimulatorModal.tsx` | Panel What-If, preset, sự kiện tùy chỉnh, chart 2 đường |
| `src/components/dashboard/FinancialAnalysisTabs.tsx` | 3 tab đồng bộ `ui.activeTab` |
| `src/components/dashboard/SmartCommandInput.tsx` | Smart Quick-Add + Ctrl K + preview + tiến độ ngân sách |
| `src/components/dashboard/DataManagerDialog.tsx` | Xuất/nhập JSON Zod và nạp demo |

## 2. File chỉnh sửa

| File | Thay đổi |
|---|---|
| `src/lib/calculator/engine.ts` | `calculateRealHourlyWage`, `convertMoneyToWorkTime`, `estimateWorkRelatedExpenses` |
| `src/lib/calculator/budget.ts` | Tách `calculateMonthlyVariableBudget` dùng chung |
| `src/lib/calculator/index.ts` | Export calendar, simulation, textParser |
| `src/types/living-cost.types.ts` | `newExpenseItems` trong payload; `importBackup(unknown)` |
| `src/store/useLivingCostStore.ts` | Áp dụng item giả lập, demo transactions, Zod backup |
| `src/hooks/useDashboardData.ts` | Work time, calendar, spending progress, budget items |
| `src/components/dashboard/DashboardClient.tsx` | Bố cục mới, cột phải kéo dài, runway/tabs/parser/data manager |
| `src/components/dashboard/DashboardHeader.tsx` | Toggle giờ lao động, nút quản lý dữ liệu |
| `src/components/dashboard/QuickSetupBar.tsx` | Ô tên người dùng + hồ sơ thời gian làm việc |
| `src/components/dashboard/ExpenseRow.tsx` | Ô sửa đơn giá, hiển thị giờ lao động |
| `src/components/dashboard/ExpenseBuilder.tsx` | Truyền work-time props, tổng giờ nhóm |
| `src/components/charts/CategoryDonutChart.tsx` | `centerValue`/`centerLabel` tùy biến |
| `tests/calculator.test.ts`, `tests/store.test.ts` | Work time, parser, calendar, simulation, demo, Zod |
| `README.md`, `_workspace/*` | Tài liệu Prompt 5 và bản sửa UI |

## 3. Quyết định kỹ thuật

- **Lương thực tế:** `(thu nhập − chi phí đi làm) / ((giờ làm + giờ di chuyển) ×
  ngày làm)`. Khoản đi làm gồm `item-transport`, `item-parking`, `item-lunch` và
  từ khóa xăng/grab/gửi xe/ăn trưa.
- **Heatmap:** định mức ngày = ngân sách linh hoạt tháng / số ngày trong tháng;
  ngày tương lai bị loại khỏi thống kê; streak tính các ngày liên tiếp không vượt
  định mức, bao gồm ngày không chi.
- **What-If:** dự phóng từ quỹ hiện có, cộng lại khoản tiết kiệm vào dòng tiền
  ròng, lãi kép 8%/năm; chi phí tạm thời chỉ áp dụng trong số tháng preset.
- **Parser:** hỗ trợ `k/ngàn/nghìn` ×1.000, `lít/trăm` ×100.000,
  `tr/triệu/củ` ×1.000.000, `đ/vnđ/vnd`, `chia N người`; nhận diện không dấu.
- **Backup:** Zod validate trước khi mutate; file sai cấu trúc trả về danh sách
  lỗi có path/message/code.
- **UI:** cột phải không còn sticky/max-height nội bộ để nội dung dài kéo theo
  trang; đơn giá từng khoản sửa trực tiếp (điện EVN vẫn theo bậc thang); tên
  người dùng sửa trong Thiết lập nhanh.

## 4. Kiểm chứng

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

Kết quả Prompt 5: typecheck PASS, lint PASS, 56/56 test PASS, production build
PASS. Route `/` có First Load JS khoảng 349 kB.

## 5. Bổ sung điều hướng đa trang (Taskbar)

Yêu cầu follow-up: thêm thanh taskbar chọn trang, mặc định mở Sức Khỏe Tài
Chính, bấm biểu tượng ví ở góc trái để về Trang Đầu.

### File tạo mới

| File | Mô tả |
|---|---|
| `src/lib/dashboard-view.ts` | `DASHBOARD_HOME_VIEW`, `resolveDashboardView` chống dữ liệu persist cũ |
| `src/components/dashboard/DashboardNav.tsx` | Taskbar sticky 3 trang + mục "Sắp có" cho Prompt 6 |
| `src/components/dashboard/QuickActionsCard.tsx` | Tách khối hành động nhanh để dùng lại ở nhiều trang |

### File chỉnh sửa

| File | Thay đổi |
|---|---|
| `src/types/living-cost.types.ts` | `DashboardViewId`, `UIState.activeView`, action `setActiveView` |
| `src/data/mock-data.ts` | `INITIAL_UI_STATE.activeView = "HEALTH"` |
| `src/store/useLivingCostStore.ts` | Action `setActiveView`; rehydrate tự chuẩn hóa view cũ thiếu trường; không persist trang đang chọn để mỗi lần load về Trang Đầu |
| `src/components/dashboard/DashboardHeader.tsx` | Logo ví thành nút về Trang Đầu |
| `src/components/dashboard/DashboardClient.tsx` | Render theo trang, tiêu đề/mô tả riêng, bố cục 2 cột mỗi trang |
| `tests/store.test.ts` | Assert view mặc định HEALTH và đổi view |
| `README.md` | Mục "Điều hướng & các trang" |

---

# BUILD MANIFEST — PROMPT 6

## 1. File tạo mới

| File | Mô tả |
|---|---|
| `src/constants/daily-expenses.ts` | 6 danh mục chi tiêu ngày (Ăn uống / Đi lại / Hóa đơn / Mua sắm / Giải trí / Phát sinh khác), nguồn tiền Tiền mặt / Rút quỹ, 6 preset gợi ý 1-chạm |
| `src/lib/daily.ts` | Tra cứu danh mục, suy đoán danh mục từ tiêu đề, map danh mục parser, nhãn ngày timeline |
| `src/lib/calculator/ledger.ts` | `createMonthlyRecords`, `sumMonthlySpent`, `sumTransactionsByMonth`, `getContributedNet`, `computeVaultBalance`, `resolveMonthlyLedger`, month key/label |
| `src/components/dashboard/DailyExpenseTracker.tsx` | 6 chip 1-chạm, form chi tiết (ngày/danh mục/số tiền/nguồn tiền/ghi chú), dòng thời gian theo ngày + badge an toàn, sửa ghi chú, xóa |
| `src/components/dashboard/MonthlySavingsLedger.tsx` | Két sắt quỹ (quỹ gốc, biến động tích lũy, số dư thực tế), sổ 12 tháng âm/dương + chốt sổ, biểu đồ cột + đường lũy kế |

## 2. File chỉnh sửa

| File | Thay đổi |
|---|---|
| `src/types/living-cost.types.ts` | `PaymentSource`, `DailyExpenseCategoryCode`, `MonthlyLedgerMode`, `MonthKey`; `DailyTransaction.paymentSource/categoryCode`; `MonthlyRecord`, `MonthlyRecordPatch`, `MonthlyRecordResolved`, `MonthlyLedgerSummary`; `DashboardViewId` thêm `"LEDGER"`; state thêm `initialSavingsFund`/`monthlyRecords`; action `setInitialSavingsFund`/`updateMonthlyRecord`; `ImportResult.importedMonthlyRecords`; `BackupPayload` thêm 2 trường tùy chọn |
| `src/lib/calculator/index.ts` | Export module ledger |
| `src/lib/dashboard-view.ts` | `"LEDGER"` là view hợp lệ, vẫn fallback HEALTH |
| `src/data/demo-transactions.ts` | Mỗi giao dịch demo có `categoryCode` và `paymentSource` (một số khoản cuối tuần rút từ quỹ) |
| `src/lib/validators/backup.ts` | Schema tùy chọn cho 2 trường giao dịch mới + `monthlyRecordSchema` + 2 trường ledger tùy chọn |
| `src/store/useLivingCostStore.ts` | Seed `initialSavingsFund`/`monthlyRecords`; action `setInitialSavingsFund`, `updateMonthlyRecord` (gồm chốt sổ AUTO→MANUAL); `addTransaction`/`addParsedTransactions` điền trường mới; export/import backup giữ sổ tháng; `merge` rehydrate bù dữ liệu cũ; `partialize` thêm 2 trường |
| `src/hooks/useDashboardData.ts` | `resolveMonthlyLedger`, `savingsVault`, profile override cho health/runway, effect đồng bộ quỹ vào `profile.currentSavings` |
| `src/components/dashboard/DashboardNav.tsx` | Trang thứ 4 hoạt động (bỏ mục "Sắp có") |
| `src/components/dashboard/DashboardClient.tsx` | View `"LEDGER"` với bố cục 2 cột; `VIEW_META` mới; truyền `savingsVault` cho thẻ runway |
| `src/components/dashboard/FinancialRunwayCard.tsx` | Ô nhập "Quỹ tiết kiệm ban đầu" chỉnh `initialSavingsFund`; hiển thị số dư quỹ hiện tại sau ± các tháng |
| `src/components/dashboard/DataManagerDialog.tsx` | Thông báo nhập backup kèm số tháng sổ quỹ |
| `prisma/schema.prisma` | `Profile.initialSavingsFund`; `DailyTransaction.paymentSource/categoryCode`; model `MonthlyRecord` (unique theo profile + tháng) |
| `prisma/seed.ts` | Profile mẫu có `initialSavingsFund: 50000000` |
| `tests/calculator.test.ts`, `tests/store.test.ts` | Test ledger, action quỹ, chốt sổ, backup round-trip; thêm trường mới cho giao dịch mẫu |
| `README.md` | Mục "Sổ chi tiêu & Quỹ tiết kiệm (Prompt 6)", cập nhật điều hướng 4 trang, cấu trúc dự án |

## 3. Quyết định kỹ thuật

- **Công thức két sắt:** `quỹ thực tế = quỹ gốc + Σ contributedNet`. Tháng
  `MANUAL` góp `manualNetBalance ?? 0` và cộng/trừ ngay khi nhập. Tháng `AUTO`
  hiển thị số dư dự kiến (`thu nhập − chi tiêu đã ghi`) nhưng chỉ vào quỹ sau
  khi **Chốt sổ** (store chụp lại thành `MANUAL` + `isSettled`). Nhờ vậy quỹ
  không bị cộng trước cả tháng lương khi chưa chi.
- **Đồng bộ:** `profile.currentSavings` là bản phản chiếu của quỹ thực tế; store
  cập nhật khi sửa quỹ gốc/chốt sổ, hook đồng bộ nốt khi nạp state cũ, nên
  What-If, runway và Data Manager vẫn đọc đúng.
- **Chốt sổ:** nút 🔒 khóa chỉnh sửa tháng; tháng AUTO khi chốt tự snapshot
  `income − tổng chi tháng`; mở khóa để chỉnh lại, có thể đưa về chế độ AUTO.
- **Badge an toàn ngày:** so tổng chi trong ngày với định mức ngày của heatmap
  (ngân sách linh hoạt / số ngày trong tháng); xanh khi trong tầm, đỏ khi vượt.
- **Tương thích ngược:** `paymentSource`, `categoryCode`, `initialSavingsFund`,
  `monthlyRecords` đều tùy chọn khi validate; persist `merge` và `importBackup`
  tự suy luận danh mục từ tiêu đề, mặc định `CASH`, lấy `currentSavings` làm quỹ
  gốc và sinh 12 tháng mới nếu thiếu.
- **Prisma:** model `MonthlyRecord` khớp type `MonthlyRecord`; `db push` không
  phá dữ liệu cũ (thêm cột có default + bảng mới).

## 4. Kiểm chứng

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

Kết quả Prompt 6: typecheck PASS, lint PASS, 62/62 test PASS, production build
PASS. Route `/` First Load JS khoảng 362 kB (thêm component ledger + Recharts).
