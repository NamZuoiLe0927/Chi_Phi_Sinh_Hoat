"use client";

import {
  ArrowRight,
  Command,
  Keyboard,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ExpenseIcon } from "@/components/dashboard/ExpenseIcon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  CATEGORY_KEYWORD_RULES,
  parseVietnameseExpenses,
} from "@/lib/calculator/textParser";
import { useLivingCostStore } from "@/store/useLivingCostStore";
import { cn, formatVnd } from "@/lib/utils";

interface SmartCommandInputProps {
  spendingProgress: {
    budget: number;
    spent: number;
    percentage: number;
  };
}

export function SmartCommandInput({
  spendingProgress,
}: SmartCommandInputProps) {
  const addParsedTransactions = useLivingCostStore(
    (state) => state.addParsedTransactions,
  );
  const [value, setValue] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const parsed = useMemo(
    () =>
      parseVietnameseExpenses(value, {
        defaultPaymentMethod: "E_WALLET",
        defaultGroupCode: "NEEDS",
        maxItems: 12,
      }),
    [value],
  );

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }

      if (event.key === "Escape" && document.activeElement === inputRef.current) {
        setValue("");
        setNotice(null);
        inputRef.current?.blur();
      }
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (parsed.drafts.length === 0) return;

    const count = parsed.drafts.length;
    const total = parsed.totalAmount;
    addParsedTransactions(parsed.drafts);
    setValue("");
    setNotice(
      `Đã thêm ${count} giao dịch · ${formatVnd(total)} vào ngân sách tháng.`,
    );
  }

  const previewDrafts = parsed.drafts.slice(0, 6);
  const hiddenCount = parsed.drafts.length - previewDrafts.length;

  return (
    <Card className="overflow-hidden border-sky-500/10 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-sky-950/20">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <WandSparkles className="h-4 w-4 text-sky-400" />
              Thêm chi tiêu bằng câu lệnh
            </CardTitle>
            <CardDescription>
              Nhập nhanh nhiều khoản chi bằng tiếng Việt tự nhiên
            </CardDescription>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/80 px-2.5 py-1 text-[10px] font-medium text-slate-400">
            <Command className="h-3 w-3" />
            Ctrl K
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Keyboard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                ref={inputRef}
                value={value}
                onChange={(event) => {
                  setValue(event.target.value);
                  setNotice(null);
                }}
                placeholder="VD: Sáng ăn bún bò 45k, chiều cafe 35k, đổ xăng 80k"
                className="h-11 pl-9 pr-3 text-sm"
                aria-label="Nhập nhanh giao dịch bằng tiếng Việt"
                autoComplete="off"
              />
            </div>
            <Button
              type="submit"
              disabled={parsed.drafts.length === 0}
              className="h-11 shrink-0 gap-1.5"
            >
              <Sparkles className="h-4 w-4" />
              Thêm {parsed.drafts.length > 0 ? parsed.drafts.length : ""} giao dịch
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </form>

        {value.trim().length > 0 ? (
          parsed.drafts.length > 0 ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {previewDrafts.map((draft) => {
                  const rule = CATEGORY_KEYWORD_RULES.find(
                    (entry) => entry.category === draft.category,
                  );
                  return (
                    <span
                      key={draft.id}
                      className="inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px]"
                      style={{
                        borderColor: `${rule?.color ?? "#64748b"}40`,
                        backgroundColor: `${rule?.color ?? "#64748b"}12`,
                      }}
                    >
                      <ExpenseIcon
                        name={rule?.icon ?? "CircleDollarSign"}
                        group={draft.groupCode}
                        color={rule?.color ?? "#94a3b8"}
                        className="h-3 w-3"
                      />
                      <span className="max-w-[180px] truncate text-slate-200">
                        {draft.title}
                      </span>
                      <span className="font-semibold tabular-nums text-slate-100">
                        {formatVnd(draft.amount)}
                      </span>
                      <span className="text-[9px] text-slate-500">
                        {draft.groupCode === "NEEDS"
                          ? "Thiết yếu"
                          : draft.groupCode === "WANTS"
                            ? "Mong muốn"
                            : "Tiết kiệm"}
                      </span>
                    </span>
                  );
                })}
                {hiddenCount > 0 ? (
                  <Badge variant="secondary" className="text-[10px]">
                    +{hiddenCount} khoản
                  </Badge>
                ) : null}
              </div>

              {parsed.unparsedSegments.length > 0 ? (
                <p className="text-[10px] text-amber-300/70">
                  Chưa nhận diện: {parsed.unparsedSegments.join(" · ")}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-[10px] text-amber-300/70">
              Chưa nhận diện được số tiền. Ví dụ hợp lệ: “ăn sáng 45k” hoặc
              “cafe 35k”.
            </p>
          )
        ) : (
          <p className="text-[10px] text-slate-600">
            Mẹo: dùng <span className="text-slate-400">k</span>,{" "}
            <span className="text-slate-400">tr</span>,{" "}
            <span className="text-slate-400">triệu</span> và “chia 3 người”.
          </p>
        )}

        {notice ? (
          <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.07] px-2.5 py-2 text-[11px] text-emerald-300">
            {notice}
          </p>
        ) : null}

        <div className="rounded-xl border border-slate-800 bg-slate-950/45 p-3">
          <div className="flex items-center justify-between gap-2 text-[10px]">
            <span className="uppercase tracking-[0.14em] text-slate-500">
              Ngân sách linh hoạt tháng này
            </span>
            <span className="tabular-nums text-slate-400">
              {formatVnd(spendingProgress.spent)} /{" "}
              {formatVnd(spendingProgress.budget)}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className={cn(
                "h-full rounded-full bg-gradient-to-r transition-all duration-500",
                spendingProgress.percentage >= 100
                  ? "from-rose-500 to-orange-400"
                  : spendingProgress.percentage >= 75
                    ? "from-amber-500 to-yellow-300"
                    : "from-emerald-500 to-teal-300",
              )}
              style={{
                width: `${Math.min(100, spendingProgress.percentage)}%`,
              }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[9px] text-slate-600">
            <span>
              Đã dùng {Math.round(spendingProgress.percentage)}% ngân sách
              linh hoạt
            </span>
            <span>
              Còn lại{" "}
              {formatVnd(
                Math.max(0, spendingProgress.budget - spendingProgress.spent),
              )}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
