import { Download, Settings as SettingsIcon, Upload } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  applyImport,
  buildExport,
  parseImport,
  resetAll,
  type ImportPreview,
} from "@/lib/data/vault";
import { RECORD_SECTIONS } from "@/lib/schema";
import { cn } from "@/lib/utils";
import type { MultiCopyFormat, RecordCopyFormat, Theme } from "@/lib/vault-utils";
import { useVault } from "@/lib/vault-context";
import { ConfirmDialog, PageHeader } from "./basics";

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="glass-slab p-5" aria-label={title}>
      <h2 className="mb-3 text-sm font-semibold text-muted-foreground">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-xl bg-muted p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring",
            value === o.value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Row({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="text-sm font-medium">{title}</div>
        {hint ? <div className="text-xs text-muted-foreground">{hint}</div> : null}
      </div>
      {children}
    </div>
  );
}

function ImportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const v = useVault();
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [error, setError] = useState("");
  const [replace, setReplace] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setPreview(null);
    setError("");
    setReplace(false);
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    setPreview(null);
    if (file.size > 5_000_000) {
      setError("That file is too large (max 5 MB).");
      return;
    }
    try {
      setPreview(parseImport(await file.text()));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't read that file.");
    }
  };

  const confirm = async () => {
    if (!preview) return;
    setBusy(true);
    try {
      await applyImport(v.user.id, v.vault, preview, replace);
      await v.refresh();
      toast.success("Import complete");
      onOpenChange(false);
      reset();
    } catch {
      toast.error("Import failed. Nothing was lost — please try again.");
    } finally {
      setBusy(false);
    }
  };

  const total = preview ? preview.valid.length : 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import from JSON</DialogTitle>
          <DialogDescription>Choose a file you exported from InfoVault.</DialogDescription>
        </DialogHeader>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          aria-label="Choose JSON file"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <Button variant="secondary" onClick={() => fileRef.current?.click()}>
          <Upload /> Choose file
        </Button>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {preview ? (
          <div className="space-y-3 rounded-xl bg-muted/60 p-3 text-sm">
            <p>
              Found <strong>{preview.personalFields}</strong> personal fields and <strong>{total}</strong>{" "}
              records
              {preview.skipped ? `, skipped ${preview.skipped} invalid` : ""}.
            </p>
            <ul className="text-muted-foreground">
              {RECORD_SECTIONS.filter((s) => preview.counts[s.id]).map((s) => (
                <li key={s.id}>
                  {s.label}: {preview.counts[s.id]}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2">
              <Checkbox id="replace" checked={replace} onCheckedChange={(c) => setReplace(c === true)} />
              <Label htmlFor="replace" className="font-normal">
                Replace my existing data instead of adding to it
              </Label>
            </div>
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!preview || busy || (total === 0 && preview.personalFields === 0)} onClick={confirm}>
            {busy ? "Importing…" : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SettingsView() {
  const v = useVault();
  const s = v.vault.profile.settings;
  const [name, setName] = useState(v.vault.profile.display_name);
  const [importOpen, setImportOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const saveName = async () => {
    if (name.trim() === v.vault.profile.display_name) return;
    try {
      await v.updateProfile({ display_name: name.trim() });
      toast.success("Saved");
    } catch {
      toast.error("Couldn't save your name");
    }
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(buildExport(v.vault), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `infovault-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export downloaded");
  };

  const update = (patch: Parameters<typeof v.updateSettings>[0]) =>
    v.updateSettings(patch).catch(() => toast.error("Couldn't save that setting"));

  return (
    <div className="max-w-2xl space-y-5">
      <PageHeader title="Settings" icon={SettingsIcon} tint="gray" description={v.user.email ?? ""} />

      <Group title="Profile">
        <div className="space-y-1.5">
          <Label htmlFor="display-name">Display name</Label>
          <Input
            id="display-name"
            value={name}
            maxLength={100}
            onChange={(e) => setName(e.target.value)}
            onBlur={saveName}
            onKeyDown={(e) => e.key === "Enter" && saveName()}
          />
        </div>
      </Group>

      <Group title="Appearance">
        <Row title="Theme">
          <Segmented<Theme>
            label="Theme"
            value={s.theme}
            onChange={(theme) => update({ theme })}
            options={[
              { value: "system", label: "System" },
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
          />
        </Row>
      </Group>

      <Group title="Copying">
        <Row title="Multi-select format" hint="How several selected fields are pasted together.">
          <Segmented<MultiCopyFormat>
            label="Multi-select format"
            value={s.multiCopyFormat}
            onChange={(multiCopyFormat) => update({ multiCopyFormat })}
            options={[
              { value: "labels", label: "Label: value" },
              { value: "values", label: "Values only" },
            ]}
          />
        </Row>
        <Row title="Copy record format" hint="Used by the Copy record button.">
          <Segmented<RecordCopyFormat>
            label="Copy record format"
            value={s.recordCopyFormat}
            onChange={(recordCopyFormat) => update({ recordCopyFormat })}
            options={[
              { value: "block", label: "Block" },
              { value: "line", label: "Line" },
              { value: "json", label: "JSON" },
            ]}
          />
        </Row>
        <Row title="Keep copy history" hint="Stores only what you copied, never the value itself.">
          <div className="flex items-center gap-3">
            <Button size="sm" variant="ghost" onClick={() => v.clearHistory().then(() => toast.success("History cleared"))}>
              Clear
            </Button>
            <Switch
              checked={s.historyEnabled}
              onCheckedChange={(historyEnabled) => update({ historyEnabled })}
              aria-label="Keep copy history"
            />
          </div>
        </Row>
      </Group>

      <Group title="Your data">
        <Row title="Export" hint="Download everything as a JSON file.">
          <Button variant="secondary" onClick={exportData}>
            <Download /> Export JSON
          </Button>
        </Row>
        <Row title="Import" hint="Add data from an InfoVault export.">
          <Button variant="secondary" onClick={() => setImportOpen(true)}>
            <Upload /> Import JSON
          </Button>
        </Row>
        <Row title="Delete all data" hint="Removes every record from your vault. This can't be undone.">
          <Button variant="destructive" onClick={() => setResetOpen(true)}>
            Delete everything
          </Button>
        </Row>
      </Group>

      <ImportDialog open={importOpen} onOpenChange={setImportOpen} />
      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Delete all your data?"
        description="Every record, favorite and history entry will be permanently removed. Consider exporting first."
        confirmLabel="Delete everything"
        onConfirm={async () => {
          try {
            await resetAll(v.user.id);
            await v.refresh();
            toast.success("Your vault has been cleared");
          } catch {
            toast.error("Couldn't delete your data. Try again.");
          }
          setResetOpen(false);
        }}
      />
    </div>
  );
}
