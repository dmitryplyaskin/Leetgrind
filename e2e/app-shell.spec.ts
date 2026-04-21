import { expect, test } from "@playwright/test";

test("renders the Leetgrind app shell", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: "Leetgrind" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /AI mentor, coding practice/i })).toBeVisible();
  await expect(page.getByRole("button", { name: "Start setup" })).toBeVisible();
});

