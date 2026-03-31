import { cn } from "@/lib/utils";
import { useEffect, useRef, useState, useMemo } from "react";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  variant?: "default" | "high" | "medium" | "low";
  delay?: number;
  sparkData?: number[];
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

const sparkColors = {
  default: "var(--muted-foreground)",
  high: "var(--risk-high)",
  medium: "var(--risk-medium)",
  low: "var(--risk-low)",
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

function Sparkline({ data, color, width = 64, height = 20 }: { data: number[]; color: string; width?: number; height?: number }) {
  const path = useMemo(() => {
    if (data.length < 2) return "";
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const step = width / (data.length - 1);

    return data
      .map((v, i) => {
        const x = i * step;
        const y = height - ((v - min) / range) * (height - 2) - 1;
        return `${i === 0 ? "M" : "L"} ${Number.isFinite(x) ? x.toFixed(1) : x} ${Number.isFinite(y) ? y.toFixed(1) : y}`;
      })
      .join(" ");
  }, [data, width, height]);

  const areaPath = useMemo(() => {
    if (data.length < 2) return "";
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const step = width / (data.length - 1);

    const points = data.map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * (height - 2) - 1;
      return `${Number.isFinite(x) ? x.toFixed(1) : x} ${Number.isFinite(y) ? y.toFixed(1) : y}`;
    });

    return `M 0 ${height} L ${points.join(" L ")} L ${width} ${height} Z`;
  }, [data, width, height]);

  if (data.length < 2) return null;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`spark-grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={`hsl(${color})`} stopOpacity={0.15} />
          <stop offset="100%" stopColor={`hsl(${color})`} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#spark-grad-${color})`} />
      <path d={path} fill="none" stroke={`hsl(${color})`} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* End dot */}
      <circle
        cx={(data.length - 1) * (width / (data.length - 1))}
        cy={height - ((data[data.length - 1] - Math.min(...data)) / (Math.max(...data) - Math.min(...data) || 1)) * (height - 2) - 1}
        r={2}
        fill={`hsl(${color})`}
      />
    </svg>
  );
}

export function KpiCard({ label, value, icon: Icon, variant = "default", delay = 0, sparkData }: KpiCardProps) {
  const isNumber = typeof value === "number" && !isNaN(value);
  const animatedValue = useCountUp(isNumber ? value : 0);
  const color = sparkColors[variant];

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

      {/* Ambient glow on hover */}
      {variant !== "default" && (
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none",
          variant === "high" && "bg-risk-high/[0.03]",
          variant === "medium" && "bg-risk-medium/[0.03]",
          variant === "low" && "bg-risk-low/[0.03]",
        )} />
      )}

      <div className="relative flex items-start justify-between mb-1">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <Icon className={cn("h-3.5 w-3.5 opacity-40 group-hover:opacity-70 transition-opacity", iconColors[variant])} strokeWidth={1.5} />
      </div>

      <div className="relative flex items-end justify-between gap-2">
        <p className="text-2xl font-semibold font-mono tabular-nums text-foreground leading-none">
          {isNumber ? animatedValue : value}
        </p>
        {sparkData && sparkData.length > 1 && (
          <div className="opacity-60 group-hover:opacity-100 transition-opacity mb-0.5">
            <Sparkline data={sparkData} color={color} width={56} height={18} />
          </div>
        )}
      </div>
    </div>
  );
}

