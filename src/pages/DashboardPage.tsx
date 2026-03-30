import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Layers, AlertTriangle, ShieldAlert, ShieldCheck, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { useSymbols, useRiskOverview, useRiskSnapshot, useRiskHistory, useDriftSummary } from "@/hooks/use-risk-data";
import { KpiCard } from "@/components/KpiCard";
import { RiskBadge } from "@/components/RiskBadge";
import { VolatilityChart } from "@/components/VolatilityChart";
import { cn } from "@/lib/utils";
import type { DriftSummaryItem } from "@/lib/api";

// Generate fake sparkline data for KPI tiles
function useFakeSparkline(seed: number, count = 12) {
  return useMemo(() => {
    const data: number[] = [];
    let v = seed;
    for (let i = 0; i < count; i++) {
      v += (Math.sin(seed * 7 + i * 1.3) * 2) + (Math.cos(i * 0.8) * 1.5);
      data.push(Math.max(0, Math.round(v)));
    }
    return data;
  }, [seed, count]);
}

export default function DashboardPage() {
  const [selectedSymbol, setSelectedSymbol] = useState<string>("");
  const { data: overview } = useRiskOverview();
  const { data: symbols } = useSymbols();
  const { data: driftSummary } = useDriftSummary();
  const { data: history } = useRiskHistory(selectedSymbol);

  useEffect(() => {
    if (!selectedSymbol && symbols && symbols.length > 0) {
      setSelectedSymbol(symbols[0].symbol);
    }
  }, [symbols, selectedSymbol]);

  const driftMap = new Map<string, DriftSummaryItem>();
  driftSummary?.forEach((d) => driftMap.set(d.symbol, d));

  const driftingCount = driftSummary?.filter(d => d.driftFlag).length ?? 0;

  const sparkTotal = useFakeSparkline(overview?.totalSymbols ?? 10);
  const sparkHigh = useFakeSparkline(overview?.highRiskCount ?? 3);
  const sparkMedium = useFakeSparkline(overview?.mediumRiskCount ?? 4);
  const sparkLow = useFakeSparkline(overview?.lowRiskCount ?? 5);

  return (
    <div className="p-6 lg:p-8 space-y-5">
      {/* KPI tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard label="Total Symbols" value={overview?.totalSymbols ?? "—"} icon={Layers} delay={0} sparkData={sparkTotal} />
        <KpiCard label="High Risk" value={overview?.highRiskCount ?? "—"} icon={ShieldAlert} variant="high" delay={50} sparkData={sparkHigh} />
        <KpiCard label="Medium Risk" value={overview?.mediumRiskCount ?? "—"} icon={AlertTriangle} variant="medium" delay={100} sparkData={sparkMedium} />
        <KpiCard label="Low Risk" value={overview?.lowRiskCount ?? "—"} icon={ShieldCheck} variant="low" delay={150} sparkData={sparkLow} />
        <KpiCard
          label="Last Updated"
          value={overview?.lastUpdated ? new Date(overview.lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
          icon={Clock}
          delay={200}
        />
      </div>

      {/* Market summary strip */}
      {driftingCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-md border border-destructive/15 bg-destructive/[0.03] animate-fade-in">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-pulse-glow absolute inline-flex h-full w-full rounded-full bg-destructive" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-destructive" />
          </span>
          <span className="text-xs text-muted-foreground">
            <span className="font-mono font-medium text-risk-high-text">{driftingCount}</span>
            {" "}symbol{driftingCount !== 1 ? "s" : ""} showing volatility regime drift
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4">
        {/* Symbols table */}
        <div className="rounded-md border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Symbols</h2>
            <span className="text-[10px] text-muted-foreground font-mono">{symbols?.length ?? 0} instruments</span>
          </div>
          <SymbolTable
            symbols={symbols ?? []}
            selectedSymbol={selectedSymbol}
            onSelect={setSelectedSymbol}
            driftMap={driftMap}
          />
        </div>

        {/* Volatility chart */}
        {selectedSymbol && (
          <div className="rounded-md border border-border bg-card p-5 card-shine">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Volatility</h2>
              <span className="font-mono text-xs text-primary">{selectedSymbol}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mb-4">20-day rolling window</p>
            {history?.points ? (
              <VolatilityChart points={history.points} height={280} />
            ) : (
              <p className="text-xs text-muted-foreground py-12 text-center font-mono">Loading…</p>
            )}
          </div>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground/40 text-center font-mono">
        {">"} click a symbol to update chart · double-click to open detail view
      </p>
    </div>
  );
}

function SymbolTable({
  symbols, selectedSymbol, onSelect, driftMap,
}: {
  symbols: { symbol: string; name: string; price: number; change: number; changePercent: number }[];
  selectedSymbol: string;
  onSelect: (s: string) => void;
  driftMap: Map<string, DriftSummaryItem>;
}) {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="px-4 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Symbol</th>
            <th className="px-4 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Name</th>
            <th className="px-4 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-right">Price</th>
            <th className="px-4 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-right">Change</th>
            <th className="px-4 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Risk</th>
            <th className="px-4 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-right">Vol</th>
            <th className="px-4 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Drift</th>
          </tr>
        </thead>
        <tbody>
          {symbols.map((s, i) => (
            <SymbolRow
              key={s.symbol}
              symbol={s.symbol}
              name={s.name}
              price={s.price}
              change={s.change}
              changePercent={s.changePercent}
              isSelected={s.symbol === selectedSymbol}
              onSelect={() => onSelect(s.symbol)}
              onDetail={() => navigate(`/symbol/${s.symbol}`)}
              driftItem={driftMap.get(s.symbol)}
              index={i}
            />
          ))}
          {symbols.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground text-xs">No symbols available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function SymbolRow({
  symbol, name, price, change, changePercent, isSelected, onSelect, onDetail, driftItem, index,
}: {
  symbol: string; name: string; price: number; change: number; changePercent: number;
  isSelected: boolean; onSelect: () => void; onDetail: () => void; driftItem?: DriftSummaryItem; index: number;
}) {
  const { data: snap } = useRiskSnapshot(symbol);
  const isPositive = change >= 0;

  return (
    <tr
      onClick={onSelect}
      onDoubleClick={onDetail}
      className={cn(
        "border-b border-border cursor-pointer transition-all duration-150",
        "hover:bg-primary/[0.02]",
        isSelected && "border-l-2 border-l-primary bg-primary/[0.04]"
      )}
    >
      <td className="px-4 py-3 font-mono font-medium text-foreground text-xs">{symbol}</td>
      <td className="px-4 py-3 text-muted-foreground text-xs">{name}</td>
            <td className="px-4 py-3 font-mono tabular-nums text-right text-xs text-foreground">
        {typeof price === "number" ? `$${price.toFixed(2)}` : "—"}
      </td>
      <td className="px-4 py-3 text-right">
        <span className={cn("inline-flex items-center gap-1 font-mono tabular-nums text-xs", isPositive ? "text-risk-low-text" : "text-risk-high-text")}>
          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {typeof changePercent === "number" ? `${isPositive ? "+" : ""}${changePercent.toFixed(2)}%` : "—"}
        </span>
      </td>
      <td className="px-4 py-3">
        {snap?.currentRisk ? <RiskBadge level={snap.currentRisk} /> : <span className="text-muted-foreground text-xs">—</span>}
      </td>
      <td className="px-4 py-3 font-mono tabular-nums text-right text-xs text-foreground/70">
        {typeof snap?.currentVolatility === "number" ? snap.currentVolatility.toFixed(4) : "—"}
      </td>
      <td className="px-4 py-3">
        {driftItem?.driftFlag ? (
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-sonar absolute inline-flex h-full w-full rounded-full bg-destructive opacity-50" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-destructive" />
            </span>
            <span className="text-risk-high-text text-xs font-mono">
              {typeof driftItem?.driftScore === "number" ? driftItem.driftScore.toFixed(3) : "—"}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground/30 text-xs font-mono">—</span>
        )}
      </td>
    </tr>
  );
}



