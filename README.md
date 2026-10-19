# Smart Living Cost Estimator & Personal Budget Planner

Ứng dụng dự toán và tối ưu chi phí sinh hoạt hằng ngày, chạy **local-first** trên `http://localhost:3000` với Next.js + Prisma + SQLite.

## Yêu cầu

- Node.js >= 18.17 (khuyến nghị Node 20+)
- npm >= 9

## Chạy nhanh (Zero-Config)

```powershell
npm run setup
```

Script `scripts/setup.mjs` sẽ tự động:

1. Cài đặt thư viện (`npm install` nếu chưa có `node_modules`)
2. Sinh Prisma Client
3. Khởi tạo database SQLite tại `prisma/dev.db`
4. Nạp dữ liệu mẫu (profile + 3 nhóm ngân sách + 26 khoản mục thực tế Việt Nam)
5. Mở server tại `http://localhost:3000`

## Chạy thủ công từng bước

```powershell
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

## Các lệnh có sẵn

| Lệnh | Mô tả |
|---|---|
| `npm run setup` | Cài đặt + khởi tạo DB + seed + chạy dev server |
| `npm run dev` | Chạy development server |
| `npm run build` | Build production |
| `npm run start` | Chạy production server |
| `npm run lint` | Kiểm tra ESLint |
| `npm run typecheck` | Kiểm tra TypeScript |
| `npm test` | Chạy test engine tính toán và Zustand store |
| `npm run db:generate` | Sinh Prisma Client |
| `npm run db:push` | Đồng bộ schema với SQLite |
| `npm run db:seed` | Nạp dữ liệu mẫu |
| `npm run db:studio` | Mở Prisma Studio |

## Dashboard (Prompt 4)

Giao diện chính tại `http://localhost:3000` gồm hai cột 60/40:

- **Cột trái:** Quick Setup (tên người dùng, thu nhập, mục tiêu tiết kiệm, 3
  preset Sinh viên / Độc thân / Gia đình nhỏ), 3 tab chi phí, switch bật/tắt,
  chọn tần suất, slider/nút tăng giảm số lượng, ô sửa đơn giá từng khoản, hóa
  đơn điện EVN và modal thêm khoản chi.
- **Cột phải:** hero card sức khỏe tài chính, thẻ độ bền tài chính, trung tâm
  phân tích 3 tab và các nút AI tối ưu / xuất kế hoạch. Cột phải kéo dài theo
  trang để xem đầy đủ nội dung thay vì bị cắt trong khung sticky.
- **Cập nhật tức thời:** mọi thay đổi về khoản chi, tần suất, số lượng hoặc preset
  đều cập nhật tổng tiền, điểm sức khỏe và cả ba biểu đồ ngay lập tức.
- **AI tối ưu:** ưu tiên nhóm Mong muốn, giữ khoản cố định và tiết kiệm, hỗ trợ
  áp dụng và hoàn tác.
- **Xuất dữ liệu:** CSV UTF-8 có BOM để mở đúng tiếng Việt trong Excel; PDF mở
  bản in HTML độc lập với đầy đủ khoản chi đang bật.

### Cách tính điện trên dashboard

Điện sinh hoạt được tính theo 6 bậc EVN (Quyết định 1279/QĐ-BCT, hiệu lực
10/05/2025) cộng VAT 8%. Dashboard dùng giá bình quân từ hóa đơn để hiển thị và
tính tổng, nhưng **không ghi đè** đơn giá gốc trong store. Với dữ liệu mẫu 250 kWh:

- Hóa đơn điện: `636.768 ₫`
- Tổng dự toán dashboard: `21.193.968 ₫`
- Số dư cuối tháng: `-1.193.968 ₫`

## Phân tích tài chính & tiện ích (Prompt 5)

- **Lương theo giờ thực tế:** quy đổi thu nhập trừ chi phí đi làm, chia cho giờ
  làm việc + giờ di chuyển. Bật nút `👁️ Hiển thị theo Giờ Lao Động` trên header
  để xem mọi khoản chi song song với số giờ lao động.
- **Độ bền tài chính (Financial Runway):** chỉnh quỹ gốc ban đầu, xem số dư quỹ
  thực tế sau ± các tháng và số tháng sống được theo kịch bản tiêu chuẩn và sinh
  tồn; thang màu nguy hiểm (<3 tháng), cảnh báo (3–6 tháng), an toàn (>6 tháng).
