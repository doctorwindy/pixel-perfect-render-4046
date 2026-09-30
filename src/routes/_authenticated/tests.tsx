import { createFileRoute } from "@tanstack/react-router";
import { SectionPage } from "@/components/vault/section-page";
import { SECTION_BY_ID } from "@/lib/schema";

export const Route = createFileRoute("/_authenticated/tests")({
  head: () => ({
    meta: [
      { title: "Tests · InfoVault" },
      { name: "description", content: "Keep IELTS, TOEFL, GRE and other test scores ready to copy." },
      { property: "og:title", content: "Tests · InfoVault" },
      { property: "og:description", content: "Keep IELTS, TOEFL, GRE and other test scores ready to copy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <SectionPage def={SECTION_BY_ID.tests} />,
});
