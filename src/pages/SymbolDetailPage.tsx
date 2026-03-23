import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useRiskSnapshot, useRiskHistory } from "@/hooks/use-risk-data";
import { RiskBadge } from "@/components/RiskBadge";
import { VolatilityChart } from "@/components/VolatilityChart";

export default function SymbolDetailPage() {
  const { symbol } = useParams<{ symbol: string }>();
  const { data: snap, isLoading } = useRiskSnapshot(symbol ?? "");
  const { data: history } = useRiskHistory(symbol ?? "");

  if (!symbol) return null;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="animate-fade-in">
        <h1 className="text-lg font-semibold font-mono text-foreground">{symbol}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Symbol detail & volatility history</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : snap ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Current Risk</p>
            <div className="mt-2"><RiskBadge level={snap.currentRisk} /></div>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Volatility</p>
            <p className="mt-2 text-2xl font-semibold font-mono tabular-nums text-foreground">{snap.currentVolatility.toFixed(4)}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Drift Flag</p>
            <p className="mt-2 text-lg font-medium">
              {snap.driftFlag ? <span className="text-risk-medium-text">⚠ Active</span> : <span className="text-risk-low-text">Clear</span>}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Drift Score</p>
            <p className="mt-2 text-2xl font-semibold font-mono tabular-nums text-foreground">{snap.driftScore.toFixed(3)}</p>
          </div>
        </div>
      ) : null}

      <div className="rounded-lg border border-border bg-card p-5 animate-fade-in">
        <h2 className="text-sm font-medium text-foreground mb-4">Volatility History</h2>
        {history?.points ? (
          <VolatilityChart points={history.points} height={360} />
        ) : (
          <p className="text-sm text-muted-foreground py-12 text-center">Loading history…</p>
        )}
      </div>
    </div>
  );
}
