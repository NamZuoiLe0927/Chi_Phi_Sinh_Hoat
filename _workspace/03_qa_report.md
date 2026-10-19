# QA VERIFICATION REPORT — PROMPT 1

## Overall Verdict

**PASS**

## 1. Contract & Boundary Audit

| Hạng mục | Kết quả |
|---|---|
| `Profile` khớp `prisma/schema.prisma` | PASS |
| `CategoryGroup` khớp schema | PASS |
| `ExpenseItem` khớp schema | PASS |
| `DailyTransaction` khớp schema (đã bổ sung `source`) | PASS |
| Type `VndAmount` dùng nhất quán cho tiền VNĐ | PASS |
| Ngày dùng `ISODateString`, timestamp dùng `ISODateTimeString` | PASS |
| Không có `any` trong file types | PASS |

## 2. Type System Coverage

| Prompt | Nhóm type đã có |
|---|---|
| Prompt 1 | Profile, CategoryGroup, ExpenseItem, DailyTransaction, preset, DTO |
| Prompt 2 | DTO, CategoryGroup, ExpenseItem, DailyTransaction, BackupPayload |
| Prompt 3 | ElectricityBill, BudgetRuleAnalysis, LatteFactor, Optimization, RealHourlyWage |
| Prompt 4 | CategoryDistributionDatum, BudgetRuleComparisonDatum, SavingsProjectionDatum |
| Prompt 5 | RunwayResult, WhatIfSimulationResult, TextParserResult, CalendarHeatmapSummary, ImportResult |

## 3. Compile & Build

```text
tsc --noEmit               PASS
next build                 PASS
next dev (localhost:3000)  PASS - HTTP 200
```

Dev dùng `distDir = .next-dev`, production dùng `.next` để tránh xung đột cache khi
chạy build trong lúc dev server đang hoạt động.

## 4. Safety Compliance

- Không xóa file hay thư mục nào.
- Chỉ tạo mới file/thư mục và chỉnh sửa cục bộ `prisma/schema.prisma`.
- Không chạy lệnh phá hủy dữ liệu.
- Tuân thủ `Rule_Project.md`.

## 5. Defects

Không phát hiện lỗi.

---

# QA VERIFICATION REPORT — PROMPT 2

## Overall Verdict

**PASS**

## 1. Database Verification

| Kiểm tra | Kết quả |
|---|---|
| Profiles | 1 |
| Category groups | 3 (NEEDS / WANTS / SAVINGS_DEBT) |
| Expense items | 26 |
| Daily transactions | 0 (ngoài phạm vi Prompt 2) |
| Schema sync (`prisma db push`) | PASS |

## 2. Financial Totals

| Nhóm | Tổng/tháng |
|---|---:|
| NEEDS | 11.502.200đ |
| WANTS | 6.430.000đ |
| SAVINGS_DEBT | 3.500.000đ |
| **Tổng dự toán** | **21.432.200đ** |
| Thu nhập mẫu | 20.000.000đ |
| Chênh lệch | -1.432.200đ |

## 3. Idempotency

Chạy `npm run db:seed` lần hai:

```text
Khoản mục: 26 (tạo mới: 0, cập nhật: 26)
```

Không nhân đôi bản ghi.

## 4. Compile & Build

```text
tsc --noEmit      PASS
next build        PASS
```

## 5. Safety Compliance

- Không xóa file/thư mục.
- Quan hệ `Profile` chuyển sang `onDelete: Restrict` để tránh cascade xóa dữ liệu.
- Chỉ cập nhật bản ghi seed có ID cố định; không đụng dữ liệu người dùng khác.
- Tuân thủ `Rule_Project.md`.

## 6. Defects

Không phát hiện lỗi.

---

# QA VERIFICATION REPORT — PROMPT 3

## Overall Verdict

**PASS**

## 1. Contract & Boundary Audit

