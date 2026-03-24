import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/lib/api";

const riskStyles: Record<RiskLevel, string> = {
  HIGH: "bg-risk-high-muted text-risk-high-text border-risk-high/40 badge-glow-high",
  MEDIUM: "bg-risk-medium-muted text-risk-medium-text border-risk-medium/40 badge-glow-medium",
  LOW: "bg-risk-low-muted text-risk-low-text border-risk-low/40 badge-glow-low",
};

const labels: Record<RiskLevel, string> = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-transform hover:scale-105",
        riskStyles[level]
      )}
    >
      {labels[level]}
    </span>
  );
}
