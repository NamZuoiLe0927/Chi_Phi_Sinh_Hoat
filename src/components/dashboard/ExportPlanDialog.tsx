"use client";

import { Download, FileSpreadsheet, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  downloadPlanCsv,
  printPlan,
  type PlanExportInput,
} from "@/lib/export-plan";
import { formatVnd } from "@/lib/utils";

interface ExportPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  input: PlanExportInput;
  onExported?: (format: "csv" | "pdf") => void;
}

export function ExportPlanDialog({
  open,
  onOpenChange,
  input,
  onExported,
}: ExportPlanDialogProps) {
  function handleCsvExport() {
    downloadPlanCsv(input);
    onOpenChange(false);
    onExported?.("csv");
  }

  function handlePdfExport() {
    printPlan(input);
    onOpenChange(false);
    onExported?.("pdf");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-4 w-4 text-emerald-400" />
            Xuất kế hoạch chi tiêu
          </DialogTitle>
          <DialogDescription>
            Xuất bảng dự toán hiện tại gồm {input.expenseItems.length} khoản
            chi, tổng chi {formatVnd(input.financialHealth.totalPlannedExpense)}
            /tháng.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleCsvExport}
            className="group flex w-full items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/45 p-4 text-left transition-colors hover:border-emerald-500/40 hover:bg-emerald-500/[0.06]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <FileSpreadsheet className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-100">
                  Excel / CSV
                </span>
                <Download className="h-4 w-4 text-slate-500 transition-colors group-hover:text-emerald-400" />
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                Tải file CSV mở được bằng Excel, có đầy đủ nhóm, tần suất, đơn
                giá và chi phí tháng.
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={handlePdfExport}
            className="group flex w-full items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/45 p-4 text-left transition-colors hover:border-sky-500/40 hover:bg-sky-500/[0.06]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
              <FileText className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-100">
                  PDF / Bản in
                </span>
                <Printer className="h-4 w-4 text-slate-500 transition-colors group-hover:text-sky-400" />
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                Mở bản in gọn gàng. Trong hộp thoại in, chọn “Lưu dưới dạng
                PDF” để lưu file.
              </span>
            </span>
          </button>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/45 px-3.5 py-3 text-[11px] leading-relaxed text-slate-500">
          Dữ liệu xuất phản ánh kế hoạch đang lưu trên trình duyệt. Các khoản chi
          đã tắt vẫn xuất hiện trong CSV nhưng được đánh dấu trạng thái; bản in
          chỉ hiển thị các khoản đang bật.
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          className="w-full"
        >
          Đóng
        </Button>
      </DialogContent>
    </Dialog>
  );
}
