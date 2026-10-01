import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { SectionSkeleton } from "@/components/vault/loading-skeleton";

export const Route = createFileRoute("/_authenticated/applications")({
  head: () => ({
    meta: [
      { title: "Applications · InfoVault" },
      { name: "description", content: "Track job applications, status and contacts, and copy details fast." },
      { property: "og:title", content: "Applications · InfoVault" },
      { property: "og:description", content: "Track job applications, status and contacts, and copy details fast." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  pendingMs: 0,
  pendingComponent: SectionSkeleton,
  component: lazyRouteComponent(() => import("@/components/vault/section-routes"), "ApplicationsSection"),
});
