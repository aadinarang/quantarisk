import { cn } from "@/lib/utils";

export type TimeRange = "1W" | "1M" | "3M" | "6M" | "1Y" | "ALL";

export const TIME_RANGE_DAYS: Record<TimeRange, number> = {
  "1W": 7,
  "1M": 30,
  "3M": 90,
  "6M": 180,
  "1Y": 365,
  "ALL": 9999,
};

interface Props {
  value: TimeRange;
  onChange: (v: TimeRange) => void;
  className?: string;
}

const RANGES: TimeRange[] = ["1W", "1M", "3M", "6M", "1Y", "ALL"];

export function TimeRangePicker({ value, onChange, className }: Props) {
  return (
    <div
      className={cn(
        "flex items-center gap-0.5 bg-secondary/60 rounded-md p-0.5 border border-border",
        className
      )}
    >
      {RANGES.map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={cn(
            "px-2.5 py-1 text-[10px] font-mono rounded transition-all duration-150",
            value === r
              ? "bg-card text-foreground shadow-sm border border-border"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
