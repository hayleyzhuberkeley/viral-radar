import { expect, test } from "@playwright/test";
import { logInAs } from "./helpers";

/** Navigation: every item is a comfortable click target and the current page is marked. */
test("nav items are large enough to click and show the current page", async ({ page }) => {
  await logInAs(page, "B");
  const nav = page.getByRole("navigation", { name: "Main" });

  for (const name of ["Radar", "Dashboard", "Import"]) {
    const box = await nav.getByRole("link", { name, exact: true }).boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(40);
    expect(box!.width).toBeGreaterThanOrEqual(64);
  }

  await expect(nav.getByRole("link", { name: "Radar", exact: true })).toHaveAttribute("aria-current", "page");

  // Click near the edge of the item, not on the text.
  const dashboard = nav.getByRole("link", { name: "Dashboard", exact: true });
  await dashboard.click({ position: { x: 4, y: 4 } });
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(dashboard).toHaveAttribute("aria-current", "page");
  await expect(nav.getByRole("link", { name: "Radar", exact: true })).not.toHaveAttribute("aria-current", "page");

  await nav.getByRole("link", { name: "Import", exact: true }).click({ position: { x: 4, y: 36 } });
  await expect(page.getByRole("heading", { name: "Import from CSV" })).toBeVisible();

  // On a phone the header wraps instead of overflowing.
  await page.setViewportSize({ width: 375, height: 700 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
