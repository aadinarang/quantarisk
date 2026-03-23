import { mockApi } from "./mock-data";

// ── Types ──────────────────────────────────────────────
export interface SymbolInfo {
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

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface SymbolSnapshot {
  symbol: string;
  currentRisk: RiskLevel;
  currentVolatility: number;
  driftFlag: boolean;
  driftScore: number;
}

export interface HistoryPoint {
  date: string;
  volatility: number;
  riskLevel: RiskLevel;
}

export interface SymbolHistory {
  symbol: string;
  points: HistoryPoint[];
}

export interface DriftSummaryItem {
  symbol: string;
  driftFlag: boolean;
  driftScore: number;
}

// ── Config ─────────────────────────────────────────────
// Set to false to use the real FastAPI backend via /api/...
const USE_MOCK = true;
const API_BASE = "http://127.0.0.1:8000/api";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

const liveApi = {
  getSymbols: () => fetchJson<SymbolInfo[]>("/symbols"),
  getRiskOverview: () => fetchJson<RiskOverview>("/risk/overview"),
  getRiskSnapshot: (symbol: string) => fetchJson<SymbolSnapshot>(`/risk/snapshot?symbol=${symbol}`),
  getRiskHistory: (symbol: string) => fetchJson<SymbolHistory>(`/risk/history?symbol=${symbol}`),
  getDriftSummary: () => fetchJson<DriftSummaryItem[]>("/drift/summary"),
};

export const api = USE_MOCK ? mockApi : liveApi;
