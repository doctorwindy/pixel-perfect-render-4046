import { Check, Copy, Eye, EyeOff, Pencil, Star, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { isEmptyValue, makeKeyFor, type FieldDef, type SectionId } from "@/lib/schema-keys";
import { maskValue, valueToString } from "@/lib/vault-utils";
import { useVault } from "@/lib/vault-context";
import { StatusBadge, Tag } from "./basics";

export function IconAction({
  label,
  onClick,
  active,
  children,
  className,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring",
        active && "text-primary",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function CopyIconButton({
  text,
  label,
  itemKey,
  className,
}: {
  text: string;
  label: string;
  itemKey?: string;
  className?: string;
}) {
  const { copy } = useVault();
  const [done, setDone] = useState(false);
  return (
    <IconAction
      label={`Copy ${label}`}
      className={className}
      onClick={async () => {
        if (await copy(text, { label, key: itemKey })) {
          setDone(true);
          setTimeout(() => setDone(false), 1400);
        }
      }}
    >
      {done ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
    </IconAction>
  );
}

function normalizeUrl(v: string) {
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

function DisplayValue({ def, value }: { def: FieldDef; value: unknown }) {
  switch (def.type) {
    case "tags":
      return (
        <div className="flex flex-wrap gap-1.5">
          {(value as string[]).map((t, i) => (
            <Tag key={`${t}-${i}`}>{t}</Tag>
          ))}
        </div>
      );
    case "lines":
      return (
        <ul className="list-disc space-y-0.5 pl-4">
          {(value as string[])
            .filter((l) => l.trim())
            .map((l, i) => (
              <li key={i}>{l}</li>
            ))}
        </ul>
      );
    case "kv":
      return (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5">
          {(value as { label: string; value: string }[])
            .filter((r) => r.label || r.value)
            .map((r, i) => (
              <div key={i} className="contents">
                <dt className="text-muted-foreground">{r.label}</dt>
                <dd className="font-medium">{r.value}</dd>
              </div>
            ))}
        </dl>
      );
    case "url":
      return (
        <a
          href={normalizeUrl(String(value))}
          target="_blank"
          rel="noreferrer noopener"
          className="break-all text-primary hover:underline"
        >
          {String(value)}
        </a>
      );
    case "select":
      return <StatusBadge value={String(value)} />;
    default:
      return <span className="whitespace-pre-wrap break-words">{String(value)}</span>;
  }
}

export function CopyField({
  section,
  recordId,
  def,
  value,
  editable,
}: {
  section: SectionId;
  recordId: string | null;
  def: FieldDef;
  value: unknown;
  editable?: boolean;
}) {
  const v = useVault();
  const key = makeKeyFor(section, recordId, def.key);
  const empty = isEmptyValue(value);
  const text = valueToString(def, value);
  const masked = !!def.sensitive && !empty && !v.isRevealed(key);
  const fav = v.favorites.has(key);
  const selected = v.isSelected(key);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const startEdit = () => {
    setDraft(typeof value === "string" ? value : "");
    setEditing(true);
  };
  const save = async () => {
    setSaving(true);
    try {
      await v.savePersonalField(def.key, draft.trim());
      setEditing(false);
    } catch {
      const { toast } = await import("sonner");
      toast.error("Couldn't save. Check the value and try again.");
    } finally {
      setSaving(false);
    }
  };

  const inputType =
    def.type === "email" ? "email" : def.type === "tel" ? "tel" : def.type === "date" ? "date" : "text";

  return (
    <div
      data-selected={selected}
      className={cn(
        "group flex items-start gap-2 rounded-xl px-3 py-2.5 transition-colors hover:bg-accent/50",
        selected && "bg-primary/10 hover:bg-primary/10",
      )}
    >
      {!empty && !editing ? (
        <Checkbox
          checked={selected}
          onCheckedChange={() => v.toggleSelect(key)}
          aria-label={`Select ${def.label}`}
          className={cn(
            "mt-0.5 shrink-0 transition-opacity",
            selected ? "opacity-100" : "opacity-60 group-hover:opacity-100 focus-visible:opacity-100",
          )}
        />
      ) : (
        <span className="w-4 shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium text-muted-foreground">{def.label}</div>
        <div className="mt-0.5 text-sm text-foreground">
          {editing ? (
            <div className="flex items-start gap-1.5">
              {def.type === "textarea" ? (
                <Textarea
                  autoFocus
                  rows={4}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setEditing(false);
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) save();
                  }}
                  className="h-auto"
                />
              ) : (
                <Input
                  autoFocus
                  type={inputType}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") save();
                    if (e.key === "Escape") setEditing(false);
                  }}
                  className="h-9"
                />
              )}
              <IconAction label="Save" onClick={save} className={cn("text-primary", saving && "opacity-50")}>
                <Check className="h-4 w-4" />
              </IconAction>
              <IconAction label="Cancel" onClick={() => setEditing(false)}>
                <X className="h-4 w-4" />
              </IconAction>
            </div>
          ) : empty ? (
            editable ? (
              <button
                type="button"
                onClick={startEdit}
                className="text-muted-foreground/70 hover:text-primary"
              >
                Add {def.label.toLowerCase()}
              </button>
            ) : (
              <span className="text-muted-foreground/60">—</span>
            )
          ) : masked ? (
            <span className="tracking-widest text-muted-foreground" aria-label="Hidden value">
              {maskValue(text)}
            </span>
          ) : (
            <DisplayValue def={def} value={value} />
          )}
        </div>
      </div>
      {!empty && !editing ? (
        <div className="flex shrink-0 items-center gap-0.5">
          {def.sensitive ? (
            <IconAction
              label={masked ? `Reveal ${def.label} for 15 seconds` : `Hide ${def.label}`}
              onClick={() => v.toggleReveal(key)}
            >
              {masked ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </IconAction>
          ) : null}
          {editable ? (
            <IconAction label={`Edit ${def.label}`} onClick={startEdit} className="sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100">
              <Pencil className="h-4 w-4" />
            </IconAction>
          ) : null}
          <IconAction
            label={fav ? `Remove ${def.label} from favorites` : `Add ${def.label} to favorites`}
            active={fav}
            onClick={() => v.toggleFavorite(key)}
            className={cn(!fav && "sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100")}
          >
            <Star className={cn("h-4 w-4", fav && "fill-current text-tint-orange")} />
          </IconAction>
          <CopyIconButton text={text} label={def.label} itemKey={key} />
        </div>
      ) : null}
    </div>
  );
}
