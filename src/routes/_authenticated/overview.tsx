import { createFileRoute } from "@tanstack/react-router";
import { Overview } from "@/components/vault/overview";

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
  component: Overview,
});
