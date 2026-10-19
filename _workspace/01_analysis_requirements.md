# PHÂN TÍCH YÊU CẦU — PROMPT 1

## 1. Mục tiêu

Khởi tạo cấu trúc thư mục và đặc tả đầy đủ hệ thống kiểu (type system) cho ứng dụng
**Smart Living Cost Estimator & Personal Budget Planner** — dự án portfolio chạy
local-first tại `http://localhost:3000`.

## 2. Tech Stack đã chốt

| Thành phần | Công nghệ |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Ngôn ngữ | TypeScript strict mode |
| Giao diện | Tailwind CSS, Shadcn UI, Framer Motion, Lucide Icons |
| Biểu đồ | Recharts |
| State | Zustand + Immer + persist (localStorage) |
| Database | Prisma ORM + SQLite (`file:./dev.db`) |
| Validation | Zod |

## 3. Phạm vi Prompt 1

1. Tạo cấu trúc thư mục đầy đủ cho `src/app`, `src/components`, `src/lib`,
   `src/store`, `src/types`, `src/hooks`, `src/data`, `src/constants`.
2. Viết đầy đủ `src/types/living-cost.types.ts`, không rút gọn, bao phủ:
   - Thực thể lõi: `Profile`, `CategoryGroup`, `ExpenseItem`, `DailyTransaction`.
   - Dữ liệu dẫn xuất: chi phí tháng/ngày/năm, tổng hợp theo nhóm.
   - Phân tích ngân sách 50/30/20 và hạn mức chi tiêu an toàn mỗi ngày.
   - Tính tiền điện bậc thang EVN + VAT.
   - Latte Factor và lãi kép.
   - Thuật toán tự động cắt giảm chi tiêu.
   - Quy đổi tiền tệ sang giờ lao động.
   - Financial Runway (quỹ dự phòng khi thất nghiệp).
   - What-If Simulator và Life Event Presets.
   - Smart Quick-Add Parser tiếng Việt.
   - Calendar Heatmap và Saving Streak.
   - Export/Import JSON và validation.
   - Dữ liệu biểu đồ Recharts.
   - State/actions của Zustand store.
   - DTO, input payload và API response.

## 4. Ràng buộc

- `strict: true`, không dùng `any` trong file types.
- Đơn vị tiền tệ mặc định: VNĐ (`VndAmount = number`).
- Ngày lưu dạng ISO 8601 (`YYYY-MM-DD`) và timestamp ISO (`YYYY-MM-DDTHH:mm:ss.sssZ`).
- Không xóa file/thư mục; tuân thủ `Rule_Project.md`.
- Không triển khai logic tính toán/UI trong Prompt 1 — chỉ hợp đồng kiểu dữ liệu.

## 5. Tiêu chí nghiệm thu

1. Cấu trúc thư mục khớp kiến trúc trong `Prompt_1.md`.
2. `src/types/living-cost.types.ts` biên dịch thành công với `tsc --noEmit`.
3. Mọi interface cần cho Prompt 2–5 đều đã được khai báo.
4. `npm run build` thành công sau khi bổ sung types.

---

# PHÂN TÍCH YÊU CẦU — PROMPT 2

## 1. Mục tiêu

Hoàn thiện schema Prisma cho SQLite và viết seed data thực tế Việt Nam phục vụ
demo local-first.

## 2. Phạm vi

### `prisma/schema.prisma`

| Model | Trường chính |
|---|---|
| `Profile` | monthlyIncome, extraIncome, cityTier, lifestyle, dependents, budgetRule, savingsGoalAmount, inflationRate, work profile, currentSavings |
| `CategoryGroup` | code (NEEDS/WANTS/SAVINGS_DEBT), name, description, color, icon, sortOrder |
| `ExpenseItem` | name, group, icon, color, frequency, unitPrice, quantityPerPeriod, isFixed, isEnabled, priority, note, sortOrder |
| `DailyTransaction` | expenseItemId, title, amount, date, paymentMethod, note, source |

### `prisma/seed.ts`

- Profile: thu nhập 20.000.000đ/tháng, khu vực HANOI_HCM, lối sống BALANCED.
- 3 nhóm ngân sách: NEEDS, WANTS, SAVINGS_DEBT.
- Tối thiểu 20 khoản mục; thực tế triển khai 26 khoản mục.
- Đơn vị VNĐ; có các khoản DAILY/WEEKLY/MONTHLY/YEARLY để kiểm chứng quy đổi.
- Seed idempotent: chạy lại cập nhật đúng bộ dữ liệu mẫu, không nhân đôi bản ghi.

## 3. Tiêu chí nghiệm thu

1. `prisma db push` đồng bộ schema không lỗi.
2. `npm run db:seed` tạo đủ 26 khoản mục, 3 nhóm, 1 profile.
3. Tổng dự toán tháng tính đúng theo hệ số 30.44 / 4.345 / 1 / 12.
4. `tsc --noEmit` và `next build` thành công.
5. Không xóa file/thư mục; dữ liệu hiện có được bảo toàn.

