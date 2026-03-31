import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { api, auth } from "@/lib/api";

export default function AccountPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [driftAlerts, setDriftAlerts] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!auth.isLoggedIn()) {
        navigate("/login");
        return;
      }
      try {
        const me = await api.getMe();
        setName(me.name);
        setEmail(me.email);
        setEmailAlerts(Boolean(me.preferences?.emailAlerts));
        setDriftAlerts(Boolean(me.preferences?.driftAlerts));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load account";
        toast({ title: "Unable to load account", description: message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [navigate, toast]);

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      const me = await api.updateMe({ name, email });
      setName(me.name);
      setEmail(me.email);
      toast({ title: "Profile updated", description: "Your account details were saved." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save profile";
      toast({ title: "Profile update failed", description: message, variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setSavingPrefs(true);
      const me = await api.updatePreferences({ emailAlerts, driftAlerts });
      setEmailAlerts(Boolean(me.preferences?.emailAlerts));
      setDriftAlerts(Boolean(me.preferences?.driftAlerts));
      toast({ title: "Notification preferences saved" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save preferences";
      toast({ title: "Preferences update failed", description: message, variant: "destructive" });
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    toast({ title: "Signed out" });
    navigate("/login");
  };

  if (loading) {
    return <div className="p-6 lg:p-8 text-sm text-muted-foreground">Loading account...</div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-lg space-y-6">
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
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleSaveProfile} className="text-xs" disabled={savingProfile}>
            {savingProfile ? "Saving..." : "Save Profile"}
          </Button>
          <Button size="sm" variant="secondary" onClick={handleLogout} className="text-xs">
            Sign Out
          </Button>
        </div>
      </section>

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
        <Button size="sm" variant="outline" onClick={handleSaveNotifications} className="text-xs" disabled={savingPrefs}>
          {savingPrefs ? "Saving..." : "Save Preferences"}
        </Button>
      </section>

      <section className="rounded-md border border-border bg-card p-5 space-y-3">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Session</h2>
        <p className="text-xs text-muted-foreground">Your account is now backed by the API. Watchlist and alert state are tied to this signed-in user.</p>
      </section>
    </div>
  );
}
