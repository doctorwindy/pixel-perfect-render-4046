import { Plus, X } from "lucide-react";
import { useEffect, useState, type KeyboardEvent } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { buildSchema, emptyRecord, type FieldDef, type RecordData } from "@/lib/schema";

function TagsInput({
  value,
  onChange,
  id,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  id: string;
}) {
  const [text, setText] = useState("");
  const add = (raw: string) => {
    const parts = raw
      .split(/[,\n]/)
      .map((p) => p.trim())
      .filter(Boolean)
      .filter((p) => !value.includes(p));
    if (parts.length) onChange([...value, ...parts]);
    setText("");
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(text);
    } else if (e.key === "Backspace" && !text && value.length) {
      onChange(value.slice(0, -1));
    }
  };
  return (
    <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-lg bg-card/70 px-2 py-1.5 shadow-inset-input focus-within:ring-[3px] focus-within:ring-ring">
      {value.map((t) => (
        <span
          key={t}
          className="inline-flex items-center gap-1 rounded-full bg-primary/12 py-0.5 pl-2.5 pr-1 text-xs font-medium text-primary"
        >
          {t}
          <button
            type="button"
            aria-label={`Remove ${t}`}
            onClick={() => onChange(value.filter((x) => x !== t))}
            className="rounded-full p-0.5 hover:bg-primary/20"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKey}
        onBlur={() => text.trim() && add(text)}
        onPaste={(e) => {
          const t = e.clipboardData.getData("text");
          if (/[,\n]/.test(t)) {
            e.preventDefault();
            add(t);
          }
        }}
        placeholder={value.length ? "" : "Type and press Enter"}
        className="min-w-[8rem] flex-1 bg-transparent px-1 py-1 text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

function KvInput({
  value,
  onChange,
  suggestions,
}: {
  value: { label: string; value: string }[];
  onChange: (v: { label: string; value: string }[]) => void;
  suggestions?: string[] | undefined;
}) {
  const unused = (suggestions ?? []).filter((s) => !value.some((r) => r.label === s));
  return (
    <div className="space-y-2">
      {value.map((row, i) => (
        <div key={i} className="flex gap-2">
          <Input
            aria-label="Label"
            placeholder="Label"
            value={row.label}
            onChange={(e) => onChange(value.map((r, j) => (j === i ? { ...r, label: e.target.value } : r)))}
          />
          <Input
            aria-label="Value"
            placeholder="Value"
            value={row.value}
            onChange={(e) => onChange(value.map((r, j) => (j === i ? { ...r, value: e.target.value } : r)))}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Remove row"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
          >
            <X />
          </Button>
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-1.5">
        <Button type="button" size="sm" variant="secondary" onClick={() => onChange([...value, { label: "", value: "" }])}>
          <Plus /> Add row
        </Button>
        {unused.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange([...value, { label: s, value: "" }])}
            className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground"
          >
            + {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function clean(fields: FieldDef[], draft: RecordData): RecordData {
  const out: RecordData = {};
  for (const f of fields) {
    const v = draft[f.key];
    if (f.type === "lines") out[f.key] = (v as string[]).filter((l) => l.trim());
    else if (f.type === "tags") out[f.key] = v;
    else if (f.type === "kv")
      out[f.key] = (v as { label: string; value: string }[]).filter((r) => r.label.trim() || r.value.trim());
    else out[f.key] = typeof v === "string" ? v : "";
  }
  return out;
}

export function RecordForm({
  open,
  onOpenChange,
  title,
  fields,
  initial,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  fields: FieldDef[];
  initial: RecordData | null;
  onSubmit: (data: RecordData) => Promise<void>;
}) {
  const [draft, setDraft] = useState<RecordData>(emptyRecord(fields));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setDraft({ ...emptyRecord(fields), ...(initial ?? {}) });
      setErrors({});
    }
  }, [open, initial, fields]);

  const set = (key: string, v: unknown) => setDraft((d) => ({ ...d, [key]: v }));

  const submit = async () => {
    const data = clean(fields, draft);
    const res = buildSchema(fields).safeParse(data);
    if (!res.success) {
      const errs: Record<string, string> = {};
      for (const issue of res.error.issues) {
        const k = String(issue.path[0]);
        if (!errs[k]) errs[k] = issue.message;
      }
      setErrors(errs);
      return;
    }
    setSaving(true);
    try {
      await onSubmit(data);
      onOpenChange(false);
    } catch {
      toast.error("Couldn't save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Fill in what you need. Empty fields are hidden on the card.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="grid gap-4 sm:grid-cols-2"
        >
          {fields.map((f) => {
            const id = `f-${f.key}`;
            const err = errors[f.key];
            const val = draft[f.key];
            return (
              <div key={f.key} className={cn("space-y-1.5", f.wide && "sm:col-span-2")}>
                <Label htmlFor={id}>
                  {f.label}
                  {f.required ? <span className="text-destructive"> *</span> : null}
                  {f.sensitive ? <span className="ml-1.5 text-xs font-normal text-muted-foreground">(hidden by default)</span> : null}
                </Label>
                {f.type === "textarea" ? (
                  <Textarea
                    id={id}
                    rows={5}
                    className="h-auto"
                    value={String(val ?? "")}
                    onChange={(e) => set(f.key, e.target.value)}
                    placeholder={f.placeholder}
                  />
                ) : f.type === "lines" ? (
                  <Textarea
                    id={id}
                    rows={4}
                    className="h-auto"
                    value={(val as string[]).join("\n")}
                    onChange={(e) => set(f.key, e.target.value.split("\n"))}
                    placeholder={f.placeholder}
                  />
                ) : f.type === "tags" ? (
                  <TagsInput id={id} value={val as string[]} onChange={(v) => set(f.key, v)} />
                ) : f.type === "kv" ? (
                  <KvInput
                    value={val as { label: string; value: string }[]}
                    onChange={(v) => set(f.key, v)}
                    suggestions={f.kvSuggestions}
                  />
                ) : f.type === "select" ? (
                  <Select value={String(val ?? "")} onValueChange={(v) => set(f.key, v)}>
                    <SelectTrigger id={id}>
                      <SelectValue placeholder="Choose…" />
                    </SelectTrigger>
                    <SelectContent>
                      {f.options?.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={id}
                    type={f.type === "email" ? "email" : f.type === "tel" ? "tel" : f.type === "date" ? "date" : f.type === "month" ? "month" : "text"}
                    value={String(val ?? "")}
                    onChange={(e) => set(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    aria-invalid={!!err}
                  />
                )}
                {err ? <p className="text-xs text-destructive">{err}</p> : null}
              </div>
            );
          })}
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
