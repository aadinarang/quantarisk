import { XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from "recharts";
import type { HistoryPoint } from "@/lib/api";

interface Props {
  points: HistoryPoint[];
  height?: number;
}

export function VolatilityChart({ points, height = 300 }: Props) {
  return (
    <div className="animate-fade-in">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={points} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="volGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(153 100% 50%)" stopOpacity={0.15} />
              <stop offset="60%" stopColor="hsl(153 100% 50%)" stopOpacity={0.03} />
              <stop offset="100%" stopColor="hsl(153 100% 50%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(216 15% 12%)" strokeOpacity={0.4} vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "hsl(217 15% 38%)", fontSize: 9, fontFamily: "JetBrains Mono" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: "hsl(217 15% 38%)", fontSize: 9, fontFamily: "JetBrains Mono" }}
            tickLine={false}
            axisLine={false}
            width={44}
          />
          <Tooltip
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
