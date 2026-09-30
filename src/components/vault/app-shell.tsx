import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Copy, LogOut, MoreHorizontal, Search, ShieldCheck, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { supabase } from "@/integrations/supabase/client";
import { NAV, type NavDef } from "@/lib/schema";
import { applyTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { useVault } from "@/lib/vault-context";
import { SectionIcon } from "./basics";
import { CommandPalette } from "./command-palette";
import { OnboardingDialog } from "./onboarding";

const MOBILE_PRIMARY = ["overview", "personal", "education", "experience"];

function NavLink({ n, onNavigate, compact }: { n: NavDef; onNavigate?: () => void; compact?: boolean }) {
  const { pathname } = useLocation();
  const active = pathname === n.path || pathname.startsWith(`${n.path}/`);
  return (
    <Link
      to={n.path as "/overview"}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium active:scale-[0.97] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring",
        active ? "glass-nav-active text-primary" : "text-foreground/80 hover:bg-accent",
        compact && "flex-col gap-1 px-1 py-1.5 text-xs",
      )}
    >
      <SectionIcon icon={n.icon} tint={n.tint} size="sm" className={compact ? "h-7 w-7" : ""} />
      <span>{n.short ?? n.label}</span>
    </Link>
  );
}

function SelectionBar() {
  const v = useVault();
  const count = v.selected.length;
  const lastCount = useRef(count);
  if (count) lastCount.current = count;
  return (
    <div
      role="region"
      aria-label="Selected fields"
      aria-hidden={!count}
      inert={!count}
      data-visible={count > 0}
      className="glass-pop selection-bar fixed inset-x-3 bottom-24 z-40 mx-auto flex max-w-md items-center gap-2 rounded-2xl p-2 pl-4 lg:bottom-6"
    >
      <span className="flex-1 text-sm font-semibold">{count || lastCount.current} selected</span>
      <Button size="sm" onClick={() => v.copySelected()}>
        <Copy /> Copy
      </Button>
      <Button size="icon" variant="ghost" aria-label="Clear selection" className="h-9 w-9" onClick={v.clearSelection}>
        <X />
      </Button>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const v = useVault();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [more, setMore] = useState(false);
  const { pathname } = useLocation();
  const theme = v.vault.profile.settings.theme;

  useEffect(() => {
    applyTheme(theme);
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const h = () => applyTheme("system");
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, [theme]);

  useEffect(() => {
    v.clearSelection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const signOut = async () => {
    await supabase.auth.signOut();
    qc.clear();
    navigate({ to: "/auth" });
  };

  const name = v.vault.profile.display_name || v.user.email?.split("@")[0] || "You";
  const primary = NAV.filter((n) => MOBILE_PRIMARY.includes(n.id));
  const rest = NAV.filter((n) => !MOBILE_PRIMARY.includes(n.id));

  return (
    <div className="min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-card focus:px-3 focus:py-2"
      >
        Skip to content
      </a>

      <aside className="glass-bar fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r p-4 lg:flex">
        <Link to="/overview" className="mb-5 flex items-center gap-2.5 px-1.5">
          <span className="tint-tile inline-flex h-9 w-9 items-center justify-center rounded-xl bg-tint-blue">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-[-0.02em] text-heading">InfoVault</span>
        </Link>
        <nav aria-label="Sections" className="flex-1 space-y-0.5 overflow-y-auto">
          {NAV.map((n) => (
            <NavLink key={n.id} n={n} />
          ))}
        </nav>
        <p className="px-2 pt-3 text-xs text-muted-foreground">Press Ctrl/Cmd + K to search anything.</p>
      </aside>

      <div className="lg:pl-64">
        <div className="glass-bar sticky top-0 z-20 flex items-center gap-3 border-b px-4 py-2.5 lg:px-8">
          <Link to="/overview" className="flex items-center gap-2 lg:hidden">
            <span className="tint-tile inline-flex h-8 w-8 items-center justify-center rounded-lg bg-tint-blue">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <span className="font-bold text-heading">InfoVault</span>
          </Link>
          <Button
            type="button"
            onClick={() => v.setPaletteOpen(true)}
            variant="ghost"
            className="ml-auto flex h-10 w-full max-w-md items-center gap-2 rounded-lg bg-card/70 px-3 text-sm font-normal text-muted-foreground shadow-inset-input hover:text-foreground lg:ml-0"
            aria-label="Search everything"
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 text-left">Search everything</span>
            <kbd className="hidden rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium sm:inline">⌘K</kbd>
          </Button>
          <div className="hidden flex-1 lg:block" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                aria-label="Account menu"
                variant="ghost"
                size="icon"
                className="tint-tile inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tint-indigo text-sm font-bold"
              >
                {name.slice(0, 1).toUpperCase()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="truncate">{v.user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => navigate({ to: "/settings" })}>Settings</DropdownMenuItem>
              <DropdownMenuItem onSelect={signOut}>
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <main id="main" key={pathname} className="vault-arrive mx-auto max-w-5xl px-4 pb-32 pt-6 lg:px-8 lg:pb-16 lg:pt-8">
          {children}
        </main>
      </div>

      <nav
        aria-label="Primary"
        className="glass-bar fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 lg:hidden"
      >
        {primary.map((n) => (
          <NavLink key={n.id} n={n} compact />
        ))}
        <Button
          type="button"
          onClick={() => setMore(true)}
          variant="ghost"
          aria-label="More sections"
          className="flex h-auto flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-xs font-medium text-foreground/80"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-muted">
            <MoreHorizontal className="h-4 w-4" />
          </span>
          More
        </Button>
      </nav>

      <Drawer open={more} onOpenChange={setMore} shouldScaleBackground={false}>
        <DrawerContent className="glass-pop rounded-t-3xl px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <DrawerHeader>
            <DrawerTitle>More sections</DrawerTitle>
          </DrawerHeader>
          <div className="mt-4 grid grid-cols-2 gap-1">
            {rest.map((n) => (
              <NavLink key={n.id} n={n} onNavigate={() => setMore(false)} />
            ))}
          </div>
        </DrawerContent>
      </Drawer>

      <SelectionBar />
      <CommandPalette />
      <OnboardingDialog />
      <Toaster position="top-center" />
    </div>
  );
}
