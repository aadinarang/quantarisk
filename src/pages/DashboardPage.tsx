import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layers, AlertTriangle, ShieldAlert, ShieldCheck, Clock,
  TrendingUp, TrendingDown,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer,
  Tooltip as RechartsTip, CartesianGrid, Cell,
} from "recharts";
import {
  useSymbols, useRiskOverview, useRiskSnapshot,
  useRiskHistory, useDriftSummary,
  useSectorBreakdown, useCorrelationMatrix,
} from "@/hooks/use-risk-data";
import { KpiCard }         from "@/components/KpiCard";
import { RiskBadge }       from "@/components/RiskBadge";
import { VolatilityChart } from "@/components/VolatilityChart";
import { cn }              from "@/lib/utils";
import type { DriftSummaryItem } from "@/lib/api";

// ── Sparkline seed ────────────────────────────────────────────────
function useFakeSparkline(seed: number, count = 12) {
  return useMemo(() => {
    const data: number[] = [];
    let v = seed;
    for (let i = 0; i < count; i++) {
      v += Math.sin(seed * 7 + i * 1.3) * 2 + Math.cos(i * 0.8) * 1.5;
      data.push(Math.max(0, Math.round(v)));
    }
    return data;
  }, [seed, count]);
}

// ── Correlation cell colour ───────────────────────────────────────
function corrColor(v: number, dimmed = false): string {
  const a = dimmed ? 0.22 : 1;
  if (v >= 0.8)  return `hsl(345 100% 59% / ${0.75 * a})`;
  if (v >= 0.65) return `hsl(345 100% 59% / ${0.45 * a})`;
  if (v >= 0.5)  return `hsl(42  100% 50% / ${0.45 * a})`;
  if (v >= 0.35) return `hsl(153 100% 50% / ${0.28 * a})`;
  return                 `hsl(153 100% 50% / ${0.12 * a})`;
}

