import { expect, test } from "@playwright/test";

const routineRoutes = ["/", "/dashboard", "/onboarding", "/lessons"];

const forbiddenRoutineCopy = [
  "local api",
  "works offline",
  "future phase",
  "ai can be configured later",
  "placeholder",
];

test.describe("frontend design quality", () => {
  test("loads shared design tokens and local typography", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const values = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      const body = getComputedStyle(document.body);
      const tokens = [
        "--lg-color-canvas",
        "--lg-color-surface",
        "--lg-color-text",
        "--lg-color-muted",
        "--lg-color-accent",
        "--lg-color-border",
        "--lg-radius-panel",
        "--lg-space-section",
      ];

      return {
        tokens: tokens.map((token) => [token, root.getPropertyValue(token).trim()]),
        fontFamily: body.fontFamily,
      };
    });

    expect(values.tokens).toEqual(
      expect.arrayContaining(
        values.tokens.map(([token, value]) => [token, expect.stringMatching(/\S/)]),
      ),
    );
    expect(values.fontFamily.toLowerCase()).toContain("figtree");
    expect(values.fontFamily.toLowerCase()).not.toContain("inter");
  });

  for (const route of routineRoutes) {
    test(`keeps ${route} usable in the first viewport`, async ({ page }) => {
      await page.goto(route, { waitUntil: "domcontentloaded" });

      await expect(page.getByRole("link", { name: "Leetgrind" })).toBeVisible();
      await expect(page.locator("h1").first()).toBeVisible();

      const hasHorizontalOverflow = await page.evaluate(() => {
        const root = document.documentElement;

        return root.scrollWidth > root.clientWidth + 2;
      });

      expect(hasHorizontalOverflow).toBe(false);
    });

    test(`keeps ${route} free of routine product copy regressions`, async ({
      page,
    }) => {
      await page.goto(route, { waitUntil: "domcontentloaded" });

      const bodyText = (await page.locator("body").innerText()).toLowerCase();

      for (const phrase of forbiddenRoutineCopy) {
        expect(bodyText).not.toContain(phrase);
      }

      expect(bodyText).not.toMatch(/\b(app|home|dashboard|onboarding|lessons)\.[a-z0-9_.-]+\b/);
    });
  }
});
