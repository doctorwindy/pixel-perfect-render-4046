import {
  Briefcase,
  ClipboardCheck,
  FileText,
  Files,
  GraduationCap,
  LayoutDashboard,
  Mail,
  MessageSquareText,
  Rocket,
  Send,
  Settings,
  Sparkles,
  User,
  type LucideIcon,
} from "lucide-react";
import { z } from "zod";

export type FieldType =
  | "text"
  | "textarea"
  | "url"
  | "email"
  | "tel"
  | "date"
  | "month"
  | "select"
  | "tags"
  | "lines"
  | "kv";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  sensitive?: boolean;
  options?: string[];
  placeholder?: string;
  required?: boolean;
  wide?: boolean;
  kvSuggestions?: string[];
}

export type Tint =
  | "blue"
  | "green"
  | "orange"
  | "purple"
  | "pink"
  | "teal"
  | "indigo"
  | "red"
  | "yellow"
  | "gray";

export const TINT_BG: Record<Tint, string> = {
  blue: "bg-tint-blue",
  green: "bg-tint-green",
  orange: "bg-tint-orange",
  purple: "bg-tint-purple",
  pink: "bg-tint-pink",
  teal: "bg-tint-teal",
  indigo: "bg-tint-indigo",
  red: "bg-tint-red",
  yellow: "bg-tint-yellow",
  gray: "bg-tint-gray",
};

export const TINT_SOFT: Record<Tint, string> = {
  blue: "bg-tint-blue/15 text-tint-blue",
  green: "bg-tint-green/15 text-success",
  orange: "bg-tint-orange/20 text-tint-orange",
  purple: "bg-tint-purple/15 text-tint-purple",
  pink: "bg-tint-pink/15 text-tint-pink",
  teal: "bg-tint-teal/20 text-tint-teal",
  indigo: "bg-tint-indigo/15 text-tint-indigo",
  red: "bg-tint-red/15 text-tint-red",
  yellow: "bg-tint-yellow/25 text-tint-orange",
  gray: "bg-tint-gray/20 text-muted-foreground",
};

export type RecordSectionId =
  | "education"
  | "tests"
  | "experience"
  | "skills"
  | "projects"
  | "applications"
  | "answers"
  | "snippets"
  | "documents";

export type SectionId = "overview" | "personal" | RecordSectionId | "settings";

export type RecordData = Record<string, unknown>;

export interface RecordSectionDef {
  id: RecordSectionId;
  table:
    | "education"
    | "tests"
    | "experience"
    | "skill_groups"
    | "projects"
    | "applications"
    | "answers"
    | "snippets"
    | "documents";
  label: string;
  singular: string;
  icon: LucideIcon;
  tint: Tint;
  path: string;
  fields: FieldDef[];
  title: (d: RecordData) => string;
  subtitle?: (d: RecordData) => string;
  /** key of a select field rendered as a coloured badge in the card header */
  badgeKey?: string;
  emptyTitle: string;
  emptyHint: string;
  searchPlaceholder: string;
}

export interface NavDef {
  id: SectionId;
  label: string;
  short?: string;
  icon: LucideIcon;
  tint: Tint;
  path: string;
}

const str = (v: unknown): string => (typeof v === "string" ? v : "");

const join = (...parts: unknown[]) =>
  parts
    .map(str)
    .filter((p) => p.trim().length > 0)
    .join(" · ");

export const TEST_TYPES = ["IELTS", "TOEFL", "PTE", "GRE", "GMAT", "SAT", "Custom"];

export const APPLICATION_STATUSES = [
  "Wishlist",
  "Applied",
  "Screening",
  "Interview",
  "Offer",
  "Rejected",
  "Withdrawn",
];

export const DOCUMENT_TYPES = [
  "CV / Resume",
  "Transcript",
  "Certificate",
  "Recommendation",
  "ID / Passport",
  "Portfolio",
  "Other",
];
export const DOCUMENT_STATUSES = ["Ready", "Needs update", "In progress", "Missing", "Expired"];
export const SNIPPET_KINDS = ["Opening", "Body", "Closing", "Full letter", "Other"];

export const STATUS_TINTS: Record<string, Tint> = {
  Wishlist: "gray",
  Applied: "blue",
  Screening: "indigo",
  Interview: "purple",
  Offer: "green",
  Rejected: "red",
  Withdrawn: "orange",
  Ready: "green",
  "Needs update": "orange",
  "In progress": "blue",
  Missing: "red",
  Expired: "red",
};

