// Types
export interface Symbol {
  symbol: string;
  name: string;
}

export interface RiskOverview {
  totalSymbols: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  lastUpdated: string;
}

export interface RiskSnapshot {
  symbol: string;
  currentRisk: "high" | "medium" | "low";
  currentVolatility: number;
  driftFlag: boolean;
  driftScore: number;
}

export interface HistoryPoint {
  date: string;
  volatility: number;
  riskLevel: "high" | "medium" | "low";
}

export interface RiskHistory {
  symbol: string;
  points: HistoryPoint[];
}

export interface DriftSummaryItem {
  symbol: string;
  driftFlag: boolean;
  driftScore: number;
}

const API_BASE = "/api";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  getSymbols: () => fetchJson<Symbol[]>("/symbols"),
  getRiskOverview: () => fetchJson<RiskOverview>("/risk/overview"),
  getRiskSnapshot: (symbol: string) => fetchJson<RiskSnapshot>(`/risk/snapshot?symbol=${symbol}`),
  getRiskHistory: (symbol: string) => fetchJson<RiskHistory>(`/risk/history?symbol=${symbol}`),
  getDriftSummary: () => fetchJson<DriftSummaryItem[]>("/drift/summary"),
};