| Hạng mục | Kết quả |
|---|---|
| Type engine khớp `src/types/living-cost.types.ts` | PASS |
| `ExpenseItem.group` được dùng nhất quán thay cho `groupCode` cũ | PASS |
| Store state có đủ profile, groups, items, transactions, UI, optimization | PASS |
| Store actions khớp `LivingCostActions` sau khi bổ sung `setHydrated` | PASS |
| Persist localStorage có fallback memory khi SSR/test | PASS |
| Mock data 26 khoản mục khớp dữ liệu seed | PASS |
| Không có `any` mới trong engine/store | PASS |

## 2. Financial Calculation Verification

| Kịch bản | Kết quả |
|---|---|
| DAILY 35.000đ × 30.44 | 1.065.400đ — PASS |
| WEEKLY 300.000đ × 2 × 4.345 | 2.607.000đ — PASS |
| YEARLY 12.000.000đ / 12 | 1.000.000đ — PASS |
| Điện 250 kWh | subtotal 589.600đ, VAT 47.168đ, tổng 636.768đ — PASS |
| Điện 400 kWh | subtotal 1.074.500đ, VAT 85.960đ, tổng 1.160.460đ — PASS |
| Điện 500 kWh (bậc 6) | subtotal 1.420.500đ, VAT 113.640đ, tổng 1.534.140đ — PASS |
| Điện 0,5 kWh | subtotal 992đ, VAT 79,36đ, tổng 1.071,36đ — PASS |
| Điện 0 kWh | tất cả 0, không chia cho 0 — PASS |
| Tổng dự toán mock | NEEDS 11.502.200đ, WANTS 6.430.000đ, SAVINGS 3.500.000đ, tổng 21.432.200đ — PASS |
| Khoản bị tắt | Bị loại khỏi mọi tổng và % — PASS |
| Tỷ lệ thực tế | 57,511% / 32,15% / 17,5% — PASS |
| Thâm hụt | −1.432.200đ — PASS |
| Safe-to-Spend 19/10/2026 | ngân sách 9.657.000đ / 13 ngày = 742.846,15đ/ngày — PASS |
| Latte Factor 750.000đ, 8%/năm | FV 1 năm khớp annuity-due; 5 năm > 1 năm; 10 năm > 5 năm — PASS |
| Optimizer mục tiêu 18.000.000đ | đạt mục tiêu, tổng tiết kiệm >= 3.432.200đ — PASS |
| Optimizer giữ khoản cố định/tiết kiệm | Không gợi ý cắt rent, gym, Netflix, savings — PASS |
| Optimizer `maxReductionRate = 0` | Không cắt khoản nào — PASS |
| Runway 50 triệu, chi 20 triệu | 2 tháng 15 ngày, trạng thái DANGER — PASS |
| Runway chi phí 0 | Không chia cho 0, trạng thái SAFE — PASS |
| Empty list / zero income | Tổng 0, % 0, không lỗi — PASS |
| Leap day 29/02/2024 và 31/12/2024 | Khoảng tháng và remaining days đúng — PASS |

## 3. Test Suite

```text
node --import tsx --test tests/calculator.test.ts tests/store.test.ts
tests 35
pass 35
fail 0
```

Bao phủ thêm:

- Store CRUD khoản chi, giữ giao dịch khi xóa khoản chi.
- Apply/revert optimization.
- Export/import backup và reject payload lỗi.
- Apply simulation và reset.
- UI filters/sort/tabs.

## 4. Compile, Lint & Build

```text
npm run typecheck   PASS
npm run lint        PASS
npm test            PASS (35/35)
npm run build       PASS
```

## 5. Safety Compliance

- Không xóa file hoặc thư mục nào.
- Chỉ tạo mới file engine/store/test và chỉnh sửa cục bộ types, package.json, README.
- Xóa khoản chi trong store chỉ cập nhật state; giao dịch lịch sử được giữ lại với
  `expenseItemId = null`.
- `importBackup` validate cấu trúc tối thiểu trước khi thay state.
- Tuân thủ `Rule_Project.md`.

## 6. Defects

Không phát hiện lỗi.

