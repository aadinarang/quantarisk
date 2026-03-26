import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  variant?: "default" | "high" | "medium" | "low";
  delay?: number;
}

const accentColors = {
  default: "bg-muted-foreground/20",
  high: "bg-risk-high",
  medium: "bg-risk-medium",
  low: "bg-risk-low",
};

const iconColors = {
  default: "text-muted-foreground",
  high: "text-risk-high-text",
  medium: "text-risk-medium-text",
  low: "text-risk-low-text",
};

const bgTints = {
  default: "",
  high: "hover:border-risk-high/20",
  medium: "hover:border-risk-medium/20",
  low: "hover:border-risk-low/20",
};

function useCountUp(target: number, duration = 600) {
  const [value, setValue] = useState(0);
  const ref = useRef<number>(0);

  useEffect(() => {
    if (isNaN(target)) return;
    const start = ref.current;
    const diff = target - start;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + diff * eased);
      setValue(current);
      if (progress < 1) requestAnimationFrame(tick);
      else ref.current = target;
    }
    requestAnimationFrame(tick);
  }, [target, duration]);

  return value;
}

export function KpiCard({ label, value, icon: Icon, variant = "default", delay = 0 }: KpiCardProps) {
  const isNumber = typeof value === "number" && !isNaN(value);
  const animatedValue = useCountUp(isNumber ? value : 0);

  return (
    <div
      className={cn(
        "group relative rounded-md border border-border bg-card p-4 overflow-hidden animate-fade-up card-shine transition-colors duration-200",
        bgTints[variant]
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "backwards" }}
    >
      {/* Bottom accent line */}
      <div className={cn("absolute bottom-0 left-0 right-0 h-[2px]", accentColors[variant])} />
      
      {/* Ambient glow on hover for colored variants */}
      {variant !== "default" && (
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none",
          variant === "high" && "bg-risk-high/[0.02]",
          variant === "medium" && "bg-risk-medium/[0.02]",
          variant === "low" && "bg-risk-low/[0.02]",
        )} />
      )}

      <div className="relative flex items-start justify-between mb-2">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <Icon className={cn("h-3.5 w-3.5 opacity-40 group-hover:opacity-70 transition-opacity", iconColors[variant])} strokeWidth={1.5} />
      </div>
      <p className="relative text-2xl font-semibold font-mono tabular-nums text-foreground">
        {isNumber ? animatedValue : value}
      </p>
    </div>
  );
}
