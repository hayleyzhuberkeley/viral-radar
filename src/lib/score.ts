import type { TrendStatus } from "@/lib/types";

export type ScoreInputs = {
  heat: number | null;
  new_in_7_days: number | null;
  trend_status: TrendStatus | string | null;
  ai_replicable: number | null;
  verticalCount: number;
  ad_value: number | null;
};

export type ScorePart = {
  label: string;
  /** Share of the final score this part can contribute, out of 100. */
  weight: number;
  /** Points earned, to one decimal. */
  points: number;
  detail: string;
};

export type ScoreResult = { score: number; parts: ScorePart[] };

const WEIGHTS = { heat: 30, freshness: 20, ai: 25, breadth: 15, ad: 10 } as const;
const STATUS_BONUS: Record<string, number> = { Rising: 0.4, Peak: 0.4, Steady: 0.15, Fading: 0 };

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * The composite score, 0 to 100.
 *
 *   freshness = 0.6 × min(1, new_in_7_days / 8) + status bonus
 *   breadth   = min(1, verticals / 3)
 *   score     = 30 × heat/100 + 20 × freshness + 25 × ai/5 + 15 × breadth + 10 × ad/5
 *
 * Heat, AI replicability and ad value are needed for a score. Without all
 * three the result is null rather than a misleadingly low number. The other
 * inputs count as zero when missing.
 */
export function computeScore(input: ScoreInputs): ScoreResult | null {
  if (input.heat === null || input.ai_replicable === null || input.ad_value === null) return null;

  const newVideos = input.new_in_7_days ?? 0;
  const bonus = STATUS_BONUS[input.trend_status ?? ""] ?? 0;
  const freshness = clamp01(0.6 * clamp01(newVideos / 8) + bonus);
  const breadth = clamp01(input.verticalCount / 3);

  const raw = [
    { label: "Heat", weight: WEIGHTS.heat, share: clamp01(input.heat / 100), detail: `${input.heat} of 100` },
    {
      label: "Freshness",
      weight: WEIGHTS.freshness,
      share: freshness,
      detail: `${newVideos} new in 7 days, ${input.trend_status ?? "no status"}`,
    },
    { label: "AI replicability", weight: WEIGHTS.ai, share: clamp01(input.ai_replicable / 5), detail: `${input.ai_replicable} of 5` },
    {
      label: "Vertical breadth",
      weight: WEIGHTS.breadth,
      share: breadth,
      detail: `${input.verticalCount} ${input.verticalCount === 1 ? "vertical" : "verticals"}, 3 is full marks`,
    },
    { label: "Ad value", weight: WEIGHTS.ad, share: clamp01(input.ad_value / 5), detail: `${input.ad_value} of 5` },
  ];

  const total = raw.reduce((sum, part) => sum + part.weight * part.share, 0);
  return {
    score: round1(total),
    parts: raw.map(({ share, ...part }) => ({ ...part, points: round1(part.weight * share) })),
  };
}
