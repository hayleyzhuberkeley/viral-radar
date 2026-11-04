import { describe, expect, it } from "vitest";
import { validateFormat } from "./validation";

const good = { name: "GRWM Loading Bar", example_url: "https://www.tiktok.com/@creator/video/123" };

describe("validateFormat", () => {
  it("accepts a name and a link, and turns blanks into nulls", () => {
    const result = validateFormat({ ...good, heat: "", region: "", hook: "  " });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.heat).toBeNull();
      expect(result.data.region).toBeNull();
      expect(result.data.hook).toBeNull();
    }
  });

  it("asks for a name when it is blank or only spaces", () => {
    for (const name of ["", "   ", undefined]) {
      const result = validateFormat({ ...good, name });
      expect(result).toEqual({ ok: false, fieldErrors: { name: "Give the format a name." } });
    }
  });

  it("asks for an example link when it is blank", () => {
    const result = validateFormat({ ...good, example_url: "" });
    expect(result).toEqual({ ok: false, fieldErrors: { example_url: "Add a link to one example video." } });
  });

  it("refuses text that is not a link", () => {
    for (const example_url of ["tiktok video", "www.tiktok.com/x", "ftp://files.example.com/a", "https://nodot"]) {
      const result = validateFormat({ ...good, example_url });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.fieldErrors.example_url).toMatch(/doesn't look like a link/);
    }
  });

  it("keeps numbers inside their range", () => {
    const result = validateFormat({ ...good, heat: "140", ai_replicable: "0", ad_value: "2.5", new_in_7_days: "-1" });
    expect(result).toEqual({
      ok: false,
      fieldErrors: {
        heat: "Heat must be between 0 and 100.",
        ai_replicable: "AI replicability must be between 1 and 5.",
        ad_value: "Ad value must be a whole number.",
        new_in_7_days: "New videos in 7 days must be 0 or more.",
      },
    });
  });

  it("reports every bad field at once", () => {
    const result = validateFormat({ name: "", example_url: "nope", trend_status: "Exploding" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(Object.keys(result.fieldErrors).sort()).toEqual(["example_url", "name", "trend_status"]);
  });
});
