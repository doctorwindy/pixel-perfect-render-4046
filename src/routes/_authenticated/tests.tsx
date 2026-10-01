import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { SectionSkeleton } from "@/components/vault/loading-skeleton";

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
  component: lazyRouteComponent(() => import("@/components/vault/section-routes"), "TestsSection"),
});
