# Leetgrind Architecture

Last updated: 2026-04-22

This document describes the initial architecture direction for Leetgrind. It is based on the current product vision and should be treated as a practical starting point, not as a frozen specification.

Leetgrind now uses a GRACE-inspired workflow for agentic development. The machine-readable execution contracts live in `docs/requirements.xml`, `docs/technology.xml`, `docs/development-plan.xml`, `docs/knowledge-graph.xml`, `docs/verification-plan.xml`, and `docs/operational-packets.xml`. This document is the human-readable architectural companion.

Frontend design work is additionally governed by `docs/frontend-design.md`, which adapts OpenAI's GPT-5.4 frontend guidance to Leetgrind's local-first app UI.

Leetgrind is a local-first web application for programming interview preparation, AI-assisted learning, coding practice, mock interviews, progress tracking, and personal skill development.

## Core Principles

1. Leetgrind is local-first.
   User data, progress history, embeddings, attempts, evaluations, and generated learning state should live locally by default.

2. AI is a replaceable execution layer.
   Product modules must not directly depend on OpenRouter, OpenAI API keys, Codex subscription auth, or any future provider. They should call domain services and AI abstractions.

3. Progress is evidence-based.
   The system should not store only final scores. It should store concrete observations about user behavior, answers, code quality, hints used, mistakes, strengths, and weaknesses.

4. Domain workflows are more important than chat.
   Chat can be one interface, but the main product model should be based on assessments, lessons, coding attempts, interviews, reviews, goals, and recommendations.

5. Architecture should support desktop evolution.
   The first implementation can be a local web app, but project boundaries should allow a future Tauri desktop shell without rewriting the domain and persistence layers.

## Recommended Project Structure

```txt
apps/
  web/
    React application, routes, screens, UI composition

  server/
    Express local API, tRPC router, background jobs, local service runtime

packages/
  domain/
    Pure domain entities, value objects, domain rules, use-case interfaces

  db/
    PGLite setup, Drizzle schema, migrations, repositories, database utilities

  ai/
    AI provider abstraction, provider implementations, model registry,
    structured output helpers, prompt utilities

  agents/
    Mentor, interviewer, reviewer, planner, and recommendation workflows

  rag/
    Document ingestion, chunking, embedding, vector search, retrieval policies,
    citation/source tracking

  code-runner/
    Code execution adapters, test runners, language runtimes, sandbox policies

  scheduling/
    Spaced repetition, SM-2 logic, review scheduling, reminder planning

  ui/
    Shared React components, design primitives, app-specific UI patterns

  shared/
    Shared Zod schemas, utility types, result helpers, constants
```

## Internationalization

Leetgrind should support Russian and English from the start.

Initial decisions:

- supported UI locales are `ru` and `en`;
- the user can choose the UI language during onboarding and later in settings;
- the preferred UI language is profile/preference data persisted locally;
- the UI may fall back to browser language on first run, but must offer an explicit override;
- user-facing React copy should go through a localization layer instead of being scattered as hard-coded strings;
- shared UI primitives should receive localized labels from callers and should not own product copy;
- domain, database, and provider packages should store stable values and user content, not translated UI labels;
- AI workflows should receive the user's preferred language as explicit context when generating learner-facing explanations.

Recommended libraries:

- `i18next`;
- `react-i18next`.

Initial locale resources should live in `apps/web` because localization is first a UI concern. Shared packages may expose locale code types or schemas if needed, but should not become a global copy dumping ground.

## Application Layers

### UI Layer

The UI layer should live mostly in `apps/web`.

Responsibilities:

- route rendering;
- bootstrap routing from `/` into onboarding or dashboard based on onboarding completion;
- screen composition;
- forms and local interactions;
- editor views;
- graph visualization;
- dashboards;
- calling typed API methods;
- rendering streaming AI output;
- managing UI locale selection and localized screen copy.

The UI should not directly call AI providers or database repositories.

The startup contract is now:

- `/` is a bootstrap route, not a promotional home page;
- incomplete local profiles are redirected into onboarding and protected product routes stay gated;
- the full app shell and navigation appear only after onboarding is complete.

Recommended libraries:

- `Vite`;
- `React`;
- `TypeScript`;
- `TanStack Router`;
- `TanStack Query`;
- `React Hook Form`;
- `Zod`;
- `Mantine v8`;
- `i18next`;
- `react-i18next`;
- `Zustand` for small UI-only state.

Mantine v8 is the approved UI component system. Agents should mention that
Leetgrind uses Mantine v8 and reference `https://mantine.dev/llms.txt` when
using AI assistance for Mantine component behavior. A local snapshot of the
LLM-oriented Mantine index is stored at `docs/vendor/mantine-v8-llms.txt`.

### Frontend Design System

Leetgrind should feel like a calm expert workspace rather than a generic SaaS dashboard.

The frontend design source of truth is:

- `docs/frontend-design.md` for design rules, copy rules, and verification expectations;
- `packages/ui/src/theme.ts` for Mantine theme configuration and `--lg-*` design tokens;
- `packages/ui` primitives for shared layout, cards, buttons, badges, and forms;
- `apps/web/src/i18n.ts` for visible route copy in Russian and English;
- Playwright e2e checks for desktop and mobile rendering.

Current design defaults:

- Mantine v8 remains the component system;
- Figtree is the app UI typeface loaded locally through `@fontsource-variable/figtree`;
- JetBrains Mono is the code and monospace typeface loaded locally through `@fontsource/jetbrains-mono`;
- routine product screens should prioritize navigation, workspace, and secondary context;
- cards are acceptable for grouped data, forms, statuses, and repeated interactive items, but should not become default page structure;
- app UI should avoid placeholder marketing copy, implementation reassurance, and technical labels outside settings or diagnostics flows.

### Local API Layer

The local API layer should live in `apps/server`.

Responsibilities:

- expose local API endpoints;
- host the tRPC router;
- coordinate use cases;
- run local background jobs;
- manage local provider credentials through safe adapters;
- stream long-running AI or code-runner operations to the UI.

Recommended libraries:

- `Express`;
- `tRPC`;
- `Zod`;
- `pino` or another structured logger.

### Domain Layer

The domain layer should live in `packages/domain`.

It should contain the core product language and rules without depending on React, Express, Drizzle, or specific AI SDKs.

Core domain concepts:

- `UserProfile`;
- `Goal`;
- `Skill`;
- `SkillEdge`;
- `LearningItem`;
- `Lesson`;
- `Assessment`;
- `Question`;
- `CodingTask`;
- `Attempt`;
- `Evaluation`;
- `Evidence`;
- `Hint`;
- `InterviewSession`;
- `ReviewSchedule`;
- `Recommendation`.

The domain layer should model what the product knows about the user and what actions can happen next.

### Persistence Layer

The persistence layer should live in `packages/db`.

Leetgrind should use:

- `PGLite` as the local PostgreSQL-compatible database;
- `pgvector` for embeddings and RAG;
- `Drizzle ORM` for schema, migrations, and typed queries.

Responsibilities:

- database initialization;
- migrations;
- repositories;
- transaction helpers;
- vector indexes;
- persistence-safe mappings from database rows to domain entities.

The rest of the app should not build raw SQL queries unless there is a clear reason.

PGLite is opened as an embedded local database by the server process. The
default persistent data directory is single-owner at runtime: only one
Leetgrind server process may open `.leetgrind/pglite` at a time. The server
runtime creates a lock file before initializing PGLite and removes it when the
application context closes. Agents and developers should reuse an existing dev
server for UI checks or stop any server they started before launching another
one against the same data directory.

## AI Architecture

AI access should be hidden behind a provider abstraction in `packages/ai`.

Phase 04 uses an OpenRouter-first implementation. `openrouter` is the only live
provider adapter in this phase, while `openai-api-key` and `openai-codex`
remain recognized provider kinds in shared contracts and UI so later phases can
extend the registry without reshaping product workflows.

Initial provider kinds:

```ts
type AiProviderKind =
  | "openai-codex"
  | "openai-api-key"
  | "openrouter"
  | "local";
```

Suggested provider interface:

```ts
interface AiProvider {
  id: string;
  kind: AiProviderKind;
  displayName: string;

  listModels(): Promise<AiModel[]>;
  generateText(input: AiTextRequest): Promise<AiTextResult>;
  streamText(input: AiTextRequest): AsyncIterable<AiTextChunk>;
  generateObject<T>(input: AiObjectRequest<T>): Promise<T>;
  embed?(input: AiEmbeddingRequest): Promise<AiEmbeddingResult>;
}
```