// ── Sector bar tooltip ────────────────────────────────────────────
const SectorTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const high   = payload.find((p: any) => p.dataKey === "high")?.value   ?? 0;
  const medium = payload.find((p: any) => p.dataKey === "medium")?.value ?? 0;
  const low    = payload.find((p: any) => p.dataKey === "low")?.value    ?? 0;
  const total  = high + medium + low;
  return (
    <div className="bg-card border border-border rounded px-3 py-2.5 text-xs font-mono shadow-lg space-y-1">
      <p className="font-semibold text-foreground">{label}</p>
      <p className="text-risk-high-text">
        High: <span className="font-bold">{high}</span>
        {total > 0 ? ` (${Math.round(high/total*100)}%)` : ""}
      </p>
      <p className="text-risk-medium-text">
        Med: <span className="font-bold">{medium}</span>
        {total > 0 ? ` (${Math.round(medium/total*100)}%)` : ""}
      </p>
      <p className="text-risk-low-text">
        Low: <span className="font-bold">{low}</span>
        {total > 0 ? ` (${Math.round(low/total*100)}%)` : ""}
      </p>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────
export default function DashboardPage() {
  const [selectedSymbol, setSelectedSymbol] = useState<string>("");
  const [activeSector,   setActiveSector]   = useState<string | null>(null);
  const [hoveredCorr,  setHoveredCorr]      = useState<{ a: string; b: string; v: number } | null>(null);
  const [pinnedCorr,   setPinnedCorr]       = useState<string | null>(null);

  const { data: overview }      = useRiskOverview();
  const { data: symbols }       = useSymbols();
  const { data: driftSummary }  = useDriftSummary();
  const { data: history }       = useRiskHistory(selectedSymbol);
  const { data: sectorRaw }     = useSectorBreakdown();
  const { data: corrRaw }       = useCorrelationMatrix();

  useEffect(() => {
    if (!selectedSymbol && symbols?.length) setSelectedSymbol(symbols[0].symbol);
  }, [symbols, selectedSymbol]);

  const driftMap = useMemo(() => {
    const m = new Map<string, DriftSummaryItem>();
    driftSummary?.forEach(d => m.set(d.symbol, d));
    return m;
  }, [driftSummary]);

  const driftingCount = driftSummary?.filter(d => d.driftFlag).length ?? 0;

  const sparkTotal  = useFakeSparkline(overview?.totalSymbols  ?? 10);
  const sparkHigh   = useFakeSparkline(overview?.highRiskCount ?? 3);
  const sparkMedium = useFakeSparkline(overview?.mediumRiskCount ?? 4);
  const sparkLow    = useFakeSparkline(overview?.lowRiskCount  ?? 5);

  // Sector data: from API or fall back to computing from snapshots
  const sectorData = useMemo(() => {
    if (sectorRaw && Array.isArray(sectorRaw) && sectorRaw.length > 0) return sectorRaw;
    // Build from symbols + driftMap as fallback
    if (!symbols) return [];
    const map: Record<string, { high: number; medium: number; low: number }> = {};
    symbols.forEach(s => {
      const sec = s.sector || "Unknown";
      if (!map[sec]) map[sec] = { high: 0, medium: 0, low: 0 };
      // We don't have risk per symbol here without snapshot, just count equally
    });
    return Object.entries(map).map(([sector, v]) => ({
      sector, ...v, total: v.high + v.medium + v.low,
    }));
  }, [sectorRaw, symbols]);

  // Correlation matrix: API shape { symbols: string[], matrix: number[][] }
  const corrSymbols: string[] = useMemo(
    () => (corrRaw as any)?.symbols ?? [],
    [corrRaw]
  );
  const corrMatrix: number[][] = useMemo(
    () => (corrRaw as any)?.matrix ?? [],
    [corrRaw]
  );

  // Filter symbols table by clicked sector
  const filteredSymbols = useMemo(() => {
    if (!symbols) return [];
    if (!activeSector) return symbols;
    return symbols.filter(s => (s.sector || "Unknown") === activeSector);
  }, [symbols, activeSector]);

  const highlightedCorr = pinnedCorr ?? (hoveredCorr?.a ?? null);

  return (
    <div className="p-6 lg:p-8 space-y-5">

      {/* ── KPI strip ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard label="Total Symbols" value={overview?.totalSymbols  ?? "—"} icon={Layers}       delay={0}   sparkData={sparkTotal}  />
        <KpiCard label="High Risk"     value={overview?.highRiskCount ?? "—"} icon={ShieldAlert}  variant="high"   delay={50}  sparkData={sparkHigh}   />
        <KpiCard label="Medium Risk"   value={overview?.mediumRiskCount ?? "—"} icon={AlertTriangle} variant="medium" delay={100} sparkData={sparkMedium} />
        <KpiCard label="Low Risk"      value={overview?.lowRiskCount  ?? "—"} icon={ShieldCheck}  variant="low"    delay={150} sparkData={sparkLow}    />
        <KpiCard
          label="Last Updated"
          value={overview?.lastUpdated
            ? new Date(overview.lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "—"}
          icon={Clock}
          delay={200}
        />
      </div>

      {/* ── Drift banner ──────────────────────────────────────── */}
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

      {/* ── Symbol table + Volatility chart ───────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4">
        <div className="rounded-md border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {activeSector ? `Sector: ${activeSector}` : "Symbols"}
            </h2>
            <div className="flex items-center gap-2">
              {activeSector && (
                <button
                  onClick={() => setActiveSector(null)}
                  className="text-[10px] font-mono text-primary hover:text-foreground transition-colors"
                >
                  × clear filter
                </button>
              )}
              <span className="text-[10px] text-muted-foreground font-mono">
                {filteredSymbols.length} instruments
              </span>
            </div>
          </div>
          <SymbolTable
            symbols={filteredSymbols}
            selectedSymbol={selectedSymbol}
            onSelect={setSelectedSymbol}
            driftMap={driftMap}
          />
        </div>

        {selectedSymbol && (
          <div className="rounded-md border border-border bg-card p-5 card-shine">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Volatility</h2>
              <span className="font-mono text-xs text-primary">{selectedSymbol}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mb-3">20-day rolling standard deviation</p>
            {history?.points ? (
              <VolatilityChart points={history.points} height={240} showRangePicker defaultRange="3M" />
            ) : (
              <p className="text-xs text-muted-foreground py-12 text-center font-mono">Loading…</p>
            )}
          </div>
        )}
      </div>

      {/* ── Sector breakdown + Correlation heatmap ────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* Sector breakdown — click a bar to filter the table */}
        <div className="rounded-md border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Risk by Sector
            </h2>
            {activeSector
              ? <button onClick={() => setActiveSector(null)} className="text-[10px] font-mono text-primary hover:text-foreground transition-colors">× {activeSector}</button>
              : <span className="text-[10px] text-muted-foreground/40 font-mono">click a bar to filter table</span>}
          </div>
          <div className="flex items-center gap-3 mb-4 text-[9px] font-mono text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-destructive/70 inline-block" />High</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[hsl(42_100%_50%/0.65)] inline-block" />Medium</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[hsl(153_100%_50%/0.6)] inline-block" />Low</span>
          </div>
          {sectorData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={sectorData}
                layout="vertical"
                margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
                onClick={(e) => {
                  if (e?.activeLabel)
                    setActiveSector(p => p === e.activeLabel ? null : e.activeLabel!);
                }}
                style={{ cursor: "pointer" }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(216 15% 12%)" strokeOpacity={0.3} horizontal={false} />
                <XAxis type="number" tick={{ fill: "hsl(217 15% 38%)", fontSize: 9, fontFamily: "JetBrains Mono" }} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="sector" tick={{ fill: "hsl(217 15% 38%)", fontSize: 9, fontFamily: "JetBrains Mono" }} tickLine={false} axisLine={false} width={80} />
                <RechartsTip content={<SectorTooltip />} cursor={{ fill: "hsl(var(--primary)/0.04)" }} />
                <Bar dataKey="high"   stackId="a">
                  {sectorData.map((r: any) => (
                    <Cell key={r.sector} fill={`hsl(345 100% 59% / ${activeSector && activeSector !== r.sector ? 0.2 : 0.7})`} />
                  ))}
                </Bar>
                <Bar dataKey="medium" stackId="a">
                  {sectorData.map((r: any) => (
                    <Cell key={r.sector} fill={`hsl(42 100% 50% / ${activeSector && activeSector !== r.sector ? 0.18 : 0.65})`} />
                  ))}
                </Bar>
                <Bar dataKey="low" stackId="a" radius={[0,2,2,0]}>
                  {sectorData.map((r: any) => (
                    <Cell key={r.sector} fill={`hsl(153 100% 50% / ${activeSector && activeSector !== r.sector ? 0.15 : 0.6})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-muted-foreground font-mono py-8 text-center">
              {sectorData.length === 0 ? "Loading sector data…" : "No sector data available"}
            </p>
          )}
        </div>

        {/* Correlation matrix — hover + click to pin */}
        <div className="rounded-md border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Correlation Matrix</h2>
              <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                {pinnedCorr
                  ? `Pinned: ${pinnedCorr} — click to release`
                  : "Hover a cell · click symbol to pin row/col"}
              </p>
            </div>
            <div className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground">
              <span className="w-3 h-2 rounded-sm inline-block bg-[hsl(153_100%_50%/0.12)]" />0
              <span className="w-3 h-2 rounded-sm inline-block bg-[hsl(42_100%_50%/0.45)] ml-1" />0.5
              <span className="w-3 h-2 rounded-sm inline-block bg-[hsl(345_100%_59%/0.75)] ml-1" />1
            </div>
          </div>

          {/* Hover tooltip */}
          {hoveredCorr && (
            <div className="mb-2 px-3 py-1.5 rounded border border-border bg-secondary/50 text-[10px] font-mono animate-fade-in flex items-center gap-2">
              <span className="text-foreground font-semibold">{hoveredCorr.a}</span>
              <span className="text-muted-foreground/40">↔</span>
              <span className="text-foreground font-semibold">{hoveredCorr.b}</span>
              <span className="text-muted-foreground/30 mx-1">·</span>
              <span className={cn(
                "font-bold",
                hoveredCorr.v >= 0.8 ? "text-risk-high-text" :
                hoveredCorr.v >= 0.5 ? "text-risk-medium-text" : "text-risk-low-text"
              )}>{hoveredCorr.v.toFixed(2)}</span>
              <span className="text-muted-foreground/40 ml-1">
                {hoveredCorr.v >= 0.8 ? "very high" : hoveredCorr.v >= 0.65 ? "high" : hoveredCorr.v >= 0.5 ? "moderate" : "low"}
              </span>
            </div>
          )}

          {corrSymbols.length > 0 ? (
            <div className="overflow-auto">
              <table className="text-[9px] font-mono border-collapse">
                <thead>
                  <tr>
                    <td className="w-10" />
                    {corrSymbols.map(s => (
                      <td key={s} className="text-center pb-1 px-0.5 w-8">
                        <button
                          onClick={() => setPinnedCorr(p => p === s ? null : s)}
                          className={cn(
                            "transition-colors hover:text-primary",
                            pinnedCorr === s ? "text-primary font-bold" : "text-muted-foreground/60"
                          )}
                        >{s}</button>
                      </td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {corrSymbols.map((rowSym, ri) => (
                    <tr key={rowSym}>
                      <td className="pr-1.5 text-right whitespace-nowrap pb-0.5">
                        <button
                          onClick={() => setPinnedCorr(p => p === rowSym ? null : rowSym)}
                          className={cn(
                            "transition-colors hover:text-primary",
                            pinnedCorr === rowSym ? "text-primary font-bold" : "text-muted-foreground/60"
                          )}
                        >{rowSym}</button>
                      </td>
                      {corrSymbols.map((colSym, ci) => {
                        const v      = corrMatrix[ri]?.[ci] ?? 0;
                        const isDiag = ri === ci;
                        const dimmed = !!highlightedCorr && !isDiag && highlightedCorr !== rowSym && highlightedCorr !== colSym;
                        const isHov  = hoveredCorr?.a === rowSym && hoveredCorr?.b === colSym;
                        return (
                          <td key={colSym} className="p-0.5">
                            <div
                              className={cn(
                                "w-6 h-5 rounded-sm flex items-center justify-center transition-all duration-150 cursor-default",
                                isHov && "ring-1 ring-primary/60 scale-110"
                              )}
                              style={{
                                backgroundColor: isDiag
                                  ? "hsl(153 100% 50% / 0.85)"
                                  : corrColor(v, dimmed),
                              }}
                              onMouseEnter={() => { if (!isDiag) setHoveredCorr({ a: rowSym, b: colSym, v }); }}
                              onMouseLeave={() => setHoveredCorr(null)}
                            >
                              {isDiag && (
                                <span className="text-[7px] font-bold" style={{ color: "hsl(216 30% 4%)" }}>1</span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground font-mono py-8 text-center">
              Loading correlation data…
            </p>
          )}
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground/30 text-center font-mono">
        Click a symbol to update the chart · double-click to open detail view
      </p>
    </div>
  );
}

// ── Symbol table ──────────────────────────────────────────────────
function SymbolTable({ symbols, selectedSymbol, onSelect, driftMap }: {
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
            {["Symbol","Name","Price","Change","Risk","Vol","Drift"].map(h => (
              <th key={h} className={cn(
                "px-4 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider",
                ["Price","Change","Vol"].includes(h) && "text-right"
              )}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {symbols.map((s, i) => (
            <SymbolRow
              key={s.symbol}
              symbol={s.symbol} name={s.name} price={s.price}
              change={s.change} changePercent={s.changePercent}
              isSelected={s.symbol === selectedSymbol}
              onSelect={() => onSelect(s.symbol)}
              onDetail={() => navigate(`/symbol/${s.symbol}`)}
              driftItem={driftMap.get(s.symbol)}
              index={i}
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

function SymbolRow({ symbol, name, price, change, changePercent, isSelected, onSelect, onDetail, driftItem, index }: {
  symbol: string; name: string; price: number; change: number; changePercent: number;
  isSelected: boolean; onSelect: () => void; onDetail: () => void;
  driftItem?: DriftSummaryItem; index: number;
}) {
  const { data: snap } = useRiskSnapshot(symbol);
  const isPositive = change >= 0;
  return (
    <tr
      onClick={onSelect}
      onDoubleClick={onDetail}
      className={cn(
        "border-b border-border cursor-pointer transition-all duration-150 hover:bg-primary/[0.02]",
        isSelected && "border-l-2 border-l-primary bg-primary/[0.04]"
      )}
    >
      <td className="px-4 py-3 font-mono font-medium text-foreground text-xs">{symbol}</td>
      <td className="px-4 py-3 text-muted-foreground text-xs">{name}</td>
      <td className="px-4 py-3 font-mono tabular-nums text-right text-xs text-foreground">
        {typeof price === "number" ? `$${price.toFixed(2)}` : "—"}
      </td>
      <td className="px-4 py-3 text-right">
        <span className={cn("inline-flex items-center gap-1 font-mono tabular-nums text-xs",
          isPositive ? "text-risk-low-text" : "text-risk-high-text")}>
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
              {typeof driftItem.driftScore === "number" ? driftItem.driftScore.toFixed(3) : "—"}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground/30 text-xs font-mono">—</span>
        )}
      </td>
    </tr>
  );
}
