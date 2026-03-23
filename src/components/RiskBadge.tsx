import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/lib/api";

const riskStyles: Record<RiskLevel, string> = {
  HIGH: "bg-risk-high-muted text-risk-high-text border-risk-high/30",
  MEDIUM: "bg-risk-medium-muted text-risk-medium-text border-risk-medium/30",
  LOW: "bg-risk-low-muted text-risk-low-text border-risk-low/30",
};

const labels: Record<RiskLevel, string> = {
  HIGH: "High risk",
  MEDIUM: "Medium risk",
  LOW: "Low risk",
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider", riskStyles[level])}>
      {labels[level]}
    </span>
  );
}
