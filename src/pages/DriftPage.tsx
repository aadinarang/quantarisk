import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDriftSummary, useSymbols } from "@/hooks/use-risk-data";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function DriftPage() {
  const { data: items, isLoading } = useDriftSummary();
  const { data: symbols } = useSymbols();
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);

  const nameMap = new Map(symbols?.map((s) => [s.symbol, s.name]) ?? []);
  const displayed = showAll ? (items ?? []) : (items?.filter((d) => d.driftFlag) ?? []);
  const activeCount = items?.filter((d) => d.driftFlag).length ?? 0;
  const totalCount = items?.length ?? 0;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Summary */}
      <div className="flex items-center justify-between flex-wrap gap-4 animate-fade-up">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-mono font-bold text-risk-high-text tabular-nums">{activeCount}</span>
          <span className="text-xs text-muted-foreground font-mono">/ {totalCount} symbols drifting</span>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="show-all" checked={showAll} onCheckedChange={setShowAll} />
          <Label htmlFor="show-all" className="text-[10px] text-muted-foreground cursor-pointer uppercase tracking-widest">
            Show all
          </Label>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border border-border bg-card overflow-hidden animate-fade-up" style={{ animationDelay: "100ms", animationFillMode: "backwards" }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-5 py-2.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Symbol</th>
              <th className="px-5 py-2.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Name</th>
              <th className="px-5 py-2.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Drift Score</th>
              <th className="px-5 py-2.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={4} className="px-5 py-12 text-center text-muted-foreground font-mono text-xs">Loading…</td></tr>
            )}
            {!isLoading && displayed.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-12 text-center text-muted-foreground font-mono text-xs">No active drift</td></tr>
            )}
            {displayed.map((d) => (
              <tr
                key={d.symbol}
                onClick={() => navigate(`/symbol/${d.symbol}`)}
                className={cn(
                  "border-b border-border cursor-pointer transition-all duration-150",
                  "hover:bg-[hsl(153_100%_50%_/_0.03)]",
                  d.driftFlag && "border-l-2 border-l-risk-high"
                )}
              >
                <td className={cn("px-5 py-3 font-mono text-xs text-foreground", d.driftFlag && "font-bold")}>{d.symbol}</td>
                <td className="px-5 py-3 text-muted-foreground text-xs">{nameMap.get(d.symbol) ?? "—"}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono tabular-nums text-xs text-foreground">{d.driftScore.toFixed(3)}</span>
                    <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(d.driftScore * 300, 100)}%`,
                          backgroundColor: d.driftScore > 0.2 ? "hsl(345 100% 59%)" : d.driftScore > 0.05 ? "hsl(42 100% 50%)" : "hsl(153 100% 50%)",
                        }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  {d.driftFlag ? (
                    <span className="inline-flex items-center gap-1.5 text-risk-high-text text-[10px] font-semibold uppercase tracking-wider">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-sonar absolute inline-flex h-full w-full rounded-full bg-risk-high opacity-50" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-risk-high" />
                      </span>
                      Drifting
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-[10px] uppercase tracking-wider">Stable</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
