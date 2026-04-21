# Phase 04: AI Providers, Agents, And RAG

Status: planned.

## Goal

Add the AI foundation correctly: provider abstraction, user-configurable providers, agent workflow contracts, RAG ingestion, retrieval, and traceable agent runs.

This phase should make AI usable but still replaceable.

## User Outcome

The user can configure an AI provider and use AI-assisted features with local context. The app can explain which provider/model was used and what context informed the answer.

## Target Modules

- `packages/ai`
- `packages/agents`
- `packages/rag`
- `packages/db`
- `apps/server`
- `apps/web` for settings and AI status UI

## AI Provider Work

Implement provider registry:

```txt
packages/ai/src/
  provider.ts
  registry.ts
  providers/
    openrouter-provider.ts
    openai-api-key-provider.ts
    local-placeholder-provider.ts
```

Provider contract should support:

- list models;
- generate text;
- stream text;
- generate structured object;
- embeddings if supported;
- provider health check;
- normalized errors.

Start with OpenRouter or OpenAI API key because they are easier to test. Codex subscription auth should remain a first-class planned provider, but not block core MVP.

## Provider Settings UI

Add settings screens:

```txt
/settings/ai
/settings/ai/providers
```

User can:

- add provider;
- select default provider;
- select model;
- test provider connection;
- see whether embeddings are available;
- see clear wording for Codex subscription auth vs API-key billing.

Credential storage:

- for MVP, prefer environment variables or local encrypted storage if implemented;
- do not store Codex subscription tokens directly in PGLite unless a strong reason exists;
- document any credential storage decision in `docs/technology.xml`.

## Agent Runtime Work

Create workflow contracts:

```txt
packages/agents/src/
  workflows/
    assessment-mentor.ts
    lesson-planner.ts
    coding-reviewer.ts
    interview-mentor.ts
    recommender.ts
  tracing/
    agent-run.ts
```

Every workflow should:

- accept typed input;
- validate structured output;
- record provider/model;
- record retrieved context IDs;
- return evidence-ready results;
- fail with a useful normalized error.

## RAG Work

Split RAG into two domains:

1. Content RAG:
   - resume;
   - user notes;
   - generated lessons;
   - imported materials.

2. Memory RAG:
   - attempts;
   - evaluations;
   - mistakes;
   - evidence;
   - interview answers.

Implement:

```txt
packages/rag/src/
  chunking/
  retrieval/
  ingestion/
  context-builder/
```

Data path:

1. document saved;
2. document chunked;
3. embeddings generated;
4. chunks stored with source metadata;
5. retrieval returns context items with citations.

## API Work

Add procedures:

- `ai.providers.list`;
- `ai.providers.test`;
- `ai.settings.get`;
- `ai.settings.update`;
- `rag.documents.ingest`;
- `rag.search`;
- `agents.runPreview` for development-only smoke tests.

## Verification

Required:

```powershell
pnpm typecheck
pnpm build
```

Manual:

- add/test one provider;
- generate one structured result;
- ingest one document;
- retrieve relevant chunks;
- inspect stored agent run metadata.

## Risks

- Provider-specific code leaking into product flows.
- Trusting unvalidated AI JSON.
- Treating Codex subscription auth as a replacement for all OpenAI API needs.
- RAG without citations, making recommendations hard to audit.

## Done Criteria

- At least one provider works through `AiProvider`.
- AI settings are visible and testable.
- Agent run records exist.
- RAG can ingest and retrieve local document chunks.
- Provider/model/context metadata is stored for AI workflows.

