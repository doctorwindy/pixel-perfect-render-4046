import { createFileRoute } from "@tanstack/react-router";
import { SectionPage } from "@/components/vault/section-page";
import { SECTION_BY_ID } from "@/lib/schema";

export const Route = createFileRoute("/_authenticated/education")({
  head: () => ({
    meta: [
      { title: "Education · InfoVault" },
      { name: "description", content: "Save your degrees and courses and copy any detail into application forms." },
      { property: "og:title", content: "Education · InfoVault" },
      { property: "og:description", content: "Save your degrees and courses and copy any detail into application forms." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <SectionPage def={SECTION_BY_ID.education} />,
});
