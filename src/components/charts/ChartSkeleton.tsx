import { cn } from "@/lib/utils";

interface ChartSkeletonProps {
  className?: string;
}

export function ChartSkeleton({ className }: ChartSkeletonProps) {
  return (
    <div
      className={cn(
        "h-[220px] w-full animate-pulse rounded-xl border border-slate-800/60 bg-slate-800/30",
        className,
      )}
    />
  );
}
