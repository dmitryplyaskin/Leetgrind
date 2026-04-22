# Frontend Design Contract

Last updated: 2026-04-22

This contract anchors Leetgrind UI work to the product goal: a local-first interview preparation workspace that is fast to scan, comfortable for long study sessions, and clear on mobile.

The guidance is based on OpenAI's March 20, 2026 article, "Designing delightful frontends with GPT-5.4", and adapts it for an application UI rather than a marketing site.

## Operating Model

Before non-trivial frontend work, define:

1. Visual thesis: the screen mood, density, and primary material.
2. Content plan: what the user should understand or do first, second, and third.
3. Interaction thesis: the small number of motions or state transitions that improve orientation.

For Leetgrind, default to a calm expert workspace:

- dense but readable information;
- minimal chrome;
- one clear accent color;
- strong type hierarchy;
- cards only when they contain an interaction, grouped data, or a focused status surface;
- production copy that helps the learner act, decide, understand data, or recover.

## Design System

Use Mantine v8 as the component source of truth. Shared primitives live in `packages/ui`; route composition lives in `apps/web`.

Theme configuration is centralized in `packages/ui/src/theme.ts`:

- `leetgrindTheme` defines Mantine defaults, typography, colors, radii, and component defaults.
- `leetgrindCssVariablesResolver` exposes stable `--lg-*` design tokens for app CSS and custom layout surfaces.
- `apps/web/src/main.tsx` loads local font packages and passes both the theme and resolver to `MantineProvider`.

Core tokens:

- `--lg-color-canvas`
- `--lg-color-surface`
- `--lg-color-surface-subtle`
- `--lg-color-text`
- `--lg-color-muted`
- `--lg-color-accent`
- `--lg-color-border`
- `--lg-radius-panel`
- `--lg-radius-control`
- `--lg-space-section`

Do not add one-off palettes, default Inter/system typography, or page-level visual styles that bypass these tokens unless the design contract is updated.

## Layout Rules

Product surfaces should start with the working context, not a marketing hero. The first viewport should show the most important user task or state.

Use:

- navigation, workspace, and secondary context as the primary app structure;
- full-width page sections or plain layouts for page organization;
- panels only for grouped data, forms, status summaries, or repeated interactive items;
- stable dimensions for graph, editor, toolbar, and metric surfaces;
- icon buttons for compact commands, with labels or accessible names.

Avoid:

- generic dashboard-card mosaics as the first impression;
- nested cards;
- decorative gradients behind routine app UI;
- large aspirational banners on operational screens;
- visible implementation terms except on settings and diagnostics screens where they support an action.

## Copy And Localization

All new visible UI copy in `apps/web` must be present in both Russian and English locale resources.

Copy should be direct and product-ready:

- headings name the thing the user can inspect or do;
- supporting text explains scope, freshness, or decision value in one sentence;
- empty states tell the user what is missing or what action is possible;
- settings and diagnostics screens may use technical terms when the term helps configure or troubleshoot.

Do not write prompt language, architectural reassurance, implementation labels, or placeholder marketing copy into the product interface.

## Imagery And Motion

Leetgrind is primarily an app UI, so imagery is optional for routine workspaces. Use visual assets when a screen needs a strong explanatory anchor, onboarding moment, or future landing surface.

Motion should improve orientation:

- route or section entrance should be restrained;
- hover/reveal states should clarify affordance;
- graph/editor interactions should preserve context;
- respect reduced-motion preferences.

Do not add ornamental motion that competes with study and coding tasks.

## Verification

Frontend changes should pass:

```powershell
pnpm typecheck
```

Run `pnpm test` for behavior changes.

Run `pnpm test:e2e` for app shell, route, layout, navigation, critical viewport, or design-system changes. Playwright must cover desktop and mobile Chromium. The design quality spec checks:

- first viewport shell rendering;
- no horizontal overflow on key routes;
- no unresolved localization keys on key routes;
- no forbidden implementation copy on routine product routes;
- design token availability.

When visual quality is the main task, inspect the rendered app in browser screenshots before calling the work complete.
