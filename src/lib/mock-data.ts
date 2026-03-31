import type { SymbolInfo, RiskOverview, SymbolSnapshot, HistoryPoint, SymbolHistory, DriftSummaryItem, SymbolRatios } from "./api";

const SYMBOLS: SymbolInfo[] = [
  { symbol: "AAPL", name: "Apple Inc.", sector: "Technology", exchange: "NASDAQ", marketCap: "3.45T", price: 198.11, change: 1.24, changePercent: 0.63 },
  { symbol: "MSFT", name: "Microsoft Corporation", sector: "Technology", exchange: "NASDAQ", marketCap: "3.12T", price: 442.57, change: -2.18, changePercent: -0.49 },
  { symbol: "TSLA", name: "Tesla Inc.", sector: "Consumer Discretionary", exchange: "NASDAQ", marketCap: "812B", price: 254.33, change: 8.41, changePercent: 3.42 },
  { symbol: "SPY", name: "SPDR S&P 500 ETF", sector: "ETF", exchange: "NYSE", marketCap: "534B", price: 543.21, change: 0.87, changePercent: 0.16 },
  { symbol: "NVDA", name: "NVIDIA Corporation", sector: "Technology", exchange: "NASDAQ", marketCap: "2.87T", price: 131.88, change: 5.22, changePercent: 4.12 },
  { symbol: "AMZN", name: "Amazon.com Inc.", sector: "Consumer Discretionary", exchange: "NASDAQ", marketCap: "1.95T", price: 186.49, change: -0.73, changePercent: -0.39 },
  { symbol: "GOOGL", name: "Alphabet Inc.", sector: "Technology", exchange: "NASDAQ", marketCap: "2.14T", price: 176.32, change: 1.05, changePercent: 0.60 },
  { symbol: "META", name: "Meta Platforms Inc.", sector: "Technology", exchange: "NASDAQ", marketCap: "1.34T", price: 512.44, change: -3.21, changePercent: -0.62 },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", sector: "Financials", exchange: "NYSE", marketCap: "592B", price: 205.18, change: 0.44, changePercent: 0.21 },
  { symbol: "V", name: "Visa Inc.", sector: "Financials", exchange: "NYSE", marketCap: "558B", price: 281.67, change: 1.12, changePercent: 0.40 },
];

const SNAPSHOTS: Record<string, SymbolSnapshot> = {
  AAPL: { symbol: "AAPL", currentRisk: "MEDIUM", currentVolatility: 0.0231, driftFlag: false, driftScore: 0.042 },
  MSFT: { symbol: "MSFT", currentRisk: "LOW", currentVolatility: 0.0178, driftFlag: false, driftScore: 0.018 },
  TSLA: { symbol: "TSLA", currentRisk: "HIGH", currentVolatility: 0.0487, driftFlag: true, driftScore: 0.312 },
  SPY:  { symbol: "SPY",  currentRisk: "LOW", currentVolatility: 0.0112, driftFlag: false, driftScore: 0.009 },
  NVDA: { symbol: "NVDA", currentRisk: "HIGH", currentVolatility: 0.0398, driftFlag: true, driftScore: 0.274 },
  AMZN: { symbol: "AMZN", currentRisk: "MEDIUM", currentVolatility: 0.0265, driftFlag: false, driftScore: 0.067 },
  GOOGL: { symbol: "GOOGL", currentRisk: "LOW", currentVolatility: 0.0192, driftFlag: false, driftScore: 0.023 },
  META: { symbol: "META", currentRisk: "MEDIUM", currentVolatility: 0.0312, driftFlag: false, driftScore: 0.089 },
  JPM: { symbol: "JPM", currentRisk: "LOW", currentVolatility: 0.0145, driftFlag: false, driftScore: 0.011 },
  V: { symbol: "V", currentRisk: "LOW", currentVolatility: 0.0133, driftFlag: false, driftScore: 0.008 },
};

