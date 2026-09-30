import {
  PERSONAL_FIELDS,
  RECORD_SECTIONS,
  SECTION_BY_ID,
  isEmptyValue,
  type FieldDef,
  type RecordData,
  type RecordSectionId,
  type SectionId,
} from "./schema";

export interface VaultRecord {
  id: string;
  data: RecordData;
  created_at: string;
  updated_at: string;
}

export type Theme = "light" | "dark" | "system";
export type MultiCopyFormat = "labels" | "values";
export type RecordCopyFormat = "block" | "line" | "json";

export interface Settings {
  theme: Theme;
  multiCopyFormat: MultiCopyFormat;
  recordCopyFormat: RecordCopyFormat;
  historyEnabled: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: "system",
  multiCopyFormat: "labels",
  recordCopyFormat: "block",
  historyEnabled: true,
};

export interface HistoryRow {
  id: string;
  item_key: string;
  label: string;
  created_at: string;
}

export interface Vault {
  profile: {
    display_name: string;
    personal: RecordData;
    settings: Settings;
    onboarded: boolean;
  };
  records: Record<RecordSectionId, VaultRecord[]>;
  favorites: string[];
  history: HistoryRow[];
}

export interface FlatItem {
  key: string;
  section: SectionId;
  sectionLabel: string;
  recordId: string | null;
  recordTitle: string;
  fieldKey: string;
  label: string;
  value: string;
  sensitive: boolean;
  path: string;
}

export const makeKey = (section: SectionId, recordId: string | null, fieldKey: string) =>
  `${section}|${recordId ?? "-"}|${fieldKey}`;

/** Convert any stored field value into the exact plain text that gets copied. */
export function valueToString(f: FieldDef, v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (Array.isArray(v)) {
    if (f.type === "tags") return (v as string[]).filter(Boolean).join(", ");
    if (f.type === "lines") return (v as string[]).filter((x) => x.trim()).join("\n");
    if (f.type === "kv")
      return (v as { label: string; value: string }[])
        .filter((x) => x.label || x.value)
        .map((x) => (x.label ? `${x.label}: ${x.value}` : x.value))
        .join("\n");
  }
  return String(v);
}

function singleLine(s: string) {
  return s.replace(/\s*\n\s*/g, ", ");
}

export function formatRecord(
  fields: FieldDef[],
  data: RecordData,
  format: RecordCopyFormat,
  title?: string,
): string {
  const filled = fields.filter((f) => !isEmptyValue(data[f.key]));
  if (format === "json") {
    const obj: Record<string, unknown> = {};
    for (const f of filled) {
      const v = data[f.key];
      if (f.type === "kv") {
        obj[f.label] = Object.fromEntries(
          (v as { label: string; value: string }[])
            .filter((x) => x.label || x.value)
            .map((x) => [x.label, x.value]),
        );
      } else if (f.type === "lines") {
        obj[f.label] = (v as string[]).filter((x) => x.trim());
      } else obj[f.label] = v;
    }
    return JSON.stringify(obj, null, 2);
  }
  if (format === "line") {
    return filled
      .map((f) => `${f.label}: ${singleLine(valueToString(f, data[f.key]))}`)
      .join("; ");
  }
  const lines: string[] = [];
  if (title) lines.push(title, "");
  for (const f of filled) {
    const v = valueToString(f, data[f.key]);
    if (f.type === "lines") {
      lines.push(`${f.label}:`, ...v.split("\n").map((l) => `- ${l}`));
    } else if (f.type === "kv" || f.type === "textarea") {
      lines.push(`${f.label}:`, v);
    } else lines.push(`${f.label}: ${v}`);
  }
  return lines.join("\n").trim();
}

export function formatItems(items: FlatItem[], format: MultiCopyFormat): string {
  return items
    .map((i) => (format === "labels" ? `${i.label}: ${i.value}` : i.value))
    .join("\n");
}

export function flatten(vault: Vault): FlatItem[] {
  const items: FlatItem[] = [];
  for (const f of PERSONAL_FIELDS) {
    const v = vault.profile.personal[f.key];
    if (isEmptyValue(v)) continue;
    items.push({
      key: makeKey("personal", null, f.key),
      section: "personal",
      sectionLabel: "Personal",
      recordId: null,
      recordTitle: "Personal",
      fieldKey: f.key,
      label: f.label,
      value: valueToString(f, v),
      sensitive: !!f.sensitive,
      path: "/personal",
    });
  }
  for (const def of RECORD_SECTIONS) {
    for (const rec of vault.records[def.id]) {
      const title = def.title(rec.data);
      for (const f of def.fields) {
        const v = rec.data[f.key];
        if (isEmptyValue(v)) continue;
        items.push({
          key: makeKey(def.id, rec.id, f.key),
          section: def.id,
          sectionLabel: def.label,
          recordId: rec.id,
          recordTitle: title,
          fieldKey: f.key,
          label: f.label,
          value: valueToString(f, v),
          sensitive: !!f.sensitive,
          path: def.path,
        });
      }
      if (def.id === "skills" && Array.isArray(rec.data["skills"])) {
        for (const s of rec.data["skills"] as string[]) {
          items.push({
            key: makeKey("skills", rec.id, `skill:${s}`),
            section: "skills",
            sectionLabel: "Skills",
            recordId: rec.id,
            recordTitle: title,
            fieldKey: `skill:${s}`,
            label: "Skill",
            value: s,
            sensitive: false,
            path: "/skills",
          });
        }
      }
    }
  }
  return items;
}

export function sectionFields(section: SectionId): FieldDef[] {
  if (section === "personal") return PERSONAL_FIELDS;
  if (section in SECTION_BY_ID) return SECTION_BY_ID[section as RecordSectionId].fields;
  return [];
}

export function maskValue(v: string) {
  return "•".repeat(Math.min(Math.max(v.length, 6), 14));
}

export function recordMatches(def: { fields: FieldDef[] }, data: RecordData, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return def.fields.some((f) => {
    if (f.sensitive) return false;
    return valueToString(f, data[f.key]).toLowerCase().includes(needle);
  });
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}