---

# PHÂN TÍCH YÊU CẦU — PROMPT 3

## 1. Mục tiêu

Xây dựng Core Calculation Engine bằng TypeScript tại `src/lib/calculator/` và
Zustand store local-first tại `src/store/useLivingCostStore.ts`, đảm bảo các công
thức tài chính chính xác và có thể kiểm chứng bằng test tự động.

## 2. Phạm vi

### 2.1. Quy đổi tần suất

- `normalizeToMonthly`: DAILY × 30.44, WEEKLY × 4.345, MONTHLY × 1, YEARLY / 12.
- `normalizeToDaily`: chi phí tháng / 30.44.
- `normalizeToYearly`: chi phí tháng × 12.
- `calculateExpenseItemCosts`: trả về đồng thời monthly / daily / yearly.
- Validate số tiền và số lượng là số hữu hạn, không âm.

### 2.2. Tiền điện bậc thang Việt Nam

- Hàm `calculateVietnamElectricityBill(kwh)` tính theo 6 bậc thang.
- Biểu giá tham chiếu Quyết định 1279/QĐ-BCT (hiệu lực 10/05/2025):
  1.984 / 2.050 / 2.380 / 2.998 / 3.350 / 3.460 đồng/kWh (chưa VAT).
- Cộng VAT 8%; trả về chi tiết từng bậc, subtotal, VAT, tổng và giá trung bình/kWh.
- Hỗ trợ 0 kWh và validate số kWh không âm.

### 2.3. Phân tích ngân sách 50/30/20

- Tính tổng thực tế theo NEEDS / WANTS / SAVINGS_DEBT từ các khoản đang bật.
- Tính % trên tổng thu nhập, target amount, variance và cờ vượt ngưỡng.
- `Daily Safe-to-Spend`:
  - Ngân sách biến đổi = thu nhập − chi phí cố định ngoài nhóm tiết kiệm/nợ −
    khoản dự trữ tiết kiệm (lấy max giữa mục tiêu tiết kiệm và kế hoạch
    SAVINGS_DEBT để tránh double-counting).
  - Trừ chi tiêu biến đổi thực tế trong tháng.
  - Chia cho số ngày còn lại (bao gồm hôm nay).
- Trạng thái: HEALTHY / WARNING / CRITICAL.

### 2.4. Latte Factor và lãi kép

- Công thức annuity-due: `FV = P × ((1 + r)^n − 1) / r × (1 + r)`.
- `r = lãi suất năm / 100 / 12`; mặc định minh họa 8%/năm.
- Trả về dự phóng 1 năm, 5 năm, 10 năm và chi tiết từng mốc.
- Bổ sung `calculateCompoundInterest` cho mô phỏng tích lũy có vốn gốc.

### 2.5. Tự động cắt giảm chi tiêu

- Quét các khoản `isEnabled = true`, `isFixed = false`, không thuộc
  SAVINGS_DEBT (mặc định), có `priority >= minPriority`.
- Ưu tiên WANTS trước NEEDS; trong cùng nhóm ưu tiên priority thấp trước.
- Giảm số lượng/tần suất theo từng vòng, tôn trọng `maxReductionRate` (0–100%).
- Dừng khi tổng chi <= mục tiêu hoặc không còn khoản nào có thể giảm.
- Trả về gợi ý chi tiết, tổng tiết kiệm, trạng thái đạt mục tiêu và danh sách bỏ qua.

### 2.6. Zustand Store

- State: profile, categoryGroups, expenseItems, transactions, UI, simulation,
  optimization, hydration, updatedAt.
- Actions: CRUD khoản chi/giao dịch, toggle, reorder, quick setup, áp dụng và
  hoàn tác optimization, simulation, import/export backup, UI filters/sort/modal.
- Persist localStorage qua `persist` + `immer`; fallback memory storage khi SSR/test.
- Mock data Việt Nam 26 khoản mục được nạp sẵn để ứng dụng không trắng trang khi
  chưa chạy Prisma.

## 3. Ràng buộc

- Không xóa file/thư mục; tuân thủ `Rule_Project.md`.
- Không làm hỏng dữ liệu người dùng khi xóa khoản mục: giao dịch liên quan được
  giữ lại và `expenseItemId` chuyển về `null`.
- Tất cả module tính toán là pure function, không phụ thuộc React.
- Không triển khai UI của Prompt 4/5 trong bước này.

## 4. Tiêu chí nghiệm thu

1. `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` đều PASS.
2. Test bao phủ quy đổi tần suất, 3 mốc hóa đơn điện, ngân sách 50/30/20,
   latte factor, optimizer, runway, store CRUD/backup/optimization.
3. Tổng dự toán mock data khớp seed: 21.432.200đ/tháng.
4. Không có thay đổi phá hủy dữ liệu hoặc xóa file.

