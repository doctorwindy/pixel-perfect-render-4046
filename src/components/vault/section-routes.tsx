import { SectionPage } from "@/components/vault/section-page";
import { SECTION_BY_ID } from "@/lib/schema";

export function TestsSection() { return <SectionPage def={SECTION_BY_ID.tests} />; }
export function ExperienceSection() { return <SectionPage def={SECTION_BY_ID.experience} />; }
export function SnippetsSection() { return <SectionPage def={SECTION_BY_ID.snippets} />; }
export function EducationSection() { return <SectionPage def={SECTION_BY_ID.education} />; }
export function DocumentsSection() { return <SectionPage def={SECTION_BY_ID.documents} />; }
export function ApplicationsSection() { return <SectionPage def={SECTION_BY_ID.applications} />; }
export function AnswersSection() { return <SectionPage def={SECTION_BY_ID.answers} />; }
export function ProjectsSection() { return <SectionPage def={SECTION_BY_ID.projects} />; }
