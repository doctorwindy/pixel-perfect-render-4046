import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Copy,
  FileText,
  FolderOpen,
  GraduationCap,
  Link2,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const MOTION_OK = "(prefers-reduced-motion: no-preference)";

function register() {
  if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);
}

/* ---------------------------------------------------------------- */
/* Thin scroll progress line at the very top of the page             */
/* ---------------------------------------------------------------- */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    register();
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      gsap.fromTo(
        bar.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: document.documentElement, start: "top top", end: "bottom bottom", scrub: 0.2 },
        },
      );
    });
    return () => mm.revert();
  });
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px]" aria-hidden="true">
      <div ref={bar} className="h-full origin-left scale-x-0 bg-primary" />
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Hero headline: words rise out of a mask, one after another        */
/* ---------------------------------------------------------------- */
export function HeroHeading({ className }: { className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from(".hero-word", { yPercent: 115, duration: 1.1, ease: "expo.out", stagger: 0.07, delay: 0.05 });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  const word = (text: string, accent: boolean, key: string) => (
    <span key={key} className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
      <span className={cn("hero-word inline-block", accent && "text-primary")}>{text}</span>
    </span>
  );
  const plain = "Every detail.".split(" ");
  const accent = "Exactly where you need it.".split(" ");
  return (
    <h1 ref={ref} className={className}>
      {plain.map((w, i) => (
        <span key={`p${i}`}>{word(w, false, `p${i}`)} </span>
      ))}
      {accent.map((w, i) => (
        <span key={`a${i}`}>{word(w, true, `a${i}`)}{i < accent.length - 1 ? " " : ""}</span>
      ))}
    </h1>
  );
}

/* ---------------------------------------------------------------- */
/* Hero content drifts up and softens as you scroll past it          */
/* ---------------------------------------------------------------- */
export function HeroParallax({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    register();
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const section = ref.current?.closest("section");
      if (!ref.current || !section) return;
      gsap.to(ref.current, {
        y: -70,
        opacity: 0.15,
        scale: 0.97,
        ease: "none",
        scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: true },
      });
    });
    return () => mm.revert();
  });
  return <div ref={ref} className="will-change-transform">{children}</div>;
}

/* ---------------------------------------------------------------- */
/* Magnetic wrapper: the button leans toward the pointer             */
/* ---------------------------------------------------------------- */
export function Magnetic({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(`${MOTION_OK} and (hover: hover) and (min-width: 1024px)`, () => {
      const x = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
      const y = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        x((e.clientX - (r.left + r.width / 2)) * 0.28);
        y((e.clientY - (r.top + r.height / 2)) * 0.28);
      };
      const leave = () => { x(0); y(0); };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      return () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
      };
    });
    return () => mm.revert();
  });
  return <span ref={ref} className="contents lg:inline-block">{children}</span>;
}

/* ---------------------------------------------------------------- */
/* Infinite marquee of the things people keep retyping               */
/* ---------------------------------------------------------------- */
const MARQUEE_TOP: { icon: LucideIcon; label: string }[] = [
  { icon: UserRound, label: "Full name" },
  { icon: Mail, label: "Email address" },
  { icon: Phone, label: "Phone number" },
  { icon: MapPin, label: "Home address" },
  { icon: Link2, label: "LinkedIn" },
  { icon: Link2, label: "Portfolio" },
  { icon: GraduationCap, label: "Degree" },
  { icon: GraduationCap, label: "GPA" },
];
const MARQUEE_BOTTOM: { icon: LucideIcon; label: string }[] = [
  { icon: BriefcaseBusiness, label: "Work history" },
  { icon: Sparkles, label: "Skills" },
  { icon: FileText, label: "Cover letters" },
  { icon: FileText, label: "Why this role" },
  { icon: FolderOpen, label: "Résumé" },
  { icon: GraduationCap, label: "Test scores" },
  { icon: BriefcaseBusiness, label: "Projects" },
  { icon: UserRound, label: "References" },
];

function MarqueeRow({ items, muted }: { items: typeof MARQUEE_TOP; muted?: boolean }) {
  const copy = (suffix: string, hidden: boolean) => (
    <ul className="flex shrink-0 items-center gap-4 pr-4" aria-hidden={hidden || undefined} key={suffix}>
      {items.map(({ icon: Icon, label }) => (
        <li
          key={`${suffix}-${label}`}
          className={cn(
            "flex shrink-0 items-center gap-3 rounded-full border border-border bg-card px-6 py-3 text-xl font-semibold shadow-glass sm:text-2xl",
            muted ? "text-muted-foreground" : "text-heading",
          )}
        >
          <Icon className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
          {label}
        </li>
      ))}
    </ul>
  );
  return (
    <div className="marquee-row flex w-max will-change-transform">
      {copy("a", false)}
      {copy("b", true)}
    </div>
  );
}