export const RECORD_SECTIONS: RecordSectionDef[] = [
  {
    id: "education",
    table: "education",
    label: "Education",
    singular: "education record",
    icon: GraduationCap,
    tint: "orange",
    path: "/education",
    title: (d) => str(d.degree) || str(d.institution) || "Untitled",
    subtitle: (d) => join(d.institution, d.field),
    emptyTitle: "No education added yet",
    emptyHint: "Add your degrees and courses so you can copy them into any form.",
    searchPlaceholder: "Search education",
    fields: [
      { key: "degree", label: "Degree", type: "text", required: true, placeholder: "BSc Computer Science" },
      { key: "institution", label: "Institution", type: "text", placeholder: "University name" },
      { key: "field", label: "Field of study", type: "text" },
      { key: "location", label: "Location", type: "text" },
      { key: "start", label: "Start", type: "month" },
      { key: "end", label: "End", type: "month" },
      { key: "cgpa", label: "CGPA / Grade", type: "text", placeholder: "3.7 / 4.0" },
      { key: "achievements", label: "Achievements", type: "lines", wide: true, placeholder: "One per line" },
    ],
  },
  {
    id: "tests",
    table: "tests",
    label: "Tests",
    singular: "test result",
    icon: ClipboardCheck,
    tint: "green",
    path: "/tests",
    title: (d) => {
      const t = str(d.type);
      return t === "Custom" ? str(d.custom_name) || "Custom test" : t || "Untitled test";
    },
    subtitle: (d) => join(d.overall ? `Overall ${str(d.overall)}` : "", d.date),
    emptyTitle: "No test scores yet",
    emptyHint: "Keep IELTS, TOEFL, GRE and other scores one click away.",
    searchPlaceholder: "Search tests",
    fields: [
      { key: "type", label: "Test", type: "select", options: TEST_TYPES, required: true },
      { key: "custom_name", label: "Custom test name", type: "text" },
      { key: "overall", label: "Overall score", type: "text" },
      {
        key: "subscores",
        label: "Sub-scores",
        type: "kv",
        wide: true,
        kvSuggestions: ["Listening", "Reading", "Writing", "Speaking", "Verbal", "Quantitative", "Analytical"],
      },
      { key: "date", label: "Test date", type: "date" },
      { key: "expiry", label: "Valid until", type: "date" },
      { key: "registration", label: "Registration / TRF number", type: "text", sensitive: true },
      { key: "notes", label: "Notes", type: "textarea", wide: true },
    ],
  },
  {
    id: "experience",
    table: "experience",
    label: "Experience",
    singular: "role",
    icon: Briefcase,
    tint: "indigo",
    path: "/experience",
    title: (d) => str(d.title) || str(d.company) || "Untitled role",
    subtitle: (d) => join(d.company, d.location),
    emptyTitle: "No roles added yet",
    emptyHint: "Add jobs and internships with responsibilities and achievements.",
    searchPlaceholder: "Search experience",
    fields: [
      { key: "title", label: "Job title", type: "text", required: true },
      { key: "company", label: "Company", type: "text" },
      { key: "location", label: "Location", type: "text" },
      { key: "start", label: "Start", type: "month" },
      { key: "end", label: "End (empty if current)", type: "month" },
      { key: "responsibilities", label: "Responsibilities", type: "lines", wide: true, placeholder: "One per line" },
      { key: "achievements", label: "Achievements", type: "lines", wide: true, placeholder: "One per line" },
      { key: "technologies", label: "Technologies", type: "tags", wide: true },
    ],
  },
  {
    id: "skills",
    table: "skill_groups",
    label: "Skills",
    singular: "skill group",
    icon: Sparkles,
    tint: "purple",
    path: "/skills",
    title: (d) => str(d.name) || "Untitled group",
    emptyTitle: "No skills yet",
    emptyHint: "Create groups like Languages or Tools, then copy a skill, a group, or everything.",
    searchPlaceholder: "Search skills",
    fields: [
      { key: "name", label: "Group name", type: "text", required: true, placeholder: "Programming languages" },
      { key: "skills", label: "Skills", type: "tags", wide: true },
    ],
  },
  {
    id: "projects",
    table: "projects",
    label: "Projects",
    singular: "project",
    icon: Rocket,
    tint: "pink",
    path: "/projects",
    title: (d) => str(d.name) || "Untitled project",
    subtitle: (d) => join(d.role, d.start ? `${str(d.start)}${d.end ? ` – ${str(d.end)}` : ""}` : ""),
    emptyTitle: "No projects yet",
    emptyHint: "Save project descriptions, links and contributions for portfolios and applications.",
    searchPlaceholder: "Search projects",
    fields: [
      { key: "name", label: "Project name", type: "text", required: true },
      { key: "role", label: "Your role", type: "text" },
      { key: "description", label: "Description", type: "textarea", wide: true },
      { key: "technologies", label: "Tech stack", type: "tags", wide: true },
      { key: "link", label: "Live link", type: "url" },
      { key: "repo", label: "Repository", type: "url" },
      { key: "start", label: "Start", type: "month" },
      { key: "end", label: "End", type: "month" },
      { key: "contributions", label: "Contributions", type: "lines", wide: true, placeholder: "One per line" },
    ],
  },
  {
    id: "applications",
    table: "applications",
    label: "Applications",
    singular: "application",
    icon: Send,
    tint: "blue",
    path: "/applications",
    title: (d) => str(d.company) || "Untitled application",
    subtitle: (d) => join(d.role, d.location),
    badgeKey: "status",
    emptyTitle: "No applications tracked",
    emptyHint: "Track where you applied, the status, contacts and notes.",
    searchPlaceholder: "Search applications",
    fields: [
      { key: "company", label: "Company", type: "text", required: true },
      { key: "role", label: "Role", type: "text" },
      { key: "status", label: "Status", type: "select", options: APPLICATION_STATUSES },
      { key: "link", label: "Posting link", type: "url" },
      { key: "location", label: "Location", type: "text" },
      { key: "salary", label: "Salary", type: "text", placeholder: "e.g. $90k – $110k" },
      { key: "applied_on", label: "Applied on", type: "date" },
      { key: "contact_name", label: "Contact name", type: "text" },
      { key: "contact_email", label: "Contact email", type: "email" },
      { key: "notes", label: "Notes", type: "textarea", wide: true },
    ],
  },
  {
    id: "answers",
    table: "answers",
    label: "Answers",
    singular: "answer",
    icon: MessageSquareText,
    tint: "teal",
    path: "/answers",
    title: (d) => str(d.question) || "Untitled answer",
    emptyTitle: "No saved answers",
    emptyHint: "Write reusable answers to common application questions once.",
    searchPlaceholder: "Search answers or tags",
    fields: [
      { key: "question", label: "Question", type: "text", required: true, placeholder: "Why do you want to work here?" },
      { key: "answer", label: "Answer", type: "textarea", wide: true },
      { key: "tags", label: "Tags", type: "tags", wide: true },
    ],
  },
  {
    id: "snippets",
    table: "snippets",
    label: "Cover letter",
    singular: "snippet",
    icon: Mail,
    tint: "red",
    path: "/snippets",
    title: (d) => str(d.title) || "Untitled snippet",
    subtitle: (d) => str(d.kind),
    badgeKey: "kind",
    emptyTitle: "No snippets yet",
    emptyHint: "Keep intros, closings and full cover letter variations ready to paste.",
    searchPlaceholder: "Search snippets",
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "kind", label: "Type", type: "select", options: SNIPPET_KINDS },
      { key: "content", label: "Content", type: "textarea", wide: true },
      { key: "tags", label: "Tags", type: "tags", wide: true },
    ],
  },
  {
    id: "documents",
    table: "documents",
    label: "Documents",
    singular: "document",
    icon: Files,
    tint: "yellow",
    path: "/documents",
    title: (d) => str(d.name) || "Untitled document",
    subtitle: (d) => str(d.type),
    badgeKey: "status",
    emptyTitle: "No documents tracked",
    emptyHint: "Track the name, type and status of your documents. Files are never stored here.",
    searchPlaceholder: "Search documents",
    fields: [
      { key: "name", label: "Document name", type: "text", required: true },
      { key: "type", label: "Type", type: "select", options: DOCUMENT_TYPES },
      { key: "status", label: "Status", type: "select", options: DOCUMENT_STATUSES },
      { key: "updated_on", label: "Last updated", type: "date" },
      { key: "notes", label: "Notes", type: "textarea", wide: true },
    ],
  },
];

