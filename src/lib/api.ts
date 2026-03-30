const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

if (!import.meta.env.VITE_API_URL) {
  console.warn("[QuantaRisk] VITE_API_URL is not set - falling back to localhost");
}

export const apiUrl = (path: string): string => {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
};

export const API = {
  health:    () => apiUrl("/api/health"),
  symbols:   () => apiUrl("/api/symbols"),
  pricesAll: () => apiUrl("/api/prices"),
  alerts:    () => apiUrl("/api/alerts"),
  // extend with other FastAPI endpoints as needed
  // pricesBySymbol: (symbol: string) => apiUrl(`/api/prices/${symbol}`),
  // riskSnapshot: (symbol: string) => apiUrl(`/api/risk/${symbol}`),
};
