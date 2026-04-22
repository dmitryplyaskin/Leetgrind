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
    page.getByRole("link", { name: /Update plan|Обновить план/i }),
  ).toBeVisible();

  await page.goto("/history");

  await expect(
    page.getByRole("heading", { name: /History|История/i }),
  ).toBeVisible();

  await page.goto("/settings/ai");

  await expect(
    page.getByRole("heading", {
      name: /Provider status, content RAG, and preview runs|Статус провайдера, content RAG и preview-запуски/i,
    }),
  ).toBeVisible();

  await page.goto("/settings/ai/providers");

  await expect(
    page.getByRole("heading", {
      name: /Configure OpenRouter and secure secrets|Настрой OpenRouter и secure storage секретов/i,
    }),
  ).toBeVisible();

  await page.goto("/skills/00000000-0000-0000-0000-000000000001");

  await expect(
    page.getByRole("heading", { name: /Skill detail|Детали навыка/i }),
  ).toBeVisible();

  await page.goto("/assessments/new");

  await expect(
    page.getByRole("heading", {
      name: /Start a focused assessment|Запусти точечную проверку/i,
    }),
  ).toBeVisible();

  await page.goto("/lessons");

  await expect(
    page.getByRole("heading", {
      name: /Follow-up lessons|Уроки по итогам/i,
    }),
  ).toBeVisible();

  await page.goto("/skills/00000000-0000-0000-0000-000000000001/lessons");

  await expect(
    page.getByRole("heading", {
      name: /Follow-up lessons|Уроки по итогам/i,
    }),
  ).toBeVisible();

  await page.goto("/goals/00000000-0000-0000-0000-000000000001");

  await expect(
    page.getByRole("heading", { name: /Goal detail|Детали цели/i }),
  ).toBeVisible();
});
