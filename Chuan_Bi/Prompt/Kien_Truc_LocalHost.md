Tôi muốn chạy dự án "Ứng dụng Dự toán Chi phí Sinh Hoạt" trực tiếp trên máy cá nhân (localhost) một cách nhanh gọn nhất mà không cần cấu hình Cloud hay cài đặt PostgreSQL Server phức tạp.

Hãy điều chỉnh lại kiến trúc và xuất code theo cấu hình Local-First như sau:
1. **Database Local:** Chuyển Prisma từ PostgreSQL sang **SQLite** (`provider = "sqlite"`, `url = "file:./dev.db"`). Toàn bộ dữ liệu sẽ nằm gọn trong 1 file `dev.db` ngay trong thư mục dự án.
2. **Zero-Config chạy ngay:** Ngay cả khi chưa chạy lệnh Prisma, ứng dụng vẫn phải có sẵn bộ dữ liệu mẫu (Mock Data chuẩn thực tế Việt Nam) nạp trực tiếp vào Zustand Store + lưu tự động vào `localStorage` của trình duyệt để không bao giờ bị lỗi trắng trang.
3. **Hướng dẫn & Script tự động:** 
   - Viết đầy đủ file `package.json` chứa tất cả các thư viện cần thiết (`next`, `react`, `zustand`, `recharts`, `lucide-react`, `framer-motion`, `tailwindcss`, `prisma`, `tsx`).
   - Tạo một script `npm run setup` tự động chạy: cài đặt thư viện -> khởi tạo database SQLite -> nạp dữ liệu mẫu (seed) -> mở server tại `http://localhost:3000`.
