import path from "node:path";
import { expect, test } from "@playwright/test";
import { apiAs, logInAs } from "./helpers";

/**
 * CSV import: valid rows become formats, bad rows are listed with the reason,
 * and uploading the same file twice adds nothing.
 */
const FILE = path.join(__dirname, "fixtures", "import.csv");

test.describe("csv import", () => {
  const cleanUp = async () => {
    const a = await apiAs("A");
    await a.from("formats").delete().like("name", "Import test %");
  };
  test.beforeAll(cleanUp);
  test.afterAll(cleanUp);

  test("imports good rows, reports bad ones, and does not duplicate", async ({ page }) => {
    await logInAs(page, "A");
    await page.getByRole("link", { name: "Import", exact: true }).click();

    await page.getByLabel("CSV file").setInputFiles(FILE);
    await page.getByRole("button", { name: /^Import/ }).click();

    const report = page.getByTestId("import-report");
    await expect(report).toContainText("2 imported, 3 skipped, out of 5 rows.");
    await expect(report.getByRole("row", { name: /^4 \(no name\) Give the format a name\./ })).toBeVisible();
    await expect(report.getByRole("row", { name: /^5 Import test Delta That doesn't look like a link/ })).toBeVisible();
    await expect(report.getByRole("row", { name: /^6 Import test Echo Unknown vertical: Crypto/ })).toBeVisible();

    // The imported format is a full format: scored, tagged, with its example link.
    await page.goto("/?q=Import+test+Alpha");
    await expect(page.getByTestId("card-score")).toHaveText("81.0");
    await page.getByRole("link", { name: "Import test Alpha" }).click();
    await expect(page.getByText('A hook with a comma, and a "quote"')).toBeVisible();
    await expect(page.getByRole("link", { name: "https://www.tiktok.com/@creator/video/111" })).toBeVisible();
    await expect(page.getByRole("main").getByText("Gaming", { exact: true })).toBeVisible();

    // Same file again: nothing new.
    await page.goto("/import");
    await page.getByLabel("CSV file").setInputFiles(FILE);
    await page.getByRole("button", { name: /^Import/ }).click();
    await expect(report).toContainText("0 imported, 5 skipped, out of 5 rows.");
    await expect(report.getByRole("row", { name: /^2 Import test Alpha Already in your radar\./ })).toBeVisible();

    const a = await apiAs("A");
    const { data } = await a.from("formats").select("name").like("name", "Import test %").order("name");
    expect(data).toEqual([{ name: "Import test Alpha" }, { name: "Import test Bravo" }]);
  });
});
