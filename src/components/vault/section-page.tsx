import { Plus, Search } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { canMorph, morphClose, morphOpen } from "@/lib/morph";
import { type RecordData, type RecordSectionDef } from "@/lib/schema";
import { recordMatches, type VaultRecord } from "@/lib/vault-utils";
import { useVault } from "@/lib/vault-context";
import { ConfirmDialog, EmptyState, PageHeader } from "./basics";
import { RecordCard } from "./record-card";
import { RecordForm } from "./record-form";

export interface RenderHelpers {
  edit: () => void;
  remove: () => void;
}

export function SectionPage({
  def,
  renderRecord,
  headerExtra,
}: {
  def: RecordSectionDef;
  renderRecord?: (rec: VaultRecord, h: RenderHelpers) => ReactNode;
  headerExtra?: (records: VaultRecord[]) => ReactNode;
}) {
  const v = useVault();
  const records = v.vault.records[def.id];
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<VaultRecord | null>(null);
  const [deleting, setDeleting] = useState<VaultRecord | null>(null);
  const [animateFirstRecord, setAnimateFirstRecord] = useState(false);

  const badgeField = def.badgeKey ? def.fields.find((f) => f.key === def.badgeKey) : undefined;

  const visible = useMemo(
    () =>
      records.filter(
        (r) =>
          recordMatches(def, r.data, q) &&
          (filter === "all" || !badgeField || r.data[badgeField.key] === filter),
      ),
    [records, def, q, filter, badgeField],
  );

  const [morph, setMorph] = useState(false);
  const cardFor = (id: string) =>
    document.querySelector<HTMLElement>(`[data-record-id="${CSS.escape(id)}"]`);

  const openNew = () => {
    setMorph(false);
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (r: VaultRecord) => {
    const card = cardFor(r.id);
    const willMorph = !!card && canMorph();
    morphOpen(card, () => {
      setMorph(willMorph);
      setEditing(r);
      setFormOpen(true);
    });
  };
  const changeFormOpen = (o: boolean) => {
    if (o || !morph || !editing) {
      setFormOpen(o);
      return;
    }
    morphClose(cardFor(editing.id), () => setFormOpen(false));
  };

  const add = (
    <Button onClick={openNew}>
      <Plus /> Add {def.singular}
    </Button>
  );

  return (
    <div>
      <PageHeader
        title={def.label}
        icon={def.icon}
        tint={def.tint}
        description={`${records.length} ${records.length === 1 ? "entry" : "entries"}`}
        actions={
          records.length === 0 && !headerExtra ? undefined : (
          <>
            {headerExtra?.(records)}
            {records.length > 0 ? add : null}
          </>
          )
        }
      />

      {records.length > 0 ? (
        <div className="mb-5 space-y-3">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={def.searchPlaceholder}
              aria-label={def.searchPlaceholder}
              className="pl-10"
            />
          </div>
          {badgeField?.options ? (
            <div className="flex flex-wrap gap-1.5" role="group" aria-label={`Filter by ${badgeField.label}`}>
              {["all", ...badgeField.options].map((o) => {
                const count =
                  o === "all" ? records.length : records.filter((r) => r.data[badgeField.key] === o).length;
                if (o !== "all" && count === 0 && filter !== o) return null;
                return (
                  <button
                    key={o}
                    type="button"
                    aria-pressed={filter === o}
                    onClick={() => setFilter(o)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                      filter === o
                        ? "bg-gloss-primary text-primary-foreground"
                        : "bg-card/70 text-muted-foreground shadow-sm hover:text-foreground",
                    )}
                  >
                    {o === "all" ? "All" : o} <span className="opacity-70">{count}</span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}

      {records.length === 0 ? (
        <EmptyState
          icon={def.icon}
          tint={def.tint}
          title={def.emptyTitle}
          hint={def.emptyHint}
          action={add}
        />
      ) : visible.length === 0 ? (
        <p className="glass-slab p-8 text-center text-sm text-muted-foreground">Nothing matches your search.</p>
      ) : (
        <div className={cn("grid grid-cols-1 gap-4", !renderRecord && "xl:grid-cols-2")}>
          {visible.map((r, index) =>
            renderRecord ? (
              <div key={r.id} data-record-id={r.id} className={cn(animateFirstRecord && index === 0 && "first-record-arrive")}>
                {renderRecord(r, { edit: () => openEdit(r), remove: () => setDeleting(r) })}
              </div>
            ) : (
              <div key={r.id} data-record-id={r.id} className={cn(animateFirstRecord && index === 0 && "first-record-arrive")}>
                <RecordCard
                  def={def}
                  record={r}
                  onEdit={() => openEdit(r)}
                  onDelete={() => setDeleting(r)}
                />
              </div>
            ),
          )}
        </div>
      )}

      <RecordForm
        open={formOpen}
        onOpenChange={changeFormOpen}
        morph={morph}
        title={editing ? `Edit ${def.singular}` : `New ${def.singular}`}
        fields={def.fields}
        initial={editing?.data ?? null}
        onSubmit={async (data: RecordData) => {
          const isFirst = !editing && records.length === 0;
          if (isFirst) setAnimateFirstRecord(true);
          try {
            await v.saveRecord(def.id, editing?.id ?? null, data);
          } catch (error) {
            if (isFirst) setAnimateFirstRecord(false);
            throw error;
          }
          toast.success("Saved");
        }}
      />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete this ${def.singular}?`}
        description="This can't be undone."
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await v.deleteRecord(def.id, deleting.id);
            toast.success("Deleted");
          } catch {
            toast.error("Couldn't delete. Try again.");
          }
          setDeleting(null);
        }}
      />
    </div>
  );
}
