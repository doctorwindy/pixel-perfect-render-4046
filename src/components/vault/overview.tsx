import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  PERSONAL_CORE_KEYS,
  PERSONAL_FIELDS,
  QUICK_COPY_KEYS,
  RECORD_SECTIONS,
  isEmptyValue,
} from "@/lib/schema";
import { makeKey, maskValue, timeAgo, valueToString, type FlatItem } from "@/lib/vault-utils";
import { useVault } from "@/lib/vault-context";
import { PageHeader, SectionIcon } from "./basics";
import { CopyIconButton, IconAction } from "./copy-field";

const COMPLETENESS_SECTIONS = ["education", "experience", "skills", "projects"] as const;

function Row({ item, onUnstar, meta }: { item: FlatItem; onUnstar?: () => void; meta?: string }) {
  return (
    <li className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-accent/50">
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">
          {item.label}
          {item.section !== "personal" ? (
            <span className="ml-2 text-xs font-normal text-muted-foreground">{item.recordTitle}</span>
          ) : null}
        </div>
        <div className="truncate text-xs text-muted-foreground">
          {item.sensitive ? maskValue(item.value) : item.value.replace(/\s+/g, " ")}
        </div>
      </div>
      {meta ? <span className="shrink-0 text-[11px] text-muted-foreground">{meta}</span> : null}
      {onUnstar ? (
        <IconAction label={`Remove ${item.label} from favorites`} active onClick={onUnstar}>
          <Star className="h-4 w-4 fill-current text-tint-orange" />
        </IconAction>
      ) : null}
      <CopyIconButton text={item.value} label={item.label} itemKey={item.key} />
    </li>
  );
}

export function Overview() {
  const v = useVault();
  const { personal } = v.vault.profile;
  const name = v.vault.profile.display_name;

  const coreFilled = PERSONAL_CORE_KEYS.filter((k) => !isEmptyValue(personal[k])).length;
  const secFilled = COMPLETENESS_SECTIONS.filter((s) => v.vault.records[s].length > 0).length;
  const total = PERSONAL_CORE_KEYS.length + COMPLETENESS_SECTIONS.length;
  const pct = Math.round(((coreFilled + secFilled) / total) * 100);

  const missing: { label: string; path: string }[] = [
    ...PERSONAL_CORE_KEYS.filter((k) => isEmptyValue(personal[k])).map((k) => ({
      label: `Add ${PERSONAL_FIELDS.find((f) => f.key === k)!.label.toLowerCase()}`,
      path: "/personal",
    })),
    ...COMPLETENESS_SECTIONS.filter((s) => v.vault.records[s].length === 0).map((s) => {
      const d = RECORD_SECTIONS.find((r) => r.id === s)!;
      return { label: `Add your ${d.label.toLowerCase()}`, path: d.path };
    }),
  ].slice(0, 4);

  const favItems = v.vault.favorites
    .map((k) => v.itemMap.get(k))
    .filter((i): i is FlatItem => !!i)
    .slice(0, 8);

  const recent = v.vault.history
    .map((h) => ({ h, item: v.itemMap.get(h.item_key) }))
    .filter((r): r is { h: typeof r.h; item: FlatItem } => !!r.item)
    .slice(0, 6);

  const quick = QUICK_COPY_KEYS.map((k) => ({
    k,
    field: PERSONAL_FIELDS.find((f) => f.key === k)!,
    value: valueToString(PERSONAL_FIELDS.find((f) => f.key === k)!, personal[k]),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={name ? `Hello, ${name}` : "Overview"}
        description="Everything you need to copy, one click away."
      />

      <section className="glass-slab p-5" aria-labelledby="quick-copy">
        <h2 id="quick-copy" className="mb-3 text-sm font-semibold text-muted-foreground">
          Quick copy
        </h2>
        <div className="flex flex-wrap gap-2">
          {quick.map(({ k, field, value }) =>
            value ? (
              <button
                key={k}
                type="button"
                onClick={() => v.copy(value, { label: field.label, key: makeKey("personal", null, k) })}
                className="rounded-full bg-card/80 px-4 py-2 text-sm font-medium shadow-sm transition-all hover:bg-primary/10 hover:text-primary active:scale-95 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
              >
                {field.label}
              </button>
            ) : (
              <Link
                key={k}
                to="/personal"
                className="rounded-full border border-dashed border-border px-4 py-2 text-sm text-muted-foreground hover:text-primary"
              >
                + {field.label}
              </Link>
            ),
          )}
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="glass-slab p-5" aria-labelledby="complete">
          <div className="flex items-baseline justify-between">
            <h2 id="complete" className="text-sm font-semibold text-muted-foreground">
              Profile completeness
            </h2>
            <span className="text-2xl font-bold text-heading">{pct}%</span>
          </div>
          <Progress value={pct} className="mt-3 h-2.5" aria-label="Profile completeness" />
          {missing.length ? (
            <ul className="mt-4 space-y-1">
              {missing.map((m) => (
                <li key={m.label}>
                  <Link
                    to={m.path as "/personal"}
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-sm hover:bg-accent/50"
                  >
                    {m.label}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Your core profile is complete.</p>
          )}
        </section>

        <section className="glass-slab p-2" aria-labelledby="sections">
          <h2 id="sections" className="px-3 pb-1 pt-3 text-sm font-semibold text-muted-foreground">
            Your sections
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2">
            {RECORD_SECTIONS.map((s) => (
              <li key={s.id}>
                <Link
                  to={s.path as "/education"}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-accent/50"
                >
                  <SectionIcon icon={s.icon} tint={s.tint} size="sm" />
                  <span className="flex-1 text-sm font-medium">{s.label}</span>
                  <span className="text-sm text-muted-foreground">{v.vault.records[s.id].length}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="glass-slab p-2" aria-labelledby="favs">
          <h2 id="favs" className="flex items-center gap-2 px-3 pb-1 pt-3 text-sm font-semibold text-muted-foreground">
            <Star className="h-4 w-4" /> Favorites
          </h2>
          {favItems.length ? (
            <ul>
              {favItems.map((i) => (
                <Row key={i.key} item={i} onUnstar={() => v.toggleFavorite(i.key)} />
              ))}
            </ul>
          ) : (
            <p className="px-3 pb-4 pt-2 text-sm text-muted-foreground">
              Tap the star on any field to pin it here.
            </p>
          )}
        </section>

        <section className="glass-slab p-2" aria-labelledby="recent">
          <div className="flex items-center justify-between px-3 pb-1 pt-3">
            <h2 id="recent" className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Clock className="h-4 w-4" /> Recently copied
            </h2>
            {recent.length ? (
              <button
                type="button"
                onClick={() => v.clearHistory()}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                Clear
              </button>
            ) : null}
          </div>
          {recent.length ? (
            <ul>
              {recent.map(({ h, item }) => (
                <Row key={h.id} item={item} meta={timeAgo(h.created_at)} />
              ))}
            </ul>
          ) : (
            <p className="px-3 pb-4 pt-2 text-sm text-muted-foreground">
              {v.vault.profile.settings.historyEnabled
                ? "Fields you copy will show up here."
                : "Copy history is turned off in Settings."}
            </p>
          )}
        </section>
      </div>

    </div>
  );
}
