PROMPT KIẾN TRÚC HỆ THỐNG & CẤU TRÚC THƯ MỤC

Đóng vai một Principal Full-stack Developer và UI/UX Designer. Tôi muốn xây dựng dự án Portfolio có tên là "Smart Living Cost Estimator & Personal Budget Planner" (Ứng dụng Dự toán & Tối ưu Chi phí Sinh hoạt Hằng ngày) chạy trực tiếp trên máy cá nhân (`localhost:3000`).

### Mục tiêu cốt lõi để ghi điểm trong Portfolio:
1. Người dùng nhập thu nhập, khu vực sống, lối sống -> Hệ thống tự động dự toán chi phí sinh hoạt theo tháng/năm và tính toán theo thời gian thực (Real-time calculation).
2. Kết hợp giữa "Dự toán kế hoạch (Planned Budget)" và "Chi tiêu thực tế hằng ngày (Daily Actual Tracking)" kèm mô phỏng tài chính tương lai.
3. Giao diện Dark Mode hiện đại (Fintech Dashboard), biểu đồ tương tác sinh động, thể hiện kỹ năng xử lý logic JS/TS phức tạp.
4. Kiến trúc Local-First: Sử dụng SQLite (qua Prisma ORM) lưu thành file `dev.db` ngay trong thư mục code, kết hợp với Zustand `persist` (`localStorage`) để có sẵn Mock Data chạy ngay không cần cài đặt server DB ngoài.

### Tech Stack:
- Frontend: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Shadcn UI, Framer Motion, Lucide Icons.
- Biểu đồ: Recharts.
- State & Logic: Zustand + Immer.
- Database Local: Prisma ORM + SQLite (`file:./dev.db`).

Hãy khởi tạo cấu trúc thư mục và viết đầy đủ file `src/types/living-cost.types.ts` định nghĩa chặt chẽ toàn bộ Interfaces cho dự án này. Tuyệt đối không viết code rút gọn.