import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { SectionSkeleton } from "@/components/vault/loading-skeleton";
import { SECTION_BY_ID } from "@/lib/schema";

export const Route = createFileRoute("/_authenticated/answers")({
  head: () => ({
    meta: [
      { title: "Answers · InfoVault" },
      { name: "description", content: "Reusable answers to common application questions, ready to copy." },
      { property: "og:title", content: "Answers · InfoVault" },
      { property: "og:description", content: "Reusable answers to common application questions, ready to copy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  pendingMs: 0,
  pendingComponent: SectionSkeleton,
  component: lazyRouteComponent(() => import("@/components/vault/section-page").then((mod) => ({ default: () => <mod.SectionPage def={SECTION_BY_ID.answers} /> }))),
});
