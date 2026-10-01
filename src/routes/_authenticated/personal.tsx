import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { SectionSkeleton } from "@/components/vault/loading-skeleton";


export const Route = createFileRoute("/_authenticated/personal")({
  head: () => ({
    meta: [
      { title: "Personal info · InfoVault" },
      { name: "description", content: "Edit and copy your personal details, contact info and links." },
      { property: "og:title", content: "Personal info · InfoVault" },
      { property: "og:description", content: "Edit and copy your personal details, contact info and links." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  pendingMs: 0,
  pendingComponent: SectionSkeleton,
  component: lazyRouteComponent(() => import("@/components/vault/personal-view"), "PersonalView"),
});
