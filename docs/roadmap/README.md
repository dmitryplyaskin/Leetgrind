# Leetgrind Roadmap

Last updated: 2026-04-21

This roadmap turns the product vision into an implementation sequence. It is intentionally written as a working plan for human and AI agents. The GRACE XML files define the machine-readable contracts; these roadmap files explain what to build, where to build it, and how to verify it.

## Product North Star

Leetgrind should become a local-first AI mentor for programming interview preparation. The user should be able to define goals, reveal current skill state, practice coding and theory, receive evidence-based feedback, repeat weak material, run mock interviews, and understand progress through a knowledge graph.

## Roadmap Files

- [Phase 00: Foundation And Governance](phase-00-foundation-and-governance.md)
- [Phase 01: Local Data And API Backbone](phase-01-local-data-and-api-backbone.md)
- [Phase 02: User Profile, Goals, And Onboarding](phase-02-user-profile-goals-onboarding.md)
- [Phase 03: Progress Dashboard And Knowledge Graph](phase-03-progress-dashboard-knowledge-graph.md)
- [Phase 04: AI Providers, Agents, And RAG](phase-04-ai-providers-agents-rag.md)
- [Phase 05: Assessments, Lessons, And Recommendations](phase-05-assessments-lessons-recommendations.md)
- [Phase 06: Coding Practice IDE And Runner](phase-06-coding-practice-ide-runner.md)
- [Phase 07: Spaced Repetition, History, And Mock Interviews](phase-07-repetition-history-interviews.md)
- [Phase 08: Desktop Readiness, Hardening, And Polish](phase-08-desktop-hardening-polish.md)

## Implementation Order

| Phase | Status | Main Outcome | Primary Modules |
| --- | --- | --- | --- |
| 00 | Done / ongoing | Monorepo, GRACE governance, baseline architecture | all |
| 01 | Next | Local persistence, repositories, typed API backbone | `packages/db`, `packages/domain`, `apps/server`, `packages/shared` |
| 02 | Planned | User can define profile, goals, skills, and resume context | `apps/web`, `apps/server`, `packages/domain`, `packages/db` |
| 03 | Planned | Dashboard shows progress, weak spots, and skill graph | `apps/web`, `packages/ui`, `packages/domain`, `packages/db` |
| 04 | Planned | AI providers, agent runtime, RAG ingestion and retrieval | `packages/ai`, `packages/agents`, `packages/rag`, `packages/db` |
| 05 | Planned | Assessments produce evaluations, evidence, lessons, recommendations | `packages/agents`, `packages/domain`, `packages/db`, `apps/web` |
| 06 | Planned | LeetCode-like coding practice with editor, tests, hints, review | `packages/code-runner`, `apps/web`, `apps/server`, `packages/agents` |
| 07 | Planned | Review scheduling, progress history, mock interviews | `packages/scheduling`, `packages/agents`, `apps/web`, `packages/db` |
| 08 | Planned | Tauri readiness, data export/import, reliability, UX polish | all |

## MVP Definition

The first meaningful MVP is not just a landing page. It should include:

1. Local profile, goals, initial skills, and resume text.
2. Local database persistence with typed repositories.
3. Dashboard showing skill state and next recommended actions.
4. One AI provider path through the provider abstraction.
5. Assessment flow that stores attempts, evaluation, and evidence.
6. Basic RAG ingestion for user resume/notes and retrieval for assessment context.
7. Basic coding task flow for at least JavaScript or Python.
8. SM-2-inspired review recommendations.

Mock interviews, Codex subscription auth, richer coding runtimes, and Tauri packaging can follow after this MVP is stable.

## Planning Rules

1. Every major feature should map to a requirement in `docs/requirements.xml`.
2. Every implementation task should name target modules from `docs/knowledge-graph.xml`.
3. Every phase should have verification criteria from `docs/verification-plan.xml`.
4. If implementation changes module responsibility, update `docs/development-plan.xml`.
5. If implementation creates a multi-step autonomous task, add or update an operational packet in `docs/operational-packets.xml`.

## Recommended Task Slice Format

Use this format when starting a concrete task:

```txt
Packet:
Requirement:
User outcome:
Target modules:
Owned files:
Data changes:
API changes:
UI changes:
Agent/RAG changes:
Verification:
Stop conditions:
```

