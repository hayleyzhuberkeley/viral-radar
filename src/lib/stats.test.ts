import { describe, expect, it } from "vitest";
import type { FormatWithRelations } from "./formats";
import { summarize } from "./stats";

const VERTICALS = ["Retail", "CPG", "App", "Gaming", "Leads & Services", "Dining"];
const NOW = new Date("2026-11-15T12:00:00Z");

let nextId = 1;
function format(score: number | null, verticalNames: string[] = [], created_at = "2026-11-03T00:00:00Z"): FormatWithRelations {
  const id = nextId++;
  return {
    id,
    user_id: "u",
    name: `Format ${id}`,
    creative_type: null,
    trend_status: null,
    region: null,
    heat: null,
    ai_replicable: null,
    ad_value: null,
    new_in_7_days: null,
    score,
    mechanic: null,
    hook: null,
    why_works: null,
    brand_usage: null,
    prompt: null,
    swaps: null,
    first_seen: null,
    created_at,
    verticals: verticalNames.map((name) => ({ id: VERTICALS.indexOf(name) + 1, name })),
    examples: [],
    starred: false,
  };
}

describe("summarize", () => {
  it("shows zeros and no average for a user with no formats", () => {
    const s = summarize([], VERTICALS, NOW);
    expect(s.total).toBe(0);
    expect(s.averageScore).toBeNull();
    expect(s.hottestVertical).toBeNull();
    expect(s.perVertical).toEqual(VERTICALS.map((name) => ({ name, count: 0 })));
  });

  it("counts formats and averages their scores", () => {
    const s = summarize([format(90), format(60), format(30)], VERTICALS, NOW);
    expect(s.total).toBe(3);
    expect(s.averageScore).toBe(60);
  });

  it("recalculates after a format is removed", () => {
    const s = summarize([format(90), format(60)], VERTICALS, NOW);
    expect(s.total).toBe(2);
    expect(s.averageScore).toBe(75);
  });

  it("leaves unscored formats out of the average but in the total", () => {
    const s = summarize([format(80), format(null), format(71)], VERTICALS, NOW);
    expect(s.total).toBe(3);
    expect(s.scored).toBe(2);
    expect(s.averageScore).toBe(75.5);
  });

  it("rounds the average to one decimal", () => {
    expect(summarize([format(70), format(70), format(71)], VERTICALS, NOW).averageScore).toBe(70.3);
  });

  it("counts a format once for each of its verticals", () => {
    const s = summarize([format(1, ["Gaming", "App"]), format(1, ["Gaming"])], VERTICALS, NOW);
    expect(s.perVertical.find((v) => v.name === "Gaming")?.count).toBe(2);
    expect(s.perVertical.find((v) => v.name === "App")?.count).toBe(1);
    expect(s.perVertical.find((v) => v.name === "Dining")?.count).toBe(0);
  });

  it("picks the hottest vertical from this month only", () => {
    const s = summarize(
      [
        format(1, ["Retail"], "2026-10-20T00:00:00Z"),
        format(1, ["Retail"], "2026-10-21T00:00:00Z"),
        format(1, ["Retail"], "2026-10-22T00:00:00Z"),
        format(1, ["Gaming"], "2026-11-02T00:00:00Z"),
        format(1, ["Gaming"], "2026-11-09T00:00:00Z"),
        format(1, ["CPG"], "2026-11-10T00:00:00Z"),
      ],
      VERTICALS,
      NOW,
    );
    expect(s.hottestVertical).toEqual({ name: "Gaming", count: 2 });
  });

  it("breaks a tie for hottest vertical alphabetically", () => {
    const s = summarize([format(1, ["Gaming"]), format(1, ["App"])], VERTICALS, NOW);
    expect(s.hottestVertical).toEqual({ name: "App", count: 1 });
  });
});
