import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Smart Living Cost Estimator & Personal Budget Planner",
  description:
    "Ứng dụng dự toán và tối ưu chi phí sinh hoạt hằng ngày, chạy local-first với SQLite.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <body className={`${inter.variable} font-sans`}>{children}</body>
    </html>
  );
}
