import { expect, test } from "@playwright/test";

test("opens the correct startup workspace", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("link", { name: "Leetgrind" })).toBeVisible();
  await expect(page.locator("h1").first()).toBeVisible();

  if (page.url().includes("/onboarding")) {
    await expect(page.getByRole("navigation")).toHaveCount(0);
    await expect(
      page.getByRole("heading", {
        name: /OpenRouter|Профиль и цель|Profile and goal/i,
      }),
    ).toBeVisible();
  } else {
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("navigation")).toBeVisible();
  }
});

test("starts onboarding with provider setup on a fresh profile", async ({ page }) => {
  await page.goto("/onboarding", { waitUntil: "domcontentloaded" });

  await expect(
    page.getByRole("heading", { name: /OpenRouter/i }),
  ).toBeVisible();
  await expect(
    page.getByLabel(/OpenRouter API key|API-ключ OpenRouter/i),
  ).toBeVisible();
  await expect(
    page.getByLabel(/Goal title|Название цели/i),
  ).toHaveCount(0);
});

test("resolves protected routes through the onboarding gate", async ({ page }) => {
  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });

  if (page.url().includes("/onboarding")) {
    await expect(
      page.getByRole("heading", {
        name: /OpenRouter|Профиль и цель|Profile and goal/i,
      }),
    ).toBeVisible();
  } else {
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("heading")).toBeVisible();
  }
});
