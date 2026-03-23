import { NavLink, Outlet } from "react-router-dom";
import { Activity, BarChart3, AlertTriangle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Dashboard", icon: BarChart3 },
  { to: "/drift", label: "Drift Overview", icon: AlertTriangle },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppShell() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-border bg-card flex flex-col">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-border">
          <Activity className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold tracking-tight text-foreground">Risk Monitor</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-border">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Market Risk v1.0</p>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
