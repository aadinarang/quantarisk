import { cn } from "@/lib/utils";

const riskStyles = {
  high: "bg-risk-high-muted text-risk-high-text border-risk-high/30",
  medium: "bg-risk-medium-muted text-risk-medium-text border-risk-medium/30",
  low: "bg-risk-low-muted text-risk-low-text border-risk-low/30",
};

export function RiskBadge({ level }: { level: "high" | "medium" | "low" }) {
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider", riskStyles[level])}>
      {level}
    </span>
  );
}
