import { CATEGORY_DEFINITIONS, FREQUENCY_DEFINITIONS } from "@/constants/finance";
import { normalizeToMonthly } from "@/lib/calculator/frequency";
import {
  formatNumber,
  formatPercentage,
  formatQuantity,
  formatVnd,
} from "@/lib/utils";
import type {
  ExpenseItem,
  FinancialHealthSnapshot,
  Profile,
} from "@/types/living-cost.types";

export interface PlanExportInput {
  profile: Profile;
  expenseItems: ExpenseItem[];
  financialHealth: FinancialHealthSnapshot;
}

function escapeCsvCell(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function escapeHtml(value: string | number): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function buildPlanCsv(input: PlanExportInput): string {
  const rows: Array<Array<string | number>> = [
    ["KẾ HOẠCH CHI TIÊU SINH HOẠT"],
    ["Người lập", input.profile.name],
    ["Ngày xuất", new Date().toLocaleDateString("vi-VN")],
    ["Tổng thu nhập", input.financialHealth.monthlyIncome],
    ["Tổng dự toán chi", input.financialHealth.totalPlannedExpense],
    ["Số dư cuối tháng", input.financialHealth.netCashflow],
    ["Mục tiêu tiết kiệm", input.profile.savingsGoalAmount],
    ["Chi tiêu bình quân/ngày", Math.round(input.financialHealth.dailyBurnRate)],
    [],
    [
      "Nhóm",
      "Khoản chi",
      "Tần suất",
      "Số lượng",
      "Đơn giá",
      "Chi phí tháng",
      "Chi phí ngày",
      "Trạng thái",
    ],
  ];

  for (const item of input.expenseItems) {
    const monthlyCost = normalizeToMonthly(item);
    rows.push([
      CATEGORY_DEFINITIONS[item.group].name,
      item.name,
      FREQUENCY_DEFINITIONS[item.frequency].label,
      item.quantityPerPeriod,
      item.unitPrice,
      Math.round(monthlyCost),
      Math.round(monthlyCost / 30.44),
      item.isEnabled ? "Đang bật" : "Đã tắt",
    ]);
  }

  return `\uFEFF${rows
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\r\n")}`;
}

export function downloadPlanCsv(input: PlanExportInput): void {
  if (typeof window === "undefined") return;

  const blob = new Blob([buildPlanCsv(input)], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ke-hoach-chi-tieu-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function buildPlanPrintHtml(input: PlanExportInput): string {
  const { profile, expenseItems, financialHealth } = input;
  const enabledItems = expenseItems.filter((item) => item.isEnabled);

  const itemRows = enabledItems
    .map((item) => {
      const monthlyCost = normalizeToMonthly(item);
      return `
        <tr>
          <td>${escapeHtml(CATEGORY_DEFINITIONS[item.group].name)}</td>
          <td>${escapeHtml(item.name)}</td>
          <td>${escapeHtml(FREQUENCY_DEFINITIONS[item.frequency].label)}</td>
          <td class="right">${escapeHtml(formatQuantity(item.quantityPerPeriod))}</td>
          <td class="right">${escapeHtml(formatVnd(monthlyCost))}</td>
          <td class="right">${escapeHtml(formatVnd(monthlyCost / 30.44))}</td>
        </tr>`;
    })
    .join("");

  return `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <title>Kế hoạch chi tiêu - ${escapeHtml(profile.name)}</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 32px;
        color: #0f172a;
        font-family: Arial, "Segoe UI", sans-serif;
        font-size: 12px;
      }
      h1 { margin: 0 0 4px; font-size: 22px; color: #047857; }
      .muted { color: #64748b; margin: 0 0 20px; }
      .summary {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
        margin-bottom: 22px;
      }
      .metric {
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 12px;
        background: #f8fafc;
      }
      .metric span { display: block; color: #64748b; font-size: 11px; margin-bottom: 4px; }
      .metric strong { font-size: 17px; }
      .positive { color: #047857; }
      .negative { color: #be123c; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; }
      th, td { border-bottom: 1px solid #e2e8f0; padding: 8px 6px; text-align: left; }
      th { background: #f1f5f9; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; }
      .right { text-align: right; white-space: nowrap; }
      .footer { margin-top: 24px; color: #64748b; font-size: 11px; }
      @media print {
        body { padding: 16px; }
        .summary { break-inside: avoid; }
      }
    </style>
  </head>
  <body>
    <h1>Kế hoạch chi tiêu sinh hoạt</h1>
    <p class="muted">${escapeHtml(profile.name)} · Xuất ngày ${escapeHtml(new Date().toLocaleDateString("vi-VN"))}</p>

    <section class="summary">
      <div class="metric"><span>Tổng thu nhập</span><strong>${escapeHtml(formatVnd(financialHealth.monthlyIncome))}</strong></div>
      <div class="metric"><span>Tổng dự toán chi</span><strong>${escapeHtml(formatVnd(financialHealth.totalPlannedExpense))}</strong></div>
      <div class="metric"><span>Số dư cuối tháng</span><strong class="${financialHealth.netCashflow >= 0 ? "positive" : "negative"}">${escapeHtml(formatVnd(financialHealth.netCashflow))}</strong></div>
      <div class="metric"><span>Mục tiêu tiết kiệm</span><strong>${escapeHtml(formatVnd(profile.savingsGoalAmount))}</strong></div>
      <div class="metric"><span>Chi tiêu bình quân/ngày</span><strong>${escapeHtml(formatVnd(financialHealth.dailyBurnRate))}</strong></div>
      <div class="metric"><span>Tỷ lệ tiết kiệm thực tế</span><strong>${escapeHtml(formatPercentage(financialHealth.savingsRate))}</strong></div>
    </section>

    <h2>Chi tiết các khoản chi đang bật</h2>
    <table>
      <thead>
        <tr>
          <th>Nhóm</th>
          <th>Khoản chi</th>
          <th>Tần suất</th>
          <th class="right">Số lượng</th>
          <th class="right">Chi phí tháng</th>
          <th class="right">Chi phí ngày</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>

    <p class="footer">Tạo bởi Smart Living Cost Estimator · Dữ liệu được tính từ kế hoạch hiện tại trên trình duyệt.</p>
  </body>
</html>`;
}

export function printPlan(input: PlanExportInput): void {
  if (typeof window === "undefined") return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    window.alert(
      "Trình duyệt đang chặn cửa sổ in. Vui lòng cho phép popup để xuất PDF.",
    );
    return;
  }

  printWindow.opener = null;
  printWindow.document.open();
  printWindow.document.write(buildPlanPrintHtml(input));
  printWindow.document.close();
  printWindow.focus();
  window.setTimeout(() => {
    printWindow.print();
  }, 350);
}

export function formatPlanAmount(amount: number): string {
  return formatNumber(Math.round(amount));
}
