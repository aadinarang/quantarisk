import { useParams, Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Star, StarOff, ChevronRight } from "lucide-react";
import { useRiskSnapshot, useRiskHistory, useSymbolRatios, useSymbols } from "@/hooks/use-risk-data";
import { useWatchlist } from "@/hooks/use-watchlist";
import { RiskBadge } from "@/components/RiskBadge";
import { VolatilityChart } from "@/components/VolatilityChart";
import { Button } from "@/components/ui/button";

export default function SymbolDetailPage() {
  const { symbol } = useParams<{ symbol: string }>();
  const { data: snap, isLoading } = useRiskSnapshot(symbol ?? "");
  const { data: history } = useRiskHistory(symbol ?? "");
  const { data: ratios } = useSymbolRatios(symbol ?? "");
  const { data: symbols } = useSymbols();
  const { isInWatchlist, addSymbol, removeSymbol } = useWatchlist();

  if (!symbol) return null;

  const info = symbols?.find((s) => s.symbol === symbol);
  const inWatchlist = isInWatchlist(symbol);

  return (
    <div className="p-6 lg:p-8 space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground transition-colors">Dashboard</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-mono">{symbol}</span>
      </div>

      {/* Drift alert banner */}
      {snap?.driftFlag && (
        <div className="rounded-md border border-destructive/20 bg-destructive/[0.04] px-4 py-3 flex items-center gap-3 animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-sonar absolute inline-flex h-full w-full rounded-full bg-destructive opacity-50" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive" />
          </span>
          <AlertTriangle className="h-3.5 w-3.5 text-destructive" strokeWidth={1.5} />
          <span className="text-xs text-risk-high-text font-mono">
            VOLATILITY REGIME SHIFT DETECTED · score {snap.driftScore.toFixed(3)}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-2xl font-semibold font-mono text-foreground">{symbol}</h2>
        {info && <span className="text-sm text-muted-foreground">{info.name}</span>}
        {snap && <RiskBadge level={snap.currentRisk} />}
        <Button
          size="sm"
          variant="outline"
          onClick={() => inWatchlist ? removeSymbol(symbol) : addSymbol(symbol)}
          className="ml-auto gap-1.5 text-xs"
        >
          {inWatchlist ? <StarOff className="h-3.5 w-3.5" /> : <Star className="h-3.5 w-3.5" />}
          {inWatchlist ? "Remove" : "Watch"}
        </Button>
      </div>

      {/* Price info */}
      {info && (
        <div className="flex items-baseline gap-4">
          <span className="font-mono text-lg text-foreground">${info.price.toFixed(2)}</span>
          <span className={`font-mono text-sm ${info.change >= 0 ? "text-risk-low-text" : "text-risk-high-text"}`}>
            {info.change >= 0 ? "+" : ""}{info.change.toFixed(2)} ({info.changePercent >= 0 ? "+" : ""}{info.changePercent.toFixed(2)}%)
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{info.exchange} · {info.sector}</span>
        </div>
      )}

      {isLoading ? (
        <p className="text-xs text-muted-foreground font-mono">Loading…</p>
      ) : snap ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Chart */}
          <div className="lg:col-span-2 rounded-md border border-border bg-card p-5 card-shine">
            <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-4">Volatility History</h3>
            {history?.points ? (
              <VolatilityChart points={history.points} height={360} />
            ) : (
              <p className="text-xs text-muted-foreground py-12 text-center font-mono">Loading…</p>
            )}
          </div>

          {/* Info card */}
          <div className="rounded-md border border-border bg-card p-5 space-y-3">
            <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Overview</h3>
            <DataRow label="Current Volatility" value={snap.currentVolatility.toFixed(4)} />
            <DataRow label="Risk Level" value={snap.currentRisk} />
            <DataRow
              label="Drift Status"
              value={snap.driftFlag ? `Flagged · ${snap.driftScore.toFixed(3)}` : "Stable"}
              highlight={snap.driftFlag}
            />
            <div className="pt-3 border-t border-border">
              <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
                Drift is computed by comparing recent and reference volatility distributions.
                A flag indicates the asset has moved into a different volatility regime.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Financial Ratios */}
      {ratios && (
        <div className="rounded-md border border-border bg-card p-5 space-y-4 card-shine">
          <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Financial Ratios</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-4">
            <RatioItem label="P/E Ratio" value={ratios.pe.toFixed(1)} />
            <RatioItem label="EPS" value={`$${ratios.eps.toFixed(2)}`} />
            <RatioItem label="P/B Ratio" value={ratios.pb.toFixed(1)} />
            <RatioItem label="P/S Ratio" value={ratios.ps.toFixed(1)} />
            <RatioItem label="Debt/Equity" value={ratios.debtToEquity.toFixed(2)} />
            <RatioItem label="Current Ratio" value={ratios.currentRatio.toFixed(2)} />
            <RatioItem label="ROE" value={`${(ratios.roe * 100).toFixed(1)}%`} />
            <RatioItem label="ROA" value={`${(ratios.roa * 100).toFixed(1)}%`} />
            <RatioItem label="Gross Margin" value={`${(ratios.grossMargin * 100).toFixed(1)}%`} />
            <RatioItem label="Op. Margin" value={`${(ratios.operatingMargin * 100).toFixed(1)}%`} />
            <RatioItem label="Net Margin" value={`${(ratios.netMargin * 100).toFixed(1)}%`} />
            <RatioItem label="Div. Yield" value={`${(ratios.dividendYield * 100).toFixed(2)}%`} />
            <RatioItem label="Beta" value={ratios.beta.toFixed(2)} />
            <RatioItem label="Sharpe" value={ratios.sharpeRatio.toFixed(2)} />
            <RatioItem label="Max Drawdown" value={`${(ratios.maxDrawdown * 100).toFixed(1)}%`} />
          </div>
        </div>
      )}
    </div>
  );
}

function DataRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="flex-1 border-b border-dotted border-border mx-2" />
      <span className={`text-xs font-mono font-medium tabular-nums ${highlight ? "text-destructive" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  );
}

function RatioItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-mono font-medium text-foreground tabular-nums mt-0.5">{value}</p>
    </div>
  );
}
