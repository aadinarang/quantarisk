import { NavLink, Outlet, useLocation } from "react-router-dom";
import { BarChart3, AlertTriangle, Settings, Activity, Eye, User, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useRiskOverview } from "@/hooks/use-risk-data";
import { SearchBar } from "@/components/SearchBar";
import { Footer } from "@/components/Footer";

const links = [
  { to: "/", label: "Dashboard", icon: BarChart3 },
  { to: "/watchlist", label: "Watchlist", icon: Eye },
  { to: "/drift", label: "Drift Overview", icon: AlertTriangle },
  { to: "/about", label: "About", icon: Info },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/account", label: "Account", icon: User },
];

const pageMeta: Record<string, { title: string }> = {
  "/": { title: "Dashboard" },
  "/watchlist": { title: "Watchlist" },
  "/drift": { title: "Drift Overview" },
  "/settings": { title: "Settings" },
  "/account": { title: "Account" },
  "/about": { title: "About" },
};

export function AppShell() {
  const location = useLocation();
  const { data: overview } = useRiskOverview();

  const basePath = "/" + (location.pathname.split("/")[1] || "");
  const isSymbolDetail = location.pathname.startsWith("/symbol/");
  const meta = isSymbolDetail
    ? { title: "Symbol Detail" }
    : pageMeta[basePath] ?? pageMeta["/"];

  const lastUpdated = overview?.lastUpdated
    ? new Date(overview.lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : null;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-14 shrink-0 border-r border-border bg-card flex flex-col items-center">
        <div className="py-4">
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
            <Activity className="h-4 w-4 text-primary" />
          </div>
        </div>
        <nav className="flex-1 flex flex-col items-center gap-1 pt-4">
          {links.map(({ to, label, icon: Icon }) => (
            <Tooltip key={to} delayDuration={0}>
              <TooltipTrigger asChild>
                <NavLink
                  to={to}
                  end={to === "/"}
                  className={({ isActive }) =>
                    cn(
                      "relative w-10 h-10 flex items-center justify-center rounded-md transition-colors",
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-primary rounded-r-full" />
                      )}
                      <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                    </>
                  )}
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-popover border-border text-xs">
                {label}
              </TooltipContent>
            </Tooltip>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-12 shrink-0 border-b border-border bg-card/50 flex items-center justify-between px-6 gap-4">
          <h1 className="text-sm font-medium text-foreground shrink-0">{meta.title}</h1>
          <SearchBar />
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono shrink-0">
            {lastUpdated && (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-pulse-glow absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <span>{lastUpdated}</span>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}
