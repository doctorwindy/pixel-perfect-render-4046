import { createFileRoute } from "@tanstack/react-router";
import { SectionPage } from "@/components/vault/section-page";
import { SECTION_BY_ID } from "@/lib/schema";

export const Route = createFileRoute("/_authenticated/experience")({
  head: () => ({
    meta: [
      { title: "Experience · InfoVault" },
      { name: "description", content: "Store work history with responsibilities and achievements, ready to copy." },
      { property: "og:title", content: "Experience · InfoVault" },
      { property: "og:description", content: "Store work history with responsibilities and achievements, ready to copy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <SectionPage def={SECTION_BY_ID.experience} />,
});
