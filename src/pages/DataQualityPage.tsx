import { AlertTriangle, CheckCircle2, Database, RefreshCw } from "lucide-react";
import { useDataQuality } from "@/hooks/use-risk-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

type DataQualityItem = {
  symbol?: string;
  status?: string;
  issue?: string;
  message?: string;
  details?: string;
  lastUpdated?: string;
};

function normalizeItems(raw: unknown): DataQualityItem[] {
  if (Array.isArray(raw)) {
    return raw.map((item) =>
      typeof item === "object" && item !== null ? (item as DataQualityItem) : {},
    );
  }

  if (typeof raw === "object" && raw !== null) {
    const obj = raw as Record<string, unknown>;

    if (Array.isArray(obj.items)) {
      return obj.items.map((item) =>
        typeof item === "object" && item !== null ? (item as DataQualityItem) : {},
      );
    }

    if (Array.isArray(obj.results)) {
      return obj.results.map((item) =>
        typeof item === "object" && item !== null ? (item as DataQualityItem) : {},
      );
    }
  }

  return [];
}

function getStatus(value: unknown): "OK" | "WARN" | "ERROR" {
  const raw = String(value ?? "").trim().toUpperCase();

  if (raw === "ERROR" || raw === "FAILED" || raw === "FAIL") return "ERROR";
  if (raw === "WARN" || raw === "WARNING") return "WARN";
  return "OK";
}

function formatTimestamp(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function DataQualityPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isRefetching } = useDataQuality();

  const items = normalizeItems(data);
  const okCount = items.filter((item) => getStatus(item.status) === "OK").length;
  const warnCount = items.filter((item) => getStatus(item.status) === "WARN").length;
  const errorCount = items.filter((item) => getStatus(item.status) === "ERROR").length;

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["data-quality"] });
  };

  return (
    <div className="p-6 lg:p-8 space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Data Quality</h1>
          <p className="text-sm text-muted-foreground">
            Backend-fed checks for missing, stale, or problematic market inputs.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefetching}
          className="gap-1.5 text-xs"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {isRefetching ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SummaryCard
          label="Healthy"
          value={okCount}
          tone="ok"
          icon={CheckCircle2}
        />
        <SummaryCard
          label="Warnings"
          value={warnCount}
          tone="warn"
          icon={AlertTriangle}
        />
        <SummaryCard
          label="Errors"
          value={errorCount}
          tone="error"
          icon={Database}
        />
      </div>

      {isLoading ? (
        <div className="rounded-md border border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">Loading data quality checks…</p>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-md border border-border bg-card p-12 text-center space-y-2">
          <Database className="h-6 w-6 text-muted-foreground/30 mx-auto" strokeWidth={1.2} />
          <p className="text-sm text-muted-foreground">No data quality items returned.</p>
        </div>
      ) : (
        <div className="rounded-md border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Checks
            </h2>
          </div>

          <div className="divide-y divide-border">
            {items.map((item, index) => (
              <QualityRow key={`${item.symbol ?? "item"}-${index}`} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: number;
  tone: "ok" | "warn" | "error";
  icon: React.ElementType;
}) {
  const toneClass =
    tone === "ok"
      ? "text-risk-low-text border-risk-low/20 bg-risk-low-muted"
      : tone === "warn"
        ? "text-risk-medium-text border-risk-medium/20 bg-risk-medium-muted"
        : "text-risk-high-text border-risk-high/20 bg-risk-high-muted";

  return (
    <div className={cn("rounded-md border p-4", toneClass)}>
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider">{label}</span>
        <Icon className="h-4 w-4" strokeWidth={1.5} />
      </div>
      <p className="mt-3 text-2xl font-mono font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function QualityRow({ item }: { item: DataQualityItem }) {
  const status = getStatus(item.status);

  const statusClass =
    status === "OK"
      ? "bg-risk-low-muted text-risk-low-text border-risk-low/30"
      : status === "WARN"
        ? "bg-risk-medium-muted text-risk-medium-text border-risk-medium/30"
        : "bg-risk-high-muted text-risk-high-text border-risk-high/30";

  const title = item.symbol || item.issue || item.message || "Quality check";
  const subtitle =
    item.details || item.message || item.issue || "No additional details provided.";

  return (
    <div className="px-4 py-4">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border shrink-0",
            statusClass,
          )}
        >
          {status}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-foreground">{title}</span>
            {item.symbol && item.issue && (
              <span className="text-[11px] text-muted-foreground">
                {item.issue}
              </span>
            )}
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">{subtitle}</p>
        </div>

        <div className="shrink-0 text-[10px] font-mono text-muted-foreground/50 text-right">
          {formatTimestamp(item.lastUpdated)}
        </div>
      </div>
    </div>
  );
}