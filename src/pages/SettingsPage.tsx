import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
import { RefreshCw, Sun, Moon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

function isValidNumberString(value: string) {
  const n = Number(value);
  return Number.isFinite(n);
}

export default function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { theme, toggle } = useTheme();

  const [lowMedQuantile, setLowMedQuantile] = useState("0.50");
  const [medHighQuantile, setMedHighQuantile] = useState("0.80");
  const [recentWindow, setRecentWindow] = useState("30");
  const [referenceWindow, setReferenceWindow] = useState("180");
  const [refreshing, setRefreshing] = useState(false);

  const handleSaveThresholds = () => {
    const low = Number(lowMedQuantile);
    const high = Number(medHighQuantile);

    if (!isValidNumberString(lowMedQuantile) || !isValidNumberString(medHighQuantile)) {
      toast({
        title: "Invalid threshold values",
        description: "Both threshold values must be valid numbers.",
        variant: "destructive",
      });
      return;
    }

    if (low <= 0 || high <= 0 || low >= 1 || high >= 1) {
      toast({
        title: "Thresholds out of range",
        description: "Thresholds must be between 0 and 1.",
        variant: "destructive",
      });
      return;
    }

    if (low >= high) {
      toast({
        title: "Invalid threshold order",
        description: "Low/Medium split must be less than Medium/High split.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Not connected yet",
      description: "Threshold settings are validated in the UI, but not persisted because no backend endpoint is wired for them yet.",
    });
  };

  const handleSaveWindows = () => {
    const recent = Number(recentWindow);
    const reference = Number(referenceWindow);

    if (!isValidNumberString(recentWindow) || !isValidNumberString(referenceWindow)) {
      toast({
        title: "Invalid window values",
        description: "Both window lengths must be valid numbers.",
        variant: "destructive",
      });
      return;
    }

    if (!Number.isInteger(recent) || !Number.isInteger(reference) || recent <= 0 || reference <= 0) {
      toast({
        title: "Invalid window lengths",
        description: "Window lengths must be positive whole numbers.",
        variant: "destructive",
      });
      return;
    }

    if (recent >= reference) {
      toast({
        title: "Invalid window order",
        description: "Recent window should be smaller than reference window.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Not connected yet",
      description: "Window settings are validated in the UI, but not persisted because no backend endpoint is wired for them yet.",
    });
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await queryClient.invalidateQueries();
      toast({
        title: "Data refresh triggered",
        description: "Cached frontend data has been invalidated and will refetch.",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: error instanceof Error ? error.message : "Could not trigger refresh.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-5 max-w-xl">
      <p className="text-[10px] text-muted-foreground/50 leading-relaxed font-mono">
        Appearance is live. Manual refresh is live. Risk thresholds and window lengths are UI-only until a backend settings endpoint is added.
      </p>

      <section className="rounded-md border border-border bg-card p-5 space-y-4">
        <h2 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          Appearance
        </h2>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {theme === "dark" ? (
              <Moon className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Sun className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-xs text-foreground">
              {theme === "dark" ? "Dark mode" : "Light mode"}
            </span>
          </div>
          <Switch checked={theme === "light"} onCheckedChange={toggle} />
        </div>

        <p className="text-[10px] text-muted-foreground/50">
          Toggle between dark and light interface themes.
        </p>
      </section>

      <section className="rounded-md border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Risk Thresholds
          </h2>
          <span className="text-[10px] text-amber-500 font-mono">UI only</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Low / Medium split
            </Label>
            <Input
              value={lowMedQuantile}
              onChange={(e) => setLowMedQuantile(e.target.value)}
              className="bg-secondary border-border text-sm font-mono h-8"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Medium / High split
            </Label>
            <Input
              value={medHighQuantile}
              onChange={(e) => setMedHighQuantile(e.target.value)}
              className="bg-secondary border-border text-sm font-mono h-8"
            />
          </div>
        </div>

        <Button size="sm" variant="outline" onClick={handleSaveThresholds} className="text-xs">
          Validate Thresholds
        </Button>
      </section>

      <section className="rounded-md border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Window Lengths
          </h2>
          <span className="text-[10px] text-amber-500 font-mono">UI only</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Recent window (days)
            </Label>
            <Input
              value={recentWindow}
              onChange={(e) => setRecentWindow(e.target.value)}
              className="bg-secondary border-border text-sm font-mono h-8"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Reference window (days)
            </Label>
            <Input
              value={referenceWindow}
              onChange={(e) => setReferenceWindow(e.target.value)}
              className="bg-secondary border-border text-sm font-mono h-8"
            />
          </div>
        </div>

        <Button size="sm" variant="outline" onClick={handleSaveWindows} className="text-xs">
          Validate Windows
        </Button>
      </section>

      <section className="rounded-md border border-border bg-card p-5 space-y-3">
        <h2 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          Manual Refresh
        </h2>
        <p className="text-xs text-muted-foreground">
          Trigger a full frontend refetch using React Query.
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={handleRefresh}
          className="gap-1.5 text-xs"
          disabled={refreshing}
        >
          <RefreshCw className="h-3 w-3" />
          {refreshing ? "Refreshing..." : "Trigger Refresh"}
        </Button>
      </section>
    </div>
  );
}