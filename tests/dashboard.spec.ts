import { expect, test } from "@playwright/test";
import { apiAs, logInAs } from "./helpers";

/**
 * Dashboard: the summary stats calculate correctly.
 *
 * Given a user whose three formats have scores 90, 60 and 30,
 * when they open the dashboard,
 * then "Total formats" shows 3 and "Average score" shows 60.0,
 * and after they delete the format scored 30 it shows 2 and 75.0.
 */
test.describe("dashboard", () => {
  test.beforeAll(async () => {
    // User B is used here because every test leaves B with no formats.
    const b = await apiAs("B");
    await b.from("formats").delete().gt("id", 0);
    const { error } = await b.from("formats").insert([
      { name: "Dashboard test ninety", score: 90 },
      { name: "Dashboard test sixty", score: 60 },
      { name: "Dashboard test thirty", score: 30 },
    ]);
    if (error) throw new Error(error.message);
  });

  test.afterAll(async () => {
    const b = await apiAs("B");
    await b.from("formats").delete().gt("id", 0);
  });

  test("total and average score are correct, and update after a delete", async ({ page }) => {
    await logInAs(page, "B");
    await page.getByRole("link", { name: "Dashboard", exact: true }).click();

    await expect(page.getByTestId("stat-total")).toHaveText("3");
    await expect(page.getByTestId("stat-average")).toHaveText("60.0");

    // Delete the format scored 30 the way a person would.
    await page.goto("/");
    await page.getByRole("link", { name: "Dashboard test thirty" }).click();
    await page.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("button", { name: "Yes, delete" }).click();
    await expect(page.getByRole("heading", { name: "Your radar" })).toBeVisible();

    await page.goto("/dashboard");
    await expect(page.getByTestId("stat-total")).toHaveText("2");
    await expect(page.getByTestId("stat-average")).toHaveText("75.0");
  });
});
