import { describe, expect, it } from "vitest";
import type { FormatWithRelations } from "./formats";
import { guideSteps, nextStep } from "./guide";

let nextId = 1;
function format(over: Partial<FormatWithRelations> = {}): FormatWithRelations {
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
    score: null,
    mechanic: null,
    hook: null,
    why_works: null,
    brand_usage: null,
    prompt: null,
    swaps: null,
    first_seen: null,
    created_at: "2026-11-04T00:00:00Z",
    verticals: [],
    examples: [],
    starred: false,
    ...over,
  };
}
const done = (formats: FormatWithRelations[]) => guideSteps(formats).map((s) => s.done);

describe("guideSteps", () => {
  it("has four steps in workflow order, none done for a new user", () => {
    const steps = guideSteps([]);
    expect(steps.map((s) => s.title)).toEqual(["Log a format", "Score it", "Star your shortlist", "Copy the brief"]);
    expect(steps.map((s) => s.done)).toEqual([false, false, false, false]);
    expect(steps[0].href).toBe("/formats/new");
  });

  it("ticks each step off from the user's own data", () => {
    expect(done([format()])).toEqual([true, false, false, false]);
    expect(done([format({ score: 70 })])).toEqual([true, true, false, false]);
    expect(done([format({ score: 70, starred: true })])).toEqual([true, true, true, false]);
    expect(done([format({ score: 70, starred: true, prompt: "Shot 1" })])).toEqual([true, true, true, true]);
  });

  it("points the score step at a format that still needs one", () => {
    const needs = format({ name: "Needs numbers" });
    const steps = guideSteps([format({ score: 80 }), needs]);
    expect(steps[1].href).toBe(`/formats/${needs.id}/edit`);
    expect(steps[1].action).toBe('Score "Needs numbers"');
  });
});

describe("nextStep", () => {
  it("walks one format through score, brief, star, hand over", () => {
    expect(nextStep(format()).action).toBe("Add the numbers");
    expect(nextStep(format({ score: 70 })).action).toBe("Add the brief");
    expect(nextStep(format({ score: 70, swaps: "Swap the product" })).text).toMatch(/^Next: star this format/);
    expect(nextStep(format({ score: 70, swaps: "Swap the product", starred: true })).text).toMatch(/^Ready to hand over/);
  });
});
