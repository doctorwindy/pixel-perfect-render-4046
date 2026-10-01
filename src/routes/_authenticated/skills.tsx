import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { SectionSkeleton } from "@/components/vault/loading-skeleton";


export const Route = createFileRoute("/_authenticated/skills")({
  head: () => ({
    meta: [
      { title: "Skills · InfoVault" },
      { name: "description", content: "Group your skills and copy one, a group, or all of them." },
      { property: "og:title", content: "Skills · InfoVault" },
      { property: "og:description", content: "Group your skills and copy one, a group, or all of them." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  pendingMs: 0,
  pendingComponent: SectionSkeleton,
  component: lazyRouteComponent(() => import("@/components/vault/skills-view"), "SkillsView"),
});
