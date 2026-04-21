# AGENTS.md

This repository uses a GRACE-inspired workflow: Graph-RAG Anchored Code Engineering.

GRACE is process-first, not prompt-first. Before changing code, an agent must understand the product intent, module graph, contracts, allowed technology, and verification plan. The goal is to reduce context drift, accidental cross-module edits, and unverified AI-generated changes.

## Project Identity

Leetgrind is a local-first application for programming interview preparation. It combines AI mentoring, RAG over local learning history, coding practice, mock interviews, spaced repetition, and knowledge graph based progress tracking.

The product is intended for a single local user first. Do not optimize the architecture for multi-tenant SaaS unless the user explicitly changes the product direction.

## Required Reading Order

Before non-trivial work, read these files in order:

1. `Product Vision.md`
2. `docs/requirements.xml`
3. `docs/technology.xml`
4. `docs/knowledge-graph.xml`
5. `docs/development-plan.xml`
6. `docs/verification-plan.xml`
7. `docs/operational-packets.xml`
8. `docs/architecture.md`

For AI provider work, also read:

- `docs/codex-subscription-auth.md`

For a small targeted edit, reading only the relevant GRACE artifacts and the touched module may be enough, but do not skip contracts when changing package boundaries.

## GRACE Source Of Truth

Use the GRACE documents as the public project contract:

- `docs/requirements.xml` defines product scope, use cases, functional requirements, and non-functional requirements.
- `docs/technology.xml` defines the approved stack, dependency rules, runtime assumptions, and commands.
- `docs/development-plan.xml` defines modules, contracts, phases, and implementation order.
- `docs/verification-plan.xml` defines required checks and scenario-level verification.
- `docs/knowledge-graph.xml` defines module relationships and dependency direction.
- `docs/operational-packets.xml` defines execution packets, checkpoints, stop conditions, retry budgets, and handoff expectations.

`docs/architecture.md` is a human-readable companion. If it conflicts with XML artifacts, prefer the XML artifact for agent execution and update the conflicting document as part of the task.

## Working Rules

1. Resolve the target module before editing.
   Use `docs/knowledge-graph.xml` and `docs/development-plan.xml` to identify the affected module IDs and dependency boundaries.

2. Keep public contracts ahead of code.
   If a change modifies module responsibility, public API, package dependency direction, persistence shape, or verification expectations, update the relevant GRACE artifact in the same change.

3. Keep domain logic provider-independent.
   `packages/domain` must not import React, Express, Drizzle, PGLite, OpenAI, OpenRouter, AI SDK, or UI libraries.

4. Keep UI away from persistence and providers.
   `apps/web` and `packages/ui` must not directly access PGLite, Drizzle repositories, OpenAI, OpenRouter, or Codex-specific code. Use the local API and typed contracts.

5. Keep AI replaceable.
   Product flows must call abstractions in `packages/ai` and workflow services in `packages/agents`, not provider SDKs directly.

6. Store evidence, not vague memory.
   User progress should be represented through attempts, evaluations, evidence, review schedules, and graph signals. Do not hide important state only in chat transcripts or prompts.

7. Prefer deterministic checks before AI judgment.
   Coding practice should run tests and normalized runtime checks before asking an AI reviewer for qualitative evaluation.

8. Preserve local-first assumptions.
   Use local storage, PGLite, and local service boundaries unless a task explicitly introduces remote synchronization.

9. Avoid unrelated refactors.
   Keep edits scoped to the execution packet or user request. Do not rewrite unrelated files to match a preferred style.

10. Update verification evidence.
   When you run commands, record the meaningful result in your final answer. If a required verification cannot run, state why.

11. Keep user-facing UI localization-ready.
   New visible UI strings in `apps/web` and `packages/ui` must be prepared for Russian and English localization. Do not bury important user-facing copy inside domain logic, persistence, or provider prompts. Store the user's UI language preference as profile/preference data, not as hard-coded client state.

## Current Module Map

- `apps/web`: React UI, routes, screen composition, client-side interaction.
- `apps/server`: Express local API, tRPC router, server runtime, future background jobs.
- `packages/domain`: pure domain model and business rules.
- `packages/db`: PGLite, Drizzle schema, migrations, repositories.
- `packages/ai`: provider abstraction and provider adapters.
- `packages/agents`: mentor, interviewer, coding reviewer, planner, recommender workflows.
- `packages/rag`: document ingestion, chunking, retrieval, embedding coordination.
- `packages/code-runner`: code execution adapters, test result normalization, sandbox contracts.
- `packages/scheduling`: SM-2-inspired review scheduling.
- `packages/ui`: shared React UI primitives and app-specific components.
- `packages/shared`: common schemas, result types, utility contracts.

## Approved Commands

Use these commands from the repository root:

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

## Verification Gate

Before claiming implementation work is complete, run at least:

```powershell
pnpm typecheck
```

For behavior changes, also run:

```powershell
pnpm test
```

For changes touching runtime behavior, package exports, build config, Vite, Express, Drizzle, or generated types, also run:

```powershell
pnpm build
```

For critical UI route changes, start or reuse the Vite dev server and run or update Playwright coverage when feasible:

```powershell
pnpm test:e2e
```

See `docs/testing.md` for the detailed testing strategy.

## Multi-Agent Rules

Parallel work is allowed only when write scopes are disjoint.

Good parallel splits:

- `packages/db` schema work and `apps/web` screen mockup work.
- `packages/ai` provider adapter work and `packages/scheduling` algorithm work.
- `docs/*` planning work and isolated UI component work.

Bad parallel splits:

- two agents editing the same package public API;
- one agent changing domain types while another depends on those same types;
- one agent changing GRACE contracts while another implements against the old contract.

When using multiple agents, the controller must define:

- owned files or modules;
- expected outputs;
- verification commands;
- integration order;
- stop conditions.

## Stop Conditions

Stop and ask for direction if:

- the requested change contradicts `Product Vision.md`;
- local-first assumptions would be broken;
- a provider-specific SDK requires credentials or terms that are not available;
- a safe sandbox for user code cannot be provided;
- package dependency direction would become cyclic;
- GRACE artifacts disagree in a way that changes implementation meaning.

## Documentation Discipline

When changing architecture, update at least one of:

- `docs/development-plan.xml`;
- `docs/knowledge-graph.xml`;
- `docs/technology.xml`;
- `docs/verification-plan.xml`;
- `docs/architecture.md`.

When adding a new major feature, add or update:

- requirements;
- module contract;
- verification scenario;
- graph dependency;
- operational packet if execution is multi-step.
