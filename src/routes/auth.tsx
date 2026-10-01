import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, ChevronLeft, ClipboardCheck, LockKeyhole, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/vault/brand-logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { VaultLoadingSkeleton } from "@/components/vault/loading-skeleton";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in or create an account · InfoVault" },
      { name: "description", content: "Sign in to InfoVault or create your private account." },
      { property: "og:title", content: "Sign in or create an account · InfoVault" },
      { property: "og:description", content: "Access your private InfoVault or create an account." },
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

const AUTH_BENEFITS: ReadonlyArray<readonly [LucideIcon, string]> = [
  [ClipboardCheck, "Copy a single field or a selected group"],
  [Search, "Search every saved section from one place"],
  [LockKeyhole, "Keep saved information private to your account"],
];

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [entering, setEntering] = useState(false);
  const qc = useQueryClient();

  const enter = (session: Session | null) => {
    if (!session) return;
    setEntering(true);
    qc.setQueryData(["authenticated-user"], session.user);
    navigate({ to: "/overview" });
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => enter(data.session));
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") enter(session);
    });
    return () => data.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const switchMode = (next: "in" | "up") => {
    setMode(next);
    setError("");
    setSent(false);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const parsed = credSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your details");
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
        const { data: signed, error: err } = await supabase.auth.signInWithPassword(parsed.data);
        if (err) throw err;
        enter(signed.session);
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

  if (entering) return <VaultLoadingSkeleton />;

  return (
    <main className="auth-page relative min-h-screen overflow-hidden px-5 py-6 sm:px-8 lg:px-10">
      <div className="relative z-10 mx-auto flex max-w-7xl items-center justify-between">
        <Link to="/" aria-label="InfoVault home"><BrandLogo className="w-32 sm:w-36" /></Link>
        <Button asChild variant="ghost" size="sm"><Link to="/"><ChevronLeft /> Back home</Link></Button>
      </div>

      <div className="relative z-10 mx-auto grid min-h-[calc(100dvh-5rem)] max-w-6xl items-center gap-10 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-24 lg:py-14">
        <section className="hidden max-w-lg lg:block">
          <p className="text-sm font-semibold text-primary">Your information workspace</p>
          <h1 className="mt-4 text-5xl font-bold leading-[1.05] text-heading">Less retyping. More time for what matters.</h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">Open your vault to find, copy and manage the details you use across applications and forms.</p>
          <div className="mt-10 space-y-3">
            {AUTH_BENEFITS.map(([Icon, text]) => (
              <div key={text} className="flex items-center gap-4 rounded-xl border border-border/70 bg-card/45 p-4 backdrop-blur-xl">
                <span className="tint-tile grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-tint-blue"><Icon className="h-5 w-5" /></span>
                <p className="text-sm font-medium text-heading">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="auth-panel glass-pop mx-auto w-full max-w-md rounded-[1.75rem] p-6 sm:p-8 lg:max-w-lg lg:p-10">
          {sent ? (
            <div className="py-5 text-center">
              <span className="tint-tile mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-tint-green"><Check className="h-7 w-7" /></span>
              <h1 className="mt-6 text-3xl font-bold text-heading">Check your email</h1>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">We sent a confirmation link to <span className="font-semibold text-heading">{email}</span>. Open it, then sign in.</p>
              <Button className="mt-8 w-full" size="lg" variant="secondary" onClick={() => switchMode("in")}>Back to sign in</Button>
            </div>
          ) : (
            <>
              <div className="mb-7">
                <p className="text-sm font-semibold text-primary">{mode === "in" ? "Welcome back" : "A vault of your own"}</p>
                <h1 className="mt-2 text-3xl font-bold text-heading sm:text-4xl">{mode === "in" ? "Sign in to InfoVault" : "Create your account"}</h1>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{mode === "in" ? "Your saved information is waiting for you." : "Save the details you reuse and keep them close."}</p>
              </div>

              <div className="mb-6 grid grid-cols-2 rounded-xl bg-muted/80 p-1" aria-label="Choose account action">
                <button type="button" aria-pressed={mode === "in"} className={`h-9 rounded-lg text-sm font-semibold ${mode === "in" ? "bg-card text-heading shadow-sm" : "text-muted-foreground"}`} onClick={() => switchMode("in")}>Sign in</button>
                <button type="button" aria-pressed={mode === "up"} className={`h-9 rounded-lg text-sm font-semibold ${mode === "up" ? "bg-card text-heading shadow-sm" : "text-muted-foreground"}`} onClick={() => switchMode("up")}>Create account</button>
              </div>

              <Button type="button" variant="secondary" size="lg" className="w-full" onClick={google}>Continue with Google</Button>
              <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" /> or use email <span className="h-px flex-1 bg-border" /></div>
              <form onSubmit={submit} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" autoComplete={mode === "in" ? "current-password" : "new-password"} placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                {error ? <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</p> : null}
                <Button type="submit" size="lg" className="w-full" disabled={busy} aria-busy={busy}>{busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}</Button>
              </form>
              <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground"><LockKeyhole className="h-3.5 w-3.5 text-primary" /> Your vault is private to your account.</p>
            </>
          )}
        </section>
      </div>
      <Toaster position="top-center" />
    </main>
  );
}