Provider-specific details must stay inside provider implementations.

Provider secrets must not be stored in `PGLite`. The server runtime should
compose a credential-store adapter that writes secrets to the OS keychain,
while database tables persist only non-secret provider metadata such as kind,
display name, default-selection state, and selected text or embedding models.

Examples:

- OpenRouter API keys;
- OpenAI API keys;
- Codex subscription auth;
- local models;
- future OpenAI-compatible providers.

### Codex Subscription Auth

Leetgrind should use the wording "Codex subscription auth" instead of generic "OpenAI OAuth".

This provider should be treated as:

- a high-priority provider for coding and agentic workflows;
- separate from normal OpenAI API billing;
- not a universal replacement for API-key providers;
- optional, with fallback providers available.

See `docs/codex-subscription-auth.md` for details.

### AI SDKs And Agent Libraries

For MVP provider-agnostic calls, a unified AI SDK can be used inside `packages/ai`.

For more complex agentic workflows, agent libraries should be isolated inside `packages/agents`. They should not own the whole application architecture.

This keeps workflows such as mentor evaluation, mock interviews, and coding reviews replaceable and testable.

## Agent Workflows

Agent workflows should live in `packages/agents`.

Initial workflow modules:

```txt
agents/
  mentor/
    evaluates user knowledge, explains weak spots, suggests next steps

  interviewer/
    runs mock interviews, tracks answers, controls difficulty

  coding-reviewer/
    reviews submitted code, analyzes tests, evaluates quality

  planner/
    builds learning paths from goals, skills, and evidence

  recommender/
    proposes lessons, reviews, adjacent topics, and practice tasks
```

Each agent workflow should:

- accept explicit typed input;
- return structured output;
- store traceable results;
- cite retrieved context when RAG is used;
- record provider/model metadata;
- record referenced context ids and execution status in agent run traces;
- avoid hidden global memory.

## RAG Architecture

RAG should live in `packages/rag`.

There should be two main retrieval domains:

1. Content RAG.
   Lessons, notes, imported documents, resumes, reference material, generated explanations.

2. Memory RAG.
   Attempts, mistakes, evaluations, weak spots, previous interview answers, coding review feedback.

Suggested tables:

- `documents`;
- `document_chunks`;
- `provider_settings`;
- `agent_runs`.

In Phase 04, embeddings are stored on `document_chunks` and retrieved through
content-domain search. Memory-domain retrieval remains typed in shared
contracts, but only content retrieval is fully operational until later phases
populate richer interview, attempt, and evaluation evidence.

Retrieval should combine:

- vector similarity through `pgvector`;
- SQL filters by goal, skill, content type, date, difficulty, source;
- recency and quality weighting;
- citation tracking.

The initial end-to-end content flow is:

1. save or select a local document;
2. chunk content with stable source metadata;
3. create embeddings through the selected provider;
4. persist chunk vectors and source references locally;
5. retrieve ranked context items with citations for agent workflows.

Do not store all AI memory as a single chat history. Store explicit domain events and evidence.

## Assessment And Lesson Loop

Phase 05 adds a first complete evidence loop:

1. create an `assessment_session`;
2. persist typed `assessment_questions`;
3. store learner `assessment_answers` as the session progresses;
4. finish the session into `attempts`, `evaluations`, and `evidence`;
5. generate follow-up lessons into `learning_items` with `kind = "lesson"`;
6. refresh explainable recommendations linked to evidence and goals;
7. update review schedules through `packages/scheduling`.

This keeps in-progress assessment state separate from downstream progress evidence.

## Progress And Evidence Model

Progress tracking should be based on evidence.

Examples of evidence:

- user solved a binary search task without hints;
- user used two hints for dynamic programming state definition;
- user gave an incomplete explanation of closures;
- user failed edge cases in a code task;
- user correctly explained browser rendering;
- user improved from previous attempts in a specific skill.

Suggested core tables:

- `goals`;
- `skills`;
- `profile_skills`;
- `skill_edges`;
- `learning_items`;
- `attempts`;
- `evaluations`;
- `evidence`;
- `recommendations`;
- `review_schedules`.

