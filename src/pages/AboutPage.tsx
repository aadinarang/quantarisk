import { Activity, Shield, TrendingUp, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="p-6 lg:p-8 max-w-2xl space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">QuantaRisk</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          QuantaRisk is a real-time market risk monitoring platform designed for quantitative analysts and portfolio managers. 
          It provides volatility tracking, drift detection, and risk assessment across equity and ETF instruments.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FeatureCard icon={Shield} title="Risk Monitoring" description="Real-time risk classification across LOW, MEDIUM, and HIGH bands based on rolling volatility quantiles." />
        <FeatureCard icon={TrendingUp} title="Drift Detection" description="Detects volatility regime shifts by comparing recent vs. reference distribution windows." />
        <FeatureCard icon={Zap} title="Fast Refresh" description="Data refreshes every 30 seconds with configurable window lengths and quantile thresholds." />
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">How It Works</h3>
        <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <p>
            Volatility is computed from rolling standard deviation of daily log returns over a configurable window.
            Risk levels are assigned by comparing each symbol's current volatility against historical quantile thresholds.
          </p>
          <p>
            Drift detection uses a statistical comparison between the recent volatility distribution and a longer reference window.
            When the distributions diverge beyond a threshold, a drift flag is raised indicating a potential regime change.
          </p>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">
          Built with React, Recharts, and a FastAPI backend. Data is simulated in demo mode.
        </p>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-4 space-y-2">
      <Icon className="h-4 w-4 text-primary" strokeWidth={1.5} />
      <h4 className="text-xs font-medium text-foreground">{title}</h4>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
