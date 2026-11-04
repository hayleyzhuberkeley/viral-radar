import type { FormatWithRelations } from "@/lib/formats";

export const SORTS = {
  newest: "Newest first",
  oldest: "Oldest first",
  score: "Highest score",
  name: "Name, A to Z",
} as const;
export type Sort = keyof typeof SORTS;

export type Find = {
  q: string;
  vertical: string;
  type: string;
  status: string;
  sort: Sort;
};

type Params = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

/** Reads search, filters and sort from the page address, ignoring anything unexpected. */
export function readFind(params: Params): Find {
  const sort = one(params.sort);
  return {
    q: one(params.q).trim(),
    vertical: one(params.vertical),
    type: one(params.type),
    status: one(params.status),
    sort: sort in SORTS ? (sort as Sort) : "newest",
  };
}

export function isFiltering(find: Find) {
  return Boolean(find.q || find.vertical || find.type || find.status);
}

/** Search by name, filter by vertical, creative type and trend status, then sort. */
export function applyFind(formats: FormatWithRelations[], find: Find): FormatWithRelations[] {
  const q = find.q.toLowerCase();
  const kept = formats.filter(
    (f) =>
      (!q || f.name.toLowerCase().includes(q)) &&
      (!find.vertical || f.verticals.some((v) => v.name === find.vertical)) &&
      (!find.type || f.creative_type === find.type) &&
      (!find.status || f.trend_status === find.status),
  );

  const byNewest = (a: FormatWithRelations, b: FormatWithRelations) =>
    b.created_at.localeCompare(a.created_at) || b.id - a.id;

  switch (find.sort) {
    case "oldest":
      return kept.sort((a, b) => -byNewest(a, b));
    case "name":
      return kept.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
    case "score":
      // Formats without a score go last, newest first among themselves.
      return kept.sort((a, b) => {
        if (a.score === null && b.score === null) return byNewest(a, b);
        if (a.score === null) return 1;
        if (b.score === null) return -1;
        return b.score - a.score || byNewest(a, b);
      });
    default:
      return kept.sort(byNewest);
  }
}
