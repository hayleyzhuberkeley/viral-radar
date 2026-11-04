import { expect, test } from "@playwright/test";
import { apiAs, logInAs } from "./helpers";

/**
 * Stars: a user can star a format, sees it in the Starred view, and can
 * unstar it. Nobody can star a format that belongs to someone else.
 */
const NAMES = ["Star test format one", "Star test format two"];

test.describe("stars", () => {
  let ids: number[] = [];

  test.beforeAll(async () => {
    const a = await apiAs("A");
    await a.from("formats").delete().like("name", "Star test format %");
    const { data, error } = await a.from("formats").insert(NAMES.map((name) => ({ name }))).select("id");
    if (error) throw new Error(error.message);
    ids = data.map((row) => row.id);
  });

  test.afterAll(async () => {
    const a = await apiAs("A");
    await a.from("formats").delete().like("name", "Star test format %");
  });

  test("star, see it under Starred, unstar", async ({ page }) => {
    await logInAs(page, "A");

    await page.goto("/starred");
    await expect(page.getByText("No starred formats yet.")).toBeVisible();

    await page.goto("/");
    await page.getByRole("button", { name: `Star ${NAMES[0]}`, exact: true }).click();
    await expect(page.getByRole("button", { name: `Unstar ${NAMES[0]}`, exact: true })).toBeVisible();

    await page.getByRole("link", { name: "Starred" }).click();
    await expect(page.getByRole("heading", { name: NAMES[0], exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: NAMES[1], exact: true })).toHaveCount(0);
    await expect(page.getByText("1 starred format")).toBeVisible();

    await page.getByRole("button", { name: `Unstar ${NAMES[0]}`, exact: true }).click();
    await expect(page.getByText("No starred formats yet.")).toBeVisible();
  });

  test("user B cannot star or see stars on user A's format", async () => {
    const a = await apiAs("A");
    await a.from("stars").insert({ format_id: ids[1] });

    const b = await apiAs("B");
    const attempt = await b.from("stars").insert({ format_id: ids[0] });
    expect(attempt.error).not.toBeNull();

    const seenByB = await b.from("stars").select("format_id");
    expect(seenByB.data).toEqual([]);

    const seenByA = await a.from("stars").select("format_id");
    expect(seenByA.data).toEqual([{ format_id: ids[1] }]);
  });
});
