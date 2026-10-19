Hãy nâng cấp dự án "Ứng dụng Dự toán & Quản lý Chi phí Sinh hoạt" với 2 tính năng cốt lõi mới có liên kết dữ liệu chặt chẽ với nhau trong Zustand Store (`useLivingCostStore.ts`), Prisma Schema và Giao diện UI:

---

### TÍNH NĂNG 1: SỔ GHI CHÚ & CHỌN CHI TIÊU HẰNG NGÀY (DAILY EXPENSE LOGGER & SELECTOR)
Thiết kế component `DailyExpenseTracker.tsx` cho phép người dùng ghi chép và tích chọn các khoản chi tiêu phát sinh mỗi ngày một cách nhanh nhất:

1. **Cơ chế "Chạm để Chọn Nhanh" (1-Click Quick Select Chips):**
   - Hiển thị danh sách các khoản chi tiêu hằng ngày thường gặp (lấy từ bảng Dự toán hoặc các preset như: `🍜 Ăn sáng 35k`, `🍱 Ăn trưa 50k`, `☕ Cà phê 40k`, `🛵 Đổ xăng 70k`, `🛒 Đi chợ 150k`, `🧋 Trà sữa 45k`).
   - Khi người dùng bấm vào một Chip (hoặc tích chọn nhiều Chip cùng lúc), hệ thống tự động điền Số tiền + Danh mục vào form hoặc thêm thẳng vào danh sách chi tiêu của ngày đang chọn.
2. **Form Ghi chú Chi tiêu Chi tiết:**
   - Bộ chọn Ngày (`DatePicker` - mặc định là ngày hôm nay, cho phép lùi về các ngày trước trong tháng để ghi bù).
   - Chọn Danh mục (Ăn uống, Đi lại, Hóa đơn, Mua sắm, Giải trí, Phát sinh khác).
   - Ô nhập Số tiền (VNĐ) + Ô nhập **Ghi chú chi tiết** (VD: *"Ăn lẩu cùng hội bạn cấp 3"*, *"Mua thuốc cảm"*).
   - Chọn Nguồn tiền thanh toán: `Tiền mặt / Lương tháng này` hoặc `Rút từ Quỹ Tiết Kiệm`.
3. **Danh sách Nhật ký theo Ngày (Daily Timeline):**
   - Nhóm các giao dịch theo từng ngày trong tháng (VD: *Hôm nay - 19/10*, *Hôm qua - 18/10*).
   - Hiển thị tổng tiền đã tiêu trong ngày đó, so sánh ngay với **Định mức tiêu chuẩn ngày (Daily Safe-to-Spend)**:
     + Nếu `Tổng tiêu ngày <= Định mức`: Hiện badge xanh `"Trong tầm kiểm soát (+Tiết kiệm được X đồng hôm nay)"`.
     + Nếu `Tổng tiêu ngày > Định mức`: Hiện badge đỏ `"Vượt định mức ngày X đồng"`.
   - Cho phép sửa nhanh ghi chú hoặc xóa giao dịch bị nhập nhầm.

---

### TÍNH NĂNG 2: BẢNG THEO DÕI THEO THÁNG & LIÊN KẾT TRỰC TIẾP QUỸ TIẾT KIỆM (MONTHLY LEDGER & SAVINGS VAULT SYNC)
Thiết kế hệ thống quản lý theo chu kỳ 12 tháng trong năm (VD: Tháng 1 đến Tháng 12, mặc định active ở **Tháng 10** hiện tại) trong component `MonthlySavingsLedger.tsx`:

