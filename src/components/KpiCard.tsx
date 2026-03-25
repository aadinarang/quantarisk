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
      className="relative rounded-md border border-border bg-card p-4 overflow-hidden animate-fade-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "backwards" }}
    >
      <div className={cn("absolute bottom-0 left-0 right-0 h-[2px]", accentColors[variant])} />
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs text-muted-foreground">{label}</p>
        <Icon className={cn("h-3.5 w-3.5", iconColors[variant])} strokeWidth={1.5} />
      </div>
      <p className="text-xl font-semibold font-mono tabular-nums text-foreground">
        {isNumber ? animatedValue : value}
      </p>
    </div>
  );
}
