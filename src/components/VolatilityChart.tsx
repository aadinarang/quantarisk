import {
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  Area, AreaChart, ReferenceLine, ReferenceArea,
} from "recharts";
import type { HistoryPoint } from "@/lib/api";
import { useMemo } from "react";

function isNum(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function fmtNum(value: unknown, digits = 4, fallback = "—") {
  return isNum(value) ? value.toFixed(digits) : fallback;
}

interface Props {
  points: HistoryPoint[];
  height?: number;
  showBands?: boolean;
  days?: number;
}

function quantile(arr: number[], q: number): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }
  return sorted[base];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function VolatilityChart({ points, height = 300, showBands = true, days }: Props) {
  const filtered = useMemo(() => {
    if (!days || days >= 9999) return points;
    return points.slice(-days);
  }, [points, days]);

  const { lowThreshold, highThreshold, yMin, yMax } = useMemo(() => {
    const vols = filtered
      .map((p) => p.volatility)
      .filter((v): v is number => typeof v === "number" && Number.isFinite(v));

    if (vols.length === 0) {
      return { lowThreshold: 0.02, highThreshold: 0.035, yMin: 0, yMax: 0.06 };
    }

    const low = quantile(vols, 0.50);
    const high = quantile(vols, 0.80);
    const min = Math.max(0, Math.min(...vols) * 0.9);
    const max = Math.max(...vols) * 1.1;

    return { lowThreshold: low, highThreshold: high, yMin: min, yMax: max };
  }, [filtered]);

  const tickInterval = useMemo(() => {
    const n = filtered.length;
    if (n <= 10) return 0;
    if (n <= 30) return 4;
    if (n <= 90) return 13;
    if (n <= 180) return 25;
    return 50;
  }, [filtered.length]);

  const displayData = filtered.map((p) => ({
    ...p,
    displayDate: formatDate(p.date),
  }));

  return (
    <div className="animate-fade-in">
      {showBands && (
        <div className="flex items-center gap-4 mb-3">
          <BandLegend color="hsl(var(--risk-low) / 0.25)" label="Low" />
          <BandLegend color="hsl(var(--risk-medium) / 0.20)" label="Medium" />
          <BandLegend color="hsl(var(--risk-high) / 0.20)" label="High" />
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={displayData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="volGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(153 100% 50%)" stopOpacity={0.2} />
              <stop offset="60%" stopColor="hsl(153 100% 50%)" stopOpacity={0.04} />
              <stop offset="100%" stopColor="hsl(153 100% 50%)" stopOpacity={0} />
            </linearGradient>
          </defs>

          {showBands && (
            <>
              <ReferenceArea y1={yMin} y2={lowThreshold} fill="hsl(153 100% 50%)" fillOpacity={0.06} stroke="none" />
              <ReferenceArea y1={lowThreshold} y2={highThreshold} fill="hsl(42 100% 50%)" fillOpacity={0.06} stroke="none" />
              <ReferenceArea y1={highThreshold} y2={yMax} fill="hsl(345 100% 59%)" fillOpacity={0.06} stroke="none" />
              <ReferenceLine y={lowThreshold} stroke="hsl(42 100% 50%)" strokeOpacity={0.4} strokeDasharray="4 4" strokeWidth={1} />
              <ReferenceLine y={highThreshold} stroke="hsl(345 100% 59%)" strokeOpacity={0.4} strokeDasharray="4 4" strokeWidth={1} />
            </>
          )}

          <CartesianGrid strokeDasharray="3 3" stroke="hsl(216 15% 12%)" strokeOpacity={0.4} vertical={false} />
          <XAxis
            dataKey="displayDate"
            tick={{ fill: "hsl(217 15% 38%)", fontSize: 9, fontFamily: "JetBrains Mono" }}
            tickLine={false}
            axisLine={false}
            interval={tickInterval}
          />
          <YAxis
            domain={[yMin, yMax]}
            tick={{ fill: "hsl(217 15% 38%)", fontSize: 9, fontFamily: "JetBrains Mono" }}
            tickLine={false}
            axisLine={false}
            width={50}
            tickFormatter={(v: unknown) => fmtNum(v, 3)}
          />
          <Tooltip
            labelFormatter={(label) => `Date: ${label}`}
            formatter={(value: unknown, name: string) => [
              fmtNum(value, 4),
              name === "volatility" ? "Volatility" : name,
            ]}
            contentStyle={{
              backgroundColor: "hsl(216 28% 7%)",
              border: "1px solid hsl(216 20% 14%)",
              borderRadius: 4,
              fontSize: 10,
              fontFamily: "JetBrains Mono",
              color: "hsl(213 20% 92%)",
              padding: "6px 10px",
            }}
          />
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
    </div>
  );
}

function BandLegend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-3 h-2 rounded-sm" style={{ backgroundColor: color, border: "1px solid " + color }} />
      <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  );
}
