import { useState, useEffect } from "react";

const STORAGE_KEY = "quantarisk-watchlist";

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : ["AAPL", "TSLA", "NVDA"];
    } catch {
      return ["AAPL", "TSLA", "NVDA"];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
  }, [watchlist]);

  const addSymbol = (symbol: string) => {
    setWatchlist((prev) => (prev.includes(symbol) ? prev : [...prev, symbol]));
  };

  const removeSymbol = (symbol: string) => {
    setWatchlist((prev) => prev.filter((s) => s !== symbol));
  };

  const isInWatchlist = (symbol: string) => watchlist.includes(symbol);

  return { watchlist, addSymbol, removeSymbol, isInWatchlist };
}