1. **Cấu trúc Dữ liệu Quỹ Tiết Kiệm & Bảng Tháng (`MonthlyRecord`):**
   - Trong Store có biến gốc: `initialSavingsFund` (Số dư Quỹ tiết kiệm ban đầu do người dùng nhập, VD: `50.000.000đ`).
   - Mảng 12 tháng `monthlyRecords` (Từ Tháng 1 -> Tháng 12), mỗi tháng lưu:
     + `month` (VD: `"2026-10"` - Tháng 10).
     + `income` (Thu nhập thực tế của tháng đó).
     + `totalSpent` (Có thể lấy tự động từ tổng các ghi chép hằng ngày của tháng đó HOẶC cho phép người dùng tự nhập tay tổng chi/số tiền âm dương).
     + `netBalance` (Số dư cuối tháng = `income - totalSpent`, hoặc do người dùng tự nhập trực tiếp con số **+Dương** / **-Âm**).
     + `note` (Ghi chú tổng kết tháng, VD: *"Tháng 10: Đóng tiền bảo hiểm và đi đám cưới nhiều nên âm quỹ 2.5 triệu"* hoặc *"Tháng 10: Tiết kiệm tốt, dư được 4 triệu"*).
     + `isLocked` / `isSettled` (Trạng thái đã chốt sổ tháng để cộng/trừ vào Quỹ Tiết Kiệm).

2. **Logic Cộng/Trừ Trực Tiếp Vào Quỹ Tiết Kiệm (`CurrentSavingsVault`):**
   - Công thức tính **Số dư Quỹ Tiết Kiệm Hiện Tại** theo thời gian thực:
     `Quỹ Tiết Kiệm Hiện Tại = Quỹ Ban Đầu + Tổng (netBalance của tất cả các tháng đã ghi nhận)`
   - **Nếu tháng đó DƯƠNG (`netBalance > 0`):** Tự động cộng thêm tiền vào Quỹ Tiết Kiệm -> Hiển thị hiệu ứng tăng quỹ màu xanh lá (`+4.000.000đ vào Quỹ`).
   - **Nếu tháng đó ÂM (`netBalance < 0` - Chi vượt thu):** Tự động **TRỪ TRỰC TIẾP** số tiền âm đó vào Quỹ Tiết Kiệm hiện có -> Hiển thị cảnh báo màu đỏ (`-2.500.000đ trừ thẳng vào Quỹ Tiết Kiệm`) và cập nhật lại số dư Quỹ ngay lập tức.

3. **Giao diện Bảng Tổng Kết 12 Tháng (Monthly Ledger Table & Vault Card):**
   - **Thẻ "Két Sắt Quỹ Tiết Kiệm" (Savings Vault Hero Card) ở trên cùng:**
     + Hiển thị rõ 3 thông số: `Quỹ gốc ban đầu` | `Biến động tích lũy các tháng (+ / -)` | **`SỐ DƯ QUỸ THỰC TẾ CÒN LẠI`** (chữ lớn, đổi màu theo trạng thái).
     + Nếu Quỹ bị trừ âm xuống gần 0, hiển thị cảnh báo khẩn cấp.
   - **Bảng 12 Tháng Trực Quan (Highlight rõ Tháng 10 hiện tại):**
     + Hiển thị dạng Bảng (Table) hoặc Lưới 12 thẻ tháng (Tháng 1 -> Tháng 12).
     + Trên dòng **Tháng 10 (Tháng hiện tại)**: Cho phép người dùng chọn 2 chế độ:
       * *Chế độ Tự động:* Tự lấy `Thu nhập tháng 10 - Tổng ghi chú chi tiêu hằng ngày trong tháng 10`.
       * *Chế độ Tự ghi (Manual Override):* Người dùng gõ thẳng số tiền **Dương (+)** hoặc **Âm (-)** của tháng 10 kèm **Ghi chú lý do**, ngay lập tức cột *"Số dư Quỹ Tiết Kiệm sau tháng 10"* sẽ tự động tính lại (Lũy kế = Quỹ cuối tháng 9 + Âm/Dương tháng 10).
   - **Biểu đồ Cột Âm/Dương 12 Tháng (Positive/Negative Cashflow Bar Chart - Recharts):**
     + Các tháng tiết kiệm Dương hiển thị cột màu Xanh Ngọc hướng lên trên trục 0.
     + Các tháng bị Âm (ăn lẹm vào quỹ tiết kiệm) hiển thị cột màu Đỏ hướng xuống dưới trục 0, đi kèm đường Line màu Vàng thể hiện **Số dư Quỹ Tiết Kiệm lũy kế** qua từng tháng.

Hãy viết code đầy đủ, chi tiết cho Store, Logic tính lũy kế Quỹ tiết kiệm và các Component giao diện này.