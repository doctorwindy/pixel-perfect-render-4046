import { createFileRoute } from "@tanstack/react-router";
import { SkillsView } from "@/components/vault/skills-view";

export const Route = createFileRoute("/_authenticated/skills")({
  head: () => ({
    meta: [
      { title: "Skills · InfoVault" },
      { name: "description", content: "Group your skills and copy one, a group, or all of them." },
      { property: "og:title", content: "Skills · InfoVault" },
      { property: "og:description", content: "Group your skills and copy one, a group, or all of them." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SkillsView,
});
