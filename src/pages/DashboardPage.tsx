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
      <div>
        <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Market risk overview at a glance</p>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard label="Total Symbols" value={overview?.totalSymbols ?? "—"} icon={Layers} />
        <KpiCard label="High Risk" value={overview?.highRiskCount ?? "—"} icon={ShieldAlert} variant="high" />
        <KpiCard label="Medium Risk" value={overview?.mediumRiskCount ?? "—"} icon={AlertTriangle} variant="medium" />
        <KpiCard label="Low Risk" value={overview?.lowRiskCount ?? "—"} icon={ShieldCheck} variant="low" />
        <KpiCard
          label="Last Updated"
          value={overview?.lastUpdated ? new Date(overview.lastUpdated).toLocaleTimeString() : "—"}
          icon={Clock}
        />
      </div>

      {/* Symbols table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden animate-fade-in">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="text-sm font-medium text-foreground">Symbols</h2>
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
        <div className="rounded-lg border border-border bg-card p-5 animate-fade-in">
          <h2 className="text-sm font-medium text-foreground">
            Volatility trend — <span className="font-mono text-primary">{selectedSymbol}</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 mb-4">20‑day rolling volatility</p>
          {history?.points ? (
            <VolatilityChart points={history.points} />
          ) : (
            <p className="text-sm text-muted-foreground py-12 text-center">Loading chart data…</p>
          )}
          <p className="text-[11px] text-muted-foreground mt-3">
            Volatility is computed from rolling standard deviation of daily log returns.
          </p>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Click a symbol to update the chart · Double‑click to open symbol details.
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
            <th className="px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Symbol</th>
            <th className="px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</th>
            <th className="px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Risk</th>
            <th className="px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Volatility</th>
            <th className="px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Drift</th>
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
              <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                No symbols available — check API connection
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
  const riskLevel = snap?.currentRisk;

  const rowBg = riskLevel === "HIGH"
    ? "risk-high-row"
    : riskLevel === "MEDIUM"
    ? "risk-medium-row"
    : riskLevel === "LOW"
    ? "risk-low-row"
    : "";

  return (
    <tr
      onClick={onSelect}
      onDoubleClick={onDetail}
      className={cn(
        "border-b border-border cursor-pointer transition-colors hover:bg-accent/50",
        rowBg,
        isSelected && "ring-1 ring-inset ring-primary/40"
      )}
    >
      <td className="px-5 py-3 font-mono font-medium text-foreground">{symbol}</td>
      <td className="px-5 py-3 text-muted-foreground">{name}</td>
      <td className="px-5 py-3">{riskLevel ? <RiskBadge level={riskLevel} /> : <span className="text-muted-foreground">—</span>}</td>
      <td className="px-5 py-3 font-mono tabular-nums">{snap?.currentVolatility?.toFixed(4) ?? "—"}</td>
      <td className="px-5 py-3">
        {driftItem?.driftFlag ? (
          <span className="text-risk-medium-text text-xs font-medium">⚠ Drift ({driftItem.driftScore.toFixed(3)})</span>
        ) : (
          <span className="text-muted-foreground text-xs">Stable</span>
        )}
      </td>
    </tr>
  );
}