- **Trung tâm phân tích 3 tab:** Phân tích Chi phí (donut + 50/30/20), Lịch sử &
  Thói quen (heatmap theo ngày, saving streak, ngày không chi), Giả lập Tương lai
  (What-If Simulator).
- **What-If Simulator:** các preset mua trả góp, nâng cấp nhà, nuôi thú cưng,
  tăng lương 20% kèm 10% lifestyle creep, em bé và sự kiện tùy chỉnh; biểu đồ so
  sánh tài sản tích lũy 3 năm giữa hiện tại và kịch bản mới, có thể áp dụng vào
  bảng dự toán chính.
- **Smart Quick-Add:** nhập câu tiếng Việt như `Sáng ăn bún bò 45k, chiều cafe
  35k, đổ xăng 80k`; hỗ trợ `k/ngàn/nghìn`, `tr/triệu/củ`, `lít/trăm` và
  `chia 3 người`. Nhấn `Ctrl + K` để focus nhanh.
- **Quản lý dữ liệu:** xuất/nhập JSON có kiểm tra Zod, nạp lại dữ liệu demo cả
  tháng với ngày không chi và ngày vượt định mức.
- **Chỉnh sửa trực tiếp:** sửa tên người dùng trong Thiết lập nhanh; sửa đơn giá
  từng khoản chi (trừ điện EVN tính theo bậc thang) ngay trong bảng dự toán.

## Sổ chi tiêu & Quỹ tiết kiệm (Prompt 6)

- **Sổ chi tiêu hằng ngày:** 6 gợi ý 1-chạm (🍜 Ăn sáng 35k, 🍱 Ăn trưa 50k,
  ☕ Cà phê 40k, 🛵 Đổ xăng 70k, 🛒 Đi chợ 150k, 🧋 Trà sữa 45k), form ghi chi
  tiết (ngày mặc định hôm nay, ghi bù trong tháng, 6 danh mục, số tiền, ghi
  chú, nguồn Tiền mặt / Rút từ Quỹ Tiết Kiệm) và dòng thời gian theo ngày.
- **Badge an toàn theo ngày:** xanh "Trong tầm kiểm soát (+…)" khi tổng chi
  trong ngày không vượt định mức; đỏ "Vượt định mức …" khi vượt, dựa trên định
  mức ngày = ngân sách linh hoạt tháng / số ngày trong tháng.
- **Sửa/xóa nhanh:** sửa ghi chú ngay trong dòng thời gian, xóa khoản nhập nhầm.
- **Két sắt Quỹ Tiết Kiệm:** quỹ gốc ban đầu + biến động tích lũy từ các tháng
  dư/âm = số dư quỹ thực tế; cảnh báo đỏ khi quỹ cạn/âm, vàng khi còn dưới 20%.
- **Sổ 12 tháng âm/dương:** tháng hiện tại ở chế độ Tự động (thu nhập − chi tiêu
  đã ghi) và có thể chuyển sang Tự ghi; các tháng khác nhập thẳng số âm/dương.
  Nút 🔒 Chốt sổ khóa tháng; tháng Tự động khi chốt sẽ lưu ảnh chụp số dư và
  cộng ngay vào quỹ.
- **Biểu đồ:** cột xanh/đỏ cho từng tháng, đường vàng quỹ lũy kế 12 tháng.
- **Đồng bộ:** quỹ thực tế cập nhật ngay vào hồ sơ, nên thẻ Độ bền tài chính,
  What-If và runway dùng đúng số dư quỹ; backup JSON giữ cả sổ tháng.

## Điều hướng & các trang

Thanh điều hướng nằm ngay dưới header (dạng taskbar, dính khi cuộn trang), gồm
4 trang đang hoạt động:

1. **🧾 Thiết Lập Chi Phí** — thu nhập, mục tiêu tiết kiệm, Smart Quick-Add và
   toàn bộ bảng dự toán.
2. **🩺 Sức Khỏe Tài Chính** — **trang mặc định khi mở app**; dòng tiền ròng,
   quỹ dự phòng (runway) và hành động nhanh.
3. **📊 Trung Tâm Phân Tích** — cơ cấu chi phí, thói quen chi tiêu theo ngày và
   giả lập tương lai.
4. **🌙 Chi Tiêu Theo Ngày** — sổ chi tiêu hằng ngày, két sắt quỹ tiết kiệm và
   biểu đồ âm/dương 12 tháng.

Bấm vào biểu tượng ví ở góc trái trên cùng (logo SmartCost) để quay về Trang Đầu
(Sức Khỏe Tài Chính). Mỗi lần mở app luôn bắt đầu ở Trang Đầu; trạng thái đang
chọn chỉ có hiệu lực trong phiên làm việc hiện tại.

