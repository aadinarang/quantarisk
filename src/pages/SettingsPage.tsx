import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [lowMedQuantile, setLowMedQuantile] = useState("0.50");
  const [medHighQuantile, setMedHighQuantile] = useState("0.80");
  const [recentWindow, setRecentWindow] = useState("30");
  const [referenceWindow, setReferenceWindow] = useState("180");

  const handleSaveThresholds = () => {
    toast({ title: "Thresholds saved (mock)", description: `Low/Med: ${lowMedQuantile}, Med/High: ${medHighQuantile}` });
  };

  const handleSaveWindows = () => {
    toast({ title: "Windows saved (mock)", description: `Recent: ${recentWindow}d, Reference: ${referenceWindow}d` });
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries();
    toast({ title: "Triggered data refresh (demo)", description: "All dashboard queries have been re-fetched." });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-xl">
      {/* Comment block */}
      <div className="animate-fade-up rounded-md border border-border bg-card p-4">
        <pre className="text-[10px] text-muted-foreground font-mono leading-relaxed whitespace-pre-wrap">
{`/* These settings control how volatility quantiles
   and window sizes are computed. In this demo they
   are stored in the UI, but the design matches a
   real admin panel backed by API endpoints. */`}
        </pre>
      </div>

      {/* Risk thresholds */}
      <SettingsSection title="Risk Thresholds" delay={50}>
        <div className="grid grid-cols-2 gap-4">
          <SettingsInput label="Low / Medium split (quantile)" value={lowMedQuantile} onChange={setLowMedQuantile} />
          <SettingsInput label="Medium / High split (quantile)" value={medHighQuantile} onChange={setMedHighQuantile} />
        </div>
        <div className="pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleSaveThresholds}
            className="border-primary/30 text-primary hover:bg-primary/10 hover:text-primary font-mono text-[10px] uppercase tracking-widest"
          >
            Save Thresholds
          </Button>
        </div>
      </SettingsSection>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Window Config</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Window lengths */}
      <SettingsSection title="Window Lengths" delay={100}>
        <div className="grid grid-cols-2 gap-4">
          <SettingsInput label="Recent window (days)" value={recentWindow} onChange={setRecentWindow} />
          <SettingsInput label="Reference window (days)" value={referenceWindow} onChange={setReferenceWindow} />
        </div>
        <div className="pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleSaveWindows}
            className="border-primary/30 text-primary hover:bg-primary/10 hover:text-primary font-mono text-[10px] uppercase tracking-widest"
          >
            Save Windows
          </Button>
        </div>
      </SettingsSection>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Manual</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Manual refresh */}
      <SettingsSection title="Manual Refresh" delay={150}>
        <p className="text-[10px] text-muted-foreground font-mono">Trigger a full data recomputation from the backend.</p>
        <Button
          size="sm"
          variant="outline"
          onClick={handleRefresh}
          className="gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary font-mono text-[10px] uppercase tracking-widest"
        >
          <RefreshCw className="h-3 w-3" />
          Trigger Refresh
        </Button>
      </SettingsSection>
    </div>
  );
}

function SettingsSection({ title, delay = 0, children }: { title: string; delay?: number; children: React.ReactNode }) {
  return (
    <div
      className="rounded-md border border-border bg-card p-5 space-y-4 animate-fade-up card-glow"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "backwards" }}
    >
      <h2 className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{title}</h2>
      {children}
    </div>
  );
}

function SettingsInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] text-muted-foreground font-mono">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="font-mono text-xs bg-background border-border focus:border-primary/50 h-8"
      />
    </div>
  );
}