export function KeyMarquee() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      register();
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const rows = gsap.utils.toArray<HTMLElement>(".marquee-row");
        const tweens = rows.map((row, i) =>
          i % 2 === 0
            ? gsap.fromTo(row, { xPercent: 0 }, { xPercent: -50, duration: 38, ease: "none", repeat: -1 })
            : gsap.fromTo(row, { xPercent: -50 }, { xPercent: 0, duration: 44, ease: "none", repeat: -1 }),
        );
        // Scrolling fast makes the rows surge, then they settle back.
        let boost = 0;
        let current = 1;
        ScrollTrigger.create({
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => { boost = Math.min(Math.abs(self.getVelocity()) / 350, 6); },
        });
        const tick = () => {
          boost *= 0.92;
          current += (1 + boost - current) * 0.15;
          tweens.forEach((t) => t.timeScale(current));
        };
        gsap.ticker.add(tick);
        return () => gsap.ticker.remove(tick);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-label="Details you can keep in your vault"
      className="relative overflow-hidden py-10 sm:py-14 [mask-image:linear-gradient(to_right,transparent,black_9%,black_91%,transparent)]"
    >
      <div className="flex flex-col gap-4">
        <MarqueeRow items={MARQUEE_TOP} />
        <MarqueeRow items={MARQUEE_BOTTOM} muted />
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/* Statement whose words light up as you scroll                      */
/* ---------------------------------------------------------------- */
const STATEMENT: { text: string; accent?: boolean }[] = [
  { text: "Your" }, { text: "name," }, { text: "your" }, { text: "degree," }, { text: "your" }, { text: "story." },
  { text: "Type" }, { text: "each" }, { text: "one" }, { text: "once", accent: true }, { text: "and" }, { text: "let" },
  { text: "every" }, { text: "form" }, { text: "after" }, { text: "that" }, { text: "take" }, { text: "seconds.", accent: true },
];