## 7. Ghi chú phạm vi

- `DailyTransaction` demo cho cả tháng vẫn để trống; sẽ được nạp ở Prompt 5 theo
  yêu cầu "Nạp Dữ liệu Demo Mẫu".
- UI dashboard, modal optimization, what-if và parser tiếng Việt chưa triển khai
  trong Prompt 3.

---

# QA VERIFICATION REPORT — PROMPT 4

## Overall Verdict

**PASS**

## 1. UI/UX Audit

| Hạng mục | Kết quả |
|---|---|
| Nền `bg-slate-950`, accent Emerald/Amber/Rose | PASS |
| Bố cục 60/40 trên desktop; cột phải sticky | PASS — kiểm tra ảnh viewport 1440px |
| Một cột trên mobile/tablet 800px | PASS |
| Quick Setup có income input + slider, savings input + slider | PASS |
| Đủ 3 preset Sinh viên / Độc thân / Gia đình | PASS |
| Preset đang phù hợp được highlight theo khoảng thu nhập | PASS |
| 3 tab Thiết yếu / Mong muốn / Tiết kiệm | PASS |
| Switch bật/tắt từng khoản chi | PASS |
| Chọn tần suất Ngày/Tuần/Tháng/Năm | PASS |
| Slider + nút `[-]`/`[+]` chỉnh số lượng | PASS |
| Hiển thị đơn giá, chi phí tháng, chi phí ngày | PASS |
| Nút thêm khoản chi tùy chỉnh và modal | PASS |
| Hero card động với điểm sức khỏe, daily burn rate, safe-to-spend | PASS |
| Donut cơ cấu chi phí + tâm % thu nhập đã dùng | PASS |
| Stacked bar 50/30/20 + cảnh báo đỏ | PASS |
| Area/line tích lũy 5 năm | PASS |
| Modal AI tối ưu + áp dụng/hoàn tác | PASS |
| Modal xuất PDF / Excel | PASS |
| Footer, responsive spacing, không tràn ngang | PASS |

## 2. Financial Consistency

### Dữ liệu mẫu mặc định

- 26 khoản mục đang bật, tổng thô trong mock: `21.432.200 ₫`.
- Điện 250 kWh được định giá lại theo EVN bậc thang + VAT 8%:
  `636.768 ₫` (thay cho 875.000đ nếu lấy 3.500đ × 250).
- Tổng dashboard: `21.193.968 ₫`; số dư cuối tháng: `-1.193.968 ₫`.
- Tỷ lệ thu nhập đã dùng: `106%`; tỷ lệ tiết kiệm thực tế: `17,5%`.
- Tổng ba nhóm tab khớp tổng dashboard và khớp dữ liệu dùng cho 3 biểu đồ.

### Preset

| Preset | Thu nhập | Điện | Nhà | Kết quả |
|---|---:|---:|---:|---|
| Sinh viên | 6.000.000 ₫ | 80 kWh | 2.025.000 ₫ | Đơn giá/số lượng đổi đúng, không lỗi |
| Độc thân | 16.000.000 ₫ | 250 kWh | 4.500.000 ₫ | Tổng 21.193.968 ₫, mục tiêu 12.800.000 ₫ |
| Gia đình nhỏ | 32.500.000 ₫ | 450 kWh | 9.900.000 ₫ | Tổng 38.736.600 ₫, mục tiêu 26.000.000 ₫ |

- Preset chỉ tác động các item mock đã biết; item tự thêm và trạng thái bật/tắt
  được giữ nguyên.
- Nút preset đang phù hợp được highlight theo khoảng thu nhập; khi thu nhập nằm
  ngoài cả ba khoảng thì không highlight.

### Định giá điện

| kWh | Hóa đơn kỳ vọng | Kết quả UI/engine |
|---:|---:|---|
| 250 | 636.768 ₫ | PASS |
| 400 | 1.160.460 ₫ | PASS |
| 500 | 1.534.140 ₫ | PASS |

