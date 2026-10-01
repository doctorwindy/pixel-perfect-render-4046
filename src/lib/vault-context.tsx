import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import { ClipboardTray, type CopyEvent } from "@/components/vault/clipboard-tray";
import { VaultLoadingSkeleton } from "@/components/vault/loading-skeleton";
import {
  clearHistory as clearHistoryRemote,
  deleteRecord as deleteRecordRemote,
  fetchVault,
  logCopy,
  saveProfileMeta,
  savePersonal,
  saveRecord as saveRecordRemote,
  setFavorite,
} from "@/lib/data/vault";
import type { RecordData, RecordSectionId } from "@/lib/schema";
import {
  flatten,
  formatItems,
  type FlatItem,
  type Settings,
  type Vault,
} from "@/lib/vault-utils";

async function writeClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

interface CopyOpts {
  label: string;
  key?: string | undefined;
  /** Element the copy started from; the copied value flies out of it. */
  from?: Element | null | undefined;
  /** Sensitive values are never previewed on screen. */
  sensitive?: boolean | undefined;
}

interface VaultApi {
  user: User;
  vault: Vault;
  items: FlatItem[];
  itemMap: Map<string, FlatItem>;
  favorites: Set<string>;
  copy: (text: string, opts: CopyOpts) => Promise<boolean>;
  toggleFavorite: (key: string) => void;
  selected: string[];
  isSelected: (key: string) => boolean;
  toggleSelect: (key: string) => void;
  clearSelection: () => void;
  copySelected: (from?: Element | null) => Promise<void>;
  isRevealed: (key: string) => boolean;
  toggleReveal: (key: string) => void;
  saveRecord: (section: RecordSectionId, id: string | null, data: RecordData) => Promise<void>;
  deleteRecord: (section: RecordSectionId, id: string) => Promise<void>;
  savePersonalField: (key: string, value: string) => Promise<void>;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
  updateProfile: (patch: { display_name?: string; onboarded?: boolean }) => Promise<void>;
  clearHistory: () => Promise<void>;
  refresh: () => Promise<void>;
  paletteOpen: boolean;
  setPaletteOpen: (o: boolean) => void;
}

// Keep one context instance across hot reloads so provider and consumers always match.
const g = globalThis as unknown as { __infovaultCtx?: import("react").Context<VaultApi | null> };
const Ctx = (g.__infovaultCtx ??= createContext<VaultApi | null>(null));

export function useVault() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useVault must be used inside VaultProvider");
  return v;
}

export const vaultKey = (userId: string) => ["vault", userId] as const;

export function VaultProvider({ user, children }: { user: User; children: ReactNode }) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: vaultKey(user.id),
    queryFn: () => fetchVault(user.id),
    staleTime: 60_000,
  });

  if (q.isLoading) return <VaultLoadingSkeleton />;
  if (q.error || !q.data) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="glass-slab max-w-sm p-6 text-center">
          <h1 className="text-lg font-semibold text-heading">We couldn't load your vault</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Check your connection and try again.
          </p>
          <button
            className="mt-4 inline-flex h-10 items-center rounded-lg bg-gloss-primary px-4 text-sm font-medium"
            onClick={() => q.refetch()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  return (
    <Inner user={user} vault={q.data} qc={qc}>
      {children}
    </Inner>
  );
}

