import { Activity, Shield, Bell, TrendingUp, Database, GitBranch } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl">
      <section className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/10 px-3 py-1.5">
          <Activity className="h-4 w-4 text-primary" />
          <span className="text-xs font-mono uppercase tracking-wider text-primary">
            QuantaRisk
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">
            About QuantaRisk
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
            QuantaRisk is a market risk monitoring platform built to surface rolling
            volatility, risk classification, regime drift, alerts, watchlist tracking,
            financial ratios, and short-horizon price forecasts in one place.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <FeatureCard
          icon={Shield}
          title="Risk Classification"
          description="Classifies instruments into low, medium, and high risk buckets using backend-computed volatility signals."
        />
        <FeatureCard
          icon={GitBranch}
          title="Drift Detection"
          description="Highlights volatility regime changes so users can quickly identify symbols whose recent behavior has shifted."
        />
        <FeatureCard
          icon={Bell}
          title="Alerts"
          description="Supports user-facing alerts for drift, volatility changes, and other important risk events."
        />
        <FeatureCard
          icon={TrendingUp}
          title="Forecasting"
          description="Provides short-term price forecast paths with upper and lower bands for visual guidance."
        />
        <FeatureCard
          icon={Database}
          title="Data Quality"
          description="Surfaces backend-fed checks for missing, stale, or problematic market inputs."
        />
        <FeatureCard
          icon={Activity}
          title="Portfolio Monitoring"
          description="Combines dashboard summaries, watchlists, ratios, and symbol-level analysis into one workflow."
        />
      </section>

      <section className="rounded-md border border-border bg-card p-5 space-y-4">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Current Feature Coverage
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <InfoRow label="Dashboard" value="Implemented" />
          <InfoRow label="Symbol Detail Analysis" value="Implemented" />
          <InfoRow label="15 Financial Ratios" value="Implemented" />
          <InfoRow label="Watchlist" value="Implemented" />
          <InfoRow label="Risk / Drift Monitoring" value="Implemented" />
          <InfoRow label="Alerts UI" value="Implemented in current frontend pass" />
          <InfoRow label="Data Quality UI" value="Implemented in current frontend pass" />
          <InfoRow label="Account / Preferences" value="Partially wired" />
          <InfoRow label="Delete Account" value="Not wired yet" />
        </div>
      </section>

      <section className="rounded-md border border-border bg-card p-5 space-y-3">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Project Notes
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This frontend is being prepared as the deployable capstone version. The current
          priority is getting all major pages, navigation, and backend integration wired
          up cleanly before polishing edge cases and tests.
        </p>
      </section>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-md border border-border bg-card p-5 space-y-3">
      <div className="w-9 h-9 rounded-md bg-primary/10 border border-primary/15 flex items-center justify-center">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 rounded border border-border/60 bg-secondary/20 px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono text-foreground text-xs">{value}</span>
    </div>
  );
}