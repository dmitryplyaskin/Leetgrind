# Testing Strategy

Last updated: 2026-04-21

Leetgrind uses testing as part of the GRACE verification gate. Tests should protect domain behavior, local persistence, API contracts, AI workflow structure, code execution safety, and core UI flows.

## Test Stack

- `Vitest`: unit and integration tests across apps and packages.
- `Testing Library`: React component tests.
- `jest-dom`: DOM assertions for component tests.
- `supertest`: Express API tests without binding a real port.
- `Playwright`: end-to-end browser smoke tests.
- Playwright desktop and mobile projects: viewport and app-shell design checks.
- `@vitest/coverage-v8`: coverage reporting.

## Commands

From the repository root:

```powershell
pnpm test
pnpm test:watch
pnpm test:coverage
pnpm test:e2e
pnpm typecheck
pnpm build
```

Default verification for code changes:

```powershell
pnpm typecheck
pnpm test
```

Run `pnpm build` when changing:

- package exports;
- tsconfig;
- Vite config;
- server entrypoints;
- database schema;
- build scripts;
- package dependencies.

Run `pnpm test:e2e` when changing:

- routing;
- app shell;
- design tokens, theme, typography, or shared UI primitives;
- onboarding;
- dashboard;
- coding practice UI;
- settings flows;
- anything that can break the first viewport or navigation.

## Test Types

### Unit Tests

Use for:

- pure domain rules;
- scheduling algorithms;
- RAG chunking;
- AI output normalization;
- result mappers;
- recommendation rules.

Preferred locations:

```txt
packages/*/src/*.test.ts
packages/*/src/**/*.test.ts
```

Rules:

- no network calls;
- no real provider credentials;
- deterministic inputs;
- assert behavior, not implementation details.

### Integration Tests

Use for:

- Express routes;
- tRPC procedures;
- repository behavior;
- database initialization;
- schema assumptions;
- AI provider adapter error normalization with mocked fetch.

Preferred locations:

```txt
apps/server/src/**/*.test.ts
packages/db/src/**/*.test.ts
packages/ai/src/**/*.test.ts
```

Rules:

- use temporary local databases where needed;
- avoid writing to the user's real local app data;
- mock remote providers.

### React Component Tests

Use for:

- shared UI primitives;
- route-level forms where browser e2e would be too slow;
- component accessibility and visible states;
- validation errors.

Preferred locations:

```txt
packages/ui/src/**/*.test.tsx
apps/web/src/**/*.test.tsx
```

Rules:

- use Testing Library queries by role, label, and visible text;
- avoid testing CSS implementation details;
- prefer user-visible behavior.

### End-To-End Tests

Use Playwright for:

- app shell smoke test;
- onboarding happy path;
- dashboard loads persisted state;
- settings flow;
- coding practice happy path;
- mock interview happy path.

Preferred location:

```txt
e2e/*.spec.ts
```

Rules:

- keep e2e tests few and high-value;
- run key UI checks against desktop and mobile Chromium projects;
- avoid testing every edge case through the browser;
- use deterministic seed data when persistence is involved;
- do not require real AI provider credentials.
- verify no horizontal overflow, unresolved localization keys, or non-actionable implementation copy on routine product routes when route layout changes.

## Module Testing Expectations

### `packages/domain`

Must have tests for:

- skill progress calculations;
- evidence aggregation;
- goal readiness rules;
- recommendation rules when implemented.

### `packages/db`

Must have tests for:

- schema initialization;
- repositories;
- evidence and attempts persistence;
- vector chunk metadata assumptions once RAG storage is implemented.

### `packages/ai`

Must have tests for:

- provider registry behavior;
- provider error normalization;
- structured output validation;
- missing credentials handling.

No tests should call paid or external AI providers by default.

### `packages/agents`

Must have tests for:

- workflow input validation;
- structured output parsing;
- evidence extraction from mocked AI outputs;
- agent run metadata.

### `packages/rag`

Must have tests for:

- chunking;
- source metadata preservation;
- retrieval filtering;
- context builder output shape.

### `packages/code-runner`

Must have tests for:

- timeout behavior;
- stdout/stderr capture;
- result normalization;
- test case reporting;
- unsafe execution protections.

### `packages/scheduling`

Must have tests for:

- SM-2 interval behavior;
- low-quality reset behavior;
- deterministic due date calculation.

### `packages/ui` and `apps/web`

Must have tests for:

- reusable component accessibility;
- critical forms;
- dashboard empty/loading/error states;
- route smoke tests.
- Russian and English rendering for user-facing route copy when localization is involved.

Localization tests should verify:

- locale fallback on first load;
- explicit language switch between `ru` and `en`;
- persistence of the user's UI language preference;
- absence of untranslated localization keys in critical screens.

### `apps/server`

Must have tests for:

- health endpoint;
- API validation;
- core tRPC procedures;
- application context creation.

## AI Testing Policy

AI-dependent code must be testable without real provider calls.

Use:

- fake `AiProvider` implementations;
- fixture model responses;
- structured output schemas;
- deterministic prompt inputs;
- snapshot-like fixtures only when stable.

Do not:

- call OpenAI/OpenRouter/Codex in normal tests;
- assert exact natural-language model text;
- hide important product state in prompt strings only.

## Coverage Guidance

No hard global coverage threshold yet. Early phase coverage should focus on:

- domain rules;
- persistence contracts;
- scheduling;
- RAG chunking/retrieval;
- provider abstraction;
- code runner safety.

Add thresholds later when modules stabilize.

## Current Baseline Tests

The initial baseline includes:

- server health endpoint;
- SM-2 scheduling behavior;
- RAG chunking;
- shared Button rendering;
- Playwright app shell smoke test.
