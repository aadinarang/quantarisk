import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  BarChart3,
  Settings,
  AlertTriangle,
  Activity,
  Database,
  User,
  Info,
  Sun,
  Moon,
  Eye,
  LogOut,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { SearchBar } from "@/components/SearchBar";
import { Footer } from "@/components/Footer";
import { useRiskOverview, useMe, useMyAlerts } from "@/hooks/use-risk-data";
import { useTheme } from "@/hooks/use-theme";
import { auth } from "@/lib/api";

const links = [
  { to: "/", label: "Dashboard", icon: BarChart3 },
  { to: "/watchlist", label: "Watchlist", icon: Eye },
  { to: "/drift", label: "Drift Overview", icon: AlertTriangle },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/data-quality", label: "Data Quality", icon: Database },
  { to: "/about", label: "About", icon: Info },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/account", label: "Account", icon: User },
];

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Dashboard", subtitle: "Market risk overview" },
  "/watchlist": { title: "Watchlist", subtitle: "Tracked symbols" },
  "/drift": { title: "Drift Overview", subtitle: "Regime shift detection" },
  "/alerts": { title: "Alert Center", subtitle: "Drift and risk notifications" },
  "/data-quality": { title: "Data Quality", subtitle: "Ingestion and validation status" },
  "/settings": { title: "Settings", subtitle: "Risk configuration" },
  "/account": { title: "Account", subtitle: "Profile and preferences" },
  "/about": { title: "About", subtitle: "Platform information" },
};

function isActive(to: string, pathname: string): boolean {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(to + "/");
}

function getInitials(name?: string, email?: string): string {
  const source = (name || email || "QR").trim();
  if (!source) return "QR";

  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: overview } = useRiskOverview();
  const { data: me } = useMe();
  const { data: myAlerts } = useMyAlerts();
  const { theme, toggle } = useTheme();

  const basePath = "/" + (location.pathname.split("/")[1] || "");
  const isSymbolPage = location.pathname.startsWith("/symbol/");
  const meta = isSymbolPage
    ? { title: "Symbol Detail", subtitle: "Deep dive analysis" }
    : pageMeta[basePath] ?? pageMeta["/"];

  const lastUpdated = overview?.lastUpdated
    ? new Date(overview.lastUpdated).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : null;

  const unreadAlerts = Array.isArray(myAlerts)
    ? myAlerts.filter((a: any) => !a?.read).length
    : 0;

  const handleSignOut = () => {
    auth.clearToken();
    navigate("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="w-14 h-full shrink-0 border-r border-border bg-card flex flex-col items-center">
        <div className="py-4 shrink-0">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                <Activity className="h-4 w-4 text-primary nav-icon-active" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-popover border-border text-xs">
              QuantaRisk
            </TooltipContent>
          </Tooltip>
        </div>

        <nav className="flex-1 flex flex-col items-center gap-1 pt-4 w-full">
          {links.map(({ to, label, icon: Icon }) => {
            const active = isActive(to, location.pathname);

            return (
              <Tooltip key={to} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    to={to}
                    className={cn(
                      "relative mx-2 w-10 h-10 flex items-center justify-center rounded-md transition-all duration-200",
                      active
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                    )}
                  >
                    {active && (
                      <>
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary rounded-r-full shadow-[0_0_10px_2px_hsl(var(--primary)/0.5)]" />
                        <span className="pointer-events-none absolute inset-0 rounded-md bg-primary/[0.06] shadow-[inset_0_0_12px_hsl(var(--primary)/0.08)]" />
                      </>
                    )}

                    <Icon
                      className={cn(
                        "relative h-[18px] w-[18px] transition-all duration-200",
                        active && "nav-icon-active",
                      )}
                      strokeWidth={active ? 2 : 1.5}
                    />

                    {to === "/alerts" && unreadAlerts > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-[8px] font-bold text-white font-mono leading-none">
                        {unreadAlerts > 9 ? "9+" : unreadAlerts}
                      </span>
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-popover border-border text-xs">
                  {label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        <div className="shrink-0 flex flex-col items-center pb-3 gap-2">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={toggle}
                className="w-10 h-10 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                {theme === "dark" ? (
                  <Sun className="h-[18px] w-[18px]" strokeWidth={1.5} />
                ) : (
                  <Moon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-popover border-border text-xs">
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </TooltipContent>
          </Tooltip>

          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={handleSignOut}
                className="w-10 h-10 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <LogOut className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-popover border-border text-xs">
              Sign out
            </TooltipContent>
          </Tooltip>

          <div className="w-6 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-full">
        <header className="h-12 shrink-0 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 gap-4">
          <div className="shrink-0">
            <h1 className="text-sm font-medium text-foreground leading-none">{meta.title}</h1>
            <p className="text-[10px] text-muted-foreground mt-0.5">{meta.subtitle}</p>
          </div>

          <SearchBar />

          <div className="flex items-center gap-3 shrink-0">
            {lastUpdated && (
              <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground font-mono">
                <span className="relative flex h-2 w-2">
                  <span className="animate-pulse-glow absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <span>{lastUpdated}</span>
              </div>
            )}

            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  to="/alerts"
                  className="relative flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <Bell className="h-4 w-4" strokeWidth={1.5} />
                  {unreadAlerts > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-[8px] font-bold text-white font-mono">
                      {unreadAlerts > 9 ? "9+" : unreadAlerts}
                    </span>
                  )}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-popover border-border text-xs">
                {unreadAlerts > 0 ? `${unreadAlerts} unread alerts` : "Alert Center"}
              </TooltipContent>
            </Tooltip>

            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Link to="/account">
                  <div
                    className={cn(
                      "min-w-8 h-8 rounded-full border px-2 flex items-center justify-center transition-colors",
                      isActive("/account", location.pathname)
                        ? "bg-primary/20 border-primary/40"
                        : "bg-primary/10 border-primary/20 hover:bg-primary/15",
                    )}
                  >
                    <span className="text-[10px] font-mono font-semibold text-primary">
                      {getInitials(me?.name, me?.email)}
                    </span>
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-popover border-border text-xs">
                {me?.name || me?.email || "Account"}
              </TooltipContent>
            </Tooltip>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto min-h-0">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}