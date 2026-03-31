import { useNavigate } from "react-router-dom";
import { X, Plus } from "lucide-react";
import { useWatchlist } from "@/hooks/use-watchlist";
import { useSymbols, useRiskSnapshot } from "@/hooks/use-risk-data";
import { RiskBadge } from "@/components/RiskBadge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function WatchlistPage() {
  const { watchlist, addSymbol, removeSymbol, isLoggedIn, isLoading } = useWatchlist();
  const { data: allSymbols } = useSymbols();
  const navigate = useNavigate();
  const [showAdd, setShowAdd] = useState(false);

  const available = allSymbols?.filter((s) => !watchlist.includes(s.symbol)) ?? [];

  if (!isLoggedIn) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="rounded-md border border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">Sign in to access your persistent watchlist.</p>
          <Button size="sm" className="mt-4" onClick={() => navigate("/login")}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-foreground">Your Watchlist</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{watchlist.length} symbols tracked</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowAdd(!showAdd)} className="gap-1.5 text-xs">
          <Plus className="h-3 w-3" />
          Add Symbol
        </Button>
      </div>

      {showAdd && available.length > 0 && (
        <div className="rounded-md border border-border bg-card p-3">
          <p className="text-xs text-muted-foreground mb-2">Select a symbol to add:</p>
          <div className="flex flex-wrap gap-2">
            {available.map((s) => (
              <button
                key={s.symbol}
                onClick={() => {
                  addSymbol(s.symbol);
                  setShowAdd(false);
                }}
                className="px-3 py-1.5 text-xs font-mono bg-secondary hover:bg-accent rounded-md border border-border transition-colors"
              >
                {s.symbol}
              </button>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="rounded-md border border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">Loading watchlist...</p>
        </div>
      ) : watchlist.length === 0 ? (
        <div className="rounded-md border border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">Your watchlist is empty. Add symbols to track them here.</p>
        </div>
      ) : (
        <div className="rounded-md border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground">Symbol</th>
                <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground">Risk</th>
                <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground text-right">Volatility</th>
                <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground text-right">Drift</th>
                <th className="px-4 py-2.5 w-10" />
              </tr>
            </thead>
            <tbody>
              {watchlist.map((symbol) => (
                <WatchlistRow key={symbol} symbol={symbol} onRemove={() => removeSymbol(symbol)} onNavigate={() => navigate(`/symbol/${symbol}`)} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function WatchlistRow({ symbol, onRemove, onNavigate }: { symbol: string; onRemove: () => void; onNavigate: () => void }) {
  const { data: snap } = useRiskSnapshot(symbol);

  return (
    <tr className="border-b border-border hover:bg-secondary/50 transition-colors cursor-pointer" onClick={onNavigate}>
      <td className="px-4 py-3 font-mono text-xs font-medium text-foreground">{symbol}</td>
      <td className="px-4 py-3">
        {snap?.currentRisk ? <RiskBadge level={snap.currentRisk} /> : <span className="text-muted-foreground text-xs">—</span>}
      </td>
      <td className="px-4 py-3 font-mono tabular-nums text-right text-xs text-foreground/80">
        {typeof snap?.currentVolatility === "number" ? snap.currentVolatility.toFixed(4) : "—"}
      </td>
      <td className="px-4 py-3 text-right">
        {snap?.driftFlag ? (
          <span className="text-risk-high-text text-xs font-mono">
            {typeof snap?.driftScore === "number" ? snap.driftScore.toFixed(3) : "—"}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="text-muted-foreground hover:text-destructive transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </td>
    </tr>
  );
}


