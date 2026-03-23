import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layers, AlertTriangle, ShieldAlert, ShieldCheck, Clock } from "lucide-react";
import { useSymbols, useRiskOverview, useRiskSnapshot, useRiskHistory } from "@/hooks/use-risk-data";
import { KpiCard } from "@/components/KpiCard";
import { RiskBadge } from "@/components/RiskBadge";
import { VolatilityChart } from "@/components/VolatilityChart";
import { cn } from "@/lib/utils";
import type { RiskSnapshot } from "@/lib/api";

export default function DashboardPage() {
  const [selectedSymbol, setSelectedSymbol] = useState<string>("");
  const { data: overview, isLoading: ovLoading } = useRiskOverview();
  const { data: symbols } = useSymbols();
  const { data: history } = useRiskHistory(selectedSymbol);

  // Fetch snapshots for all symbols
  const [snapshots, setSnapshots] = useState<Record<string, RiskSnapshot>>({});

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
        />
      </div>

      {/* Chart */}
      {selectedSymbol && (
        <div className="rounded-lg border border-border bg-card p-5 animate-fade-in">
          <h2 className="text-sm font-medium text-foreground mb-4">
            Volatility History — <span className="font-mono text-primary">{selectedSymbol}</span>
          </h2>
          {history?.points ? (
            <VolatilityChart points={history.points} />
          ) : (
            <p className="text-sm text-muted-foreground py-12 text-center">Loading chart data…</p>
          )}
        </div>
      )}
    </div>
  );
}

function SymbolTable({
  symbols,
  selectedSymbol,
  onSelect,
}: {
  symbols: { symbol: string; name: string }[];
  selectedSymbol: string;
  onSelect: (s: string) => void;
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
}: {
  symbol: string;
  name: string;
  isSelected: boolean;
  onSelect: () => void;
  onDetail: () => void;
}) {
  const { data: snap } = useRiskSnapshot(symbol);
  const riskLevel = snap?.currentRisk;

  const rowBg = riskLevel === "high"
    ? "risk-high-row"
    : riskLevel === "medium"
    ? "risk-medium-row"
    : riskLevel === "low"
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
        {snap?.driftFlag ? (
          <span className="text-risk-medium-text text-xs font-medium">⚠ Drift</span>
        ) : (
          <span className="text-muted-foreground text-xs">None</span>
        )}
      </td>
    </tr>
  );
}
