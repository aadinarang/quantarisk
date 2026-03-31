import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/lib/api";

const normalizeRiskLevel = (level: RiskLevel): "High" | "Medium" | "Low" => {
  const raw = String(level).trim().toLowerCase();

  if (raw === "high") return "High";
  if (raw === "medium") return "Medium";
  return "Low";
};

const riskStyles: Record<"High" | "Medium" | "Low", string> = {
  High: "bg-risk-high-muted text-risk-high-text border-risk-high/40 badge-glow-high",
  Medium: "bg-risk-medium-muted text-risk-medium-text border-risk-medium/40 badge-glow-medium",
  Low: "bg-risk-low-muted text-risk-low-text border-risk-low/40 badge-glow-low",
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  const normalized = normalizeRiskLevel(level);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-transform hover:scale-105",
        riskStyles[normalized],
      )}
    >
      {normalized}
    </span>
  );
}