## 3. Interaction Verification

| Kịch bản | Kết quả |
|---|---|
| Tắt "Thuê nhà / Trọ" ở preset gia đình | Tab NEEDS giảm đúng 9.900.000 ₫; tổng và biểu đồ cập nhật ngay |
| Bật lại khoản thuê nhà | Tổng khôi phục đúng |
| Đổi income lên 50.000.000 ₫ | Số dư +11.263.400 ₫; chart tích lũy dương |
| Kiểm tra chart dương sau animation | Area + Line render; sau 5 năm khoảng 833 triệu ₫ |
| Mở modal AI tối ưu | Hiển thị gợi ý, tổng cắt tối đa 5.237.000 ₫ |
| Áp dụng tối ưu | Các khoản WANTS giảm, khoản cố định/tiết kiệm được giữ |
| Hoàn tác tối ưu | Khôi phục đúng số lượng trước đó |
| Thêm khoản chi tùy chỉnh | Item mới xuất hiện đúng tab, tổng cập nhật |
| Xuất CSV | Tải file 2.578 bytes, BOM `EF BB BF`, tiếng Việt đúng |
| Xuất PDF / bản in | Mở tab tiêu đề "Kế hoạch chi tiêu - Nguyễn Văn Minh", 26 dòng, 6 metric |
| Popup blocker | Đã bỏ `noopener` khỏi `window.open`; không còn cảnh báo giả khi cửa sổ in mở thành công |

## 4. Compile, Lint, Test & Build

```text
npm run typecheck   PASS
npm run lint        PASS
npm test            PASS (35/35)
npm run build       PASS
```

- Production route `/` static prerender thành công.
- First Load JS khoảng 325 kB, bao gồm Recharts.
- Không có lỗi hydration/console error sau khi reload sạch.

## 5. Safety Compliance

- Không xóa file, thư mục, database hay dữ liệu người dùng.
- Chỉ chỉnh sửa cục bộ các file UI/store/export/docs và thêm component mới.
- Điện bậc thang chỉ thay đổi dữ liệu dẫn xuất trên dashboard; đơn giá gốc trong
  store không bị ghi đè.
- Preset không xóa khoản chi tự thêm và không bật lại khoản người dùng đã tắt.
- Xuất CSV/PDF chỉ đọc dữ liệu hiện tại, không mutate state.
- Tuân thủ `Rule_Project.md` và không triển khai trước Prompt 5.

## 6. Defects

Không phát hiện lỗi chặn release.

## 7. Ghi chú

- Ảnh chụp headless có thể bắt đúng frame đầu của animation nên counter/chart có
  thể hiển thị 0 hoặc chưa vẽ; kiểm tra DOM sau animation và trình duyệt thật đã
  xác nhận số liệu/biểu đồ đúng.
- Hộp thoại in PDF do trình duyệt kiểm soát; nội dung bản in đã được kiểm tra
  trong tab in với đầy đủ 26 khoản chi và các metric tổng.
- `DailyTransaction` demo vẫn để trống; transaction demo, calendar heatmap,
  what-if và parser tiếng Việt thuộc Prompt 5.

---

# QA VERIFICATION REPORT — PROMPT 5

## Overall Verdict

**PASS**

## 1. Feature Audit

