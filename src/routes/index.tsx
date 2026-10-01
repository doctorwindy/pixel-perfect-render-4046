import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ClipboardCheck, Command, Lock } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/vault/brand-logo";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "InfoVault · Your personal info, one click away" },
      {
        name: "description",
        content:
          "Store your personal details, education, experience and answers once, then copy any field in a click.",
      },
      { property: "og:title", content: "InfoVault · Your personal info, one click away" },
      {
        property: "og:description",
        content: "Store your details once, then copy any field in a click. Private to your account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: ClipboardCheck, title: "Copy anything", text: "One click per field, or select several and copy them together.", tint: "bg-tint-blue" },
  { icon: Command, title: "Search everything", text: "Press Ctrl/Cmd + K to find and copy any saved detail instantly.", tint: "bg-tint-purple" },
  { icon: Lock, title: "Private by default", text: "Your vault is yours alone, and sensitive fields stay hidden until revealed.", tint: "bg-tint-green" },
];

function Landing() {
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/overview" });
    });
  }, [navigate]);

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-5 py-8">
      <header className="flex items-center justify-between">
        <BrandLogo className="w-40 sm:w-48" />
        <Button asChild variant="secondary">
          <Link to="/auth">Sign in</Link>
        </Button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center py-16 text-center">
        <h1 className="max-w-2xl text-5xl font-bold leading-[1.05] tracking-[-0.03em] text-heading sm:text-6xl">
          Stop retyping yourself.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Keep your details, education, experience and answers in one private place, and copy any of them with a
          single click.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link to="/auth">Get started free</Link>
        </Button>

        <ul className="mt-16 grid w-full gap-4 text-left sm:grid-cols-3">
          {FEATURES.map((f) => (
            <li key={f.title} className="glass-slab p-5">
              <span className={`tint-tile mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${f.tint}`}>
                <f.icon className="h-5 w-5" />
              </span>
              <h2 className="font-semibold text-heading">{f.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
