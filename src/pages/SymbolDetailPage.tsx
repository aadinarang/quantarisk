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
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </Link>

      {/* Header */}
      <div className="animate-fade-in flex items-center gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold font-mono text-foreground">{symbol}</h1>
        {snap && <RiskBadge level={snap.currentRisk} />}
        {snap?.driftFlag && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-risk-high-muted border border-risk-high/30 px-3 py-1 text-xs font-semibold text-risk-high-text">
            Volatility regime shift · score {snap.driftScore.toFixed(3)}
          </span>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : snap ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Left: chart */}
          <div className="lg:col-span-2 rounded-lg border border-border bg-card p-5">
            <h2 className="text-sm font-medium text-foreground mb-4">Volatility History</h2>
            {history?.points ? (
              <VolatilityChart points={history.points} height={360} />
            ) : (
              <p className="text-sm text-muted-foreground py-12 text-center">Loading history…</p>
            )}
          </div>

          {/* Right: info card */}
          <div className="rounded-lg border border-border bg-card p-5 space-y-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Current Volatility</p>
              <p className="mt-1.5 text-2xl font-semibold font-mono tabular-nums text-foreground">{snap.currentVolatility.toFixed(4)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Risk Level</p>
              <div className="mt-1.5"><RiskBadge level={snap.currentRisk} /></div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Drift Status</p>
              <p className="mt-1.5 text-sm font-medium">
                {snap.driftFlag
                  ? <span className="text-risk-high-text">Flagged, score {snap.driftScore.toFixed(3)}</span>
                  : <span className="text-risk-low-text">Stable</span>
                }
              </p>
            </div>
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground leading-relaxed">
                A drift flag indicates a statistically significant shift in the volatility regime compared to the reference window.
                This may signal changing market conditions that require portfolio review.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
