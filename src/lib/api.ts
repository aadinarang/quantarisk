const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const TOKEN_KEY = "quantarisk-access-token";

if (!import.meta.env.VITE_API_URL) {
  console.warn("[QuantaRisk] VITE_API_URL is not set - falling back to localhost");
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

const normalizeSymbol = (s: any) => ({
  symbol: str(s.symbol ?? s.ticker),
  name: str(s.name ?? s.companyName ?? s.security_name),
  price: num(s.price ?? s.currentPrice ?? s.current_price ?? s.close),
  change: num(s.change ?? s.priceChange ?? s.price_change ?? s.netChange),
  changePercent: num(s.changePercent ?? s.change_percent ?? s.percentChange ?? s.pct_change),
  exchange: str(s.exchange ?? s.market ?? ""),
  sector: str(s.sector ?? s.industry ?? ""),
});

const normalizeSnapshot = (s: any) => ({
  symbol: str(s.symbol ?? s.ticker),
  currentRisk: str(s.currentRisk ?? s.risk ?? s.riskLevel ?? s.risk_level),
  currentVolatility: num(s.currentVolatility ?? s.volatility ?? s.current_volatility),
  driftFlag: Boolean(s.driftFlag ?? s.drift_flag),
  driftScore: num(s.driftScore ?? s.drift_score),
});

const normalizeRatios = (r: any) => ({
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

const normalizeUser = (u: any) => ({
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
  getSymbols: async () => {
    const data = await getJson("/api/symbols");
    return Array.isArray(data)
      ? data.map(normalizeSymbol)
      : Array.isArray(data?.value)
        ? data.value.map(normalizeSymbol)
        : [];
  },

  getRiskOverview: async () => {
    const data = await getJson("/api/risk/overview");
    return {
      totalSymbols: num(data.totalSymbols),
      highRiskCount: num(data.highRiskCount),
      mediumRiskCount: num(data.mediumRiskCount),
      lowRiskCount: num(data.lowRiskCount),
      lastUpdated: str(data.lastUpdated),
    };
  },

  getRiskSnapshot: async (symbol: string) => {
    const data = await getJson(`/api/risk/snapshot?symbol=${encodeURIComponent(symbol)}`);
    return normalizeSnapshot(data);
  },

  getRiskHistory: async (symbol: string) => {
    const data = await getJson(`/api/risk/history?symbol=${encodeURIComponent(symbol)}`);

    if (Array.isArray(data)) {
      return {
        points: data.map((p: any) => ({
          date: str(p.date ?? p.timestamp ?? p.datetime),
          value: num(p.value ?? p.volatility ?? p.close ?? p.price),
        })),
      };
    }

    if (Array.isArray(data?.points)) {
      return {
        points: data.points.map((p: any) => ({
          date: str(p.date ?? p.timestamp ?? p.datetime),
          value: num(p.value ?? p.volatility ?? p.close ?? p.price),
        })),
      };
    }

    return {
      points: Array.isArray(data?.history)
        ? data.history.map((p: any) => ({
            date: str(p.date ?? p.timestamp ?? p.datetime),
            value: num(p.value ?? p.volatility ?? p.close ?? p.price),
          }))
        : [],
    };
  },

  getDriftSummary: async () => {
    const data = await getJson("/api/drift/summary");
    return Array.isArray(data)
      ? data.map((d: any) => ({
          symbol: str(d.symbol ?? d.ticker),
          driftFlag: Boolean(d.driftFlag ?? d.drift_flag),
          driftScore: num(d.driftScore ?? d.drift_score),
        }))
      : [];
  },

  getSymbolRatios: async (symbol: string) => {
    const data = await getJson(`/api/ratios?symbol=${encodeURIComponent(symbol)}`);
    return normalizeRatios(data);
  },

  searchSymbols: async (query: string) => {
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

  logout: () => auth.clearToken(),

  getMe: async () => {
    const data = await getJson("/api/me");
    return normalizeUser(data);
  },

  updateMe: async (payload: { name?: string; email?: string }) => {
    const data = await getJson("/api/me", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return normalizeUser(data);
  },

  updatePreferences: async (payload: { emailAlerts?: boolean; driftAlerts?: boolean }) => {
    const data = await getJson("/api/me/preferences", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return normalizeUser(data);
  },

  getWatchlist: async () => {
    const data = await getJson("/api/watchlist");
    return Array.isArray(data) ? data.map((item) => str(item).toUpperCase()).filter(Boolean) : [];
  },

  addToWatchlist: async (symbol: string) => {
    await getJson("/api/watchlist", {
      method: "POST",
      body: JSON.stringify({ symbol }),
    });
    return true;
  },

  removeFromWatchlist: async (symbol: string) => {
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