---

# PHÂN TÍCH YÊU CẦU — PROMPT 4

## 1. Mục tiêu

Xây dựng dashboard chính tại `src/app/page.tsx` theo phong cách Fintech Dark Mode
(`bg-slate-950`, nhấn Emerald / Amber / Rose), chia bố cục 60/40, cập nhật số liệu
tức thời khi người dùng thay đổi dự toán và trực quan hóa bằng Recharts.

## 2. Phạm vi

### 2.1. Bố cục

- Cột trái 60%: Quick Setup Bar + Interactive Expense Builder.
- Cột phải 40%: Financial Health Hero Card + 3 biểu đồ + Action Bar.
- Cột phải sticky trên desktop; trên mobile/tablet chuyển thành một cột.
- Nền tối, card viền mảnh, accent emerald cho tài chính, amber cho cảnh báo,
  rose cho thâm hụt.

### 2.2. Cột trái

- Ô nhập và slider cho tổng thu nhập tháng (VNĐ), mục tiêu tiết kiệm (%).
- 3 preset: Sinh viên (5–7 triệu), Người đi làm độc thân (12–20 triệu),
  Gia đình nhỏ (25–40 triệu). Preset nạp lại đơn giá/số lượng của 26 khoản mục
  mẫu nhưng giữ khoản người dùng tự thêm và trạng thái bật/tắt.
- 3 tab: Thiết yếu, Mong muốn, Tiết kiệm & Trả nợ.
- Mỗi khoản chi có switch bật/tắt, chọn tần suất Ngày/Tuần/Tháng/Năm,
  slider + nút `[-]`/`[+]` chỉnh số lượng, đơn giá và chi phí tháng/ngày.
- Điện sinh hoạt dùng hóa đơn EVN 6 bậc + VAT 8% ngay trên UI.
- Modal thêm khoản chi tùy chỉnh với nhóm, tần suất, đơn giá, số lượng,
  mức ưu tiên, khoản cố định và ghi chú.

### 2.3. Cột phải

- Hero card hiển thị thu nhập, tổng dự toán chi, số dư cuối tháng bằng
  `AnimatedCounter`; điểm sức khỏe, daily burn rate, hạn mức an toàn/ngày,
  tỷ lệ tiết kiệm.
- Donut chart cơ cấu chi phí, tâm hiển thị % thu nhập đã dùng.
- Stacked bar chart so sánh thực tế với chuẩn 50/30/20; tô đỏ khi Mong muốn
  vượt 30% hoặc Thiết yếu vượt 60%; cảnh báo khi Tiết kiệm dưới 20%.
- Area/line chart mô phỏng tích lũy 5 năm từ số dư hàng tháng và lãi kép 8%/năm.
- Action Bar: mở modal AI tối ưu chi tiêu và modal xuất kế hoạch PDF/Excel.

### 2.4. Tương tác & xuất dữ liệu

- Bật/tắt khoản chi, đổi tần suất hoặc số lượng phải cập nhật ngay tổng tiền,
  tab summary và cả 3 biểu đồ.
- AI tối ưu ưu tiên WANTS, giữ khoản cố định/tiết kiệm, giảm tối đa 50% mỗi vòng.
- Áp dụng và hoàn tác tối ưu phải khôi phục đúng số lượng trước đó.
- Xuất CSV UTF-8 có BOM để mở đúng tiếng Việt trong Excel.
- Xuất PDF thông qua cửa sổ in HTML độc lập; nếu popup bị chặn thì thông báo.

## 3. Quyết định kỹ thuật

- Biểu đồ Recharts chỉ render sau khi mount để tránh lỗi SSR/ResponsiveContainer.
- Điện được định giá bậc thang ở lớp dữ liệu dẫn xuất; store vẫn giữ đơn giá gốc,
  không ghi đè dữ liệu người dùng.
- Preset dùng `PRESET_SCALING` và chỉ tác động lên các item mock đã biết.
- Export không thêm dependency: CSV bằng Blob, PDF bằng HTML in qua `window.open`.
- Các modal dùng Shadcn Dialog, Select, Slider, Switch, Tabs.

## 4. Tiêu chí nghiệm thu

1. Dashboard render tại `http://localhost:3000` với bố cục 60/40 và sticky cột phải.
2. Đủ 3 preset, 3 tab, switch, frequency, slider/stepper, modal thêm khoản chi.
3. Đủ hero card + 3 biểu đồ Recharts + 2 nút action.
4. Tổng tiền và biểu đồ cập nhật ngay khi thay đổi dữ liệu.
5. AI tối ưu áp dụng/hoàn tác đúng; CSV tải được; bản in PDF mở đúng nội dung.
6. `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` đều PASS.
7. Không triển khai các tính năng Prompt 5 như transaction demo, heatmap,
   what-if, parser tiếng Việt hoặc data manager.
