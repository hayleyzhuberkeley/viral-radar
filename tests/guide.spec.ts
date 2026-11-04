import { expect, test } from "@playwright/test";
import { apiAs, logInAs } from "./helpers";

/**
 * Guidance: a new user sees the workflow as four steps, each ticked off from
 * their own data, and a format's page says what to do next.
 */
test.describe("guide", () => {
  const empty = async () => {
    const b = await apiAs("B");
    await b.from("formats").delete().gt("id", 0);
  };
  test.beforeAll(empty);
  test.afterAll(empty);

  test("walks a new user from an empty radar to a brief", async ({ page }) => {
    // The login page says who the app is for.
    await page.goto("/login");
    await expect(page.getByText("For brand and agency strategists")).toBeVisible();

    await logInAs(page, "B");
    const guide = page.getByTestId("guide");
    const steps = guide.getByRole("listitem");
    await expect(guide.getByText("0 of 4")).toBeVisible();
    await expect(steps).toHaveCount(4);
    await expect(steps.nth(0)).toHaveAttribute("aria-current", "step");
    await expect(page.getByText("Your radar is empty.")).toBeVisible();

    // Step 1 leads to the add form.
    await steps.nth(0).getByRole("link", { name: "Add format" }).click();
    await page.getByLabel("Name").fill("Guide test format");
    await page.getByLabel("Example link").fill("https://www.tiktok.com/@creator/video/123");
    await page.getByRole("button", { name: "Save format" }).click();
    await expect(page.getByTestId("next-step")).toContainText("add heat, AI replicability and ad value");

    // Back home, step 1 is done and step 2 is next, pointing at this format.
    await page.goto("/");
    await expect(guide.getByText("1 of 4")).toBeVisible();
    await expect(steps.nth(0)).toHaveAttribute("data-done", "true");
    await expect(steps.nth(1)).toHaveAttribute("aria-current", "step");
    await steps.nth(1).getByRole("link", { name: 'Score "Guide test format"' }).click();
    await page.getByLabel("Heat (0 to 100)").fill("80");
    await page.getByLabel("AI replicability (1 to 5)").fill("5");
    await page.getByLabel("Ad value (1 to 5)").fill("4");
    await page.getByLabel("Swap rules").fill("Swap the product. Never copy the creator.");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByTestId("next-step")).toContainText("star this format");

    // Star it: the page now says it is ready, and the guide is complete.
    await page.getByRole("button", { name: "Star Guide test format" }).click();
    await expect(page.getByTestId("next-step")).toContainText("Ready to hand over");
    await page.goto("/");
    await expect(page.getByTestId("guide")).toHaveCount(0);
  });

  test("the guide can be hidden and brought back", async ({ page }) => {
    await empty();
    await logInAs(page, "B");
    await page.getByTestId("guide").getByRole("button", { name: "Hide" }).click();
    await expect(page.getByTestId("guide")).toHaveCount(0);
    await page.reload();
    await expect(page.getByTestId("guide")).toHaveCount(0);
    await page.getByRole("button", { name: /Show how it works/ }).click();
    await expect(page.getByTestId("guide")).toBeVisible();
  });
});
