import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const [lowMedQuantile, setLowMedQuantile] = useState("0.50");
  const [medHighQuantile, setMedHighQuantile] = useState("0.85");
  const [recentWindow, setRecentWindow] = useState("21");
  const [referenceWindow, setReferenceWindow] = useState("252");

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-xl">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Configure risk thresholds and window lengths</p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 space-y-5 animate-fade-in">
        <h2 className="text-sm font-medium text-foreground">Risk Thresholds</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Low → Medium Quantile</Label>
            <Input value={lowMedQuantile} onChange={(e) => setLowMedQuantile(e.target.value)} className="font-mono bg-muted border-border" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Medium → High Quantile</Label>
            <Input value={medHighQuantile} onChange={(e) => setMedHighQuantile(e.target.value)} className="font-mono bg-muted border-border" />
          </div>
        </div>

        <h2 className="text-sm font-medium text-foreground pt-2">Window Lengths</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Recent Window (days)</Label>
            <Input value={recentWindow} onChange={(e) => setRecentWindow(e.target.value)} className="font-mono bg-muted border-border" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Reference Window (days)</Label>
            <Input value={referenceWindow} onChange={(e) => setReferenceWindow(e.target.value)} className="font-mono bg-muted border-border" />
          </div>
        </div>

        <div className="pt-2">
          <Button size="sm">Save Settings</Button>
        </div>
      </div>
    </div>
  );
}
