import { expect, test } from "@playwright/test";

test("opens onboarding on first launch", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("link", { name: "Leetgrind" })).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: /Build your starting skill map|Собери стартовую карту навыков/i,
    }),
  ).toBeVisible();
  await expect(page.getByRole("navigation")).toHaveCount(0);
});

test("keeps onboarding compact and empty on a fresh profile", async ({ page }) => {
  await page.goto("/onboarding?step=goals", { waitUntil: "domcontentloaded" });

  await expect(
    page.getByRole("button", { name: /Add the first goal|Добавить первую цель/i }),
  ).toBeVisible();
  await expect(
    page.getByText(/No goals yet|Цели пока не добавлены/i),
  ).toBeVisible();
  await expect(
    page.getByLabel(/Goal title|Название цели/i),
  ).toHaveCount(0);
});

test("redirects protected routes to onboarding until setup is complete", async ({ page }) => {
  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });

  await expect(page).toHaveURL(/\/onboarding/);
  await expect(
    page.getByRole("heading", {
      name: /Build your starting skill map|Собери стартовую карту навыков/i,
    }),
  ).toBeVisible();
});
