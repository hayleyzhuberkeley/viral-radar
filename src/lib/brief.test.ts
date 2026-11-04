import { describe, expect, it } from "vitest";
import { buildBrief } from "./brief";
import type { FormatWithRelations } from "./formats";

function format(over: Partial<FormatWithRelations> = {}): FormatWithRelations {
  return {
    id: 1,
    user_id: "u",
    name: "GRWM Loading Bar",
    creative_type: "UGC with Avatar",
    trend_status: "Rising",
    region: "Global",
    heat: 80,
    ai_replicable: 5,
    ad_value: 4,
    new_in_7_days: 4,
    score: 81,
    mechanic: "A loading counter runs from 0% to 100% over a get-ready routine.",
    hook: "Bare-faced creator with a 0% counter.",
    why_works: null,
    brand_usage: null,
    prompt: "Vertical 9:16 UGC video. Shot 1: [AVATAR] holds [PRODUCT].",
    swaps: "Swap: product, avatar. Never copy: the original creator's likeness.",
    first_seen: null,
    created_at: "2026-11-04T00:00:00Z",
    verticals: [
      { id: 1, name: "Retail" },
      { id: 2, name: "CPG" },
    ],
    examples: [{ id: 1, format_id: 1, platform: "TikTok", url: "https://www.tiktok.com/@creator/video/123", views: null, posted_on: null }],
    starred: false,
    ...over,
  };
}

describe("buildBrief", () => {
  it("puts the name, facts, prompt, swap rules and reference link in one block of text", () => {
    expect(buildBrief(format())).toBe(
      [
        "REPLICATION BRIEF: GRWM Loading Bar",
        "UGC with Avatar · Retail, CPG · Score 81.0",
        "OPENING HOOK\nBare-faced creator with a 0% counter.",
        "MECHANIC\nA loading counter runs from 0% to 100% over a get-ready routine.",
        "GENERATION PROMPT\nVertical 9:16 UGC video. Shot 1: [AVATAR] holds [PRODUCT].",
        "SWAP RULES\nSwap: product, avatar. Never copy: the original creator's likeness.",
        "REFERENCE\nhttps://www.tiktok.com/@creator/video/123",
      ].join("\n\n"),
    );
  });

  it("returns nothing when there is no prompt and no swap rules", () => {
    expect(buildBrief(format({ prompt: null, swaps: "   " }))).toBeNull();
  });

  it("works with only one of the two", () => {
    const brief = buildBrief(format({ swaps: null }));
    expect(brief).toContain("GENERATION PROMPT");
    expect(brief).not.toContain("SWAP RULES");
  });

  it("leaves out whatever is missing without leaving gaps", () => {
    const brief = buildBrief(format({ creative_type: null, verticals: [], score: null, hook: null, mechanic: null, examples: [] }));
    expect(brief).toBe(
      [
        "REPLICATION BRIEF: GRWM Loading Bar",
        "GENERATION PROMPT\nVertical 9:16 UGC video. Shot 1: [AVATAR] holds [PRODUCT].",
        "SWAP RULES\nSwap: product, avatar. Never copy: the original creator's likeness.",
      ].join("\n\n"),
    );
  });
});
