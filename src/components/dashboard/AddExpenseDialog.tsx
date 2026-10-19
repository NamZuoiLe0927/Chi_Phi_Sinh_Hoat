"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  CATEGORY_DEFINITIONS,
  FREQUENCY_DEFINITIONS,
} from "@/constants/finance";
import { useLivingCostStore } from "@/store/useLivingCostStore";
import type {
  CategoryGroupCode,
  Frequency,
} from "@/types/living-cost.types";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultGroup: CategoryGroupCode;
}

export function AddExpenseDialog({
  open,
  onOpenChange,
  defaultGroup,
}: AddExpenseDialogProps) {
  const addExpenseItem = useLivingCostStore((state) => state.addExpenseItem);

  const [name, setName] = useState("");
  const [group, setGroup] = useState<CategoryGroupCode>(defaultGroup);
  const [frequency, setFrequency] = useState<Frequency>("MONTHLY");
  const [unitPrice, setUnitPrice] = useState("100000");
  const [quantity, setQuantity] = useState("1");
  const [isFixed, setIsFixed] = useState(false);
  const [priority, setPriority] = useState("3");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setGroup(defaultGroup);
    setFrequency("MONTHLY");
    setUnitPrice(defaultGroup === "SAVINGS_DEBT" ? "1000000" : "100000");
    setQuantity("1");
    setIsFixed(defaultGroup === "SAVINGS_DEBT");
    setPriority(defaultGroup === "SAVINGS_DEBT" ? "2" : "3");
    setName("");
    setNote("");
    setError(null);
  }, [open, defaultGroup]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    const parsedUnitPrice = Number(unitPrice);
    const parsedQuantity = Number(quantity);
    const parsedPriority = Number(priority);

    if (!trimmedName) {
      setError("Vui lòng nhập tên khoản chi.");
      return;
    }
    if (!Number.isFinite(parsedUnitPrice) || parsedUnitPrice < 0) {
      setError("Đơn giá phải là số không âm.");
      return;
    }
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      setError("Số lượng phải lớn hơn 0.");
      return;
    }

    addExpenseItem({
      name: trimmedName,
      group,
      icon: CATEGORY_DEFINITIONS[group].icon,
      color: CATEGORY_DEFINITIONS[group].color,
      frequency,
      unitPrice: Math.round(parsedUnitPrice),
      quantityPerPeriod: parsedQuantity,
      isFixed,
      isEnabled: true,
      priority: Number.isFinite(parsedPriority) ? parsedPriority : 3,
      note: note.trim() || null,
      sortOrder: 0,
    });

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Thêm khoản chi mới</DialogTitle>
          <DialogDescription>
            Thêm một khoản chi vào nhóm phù hợp. Bạn có thể bật/tắt hoặc chỉnh
            sửa sau.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="expense-name">Tên khoản chi</Label>
            <Input
              id="expense-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ví dụ: Tiền gửi xe, Học phí, Cà phê..."
              autoFocus
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Nhóm chi phí</Label>
              <Select
                value={group}
                onValueChange={(value) => setGroup(value as CategoryGroupCode)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(CATEGORY_DEFINITIONS).map((definition) => (
                    <SelectItem key={definition.code} value={definition.code}>
                      {definition.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Tần suất</Label>
              <Select
                value={frequency}
                onValueChange={(value) => setFrequency(value as Frequency)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(FREQUENCY_DEFINITIONS).map((definition) => (
                    <SelectItem key={definition.value} value={definition.value}>
                      {definition.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="expense-price">Đơn giá</Label>
              <div className="relative">
                <Input
                  id="expense-price"
                  type="number"
                  min={0}
                  step={1000}
                  value={unitPrice}
                  onChange={(event) => setUnitPrice(event.target.value)}
                  className="pr-8"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                  đ
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="expense-quantity">Số lượng</Label>
              <Input
                id="expense-quantity"
                type="number"
                min={0}
                step={1}
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Mức ưu tiên cắt giảm</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Cố định, hạn chế cắt</SelectItem>
                  <SelectItem value="2">2 - Thiết yếu</SelectItem>
                  <SelectItem value="3">3 - Linh hoạt</SelectItem>
                  <SelectItem value="4">4 - Có thể cắt</SelectItem>
                  <SelectItem value="5">5 - Cắt trước</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2.5">
              <div>
                <p className="text-sm font-medium text-slate-200">
                  Khoản cố định
                </p>
                <p className="text-[10px] text-slate-500">
                  Giữ nguyên khi tối ưu tự động
                </p>
              </div>
              <Switch
                checked={isFixed}
                onCheckedChange={setIsFixed}
                aria-label="Khoản chi cố định"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="expense-note">Ghi chú</Label>
            <Input
              id="expense-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Không bắt buộc"
            />
          </div>

          {error ? (
            <p className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Hủy
              </Button>
            </DialogClose>
            <Button type="submit">Thêm khoản chi</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
