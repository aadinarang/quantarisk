import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const useSymbols = () =>
  useQuery({ queryKey: ["symbols"], queryFn: api.getSymbols, retry: 1 });

export const useRiskOverview = () =>
  useQuery({ queryKey: ["risk-overview"], queryFn: api.getRiskOverview, refetchInterval: 30000, retry: 1 });

export const useRiskSnapshot = (symbol: string) =>
  useQuery({ queryKey: ["risk-snapshot", symbol], queryFn: () => api.getRiskSnapshot(symbol), enabled: !!symbol, retry: 1 });

export const useRiskHistory = (symbol: string) =>
  useQuery({ queryKey: ["risk-history", symbol], queryFn: () => api.getRiskHistory(symbol), enabled: !!symbol, retry: 1 });

export const useDriftSummary = () =>
  useQuery({ queryKey: ["drift-summary"], queryFn: api.getDriftSummary, retry: 1 });

export const useSymbolRatios = (symbol: string) =>
  useQuery({ queryKey: ["symbol-ratios", symbol], queryFn: () => api.getSymbolRatios(symbol), enabled: !!symbol, retry: 1 });

export const useSearchSymbols = (query: string) =>
  useQuery({ queryKey: ["search-symbols", query], queryFn: () => api.searchSymbols(query), enabled: query.length >= 1, retry: 1 });

export const useSectorBreakdown = () =>
  useQuery({ queryKey: ["sector-breakdown"], queryFn: api.getSectorBreakdown, retry: 1 });

export const useCorrelationMatrix = () =>
  useQuery({ queryKey: ["correlation-matrix"], queryFn: api.getCorrelationMatrix, retry: 1 });
