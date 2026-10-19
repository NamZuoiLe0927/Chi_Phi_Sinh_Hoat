import {
  Bot,
  Car,
  CircleDollarSign,
  Clapperboard,
  Coffee,
  CupSoda,
  Droplets,
  Dumbbell,
  Fuel,
  HeartPulse,
  Home,
  Landmark,
  Music,
  Package,
  PartyPopper,
  PiggyBank,
  Plane,
  ReceiptText,
  Scissors,
  ShieldCheck,
  Shirt,
  ShoppingBasket,
  Smartphone,
  TrendingUp,
  Tv,
  UtensilsCrossed,
  Wifi,
  Youtube,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CategoryGroupCode } from "@/types/living-cost.types";

const EXPENSE_ICONS: Record<string, LucideIcon> = {
  Home,
  Zap,
  Droplets,
  Wifi,
  Coffee,
  UtensilsCrossed,
  ShoppingBasket,
  Fuel,
  Car,
  HeartPulse,
  Package,
  CupSoda,
  PartyPopper,
  Tv,
  Music,
  Youtube,
  Bot,
  Shirt,
  Dumbbell,
  Plane,
  Clapperboard,
  Scissors,
  ShieldCheck,
  TrendingUp,
  Landmark,
  Smartphone,
  ReceiptText,
  CircleDollarSign,
  PiggyBank,
};

const GROUP_FALLBACK: Record<CategoryGroupCode, LucideIcon> = {
  NEEDS: Home,
  WANTS: Coffee,
  SAVINGS_DEBT: PiggyBank,
};

interface ExpenseIconProps {
  name: string;
  group: CategoryGroupCode;
  color?: string;
  className?: string;
}

export function ExpenseIcon({
  name,
  group,
  color,
  className,
}: ExpenseIconProps) {
  const Icon = EXPENSE_ICONS[name] ?? GROUP_FALLBACK[group];

  return (
    <Icon
      className={cn("h-4 w-4", className)}
      style={color ? { color } : undefined}
      aria-hidden="true"
    />
  );
}
