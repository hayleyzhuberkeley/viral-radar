import { expect, test } from "@playwright/test";
import { apiAs, logInAs } from "./helpers";

/** Replication brief: one button copies the prompt and the swap rules as plain text. */
const NAME = "Brief test format";

test.describe("replication brief", () => {
  let withBrief = 0;
  let withoutBrief = 0;

  test.beforeAll(async () => {
    const a = await apiAs("A");
    await a.from("formats").delete().like("name", "Brief test format%");
    const { data, error } = await a
      .from("formats")
      .insert([
        { name: NAME, prompt: "Shot 1: [AVATAR] holds [PRODUCT].", swaps: "Swap the product. Never copy the creator's likeness." },
        { name: `${NAME} empty` },
      ])
      .select("id, name");
    if (error) throw new Error(error.message);
    withBrief = data.find((r) => r.name === NAME)!.id;
    withoutBrief = data.find((r) => r.name !== NAME)!.id;
  });

  test.afterAll(async () => {
    const a = await apiAs("A");
    await a.from("formats").delete().like("name", "Brief test format%");
  });

  test("copies the brief to the clipboard", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await logInAs(page, "A");
    await page.goto(`/formats/${withBrief}`);

    await page.getByRole("button", { name: "Copy brief" }).click();
    await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();

    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toBe(
      [
        `REPLICATION BRIEF: ${NAME}`,
        "GENERATION PROMPT\nShot 1: [AVATAR] holds [PRODUCT].",
        "SWAP RULES\nSwap the product. Never copy the creator's likeness.",
      ].join("\n\n"),
    );
    // What is copied is exactly what is shown.
    await expect(page.getByTestId("brief")).toHaveText(copied);
  });

  test("a format with no prompt and no swap rules says so", async ({ page }) => {
    await logInAs(page, "A");
    await page.goto(`/formats/${withoutBrief}`);
    await expect(page.getByText("No brief yet.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy brief" })).toHaveCount(0);
  });
});
