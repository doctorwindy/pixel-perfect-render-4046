import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { SectionSkeleton } from "@/components/vault/loading-skeleton";

export const Route = createFileRoute("/_authenticated/experience")({
  head: () => ({
    meta: [
      { title: "Experience · InfoVault" },
      { name: "description", content: "Store work history with responsibilities and achievements, ready to copy." },
      { property: "og:title", content: "Experience · InfoVault" },
      { property: "og:description", content: "Store work history with responsibilities and achievements, ready to copy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  pendingMs: 0,
  pendingComponent: SectionSkeleton,
  component: lazyRouteComponent(() => import("@/components/vault/section-routes"), "ExperienceSection"),
});
