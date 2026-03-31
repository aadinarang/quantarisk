import { useMemo, useState } from "react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
  ReferenceLine,
  ReferenceArea,
} from "recharts";
import { cn } from "@/lib/utils";
import type { RiskHistoryPoint } from "@/lib/api";

type TimeRange = "1W" | "1M" | "3M" | "6M" | "1Y";

const RANGE_DAYS: Record<TimeRange, number> = {
  "1W": 7,
  "1M": 30,
  "3M": 90,
  "6M": 180,
  "1Y": 365,
};

function pct(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const i = Math.floor(sorted.length * p);
  return sorted[Math.min(i, sorted.length - 1)];
}

const normalizeRiskLevel = (riskLevel?: string) => {
  const raw = (riskLevel ?? "").trim().toLowerCase();
  if (raw === "high") return "High";
  if (raw === "medium") return "Medium";
  return "Low";
};

const riskColor = (riskLevel?: string) => {
  const normalized = normalizeRiskLevel(riskLevel);
  if (normalized === "High") return "#ff3d71";
  if (normalized === "Medium") return "#ffaa00";
  return "#00e676";
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  const vol = payload[0]?.value as number;
  const point = payload[0]?.payload as RiskHistoryPoint;

  return (
    <div className="bg-card border border-border rounded px-3 py-2 text-xs font-mono shadow-lg space-y-0.5">
      <p className="text-muted-foreground">{label}</p>
      <p className="text-foreground">
        Vol: <span className="font-semibold">{Number(vol ?? 0).toFixed(4)}</span>
      </p>
      <p style={{ color: riskColor(point?.riskLevel) }}>
        Risk: {normalizeRiskLevel(point?.riskLevel)}
      </p>
    </div>
  );
};

interface Props {
  points: RiskHistoryPoint[];
  height?: number;
  showRangePicker?: boolean;
  defaultRange?: TimeRange;
  showBands?: boolean;
  days?: number;
}

export function VolatilityChart({
  points,
  height = 300,
  showRangePicker = true,
  defaultRange = "3M",
  showBands = true,
  days,
}: Props) {
  const initialRange = useMemo<TimeRange>(() => {
    if (days !== undefined) {
      if (days <= 7) return "1W";
      if (days <= 30) return "1M";
      if (days <= 90) return "3M";
      if (days <= 180) return "6M";
      return "1Y";
    }
    return defaultRange;
  }, [days, defaultRange]);

  const [range, setRange] = useState<TimeRange>(initialRange);

  const filtered = useMemo(() => {
    const sliceDays = days ?? RANGE_DAYS[range];
    return points.slice(-sliceDays);
  }, [points, range, days]);

  const { lowMed, medHigh } = useMemo(() => {
    const vols = [...points]
      .map((p) => Number(p.volatility) || 0)
      .sort((a, b) => a - b);

    return {
      lowMed: parseFloat(pct(vols, 0.5).toFixed(4)),
      medHigh: parseFloat(pct(vols, 0.8).toFixed(4)),
    };
  }, [points]);

  const { yMin, yMax } = useMemo(() => {
    if (filtered.length === 0) {
      return { yMin: 0, yMax: 1 };
    }

    const values = filtered.map((p) => Number(p.volatility) || 0);
    const min = Math.min(...values);
    const max = Math.max(...values);

    return {
      yMin: Math.max(0, min * 0.88),
      yMax: Math.max(max * 1.12, 0.01),
    };
  }, [filtered]);

  const tickInterval =
    range === "1W" ? 0 : range === "1M" ? 6 : range === "3M" ? 14 : range === "6M" ? 29 : 59;

  if (!points.length) {
    return (
      <div
        className="rounded-lg border border-border bg-card/50 flex items-center justify-center text-sm text-muted-foreground"
        style={{ height }}
      >
        No volatility history available.
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-fade-in">
      {showRangePicker && days === undefined && (
        <div className="flex items-center gap-1">
          {(["1W", "1M", "3M", "6M", "1Y"] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "px-2.5 py-1 text-[10px] font-mono rounded transition-all",
                r === range
                  ? "bg-primary/15 text-primary border border-primary/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent",
              )}
            >
              {r}
            </button>
          ))}
          <span className="ml-auto text-[9px] font-mono text-muted-foreground/40">
            {filtered.length} days
          </span>
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={filtered} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="volGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(153 100% 50%)" stopOpacity={0.18} />
              <stop offset="70%" stopColor="hsl(153 100% 50%)" stopOpacity={0.03} />
              <stop offset="100%" stopColor="hsl(153 100% 50%)" stopOpacity={0} />
            </linearGradient>
          </defs>

          {showBands && (
            <>
              <ReferenceArea
                y1={yMin}
                y2={lowMed}
                fill="hsl(153 100% 50%)"
                fillOpacity={0.04}
                stroke="none"
              />
              <ReferenceArea
                y1={lowMed}
                y2={medHigh}
                fill="hsl(42 100% 50%)"
                fillOpacity={0.05}
                stroke="none"
              />
              <ReferenceArea
                y1={medHigh}
                y2={yMax}
                fill="hsl(345 100% 59%)"
                fillOpacity={0.06}
                stroke="none"
              />

              <ReferenceLine
                y={lowMed}
                stroke="hsl(153 100% 50%)"
                strokeOpacity={0.35}
                strokeDasharray="4 4"
                strokeWidth={1}
                label={{
                  value: "LOW·MED",
                  position: "insideTopRight",
                  fontSize: 8,
                  fontFamily: "JetBrains Mono",
                  fill: "hsl(153 100% 50% / 0.5)",
                }}
              />
              <ReferenceLine
                y={medHigh}
                stroke="hsl(345 100% 59%)"
                strokeOpacity={0.35}
                strokeDasharray="4 4"
                strokeWidth={1}
                label={{
                  value: "MED·HIGH",
                  position: "insideTopRight",
                  fontSize: 8,
                  fontFamily: "JetBrains Mono",
                  fill: "hsl(345 100% 59% / 0.5)",
                }}
              />
            </>
          )}

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(216 15% 12%)"
            strokeOpacity={0.4}
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fill: "hsl(217 15% 38%)", fontSize: 9, fontFamily: "JetBrains Mono" }}
            tickLine={false}
            axisLine={false}
            interval={tickInterval}
            tickFormatter={(v) => String(v).slice(5)}
          />
          <YAxis
            domain={[yMin, yMax]}
            tick={{ fill: "hsl(217 15% 38%)", fontSize: 9, fontFamily: "JetBrains Mono" }}
            tickLine={false}
            axisLine={false}
            width={44}
            tickFormatter={(v) => Number(v).toFixed(3)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="volatility"
            stroke="hsl(153 100% 50%)"
            strokeWidth={1.5}
            fill="url(#volGradient)"
            dot={false}
            activeDot={{
              r: 3,
              fill: "hsl(153 100% 50%)",
              stroke: "hsl(153 100% 50% / 0.3)",
              strokeWidth: 4,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {showBands && (
        <div className="flex items-center gap-4 text-[9px] font-mono text-muted-foreground/50 px-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-risk-low/20 border border-risk-low/30 inline-block" />
            Low zone
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-risk-medium/20 border border-risk-medium/30 inline-block" />
            Medium zone
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-risk-high/20 border border-risk-high/30 inline-block" />
            High zone
          </span>
        </div>
      )}
    </div>
  );
}