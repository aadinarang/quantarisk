import { useParams, Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";
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
      {/* Breadcrumb */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-3 w-3" /> Dashboard / {symbol}
      </Link>

      {/* Drift alert banner */}
      {snap?.driftFlag && (
        <div className="rounded-md border border-risk-high/30 bg-risk-high-muted/50 px-4 py-3 flex items-center gap-3 animate-fade-in glow-red">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-sonar absolute inline-flex h-full w-full rounded-full bg-risk-high opacity-50" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-risk-high" />
          </span>
          <AlertTriangle className="h-3.5 w-3.5 text-risk-high-text" strokeWidth={1.5} />
          <span className="text-xs font-medium text-risk-high-text font-mono">
            VOLATILITY REGIME SHIFT DETECTED · score {snap.driftScore.toFixed(3)}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="animate-fade-up flex items-center gap-4 flex-wrap">
        <h2 className="text-3xl font-semibold font-mono text-foreground tracking-tight">{symbol}</h2>
        {snap && <RiskBadge level={snap.currentRisk} />}
      </div>

      {isLoading ? (
        <p className="text-xs text-muted-foreground font-mono">Loading…</p>
      ) : snap ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-up" style={{ animationDelay: "100ms", animationFillMode: "backwards" }}>
          {/* Chart */}
          <div className="lg:col-span-2 rounded-md border border-border bg-card p-5">
            <h3 className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-4">Volatility History</h3>
            {history?.points ? (
              <VolatilityChart points={history.points} height={360} />
            ) : (
              <p className="text-xs text-muted-foreground py-12 text-center font-mono">Loading history…</p>
            )}
          </div>

          {/* Info card */}
          <div className="rounded-md border border-border bg-card p-5 space-y-4">
            <DataRow label="Current Volatility" value={snap.currentVolatility.toFixed(4)} />
            <DataRow label="Risk Level" value={snap.currentRisk} />
            <DataRow
              label="Drift Status"
              value={snap.driftFlag ? `Flagged · ${snap.driftScore.toFixed(3)}` : "Stable"}
              highlight={snap.driftFlag}
            />
            <div className="pt-3 border-t border-border">
              <p className="text-[10px] text-muted-foreground leading-relaxed font-mono opacity-60">
                Drift is computed by comparing recent and reference volatility distributions.
                A flag indicates the asset has moved into a different volatility regime.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DataRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground shrink-0">{label}</span>
      <span className="flex-1 border-b border-dotted border-border mx-2" />
      <span className={`text-xs font-mono font-medium tabular-nums ${highlight ? "text-risk-high-text" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  );
}
