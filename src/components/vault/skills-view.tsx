import { ChevronDown, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { SECTION_BY_ID } from "@/lib/schema";
import type { VaultRecord } from "@/lib/vault-utils";
import { makeKey } from "@/lib/vault-utils";
import { useVault } from "@/lib/vault-context";
import { SectionIcon } from "./basics";
import { CopyIconButton } from "./copy-field";
import { RecordMenu } from "./record-card";
import { SectionPage, type RenderHelpers } from "./section-page";

const def = SECTION_BY_ID.skills;

const skillsOf = (r: VaultRecord) => ((r.data.skills as string[]) ?? []).filter(Boolean);

function SkillChip({ group, skill }: { group: VaultRecord; skill: string }) {
  const { copy } = useVault();
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      title={`Copy ${skill}`}
      onClick={async () => {
        if (await copy(skill, { label: skill, key: makeKey("skills", group.id, `skill:${skill}`) })) {
          setDone(true);
          setTimeout(() => setDone(false), 1000);
        }
      }}
      className={cn(
        "rounded-full px-3 py-1.5 text-sm font-medium transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring",
        done ? "bg-success/20 text-success" : "bg-card/80 text-foreground shadow-sm hover:bg-primary/10 hover:text-primary",
      )}
    >
      {done ? "Copied" : skill}
    </button>
  );
}

function GroupCard({ rec, h }: { rec: VaultRecord; h: RenderHelpers }) {
  const v = useVault();
  const name = def.title(rec.data);
  const skills = skillsOf(rec);
  const key = makeKey("skills", rec.id, "skills");
  return (
    <article className="glass-slab p-5">
      <header className="mb-3 flex items-center gap-3">
        <SectionIcon icon={def.icon} tint={def.tint} size="sm" />
        <h3 className="min-w-0 flex-1 truncate text-base font-semibold text-heading">{name}</h3>
        <span className="text-xs text-muted-foreground">{skills.length}</span>
        <CopyIconButton text={skills.join(", ")} label={`${name} skills`} itemKey={key} />
        <RecordMenu onEdit={h.edit} onDelete={h.remove}>
          <DropdownMenuItem onSelect={() => v.copy(skills.join("\n"), { label: `${name} (one per line)` })}>
            <Copy className="mr-2 h-4 w-4" /> Copy one per line
          </DropdownMenuItem>
        </RecordMenu>
      </header>
      {skills.length ? (
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <SkillChip key={s} group={rec} skill={s} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No skills yet. Edit to add some.</p>
      )}
    </article>
  );
}

function CopyAll({ records }: { records: VaultRecord[] }) {
  const v = useVault();
  const all = records.flatMap(skillsOf);
  if (!all.length) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">
          <Copy /> Copy all <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => v.copy(all.join(", "), { label: "all skills" })}>
          Comma separated
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() =>
            v.copy(
              records
                .filter((r) => skillsOf(r).length)
                .map((r) => `${def.title(r.data)}: ${skillsOf(r).join(", ")}`)
                .join("\n"),
              { label: "skills by group" },
            )
          }
        >
          Grouped, one line per group
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SkillsView() {
  return (
    <SectionPage
      def={def}
      renderRecord={(rec, h) => <GroupCard rec={rec} h={h} />}
      headerExtra={(records) => <CopyAll records={records} />}
    />
  );
}
