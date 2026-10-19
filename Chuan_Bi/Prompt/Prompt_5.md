PROMPT TÍNH NĂNG NÂNG

1.Hãy nâng cấp Core Calculation Engine (`src/lib/calculator/engine.ts`) và Zustand Store với 2 thuật toán nâng cao sau:

1. **Thuật toán "Quy đổi Chi phí ra Giờ Lao Động" (Real Hourly Wage & Life-Energy Converter):**
   - Cho phép người dùng nhập: `Số giờ làm việc/ngày` (mặc định 8h), `Số ngày làm việc/tháng` (mặc định 22 ngày), và `Thời gian di chuyển đi làm/ngày` (VD: 1h).
   - Công thức:
     + `TotalWorkHours = (workHoursPerDay + commuteHoursPerDay) * workDaysPerMonth`
     + `RealHourlyWage = (monthlyIncome - workRelatedExpenses) / TotalWorkHours` (Lương thực tế mỗi giờ).
   - Viết hàm `convertMoneyToWorkTime(amount, realHourlyWage)`: Quy đổi bất kỳ khoản chi nào ra số Giờ và Phút lao động (VD: 150.000 VNĐ = "1 giờ 30 phút làm việc"). Thêm một nút Toggle trên Header giao diện: **"👁️ Hiển thị theo Giờ Lao Động"** để khi bật lên, toàn bộ bảng dự toán hiển thị song song VNĐ và số giờ làm việc tương ứng.

2. **Thuật toán "Độ bền Tài chính khi Thất nghiệp" (Financial Runway / Emergency Fund Calculator):**
   - Người dùng nhập `Tổng quỹ tiết kiệm hiện có (currentSavings)`.
   - Tính 2 kịch bản sống sót nếu mất nguồn thu nhập:
     + **Kịch bản Bình thường (`Standard Runway`):** `currentSavings / Tổng chi phí dự toán hàng tháng` (Trả về số Tháng và số Ngày).
     + **Kịch bản Sinh tồn (`Survival Runway`):** Tự động lọc chỉ lấy các khoản chi có `group === 'NEEDS'` và `isFixed === true` (chỉ giữ lại tiền nhà, điện nước, ăn uống tối thiểu), sau đó lấy `currentSavings / Chi phí sinh tồn` để cho biết họ trụ được tối đa bao lâu.

Hãy viết code đầy đủ cho các hàm này và tạo component `FinancialRunwayCard.tsx` có thanh đồng hồ đo (Gauge/Progress) hiển thị số tháng an toàn tài chính (Dưới 3 tháng: Đỏ nguy hiểm | 3-6 tháng: Vàng | Trên 6 tháng: Xanh an toàn).

2.Hãy viết component `WhatIfSimulatorModal.tsx` (hoặc một Tab riêng mang tên "🔮 Giả lập Tương lai") cho phép người dùng thử nghiệm các quyết định tài chính lớn mà không làm hỏng bảng dự toán gốc.

### Yêu cầu tính năng:
1. Tạo các thẻ **"Sự kiện Cuộc sống mẫu" (Life Event Presets)** có thể bật/tắt (multi-select) bằng 1 cú click:
   - `🛵 Mua xe/Điện thoại trả góp` (+2.500.000đ/tháng trong 12 tháng).
   - `🏠 Chuyển sang căn hộ dịch vụ cao cấp hơn` (+3.000.000đ tiền nhà, +500.000đ điện/dịch vụ).
   - `🐾 Nuôi thú cưng (Chó/Mèo)` (+1.200.000đ/tháng tiền thức ăn, cát, thú y).
   - `📈 Được tăng lương 20%` (Nhưng kèm theo hiệu ứng "Lạm phát lối sống - Lifestyle Creep" tăng chi tiêu giải trí thêm 10%).
   - `👶 Có thêm em bé` (+6.000.000đ/tháng).
   - Cho phép người dùng tự tạo sự kiện tùy chỉnh (+ / - thu nhập hoặc chi phí).

2. **Giao diện So sánh Trực quan (Before vs After):**
   - Hiển thị 2 cột đối chiếu trực tiếp: **Hiện tại (Baseline)** vs **Sau khi thay đổi (Simulated)**.
   - Biểu đồ đường đôi (Dual-Line Recharts) so sánh tốc độ tích lũy tài sản sau 3 năm giữa 2 kịch bản.
   - Nút **"Áp dụng kịch bản này vào Dự toán chính"** hoặc **"Đặt lại (Reset)"**.

3.Hãy xây dựng tính năng **"Smart Quick-Add Bar"** (`src/components/SmartCommandInput.tsx` và `src/lib/calculator/textParser.ts`) hoạt động hoàn toàn offline trên trình duyệt mà không cần gọi API bên ngoài.

### Yêu cầu Logic Parser (`textParser.ts`):
- Người dùng có thể gõ một câu tự nhiên bằng tiếng Việt vào thanh nhập liệu nhanh (có phím tắt `Ctrl + K`), ví dụ:
  + `"Sáng ăn bún bò 45k, cafe 35k, đổ xăng 80k"`
  + `"Đóng tiền điện 850trăm, mua áo shopee 250k"`
  + `"Ăn lẩu cuối tuần 450000 chia 3 người"`
