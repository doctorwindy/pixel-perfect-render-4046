import { Copy, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PERSONAL_GROUPS, isEmptyValue } from "@/lib/schema";
import { valueToString } from "@/lib/vault-utils";
import { useVault } from "@/lib/vault-context";
import { PageHeader } from "./basics";
import { CopyField } from "./copy-field";

export function PersonalView() {
  const v = useVault();
  const { personal } = v.vault.profile;

  const copyAll = () => {
    const lines = PERSONAL_GROUPS.flatMap((g) =>
      g.fields
        .filter((f) => !f.sensitive && !isEmptyValue(personal[f.key]))
        .map((f) => `${f.label}: ${valueToString(f, personal[f.key])}`),
    );
    v.copy(lines.join("\n"), { label: "personal info" });
  };

  return (
    <div>
      <PageHeader
        title="Personal"
        icon={User}
        tint="teal"
        description="Click the pencil to edit a field. Sensitive fields stay hidden until you reveal them."
        actions={
          <Button variant="secondary" onClick={copyAll}>
            <Copy /> Copy summary
          </Button>
        }
      />
      <div className="space-y-5">
        {PERSONAL_GROUPS.map((g) => (
          <section key={g.id} className="glass-slab p-2" aria-labelledby={`pg-${g.id}`}>
            <h2 id={`pg-${g.id}`} className="px-3 pb-1 pt-3 text-sm font-semibold text-muted-foreground">
              {g.label}
            </h2>
            <div className="grid sm:grid-cols-2">
              {g.fields.map((f) => (
                <div key={f.key} className={f.wide ? "sm:col-span-2" : undefined}>
                  <CopyField section="personal" recordId={null} def={f} value={personal[f.key] ?? ""} editable />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
