const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const TOKEN_KEY = "quantarisk-access-token";

if (!import.meta.env.VITE_API_URL) {
  console.warn("[QuantaRisk] VITE_API_URL is not set - falling back to localhost");
}

export type RiskLevel = "Low" | "Medium" | "High" | string;

export interface SymbolItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  exchange: string;
  sector: string;
}

export interface RiskSnapshot {
  symbol: string;
  currentRisk: RiskLevel;
  currentVolatility: number;
  driftFlag: boolean;
  driftScore: number;
}

export interface RiskHistoryPoint {
  date: string;
  volatility: number;
  riskLevel: RiskLevel;
}

export interface RiskHistoryResponse {
  points: RiskHistoryPoint[];
}

export interface SymbolRatios {
  pe: number;
  eps: number;
  pb: number;
  ps: number;
  debtToEquity: number;
  currentRatio: number;
  roe: number;
  roa: number;
  grossMargin: number;
  operatingMargin: number;
  netMargin: number;
  dividendYield: number;
  beta: number;
  sharpeRatio: number;
  maxDrawdown: number;
}

export interface UserPreferences {
  emailAlerts: boolean;
  driftAlerts: boolean;
}

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  preferences: UserPreferences;
  createdAt: string;
}

export interface RiskOverview {
  totalSymbols: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  lastUpdated: string;
}

export interface DriftSummaryItem {
  symbol: string;
  driftFlag: boolean;
  driftScore: number;
}

export const apiUrl = (path: string): string => {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
};

export const auth = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
  isLoggedIn: () => Boolean(localStorage.getItem(TOKEN_KEY)),
};

