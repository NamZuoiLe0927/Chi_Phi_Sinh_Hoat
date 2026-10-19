PROMPT CHI TIẾT GIAO DIỆN & BIỂU ĐỒ ĐỘNG (UI/UX + RECHARTS)

Hãy viết code đầy đủ cho giao diện Dashboard chính (`src/app/page.tsx` và các component con) bằng React, Tailwind CSS, Shadcn UI, Framer Motion và Recharts. Giao diện thiết kế theo phong cách Fintech Dark Mode (`bg-slate-950`), màu nhấn Emerald (Xanh lá tài chính), Amber (Vàng cảnh báo) và Rose (Đỏ thâm hụt).

### Bố cục màn hình chia làm 2 cột (Split-Screen Interactive Layout):

### CỘT TRÁI (60%): Khu vực Nhập liệu & Điều chỉnh Dự toán Sinh hoạt
1. **Thanh Cấu hình Nhanh (Quick Setup Bar):**
   - Slider + Ô nhập `Tổng thu nhập hàng tháng (VNĐ)` và `Mục tiêu tiết kiệm (%)`.
   - Bộ nút chọn nhanh Preset sinh hoạt (Khi bấm sẽ tự động nạp đơn giá phù hợp):
     + `🎒 Sinh viên (5 - 7 triệu/tháng)`
     + `💼 Người đi làm độc thân (12 - 20 triệu/tháng)`
     + `👨‍👩‍👧 Gia đình nhỏ (25 - 40 triệu/tháng)`
2. **Bảng Dự toán Chi phí Tương tác (Interactive Expense Builder):**
   - Chia theo 3 Tabs hoặc Accordion: `🏠 Chi phí Cố định & Thiết yếu` | `☕ Ăn uống & Giải trí` | `💰 Tiết kiệm & Dự phòng Năm`.
   - Mỗi dòng chi phí có:
     + Switch bật/tắt khoản chi (Bật/tắt đến đâu biểu đồ và tổng tiền nhảy số ngay lập tức đến đó).
     + Chọn tần suất (`Ngày` / `Tuần` / `Tháng` / `Năm`).
     + Thanh trượt nhỏ hoặc nút `[-]` `[+]` chỉnh số lần/số lượng (VD: kéo số kWh điện, hoặc số bữa ăn ngoài/tuần) -> Hiển thị ngay số tiền quy đổi ra **Tháng** và **Ngày**.
     + Nút thêm khoản chi mới tùy chỉnh.

### CỘT PHẢI (40% - Sticky): Trung tâm Phân tích & Biểu đồ Trực quan
1. **Thẻ Sức khỏe Tài chính (Financial Health Hero Card):**
   - Hiển thị 3 con số lớn có hiệu ứng nhảy số (`AnimatedCounter`): **Tổng Thu Nhập** | **Tổng Dự Toán Chi** | **Số Dư Cuối Tháng (Net Cashflow)**.
   - Hiển thị con số **"Định mức chi tiêu mỗi ngày (Daily Burn Rate)"**: VD: *"Trung bình một ngày mở mắt ra bạn tốn 420.000đ"*.
2. **Hệ thống 3 Biểu đồ Trực quan (Recharts):**
   - **Biểu đồ 1 - Donut Chart (Cơ cấu chi phí):** Phân bổ tỷ trọng Tiền nhà, Ăn uống, Đi lại, Giải trí, Hóa đơn, Tiết kiệm. Tâm biểu đồ hiển thị % đã dùng trên tổng thu nhập.
   - **Biểu đồ 2 - Stacked Progress Bar (Đánh giá Quy tắc 50/30/20):** So sánh trực tiếp tỷ lệ `Thiết yếu - Mong muốn - Tiết kiệm` hiện tại của người dùng với chuẩn 50/30/20. Báo đỏ nếu mục "Mong muốn" vượt 30% hoặc "Thiết yếu" vượt 60%.
   - **Biểu đồ 3 - Area Chart (Mô phỏng Tích lũy 5 năm):** Biểu đồ đường/vùng hiển thị số tiền tích lũy được sau 1, 3, 5 năm dựa trên mức dư hàng tháng hiện tại + hiệu ứng lãi kép.
3. **Hộp công cụ Hành động (Action Bar):**
   - Nút **"✨ AI Tự động Tối ưu Chi tiêu"** (Mở Modal hiển thị các khoản có thể cắt giảm ngay để đạt mục tiêu tiết kiệm).
   - Nút **"Xuất Kế hoạch Chi tiêu (PDF / Excel)"**.