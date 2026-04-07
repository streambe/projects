import { cn } from "@/lib/utils";

export function CostMeter({
  used,
  cap,
  className,
}: {
  used: number;
  cap: number;
  className?: string;
}) {
  const safeCap = cap > 0 ? cap : 1;
  const ratio = used / safeCap;
  const pct = Math.min(100, Math.round(ratio * 100));
  const barColor =
    ratio < 0.5
      ? "bg-emerald-500"
      : ratio < 0.8
        ? "bg-amber-500"
        : "bg-destructive";

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex justify-between text-xs tabular-nums">
        <span className="text-muted-foreground">
          ${used.toFixed(2)} / ${cap.toFixed(2)}
        </span>
        <span
          className={cn(
            "font-medium",
            ratio >= 0.8
              ? "text-destructive"
              : ratio >= 0.5
                ? "text-amber-400"
                : "text-muted-foreground",
          )}
        >
          {pct}%
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
        <div
          className={cn("h-full transition-all", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
