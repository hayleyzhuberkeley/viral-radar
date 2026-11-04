import { describe, expect, it } from "vitest";
import { applyFind, isFiltering, readFind } from "./find";
import type { FormatWithRelations } from "./formats";

let nextId = 1;
function format(over: Partial<FormatWithRelations> & { verticalNames?: string[] }): FormatWithRelations {
  const id = nextId++;
  const { verticalNames = [], ...rest } = over;
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
    created_at: `2026-11-0${id}T00:00:00Z`,
    verticals: verticalNames.map((name, i) => ({ id: i + 1, name })),
    examples: [],
    starred: false,
    ...rest,
  };
}

const formats = [
  format({ name: "GRWM Loading Bar", creative_type: "UGC with Avatar", trend_status: "Rising", score: 72, verticalNames: ["CPG", "Retail"] }),
  format({ name: "Toy Car to Real Car", creative_type: "CGI", trend_status: "Peak", score: 88, verticalNames: ["Gaming"] }),
  format({ name: "IRL Speedrun", creative_type: "UGC with Avatar", trend_status: "Rising", score: null, verticalNames: ["Gaming", "App"] }),
  format({ name: "airport security grab", creative_type: "Branding", trend_status: "Fading", score: 40, verticalNames: ["Retail"] }),
];
const names = (find: Parameters<typeof readFind>[0]) => applyFind([...formats], readFind(find)).map((f) => f.name);

describe("readFind", () => {
  it("defaults to newest with nothing filtered", () => {
    const find = readFind({});
    expect(find).toEqual({ q: "", vertical: "", type: "", status: "", sort: "newest" });
    expect(isFiltering(find)).toBe(false);
  });

  it("ignores a sort it does not know", () => {
    expect(readFind({ sort: "drop table" }).sort).toBe("newest");
  });
});

describe("applyFind", () => {
  it("searches the name, ignoring case", () => {
    expect(names({ q: "LOADING" })).toEqual(["GRWM Loading Bar"]);
    expect(names({ q: "car" })).toEqual(["Toy Car to Real Car"]);
  });

  it("filters by vertical", () => {
    expect(names({ vertical: "Gaming" })).toEqual(["IRL Speedrun", "Toy Car to Real Car"]);
  });

  it("combines filters", () => {
    expect(names({ vertical: "Gaming", type: "UGC with Avatar", status: "Rising" })).toEqual(["IRL Speedrun"]);
    expect(names({ vertical: "Dining" })).toEqual([]);
  });

  it("sorts newest first by default and oldest first on request", () => {
    expect(names({})[0]).toBe("airport security grab");
    expect(names({ sort: "oldest" })[0]).toBe("GRWM Loading Bar");
  });

  it("sorts by highest score with unscored formats last", () => {
    expect(names({ sort: "score" })).toEqual(["Toy Car to Real Car", "GRWM Loading Bar", "airport security grab", "IRL Speedrun"]);
  });

  it("sorts by name without caring about capitals", () => {
    expect(names({ sort: "name" })).toEqual(["airport security grab", "GRWM Loading Bar", "IRL Speedrun", "Toy Car to Real Car"]);
  });
});
