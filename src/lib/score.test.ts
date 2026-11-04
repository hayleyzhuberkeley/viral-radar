import { describe, expect, it } from "vitest";
import { computeScore, type ScoreInputs } from "./score";

const base: ScoreInputs = { heat: 80, new_in_7_days: 4, trend_status: "Rising", ai_replicable: 5, verticalCount: 2, ad_value: 4 };

describe("computeScore", () => {
  it("matches the worked example in PLAN.md: 81.0", () => {
    const result = computeScore(base);
    expect(result?.score).toBe(81);
    expect(result?.parts.map((p) => p.points)).toEqual([24, 14, 25, 10, 8]);
  });

  it("gives 100 when everything is at its maximum", () => {
    expect(computeScore({ heat: 100, new_in_7_days: 8, trend_status: "Peak", ai_replicable: 5, verticalCount: 3, ad_value: 5 })?.score).toBe(100);
  });

  it("does not go past full marks for extra videos or extra verticals", () => {
    const capped = computeScore({ ...base, new_in_7_days: 500, verticalCount: 6 });
    const full = computeScore({ ...base, new_in_7_days: 8, verticalCount: 3 });
    expect(capped?.score).toBe(full?.score);
  });

  it("scores freshness by trend status", () => {
    const fresh = (trend_status: string | null) => computeScore({ ...base, trend_status })?.parts[1].points;
    expect(fresh("Rising")).toBe(14);
    expect(fresh("Peak")).toBe(14);
    expect(fresh("Steady")).toBe(9);
    expect(fresh("Fading")).toBe(6);
    expect(fresh(null)).toBe(6);
  });

  it("returns no score when heat, AI replicability or ad value is missing", () => {
    expect(computeScore({ ...base, heat: null })).toBeNull();
    expect(computeScore({ ...base, ai_replicable: null })).toBeNull();
    expect(computeScore({ ...base, ad_value: null })).toBeNull();
  });

  it("treats missing new videos and no verticals as zero", () => {
    const result = computeScore({ ...base, new_in_7_days: null, verticalCount: 0 });
    // 24 heat + 8 freshness (status bonus only) + 25 AI + 0 breadth + 8 ad
    expect(result?.score).toBe(65);
  });

  it("rounds to one decimal", () => {
    expect(computeScore({ ...base, heat: 72.9, verticalCount: 1 })?.score).toBe(73.9);
  });
});
