import { describe, expect, it } from "vitest";
import { mapRow, prepareRows } from "./import";

const VERTICALS = [
  { id: 1, name: "Retail" },
  { id: 2, name: "CPG" },
  { id: 3, name: "App" },
  { id: 4, name: "Gaming" },
];
const good = { name: "GRWM Loading Bar", example_url: "https://www.tiktok.com/@creator/video/123" };
const prepare = (rows: Record<string, unknown>[], existing: string[] = []) => prepareRows(rows, 2, existing, VERTICALS);

describe("mapRow", () => {
  it("accepts the spreadsheet's own headers", () => {
    expect(mapRow({ Format: "A", "Opening Hook": "B", "AI Replicability": "4", "Why It Works": "C", "Symphony Prompt": "D", Notes: "ignored" })).toEqual({
      name: "A",
      hook: "B",
      ai_replicable: "4",
      why_works: "C",
      prompt: "D",
    });
  });
});

describe("prepareRows", () => {
  it("turns a full row into a scored format with verticals and an example", () => {
    const { ready, skipped } = prepare([
      { ...good, trend_status: "Rising", heat: "80", new_in_7_days: "4", ai_replicable: "5", ad_value: "4", verticals: "Gaming; App" },
    ]);
    expect(skipped).toEqual([]);
    expect(ready).toHaveLength(1);
    expect(ready[0].format.score).toBe(81);
    expect(ready[0].verticalIds).toEqual([4, 3]);
    expect(ready[0].example).toEqual({ url: good.example_url, platform: "TikTok" });
  });

  it("skips bad rows with the spreadsheet row number and the reason", () => {
    const { ready, skipped } = prepare([good, { name: "", example_url: "nope" }, { ...good, name: "Second", heat: "140" }]);
    expect(ready.map((r) => r.row)).toEqual([2]);
    expect(skipped).toEqual([
      { row: 3, name: "(no name)", reason: "Give the format a name. That doesn't look like a link. Paste the full address, starting with https://" },
      { row: 4, name: "Second", reason: "Heat must be between 0 and 100." },
    ]);
  });

  it("skips names already in the radar and repeats inside the file, ignoring case", () => {
    const { ready, skipped } = prepare([good, { ...good, name: "grwm loading bar" }, { ...good, name: "Old One" }], ["old one"]);
    expect(ready).toHaveLength(1);
    expect(skipped.map((s) => s.reason)).toEqual(["Already in your radar.", "Already in your radar."]);
  });

  it("uploading the same file twice adds nothing the second time", () => {
    const first = prepare([good, { ...good, name: "Second" }]);
    const second = prepare([good, { ...good, name: "Second" }], first.ready.map((r) => r.format.name));
    expect(second.ready).toEqual([]);
    expect(second.skipped).toHaveLength(2);
  });

  it("rejects a vertical that is not on the list", () => {
    const { ready, skipped } = prepare([{ ...good, verticals: "Gaming, Crypto" }]);
    expect(ready).toEqual([]);
    expect(skipped[0].reason).toMatch(/^Unknown vertical: Crypto\./);
  });

  it("reads markdown links and long dates", () => {
    const { ready } = prepare([{ ...good, example_url: "[watch](https://www.instagram.com/reel/abc/)", first_seen: "2026-10-11T00:00:00.000+08:00" }]);
    expect(ready[0].example).toEqual({ url: "https://www.instagram.com/reel/abc/", platform: "Instagram" });
    expect(ready[0].format.first_seen).toBe("2026-10-11");
  });

  it("ignores blank lines", () => {
    expect(prepare([{ name: "", example_url: " " }, good]).ready.map((r) => r.row)).toEqual([3]);
  });
});
