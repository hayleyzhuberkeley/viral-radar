import { expect, test } from "@playwright/test";
import { apiAs, logInAs } from "./helpers";

/**
 * Data isolation: user B cannot see user A's data.
 *
 * Given user A has five formats and user B has none,
 * when B logs in and opens the list, the dashboard, and the direct link to one of A's formats,
 * then B sees an empty list, zero in every stat, and "Not found", and A's five formats are untouched.
 */
const NAMES = [1, 2, 3, 4, 5].map((n) => `Isolation test format ${n}`);

test.describe("data isolation", () => {
  let aFormatIds: number[] = [];

  test.beforeAll(async () => {
    const a = await apiAs("A");
    await a.from("formats").delete().like("name", "Isolation test format %");
    const { data, error } = await a
      .from("formats")
      .insert(NAMES.map((name) => ({ name })))
      .select("id");
    if (error) throw new Error(error.message);
    aFormatIds = data.map((row) => row.id);

    // B starts with nothing.
    const b = await apiAs("B");
    await b.from("formats").delete().gt("id", 0);
  });

  test.afterAll(async () => {
    const a = await apiAs("A");
    await a.from("formats").delete().like("name", "Isolation test format %");
  });

  test("user B cannot see user A's formats", async ({ page }) => {
    // B's list is empty.
    await logInAs(page, "B");
    await expect(page.getByText("Nothing logged yet.")).toBeVisible();
    await expect(page.getByText("Isolation test format")).toHaveCount(0);

    // The direct link to A's format, and its edit page, look like they do not exist.
    for (const path of [`/formats/${aFormatIds[0]}`, `/formats/${aFormatIds[0]}/edit`]) {
      const response = await page.goto(path);
      expect(response?.status()).toBe(404);
      await expect(page.getByRole("heading", { name: "Not found" })).toBeVisible();
      await expect(page.getByText("Isolation test format")).toHaveCount(0);
    }

    // B's dashboard counts none of A's formats.
    await page.goto("/dashboard");
    await expect(page.getByTestId("stat-total")).toHaveText("0");
    await expect(page.getByTestId("stat-average")).toHaveText("—");

    // Asking the database directly as B returns nothing, and B cannot delete A's rows.
    const b = await apiAs("B");
    const seenByB = await b.from("formats").select("id").in("id", aFormatIds);
    expect(seenByB.data).toEqual([]);
    await b.from("formats").delete().in("id", aFormatIds);

    // A still has all five.
    await logInAs(page, "A");
    for (const name of NAMES) {
      await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
    }
  });
});
