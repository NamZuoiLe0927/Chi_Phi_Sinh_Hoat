PROMPT CHI TIẾT DATABASE & DỮ LIỆU MẪU THỰC TẾ (PRISMA + SEED)

Hãy viết đầy đủ 2 file `prisma/schema.prisma` (dùng SQLite) và `prisma/seed.ts` cho "Ứng dụng Dự toán Chi phí Sinh hoạt Hằng ngày".

### 1. Chi tiết `prisma/schema.prisma`:
- `Profile`: Cấu hình người dùng (`id`, `monthlyIncome` [Thu nhập tháng], `extraIncome` [Thu nhập phụ], `cityTier` [HANOI_HCM, DA_NANG_CAN_THO, PROVINCE], `lifestyle` [FRUGAL - Tiết kiệm, BALANCED - Cân bằng, COMFORT - Thoải mái], `dependents` [Số người phụ thuộc], `budgetRule` [RULE_50_30_20, RULE_60_20_20, CUSTOM], `savingsGoalAmount` [Mục tiêu tiết kiệm], `inflationRate` [Lạm phát dự kiến, mặc định 4%/năm]).
- `CategoryGroup`: 3 nhóm chuẩn tài chính (`NEEDS` - Thiết yếu, `WANTS` - Mong muốn/Giải trí, `SAVINGS_DEBT` - Tiết kiệm & Đầu tư/Trả nợ).
- `ExpenseItem` (Hạng mục dự toán):
  + `id`, `name`, `group` (`NEEDS` | `WANTS` | `SAVINGS_DEBT`), `icon`, `color`.
  + `frequency` (`DAILY` - Hằng ngày, `WEEKLY` - Hằng tuần, `MONTHLY` - Hằng tháng, `YEARLY` - Hằng năm).
  + `unitPrice` (Đơn giá 1 lần, VD: 45,000đ/ly cà phê, 3,500đ/kWh điện).
  + `quantityPerPeriod` (Số lượng/Tần suất trong kỳ, VD: 30 bữa sáng/tháng, 200 kWh điện/tháng).
  + `isFixed` (Boolean - Chi phí cố định như tiền thuê nhà hay biến đổi như ăn uống).
  + `isEnabled` (Boolean - Cho phép bật/tắt để giả lập cắt giảm chi phí).
  + `priority` (Int từ 1 đến 5 - Độ ưu tiên dùng cho thuật toán tự động cắt giảm chi tiêu khi lố ngân sách).
- `DailyTransaction` (Nhật ký chi tiêu thực tế hằng ngày):
  + `id`, `expenseItemId`, `title`, `amount`, `date`, `paymentMethod` (`CASH`, `BANK_TRANSFER`, `CREDIT_CARD`, `E_WALLET`), `note`.

### 2. Chi tiết `prisma/seed.ts`:
Viết dữ liệu mẫu sát thực tế chi phí sinh hoạt tại Việt Nam (đơn vị VNĐ) cho một người có thu nhập 20.000.000 VNĐ/tháng tại Hà Nội/TP.HCM, bao gồm ít nhất 20 khoản mục chia vào 3 nhóm:
1. **Thiết yếu (NEEDS):** Thuê nhà/Trọ (4.5tr), Điện (tính theo bậc thang EVN), Nước, Internet + 4G, Ăn sáng (35k x 30 ngày), Ăn trưa văn phòng (50k x 22 ngày), Đi chợ nấu ăn tối, Xăng xe/Grab, Bảo hiểm/Y tế.
2. **Mong muốn & Hưởng thụ (WANTS):** Cà phê/Trà sữa (45k x 15 lần/tháng), Ăn hàng/Tụ tập cuối tuần, Đăng ký dịch vụ số (Netflix, Spotify, Youtube Premium, ChatGPT), Mua sắm quần áo/Shopee, Gym/Thể thao, Du lịch (quy đổi theo năm chia cho 12 tháng).
3. **Tiết kiệm & Đầu tư (SAVINGS):** Quỹ dự phòng khẩn cấp, Đầu tư chứng chỉ quỹ/Vàng, Gửi tiết kiệm ngân hàng.