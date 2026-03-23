import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  variant?: "default" | "high" | "medium" | "low";
}

const variantStyles = {
  default: "border-border",
  high: "border-risk-high/30 bg-risk-high-muted/50",
  medium: "border-risk-medium/30 bg-risk-medium-muted/50",
  low: "border-risk-low/30 bg-risk-low-muted/50",
};

const iconStyles = {
  default: "text-muted-foreground",
  high: "text-risk-high-text",
  medium: "text-risk-medium-text",
  low: "text-risk-low-text",
};

export function KpiCard({ label, value, icon: Icon, variant = "default" }: KpiCardProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-5 animate-fade-in", variantStyles[variant])}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <Icon className={cn("h-4 w-4", iconStyles[variant])} />
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}
