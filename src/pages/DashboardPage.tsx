import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layers, AlertTriangle, ShieldAlert, ShieldCheck, Clock } from "lucide-react";
import { useSymbols, useRiskOverview, useRiskSnapshot, useRiskHistory, useDriftSummary } from "@/hooks/use-risk-data";
import { KpiCard } from "@/components/KpiCard";
import { RiskBadge } from "@/components/RiskBadge";
import { VolatilityChart } from "@/components/VolatilityChart";
import { cn } from "@/lib/utils";
import type { DriftSummaryItem, RiskLevel } from "@/lib/api";

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
    <div className="p-6 lg:p-8 space-y-6">
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
      <div className="rounded-md border border-border bg-card overflow-hidden animate-fade-up" style={{ animationDelay: "250ms", animationFillMode: "backwards" }}>
        <div className="px-5 py-3 border-b border-border">
          <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Symbols</h2>
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
        <div className="rounded-md border border-border bg-card p-5 animate-fade-up" style={{ animationDelay: "300ms", animationFillMode: "backwards" }}>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Volatility trend
            </h2>
            <span className="font-mono text-xs text-primary">{selectedSymbol}</span>
          </div>
          <p className="text-[10px] text-muted-foreground mb-4 font-mono">20-day rolling volatility</p>
          {history?.points ? (
            <VolatilityChart points={history.points} />
          ) : (
            <p className="text-xs text-muted-foreground py-12 text-center font-mono">Loading chart data…</p>
          )}
          <p className="text-[10px] text-muted-foreground mt-3 font-mono opacity-50">
            Volatility is computed from rolling standard deviation of daily log returns.
          </p>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground text-center font-mono opacity-40">
        {">"} click a symbol to update chart · double-click to open detail view
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
  symbols: { symbol: string; name: string }[];
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
            <th className="px-5 py-2.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Symbol</th>
            <th className="px-5 py-2.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Name</th>
            <th className="px-5 py-2.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Risk</th>
            <th className="px-5 py-2.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground text-right">Volatility</th>
            <th className="px-5 py-2.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Drift</th>
          </tr>
        </thead>
        <tbody>
          {symbols.map((s) => (
            <SymbolRow
              key={s.symbol}
              symbol={s.symbol}
              name={s.name}
              isSelected={s.symbol === selectedSymbol}
              onSelect={() => onSelect(s.symbol)}
              onDetail={() => navigate(`/symbol/${s.symbol}`)}
              driftItem={driftMap.get(s.symbol)}
            />
          ))}
          {symbols.length === 0 && (
            <tr>
              <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground font-mono text-xs">
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
  symbol,
  name,
  isSelected,
  onSelect,
  onDetail,
  driftItem,
}: {
  symbol: string;
  name: string;
  isSelected: boolean;
  onSelect: () => void;
  onDetail: () => void;
  driftItem?: DriftSummaryItem;
}) {
  const { data: snap } = useRiskSnapshot(symbol);

  return (
    <tr
      onClick={onSelect}
      onDoubleClick={onDetail}
      className={cn(
        "border-b border-border cursor-pointer transition-all duration-150",
        "hover:bg-[hsl(153_100%_50%_/_0.03)]",
        isSelected && "border-l-2 border-l-primary bg-primary/[0.03]"
      )}
    >
      <td className="px-5 py-3 font-mono font-medium text-foreground text-xs">{symbol}</td>
      <td className="px-5 py-3 text-muted-foreground text-xs">{name}</td>
      <td className="px-5 py-3">
        {snap?.currentRisk ? <RiskBadge level={snap.currentRisk} /> : <span className="text-muted-foreground text-xs">—</span>}
      </td>
      <td className="px-5 py-3 font-mono tabular-nums text-right text-xs text-foreground/80">
        {snap?.currentVolatility?.toFixed(4) ?? "—"}
      </td>
      <td className="px-5 py-3">
        {driftItem?.driftFlag ? (
          <span className="inline-flex items-center gap-1.5 text-risk-high-text text-[10px] font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-sonar absolute inline-flex h-full w-full rounded-full bg-risk-high opacity-50" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-risk-high" />
            </span>
            {driftItem.driftScore.toFixed(3)}
          </span>
        ) : (
          <span className="text-muted-foreground text-[10px]">—</span>
        )}
      </td>
    </tr>
  );
}