export function ScrubStatement() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      register();
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          ".scrub-word",
          { opacity: 0.12 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.1,
            scrollTrigger: { trigger: root.current, start: "top 78%", end: "bottom 55%", scrub: 0.4 },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );
  return (
    <section ref={root} className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-36 lg:px-10">
      <p className="text-center text-3xl font-bold leading-[1.15] text-heading sm:text-5xl lg:text-6xl">
        {STATEMENT.map((w, i) => (
          <span key={i}>
            <span className={cn("scrub-word", w.accent && "text-primary")}>{w.text}</span>{" "}
          </span>
        ))}
      </p>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/* Horizontal accordion: sections expand sideways                    */
/* ---------------------------------------------------------------- */
const PANELS: {
  icon: LucideIcon;
  tint: string;
  title: string;
  detail: string;
  fields: readonly (readonly [string, string])[];
}[] = [
  {
    icon: UserRound, tint: "bg-tint-blue", title: "Personal", detail: "Contact details and links, one tap each.",
    fields: [["Full name", "Maya Chen"], ["Email", "maya.chen@example.com"], ["Phone", "+1 415 555 0142"]],
  },
  {
    icon: GraduationCap, tint: "bg-tint-purple", title: "Education", detail: "Degrees, schools and test scores.",
    fields: [["Degree", "B.S. Computer Science"], ["University", "Northfield University"], ["GPA", "3.8 / 4.0"]],
  },
  {
    icon: BriefcaseBusiness, tint: "bg-tint-orange", title: "Experience", detail: "Roles, skills and projects.",
    fields: [["Role", "Product Designer"], ["Company", "Brightline Studio"], ["Dates", "2021 to present"]],
  },
  {
    icon: FileText, tint: "bg-tint-green", title: "Applications", detail: "Answers and cover letters you reuse.",
    fields: [["Notice period", "Two weeks"], ["Work authorization", "Yes, no sponsorship"], ["Cover letter", "Opening paragraph"]],
  },
  {
    icon: FolderOpen, tint: "bg-tint-teal", title: "Documents", detail: "Track what you have, never the file itself.",
    fields: [["Résumé", "resume-2026.pdf"], ["Transcript", "transcript.pdf"], ["Portfolio", "Link saved"]],
  },
];

export function VaultAccordion() {
  const [active, setActive] = useState(0);
  const root = useRef<HTMLElement>(null);
  const wrap = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      register();
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from(".accordion-panel", {
          y: 60,
          opacity: 0,
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.09,
          scrollTrigger: { trigger: wrap.current, start: "top 85%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32 lg:px-10" aria-labelledby="accordion-title">
      <h2 id="accordion-title" className="mx-auto max-w-4xl text-center text-3xl font-bold leading-[1.15] text-heading sm:text-5xl">
        Everything you reuse,
        <span className="mx-2 inline-flex h-[0.85em] w-[1.9em] translate-y-[0.02em] items-center justify-center gap-[0.18em] rounded-full bg-primary align-middle text-primary-foreground shadow-glass" aria-hidden="true">
          <Copy className="h-[0.42em] w-[0.42em]" />
          <Check className="h-[0.42em] w-[0.42em]" />
        </span>
        one tap away.
      </h2>
      <div ref={wrap} className="mt-14 flex flex-col gap-3 lg:h-[26rem] lg:flex-row">
        {PANELS.map((panel, i) => {
          const isActive = active === i;
          return (
            <div
              key={panel.title}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              className={cn(
                "accordion-panel relative overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-glass transition-[flex-grow,border-color,box-shadow] duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] lg:basis-0",
                isActive ? "border-primary/40 shadow-glass-lg lg:grow-[4]" : "lg:grow-[1]",
              )}
            >
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-expanded={isActive}
                aria-controls={`panel-${i}`}
                className="flex w-full items-center gap-4 p-5 text-left"
              >
                <span className={cn("tint-tile grid h-11 w-11 shrink-0 place-items-center rounded-xl", panel.tint)}>
                  <panel.icon className="h-5 w-5" />
                </span>
                <span className="text-xl font-semibold text-heading lg:hidden">{panel.title}</span>
                <ChevronDown className={cn("ml-auto h-5 w-5 text-muted-foreground transition-transform duration-500 lg:hidden", isActive && "rotate-180")} />
              </button>
              <span
                aria-hidden="true"
                className={cn(
                  "absolute bottom-6 left-1/2 hidden -translate-x-1/2 rotate-180 text-lg font-semibold text-muted-foreground transition-opacity duration-300 [writing-mode:vertical-rl] lg:block",
                  isActive ? "opacity-0" : "opacity-100 delay-300",
                )}
              >
                {panel.title}
              </span>
              <div
                id={`panel-${i}`}
                className={cn(
                  "grid transition-[grid-template-rows] duration-500 ease-out lg:block lg:transition-none",
                  isActive ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <div className="min-h-0 overflow-hidden lg:min-w-[24rem]">
                  <div
                    className={cn(
                      "px-5 pb-5 transition-[opacity,transform] duration-500 ease-out",
                      isActive ? "translate-y-0 opacity-100 lg:delay-300" : "translate-y-3 opacity-0 lg:pointer-events-none",
                    )}
                  >
                    <h3 className="hidden text-2xl font-semibold text-heading lg:block">{panel.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{panel.detail}</p>
                    <ul className="mt-5 space-y-2">
                      {panel.fields.map(([label, value]) => (
                        <li key={label} className="flex items-center gap-3 rounded-xl bg-muted/60 px-4 py-3 text-sm">
                          <span className="w-28 shrink-0 text-muted-foreground">{label}</span>
                          <span className="min-w-0 flex-1 truncate font-medium text-heading">{value}</span>
                          <Copy className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/* 3D scenes grow in as they arrive and dim as they leave            */
/* ---------------------------------------------------------------- */
export function useDepthScenes(scope: React.RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      register();
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.utils.toArray<HTMLElement>(".depth-scene").forEach((scene) => {
          gsap.fromTo(
            scene,
            { scale: 0.78 },
            { scale: 1, ease: "none", scrollTrigger: { trigger: scene, start: "top 95%", end: "top 55%", scrub: true } },
          );
          gsap.fromTo(
            scene,
            { opacity: 1 },
            { opacity: 0.25, ease: "none", immediateRender: false, scrollTrigger: { trigger: scene, start: "top 22%", end: "bottom -10%", scrub: true } },
          );
        });
      });
      return () => mm.revert();
    },
    { scope },
  );
}
