import { expect, test } from "@playwright/test";
import { apiAs, logInAs } from "./helpers";

/**
 * Composite score: given heat 80, 4 new videos in 7 days, status Rising,
 * AI replicability 5, two verticals and ad value 4, when the format is saved,
 * then its score is 81.0. Editing an input changes the score.
 */
const NAME = "Score test format";

test.describe("composite score", () => {
  const cleanUp = async () => {
    const a = await apiAs("A");
    await a.from("formats").delete().eq("name", NAME);
  };
  test.beforeAll(cleanUp);
  test.afterAll(cleanUp);

  test("is computed on save and recomputed on edit", async ({ page }) => {
    await logInAs(page, "A");
    await page.goto("/formats/new");

    await page.getByLabel("Name").fill(NAME);
    await page.getByLabel("Example link").fill("https://www.tiktok.com/@creator/video/123");
    await page.getByLabel("Trend status").selectOption("Rising");
    await page.getByLabel("Heat (0 to 100)").fill("80");
    await page.getByLabel("New videos in 7 days").fill("4");
    await page.getByLabel("AI replicability (1 to 5)").fill("5");
    await page.getByLabel("Ad value (1 to 5)").fill("4");
    await page.getByLabel("Gaming").check();
    await page.getByLabel("App", { exact: true }).check();
    await page.getByRole("button", { name: "Save format" }).click();

    await expect(page.getByTestId("score")).toContainText("81.0");

    // The card on the list shows the same number.
    await page.goto("/?q=Score+test");
    await expect(page.getByTestId("card-score")).toHaveText("81.0");

    // Dropping heat from 80 to 40 removes 12 points.
    await page.getByRole("link", { name: NAME }).click();
    await page.getByRole("link", { name: "Edit" }).first().click();
    await page.getByLabel("Heat (0 to 100)").fill("40");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByTestId("score")).toContainText("69.0");
  });
});
