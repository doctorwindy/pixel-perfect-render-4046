import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { SectionSkeleton } from "@/components/vault/loading-skeleton";

export const Route = createFileRoute("/_authenticated/documents")({
  head: () => ({
    meta: [
      { title: "Documents · InfoVault" },
      { name: "description", content: "Track the status of your documents. Metadata only, no files stored." },
      { property: "og:title", content: "Documents · InfoVault" },
      { property: "og:description", content: "Track the status of your documents. Metadata only, no files stored." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  pendingMs: 0,
  pendingComponent: SectionSkeleton,
  component: lazyRouteComponent(() => import("@/components/vault/section-routes"), "DocumentsSection"),
});
