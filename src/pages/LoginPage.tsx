import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const resetFormForModeSwitch = () => {
    setPassword("");
    setConfirmPassword("");
    setIsSignUp((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      toast({
        title: "Email is required",
        variant: "destructive",
      });
      return;
    }

    if (!password) {
      toast({
        title: "Password is required",
        variant: "destructive",
      });
      return;
    }

    if (isSignUp && password.length < 8) {
      toast({
        title: "Password too short",
        description: "Use at least 8 characters.",
        variant: "destructive",
      });
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure both password fields match.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      if (isSignUp) {
        await api.signup(trimmedEmail, password);
        toast({
          title: "Account created",
          description: "You are now signed in.",
        });
      } else {
        await api.login(trimmedEmail, password);
        toast({
          title: "Signed in",
          description: "Welcome back.",
        });
      }

      navigate("/", { replace: true });
    } catch (error) {
      toast({
        title: isSignUp ? "Sign up failed" : "Login failed",
        description: error instanceof Error ? error.message : "Request failed",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex w-1/2 border-r border-border bg-card/30 flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <span className="font-mono text-sm font-semibold text-foreground/70 tracking-widest uppercase">
            QuantaRisk
          </span>
        </div>

        <div className="space-y-6 max-w-sm">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-foreground leading-tight">
              Market risk intelligence,
              <br />
              clearly surfaced.
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Rolling volatility, risk classification, drift detection, alerts,
              watchlists, and predictive analytics in one dashboard.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-md border border-border bg-background/40 p-3">
              <p className="text-muted-foreground">Coverage</p>
              <p className="mt-1 font-mono text-foreground">Risk + Drift</p>
            </div>
            <div className="rounded-md border border-border bg-background/40 p-3">
              <p className="text-muted-foreground">Signals</p>
              <p className="mt-1 font-mono text-foreground">Alerts + Forecast</p>
            </div>
          </div>
        </div>

        <p className="text-[10px] font-mono text-muted-foreground/30 tracking-wide uppercase">
          Capstone platform
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-sm space-y-7">
          <div className="space-y-2">
            <div className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-md bg-primary/10 mb-2">
              <Activity className="h-5 w-5 text-primary" />
            </div>

            <h2 className="text-xl font-semibold text-foreground">
              {isSignUp ? "Create an account" : "Sign in"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isSignUp
                ? "Register a new QuantaRisk account."
                : "Enter your credentials to access the platform."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-muted-foreground">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-secondary border-border text-sm h-9"
                required
                autoComplete="email"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs text-muted-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-secondary border-border text-sm h-9"
                required
                minLength={8}
                autoComplete={isSignUp ? "new-password" : "current-password"}
                disabled={isSubmitting}
              />
            </div>

            {isSignUp && (
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs text-muted-foreground">
                  Confirm password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-secondary border-border text-sm h-9"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  disabled={isSubmitting}
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting
                ? "Please wait..."
                : isSignUp
                  ? "Create account"
                  : "Sign in"}
            </Button>
          </form>

          <div className="text-sm text-muted-foreground">
            {isSignUp ? "Already have an account?" : "Need an account?"}{" "}
            <button
              type="button"
              onClick={resetFormForModeSwitch}
              className="text-primary hover:underline"
              disabled={isSubmitting}
            >
              {isSignUp ? "Sign in" : "Create one"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}