import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  ClipboardCheck,
  Command,
  Copy,
  FileText,
  GraduationCap,
  KeyRound,
  LockKeyhole,
  MoreHorizontal,
  Search,
  ShieldCheck,
  User,
  UserRound,
} from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/vault/brand-logo";
import { SectionIcon } from "@/components/vault/basics";
import { NAV } from "@/lib/schema";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "InfoVault · Your personal information, ready to copy" },
      {
        name: "description",
        content:
          "Keep your personal details, education, experience and application answers organized, private and ready to copy.",
      },
      { property: "og:title", content: "InfoVault · Your personal information, ready to copy" },
      {
        property: "og:description",
        content: "Store your information once, then find and copy any field when you need it.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Landing,
});

const VAULT_GROUPS = [
  { icon: UserRound, label: "Personal", detail: "Contact details & links", tint: "bg-tint-blue" },
  { icon: GraduationCap, label: "Education", detail: "Degrees, schools & tests", tint: "bg-tint-purple" },
  { icon: BriefcaseBusiness, label: "Experience", detail: "Roles, skills & projects", tint: "bg-tint-orange" },
  { icon: FileText, label: "Applications", detail: "Answers & cover letters", tint: "bg-tint-green" },
];

const STEPS = [
  ["01", "Save it once", "Add the details you repeatedly enter into forms, applications and profiles."],
  ["02", "Find it fast", "Open a section or search your whole vault without digging through documents."],
  ["03", "Copy what you need", "Copy one field or select a group, then paste it wherever it belongs."],
] as const;

const PREVIEW_FIELDS = [
  ["Full name", "Maya Chen"],
  ["Email", "maya.chen@example.com"],
  ["Phone", "+1 415 555 0142"],
] as const;

function CopyButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      aria-label={`Copy ${label}`}
      className="landing-copy-control grid h-8 w-8 shrink-0 place-items-center rounded-lg text-primary"
    >
      <ClipboardCheck className="h-4 w-4" />
    </button>
  );
}

const DEVICE_FIELDS: ReadonlyArray<readonly [string, string]> = [
  ["Full name", "Maya Chen"],
  ["Preferred name", "Maya"],
  ["Email", "maya.chen@example.com"],
  ["Phone", "+1 415 555 0142"],
  ["Professional headline", "Product designer"],
  ["City", "San Francisco"],
  ["Nationality", "American"],
  ["Date of birth", "••••••••"],
];
const DEVICE_TABS = ["overview", "personal", "education", "experience"] as const;

function DeviceStatusBar() {
  return (
    <div className="relative z-10 flex h-11 shrink-0 items-center justify-between bg-card px-7 text-[13px] font-semibold text-heading">
      <span className="tabular-nums">9:41</span>
      <span className="flex items-center gap-1.5">
        <span className="flex items-end gap-[2px]">
          {[4, 6, 8, 10].map((h) => <span key={h} className="w-[3px] rounded-sm bg-heading" style={{ height: h }} />)}
        </span>
        <span className="h-2.5 w-5 rounded-[3px] border border-heading/70 p-[1px]"><span className="block h-full w-3/4 rounded-[1px] bg-heading" /></span>
      </span>
    </div>
  );
}

