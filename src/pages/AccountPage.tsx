import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

export default function AccountPage() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [driftAlerts, setDriftAlerts] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        const user = await api.getMe();
        if (!mounted) return;

        setName(user.name ?? "");
        setEmail(user.email ?? "");
        setEmailAlerts(Boolean(user.preferences?.emailAlerts));
        setDriftAlerts(Boolean(user.preferences?.driftAlerts));
      } catch (error) {
        if (!mounted) return;

        toast({
          title: "Failed to load account",
          description: error instanceof Error ? error.message : "Could not load profile data.",
          variant: "destructive",
        });
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [toast]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);

    try {
      const user = await api.updateMe({
        name: name.trim(),
        email: email.trim(),
      });

      setName(user.name ?? "");
      setEmail(user.email ?? "");

      toast({
        title: "Profile updated",
        description: "Your account details have been saved.",
      });
    } catch (error) {
      toast({
        title: "Failed to save profile",
        description: error instanceof Error ? error.message : "Could not update your profile.",
        variant: "destructive",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSavingPrefs(true);

    try {
      const user = await api.updatePreferences({
        emailAlerts,
        driftAlerts,
      });

      setEmailAlerts(Boolean(user.preferences?.emailAlerts));
      setDriftAlerts(Boolean(user.preferences?.driftAlerts));

      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      toast({
        title: "Failed to save preferences",
        description: error instanceof Error ? error.message : "Could not update notification settings.",
        variant: "destructive",
      });
    } finally {
      setSavingPrefs(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-lg">
        <p className="text-sm text-muted-foreground">Loading account…</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-lg space-y-6">
      <section className="rounded-md border border-border bg-card p-5 space-y-4">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Profile
        </h2>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Display Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-secondary border-border text-sm h-8"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-secondary border-border text-sm h-8"
            />
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={handleSaveProfile}
          className="text-xs"
          disabled={savingProfile}
        >
          {savingProfile ? "Saving..." : "Save Profile"}
        </Button>
      </section>

      <section className="rounded-md border border-border bg-card p-5 space-y-4">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Notifications
        </h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <Label className="text-xs text-muted-foreground">
              Email alerts for risk changes
            </Label>
            <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
          </div>

          <div className="flex items-center justify-between gap-4">
            <Label className="text-xs text-muted-foreground">
              Drift detection alerts
            </Label>
            <Switch checked={driftAlerts} onCheckedChange={setDriftAlerts} />
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={handleSaveNotifications}
          className="text-xs"
          disabled={savingPrefs}
        >
          {savingPrefs ? "Saving..." : "Save Preferences"}
        </Button>
      </section>

      <section className="rounded-md border border-destructive/20 bg-card p-5 space-y-3">
        <h2 className="text-xs font-medium text-destructive uppercase tracking-wide">
          Danger Zone
        </h2>
        <p className="text-xs text-muted-foreground">
          Permanently delete your account and all associated data.
        </p>
        <Button
          size="sm"
          variant="destructive"
          onClick={() =>
            toast({
              title: "Not available yet",
              description: "Account deletion is not wired up in the frontend yet.",
            })
          }
          className="text-xs"
        >
          Delete Account
        </Button>
      </section>
    </div>
  );
}