export const SECTION_BY_ID: Record<RecordSectionId, RecordSectionDef> = Object.fromEntries(
  RECORD_SECTIONS.map((s) => [s.id, s]),
) as Record<RecordSectionId, RecordSectionDef>;

export interface PersonalGroup {
  id: string;
  label: string;
  fields: FieldDef[];
}

export const PERSONAL_GROUPS: PersonalGroup[] = [
  {
    id: "identity",
    label: "Identity",
    fields: [
      { key: "full_name", label: "Full name", type: "text" },
      { key: "preferred_name", label: "Preferred name", type: "text" },
      { key: "first_name", label: "First name", type: "text" },
      { key: "middle_name", label: "Middle name", type: "text" },
      { key: "last_name", label: "Last name", type: "text" },
      { key: "headline", label: "Professional headline", type: "text" },
      { key: "dob", label: "Date of birth", type: "date", sensitive: true },
      { key: "nationality", label: "Nationality", type: "text" },
      { key: "id_number", label: "National ID number", type: "text", sensitive: true },
      { key: "passport_number", label: "Passport number", type: "text", sensitive: true },
      { key: "passport_expiry", label: "Passport expiry", type: "date" },
    ],
  },
  {
    id: "contact",
    label: "Contact",
    fields: [
      { key: "email", label: "Email", type: "email" },
      { key: "secondary_email", label: "Secondary email", type: "email" },
      { key: "phone", label: "Phone", type: "tel", sensitive: true },
      { key: "whatsapp", label: "WhatsApp", type: "tel", sensitive: true },
    ],
  },
  {
    id: "location",
    label: "Location",
    fields: [
      { key: "address", label: "Street address", type: "text", sensitive: true },
      { key: "city", label: "City", type: "text" },
      { key: "state", label: "State / Province", type: "text" },
      { key: "country", label: "Country", type: "text" },
      { key: "postal_code", label: "Postal code", type: "text" },
    ],
  },
  {
    id: "links",
    label: "Links",
    fields: [
      { key: "linkedin", label: "LinkedIn", type: "url" },
      { key: "github", label: "GitHub", type: "url" },
      { key: "portfolio", label: "Portfolio", type: "url" },
      { key: "website", label: "Website", type: "url" },
      { key: "twitter", label: "X / Twitter", type: "url" },
    ],
  },
  {
    id: "about",
    label: "About",
    fields: [
      { key: "summary", label: "Professional summary", type: "textarea", wide: true },
      { key: "bio", label: "Short bio", type: "textarea", wide: true },
    ],
  },
];

