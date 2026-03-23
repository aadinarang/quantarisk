import { Link } from "react-router-dom";
import { useDriftSummary } from "@/hooks/use-risk-data";

export default function DriftPage() {
  const { data: items, isLoading } = useDriftSummary();
  const drifted = items?.filter((d) => d.driftFlag) ?? [];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Drift Overview</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Symbols exhibiting regime drift</p>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden animate-fade-in">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Symbol</th>
              <th className="px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Drift Score</th>
              <th className="px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={3} className="px-5 py-12 text-center text-muted-foreground">Loading…</td></tr>
            )}
            {!isLoading && drifted.length === 0 && (
              <tr><td colSpan={3} className="px-5 py-12 text-center text-muted-foreground">No symbols with active drift</td></tr>
            )}
            {drifted.map((d) => (
              <tr key={d.symbol} className="border-b border-border risk-medium-row hover:bg-accent/50 transition-colors">
                <td className="px-5 py-3 font-mono font-medium text-foreground">{d.symbol}</td>
                <td className="px-5 py-3 font-mono tabular-nums text-risk-medium-text">{d.driftScore.toFixed(3)}</td>
                <td className="px-5 py-3">
                  <Link to={`/symbol/${d.symbol}`} className="text-primary text-xs font-medium hover:underline">View Detail →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
