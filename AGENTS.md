# AGENTS.md

This file defines how agents and contributors should work in the Leetgrind repository.
It is a project-specific engineering guide, not a generic checklist.

## Project Identity

Leetgrind is a local-first application for programming interview preparation.
It combines AI mentoring, retrieval over local learning history, coding practice,
mock interviews, spaced repetition, and knowledge graph based progress tracking.

The product is built for one local user first. Do not optimize the architecture
for multi-tenant SaaS, remote sync, or shared public content unless the user
explicitly changes the product direction.

## Read Before Editing

For non-trivial work, read the relevant project contract before changing code:

1. `Product Vision.md` for product intent.
2. `docs/requirements.xml` for product scope and functional requirements.
3. `docs/technology.xml` for approved stack, commands, dependency rules, and forbidden patterns.
4. `docs/knowledge-graph.xml` for module relationships and dependency direction.
5. `docs/development-plan.xml` for module responsibilities and phase order.
6. `docs/verification-plan.xml` for required checks.
7. `docs/operational-packets.xml` for execution packets, checkpoints, and stop conditions.
8. `docs/architecture.md` for the human-readable architecture overview.

Also read:

- `docs/codex-subscription-auth.md` for AI provider or Codex subscription auth work.
- `docs/frontend-design.md` for app shell, route layout, shared UI, or visual polish work.
- `docs/testing.md` before adding or changing tests.

For a small targeted edit, read only the touched module and the contract files
that govern the changed boundary. Do not skip contracts when changing package
exports, API schemas, persistence shapes, or dependency direction.

## Source Of Truth

- Requirements: `docs/requirements.xml`
- Approved technology and dependency rules: `docs/technology.xml`
- Module ownership and public contracts: `docs/development-plan.xml`
- Dependency graph and risk surfaces: `docs/knowledge-graph.xml`
- Verification expectations: `docs/verification-plan.xml`
- Execution packets and checkpoint fields: `docs/operational-packets.xml`
- Human-readable architecture: `docs/architecture.md`
- Frontend design system: `docs/frontend-design.md`

If XML contracts and Markdown docs disagree, prefer the XML contract for
implementation and update the stale document in the same change.

## Repository Structure

```txt
apps/
  web/       React UI, routes, screen composition, local client state
  server/    Express local API, tRPC router, runtime composition

packages/
  domain/       pure product model and business rules
  db/           PGLite, Drizzle schema, migrations, repositories
  ai/           provider abstractions and provider adapters
  agents/       mentor, interviewer, reviewer, planner, recommender workflows
  rag/          ingestion, chunking, retrieval, embedding coordination
  code-runner/  code execution adapters and test result normalization
  scheduling/   spaced repetition and review scheduling
  ui/           shared React UI primitives and theme tokens
  shared/       common schemas, result types, utility contracts

docs/        product, architecture, technology, roadmap, and verification docs
e2e/         Playwright end-to-end tests
```

## Architecture Rules

1. Preserve local-first architecture.
   Use local storage, PGLite, local service boundaries, and optional provider
   integrations unless the task explicitly introduces remote synchronization.

2. Keep domain logic pure.
   `packages/domain` must not import React, Express, Drizzle, PGLite, OpenAI,
   OpenRouter, AI SDK, browser APIs, or UI libraries.

3. Keep UI away from persistence and providers.
   `apps/web` and `packages/ui` must not directly access PGLite, Drizzle
   repositories, OpenAI, OpenRouter, Codex-specific code, or other provider SDKs.
   Use typed local API contracts.

4. Keep AI replaceable.
   Product flows call abstractions in `packages/ai` and workflow services in
   `packages/agents`. Provider-specific details stay inside provider adapters.

5. Store evidence, not vague memory.
   User progress should be represented through attempts, evaluations, evidence,
   review schedules, and graph signals. Do not hide important state only in chat
   transcripts, prompt text, or unstructured logs.

6. Prefer deterministic checks before AI judgment.
   Coding practice must run tests and normalized runtime checks before asking an
   AI reviewer for qualitative evaluation.

