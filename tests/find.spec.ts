import { expect, test } from "@playwright/test";
import { apiAs, logInAs } from "./helpers";

/** Find things: search by name, filter, sort, and keep the view after a reload. */
const ROWS = [
  { name: "Find test Alpha loading bar", creative_type: "UGC with Avatar", trend_status: "Rising", vertical: "CPG" },
  { name: "Find test Bravo toy car", creative_type: "CGI", trend_status: "Peak", vertical: "Gaming" },
  { name: "Find test Charlie speedrun", creative_type: "UGC with Avatar", trend_status: "Rising", vertical: "Gaming" },
];

test.describe("find things", () => {
  test.beforeAll(async () => {
    const a = await apiAs("A");
    await a.from("formats").delete().like("name", "Find test %");
    const verticals = await a.from("verticals").select("id, name");
    for (const { vertical, ...format } of ROWS) {
      const { data, error } = await a.from("formats").insert(format).select("id").single();
      if (error) throw new Error(error.message);
      const vertical_id = verticals.data!.find((v) => v.name === vertical)!.id;
      await a.from("format_verticals").insert({ format_id: data.id, vertical_id });
    }
  });

  test.afterAll(async () => {
    const a = await apiAs("A");
    await a.from("formats").delete().like("name", "Find test %");
  });

  test("search, filter, sort, reload", async ({ page }) => {
    await logInAs(page, "A");
    const cards = page.getByTestId("format-list").getByRole("heading");

    // Search by name.
    await page.getByLabel("Search").fill("toy car");
    await expect(cards).toHaveText(["Find test Bravo toy car"]);
    await expect(page.getByTestId("count")).toContainText("1 of");

    // Clear, then filter by vertical and sort by name.
    await page.getByRole("button", { name: "Clear search and filters" }).click();
    await expect(page.getByLabel("Search")).toHaveValue("");
    await page.getByLabel("Vertical").selectOption("Gaming");
    await page.getByLabel("Sort").selectOption("name");
    await expect(cards).toHaveText(["Find test Bravo toy car", "Find test Charlie speedrun"]);

    // Add a second filter.
    await page.getByLabel("Creative type").selectOption("CGI");
    await expect(cards).toHaveText(["Find test Bravo toy car"]);

    // The view is in the address, so it survives a reload.
    await expect(page).toHaveURL(/vertical=Gaming/);
    await page.reload();
    await expect(page.getByLabel("Vertical")).toHaveValue("Gaming");
    await expect(page.getByLabel("Creative type")).toHaveValue("CGI");
    await expect(cards).toHaveText(["Find test Bravo toy car"]);

    // A combination with no matches says so.
    await page.getByLabel("Trend status").selectOption("Fading");
    await expect(page.getByText("Nothing matches that search and those filters.")).toBeVisible();

    // Clearing empties the boxes and brings everything back, keeping the sort.
    await page.getByRole("button", { name: "Clear search and filters" }).click();
    await expect(page.getByLabel("Vertical")).toHaveValue("");
    await expect(page.getByLabel("Trend status")).toHaveValue("");
    await expect(page.getByLabel("Sort")).toHaveValue("name");
    await expect(cards.filter({ hasText: "Find test" })).toHaveCount(3);
  });
});
