import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in · InfoVault" },
      { name: "description", content: "Sign in or create your private InfoVault account." },
      { property: "og:title", content: "Sign in · InfoVault" },
      { property: "og:description", content: "Sign in or create your private InfoVault account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const credSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Use at least 8 characters").max(72),
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/overview" });
    });
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") navigate({ to: "/overview" });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const parsed = credSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    try {
      if (mode === "up") {
        const { error: err } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (err) throw err;
        setSent(true);
      } else {
        const { error: err } = await supabase.auth.signInWithPassword(parsed.data);
        if (err) throw err;
        navigate({ to: "/overview" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError("");
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (res.error) toast.error("Google sign-in didn't work. Please try again.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="glass-slab w-full max-w-sm p-7">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="tint-tile mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-tint-blue">
            <ShieldCheck className="h-7 w-7" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-heading">
            {sent ? "Check your email" : mode === "in" ? "Welcome back" : "Create your vault"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {sent
              ? `We sent a confirmation link to ${email}. Open it, then sign in.`
              : "Your private space to store and copy your details."}
          </p>
        </div>

        {sent ? (
          <Button
            className="w-full"
            variant="secondary"
            onClick={() => {
              setSent(false);
              setMode("in");
            }}
          >
            Back to sign in
          </Button>
        ) : (
          <>
            <Button type="button" variant="secondary" size="lg" className="w-full" onClick={google}>
              Continue with Google
            </Button>
            <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
            </div>
            <form onSubmit={submit} className="space-y-3" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete={mode === "in" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error ? (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              ) : null}
              <Button type="submit" size="lg" className="w-full" disabled={busy}>
                {busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              {mode === "in" ? "New here?" : "Already have an account?"}{" "}
              <button
                type="button"
                className="font-semibold text-primary hover:underline"
                onClick={() => {
                  setMode(mode === "in" ? "up" : "in");
                  setError("");
                }}
              >
                {mode === "in" ? "Create an account" : "Sign in"}
              </button>
            </p>
          </>
        )}
      </div>
      <Toaster position="top-center" />
    </div>
  );
}
