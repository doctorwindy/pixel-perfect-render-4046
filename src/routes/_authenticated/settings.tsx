import { createFileRoute } from "@tanstack/react-router";
import { SettingsView } from "@/components/vault/settings-view";

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
  component: SettingsView,
});
