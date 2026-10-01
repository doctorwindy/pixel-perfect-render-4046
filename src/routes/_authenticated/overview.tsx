import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { SectionSkeleton } from "@/components/vault/loading-skeleton";


export const Route = createFileRoute("/_authenticated/overview")({
  head: () => ({
    meta: [
      { title: "Overview · InfoVault" },
      { name: "description", content: "Your InfoVault dashboard with quick copy, favorites and recent copies." },
      { property: "og:title", content: "Overview · InfoVault" },
      { property: "og:description", content: "Your InfoVault dashboard with quick copy, favorites and recent copies." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  pendingMs: 0,
  pendingComponent: SectionSkeleton,
  component: lazyRouteComponent(() => import("@/components/vault/overview"), "Overview"),
});
