# Phase 03: Progress Dashboard And Knowledge Graph

Status: planned.

## Goal

Give the user a useful personal cabinet: current goals, progress by skill, strengths, weaknesses, recommended next actions, and a visual knowledge graph.

## User Outcome

The user can open the dashboard and understand:

- what goal is currently active;
- which skills are strong, weak, unknown, or improving;
- what to study or practice next;
- what needs review;
- how skills relate to each other.

## Target Modules

- `apps/web`
- `packages/ui`
- `apps/server`
- `packages/domain`
- `packages/db`
- `packages/scheduling`

## UI Work

Create dashboard sections:

1. Goal switcher.
2. Readiness snapshot.
3. Weak spots.
4. Strong skills.
5. Recommended next actions.
6. Upcoming reviews.
7. Recent activity.
8. Knowledge graph preview.

Suggested routes:

```txt
/dashboard
/goals/:goalId
/skills/:skillId
/history
```

Knowledge graph:

- use Cytoscape.js;
- nodes are skills;
- edges are prerequisites, related topics, specializations, or goal relevance;
- node color or style should reflect skill state;
- clicking a node opens skill detail.

## Domain Work

Add derived read models:

- `SkillProgressSummary`;
- `GoalReadinessSummary`;
- `WeakSpot`;
- `RecommendedAction`;
- `KnowledgeGraphNode`;
- `KnowledgeGraphEdge`;
- `ActivityEvent`.

Keep read models separate from raw persistence entities.

## API Work

Add procedures:

- `dashboard.getSummary`;
- `goals.getReadiness`;
- `skills.getGraph`;
- `skills.getDetail`;
- `history.listRecent`;
- `recommendations.listActive`;

## Data Work

Seed initial skill graph templates for common tracks:

- frontend basics;
- JavaScript/TypeScript;
- browser fundamentals;
- algorithms and data structures;
- Python backend basics;
- system design basics.

Initial seed data can live in:

```txt
packages/domain/src/skill-templates/
packages/db/src/seeds/
```

The seed graph should be editable later by AI and user actions.

## Recommendation Rules

Before AI recommendations are ready, implement deterministic recommendations:

- unknown prerequisite before advanced topic;
- weak skill with high goal relevance;
- review due soon;
- coding practice after theory assessment;
- adjacent skill after strong mastery.

These rules create a working product loop before AI agents are integrated.

## Verification

Required:

```powershell
pnpm typecheck
pnpm build
```

Manual:

- onboarding data appears on dashboard;
- goal switcher changes summary;
- graph renders with non-overlapping basic layout;
- skill detail opens from graph;
- recommendations are explainable from stored data.

## Risks

- Dashboard becoming decorative instead of actionable. Every section should answer "what should I do next?"
- Graph becoming too dense. Start with filters and goal-specific views.
- AI-only recommendations too early. Deterministic recommendations should exist first.

## Done Criteria

- Dashboard gives a useful personalized state without AI.
- Knowledge graph visualizes skill relationships.
- User can inspect skill detail and recent progress.
- Recommendations have visible reasons.

