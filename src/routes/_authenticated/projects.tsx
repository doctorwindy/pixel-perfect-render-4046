import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { SectionSkeleton } from "@/components/vault/loading-skeleton";
import { SECTION_BY_ID } from "@/lib/schema";

export const Route = createFileRoute("/_authenticated/projects")({
  head: () => ({
    meta: [
      { title: "Projects · InfoVault" },
      { name: "description", content: "Keep project descriptions, links and contributions one click away." },
      { property: "og:title", content: "Projects · InfoVault" },
      { property: "og:description", content: "Keep project descriptions, links and contributions one click away." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  pendingMs: 0,
  pendingComponent: SectionSkeleton,
  component: lazyRouteComponent(() => import("@/components/vault/section-page").then((mod) => ({ default: () => <mod.SectionPage def={SECTION_BY_ID.projects} /> }))),
});