## Cấu trúc dự án

```text
Chi_Phi_Sinh_Hoat/
├── prisma/
│   ├── schema.prisma       # Profile, CategoryGroup, ExpenseItem, DailyTransaction, MonthlyRecord
│   ├── seed.ts             # Dữ liệu mẫu 26 khoản mục thực tế Việt Nam
│   └── dev.db              # SQLite database (tự sinh, không commit)
├── scripts/
│   └── setup.mjs           # Script cài đặt tự động
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Dashboard chính
│   │   └── globals.css     # Tailwind + theme Fintech Dark Mode
│   ├── components/
│   │   ├── dashboard/      # Quick setup, expense builder, runway, heatmap, what-if, sổ chi tiêu, sổ quỹ
│   │   ├── charts/         # Donut, 50/30/20, savings projection
│   │   └── ui/             # Shadcn UI primitives
│   ├── constants/
│   │   ├── finance.ts      # Biểu giá điện, tần suất, quy tắc ngân sách
│   │   ├── daily-expenses.ts # 6 danh mục chi tiêu ngày và preset gợi ý 1-chạm
│   │   ├── life-events.ts  # Preset sự kiện What-If
│   │   └── presets.ts      # 3 preset sinh hoạt và tỷ lệ quy đổi
│   ├── data/
│   │   ├── demo-transactions.ts # Sinh giao dịch demo theo tháng hiện tại
│   │   └── mock-data.ts    # Mock data 26 khoản mục khớp seed
│   ├── hooks/
│   │   ├── useDashboardData.ts # Dữ liệu dẫn xuất cho dashboard/charts
│   │   └── useMounted.ts   # Guard mount cho Recharts
│   ├── lib/
│   │   ├── calculator/     # Engine: budget, calendar, electricity, ledger, simulation, textParser...
│   │   ├── daily.ts        # Danh mục chi tiêu ngày, suy đoán danh mục, nhãn ngày
│   │   ├── dashboard.ts    # Chart data builders
│   │   ├── export-plan.ts  # CSV và bản in PDF
│   │   ├── validators/     # Zod schema cho backup JSON
│   │   └── utils.ts        # cn(), formatVnd(), helpers
│   ├── store/
│   │   └── useLivingCostStore.ts # Zustand + Immer + persist
│   └── types/
│       └── living-cost.types.ts
├── .env                    # DATABASE_URL
├── components.json         # Cấu hình Shadcn UI
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Ghi chú

- Database mặc định nằm tại `prisma/dev.db` và đã được thêm vào `.gitignore`.
- `npm run db:push` sẽ dừng lại nếu thay đổi schema có nguy cơ mất dữ liệu; không tự động dùng `--accept-data-loss`.
- Store có mock data Việt Nam nạp sẵn và persist vào localStorage, nên giao diện vẫn có dữ liệu khi chưa chạy Prisma.
- Dashboard dùng Zustand persist làm nguồn dữ liệu tương tác; Prisma/SQLite vẫn là nền tảng local-first và seed dữ liệu mẫu.
- Điện sinh hoạt được tính theo hóa đơn bậc thang EVN + VAT 8% ở lớp dữ liệu dẫn xuất; đơn giá gốc trong store được giữ nguyên.
- File CSV xuất ra có UTF-8 BOM để Excel hiển thị đúng tiếng Việt. PDF dùng hộp thoại in của trình duyệt, không gửi dữ liệu lên server.
- Đơn giá từng khoản chi (trừ điện EVN) sửa được trực tiếp trong bảng dự toán;
  điện vẫn tính theo 6 bậc + VAT 8% từ số kWh. Tên người dùng sửa trong Thiết
  lập nhanh và hiển thị trên thẻ Sức khỏe tài chính.
- Backup JSON được kiểm tra bằng Zod trước khi nhập; nút "Nạp dữ liệu demo" tạo
  giao dịch cả tháng tính đến hôm nay cho heatmap và saving streak.
- Sổ tháng: quỹ thực tế = quỹ gốc + Σ số dư các tháng đã ghi (âm/dương); tháng
  Tự động chỉ cộng vào quỹ sau khi bấm Chốt sổ. Dữ liệu cũ thiếu trường mới tự
  được bù khi nạp từ localStorage hoặc nhập backup JSON.
- Mọi thao tác tuân thủ `Rule_Project.md`: không xóa file/thư mục, ưu tiên bảo toàn dữ liệu.