const getJson = async (path: string, options?: RequestInit) => {
  const token = auth.getToken();
  const headers = new Headers(options?.headers || {});

  if (!headers.has("Content-Type") && !(options?.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(apiUrl(path), {
    ...options,
    headers,
  });

  if (res.status === 401) {
    auth.clearToken();
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
  }

  if (res.status === 204) {
    return null;
  }

  return res.json();
};

const num = (value: unknown, fallback = 0): number => {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
};

const str = (value: unknown, fallback = ""): string => {
  return typeof value === "string" ? value : fallback;
};

const normalizeRiskLevel = (value: unknown): RiskLevel => {
  const raw = str(value).trim().toLowerCase();

  if (raw === "low") return "Low";
  if (raw === "medium") return "Medium";
  if (raw === "high") return "High";

  return str(value, "Low");
};

const normalizeSymbol = (s: any): SymbolItem => ({
  symbol: str(s.symbol ?? s.ticker),
  name: str(s.name ?? s.companyName ?? s.security_name),
  price: num(s.price ?? s.currentPrice ?? s.current_price ?? s.close),
  change: num(s.change ?? s.priceChange ?? s.price_change ?? s.netChange),
  changePercent: num(s.changePercent ?? s.change_percent ?? s.percentChange ?? s.pct_change),
  exchange: str(s.exchange ?? s.market ?? ""),
  sector: str(s.sector ?? s.industry ?? ""),
});

const normalizeSnapshot = (s: any): RiskSnapshot => ({
  symbol: str(s.symbol ?? s.ticker),
  currentRisk: normalizeRiskLevel(s.currentRisk ?? s.risk ?? s.riskLevel ?? s.risk_level),
  currentVolatility: num(s.currentVolatility ?? s.volatility ?? s.current_volatility),
  driftFlag: Boolean(s.driftFlag ?? s.drift_flag),
  driftScore: num(s.driftScore ?? s.drift_score),
});

const normalizeHistoryPoint = (p: any): RiskHistoryPoint => ({
  date: str(p.date ?? p.timestamp ?? p.datetime),
  volatility: num(p.volatility ?? p.value ?? p.close ?? p.price),
  riskLevel: normalizeRiskLevel(p.riskLevel ?? p.risk_level ?? p.risk),
});

const normalizeRatios = (r: any): SymbolRatios => ({
  pe: num(r.pe ?? r.peRatio ?? r.pe_ratio),
  eps: num(r.eps),
  pb: num(r.pb ?? r.pbRatio ?? r.priceToBook),
  ps: num(r.ps ?? r.psRatio ?? r.priceToSales),
  debtToEquity: num(r.debtToEquity ?? r.debt_to_equity),
  currentRatio: num(r.currentRatio ?? r.current_ratio),
  roe: num(r.roe),
  roa: num(r.roa),
  grossMargin: num(r.grossMargin ?? r.gross_margin),
  operatingMargin: num(r.operatingMargin ?? r.operating_margin),
  netMargin: num(r.netMargin ?? r.net_margin),
  dividendYield: num(r.dividendYield ?? r.dividend_yield),
  beta: num(r.beta),
  sharpeRatio: num(r.sharpeRatio ?? r.sharpe_ratio),
  maxDrawdown: num(r.maxDrawdown ?? r.max_drawdown),
});

const normalizeUser = (u: any): UserProfile => ({
  id: num(u?.id),
  email: str(u?.email),
  name: str(u?.name),
  preferences: {
    emailAlerts: Boolean(u?.preferences?.emailAlerts),
    driftAlerts: Boolean(u?.preferences?.driftAlerts),
  },
  createdAt: str(u?.createdAt),
});

export const api = {
  getSymbols: async (): Promise<SymbolItem[]> => {
    const data = await getJson("/api/symbols");
    return Array.isArray(data)
      ? data.map(normalizeSymbol)
      : Array.isArray(data?.value)
        ? data.value.map(normalizeSymbol)
        : [];
  },

  getRiskOverview: async (): Promise<RiskOverview> => {
    const data = await getJson("/api/risk/overview");
    return {
      totalSymbols: num(data?.totalSymbols),
      highRiskCount: num(data?.highRiskCount),
      mediumRiskCount: num(data?.mediumRiskCount),
      lowRiskCount: num(data?.lowRiskCount),
      lastUpdated: str(data?.lastUpdated),
    };
  },

  getRiskSnapshot: async (symbol: string): Promise<RiskSnapshot> => {
    const data = await getJson(`/api/risk/snapshot?symbol=${encodeURIComponent(symbol)}`);
    return normalizeSnapshot(data);
  },

  getRiskHistory: async (symbol: string): Promise<RiskHistoryResponse> => {
    const data = await getJson(`/api/risk/history?symbol=${encodeURIComponent(symbol)}`);

    if (Array.isArray(data)) {
      return {
        points: data.map(normalizeHistoryPoint),
      };
    }

    if (Array.isArray(data?.points)) {
      return {
        points: data.points.map(normalizeHistoryPoint),
      };
    }

    return {
      points: Array.isArray(data?.history) ? data.history.map(normalizeHistoryPoint) : [],
    };
  },

  getDriftSummary: async (): Promise<DriftSummaryItem[]> => {
    const data = await getJson("/api/drift/summary");
    return Array.isArray(data)
      ? data.map((d: any) => ({
          symbol: str(d.symbol ?? d.ticker),
          driftFlag: Boolean(d.driftFlag ?? d.drift_flag),
          driftScore: num(d.driftScore ?? d.drift_score),
        }))
      : [];
  },

  getSymbolRatios: async (symbol: string): Promise<SymbolRatios> => {
    const data = await getJson(`/api/ratios?symbol=${encodeURIComponent(symbol)}`);
    return normalizeRatios(data);
  },

  searchSymbols: async (query: string): Promise<SymbolItem[]> => {
    const data = await getJson(`/api/symbols/search?q=${encodeURIComponent(query)}`);
    return Array.isArray(data) ? data.map(normalizeSymbol) : [];
  },

  signup: async (email: string, password: string) => {
    const data = await getJson("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (data?.access_token) {
      auth.setToken(data.access_token);
    }

    return {
      accessToken: str(data?.access_token),
      user: normalizeUser(data?.user),
    };
  },

  login: async (email: string, password: string) => {
    const data = await getJson("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (data?.access_token) {
      auth.setToken(data.access_token);
    }

    return {
      accessToken: str(data?.access_token),
      user: normalizeUser(data?.user),
    };
  },

  logout: (): void => auth.clearToken(),

  getMe: async (): Promise<UserProfile> => {
    const data = await getJson("/api/me");
    return normalizeUser(data);
  },

  updateMe: async (payload: { name?: string; email?: string }): Promise<UserProfile> => {
    const data = await getJson("/api/me", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return normalizeUser(data);
  },

  updatePreferences: async (
    payload: { emailAlerts?: boolean; driftAlerts?: boolean },
  ): Promise<UserProfile> => {
    const data = await getJson("/api/me/preferences", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return normalizeUser(data);
  },

  getWatchlist: async (): Promise<string[]> => {
    const data = await getJson("/api/watchlist");
    return Array.isArray(data) ? data.map((item) => str(item).toUpperCase()).filter(Boolean) : [];
  },

  addToWatchlist: async (symbol: string): Promise<boolean> => {
    await getJson("/api/watchlist", {
      method: "POST",
      body: JSON.stringify({ symbol }),
    });
    return true;
  },

  removeFromWatchlist: async (symbol: string): Promise<boolean> => {
    await getJson(`/api/watchlist/${encodeURIComponent(symbol)}`, {
      method: "DELETE",
    });
    return true;
  },

  getDataQuality: () => getJson("/api/data-quality"),
  getAlerts: () => getJson("/api/alerts"),
  getMyAlerts: () => getJson("/api/my-alerts"),
  getSectorBreakdown: () => getJson("/api/risk/sectors"),
  getCorrelationMatrix: () => getJson("/api/risk/correlation"),
  getVaR: (symbol: string) => getJson(`/api/risk/var?symbol=${encodeURIComponent(symbol)}`),
  getPriceForecast: (symbol: string, days: number) =>
    getJson(`/api/predict?symbol=${encodeURIComponent(symbol)}&days=${days}`),
  markMyAlertRead: (alertId: string) => getJson(`/api/alerts/${alertId}/read`, { method: "POST" }),
  markAllMyAlertsRead: () => getJson("/api/alerts/read-all", { method: "POST" }),
};