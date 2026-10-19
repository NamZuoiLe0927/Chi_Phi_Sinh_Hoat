PROMPT LOGIC TÍNH TOÁN & THUẬT TOÁN TỐI ƯU (JS/TS ENGINE)

Hãy viết toàn bộ Core Logic bằng TypeScript trong thư mục `src/lib/calculator/` và `src/store/useLivingCostStore.ts`. Đảm bảo các công thức toán học chính xác 100%:

### 1. Quy đổi Tần suất Thông minh (`normalizeToMonthly` & `normalizeToDaily`):
- Người dùng có thể nhập một khoản chi theo Ngày, Tuần, Tháng hoặc Năm.
- Công thức quy đổi chuẩn về Tháng:
  + Nếu `DAILY`: `MonthlyCost = unitPrice * quantityPerPeriod * 30.44` (hoặc số ngày thực tế trong tháng).
  + Nếu `WEEKLY`: `MonthlyCost = unitPrice * quantityPerPeriod * 4.345`.
  + Nếu `MONTHLY`: `MonthlyCost = unitPrice * quantityPerPeriod`.
  + Nếu `YEARLY` (VD: đóng bảo hiểm, du lịch năm, lì xì Tết): `MonthlyCost = (unitPrice * quantityPerPeriod) / 12` (Tính năng "Sinking Fund" - chia nhỏ chi phí lớn trong năm ra từng tháng).

### 2. Công thức Tính Tiền Điện Bậc Thang Việt Nam (`calculateVietnamElectricityBill`):
- Viết hàm riêng cho hạng mục Tiền Điện: Khi người dùng kéo thanh trượt nhập số kWh tiêu thụ trong tháng (VD: 250 kWh), tự động tính tiền theo 6 bậc thang giá điện sinh hoạt hiện hành tại Việt Nam + 8% thuế VAT.

### 3. Phân tích Quy tắc Ngân sách 50/30/20 (`analyzeBudgetRule`):
- Tính tỷ trọng thực tế của người dùng: `% Thiết yếu (Needs)` | `% Mong muốn (Wants)` | `% Tiết kiệm (Savings)`.
- So sánh với quy tắc chuẩn (50% - 30% - 20% trên Tổng thu nhập).
- Tính `Daily Safe-to-Spend` (Hạn mức được phép tiêu mỗi ngày còn lại trong tháng):
  + `SafeToSpendPerDay = (Tổng ngân sách biến đổi còn lại) / (Số ngày còn lại trong tháng)`.

### 4. Hiệu ứng "Ly Cà Phê" & Lãi kép 5-10 năm (`calculateLatteFactor`):
- Khi người dùng tắt (`isEnabled = false`) hoặc giảm tần suất một thói quen không thiết yếu (VD: bớt 15 ly trà sữa/cà phê = tiết kiệm 750.000đ/tháng), tự động tính số tiền đó nếu mang đi gửi tiết kiệm/đầu tư với lãi suất kép 8%/năm trong 1 năm, 5 năm, 10 năm sẽ thành bao nhiêu tiền:
  + Công thức: $FV = P \times \frac{(1 + r)^n - 1}{r} \times (1 + r)$ (với $P$ là số tiền tiết kiệm mỗi tháng, $r$ là lãi suất tháng, $n$ là tổng số tháng).

### 5. Thuật toán "Tự động Cắt giảm Chi tiêu" (`autoOptimizeLivingCost`):
- Khi `Tổng chi phí dự toán > Tổng thu nhập` (Thâm hụt ngân sách) hoặc không đạt mục tiêu tiết kiệm hàng tháng, người dùng bấm nút **"Tự động Cân đối Ngân sách"**.
- Thuật toán sẽ quét các khoản mục có `isFixed === false` và `priority` thấp (nhóm `WANTS` trước), tự động giảm tần suất (VD: Cà phê từ 20 lần/tháng xuống 8 lần/tháng, Ăn ngoài từ 4 lần/tuần xuống 2 lần/tuần) cho đến khi `Tổng chi <= Mục tiêu`. Trả về bảng gợi ý chi tiết: *"Cắt giảm mục X giúp bạn tiết kiệm Y đồng/tháng"*.