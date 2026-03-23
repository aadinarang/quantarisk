import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw } from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  const [lowMedQuantile, setLowMedQuantile] = useState("0.50");
  const [medHighQuantile, setMedHighQuantile] = useState("0.80");
  const [recentWindow, setRecentWindow] = useState("30");
  const [referenceWindow, setReferenceWindow] = useState("180");

  const handleSaveThresholds = () => {
    toast({ title: "Thresholds saved", description: `Low/Med: ${lowMedQuantile}, Med/High: ${medHighQuantile}` });
  };

  const handleSaveWindows = () => {
    toast({ title: "Windows saved", description: `Recent: ${recentWindow}d, Reference: ${referenceWindow}d` });
  };

  const handleRefresh = () => {
    toast({ title: "Refresh triggered", description: "Data refresh has been requested." });
    console.log("[Settings] Manual data refresh triggered");
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-xl">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Configure risk thresholds and window lengths</p>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        These settings control how volatility quantiles and windows are computed.
        For the capstone demo, they are stored in the app only, but the UI is designed to support backend persistence.
      </p>

      {/* Risk thresholds */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-5 animate-fade-in">
        <h2 className="text-sm font-medium text-foreground">Risk Thresholds</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Low / Medium split (quantile)</Label>
            <Input value={lowMedQuantile} onChange={(e) => setLowMedQuantile(e.target.value)} className="font-mono bg-muted border-border" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Medium / High split (quantile)</Label>
            <Input value={medHighQuantile} onChange={(e) => setMedHighQuantile(e.target.value)} className="font-mono bg-muted border-border" />
          </div>
        </div>
        <div className="pt-1">
          <Button size="sm" onClick={handleSaveThresholds}>Save Thresholds</Button>
        </div>
      </div>

      {/* Window lengths */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-5 animate-fade-in">
        <h2 className="text-sm font-medium text-foreground">Window Lengths</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Recent window (days)</Label>
            <Input value={recentWindow} onChange={(e) => setRecentWindow(e.target.value)} className="font-mono bg-muted border-border" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Reference window (days)</Label>
            <Input value={referenceWindow} onChange={(e) => setReferenceWindow(e.target.value)} className="font-mono bg-muted border-border" />
          </div>
        </div>
        <div className="pt-1">
          <Button size="sm" onClick={handleSaveWindows}>Save Windows</Button>
        </div>
      </div>

      {/* Manual refresh */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4 animate-fade-in">
        <h2 className="text-sm font-medium text-foreground">Manual Refresh</h2>
        <p className="text-xs text-muted-foreground">Trigger a full data recomputation from the backend.</p>
        <Button size="sm" variant="outline" onClick={handleRefresh} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Trigger data refresh
        </Button>
      </div>
    </div>
  );
}
