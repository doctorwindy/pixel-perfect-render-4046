import { createFileRoute } from "@tanstack/react-router";
import { SectionPage } from "@/components/vault/section-page";
import { SECTION_BY_ID } from "@/lib/schema";

export const Route = createFileRoute("/_authenticated/documents")({
  head: () => ({
    meta: [
      { title: "Documents · InfoVault" },
      { name: "description", content: "Track the status of your documents. Metadata only, no files stored." },
      { property: "og:title", content: "Documents · InfoVault" },
      { property: "og:description", content: "Track the status of your documents. Metadata only, no files stored." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <SectionPage def={SECTION_BY_ID.documents} />,
});
