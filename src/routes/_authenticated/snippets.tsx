import { createFileRoute } from "@tanstack/react-router";
import { SectionPage } from "@/components/vault/section-page";
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
  component: () => <SectionPage def={SECTION_BY_ID.snippets} />,
});
