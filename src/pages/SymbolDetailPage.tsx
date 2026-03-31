import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  AlertTriangle,
  Star,
  StarOff,
  ChevronRight,
  Download,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from "recharts";
import {
  useRiskSnapshot,
  useRiskHistory,
  useSymbolRatios,
  useSymbols,
  useVaR,
  usePriceForecast,
} from "@/hooks/use-risk-data";
import { useWatchlist } from "@/hooks/use-watchlist";
import { RiskBadge } from "@/components/RiskBadge";
import { VolatilityChart } from "@/components/VolatilityChart";
import {
  TimeRangePicker,
  TIME_RANGE_DAYS,
} from "@/components/TimeRangePicker";
import type { TimeRange } from "@/components/TimeRangePicker";
import { Button } from "@/components/ui/button";

const FORECAST_OPTIONS = [
  { label: "10D", value: 10 },
  { label: "20D", value: 20 },
  { label: "30D", value: 30 },
];

function isNum(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function fmt(value: unknown, digits = 2, fallback = "—") {
  return isNum(value) ? value.toFixed(digits) : fallback;
}

function fmtCurrency(value: unknown, digits = 2) {
  return isNum(value) ? `$${value.toFixed(digits)}` : "—";
}

function fmtPercent(value: unknown, digits = 2) {
  return isNum(value) ? `${value.toFixed(digits)}%` : "—";
}

function lastNumber(arr: unknown): number | undefined {
  return Array.isArray(arr) && arr.length > 0 && isNum(arr[arr.length - 1])
    ? arr[arr.length - 1]
    : undefined;
}

export default function SymbolDetailPage() {
  const { symbol } = useParams<{ symbol: string }>();
  const [timeRange, setTimeRange] = useState<TimeRange>("6M");
  const [forecastDays, setForecastDays] = useState(10);

  const { data: snap, isLoading } = useRiskSnapshot(symbol ?? "");
  const { data: history } = useRiskHistory(symbol ?? "");
  const { data: ratios } = useSymbolRatios(symbol ?? "");
  const { data: symbols } = useSymbols();
  const { data: varEstimate } = useVaR(symbol ?? "");
  const { data: forecast } = usePriceForecast(symbol ?? "", forecastDays);
  const { isInWatchlist, addSymbol, removeSymbol } = useWatchlist();

  if (!symbol) return null;

  const info = symbols?.find((s) => s.symbol === symbol);
  const inWatchlist = isInWatchlist(symbol);

  const handleExportHistory = () => {
    if (!history?.points?.length) return;

    const rows = [
      ["Date", "Volatility", "Risk Level"],
      ...history.points.map((p) => [
        p?.date ?? "",
        isNum(p?.volatility) ? p.volatility.toString() : "",
        p?.riskLevel ?? "",
      ]),
    ];

    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${symbol}-volatility-history.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const forecastChartData = useMemo(() => {
    if (!forecast || !info || !isNum(info.price)) return [];

    const nowLabel = new Date().toISOString().slice(0, 10);
    const rows: Array<{
      date: string;
      price: number | null;
      upper: number | null;
      lower: number | null;
      kind: "Current" | "Forecast";
    }> = [
      {
        date: nowLabel,
        price: info.price,
        upper: info.price,
        lower: info.price,
        kind: "Current",
      },
    ];

    const dates = Array.isArray(forecast.forecastDates)
      ? forecast.forecastDates
      : [];
    const prices = Array.isArray(forecast.forecastPrices)
      ? forecast.forecastPrices
      : [];
    const upper = Array.isArray(forecast.upperBand) ? forecast.upperBand : [];
    const lower = Array.isArray(forecast.lowerBand) ? forecast.lowerBand : [];

    dates.forEach((date, idx) => {
      rows.push({
        date,
        price: isNum(prices[idx]) ? prices[idx] : null,
        upper: isNum(upper[idx]) ? upper[idx] : null,
        lower: isNum(lower[idx]) ? lower[idx] : null,
        kind: "Forecast",
      });
    });

    return rows;
  }, [forecast, info]);

  const dayNPrice = lastNumber(forecast?.forecastPrices);
  const upperBandLast = lastNumber(forecast?.upperBand);
  const lowerBandLast = lastNumber(forecast?.lowerBand);

  return (
    <div className="p-6 lg:p-8 space-y-5">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-mono">{symbol}</span>
      </div>

      {snap?.driftFlag && (
        <div className="rounded-md border border-destructive/20 bg-destructive/[0.04] px-4 py-3 flex items-center gap-3 animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-sonar absolute inline-flex h-full w-full rounded-full bg-destructive opacity-50" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive" />
          </span>
          <AlertTriangle
            className="h-3.5 w-3.5 text-destructive"
            strokeWidth={1.5}
          />
          <span className="text-xs text-risk-high-text font-mono">
            VOLATILITY REGIME SHIFT DETECTED · KS-score {fmt(snap?.driftScore, 3)}
          </span>
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-2xl font-semibold font-mono text-foreground">
          {symbol}
        </h2>
        {info && <span className="text-sm text-muted-foreground">{info.name}</span>}
        {snap && <RiskBadge level={snap.currentRisk} />}
        <div className="ml-auto flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportHistory}
            className="gap-1.5 text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              inWatchlist ? removeSymbol(symbol) : addSymbol(symbol)
            }
            className="gap-1.5 text-xs"
          >
            {inWatchlist ? (
              <StarOff className="h-3.5 w-3.5" />
            ) : (
              <Star className="h-3.5 w-3.5" />
            )}
            {inWatchlist ? "Remove" : "Watch"}
          </Button>
        </div>
      </div>

      {info && (
        <div className="flex items-baseline gap-4 flex-wrap">
          <span className="font-mono text-lg text-foreground">
            {fmtCurrency(info.price, 2)}
          </span>
          <span
            className={`font-mono text-sm ${
              isNum(info.change) && info.change >= 0
                ? "text-risk-low-text"
                : "text-risk-high-text"
            }`}
          >
            {isNum(info.change) && info.change >= 0 ? "+" : ""}
            {fmt(info.change, 2)} (
            {isNum(info.changePercent) && info.changePercent >= 0 ? "+" : ""}
            {fmt(info.changePercent, 2)}%)
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
            {info.exchange} · {info.sector}
          </span>
        </div>
      )}

      {isLoading ? (
        <p className="text-xs text-muted-foreground font-mono">Loading…</p>
      ) : snap ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-md border border-border bg-card p-5 card-shine">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                  Volatility History
                </h3>
                <TimeRangePicker value={timeRange} onChange={setTimeRange} />
              </div>

              {history?.points?.length ? (
                <VolatilityChart
                  points={history.points}
                  height={340}
                  showBands
                  days={TIME_RANGE_DAYS[timeRange]}
                />
              ) : (
                <p className="text-xs text-muted-foreground py-12 text-center font-mono">
                  No history data available
                </p>
              )}
            </div>

            <div className="space-y-3">
              <div className="rounded-md border border-border bg-card p-5 space-y-3">
                <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                  Overview
                </h3>
                <DataRow
                  label="Current Volatility"
                  value={fmt(snap.currentVolatility, 4)}
                />
                <DataRow label="Risk Level" value={snap.currentRisk ?? "—"} />
                <DataRow
                  label="Drift Status"
                  value={
                    snap.driftFlag
                      ? `Flagged · ${fmt(snap.driftScore, 3)}`
                      : "Stable"
                  }
                  highlight={snap.driftFlag}
                />
                <DataRow
                  label="Drift Score"
                  value={fmt(snap.driftScore, 4)}
                />
              </div>

              {varEstimate && (
                <div className="rounded-md border border-border bg-card p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                      Value at Risk
                    </h3>
                    <span className="text-[9px] font-mono text-muted-foreground/50">
                      1-day parametric
                    </span>
                  </div>
                  <DataRow
                    label="VaR (95%)"
                    value={`-${fmt(
                      isNum(varEstimate?.var95) ? varEstimate.var95 * 100 : undefined,
                      2
                    )}%`}
                    highlight
                  />
                  <DataRow
                    label="VaR (99%)"
                    value={`-${fmt(
                      isNum(varEstimate?.var99) ? varEstimate.var99 * 100 : undefined,
                      2
                    )}%`}
                    highlight
                  />
                  <DataRow
                    label="CVaR (95%)"
                    value={`-${fmt(
                      isNum(varEstimate?.cvar95) ? varEstimate.cvar95 * 100 : undefined,
                      2
                    )}%`}
                    highlight
                  />
                </div>
              )}
            </div>
          </div>

          {forecast && info && forecastChartData.length > 0 && (
            <div className="rounded-md border border-border bg-card p-5 space-y-4 card-shine">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                    Price Forecast
                  </h3>
                  <p className="text-[10px] text-muted-foreground/50 mt-1">
                    Model: {forecast.modelVersion ?? "—"} · current price anchored
                    to live quote
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-secondary/60 rounded-md p-0.5 border border-border">
                  {FORECAST_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setForecastDays(opt.value)}
                      className={`px-2.5 py-1 text-[10px] font-mono rounded transition-all duration-150 ${
                        forecastDays === opt.value
                          ? "bg-card text-foreground shadow-sm border border-border"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[1fr_260px] gap-4 items-start">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={forecastChartData}
                      margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="forecastBand"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity={0.18}
                          />
                          <stop
                            offset="100%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity={0.02}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(216 15% 12%)"
                        strokeOpacity={0.4}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        tick={{
                          fill: "hsl(217 15% 38%)",
                          fontSize: 9,
                          fontFamily: "JetBrains Mono",
                        }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{
                          fill: "hsl(217 15% 38%)",
                          fontSize: 9,
                          fontFamily: "JetBrains Mono",
                        }}
                        tickLine={false}
                        axisLine={false}
                        width={60}
                        domain={["auto", "auto"]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(216 28% 7%)",
                          border: "1px solid hsl(216 20% 14%)",
                          borderRadius: 4,
                          fontSize: 10,
                          fontFamily: "JetBrains Mono",
                          color: "hsl(213 20% 92%)",
                          padding: "6px 10px",
                        }}
                      />
                      <Area type="monotone" dataKey="upper" stroke="none" fill="none" />
                      <Area
                        type="monotone"
                        dataKey="lower"
                        stroke="none"
                        fill="url(#forecastBand)"
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        activeDot={{ r: 4 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="rounded-md border border-border bg-secondary/30 p-4 space-y-3">
                  <DataRow
                    label="Current Price"
                    value={fmtCurrency(info.price, 2)}
                  />
                  <DataRow
                    label={`Day ${forecastDays}`}
                    value={fmtCurrency(dayNPrice, 2)}
                  />
                  <DataRow
                    label="Upper Band"
                    value={fmtCurrency(upperBandLast, 2)}
                  />
                  <DataRow
                    label="Lower Band"
                    value={fmtCurrency(lowerBandLast, 2)}
                  />
                  <p className="text-[10px] text-muted-foreground/60 pt-2 border-t border-border">
                    The backend provides recursive forecast points plus
                    upper/lower bounds for visual guidance.
                  </p>
                </div>
              </div>
            </div>
          )}

          {ratios && (
            <div className="rounded-md border border-border bg-card p-5 space-y-4 card-shine">
              <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                Financial Ratios
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-4">
                <RatioItem label="P/E Ratio" value={fmt(ratios.pe, 1)} />
                <RatioItem label="EPS" value={fmtCurrency(ratios.eps, 2)} />
                <RatioItem label="P/B Ratio" value={fmt(ratios.pb, 1)} />
                <RatioItem label="P/S Ratio" value={fmt(ratios.ps, 1)} />
                <RatioItem
                  label="Debt/Equity"
                  value={fmt(ratios.debtToEquity, 2)}
                />
                <RatioItem
                  label="Current Ratio"
                  value={fmt(ratios.currentRatio, 2)}
                />
                <RatioItem
                  label="ROE"
                  value={fmtPercent(
                    isNum(ratios.roe) ? ratios.roe * 100 : undefined,
                    1
                  )}
                />
                <RatioItem
                  label="ROA"
                  value={fmtPercent(
                    isNum(ratios.roa) ? ratios.roa * 100 : undefined,
                    1
                  )}
                />
                <RatioItem
                  label="Gross Margin"
                  value={fmtPercent(
                    isNum(ratios.grossMargin) ? ratios.grossMargin * 100 : undefined,
                    1
                  )}
                />
                <RatioItem
                  label="Op. Margin"
                  value={fmtPercent(
                    isNum(ratios.operatingMargin)
                      ? ratios.operatingMargin * 100
                      : undefined,
                    1
                  )}
                />
                <RatioItem
                  label="Net Margin"
                  value={fmtPercent(
                    isNum(ratios.netMargin) ? ratios.netMargin * 100 : undefined,
                    1
                  )}
                />
                <RatioItem
                  label="Div. Yield"
                  value={fmtPercent(
                    isNum(ratios.dividendYield)
                      ? ratios.dividendYield * 100
                      : undefined,
                    2
                  )}
                />
                <RatioItem label="Beta" value={fmt(ratios.beta, 2)} />
                <RatioItem
                  label="Sharpe"
                  value={fmt(ratios.sharpeRatio, 2)}
                />
                <RatioItem
                  label="Max Drawdown"
                  value={fmtPercent(
                    isNum(ratios.maxDrawdown)
                      ? ratios.maxDrawdown * 100
                      : undefined,
                    1
                  )}
                />
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function DataRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="flex-1 border-b border-dotted border-border mx-2" />
      <span
        className={`text-xs font-mono font-medium tabular-nums ${
          highlight ? "text-destructive" : "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function RatioItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm font-mono font-medium text-foreground tabular-nums mt-0.5">
        {value}
      </p>
    </div>
  );
}

