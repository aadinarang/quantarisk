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
      <div>
        <h1 className="text-lg font-semibold text-foreground">Drift Overview</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Symbols exhibiting regime drift</p>
      </div>

      {/* Summary + toggle */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <p className="text-sm text-muted-foreground">
          Active drift symbols: <span className="font-mono font-medium text-foreground">{activeCount}</span> / <span className="font-mono">{totalCount}</span>
        </p>
        <div className="flex items-center gap-2">
          <Switch id="show-all" checked={showAll} onCheckedChange={setShowAll} />
          <Label htmlFor="show-all" className="text-xs text-muted-foreground cursor-pointer">Show all symbols</Label>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden animate-fade-in">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Symbol</th>
              <th className="px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</th>
              <th className="px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Drift Score</th>
              <th className="px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={4} className="px-5 py-12 text-center text-muted-foreground">Loading…</td></tr>
            )}
            {!isLoading && displayed.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-12 text-center text-muted-foreground">No symbols with active drift</td></tr>
            )}
            {displayed.map((d) => (
              <tr
                key={d.symbol}
                onClick={() => navigate(`/symbol/${d.symbol}`)}
                className={cn(
                  "border-b border-border cursor-pointer transition-colors hover:bg-accent/50",
                  d.driftFlag && "risk-high-row"
                )}
              >
                <td className={cn("px-5 py-3 font-mono text-foreground", d.driftFlag && "font-bold")}>{d.symbol}</td>
                <td className="px-5 py-3 text-muted-foreground">{nameMap.get(d.symbol) ?? "—"}</td>
                <td className="px-5 py-3 font-mono tabular-nums text-foreground">{d.driftScore.toFixed(3)}</td>
                <td className="px-5 py-3">
                  {d.driftFlag ? (
                    <span className="text-risk-high-text text-xs font-semibold">Drifting</span>
                  ) : (
                    <span className="text-muted-foreground text-xs">Stable</span>
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