7. Avoid cyclic dependencies.
   If a change requires a package cycle, stop and redesign the boundary.

8. Keep server orchestration thin.
   `apps/server` composes services, validates inputs, and exposes API procedures.
   It should not become the only place where business rules live.

9. Update contracts when boundaries change.
   Changes to module responsibility, public API, package dependency direction,
   persistence shape, verification expectations, or approved technology must
   update the relevant file under `docs/`.

## Dependency Direction

Allowed high-level flow:

```txt
apps/web -> packages/ui -> packages/shared
apps/web -> apps/server API contracts

apps/server -> packages/domain
apps/server -> packages/db
apps/server -> packages/ai
apps/server -> packages/agents
apps/server -> packages/rag
apps/server -> packages/code-runner
apps/server -> packages/scheduling
apps/server -> packages/shared

packages/agents -> packages/domain
packages/agents -> packages/ai
packages/agents -> packages/rag

packages/rag -> packages/ai
packages/rag -> packages/db

packages/db -> packages/domain
packages/db -> packages/shared

packages/domain -> packages/shared
```

When in doubt, check `docs/knowledge-graph.xml` before importing across packages.

## TypeScript And Code Style

- Use TypeScript strict mode and preserve type safety across package boundaries.
- Use Zod at external input boundaries: API input, forms, provider responses,
  imported documents, and AI structured outputs.
- Prefer explicit exported contracts over ad hoc object shapes.
- Keep functions focused. Extract named helpers when logic becomes difficult to
  scan, but do not create abstractions only to satisfy style preferences.
- Comments should explain non-obvious decisions, invariants, or tradeoffs. Do
  not add comments that restate the code.
- Avoid broad rewrites during feature work. Keep edits scoped to the request.
- Do not introduce global mutable state for user progress, provider settings,
  or workflow history.
- Normal tests must not call paid or external AI providers.
- Use mocks, fake providers, fixtures, and temporary local databases in tests.
- Do not add runtime dependencies unless they are justified by the task and
  consistent with `docs/technology.xml`.

## File Size And Complexity Limits

These limits are intended to keep files reviewable. Split files by responsibility,
not by arbitrary line count.

- Source files should stay under 300 lines.
- 500 lines is a hard limit for normal source files. If a file must exceed it,
  document the reason in the PR or final handoff and prefer splitting it soon.
- React route and screen files should stay under 350 lines.
- Shared UI components should stay under 220 lines per component file.
- Domain services, repositories, and workflow modules should stay under 300 lines.
- Test files should stay under 400 lines; split by scenario when they grow.
- Generated files, migrations, lockfiles, and large static fixtures are exempt.
- Individual functions should usually stay under 60 lines.
- React components should usually stay under 180 lines. Extract subcomponents
  when state, rendering, and event handling become tangled.
- Avoid files that mix unrelated responsibilities, such as schema definitions,
  repository implementation, and route handlers in one file.

## Frontend Rules

- Use Mantine v8, `packages/ui` primitives, and `--lg-*` design tokens.
- Follow `docs/frontend-design.md` for layout, typography, copy, motion, and
  browser verification expectations.
- Use local Figtree for UI text and JetBrains Mono for code/technical text.
- New visible UI strings in `apps/web` and `packages/ui` must be localization-ready
  for Russian and English.
- Do not bury user-facing copy inside domain logic, persistence, or provider prompts.
- Store UI language preference as profile/preference data, not hard-coded client state.
- UI copy must be production-ready: specific, useful, and actionable.
- Avoid meta copy and implementation labels such as "local API", "future phase",
  "AI can be configured later", or "works offline" unless the screen is explicitly
  a settings or diagnostics flow where that information helps the user act.
- Do not let route components directly call providers, repositories, or database code.
- Keep UI-only state in component state or small Zustand stores. Keep domain state
  in the local API and persistence layer.

## Persistence Rules

