import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
import { RefreshCw, Sun, Moon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { theme, toggle } = useTheme();
  const [lowMedQuantile, setLowMedQuantile] = useState("0.50");
  const [medHighQuantile, setMedHighQuantile] = useState("0.80");
  const [recentWindow, setRecentWindow] = useState("30");
  const [referenceWindow, setReferenceWindow] = useState("180");

  return (
    <div className="p-6 lg:p-8 space-y-5 max-w-xl">
      <p className="text-[10px] text-muted-foreground/50 leading-relaxed font-mono">
        /* Configuration for volatility quantiles and window sizes. Demo-only — in production these would persist via API. */
      </p>

      {/* Appearance */}
      <section className="rounded-md border border-border bg-card p-5 space-y-4">
        <h2 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Appearance</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {theme === "dark" ? <Moon className="h-4 w-4 text-muted-foreground" /> : <Sun className="h-4 w-4 text-muted-foreground" />}
            <span className="text-xs text-foreground">{theme === "dark" ? "Dark mode" : "Light mode"}</span>
          </div>
          <Switch checked={theme === "light"} onCheckedChange={toggle} />
        </div>
        <p className="text-[10px] text-muted-foreground/50">Toggle between dark and light interface themes.</p>
      </section>

      {/* Risk thresholds */}
      <section className="rounded-md border border-border bg-card p-5 space-y-4">
        <h2 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Risk Thresholds</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Low / Medium split</Label>
            <Input value={lowMedQuantile} onChange={(e) => setLowMedQuantile(e.target.value)} className="bg-secondary border-border text-sm font-mono h-8" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Medium / High split</Label>
            <Input value={medHighQuantile} onChange={(e) => setMedHighQuantile(e.target.value)} className="bg-secondary border-border text-sm font-mono h-8" />
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={() => toast({ title: "Thresholds saved (mock)" })} className="text-xs">
          Save Thresholds
        </Button>
      </section>

      {/* Window lengths */}
      <section className="rounded-md border border-border bg-card p-5 space-y-4">
        <h2 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Window Lengths</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Recent window (days)</Label>
            <Input value={recentWindow} onChange={(e) => setRecentWindow(e.target.value)} className="bg-secondary border-border text-sm font-mono h-8" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Reference window (days)</Label>
            <Input value={referenceWindow} onChange={(e) => setReferenceWindow(e.target.value)} className="bg-secondary border-border text-sm font-mono h-8" />
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={() => toast({ title: "Windows saved (mock)" })} className="text-xs">
          Save Windows
        </Button>
      </section>

      {/* Manual refresh */}
      <section className="rounded-md border border-border bg-card p-5 space-y-3">
        <h2 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Manual Refresh</h2>
        <p className="text-xs text-muted-foreground">Trigger a full data recomputation from the backend.</p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => { queryClient.invalidateQueries(); toast({ title: "Data refresh triggered" }); }}
          className="gap-1.5 text-xs"
        >
          <RefreshCw className="h-3 w-3" />
          Trigger Refresh
        </Button>
      </section>
    </div>
  );
}