| Hạng mục | Kết quả |
|---|---|
| Lương thực tế theo giờ (trừ chi phí đi làm, cộng giờ di chuyển) | PASS |
| Chế độ xem `👁️ Hiển thị theo Giờ Lao Động` + quy đổi giờ ở từng khoản | PASS |
| Hồ sơ thời gian làm việc trong Thiết lập nhanh (giờ/ngày, ngày/tháng, di chuyển) | PASS |
| Thẻ Độ bền tài chính: quỹ hiện có, kịch bản chuẩn/sinh tồn, gauge 3–6–12 tháng | PASS |
| Heatmap tháng: no-spend, within-budget, over-budget, future, saving streak | PASS |
| Trung tâm phân tích 3 tab (Chi phí / Lịch sử / Giả lập) đồng bộ Zustand | PASS |
| What-If: 5 preset + sự kiện tùy chỉnh, biểu đồ 2 đường 3 năm, áp dụng/đặt lại | PASS |
| Áp dụng kịch bản tạo khoản chi mới và cộng thu nhập đúng | PASS |
| Smart Quick-Add: `k/ngàn/nghìn`, `tr/triệu/củ`, `lít/trăm`, `chia N người` | PASS |
| Ctrl + K focus ô nhập nhanh; preview chip trước khi lưu | PASS |
| Quản lý dữ liệu: xuất/nhập JSON + Zod, nạp demo cả tháng | PASS |
| Sửa đơn giá từng khoản chi trực tiếp; điện EVN vẫn theo bậc thang | PASS |
| Sửa tên người dùng trong Thiết lập nhanh, hiển thị lại ở thẻ sức khỏe | PASS |
| Cột phải kéo dài theo trang, không còn bị cắt trong khung sticky | PASS |

## 2. Financial Consistency

- Ngân sách linh hoạt tháng mặc định: `9.657.000 ₫`; định mức ngày
  `311.516 ₫` (tháng 10 có 31 ngày).
- Demo transactions chỉ sinh từ ngày 1 đến hôm nay, có ngày không chi và ngày
  cuối tuần vượt định mức; toàn bộ gắn `source = "DEMO"`.
- What-If baseline dùng `netCashflow + savings` và bắt đầu từ quỹ hiện có để
  kịch bản tăng chi thể hiện đúng mức hao hụt tài sản.
- Tăng lương 20%: thu nhập `+4.000.000 ₫`, lifestyle creep `643.000 ₫`
  (10% nhóm Mong muốn); kịch bản trả góp 12 tháng rút ngắn tài sản tích lũy.
- Backup JSON sai cấu trúc bị Zod chặn, không mutate state.

## 3. Test Suite

```text
node --import tsx --test tests/calculator.test.ts tests/store.test.ts
tests 56
pass 56
fail 0
```

Bổ sung so với Prompt 4: work-time conversion, parser tiếng Việt, calendar
heatmap, what-if simulation + apply payload, demo transactions, Zod backup,
store apply simulation và nạp demo.

## 4. Compile, Lint & Build

```text
npm run typecheck   PASS
npm run lint        PASS
npm test            PASS (56/56)
npm run build       PASS
```

- Route `/` static prerender thành công, First Load JS khoảng 349 kB.
- Kiểm tra trình duyệt: tên người dùng sửa được, đơn giá Thuê nhà sửa trực tiếp
  và tổng cập nhật tức thời; tab Giả lập không còn hiển thị chồng lên tab đang
  chọn; không có console error.

## 5. Safety Compliance

- Không xóa file, thư mục, database hay dữ liệu người dùng.
- Chỉ thêm file mới và chỉnh sửa cục bộ store/hook/UI/types/docs.
- `importBackup` nhận `unknown`, validate bằng Zod trước khi thay state.
- Điện bậc thang vẫn là dữ liệu dẫn xuất; không ghi đè đơn giá gốc trong store.
- Tuân thủ `Rule_Project.md`.

---

# QA — BỔ SUNG ĐIỀU HƯỚNG ĐA TRANG (FOLLOW-UP)

## Overall Verdict

**PASS**

| Hạng mục | Kết quả |
|---|---|
| Taskbar sticky dưới header với 3 trang hoạt động | PASS |
| Trang mặc định khi load: Sức Khỏe Tài Chính | PASS |
| Bấm logo ví góc trái quay về Trang Đầu | PASS |
| Mục "Chi Tiêu Theo Ngày, Tiết Kiệm Theo Tháng Âm Dương" hiển thị "Sắp có" | PASS |
| Mỗi lần load app luôn bắt đầu ở Trang Đầu (Sức Khỏe Tài Chính) | PASS |
| Dữ liệu cũ thiếu `activeView` tự fallback HEALTH, không làm mất dữ liệu | PASS |
| Chỉ trang đang chọn được render, không chồng nội dung giữa các trang | PASS |

