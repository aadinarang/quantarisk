import { useMemo, useState } from "react";
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  Area, AreaChart, ReferenceLine, ReferenceArea,
} from "recharts";
import { cn } from "@/lib/utils";
import type { HistoryPoint } from "@/lib/api";

// ── Time range ────────────────────────────────────────────────────
type TimeRange = "1W" | "1M" | "3M" | "6M" | "1Y";
const RANGE_DAYS: Record<TimeRange, number> = {
  "1W": 7, "1M": 30, "3M": 90, "6M": 180, "1Y": 365,
};

// ── Percentile helper ─────────────────────────────────────────────
function pct(sorted: number[], p: number): number {
  const i = Math.floor(sorted.length * p);
  return sorted[Math.min(i, sorted.length - 1)];
}

// ── Custom tooltip ────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const vol   = payload[0]?.value as number;
  const point = payload[0]?.payload as HistoryPoint;
  const color =
    point.riskLevel === "HIGH"   ? "#ff3d71" :
    point.riskLevel === "MEDIUM" ? "#ffaa00" : "#00e676";
  return (
    <div className="bg-card border border-border rounded px-3 py-2 text-xs font-mono shadow-lg space-y-0.5">
      <p className="text-muted-foreground">{label}</p>
      <p className="text-foreground">
        Vol: <span className="font-semibold">{vol?.toFixed(4)}</span>
      </p>
      <p style={{ color }}>Risk: {point.riskLevel}</p>
    </div>
  );
};

// ── Component ─────────────────────────────────────────────────────
interface Props {
  points: HistoryPoint[];
  height?: number;
  showRangePicker?: boolean;
  defaultRange?: TimeRange;
}

export function VolatilityChart({
  points,
  height = 300,
  showRangePicker = true,
  defaultRange = "3M",
}: Props) {
  const [range, setRange] = useState<TimeRange>(defaultRange);

  // Slice to selected range
  const filtered = useMemo(() => {
    const days = RANGE_DAYS[range];
    return points.slice(-days);
  }, [points, range]);

  // Compute risk band thresholds from the full series for consistency
  const { lowMed, medHigh } = useMemo(() => {
    const vols = [...points].map(p => p.volatility).sort((a, b) => a - b);
    return {
      lowMed:  parseFloat(pct(vols, 0.50).toFixed(4)),
      medHigh: parseFloat(pct(vols, 0.80).toFixed(4)),
    };
  }, [points]);

  const yMin = useMemo(
    () => Math.max(0, Math.min(...filtered.map(p => p.volatility)) * 0.88),
    [filtered]
  );
  const yMax = useMemo(
    () => Math.max(...filtered.map(p => p.volatility)) * 1.12,
    [filtered]
  );

  // Tick density by range
  const tickInterval =
    range === "1W" ? 0 :
    range === "1M" ? 6 :
    range === "3M" ? 14 :
    range === "6M" ? 29 : 59;

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Time range picker */}
      {showRangePicker && (
        <div className="flex items-center gap-1">
          {(["1W","1M","3M","6M","1Y"] as TimeRange[]).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "px-2.5 py-1 text-[10px] font-mono rounded transition-all",
                r === range
                  ? "bg-primary/15 text-primary border border-primary/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent"
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
              <stop offset="0%"   stopColor="hsl(153 100% 50%)" stopOpacity={0.18} />
              <stop offset="70%"  stopColor="hsl(153 100% 50%)" stopOpacity={0.03} />
              <stop offset="100%" stopColor="hsl(153 100% 50%)" stopOpacity={0}    />
            </linearGradient>
          </defs>

          {/* Risk band zones */}
          <ReferenceArea y1={yMin}    y2={lowMed}  fill="hsl(153 100% 50%)"  fillOpacity={0.04} stroke="none" />
          <ReferenceArea y1={lowMed}  y2={medHigh} fill="hsl(42  100% 50%)"  fillOpacity={0.05} stroke="none" />
          <ReferenceArea y1={medHigh} y2={yMax}    fill="hsl(345 100% 59%)"  fillOpacity={0.06} stroke="none" />

          {/* Threshold lines */}
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
            tickFormatter={v => v.slice(5)} // show MM-DD
          />
          <YAxis
            domain={[yMin, yMax]}
            tick={{ fill: "hsl(217 15% 38%)", fontSize: 9, fontFamily: "JetBrains Mono" }}
            tickLine={false}
            axisLine={false}
            width={44}
            tickFormatter={v => v.toFixed(3)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="volatility"
            stroke="hsl(153 100% 50%)"
            strokeWidth={1.5}
            fill="url(#volGradient)"
            dot={false}
            activeDot={{ r: 3, fill: "hsl(153 100% 50%)", stroke: "hsl(153 100% 50% / 0.3)", strokeWidth: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Band legend */}
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
    </div>
  );
}