This model allows the system to explain why it recommends a lesson, repeat task, or mock interview topic.

`skills` and `skill_edges` form the shared knowledge catalog and graph structure. User-specific self-assessment now lives in `profile_skills`, which stores the local learner's current level and notes for a catalog skill without mutating the catalog node itself. Read models combine catalog skills, profile skill assessments, goal links, evidence, attempts, and reviews into the effective learner-facing skill state.

## Coding Practice Architecture

Coding practice should be built as a separate subsystem in `packages/code-runner`.

Main responsibilities:

- language adapter selection;
- test case execution;
- timeout handling;
- result normalization;
- runtime error capture;
- performance metrics;
- solution evaluation input for AI reviewer.

Recommended MVP scope:

- Code editor: `CodeMirror 6`;
- JavaScript/TypeScript execution: browser worker or controlled local runner;
- Python execution: `Pyodide` in a worker;
- test runner abstraction with normalized results.

Future options:

- WebContainers for richer Node.js tasks;
- local process sandboxing;
- Docker or Podman adapters;
- WASM-based language runtimes;
- Tauri-side controlled execution.

The AI reviewer should not be the only correctness mechanism. Runtime tests and deterministic checks should run first.

## Spaced Repetition

Spaced repetition should live in `packages/scheduling`.

MVP algorithm:

- SM-2-inspired review scheduling;
- skill-level review state;
- learning-item-level review state;
- explicit review outcomes.

The recommender should use review schedules together with goals, weak spots, and current user activity.

## Knowledge Graph

The knowledge graph should be represented in the domain/database layer and visualized in the UI.

Data model:

- `skills` as nodes;
- `skill_edges` as prerequisites, related topics, specializations, or goal relevance;
- `evidence` and `evaluations` as signals attached to skills.

Recommended visualization library:

- `Cytoscape.js`.

The graph should support:

- strong and weak skills;
- unknown topics;
- prerequisites;
- goal-specific paths;
- recommended next steps;
- history/progress overlays.

## State Management

Use separate tools for separate state categories.

Server/domain state:

- `TanStack Query`;
- tRPC queries and mutations;
- database-backed persistence.

Form state:

- `React Hook Form`;
- `Zod`.

UI-only state:

- `Zustand`;
- local component state.

Workflow state:

- explicit domain state machines or typed workflow records;
- consider `XState` only for complex flows such as interviews if simple typed state becomes hard to maintain.

Do not put domain progress, attempts, evaluations, or learning history into client-only state.

## MVP Implementation Order

Recommended build order:

1. Monorepo setup.
2. PGLite and Drizzle schema baseline.
3. tRPC API and React app shell.
4. Onboarding: user profile, goals, initial skills, resume import placeholder.
5. Skill graph and dashboard using the shared skill catalog plus profile-scoped self-assessment data.
6. AI provider abstraction with one simple provider first.
7. Assessment workflow: questions, answers, AI evaluation, evidence storage.
8. RAG ingestion and vector search.
9. Coding task MVP with CodeMirror, tests, and AI review.
10. SM-2 review scheduler and recommendations.
11. Mock interview workflow.
12. Codex subscription auth provider integration.

## Initial Architecture Decisions

Recommended initial decisions:

- Use `PGLite` as the local database.
- Use `Drizzle ORM` for schema and typed database access.
- Use `pgvector` for embeddings.
- Use `Express` as the local server runtime.
- Use `tRPC` for typed local API calls.
- Use `TanStack Query` for server state.
- Use `TanStack Router` for routes.
- Use `CodeMirror 6` for the coding editor.
- Use `Cytoscape.js` for the knowledge graph.
- Keep AI providers behind `packages/ai`.
- Keep agent workflows behind `packages/agents`.
- Keep domain logic independent from UI, database, and providers.

## Non-Goals For The First Version

Avoid these in the first implementation:

- building the whole product around one chat table;
- making Codex subscription auth the only AI path;
- letting AI providers leak into UI components;
- storing all user memory as unstructured prompt history;
- depending on one agent framework as the core architecture;
- running arbitrary user code without sandboxing and limits;
- optimizing for multi-user server deployment before the local-first product works.