```text
npm run typecheck   PASS
npm run lint        PASS
npm test            PASS (56/56)
npm run build       PASS (First Load JS ~351 kB)
```

---

# QA VERIFICATION REPORT — PROMPT 6

## Overall Verdict

**PASS**

## 1. Feature Audit

| Hạng mục | Kết quả |
|---|---|
| 6 chip 1-chạm đúng nhãn/số tiền (🍜 35k, 🍱 50k, ☕ 40k, 🛵 70k, 🛒 150k, 🧋 45k) | PASS |
| Chip thêm ngay vào ngày đang chọn, không cần mở form | PASS — toast + dòng thời gian cập nhật |
| Form chi tiết: ngày mặc định hôm nay, ghi bù trong tháng, 6 danh mục | PASS |
| Số tiền + ghi chú bắt buộc hợp lệ trước khi lưu | PASS — chặn số ≤ 0 kèm thông báo |
| Nguồn tiền Tiền mặt / Rút từ Quỹ Tiết Kiệm | PASS — badge "Rút quỹ" trên dòng thời gian |
| Dòng thời gian theo ngày, mới nhất trước, tổng ngày + tổng đã ghi | PASS |
| Badge xanh "Trong tầm kiểm soát (+…)" khi trong định mức ngày | PASS |
| Badge đỏ "Vượt định mức …" khi vượt định mức ngày | PASS |
| Sửa ghi chú ngay trong dòng thời gian (Enter lưu, Esc hủy) | PASS |
| Xóa khoản chi nhập nhầm | PASS |
| Két sắt: quỹ gốc + biến động tích lũy = số dư thực tế, cập nhật tức thời | PASS |
| Cảnh báo quỹ cạn/âm (đỏ) và dưới 20% quỹ gốc (vàng) | PASS — kiểm tra bằng dữ liệu mô phỏng |
| Sổ 12 tháng: tháng hiện tại highlight + chế độ Tự động/Tự ghi | PASS |
| Nhập số âm/dương từng tháng, cộng trừ ngay vào quỹ | PASS |
| Nút 🔒 Chốt sổ khóa tháng và snapshot tháng Tự động | PASS |
| Biểu đồ cột xanh/đỏ + đường quỹ lũy kế 12 tháng | PASS |
| Trang thứ 4 trên taskbar hoạt động, bỏ nhãn "Sắp có" | PASS |
| Trang mặc định vẫn là Sức Khỏe Tài Chính sau khi reload | PASS |
| Quỹ thực tế chảy vào thẻ Độ bền tài chính (runway dùng số dư mới) | PASS |

## 2. Financial Consistency

- **Công thức quỹ:** `quỹ thực tế = quỹ gốc + Σ tháng đã ghi`. Tháng Tự động chỉ
  hiển thị dự kiến, không tự cộng vào quỹ trước khi Chốt sổ.
- **Test engine:** quỹ gốc 50.000.000 ₫ + tháng 1 `+4.000.000 ₫` + tháng 2
  `-2.500.000 ₫` → biến động `+1.500.000 ₫`, quỹ `51.500.000 ₫`; tháng 10 Tự
  động có số dư hiển thị `19.000.000 ₫` nhưng `contributedNet = 0`; quỹ lũy kế
  tháng 1 `54.000.000 ₫`, tháng 2 `51.500.000 ₫`. Tháng chốt sổ `+5.000.000 ₫`
  trên quỹ gốc `10.000.000 ₫` → quỹ `15.000.000 ₫`.
- **Test store:** mặc định quỹ gốc `50.000.000 ₫`; ghi tháng 1 `-2.500.000 ₫` →
  `currentSavings = 47.500.000 ₫`; đổi quỹ gốc lên `60.000.000 ₫` →
  `57.500.000 ₫`; chốt sổ tháng hiện tại lưu đúng `income − chi tiêu` và cộng
  vào quỹ.
