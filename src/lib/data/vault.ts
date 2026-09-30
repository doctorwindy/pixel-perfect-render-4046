import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import {
  PERSONAL_FIELDS,
  RECORD_SECTIONS,
  SECTION_BY_ID,
  buildSchema,
  type RecordData,
  type RecordSectionDef,
  type RecordSectionId,
} from "@/lib/schema";
import {
  DEFAULT_SETTINGS,
  type HistoryRow,
  type Settings,
  type Vault,
  type VaultRecord,
} from "@/lib/vault-utils";

type Tbl = "education";
const tbl = (def: RecordSectionDef) => supabase.from(def.table as Tbl);

const settingsSchema = z
  .object({
    theme: z.enum(["light", "dark", "system"]),
    multiCopyFormat: z.enum(["labels", "values"]),
    recordCopyFormat: z.enum(["block", "line", "json"]),
    historyEnabled: z.boolean(),
  })
  .partial();

function parseSettings(raw: unknown): Settings {
  const r = settingsSchema.safeParse(raw ?? {});
  return { ...DEFAULT_SETTINGS, ...(r.success ? r.data : {}) };
}

const HISTORY_LIMIT = 30;

export async function fetchVault(userId: string): Promise<Vault> {
  const profileQ = supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
  const recordQs = RECORD_SECTIONS.map((def) =>
    tbl(def)
      .select("id,data,created_at,updated_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  );
  const favQ = supabase.from("favorites").select("item_key").eq("user_id", userId);
  const histQ = supabase
    .from("copy_history")
    .select("id,item_key,label,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(HISTORY_LIMIT);

  const [profileRes, favRes, histRes, ...recordRes] = await Promise.all([
    profileQ,
    favQ,
    histQ,
    ...recordQs,
  ]);
  if (profileRes.error) throw profileRes.error;
  if (favRes.error) throw favRes.error;
  if (histRes.error) throw histRes.error;

  let profile = profileRes.data;
  if (!profile) {
    const ins = await supabase
      .from("profiles")
      .insert({ user_id: userId })
      .select("*")
      .single();
    if (ins.error) throw ins.error;
    profile = ins.data;
  }

  const records = {} as Record<RecordSectionId, VaultRecord[]>;
  RECORD_SECTIONS.forEach((def, i) => {
    const res = recordRes[i];
    if (res.error) throw res.error;
    records[def.id] = (res.data ?? []).map((r) => ({
      id: r.id,
      data: (r.data ?? {}) as RecordData,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));
  });

  return {
    profile: {
      display_name: profile.display_name ?? "",
      personal: (profile.personal ?? {}) as RecordData,
      settings: parseSettings(profile.settings),
      onboarded: !!profile.onboarded,
    },
    records,
    favorites: (favRes.data ?? []).map((f) => f.item_key),
    history: (histRes.data ?? []) as HistoryRow[],
  };
}

// ---------- records ----------

export async function saveRecord(
  userId: string,
  section: RecordSectionId,
  id: string | null,
  data: RecordData,
) {
  const def = SECTION_BY_ID[section];
  const parsed = buildSchema(def.fields).parse(data);
  if (id) {
    const { error } = await tbl(def)
      .update({ data: parsed as Json })
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw error;
  } else {
    const { error } = await tbl(def).insert({ user_id: userId, data: parsed as Json });
    if (error) throw error;
  }
}

export async function deleteRecord(userId: string, section: RecordSectionId, id: string) {
  const def = SECTION_BY_ID[section];
  const { error } = await tbl(def).delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
  await supabase
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .like("item_key", `${section}|${id}|%`);
}

// ---------- profile ----------

export async function savePersonal(userId: string, personal: RecordData) {
  const parsed = buildSchema(PERSONAL_FIELDS).partial().parse(personal);
  const { error } = await supabase
    .from("profiles")
    .update({ personal: parsed as Json })
    .eq("user_id", userId);
  if (error) throw error;
}

export async function saveProfileMeta(
  userId: string,
  patch: { display_name?: string; settings?: Settings; onboarded?: boolean },
) {
  const { error } = await supabase
    .from("profiles")
    .update({
      ...(patch.display_name !== undefined ? { display_name: patch.display_name.slice(0, 100) } : {}),
      ...(patch.settings ? { settings: patch.settings as unknown as Json } : {}),
      ...(patch.onboarded !== undefined ? { onboarded: patch.onboarded } : {}),
    })
    .eq("user_id", userId);
  if (error) throw error;
}

// ---------- favorites & history ----------

export async function setFavorite(userId: string, itemKey: string, on: boolean) {
  if (on) {
    const { error } = await supabase
      .from("favorites")
      .upsert({ user_id: userId, item_key: itemKey }, { onConflict: "user_id,item_key" });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("item_key", itemKey);
    if (error) throw error;
  }
}

export async function logCopy(userId: string, itemKey: string, label: string) {
  const { error } = await supabase
    .from("copy_history")
    .insert({ user_id: userId, item_key: itemKey, label: label.slice(0, 200) });
  if (error) throw error;
  const { data } = await supabase
    .from("copy_history")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(HISTORY_LIMIT, HISTORY_LIMIT + 200);
  if (data && data.length) {
    await supabase
      .from("copy_history")
      .delete()
      .in(
        "id",
        data.map((d) => d.id),
      );
  }
}

export async function clearHistory(userId: string) {
  const { error } = await supabase.from("copy_history").delete().eq("user_id", userId);
  if (error) throw error;
}

// ---------- export / import / reset ----------

export interface ExportFile {
  app: "infovault";
  version: 1;
  exportedAt: string;
  profile: { display_name: string; personal: RecordData };
  settings: Settings;
  records: Record<string, RecordData[]>;
}

export function buildExport(vault: Vault): ExportFile {
  const records: Record<string, RecordData[]> = {};
  for (const def of RECORD_SECTIONS) records[def.id] = vault.records[def.id].map((r) => r.data);
  return {
    app: "infovault",
    version: 1,
    exportedAt: new Date().toISOString(),
    profile: { display_name: vault.profile.display_name, personal: vault.profile.personal },
    settings: vault.profile.settings,
    records,
  };
}

const importSchema = z.object({
  app: z.literal("infovault"),
  version: z.literal(1),
  profile: z
    .object({
      display_name: z.string().max(100).optional(),
      personal: z.record(z.string(), z.unknown()).optional(),
    })
    .optional(),
  settings: z.unknown().optional(),
  records: z.record(z.string(), z.array(z.record(z.string(), z.unknown()))).optional(),
});

export interface ImportPreview {
  personalFields: number;
  counts: Partial<Record<RecordSectionId, number>>;
  skipped: number;
  valid: { section: RecordSectionId; data: RecordData }[];
  personal: RecordData;
  displayName?: string;
  settings?: Settings;
}

export function parseImport(text: string): ImportPreview {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }
  const res = importSchema.safeParse(json);
  if (!res.success) throw new Error("This doesn't look like an InfoVault export.");
  const file = res.data;

  const personal: RecordData = {};
  for (const f of PERSONAL_FIELDS) {
    const v = file.profile?.personal?.[f.key];
    if (typeof v === "string" && v.trim()) personal[f.key] = v.trim().slice(0, 20000);
  }

  const valid: ImportPreview["valid"] = [];
  const counts: ImportPreview["counts"] = {};
  let skipped = 0;
  for (const def of RECORD_SECTIONS) {
    const arr = file.records?.[def.id] ?? [];
    const schema = buildSchema(def.fields).partial();
    for (const item of arr) {
      const r = schema.safeParse(item);
      if (r.success) {
        valid.push({ section: def.id, data: r.data });
        counts[def.id] = (counts[def.id] ?? 0) + 1;
      } else skipped++;
    }
  }
  const s = settingsSchema.safeParse(file.settings);
  return {
    personalFields: Object.keys(personal).length,
    counts,
    skipped,
    valid,
    personal,
    displayName: file.profile?.display_name,
    settings: s.success ? ({ ...DEFAULT_SETTINGS, ...s.data } as Settings) : undefined,
  };
}

export async function applyImport(
  userId: string,
  current: Vault,
  preview: ImportPreview,
  replace: boolean,
) {
  if (replace) await wipeRecords(userId);
  const personal = replace
    ? preview.personal
    : { ...current.profile.personal, ...preview.personal };
  const { error } = await supabase
    .from("profiles")
    .update({
      personal: personal as Json,
      ...(preview.displayName ? { display_name: preview.displayName } : {}),
    })
    .eq("user_id", userId);
  if (error) throw error;

  for (const def of RECORD_SECTIONS) {
    const rows = preview.valid
      .filter((v) => v.section === def.id)
      .map((v) => ({ user_id: userId, data: v.data as Json }));
    if (rows.length) {
      const { error: e } = await tbl(def).insert(rows);
      if (e) throw e;
    }
  }
}

async function wipeRecords(userId: string) {
  for (const def of RECORD_SECTIONS) {
    const { error } = await tbl(def).delete().eq("user_id", userId);
    if (error) throw error;
  }
  await supabase.from("favorites").delete().eq("user_id", userId);
}

export async function resetAll(userId: string) {
  await wipeRecords(userId);
  await supabase.from("copy_history").delete().eq("user_id", userId);
  const { error } = await supabase
    .from("profiles")
    .update({ personal: {}, display_name: "" })
    .eq("user_id", userId);
  if (error) throw error;
}
