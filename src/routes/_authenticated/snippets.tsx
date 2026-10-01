import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { SectionSkeleton } from "@/components/vault/loading-skeleton";
import { SECTION_BY_ID } from "@/lib/schema";

export const Route = createFileRoute("/_authenticated/snippets")({
  head: () => ({
    meta: [
      { title: "Cover letter snippets · InfoVault" },
      { name: "description", content: "Cover letter openings, closings and full letters ready to paste." },
      { property: "og:title", content: "Cover letter snippets · InfoVault" },
      { property: "og:description", content: "Cover letter openings, closings and full letters ready to paste." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  pendingMs: 0,
  pendingComponent: SectionSkeleton,
  component: lazyRouteComponent(() => import("@/components/vault/section-page").then((mod) => ({ default: () => <mod.SectionPage def={SECTION_BY_ID.snippets} /> }))),
});
