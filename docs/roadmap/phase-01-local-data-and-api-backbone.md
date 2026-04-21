# Phase 01: Local Data And API Backbone

Status: next.

## Goal

Turn the current shell into a real local application foundation: database initialization, schema, repositories, use-case services, and typed local API.

This phase should happen before rich UI and AI workflows. Without a stable data model, later features will collapse into ad hoc state.

## User Outcome

The app can persist and read local user data. Even if the UI is still simple, user profile, goals, skills, attempts, evidence, and documents should have a clear storage path.

## Target Modules

- `packages/domain`
- `packages/db`
- `packages/shared`
- `apps/server`
- `apps/web` only for minimal API smoke wiring

## Domain Work

Add or refine domain types for:

- `UserProfile`;
- `Goal`;
- `GoalTrack`;
- `Skill`;
- `SkillEdge`;
- `LearningItem`;
- `Attempt`;
- `Evaluation`;
- `Evidence`;
- `Document`;
- `DocumentChunk`;
- `ReviewSchedule`;
- `Recommendation`;
- `AgentRun`.

Important modeling rules:

- A user can have multiple goals.
- A skill can be relevant to multiple goals.
- Evidence should be atomic and traceable to a source.
- Attempts should represent all user answers, code submissions, interview responses, and lesson checks.
- Evaluations should not overwrite attempts; they should attach to them.
- Recommendations should be explainable through evidence and goals.

## Database Work

Expand `packages/db/src/schema.ts`.

Tables to introduce or refine:

- `user_profiles`;
- `goals`;
- `goal_skills`;
- `skills`;
- `skill_edges`;
- `learning_items`;
- `attempts`;
- `evaluations`;
- `evidence`;
- `documents`;
- `document_chunks`;
- `recommendations`;
- `review_schedules`;
- `agent_runs`;
- `provider_settings`.

Repository files to create:

```txt
packages/db/src/repositories/
  user-profile-repository.ts
  goals-repository.ts
  skills-repository.ts
  attempts-repository.ts
  evidence-repository.ts
  documents-repository.ts
  recommendations-repository.ts
```

Database initialization:

- create a stable `createDatabase` factory;
- decide local data directory default;
- add a server-side app context that owns the database instance;
- avoid opening separate database instances per request unless proven safe.

## API Work

Create tRPC routers in `apps/server/src`.

Suggested structure:

```txt
apps/server/src/
  context.ts
  router.ts
  routers/
    health-router.ts
    profile-router.ts
    goals-router.ts
    skills-router.ts
    documents-router.ts
```

Initial procedures:

- `health.get`;
- `profile.get`;
- `profile.upsert`;
- `goals.list`;
- `goals.create`;
- `goals.update`;
- `skills.list`;
- `skills.upsertMany`;
- `documents.create`;
- `documents.list`;

Use Zod schemas at API boundaries.

## UI Work

Only minimal UI wiring is needed in this phase:

- create tRPC client setup;
- verify the app can call `health.get`;
- optionally show a small local status indicator.

Do not build full onboarding in this phase unless the persistence/API layer is already stable.

## Verification

Required:

```powershell
pnpm typecheck
pnpm build
```

Manual:

- start server;
- call health endpoint;
- call at least one tRPC profile or goals procedure.

## Risks

- Over-modeling too early. Keep fields useful, but do not attempt a perfect ontology.
- Under-modeling evidence. If evidence is weak, recommendations and progress will be hard to explain later.
- Letting server routes become the real domain layer. Keep use cases explicit.

## Done Criteria

- Database schema can represent the MVP product state.
- Repositories exist for core entities.
- tRPC API exposes basic profile/goals/skills/document operations.
- Typecheck and build pass.
- Roadmap and GRACE artifacts reflect any schema-level decisions.

