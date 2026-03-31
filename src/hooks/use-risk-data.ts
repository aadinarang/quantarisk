import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";

export const useSymbols = () =>
  useQuery({ queryKey: ["symbols"], queryFn: api.getSymbols, retry: 1 });

export const useRiskOverview = () =>
  useQuery({
    queryKey: ["risk-overview"],
    queryFn: api.getRiskOverview,
    refetchInterval: 30000,
    retry: 1,
  });

export const useRiskSnapshot = (symbol: string) =>
  useQuery({
    queryKey: ["risk-snapshot", symbol],
    queryFn: () => api.getRiskSnapshot(symbol),
    enabled: !!symbol,
    retry: 1,
  });

export const useRiskHistory = (symbol: string) =>
  useQuery({
    queryKey: ["risk-history", symbol],
    queryFn: () => api.getRiskHistory(symbol),
    enabled: !!symbol,
    retry: 1,
  });

export const useDriftSummary = () =>
  useQuery({ queryKey: ["drift-summary"], queryFn: api.getDriftSummary, retry: 1 });

export const useSymbolRatios = (symbol: string) =>
  useQuery({
    queryKey: ["symbol-ratios", symbol],
    queryFn: () => api.getSymbolRatios(symbol),
    enabled: !!symbol,
    retry: 1,
  });

export const useSearchSymbols = (query: string) =>
  useQuery({
    queryKey: ["search-symbols", query],
    queryFn: () => api.searchSymbols(query),
    enabled: query.length >= 1,
    retry: 1,
  });

export const useDataQuality = () =>
  useQuery({ queryKey: ["data-quality"], queryFn: api.getDataQuality, retry: 1 });

export const useAlerts = () =>
  useQuery({
    queryKey: ["alerts"],
    queryFn: api.getAlerts,
    refetchInterval: 30000,
    retry: 1,
  });

export const useMyAlerts = () =>
  useQuery({
    queryKey: ["my-alerts"],
    queryFn: api.getMyAlerts,
    enabled: isAuthenticated(),
    refetchInterval: 30000,
    retry: 1,
  });

export const useSectorBreakdown = () =>
  useQuery({
    queryKey: ["sector-breakdown"],
    queryFn: api.getSectorBreakdown,
    retry: 1,
  });

export const useCorrelationMatrix = () =>
  useQuery({
    queryKey: ["correlation-matrix"],
    queryFn: api.getCorrelationMatrix,
    retry: 1,
  });

export const useVaR = (symbol: string) =>
  useQuery({
    queryKey: ["var", symbol],
    queryFn: () => api.getVaR(symbol),
    enabled: !!symbol,
    retry: 1,
  });

export const usePriceForecast = (symbol: string, days: number) =>
  useQuery({
    queryKey: ["price-forecast", symbol, days],
    queryFn: () => api.getPriceForecast(symbol, days),
    enabled: !!symbol,
    retry: 1,
    staleTime: 60000,
  });

export const useMe = () =>
  useQuery({
    queryKey: ["me"],
    queryFn: api.getMe,
    enabled: isAuthenticated(),
    retry: 0,
  });

export const useMarkAlertRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => api.markMyAlertRead(alertId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-alerts"] });
      qc.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
};

export const useMarkAllAlertsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.markAllMyAlertsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-alerts"] });
      qc.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
};
