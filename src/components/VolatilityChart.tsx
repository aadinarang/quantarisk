import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { HistoryPoint } from "@/lib/api";

interface Props {
  points: HistoryPoint[];
  height?: number;
}

export function VolatilityChart({ points, height = 300 }: Props) {
  return (
    <div className="animate-fade-in">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={points} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 18%)" />
          <XAxis
            dataKey="date"
            tick={{ fill: "hsl(215 12% 50%)", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "hsl(220 14% 18%)" }}
          />
          <YAxis
            tick={{ fill: "hsl(215 12% 50%)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(220 18% 12%)",
              border: "1px solid hsl(220 14% 18%)",
              borderRadius: 8,
              fontSize: 12,
              color: "hsl(210 20% 90%)",
            }}
          />
          <Line
            type="monotone"
            dataKey="volatility"
            stroke="hsl(210 60% 50%)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "hsl(210 60% 50%)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