- Thuật toán JS phải tự động:
  1. Tách câu theo dấu phẩy `,` hoặc từ nối `và`, `+`.
  2. Nhận diện số tiền thông minh bằng Regex: hiểu được các hậu tố tiếng Việt như `k`, `ngàn`, `nghìn` (x1.000), `lít`, `trăm` (x100.000), `tr`, `triệu`, `củ` (x1.000.000) và xử lý phép chia cơ bản (như `450k chia 3` -> `150.000đ`).
  3. Tự động phân loại vào đúng danh mục (`Category`) dựa trên từ khóa từ điển (Keyword Matching):
     - `ăn, phở, bún, cơm, lẩu, chợ, siêu thị` -> Nhóm **Ăn uống**.
     - `xăng, grab, gửi xe, bảo dưỡng` -> Nhóm **Đi lại**.
     - `cafe, trà sữa, xem phim, netflix` -> Nhóm **Giải trí & Hưởng thụ**.
     - `điện, nước, wifi, nhà, trọ` -> Nhóm **Hóa đơn & Nhà ở**.

### Yêu cầu Giao diện:
- Khi người dùng đang gõ, hiển thị ngay bên dưới các thẻ Preview (Tag/Chip) trực quan cho từng khoản vừa nhận diện được (Kèm Icon danh mục + Tên khoản chi + Số tiền đã chuẩn hóa VNĐ).
- Bấm `Enter` là lưu toàn bộ vào danh sách Chi tiêu thực tế (`DailyTransaction`) và cập nhật ngay thanh tiến độ ngân sách tháng.

4.Hãy bổ sung 2 tính năng hoàn thiện trải nghiệm người dùng cho ứng dụng chạy trên Localhost:

1. **Biểu đồ Dòng tiền Sankey / Sunburst & Bản đồ nhiệt (Calendar Heatmap):**
   - Tạo component `SpendingCalendarHeatmap.tsx`: Hiển thị lịch 30 ngày trong tháng. Mỗi ô ngày được tô màu đậm nhạt theo mức độ chi tiêu trong ngày đó so với `Định mức an toàn ngày (Daily Safe-to-Spend)`:
     + Ngày không tiêu tiền (*No-spend day*): Hiển thị huy hiệu ngôi sao xanh ngọc 🌟.
     + Ngày tiêu trong định mức: Màu xanh lá nhẹ.
     + Ngày tiêu vượt định mức: Màu cam/đỏ.
   - Thống kê chuỗi ngày chi tiêu an toàn liên tiếp (**"Saving Streak: 🔥 5 ngày liên tiếp không vượt ngân sách"**) để tạo hiệu ứng Gamification giữ chân người dùng.

2. **Trình Quản lý Dữ liệu Local (Export/Import JSON & Excel):**
   - Vì ứng dụng chạy trên `localhost`, hãy tạo một menu **"Quản lý Dữ liệu"**:
     + **Sao lưu toàn bộ (Export JSON):** Xuất toàn bộ dữ liệu dự toán và lịch sử chi tiêu ra file `living-cost-backup-YYYY-MM-DD.json`.
     + **Khôi phục dữ liệu (Import JSON):** Kéo thả file `.json` vào để nạp lại toàn bộ trạng thái ứng dụng (kèm validation bằng Zod để tránh lỗi cấu trúc file).
     + **Nút "Nạp Dữ liệu Demo Mẫu":** Chỉ cần 1 cú click là nạp đầy đủ dữ liệu chi tiêu của cả 1 tháng mẫu để tiện trình diễn (Demo) khi đi phỏng vấn mà không cần nhập tay từ đầu.

5.Bên trong `src/app/page.tsx`, hãy thay thế khu vực biểu đồ cũ bằng 1 Component tabbed duy nhất tên là `FinancialAnalysisTabs.tsx`, chứa 3 tab riêng biệt, hiện đại và sinh động:

1. **Tab 1: 📊 Phân tích Chi phí (Spending Analysis)**
   - **Biểu đồ 1 (Trái):** **Donut Chart** hiển thị tỷ lệ % theo Danh mục (`NEEDS`, `WANTS`, `SAVINGS`). Tâm biểu đồ hiển thị số **"Định mức chi tiêu mỗi ngày (Daily Burn Rate)"**.
   - **Biểu đồ 2 (Phải):** **Stacked Progress Bar** so sánh tỷ lệ `50/30/20` hiện tại với chuẩn. Báo lỗi ngay nếu vượt ngưỡng (Cảnh báo đỏ).

2. **Tab 2: 📅 Lịch sử & Thói quen (Spending History & Habits)**
   - Sử dụng `SpendingCalendarHeatmap` (của Prompt 4) để hiển thị lịch tháng (Tô màu theo mức chi/ngày và đánh dấu ngày No-spend 🌟).
   - Thống kê và hiển thị các chỉ số: `Saving Streak` (Số ngày liên tục không vượt ngân sách), `No-Spend Days This Month` (Số ngày chi tiêu 0đ).

3. **Tab 3: 🔮 Giả lập Tương lai (What-If Simulator)**
   - Hiển thị các thẻ `Life Event Presets` (Mua xe, Nuôi pet, Tăng lương...). Khi bật/tắt các sự kiện, khu vực bên dưới ngay lập tức cập nhật Biểu đồ Đường đôi (Dual-Line Chart) thể hiện tốc độ tích lũy tài sản sau 3 năm giữa kịch bản Cũ và Mới.

Hãy viết lại toàn bộ `page.tsx` và các component liên quan (nếu cần) để tạo nên sự chuyển đổi tab mượt mà, hiện đại, không giật lag, đồng thời đảm bảo dữ liệu giữa 3 tab luôn đồng bộ với nhau (Sử dụng Zustand cho state).

