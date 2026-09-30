import { createFileRoute } from "@tanstack/react-router";
import { SectionPage } from "@/components/vault/section-page";
import { SECTION_BY_ID } from "@/lib/schema";

export const Route = createFileRoute("/_authenticated/answers")({
  head: () => ({
    meta: [
      { title: "Answers · InfoVault" },
      { name: "description", content: "Reusable answers to common application questions, ready to copy." },
      { property: "og:title", content: "Answers · InfoVault" },
      { property: "og:description", content: "Reusable answers to common application questions, ready to copy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <SectionPage def={SECTION_BY_ID.answers} />,
});
