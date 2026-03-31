import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BellOff, TrendingUp, GitBranch, AlertTriangle, CheckCircle2, ExternalLink } from "lucide-react";
import { useMarkAlertRead, useMarkAllAlertsRead, useMyAlerts } from "@/hooks/use-risk-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type AlertSeverity = "HIGH" | "MEDIUM" | "LOW";
type AlertType =
  | "DRIFT_DETECTED"
  | "DRIFT_RESOLVED"
  | "RISK_LEVEL_CHANGE"
  | "VOLATILITY_SPIKE";

type AlertItem = {
  id: string;
  timestamp: string;
  symbol: string;
  type: AlertType | string;
  severity: AlertSeverity | string;
  message: string;
  detail: string;
  read: boolean;
};

const TYPE_CONFIG: Record<
  AlertType,
  { label: string; icon: React.ElementType; color: string }
> = {
  DRIFT_DETECTED: {
    label: "Drift Detected",
    icon: GitBranch,
    color: "text-risk-high-text",
  },
  DRIFT_RESOLVED: {
    label: "Drift Resolved",
    icon: CheckCircle2,
    color: "text-risk-low-text",
  },
  RISK_LEVEL_CHANGE: {
    label: "Risk Level Change",
    icon: TrendingUp,
    color: "text-risk-medium-text",
  },
  VOLATILITY_SPIKE: {
    label: "Volatility Spike",
    icon: AlertTriangle,
    color: "text-risk-high-text",
  },
};

const SEVERITY_CONFIG: Record<
  AlertSeverity,
  { label: string; bg: string; border: string }
> = {
  HIGH: {
    label: "High",
    bg: "bg-risk-high-muted",
    border: "border-l-2 border-l-destructive",
  },
  MEDIUM: {
    label: "Medium",
    bg: "bg-risk-medium-muted",
    border: "border-l-2 border-l-amber-500",
  },
  LOW: {
    label: "Low",
    bg: "bg-transparent",
    border: "border-l-2 border-l-border",
  },
};

function relativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function normalizeSeverity(value: string): AlertSeverity {
  const raw = value.trim().toUpperCase();
  if (raw === "HIGH") return "HIGH";
  if (raw === "MEDIUM") return "MEDIUM";
  return "LOW";
}

function normalizeType(value: string): AlertType | null {
  const raw = value.trim().toUpperCase();
  if (raw === "DRIFT_DETECTED") return "DRIFT_DETECTED";
  if (raw === "DRIFT_RESOLVED") return "DRIFT_RESOLVED";
  if (raw === "RISK_LEVEL_CHANGE") return "RISK_LEVEL_CHANGE";
  if (raw === "VOLATILITY_SPIKE") return "VOLATILITY_SPIKE";
  return null;
}

type FilterSeverity = "ALL" | AlertSeverity;
type FilterStatus = "ALL" | "UNREAD" | "READ";

export default function AlertCenterPage() {
  const { data: alerts, isLoading } = useMyAlerts();
  const markRead = useMarkAlertRead();
  const markAll = useMarkAllAlertsRead();
  const navigate = useNavigate();

  const [severityFilter, setSeverityFilter] = useState<FilterSeverity>("ALL");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");

  const safeAlerts: AlertItem[] = Array.isArray(alerts) ? alerts : [];
  const unreadCount = safeAlerts.filter((a) => !a.read).length;

  const filtered = safeAlerts.filter((a) => {
    const severity = normalizeSeverity(a.severity);

    if (severityFilter !== "ALL" && severity !== severityFilter) return false;
    if (statusFilter === "UNREAD" && a.read) return false;
    if (statusFilter === "READ" && !a.read) return false;

    return true;
  });

  return (
    <div className="p-6 lg:p-8 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-foreground tabular-nums">
              {unreadCount}
            </span>
            <span className="text-xs text-muted-foreground">
              unread alert{unreadCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <FilterGroup
            label="Severity"
            options={["ALL", "HIGH", "MEDIUM", "LOW"]}
            value={severityFilter}
            onChange={(v) => setSeverityFilter(v as FilterSeverity)}
          />
          <FilterGroup
            label="Status"
            options={["ALL", "UNREAD", "READ"]}
            value={statusFilter}
            onChange={(v) => setStatusFilter(v as FilterStatus)}
          />
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            disabled={unreadCount === 0 || markAll.isPending}
            onClick={() => markAll.mutate()}
          >
            {markAll.isPending ? "Working..." : "Mark all read"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-md border border-border bg-card p-12 text-center space-y-2">
          <p className="text-sm text-muted-foreground">Loading alerts…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-md border border-border bg-card p-12 text-center space-y-2">
          <BellOff className="h-6 w-6 text-muted-foreground/30 mx-auto" strokeWidth={1} />
          <p className="text-sm text-muted-foreground">
            No alerts match the current filters.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onNavigate={() => {
                if (!alert.read) {
                  markRead.mutate(alert.id);
                }
                navigate(`/symbol/${alert.symbol}`);
              }}
              onMarkRead={() => markRead.mutate(alert.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AlertCard({
  alert,
  onNavigate,
  onMarkRead,
}: {
  alert: AlertItem;
  onNavigate: () => void;
  onMarkRead: () => void;
}) {
  const normalizedSeverity = normalizeSeverity(alert.severity);
  const normalizedType = normalizeType(alert.type);

  const typeConfig = normalizedType
    ? TYPE_CONFIG[normalizedType]
    : {
        label: alert.type,
        icon: AlertTriangle,
        color: "text-muted-foreground",
      };

  const severityConfig = SEVERITY_CONFIG[normalizedSeverity];
  const Icon = typeConfig.icon;

  return (
    <div
      className={cn(
        "rounded-md border border-border p-4 transition-colors",
        severityConfig.border,
        severityConfig.bg,
        !alert.read && "ring-1 ring-primary/10",
        "hover:bg-secondary/30",
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("mt-0.5 shrink-0", typeConfig.color)}>
          <Icon className="h-4 w-4" strokeWidth={1.5} />
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-semibold text-foreground">
              {alert.symbol}
            </span>
            <span className={cn("text-xs font-medium", typeConfig.color)}>
              {typeConfig.label}
            </span>

            {!alert.read && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-primary/10 text-primary border border-primary/15">
                New
              </span>
            )}

            <span
              className={cn(
                "inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium border",
                normalizedSeverity === "HIGH"
                  ? "bg-risk-high-muted text-risk-high-text border-risk-high/30"
                  : normalizedSeverity === "MEDIUM"
                    ? "bg-risk-medium-muted text-risk-medium-text border-risk-medium/30"
                    : "bg-muted text-muted-foreground border-border",
              )}
            >
              {severityConfig.label}
            </span>
          </div>

          <p className="text-xs text-foreground/80">{alert.message}</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {alert.detail}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="text-[10px] font-mono text-muted-foreground/50 whitespace-nowrap">
            {relativeTime(alert.timestamp)}
          </span>

          {!alert.read && (
            <button
              onClick={onMarkRead}
              className="text-[10px] font-mono text-primary hover:underline"
            >
              Mark read
            </button>
          )}

          <button
            onClick={onNavigate}
            className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            View
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] font-mono text-muted-foreground/50 mr-1">
        {label}:
      </span>
      <div className="flex items-center gap-0.5 bg-secondary/60 rounded-md p-0.5 border border-border">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={cn(
              "px-2.5 py-1 text-[10px] font-mono rounded transition-all duration-150",
              value === opt
                ? "bg-card text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}