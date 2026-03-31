import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useSearchSymbols } from "@/hooks/use-risk-data";
import { cn } from "@/lib/utils";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { data: results } = useSearchSymbols(query);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (symbol: string) => {
    setQuery("");
    setOpen(false);
    navigate(`/symbol/${symbol}`);
  };

  return (
    <div ref={ref} className="relative w-full max-w-xs">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => query && setOpen(true)}
          placeholder="Search symbols..."
          className="w-full h-8 pl-8 pr-8 text-xs font-mono bg-secondary border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
        />
        {query && (
          <button onClick={() => { setQuery(""); setOpen(false); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
      {open && results && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-50 overflow-hidden">
          {results.map((s) => (
            <button
              key={s.symbol}
              onClick={() => handleSelect(s.symbol)}
              className="w-full px-3 py-2 text-left hover:bg-secondary transition-colors flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-medium text-foreground">{s.symbol}</span>
                <span className="text-xs text-muted-foreground truncate">{s.name}</span>
              </div>
              <span className={cn("text-xs font-mono", s.change >= 0 ? "text-risk-low-text" : "text-risk-high-text")}>
                {s.change >= 0 ? "+" : ""}{(s.changePercent ?? 0).toFixed(2)}%
              </span>
            </button>
          ))}
        </div>
      )}
      {open && query && results && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md p-3 z-50">
          <p className="text-xs text-muted-foreground text-center">No results found</p>
        </div>
      )}
    </div>
  );
}
