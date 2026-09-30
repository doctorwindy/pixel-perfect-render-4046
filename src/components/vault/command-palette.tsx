import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { NAV } from "@/lib/schema";
import { maskValue, type FlatItem } from "@/lib/vault-utils";
import { useVault } from "@/lib/vault-context";
import { SectionIcon } from "./basics";

function truncate(s: string, n = 70) {
  const one = s.replace(/\s+/g, " ");
  return one.length > n ? `${one.slice(0, n)}…` : one;
}

export function CommandPalette() {
  const v = useVault();
  const navigate = useNavigate();
  const { paletteOpen: open, setPaletteOpen: setOpen } = v;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const favItems = useMemo(
    () => v.vault.favorites.map((k) => v.itemMap.get(k)).filter((i): i is FlatItem => !!i),
    [v.vault.favorites, v.itemMap],
  );
  const recent = useMemo(() => {
    const seen = new Set<string>();
    const out: FlatItem[] = [];
    for (const h of v.vault.history) {
      const it = v.itemMap.get(h.item_key);
      if (it && !seen.has(it.key)) {
        seen.add(it.key);
        out.push(it);
      }
      if (out.length >= 5) break;
    }
    return out;
  }, [v.vault.history, v.itemMap]);

  const grouped = useMemo(() => {
    const m = new Map<string, FlatItem[]>();
    for (const i of v.items) {
      const arr = m.get(i.sectionLabel) ?? [];
      arr.push(i);
      m.set(i.sectionLabel, arr);
    }
    return [...m.entries()];
  }, [v.items]);

  const run = (item: FlatItem) => {
    setOpen(false);
    v.copy(item.value, { label: item.label === "Skill" ? item.value : item.label, key: item.key, sensitive: item.sensitive });
  };

  const row = (i: FlatItem, prefix: string) => (
    <CommandItem
      key={`${prefix}-${i.key}`}
      value={`${prefix} ${i.label} ${i.recordTitle} ${i.sectionLabel} ${i.sensitive ? "" : i.value}`}
      onSelect={() => run(i)}
    >
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">
          {i.label}
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            {i.section === "personal" ? "" : i.recordTitle}
          </span>
        </div>
        <div className="truncate text-xs text-muted-foreground">
          {i.sensitive ? maskValue(i.value) : truncate(i.value)}
        </div>
      </div>
      <span className="ml-3 shrink-0 text-xs text-muted-foreground">Enter to copy</span>
    </CommandItem>
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search everything you've saved…" />
      <CommandList className="max-h-[60vh]">
        <CommandEmpty>No matches. Try a different word.</CommandEmpty>
        {favItems.length ? (
          <CommandGroup heading="Favorites">{favItems.map((i) => row(i, "fav"))}</CommandGroup>
        ) : null}
        {recent.length ? (
          <CommandGroup heading="Recently copied">{recent.map((i) => row(i, "recent"))}</CommandGroup>
        ) : null}
        <CommandSeparator />
        <CommandGroup heading="Go to">
          {NAV.map((n) => (
            <CommandItem
              key={n.id}
              value={`go to ${n.label}`}
              onSelect={() => {
                setOpen(false);
                navigate({ to: n.path as "/overview" });
              }}
            >
              <SectionIcon icon={n.icon} tint={n.tint} size="sm" className="mr-3 !h-7 !w-7" />
              {n.label}
            </CommandItem>
          ))}
        </CommandGroup>
        {grouped.map(([label, list]) => (
          <CommandGroup key={label} heading={label}>
            {list.map((i) => row(i, "all"))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