function Inner({
  user,
  vault,
  qc,
  children,
}: {
  user: User;
  vault: Vault;
  qc: ReturnType<typeof useQueryClient>;
  children: ReactNode;
}) {
  const key = vaultKey(user.id);
  const items = useMemo(() => flatten(vault), [vault]);
  const itemMap = useMemo(() => new Map(items.map((i) => [i.key, i])), [items]);
  const favorites = useMemo(() => new Set(vault.favorites), [vault.favorites]);
  const [selected, setSelected] = useState<string[]>([]);
  const [revealed, setRevealed] = useState<Record<string, number>>({});
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [manual, setManual] = useState<string | null>(null);
  const [copyEvent, setCopyEvent] = useState<CopyEvent | null>(null);
  const copyCount = useRef(0);
  const vaultRef = useRef(vault);
  vaultRef.current = vault;

  const patchCache = useCallback(
    (fn: (v: Vault) => Vault) => qc.setQueryData<Vault>(key, (old) => (old ? fn(old) : old)),
    [qc, key],
  );
  const refresh = useCallback(() => qc.invalidateQueries({ queryKey: key }), [qc, key]);

  const copy = useCallback<VaultApi["copy"]>(
    async (text, { label, key: itemKey, from, sensitive }) => {
      const ok = await writeClipboard(text);
      if (!ok) {
        setManual(text);
        return false;
      }
      // Only single fields get a preview, and never sensitive ones.
      const preview = !itemKey
        ? ""
        : sensitive
          ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
          : text.replace(/\s+/g, " ").trim().slice(0, 40);
      copyCount.current += 1;
      setCopyEvent({ id: copyCount.current, label, preview, from: from ?? null });
      if (itemKey && vaultRef.current.profile.settings.historyEnabled) {
        patchCache((v) => ({
          ...v,
          history: [
            { id: crypto.randomUUID(), item_key: itemKey, label, created_at: new Date().toISOString() },
            ...v.history,
          ].slice(0, 30),
        }));
        logCopy(user.id, itemKey, label).catch(() => undefined);
      }
      return true;
    },
    [patchCache, user.id],
  );

  const toggleFavorite = useCallback(
    (itemKey: string) => {
      const on = !vaultRef.current.favorites.includes(itemKey);
      patchCache((v) => ({
        ...v,
        favorites: on ? [itemKey, ...v.favorites] : v.favorites.filter((k) => k !== itemKey),
      }));
      setFavorite(user.id, itemKey, on).catch(() => {
        toast.error("Couldn't update favorites");
        refresh();
      });
    },
    [patchCache, refresh, user.id],
  );

  const toggleSelect = useCallback(
    (k: string) => setSelected((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k])),
    [],
  );
  const clearSelection = useCallback(() => setSelected([]), []);

  const copySelected = useCallback(async (from?: Element | null) => {
    const chosen = selected.map((k) => itemMap.get(k)).filter((i): i is FlatItem => !!i);
    if (!chosen.length) return;
    const text = formatItems(chosen, vault.profile.settings.multiCopyFormat);
    const ok = await copy(text, { label: `${chosen.length} fields`, from });
    if (ok) setSelected([]);
  }, [selected, itemMap, vault.profile.settings.multiCopyFormat, copy]);

  // drop selections whose items no longer exist
  useEffect(() => {
    setSelected((s) => {
      const next = s.filter((k) => itemMap.has(k));
      return next.length === s.length ? s : next;
    });
  }, [itemMap]);

  const toggleReveal = useCallback((k: string) => {
    setRevealed((r) => {
      const next = { ...r };
      if (next[k]) delete next[k];
      else next[k] = Date.now() + 15_000;
      return next;
    });
  }, []);

  // auto-hide revealed sensitive values
  useEffect(() => {
    if (!Object.keys(revealed).length) return;
    const t = setInterval(() => {
      setRevealed((r) => {
        const now = Date.now();
        const next = Object.fromEntries(Object.entries(r).filter(([, exp]) => exp > now));
        return Object.keys(next).length === Object.keys(r).length ? r : next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [revealed]);

  const saveRecord = useCallback<VaultApi["saveRecord"]>(
    async (section, id, data) => {
      await saveRecordRemote(user.id, section, id, data);
      await refresh();
    },
    [user.id, refresh],
  );
  const deleteRecord = useCallback<VaultApi["deleteRecord"]>(
    async (section, id) => {
      await deleteRecordRemote(user.id, section, id);
      await refresh();
    },
    [user.id, refresh],
  );
  const savePersonalField = useCallback<VaultApi["savePersonalField"]>(
    async (fieldKey, value) => {
      const next = { ...vaultRef.current.profile.personal, [fieldKey]: value };
      await savePersonal(user.id, next);
      patchCache((v) => ({ ...v, profile: { ...v.profile, personal: next } }));
    },
    [user.id, patchCache],
  );
  const updateSettings = useCallback<VaultApi["updateSettings"]>(
    async (patch) => {
      const settings = { ...vaultRef.current.profile.settings, ...patch };
      patchCache((v) => ({ ...v, profile: { ...v.profile, settings } }));
      await saveProfileMeta(user.id, { settings });
    },
    [user.id, patchCache],
  );
  const updateProfile = useCallback<VaultApi["updateProfile"]>(
    async (patch) => {
      patchCache((v) => ({ ...v, profile: { ...v.profile, ...patch } }));
      await saveProfileMeta(user.id, patch);
    },
    [user.id, patchCache],
  );
  const clearHistory = useCallback(async () => {
    await clearHistoryRemote(user.id);
    patchCache((v) => ({ ...v, history: [] }));
  }, [user.id, patchCache]);

  const api: VaultApi = {
    user,
    vault,
    items,
    itemMap,
    favorites,
    copy,
    toggleFavorite,
    selected,
    isSelected: (k) => selected.includes(k),
    toggleSelect,
    clearSelection,
    copySelected,
    isRevealed: (k) => !!revealed[k],
    toggleReveal,
    saveRecord,
    deleteRecord,
    savePersonalField,
    updateSettings,
    updateProfile,
    clearHistory,
    refresh,
    paletteOpen,
    setPaletteOpen,
  };

  return (
    <Ctx.Provider value={api}>
      {children}
      <ClipboardTray event={copyEvent} />
      <ManualCopy text={manual} onClose={() => setManual(null)} />
    </Ctx.Provider>
  );
}

function ManualCopy({ text, onClose }: { text: string | null; onClose: () => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (text !== null) setTimeout(() => ref.current?.select(), 50);
  }, [text]);
  if (text === null) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Copy manually"
      onClick={onClose}
    >
      <div className="glass-pop w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-base font-semibold text-heading">Copy manually</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your browser blocked automatic copying. Press Ctrl/Cmd + C to copy the selected text.
        </p>
        <textarea
          ref={ref}
          readOnly
          defaultValue={text}
          className="mt-3 h-40 w-full rounded-lg bg-card/70 p-3 text-sm shadow-inset-input outline-none"
        />
        <button
          onClick={onClose}
          className="mt-3 inline-flex h-10 items-center rounded-lg bg-gloss-primary px-4 text-sm font-medium"
        >
          Done
        </button>
      </div>
    </div>
  );
}
