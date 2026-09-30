import { ChevronDown, Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { isEmptyValue, type RecordSectionDef } from "@/lib/schema";
import { formatRecord, type RecordCopyFormat, type VaultRecord } from "@/lib/vault-utils";
import { useVault } from "@/lib/vault-context";
import { CopyField } from "./copy-field";
import { SectionIcon, StatusBadge } from "./basics";

const FORMAT_LABEL: Record<RecordCopyFormat, string> = {
  block: "Labelled block",
  line: "Single line",
  json: "JSON",
};

export function RecordMenu({
  onEdit,
  onDelete,
  children,
}: {
  onEdit: () => void;
  onDelete: () => void;
  children?: React.ReactNode;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="More actions"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {children}
        {children ? <DropdownMenuSeparator /> : null}
        <DropdownMenuItem onSelect={onEdit}>
          <Pencil className="mr-2 h-4 w-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onDelete} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function RecordCard({
  def,
  record,
  onEdit,
  onDelete,
}: {
  def: RecordSectionDef;
  record: VaultRecord;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const v = useVault();
  const title = def.title(record.data);
  const subtitle = def.subtitle?.(record.data);
  const badgeField = def.badgeKey ? def.fields.find((f) => f.key === def.badgeKey) : undefined;
  const badgeValue = badgeField ? String(record.data[badgeField.key] ?? "") : "";
  const filled = def.fields.filter((f) => !isEmptyValue(record.data[f.key]));
  const fmt = v.vault.profile.settings.recordCopyFormat;

  const copyAs = (format: RecordCopyFormat, from?: Element | null) =>
    v.copy(formatRecord(def.fields, record.data, format, title), { label: title, from });

  const setBadge = async (value: string) => {
    try {
      await v.saveRecord(def.id, record.id, { ...record.data, [badgeField!.key]: value });
    } catch {
      const { toast } = await import("sonner");
      toast.error("Couldn't update. Try again.");
    }
  };

  return (
    <article className="glass-slab flex flex-col p-2">
      <header className="flex items-start gap-3 px-3 pb-2 pt-3">
        <SectionIcon icon={def.icon} tint={def.tint} size="sm" />
        <div className="min-w-0 flex-1">
          <h3 className="type-card-title truncate text-heading">{title}</h3>
          {subtitle ? <p className="truncate text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        {badgeField && badgeField.options ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={`Change ${badgeField.label}`}
                className="inline-flex items-center gap-1 rounded-full focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
              >
                {badgeValue ? (
                  <StatusBadge value={badgeValue} />
                ) : (
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                    Set {badgeField.label.toLowerCase()}
                  </span>
                )}
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {badgeField.options.map((o) => (
                <DropdownMenuItem key={o} onSelect={() => setBadge(o)}>
                  <StatusBadge value={o} />
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
        <RecordMenu onEdit={onEdit} onDelete={onDelete}>
          {(Object.keys(FORMAT_LABEL) as RecordCopyFormat[]).map((f) => (
            <DropdownMenuItem key={f} onSelect={() => copyAs(f)}>
              <Copy className="mr-2 h-4 w-4" /> Copy as {FORMAT_LABEL[f].toLowerCase()}
            </DropdownMenuItem>
          ))}
        </RecordMenu>
      </header>

      {filled.length ? (
        <div className={cn("grid gap-x-2 sm:grid-cols-2")}>
          {filled.map((f) => (
            <div key={f.key} className={cn(f.wide && "sm:col-span-2")}>
              <CopyField section={def.id} recordId={record.id} def={f} value={record.data[f.key]} />
            </div>
          ))}
        </div>
      ) : (
        <p className="px-3 py-4 text-sm text-muted-foreground">Nothing filled in yet. Edit to add details.</p>
      )}

      <footer className="flex items-center gap-2 px-3 pb-3 pt-2">
        <Button size="sm" variant="secondary" onClick={(e) => copyAs(fmt, e.currentTarget)} disabled={!filled.length}>
          <Copy /> Copy record
        </Button>
        <Button size="sm" variant="ghost" onClick={onEdit}>
          <Pencil /> Edit
        </Button>
      </footer>
    </article>
  );
}
