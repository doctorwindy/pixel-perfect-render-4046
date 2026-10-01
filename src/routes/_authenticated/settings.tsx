import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { SectionSkeleton } from "@/components/vault/loading-skeleton";


export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings · InfoVault" },
      { name: "description", content: "Theme, copy formats, export, import and account settings." },
      { property: "og:title", content: "Settings · InfoVault" },
      { property: "og:description", content: "Theme, copy formats, export, import and account settings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  pendingMs: 0,
  pendingComponent: SectionSkeleton,
  component: lazyRouteComponent(() => import("@/components/vault/settings-view"), "SettingsView"),
});