const RATIOS: Record<string, SymbolRatios> = {
  AAPL: { pe: 31.2, eps: 6.35, pb: 48.7, ps: 8.1, debtToEquity: 1.87, currentRatio: 0.99, roe: 1.56, roa: 0.29, grossMargin: 0.459, operatingMargin: 0.304, netMargin: 0.262, dividendYield: 0.0053, beta: 1.24, sharpeRatio: 1.42, maxDrawdown: -0.164 },
  MSFT: { pe: 36.8, eps: 12.02, pb: 13.1, ps: 14.2, debtToEquity: 0.42, currentRatio: 1.77, roe: 0.38, roa: 0.19, grossMargin: 0.695, operatingMargin: 0.449, netMargin: 0.361, dividendYield: 0.0072, beta: 0.89, sharpeRatio: 1.68, maxDrawdown: -0.121 },
  TSLA: { pe: 72.4, eps: 3.51, pb: 16.8, ps: 9.7, debtToEquity: 0.11, currentRatio: 1.73, roe: 0.23, roa: 0.12, grossMargin: 0.183, operatingMargin: 0.088, netMargin: 0.079, dividendYield: 0, beta: 2.05, sharpeRatio: 0.74, maxDrawdown: -0.387 },
  SPY: { pe: 24.1, eps: 22.53, pb: 4.5, ps: 2.8, debtToEquity: 0, currentRatio: 0, roe: 0, roa: 0, grossMargin: 0, operatingMargin: 0, netMargin: 0, dividendYield: 0.0132, beta: 1.0, sharpeRatio: 1.15, maxDrawdown: -0.098 },
  NVDA: { pe: 58.3, eps: 2.26, pb: 52.1, ps: 37.4, debtToEquity: 0.41, currentRatio: 4.17, roe: 1.15, roa: 0.55, grossMargin: 0.729, operatingMargin: 0.621, netMargin: 0.554, dividendYield: 0.0003, beta: 1.68, sharpeRatio: 2.31, maxDrawdown: -0.201 },
  AMZN: { pe: 55.7, eps: 3.35, pb: 8.3, ps: 3.1, debtToEquity: 0.58, currentRatio: 1.05, roe: 0.21, roa: 0.07, grossMargin: 0.478, operatingMargin: 0.108, netMargin: 0.073, dividendYield: 0, beta: 1.15, sharpeRatio: 1.22, maxDrawdown: -0.178 },
  GOOGL: { pe: 25.9, eps: 6.81, pb: 7.1, ps: 7.5, debtToEquity: 0.10, currentRatio: 2.10, roe: 0.29, roa: 0.18, grossMargin: 0.574, operatingMargin: 0.321, netMargin: 0.262, dividendYield: 0.0044, beta: 1.06, sharpeRatio: 1.55, maxDrawdown: -0.132 },
  META: { pe: 28.4, eps: 18.04, pb: 9.2, ps: 10.3, debtToEquity: 0.28, currentRatio: 2.68, roe: 0.33, roa: 0.21, grossMargin: 0.812, operatingMargin: 0.413, netMargin: 0.352, dividendYield: 0.0035, beta: 1.22, sharpeRatio: 1.38, maxDrawdown: -0.155 },
  JPM: { pe: 12.1, eps: 16.96, pb: 1.9, ps: 3.4, debtToEquity: 1.24, currentRatio: 0, roe: 0.16, roa: 0.013, grossMargin: 0, operatingMargin: 0.38, netMargin: 0.31, dividendYield: 0.0219, beta: 1.07, sharpeRatio: 1.12, maxDrawdown: -0.108 },
  V: { pe: 30.5, eps: 9.23, pb: 13.6, ps: 16.8, debtToEquity: 0.58, currentRatio: 1.35, roe: 0.47, roa: 0.17, grossMargin: 0.978, operatingMargin: 0.672, netMargin: 0.543, dividendYield: 0.0075, beta: 0.94, sharpeRatio: 1.48, maxDrawdown: -0.095 },
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
      volatility: parseFloat((typeof vol === "number" && Number.isFinite(vol) ? vol : 0).toFixed(4)),
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

const delay = <T>(data: T, ms = 200): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms));

export const mockApi = {
  getSymbols: () => delay(SYMBOLS),
  getRiskOverview: () => delay(OVERVIEW),
  getRiskSnapshot: (symbol: string) => delay(SNAPSHOTS[symbol] ?? SNAPSHOTS["AAPL"]),
  getRiskHistory: (symbol: string) => delay(generateHistory(symbol)),
  getDriftSummary: () => delay(DRIFT_SUMMARY),
  getSymbolRatios: (symbol: string) => delay(RATIOS[symbol] ?? RATIOS["AAPL"]),
  searchSymbols: (query: string) => {
    const q = query.toLowerCase();
    const results = SYMBOLS.filter(s => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
    return delay(results, 100);
  },
};

