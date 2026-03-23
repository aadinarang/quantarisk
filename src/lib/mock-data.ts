import type { SymbolInfo, RiskOverview, SymbolSnapshot, HistoryPoint, SymbolHistory, DriftSummaryItem } from "./api";

const SYMBOLS: SymbolInfo[] = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft Corporation" },
  { symbol: "TSLA", name: "Tesla Inc." },
  { symbol: "SPY", name: "SPDR S&P 500 ETF" },
  { symbol: "NVDA", name: "NVIDIA Corporation" },
  { symbol: "AMZN", name: "Amazon.com Inc." },
];

const SNAPSHOTS: Record<string, SymbolSnapshot> = {
  AAPL: { symbol: "AAPL", currentRisk: "MEDIUM", currentVolatility: 0.0231, driftFlag: false, driftScore: 0.042 },
  MSFT: { symbol: "MSFT", currentRisk: "LOW", currentVolatility: 0.0178, driftFlag: false, driftScore: 0.018 },
  TSLA: { symbol: "TSLA", currentRisk: "HIGH", currentVolatility: 0.0487, driftFlag: true, driftScore: 0.312 },
  SPY:  { symbol: "SPY",  currentRisk: "LOW", currentVolatility: 0.0112, driftFlag: false, driftScore: 0.009 },
  NVDA: { symbol: "NVDA", currentRisk: "HIGH", currentVolatility: 0.0398, driftFlag: true, driftScore: 0.274 },
  AMZN: { symbol: "AMZN", currentRisk: "MEDIUM", currentVolatility: 0.0265, driftFlag: false, driftScore: 0.067 },
};

function generateHistory(symbol: string): SymbolHistory {
  const snap = SNAPSHOTS[symbol];
  const baseVol = snap?.currentVolatility ?? 0.02;
  const points: HistoryPoint[] = [];
  const now = new Date();

  for (let i = 59; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const noise = (Math.sin(i * 0.7 + symbol.charCodeAt(0)) * 0.5 + 0.5) * 0.015 - 0.005;
    const trend = i < 20 ? 0.005 : 0;
    const vol = Math.max(0.003, baseVol + noise + trend);
    const level: HistoryPoint["riskLevel"] = vol > 0.035 ? "HIGH" : vol > 0.02 ? "MEDIUM" : "LOW";
    points.push({
      date: d.toISOString().slice(0, 10),
      volatility: parseFloat(vol.toFixed(4)),
      riskLevel: level,
    });
  }
  return { symbol, points };
}

const OVERVIEW: RiskOverview = {
  totalSymbols: SYMBOLS.length,
  highRiskCount: Object.values(SNAPSHOTS).filter((s) => s.currentRisk === "HIGH").length,
  mediumRiskCount: Object.values(SNAPSHOTS).filter((s) => s.currentRisk === "MEDIUM").length,
  lowRiskCount: Object.values(SNAPSHOTS).filter((s) => s.currentRisk === "LOW").length,
  lastUpdated: new Date().toISOString(),
};

const DRIFT_SUMMARY: DriftSummaryItem[] = Object.values(SNAPSHOTS).map((s) => ({
  symbol: s.symbol,
  driftFlag: s.driftFlag,
  driftScore: s.driftScore,
}));

// Simulates network delay
const delay = <T>(data: T, ms = 200): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms));

export const mockApi = {
  getSymbols: () => delay(SYMBOLS),
  getRiskOverview: () => delay(OVERVIEW),
  getRiskSnapshot: (symbol: string) => delay(SNAPSHOTS[symbol] ?? SNAPSHOTS["AAPL"]),
  getRiskHistory: (symbol: string) => delay(generateHistory(symbol)),
  getDriftSummary: () => delay(DRIFT_SUMMARY),
};
