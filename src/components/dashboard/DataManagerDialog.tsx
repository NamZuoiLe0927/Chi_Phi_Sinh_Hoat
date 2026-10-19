"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Download,
  FileJson,
  Sparkles,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import type { DragEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toLocalISODate } from "@/lib/calculator/date";
import { backupPayloadSchema } from "@/lib/validators/backup";
import { useLivingCostStore } from "@/store/useLivingCostStore";
import { cn, formatVnd } from "@/lib/utils";
import type { ImportResult, ValidationIssue } from "@/types/living-cost.types";

export function DataManagerDialog() {
  const open = useLivingCostStore((state) => state.ui.isDataManagerOpen);
  const setOpen = useLivingCostStore((state) => state.setDataManagerOpen);
  const exportBackup = useLivingCostStore((state) => state.exportBackup);
  const importBackup = useLivingCostStore((state) => state.importBackup);
  const loadDemoData = useLivingCostStore((state) => state.loadDemoData);
  const currentSavings = useLivingCostStore(
    (state) => state.profile.currentSavings,
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  function resetFeedback() {
    setIssues([]);
    setSuccess(null);
    setError(null);
    setImportResult(null);
  }

  function downloadBackup() {
    const payload = exportBackup();
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `living-cost-backup-${toLocalISODate(new Date())}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setSuccess("Đã xuất file sao lưu JSON.");
    setError(null);
    setIssues([]);
  }

  async function handleFile(file: File) {
    resetFeedback();
    setFileName(file.name);

    try {
      const text = await file.text();
      const json: unknown = JSON.parse(text);
      const parsed = backupPayloadSchema.safeParse(json);

      if (!parsed.success) {
        setIssues(
          parsed.error.issues.map((issue) => ({
            path: issue.path.length > 0 ? issue.path.join(".") : "root",
            message: issue.message,
            code: issue.code,
          })),
        );
        setError("File không đúng cấu trúc sao lưu của SmartCost.");
        return;
      }

      const confirmed = window.confirm(
        `Nhập dữ liệu từ "${file.name}"? Toàn bộ dữ liệu hiện tại trên trình duyệt sẽ bị thay thế.`,
      );
      if (!confirmed) return;

      const result = importBackup(json);
      setImportResult(result);
      setIssues(result.issues);
      if (result.success) {
        setSuccess(
          `Đã nhập ${result.importedExpenseItems} khoản chi, ${result.importedTransactions} giao dịch và ${result.importedMonthlyRecords} tháng sổ quỹ.`,
        );
      } else {
        setError("Không thể nhập dữ liệu. Vui lòng kiểm tra các lỗi bên dưới.");
      }
    } catch {
      setError("File không phải JSON hợp lệ hoặc không thể đọc được.");
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }

  function handleDemoData() {
    const confirmed = window.confirm(
      "Nạp dữ liệu demo cả tháng? Dữ liệu hiện tại sẽ bị thay thế.",
    );
    if (!confirmed) return;

    loadDemoData();
    resetFeedback();
    setFileName(null);
    setSuccess(
      "Đã nạp dữ liệu demo tháng này. Mở tab Lịch sử & Thói quen để xem heatmap.",
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-sky-400" />
            Quản lý dữ liệu
          </DialogTitle>
          <DialogDescription>
            Sao lưu, phục hồi hoặc nạp dữ liệu demo. Mọi dữ liệu được lưu cục
            bộ trong trình duyệt.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            onClick={downloadBackup}
            className="h-auto flex-col items-start gap-1 border-slate-700 bg-slate-950/40 px-3 py-3 text-left hover:border-sky-500/40"
          >
            <span className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Download className="h-4 w-4 text-sky-400" />
              Xuất JSON
            </span>
            <span className="text-[10px] font-normal leading-relaxed text-slate-500">
              Tải toàn bộ hồ sơ, khoản chi và giao dịch về máy.
            </span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleDemoData}
            className="h-auto flex-col items-start gap-1 border-slate-700 bg-slate-950/40 px-3 py-3 text-left hover:border-emerald-500/40"
          >
            <span className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              Nạp dữ liệu demo
            </span>
            <span className="text-[10px] font-normal leading-relaxed text-slate-500">
              Sinh giao dịch cả tháng với ngày không chi và ngày vượt định mức.
            </span>
          </Button>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
              <FileJson className="h-3.5 w-3.5 text-violet-400" />
              Nhập file sao lưu
            </p>
            <Badge variant="secondary" className="text-[9px]">
              Zod validated
            </Badge>
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                inputRef.current?.click();
              }
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-6 text-center transition-colors",
              dragging
                ? "border-sky-500/60 bg-sky-500/10"
                : "border-slate-700 bg-slate-950/30 hover:border-slate-600",
            )}
          >
            <Upload className="h-5 w-5 text-slate-500" />
            <p className="text-xs text-slate-300">
              Kéo thả file JSON vào đây hoặc{" "}
              <span className="text-sky-300">chọn file</span>
            </p>
            <p className="text-[10px] text-slate-600">
              File xuất từ SmartCost · tối đa cấu trúc BackupPayload
            </p>
            {fileName ? (
              <p className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-[10px] text-slate-400">
                {fileName}
              </p>
            ) : null}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleFile(file);
              event.target.value = "";
            }}
          />
        </div>

        {error ? (
          <p className="flex items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/[0.07] px-3 py-2 text-[11px] text-rose-300">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {error}
          </p>
        ) : null}

        {success ? (
          <p className="flex items-start gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.07] px-3 py-2 text-[11px] text-emerald-300">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {success}
          </p>
        ) : null}

        {importResult?.success ? (
          <p className="text-[10px] text-slate-500">
            Hồ sơ: {importResult.importedProfile ? "đã nhập" : "giữ nguyên"} ·{" "}
            {importResult.importedExpenseItems} khoản chi ·{" "}
            {importResult.importedTransactions} giao dịch ·{" "}
            {importResult.importedMonthlyRecords} tháng sổ quỹ
          </p>
        ) : null}

        {issues.length > 0 ? (
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.06] p-3">
            <p className="mb-1 text-[11px] font-medium text-amber-300">
              Lỗi cấu trúc ({issues.length})
            </p>
            <ul className="space-y-1">
              {issues.slice(0, 8).map((issue, index) => (
                <li
                  key={`${issue.path}-${index}`}
                  className="text-[10px] leading-relaxed text-amber-200/80"
                >
                  <span className="font-mono text-amber-300">{issue.path}</span>{" "}
                  · {issue.message}
                </li>
              ))}
            </ul>
            {issues.length > 8 ? (
              <p className="mt-1 text-[10px] text-amber-200/60">
                … và {issues.length - 8} lỗi khác.
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2 text-[10px] leading-relaxed text-slate-500">
          <p>
            Quỹ hiện tại:{" "}
            <span className="text-slate-300">
              {formatVnd(currentSavings)}
            </span>{" "}
            · Dữ liệu chỉ nằm trên thiết bị này.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