- **Backup round-trip:** quỹ gốc `42.000.000 ₫` + tháng 3 `-1.250.000 ₫` →
  nhập lại đúng quỹ `40.750.000 ₫`, `importedMonthlyRecords = 12`.
- **Trình duyệt thật:** dữ liệu cũ (quỹ gốc 15.000.000 ₫) được giữ nguyên khi
  rehydrate; tháng 1 `-2.500.000 ₫` → quỹ `12.500.000 ₫`; thêm tháng 2
  `+4.000.000 ₫` → quỹ `16.500.000 ₫`; thẻ runway hiển thị đúng "Số dư quỹ hiện
  tại sau ± các tháng: 16.500.000 ₫" và tính lại số tháng sống được; chốt sổ
  tháng 4 `+1.000.000 ₫` → quỹ `16.000.000 ₫`, mở khóa + xóa → về `15.000.000 ₫`
  và "0 tháng đã chốt sổ".
- Quick-add 35.000 ₫ hiện badge đỏ khi vượt định mức ngày 32.323 ₫ của hồ sơ
  tùy chỉnh trong trình duyệt — đúng logic so sánh.

## 3. Test Suite

```text
node --import tsx --test tests/calculator.test.ts tests/store.test.ts
tests 62
pass 62
fail 0
```

Bổ sung 6 test Prompt 6: tạo 12 tháng với tháng hiện tại AUTO; chỉ tháng đã ghi
mới vào quỹ (AUTO vẫn live); snapshot tháng chốt sổ; action quỹ âm/dương cập
nhật `currentSavings`; chốt sổ tháng AUTO; backup round-trip kèm sổ tháng.

## 4. Compile, Lint & Build

```text
npm run typecheck   PASS
npm run lint        PASS
npm test            PASS (62/62)
npm run build       PASS
```

- Route `/` static prerender thành công, First Load JS khoảng 362 kB.
- `prisma db push` + `prisma generate` PASS, không mất dữ liệu cũ.

## 5. Browser Verification

| Kịch bản | Kết quả |
|---|---|
| Taskbar đủ 4 trang, không còn "Sắp có" | PASS |
| Mở app mặc định Sức Khỏe Tài Chính | PASS |
| Chuyển sang trang Chi Tiêu Theo Ngày: két sắt + sổ chi tiêu + biểu đồ + 12 tháng render | PASS |
| Chip 🍜 Ăn sáng 35k → 1 giao dịch, timeline "Hôm nay - 19/10" | PASS |
| Nhập tháng 1 `-2.500.000` → quỹ 12.500.000 ₫, 1 tháng âm | PASS |
| Nhập tháng 2 `+4.000.000` → quỹ 16.500.000 ₫, 1 tháng dương | PASS |
| Sang trang Sức Khỏe: runway dùng quỹ 16.500.000 ₫ | PASS |
| Chốt sổ tháng 4: khóa input, badge "Đã chốt", quỹ 16.000.000 ₫ | PASS |
| Mở khóa + xóa giá trị → quỹ về 15.000.000 ₫, 0 tháng đã chốt | PASS |
| Dọn giao dịch test → 0 giao dịch, dữ liệu persist sạch | PASS |
| Console error/warning sau các thao tác | Không có |

## 6. Safety Compliance

- Không xóa file, thư mục, database hay dữ liệu người dùng.
- Dữ liệu localStorage cũ (thiếu `initialSavingsFund`, `monthlyRecords`,
  `paymentSource`, `categoryCode`) được bù tự động qua persist `merge` và
  `importBackup`; quỹ gốc cũ được giữ nguyên (15.000.000 ₫).
- `prisma db push` chỉ thêm cột có default và bảng mới, không phá dữ liệu.
- Thao tác kiểm thử trên trình duyệt đã được dọn sạch, trả về trạng thái ban đầu.
- Tuân thủ `Rule_Project.md`.

## 7. Defects

Không phát hiện lỗi.
