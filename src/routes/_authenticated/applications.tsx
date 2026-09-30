import { createFileRoute } from "@tanstack/react-router";
import { SectionPage } from "@/components/vault/section-page";
import { SECTION_BY_ID } from "@/lib/schema";

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
  component: () => <SectionPage def={SECTION_BY_ID.applications} />,
});