- `packages/db` owns PGLite setup, Drizzle schema, migrations, repositories, and
  persistence-safe mappings.
- Provider secrets must not be stored in PGLite. Store secrets through the OS
  keychain adapter composed by the server runtime.
- Persist evidence, attempts, evaluations, review schedules, recommendations,
  documents, chunks, and agent run metadata as explicit records.
- Use temporary local databases in tests. Do not write tests against the user's
  real `.leetgrind/pglite` data directory.
- Schema changes require migration planning and build/typecheck verification.

## AI And Agent Rules

- AI workflows must accept explicit typed inputs and return validated structured output.
- Provider/model metadata and referenced context ids should be recorded for agent runs.
- Retrieval context must remain traceable to stored documents or memory sources.
- Codex subscription auth is optional and not a universal replacement for API-key providers.
- Provider adapters belong in `packages/ai`; product workflow logic belongs in `packages/agents`.
- Automated tests must use fake providers or mocked transports.

## Code Runner Rules

- User code execution must have sandboxing, timeouts, output capture, and normalized results.
- Never add unrestricted `eval`, unrestricted child process execution, or unbounded loops.
- Runtime checks should produce structured pass/fail data before AI review runs.
- Unsupported languages must fail explicitly with a typed result, not with an unhandled error.

## Approved Commands

Run commands from the repository root:

```powershell
pnpm build
pnpm test
pnpm test:e2e
pnpm typecheck
pnpm dev
pnpm clean
```

Package-specific examples:

```powershell
pnpm --filter @leetgrind/web dev
pnpm --filter @leetgrind/server dev
pnpm --filter @leetgrind/db drizzle:generate
```

Before starting `pnpm dev`, `pnpm --filter @leetgrind/server dev`, or
`pnpm --filter @leetgrind/web dev`, check whether a suitable Leetgrind dev
server is already running. Reuse an existing server when possible. If you start
a dev server for verification, track the process and stop it before the final
response unless the user explicitly asks to keep it running. Do not start a
second server process against the same PGLite data directory.

## Verification Gate

Before claiming implementation work is complete, run:

```powershell
pnpm typecheck
```

For behavior changes, also run:

```powershell
pnpm test
```

For changes touching runtime behavior, package exports, build config, Vite,
Express, Drizzle, generated types, or dependencies, also run:

```powershell
pnpm build
```

For critical UI route changes, start or reuse the Vite dev server and run or
update Playwright coverage when feasible:

```powershell
pnpm test:e2e
```

For XML changes, verify that all edited XML files parse successfully.

In the final response, state which commands ran and whether they passed. If a
required command could not run, state the blocker and residual risk.

## Multi-Agent Rules

Parallel work is allowed only when write scopes are disjoint.

Good parallel splits:

- `packages/db` schema work and isolated `apps/web` screen mockup work.
- `packages/ai` provider adapter work and `packages/scheduling` algorithm work.
- `docs/*` planning work and isolated UI component work.

Bad parallel splits:

- two agents editing the same package public API;
- one agent changing domain types while another depends on those same types;
- one agent changing contracts while another implements against the old contract.

When using multiple agents, define:

- owned files or modules;
- expected outputs;
- verification commands;
- integration order;
- stop conditions.

## Stop Conditions

Stop and ask for direction if:

- the requested change contradicts `Product Vision.md`;
- local-first assumptions would be broken;
- a provider-specific SDK requires credentials or terms that are unavailable;
- safe sandboxing for user code cannot be provided;
- package dependency direction would become cyclic;
- project contracts disagree in a way that changes implementation meaning.

## Documentation Discipline

When changing architecture, update at least one of:

- `docs/development-plan.xml`;
- `docs/knowledge-graph.xml`;
- `docs/technology.xml`;
- `docs/verification-plan.xml`;
- `docs/architecture.md`.

When adding a major feature, add or update:

- requirements;
- module contract;
- verification scenario;
- graph dependency;
- roadmap entry or operational packet if execution is multi-step.

Do not leave documentation describing behavior that no longer exists.
