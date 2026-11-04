"use client";

import { usePathname, useRouter } from "next/navigation";
import { useRef, useTransition } from "react";
import { SORTS, type Find } from "@/lib/find";
import { CREATIVE_TYPES, TREND_STATUSES, type Vertical } from "@/lib/types";

/**
 * Search, filters and sort. Everything lives in the page address, so a
 * filtered view survives a reload and can be bookmarked.
 */
export function FindBar({ find, verticals, filtering }: { find: Find; verticals: Vertical[]; filtering: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const form = useRef<HTMLFormElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pending, startTransition] = useTransition();

  function apply() {
    if (!form.current) return;
    const params = new URLSearchParams();
    for (const [key, value] of new FormData(form.current).entries()) {
      const text = String(value).trim();
      if (text && !(key === "sort" && text === "newest")) params.set(key, text);
    }
    const query = params.toString();
    startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }));
  }

  /** Empties the boxes themselves, not only the address. The sort is kept. */
  function clear() {
    if (!form.current) return;
    if (timer.current) clearTimeout(timer.current);
    for (const name of ["q", "vertical", "type", "status"]) {
      const control = form.current.elements.namedItem(name);
      if (control instanceof HTMLInputElement || control instanceof HTMLSelectElement) control.value = "";
    }
    apply();
  }

  function applySoon() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(apply, 250);
  }

  return (
    <form
      ref={form}
      role="search"
      className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))]"
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
      aria-busy={pending}
    >
      <label className="flex flex-col gap-1 text-xs text-muted">
        Search
        <input
          name="q"
          type="search"
          defaultValue={find.q}
          placeholder="Search by name"
          className="field text-sm"
          onChange={applySoon}
        />
      </label>
      <Filter name="vertical" label="Vertical" value={find.vertical} options={verticals.map((v) => v.name)} onChange={apply} />
      <Filter name="type" label="Creative type" value={find.type} options={CREATIVE_TYPES} onChange={apply} />
      <Filter name="status" label="Trend status" value={find.status} options={TREND_STATUSES} onChange={apply} />
      <label className="flex flex-col gap-1 text-xs text-muted">
        Sort
        <select name="sort" defaultValue={find.sort} className="field text-sm" onChange={apply}>
          {Object.entries(SORTS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      {filtering && (
        <button
          type="button"
          onClick={clear}
          className="justify-self-start text-sm text-muted underline underline-offset-4 hover:text-foreground sm:col-span-2 lg:col-span-5"
        >
          Clear search and filters
        </button>
      )}
    </form>
  );
}

function Filter({
  name,
  label,
  value,
  options,
  onChange,
}: {
  name: string;
  label: string;
  value: string;
  options: readonly string[];
  onChange: () => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-muted">
      {label}
      <select name={name} defaultValue={value} className="field text-sm" onChange={onChange}>
        <option value="">All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
