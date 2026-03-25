import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export default function AccountPage() {
  const { toast } = useToast();
  const [name, setName] = useState("Demo User");
  const [email, setEmail] = useState("demo@quantarisk.io");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [driftAlerts, setDriftAlerts] = useState(true);

  const handleSaveProfile = () => {
    toast({ title: "Profile updated (demo)", description: `Name: ${name}` });
  };

  const handleSaveNotifications = () => {
    toast({ title: "Notification preferences saved (demo)" });
  };

  return (
    <div className="p-6 lg:p-8 max-w-lg space-y-6">
      {/* Profile */}
      <section className="rounded-md border border-border bg-card p-5 space-y-4">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Profile</h2>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Display Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-secondary border-border text-sm h-8" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} className="bg-secondary border-border text-sm h-8" />
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={handleSaveProfile} className="text-xs">
          Save Profile
        </Button>
      </section>

      {/* Notifications */}
      <section className="rounded-md border border-border bg-card p-5 space-y-4">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Notifications</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Email alerts for risk changes</Label>
            <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Drift detection alerts</Label>
            <Switch checked={driftAlerts} onCheckedChange={setDriftAlerts} />
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={handleSaveNotifications} className="text-xs">
          Save Preferences
        </Button>
      </section>

      {/* Danger zone */}
      <section className="rounded-md border border-destructive/20 bg-card p-5 space-y-3">
        <h2 className="text-xs font-medium text-destructive uppercase tracking-wide">Danger Zone</h2>
        <p className="text-xs text-muted-foreground">Permanently delete your account and all associated data.</p>
        <Button size="sm" variant="destructive" onClick={() => toast({ title: "Account deletion is disabled in demo mode" })} className="text-xs">
          Delete Account
        </Button>
      </section>
    </div>
  );
}
