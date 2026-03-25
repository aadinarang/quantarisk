import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layers, AlertTriangle, ShieldAlert, ShieldCheck, Clock } from "lucide-react";
import { useSymbols, useRiskOverview, useRiskSnapshot, useRiskHistory, useDriftSummary } from "@/hooks/use-risk-data";
import { KpiCard } from "@/components/KpiCard";
import { RiskBadge } from "@/components/RiskBadge";
import { VolatilityChart } from "@/components/VolatilityChart";
import { cn } from "@/lib/utils";
import type { DriftSummaryItem } from "@/lib/api";

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

  return (
    <div className="p-6 lg:p-8 space-y-5">
      {/* KPI tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard label="Total Symbols" value={overview?.totalSymbols ?? "—"} icon={Layers} delay={0} />
        <KpiCard label="High Risk" value={overview?.highRiskCount ?? "—"} icon={ShieldAlert} variant="high" delay={50} />
        <KpiCard label="Medium Risk" value={overview?.mediumRiskCount ?? "—"} icon={AlertTriangle} variant="medium" delay={100} />
        <KpiCard label="Low Risk" value={overview?.lowRiskCount ?? "—"} icon={ShieldCheck} variant="low" delay={150} />
        <KpiCard
          label="Last Updated"
          value={overview?.lastUpdated ? new Date(overview.lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
          icon={Clock}
          delay={200}
        />
      </div>

      {/* Symbols table */}
      <div className="rounded-md border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-xs font-medium text-muted-foreground">Symbols</h2>
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
        <div className="rounded-md border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xs font-medium text-muted-foreground">Volatility trend</h2>
            <span className="font-mono text-xs text-primary">{selectedSymbol}</span>
          </div>
          <p className="text-xs text-muted-foreground mb-4">20-day rolling volatility</p>
          {history?.points ? (
            <VolatilityChart points={history.points} />
          ) : (
            <p className="text-xs text-muted-foreground py-12 text-center font-mono">Loading chart data…</p>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center font-mono opacity-50">
        Click a symbol to update chart · Double-click to open detail view
      </p>
    </div>
  );
}

function SymbolTable({
  symbols,
  selectedSymbol,
  onSelect,
  driftMap,
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
            <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground">Symbol</th>
            <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground">Name</th>
            <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground text-right">Price</th>
            <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground text-right">Change</th>
            <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground">Risk</th>
            <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground text-right">Volatility</th>
            <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground">Drift</th>
          </tr>
        </thead>
        <tbody>
          {symbols.map((s) => (
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
            />
          ))}
          {symbols.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground text-xs">
                No symbols available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function SymbolRow({
  symbol, name, price, change, changePercent, isSelected, onSelect, onDetail, driftItem,
}: {
  symbol: string; name: string; price: number; change: number; changePercent: number;
  isSelected: boolean; onSelect: () => void; onDetail: () => void; driftItem?: DriftSummaryItem;
}) {
  const { data: snap } = useRiskSnapshot(symbol);

  return (
    <tr
      onClick={onSelect}
      onDoubleClick={onDetail}
      className={cn(
        "border-b border-border cursor-pointer transition-colors",
        "hover:bg-secondary/50",
        isSelected && "border-l-2 border-l-primary bg-primary/[0.03]"
      )}
    >
      <td className="px-4 py-3 font-mono font-medium text-foreground text-xs">{symbol}</td>
      <td className="px-4 py-3 text-muted-foreground text-xs">{name}</td>
      <td className="px-4 py-3 font-mono tabular-nums text-right text-xs text-foreground">${price.toFixed(2)}</td>
      <td className={cn("px-4 py-3 font-mono tabular-nums text-right text-xs", change >= 0 ? "text-risk-low-text" : "text-risk-high-text")}>
        {change >= 0 ? "+" : ""}{changePercent.toFixed(2)}%
      </td>
      <td className="px-4 py-3">
        {snap?.currentRisk ? <RiskBadge level={snap.currentRisk} /> : <span className="text-muted-foreground text-xs">—</span>}
      </td>
      <td className="px-4 py-3 font-mono tabular-nums text-right text-xs text-foreground/80">
        {snap?.currentVolatility?.toFixed(4) ?? "—"}
      </td>
      <td className="px-4 py-3">
        {driftItem?.driftFlag ? (
          <span className="text-risk-high-text text-xs font-mono">{driftItem.driftScore.toFixed(3)}</span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </td>
    </tr>
  );
}
