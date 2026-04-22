import { expect, test } from "@playwright/test";

test("renders the Leetgrind app shell", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: "Leetgrind" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /AI mentor, coding practice/i }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Start setup/i })).toBeVisible();
});

test("renders onboarding and dashboard routes", async ({ page }) => {
  await page.goto("/onboarding");

  await expect(
    page.getByRole("heading", { name: /interview plan|план подготовки/i }),
  ).toBeVisible();
  await expect(page.getByLabel(/Display name|Имя/i)).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Save draft|Сохранить черновик/i }),
  ).toBeVisible();

  await page.goto("/dashboard");

  await expect(
    page.getByRole("heading", {
      name: /Preparation dashboard|Дашборд подготовки/i,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Update setup|Обновить настройку/i }),
  ).toBeVisible();
});