export const PERSONAL_FIELDS: FieldDef[] = PERSONAL_GROUPS.flatMap((g) => g.fields);

export const PERSONAL_CORE_KEYS = [
  "full_name",
  "email",
  "phone",
  "city",
  "country",
  "linkedin",
  "github",
  "summary",
];

export const QUICK_COPY_KEYS = ["full_name", "email", "phone", "linkedin", "github"];

export const NAV: NavDef[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, tint: "blue", path: "/overview" },
  { id: "personal", label: "Personal", icon: User, tint: "teal", path: "/personal" },
  ...RECORD_SECTIONS.map<NavDef>((s) => ({
    id: s.id,
    label: s.label,
    icon: s.icon,
    tint: s.tint,
    path: s.path,
  })),
  { id: "settings", label: "Settings", icon: Settings, tint: "gray", path: "/settings" },
];

// ---------- validation ----------

const looseUrl = /^(https?:\/\/)?[^\s/$.?#][^\s]*\.[^\s]{2,}$/i;

export function fieldSchema(f: FieldDef): z.ZodTypeAny {
  switch (f.type) {
    case "email":
      return z
        .string()
        .trim()
        .max(255)
        .refine((v) => v === "" || z.string().email().safeParse(v).success, "Enter a valid email");
    case "url":
      return z
        .string()
        .trim()
        .max(2000)
        .refine((v) => v === "" || looseUrl.test(v), "Enter a valid link");
    case "tags":
      return z.array(z.string().trim().min(1).max(120)).max(200);
    case "lines":
      return z.array(z.string().max(2000)).max(200);
    case "kv":
      return z
        .array(z.object({ label: z.string().trim().max(120), value: z.string().trim().max(500) }))
        .max(50);
    case "textarea":
      return z.string().max(20000);
    case "select":
      return z.string().max(120);
    default:
      return z.string().trim().max(2000);
  }
}

export function buildSchema(fields: FieldDef[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of fields) {
    let s = fieldSchema(f);
    if (f.required) {
      s = (s as z.ZodString).refine(
        (v: unknown) => typeof v === "string" && v.trim().length > 0,
        `${f.label} is required`,
      );
    }
    shape[f.key] = s;
  }
  return z.object(shape);
}

export function emptyValue(f: FieldDef): unknown {
  return f.type === "tags" || f.type === "lines" || f.type === "kv" ? [] : "";
}

export function emptyRecord(fields: FieldDef[]): RecordData {
  return Object.fromEntries(fields.map((f) => [f.key, emptyValue(f)]));
}

export function isEmptyValue(v: unknown): boolean {
  if (v == null) return true;
  if (typeof v === "string") return v.trim() === "";
  if (Array.isArray(v)) {
    return v.every((x) =>
      typeof x === "string" ? x.trim() === "" : !x || (!(x as { label?: string }).label && !(x as { value?: string }).value),
    );
  }
  return false;
}