function DeviceAppScreen({ tablet = false }: { tablet?: boolean }) {
  const tabs = DEVICE_TABS.map((id) => NAV.find((n) => n.id === id)).filter((n): n is NonNullable<typeof n> => Boolean(n));
  return (
    <div className="relative flex min-h-0 flex-1 flex-col text-left">
      <div className="flex shrink-0 items-center gap-3 border-b border-border/60 bg-card px-4 py-2.5 shadow-sm">
        <BrandLogo className={tablet ? "w-20 shrink-0" : "w-16 shrink-0"} />
        <div className="flex h-8 flex-1 items-center gap-2 rounded-xl bg-card px-3 text-xs text-muted-foreground ring-1 ring-border/70">
          <Search className="h-3.5 w-3.5" /> Search everything
          {tablet ? <kbd className="ml-auto rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd> : null}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden px-4 pt-5">
        <div className="flex items-center gap-3">
          <SectionIcon icon={User} tint="teal" size="lg" className="h-12 w-12 [&>svg]:h-6 [&>svg]:w-6" />
          <div className="min-w-0">
            <p className="text-3xl font-extrabold leading-none tracking-[-0.03em] text-heading">Personal</p>
            <p className="mt-1 text-[11px] leading-snug text-muted-foreground">Click the pencil to edit a field. Sensitive fields stay hidden until you reveal them.</p>
          </div>
        </div>
        <div className={`glass-press mt-3 flex h-9 items-center justify-center gap-2 rounded-xl bg-card text-xs font-semibold text-heading shadow-sm ring-1 ring-border/60 ${tablet ? "w-36" : "w-full"}`}>
          <Copy className="h-3.5 w-3.5" /> Copy summary
        </div>
        <div className="mt-4 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/60">
          <p className="text-xs font-semibold text-muted-foreground">Identity</p>
          <div className={`mt-2 grid gap-x-4 gap-y-3 ${tablet ? "grid-cols-2" : "grid-cols-1"}`}>
            {DEVICE_FIELDS.map(([label, value]) => (
              <div key={label} className="flex min-w-0 items-center gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium text-heading">{label}</p>
                  <p className="truncate text-[13px] text-foreground tabular-nums">{value}</p>
                </div>
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-primary"><Copy className="h-3.5 w-3.5" /></span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={`glass-bar absolute inset-x-0 bottom-0 grid grid-cols-5 border-t px-2 pt-1.5 ${tablet ? "pb-2" : "pb-5"}`}>
        {tabs.map((n) => (
          <div key={n.id} className={`flex flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-medium ${n.id === "personal" ? "glass-nav-active text-primary" : "text-foreground/80"}`}>
            <SectionIcon icon={n.icon} tint={n.tint} size="sm" className="h-6 w-6 [&>svg]:h-3.5 [&>svg]:w-3.5" />
            <span className="max-w-full truncate">{n.short ?? n.label}</span>
          </div>
        ))}
        <div className="flex flex-col items-center gap-1 px-1 py-1.5 text-[10px] font-medium text-foreground/80">
          <span className="grid h-6 w-6 place-items-center rounded-lg bg-muted"><MoreHorizontal className="h-3.5 w-3.5" /></span>
          More
        </div>
      </div>
    </div>
  );
}

function PreviewFields({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "mt-3 space-y-2" : "mt-5 space-y-3"}>
      {PREVIEW_FIELDS.map(([label, value], index) => (
        <div key={label} className={`vault-field flex items-center gap-3 rounded-xl bg-card/70 shadow-sm ring-1 ring-border/70 ${compact ? "p-2.5" : "p-3"}`}>
          <span className={`h-8 w-1 rounded-full ${index === 0 ? "bg-primary" : index === 1 ? "bg-tint-purple" : "bg-tint-green"}`} />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
            <p className="truncate text-sm font-semibold text-heading">{value}</p>
          </div>
          <CopyButton label={label} />
        </div>
      ))}
    </div>
  );
}

function VaultPreview() {
  return (
    <div className="landing-hero-visual relative mx-auto w-full min-w-0 max-w-2xl" aria-label="Example InfoVault screen">
      <div className="vault-orbit vault-orbit-outer" aria-hidden="true" />
      <div className="vault-orbit vault-orbit-inner" aria-hidden="true" />

      <div className="floating-record floating-record-personal" aria-hidden="true">
        <span className="tint-tile grid h-9 w-9 place-items-center rounded-xl bg-tint-blue"><UserRound className="h-4 w-4" /></span>
        <span><b>Personal</b><small>8 details ready</small></span>
        <Check className="ml-auto h-4 w-4 text-success" />
      </div>
      <div className="floating-record floating-record-secure" aria-hidden="true">
        <span className="tint-tile grid h-9 w-9 place-items-center rounded-xl bg-tint-green"><ShieldCheck className="h-4 w-4" /></span>
        <span><b>Account protected</b><small>Private by default</small></span>
      </div>
      <div className="floating-copy-path" aria-hidden="true">
        <span className="copy-path-dot" />
        <span className="copy-path-line" />
        <span className="copy-path-chip"><ClipboardCheck className="h-3.5 w-3.5" /> Ready to paste</span>
      </div>

      {/* Phone mockup (small screens) */}
      <div className="landing-vault-preview relative z-10 mx-auto w-full max-w-[22rem] md:hidden">
        <div className="device-bezel relative rounded-[3.4rem] p-3">
          <div className="relative flex aspect-[9/19.5] flex-col overflow-hidden rounded-[2.7rem] bg-background">
            <div className="device-island absolute left-1/2 top-3 z-20 h-7 w-28 -translate-x-1/2 rounded-full" />
            <DeviceStatusBar />
            <DeviceAppScreen />
            <div className="absolute bottom-2 left-1/2 z-20 h-1 w-28 -translate-x-1/2 rounded-full bg-heading/80" />
          </div>
        </div>
      </div>

      {/* Tablet mockup (medium screens) */}
      <div className="landing-vault-preview relative z-10 mx-auto hidden w-full max-w-[38rem] md:block lg:hidden">
        <div className="device-bezel relative rounded-[2.6rem] p-4">
          <div className="relative flex aspect-[3/4] flex-col overflow-hidden rounded-[1.8rem] bg-background">
            <DeviceStatusBar />
            <DeviceAppScreen tablet />
          </div>
        </div>
      </div>

      {/* Desktop browser window (large screens) */}
      <div className="landing-vault-preview relative z-10 mx-auto hidden w-[92%] max-w-xl lg:block">
        <div className="landing-preview-backdrop absolute inset-x-8 -top-5 h-full rounded-[1.75rem]" />
        <div className="vault-frame relative rounded-[1.9rem] p-1.5">
          <div className="glass-pop relative overflow-hidden rounded-[1.55rem]">
            <div className="flex items-center gap-2 border-b border-border/70 px-5 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-tint-red" />
              <span className="h-2.5 w-2.5 rounded-full bg-tint-yellow" />
              <span className="h-2.5 w-2.5 rounded-full bg-tint-green" />
              <div className="ml-2 flex h-8 flex-1 items-center gap-2 rounded-lg bg-muted/80 px-3 text-xs text-muted-foreground">
                <Search className="h-3.5 w-3.5" /> Search your vault
                <kbd className="ml-auto rounded-md border border-border bg-card/70 px-1.5 py-0.5 font-mono text-[10px]">⌘ K</kbd>
              </div>
            </div>
            <div className="grid min-h-[22rem] grid-cols-[9.5rem_minmax(0,1fr)]">
              <aside className="border-r border-border/70 bg-sidebar/55 p-4">
                <BrandLogo compact className="h-8 w-8" />
                <div className="mt-6 space-y-2">
                  {VAULT_GROUPS.slice(0, 4).map((group, index) => (
                    <div
                      key={group.label}
                      className={`flex items-center gap-2 rounded-lg p-2 ${index === 0 ? "glass-nav-active text-primary" : "text-muted-foreground"}`}
                    >
                      <group.icon className="h-4 w-4 shrink-0" />
                      <span className="text-xs font-medium">{group.label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-xl bg-primary/10 p-3">
                  <KeyRound className="h-4 w-4 text-primary" />
                  <p className="mt-2 text-[10px] font-semibold text-heading">Your private space</p>
                </div>
              </aside>
              <div className="p-6">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-primary">Personal</p>
                    <h2 className="mt-1 text-2xl font-bold text-heading">Ready when you need it</h2>
                  </div>
                  <span className="text-xs text-muted-foreground">3 saved fields</span>
                </div>
                <PreviewFields />
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-primary/10 p-3 text-xs font-medium text-primary">
                  <Check className="h-4 w-4" /> Everything in one place
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="floating-record floating-record-education" aria-hidden="true">
        <span className="tint-tile grid h-9 w-9 place-items-center rounded-xl bg-tint-purple"><GraduationCap className="h-4 w-4" /></span>
        <span><b>Education</b><small>Degree copied</small></span>
        <ClipboardCheck className="ml-auto h-4 w-4 text-primary" />
      </div>
    </div>
  );
}

function Landing() {
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/overview" });
    });
  }, [navigate]);

  return (
    <div className="landing-page min-h-screen overflow-hidden">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-card focus:px-4 focus:py-2 focus:text-foreground focus:shadow-glass">
        Skip to content
      </a>
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <Link to="/" aria-label="InfoVault home">
          <BrandLogo className="w-32 sm:w-36" />
        </Link>
        <nav className="flex items-center gap-1.5" aria-label="Account">
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button asChild>
            <Link to="/auth">Create your vault</Link>
          </Button>
        </nav>
      </header>

      <main id="main-content">
        <section className="landing-hero relative w-full overflow-x-clip mx-auto grid min-h-[calc(100dvh-5rem)] max-w-7xl grid-cols-1 items-center gap-14 px-5 pb-24 pt-14 sm:px-8 lg:place-items-center lg:px-10 lg:pb-24 lg:pt-8">
          <div className="relative z-10 min-w-0 max-w-xl vault-arrive lg:max-w-4xl lg:text-center">
            <h1 className="text-5xl font-bold leading-[1.02] text-heading sm:text-6xl lg:text-8xl">
              Every detail. <span className="text-primary">Exactly where you need it.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground sm:text-xl lg:mx-auto lg:max-w-2xl">
              Keep the details you use across forms and applications in one organized place. Find them fast, then copy exactly what you need.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:justify-center">
              <Button asChild size="lg">
                <Link to="/auth">Get started free <ArrowRight /></Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <a href="#how-it-works">See how it works</a>
              </Button>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">No payment details required. Your saved information stays tied to your account.</p>
          </div>
          <div className="min-w-0 lg:hidden">
            <VaultPreview />
          </div>
        </section>

        <DepthShowcase />

        <section className="border-y border-border/70 bg-card/30 py-20 sm:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start lg:gap-20 lg:px-10">
            <div className="lg:sticky lg:top-24">
              <p className="text-sm font-semibold text-primary">One place for the recurring details</p>
              <h2 className="mt-3 text-3xl font-bold leading-tight text-heading sm:text-5xl">Organized like you already think.</h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
                Separate sections keep everything easy to scan—from contact details to the answers you reuse in applications.
              </p>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {VAULT_GROUPS.map((group, index) => (
                <li key={group.label} className={`glass-slab p-5 sm:p-6 ${index % 2 ? "sm:translate-y-8" : ""}`}>
                  <span className={`tint-tile grid h-11 w-11 place-items-center rounded-xl ${group.tint}`}><group.icon className="h-5 w-5" /></span>
                  <h3 className="mt-5 text-lg font-semibold text-heading">{group.label}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{group.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-primary">A shorter path from memory to form</p>
            <h2 className="mt-3 text-3xl font-bold text-heading sm:text-5xl">Save once. Stop searching.</h2>
          </div>
          <ol className="mt-12 grid border-y border-border/70 sm:grid-cols-3">
            {STEPS.map(([number, title, text], index) => (
              <li key={number} className={`py-7 sm:px-7 sm:py-9 ${index ? "border-t border-border/70 sm:border-l sm:border-t-0" : ""}`}>
                <span className="font-mono text-sm font-semibold text-primary">{number}</span>
                <h3 className="mt-7 text-xl font-semibold text-heading">{title}</h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="pb-20 sm:pb-28">
          <div className="mx-auto grid max-w-7xl gap-6 px-5 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-10">
            <article className="glass-slab overflow-hidden p-6 sm:p-9">
              <div className="flex items-center gap-3 text-primary"><Command className="h-5 w-5" /><span className="text-sm font-semibold">Quick search</span></div>
              <h2 className="mt-6 max-w-lg text-3xl font-bold text-heading sm:text-4xl">Every saved detail is a few keystrokes away.</h2>
              <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">Search your whole vault, jump straight to a section, and copy without breaking your flow.</p>
              <div className="mt-9 rounded-2xl border border-border/70 bg-card/70 p-3 shadow-inset-input">
                <div className="flex items-center gap-3 px-2 py-1 text-muted-foreground"><Search className="h-4 w-4" /><span className="text-sm">Search email, degree, skills…</span><kbd className="ml-auto rounded-md border border-border bg-muted px-2 py-1 font-mono text-xs">⌘ K</kbd></div>
                <div className="mt-3 flex items-center gap-3 rounded-xl bg-primary/10 p-3 text-sm"><span className="tint-tile grid h-8 w-8 place-items-center rounded-lg bg-tint-blue"><UserRound className="h-4 w-4" /></span><span className="font-medium text-heading">Personal · Email</span><span className="ml-auto text-xs font-semibold text-primary">Copy</span></div>
              </div>
            </article>
            <article className="glass-slab flex flex-col justify-between p-6 sm:p-9">
              <div>
                <div className="flex items-center gap-3 text-primary"><LockKeyhole className="h-5 w-5" /><span className="text-sm font-semibold">Private by default</span></div>
                <h2 className="mt-6 text-3xl font-bold text-heading sm:text-4xl">Only your account opens your vault.</h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">Every saved item is restricted to its owner. Sensitive fields stay concealed until you choose to reveal them.</p>
              </div>
              <ul className="mt-10 space-y-3 text-sm font-medium text-heading">
                {["Account-only access", "Sensitive values remain hidden", "Copy history stores labels, not values"].map((item) => <li key={item} className="flex items-center gap-3"><span className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-primary"><Check className="h-3.5 w-3.5" /></span>{item}</li>)}
              </ul>
            </article>
          </div>
        </section>

        <section className="border-t border-border/70 bg-card/30 py-20 sm:py-28">
          <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
            <BrandLogo compact className="mx-auto h-14 w-14" />
            <h2 className="mt-7 text-4xl font-bold text-heading sm:text-5xl">Type it once. Keep it ready.</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">Create your private vault and make repetitive forms a little less repetitive.</p>
            <Button asChild size="lg" className="mt-8"><Link to="/auth">Create your vault <ArrowRight /></Link></Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/70">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-7 text-sm text-muted-foreground sm:flex-row sm:px-8 lg:px-10">
          <BrandLogo className="w-28" />
          <p>Personal information, organized and ready to copy.</p>
          <Link to="/auth" className="font-semibold text-primary">Sign in</Link>
        </div>
      </footer>
    </div>
  );
}
