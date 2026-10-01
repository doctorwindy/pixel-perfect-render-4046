import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { SectionSkeleton } from "@/components/vault/loading-skeleton";
import { SECTION_BY_ID } from "@/lib/schema";

export const Route = createFileRoute("/_authenticated/tests")({
  head: () => ({
    meta: [
      { title: "Tests · InfoVault" },
      { name: "description", content: "Keep IELTS, TOEFL, GRE and other test scores ready to copy." },
      { property: "og:title", content: "Tests · InfoVault" },
      { property: "og:description", content: "Keep IELTS, TOEFL, GRE and other test scores ready to copy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  pendingMs: 0,
  pendingComponent: SectionSkeleton,
  component: lazyRouteComponent(() => import("@/components/vault/section-page").then((mod) => ({ default: () => <mod.SectionPage def={SECTION_BY_ID.tests} /> }))),
});
