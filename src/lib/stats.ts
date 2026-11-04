import type { FormatWithRelations } from "@/lib/formats";

export type Summary = {
  /** How many formats the user has. */
  total: number;
  /** Mean score of the formats that have one, to one decimal. Null when none do. */
  averageScore: number | null;
  /** How many formats went into the average. */
  scored: number;
  /** The vertical with the most formats added this calendar month. Null when none were. */
  hottestVertical: { name: string; count: number } | null;
  /** Formats per vertical, for the chart. Every vertical is listed, even at zero. */
  perVertical: { name: string; count: number }[];
};

const round1 = (n: number) => Math.round(n * 10) / 10;

/** All dashboard numbers, computed from one user's formats. */
export function summarize(formats: FormatWithRelations[], verticalNames: string[], now: Date = new Date()): Summary {
  const scores = formats.map((f) => f.score).filter((s): s is number => s !== null);
  const averageScore = scores.length === 0 ? null : round1(scores.reduce((sum, s) => sum + s, 0) / scores.length);

  const counts = new Map(verticalNames.map((name) => [name, 0]));
  const thisMonth = new Map<string, number>();
  const monthStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);
  const nextMonth = Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1);

  for (const format of formats) {
    const added = Date.parse(format.created_at);
    const addedThisMonth = added >= monthStart && added < nextMonth;
    for (const vertical of format.verticals) {
      counts.set(vertical.name, (counts.get(vertical.name) ?? 0) + 1);
      if (addedThisMonth) thisMonth.set(vertical.name, (thisMonth.get(vertical.name) ?? 0) + 1);
    }
  }

  // Most formats wins. A tie goes to the name that comes first alphabetically.
  const hottest = [...thisMonth.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];

  return {
    total: formats.length,
    averageScore,
    scored: scores.length,
    hottestVertical: hottest ? { name: hottest[0], count: hottest[1] } : null,
    perVertical: [...counts.entries()].map(([name, count]) => ({ name, count })),
  };
}
