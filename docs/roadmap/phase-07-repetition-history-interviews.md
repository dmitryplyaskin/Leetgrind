# Phase 07: Spaced Repetition, History, And Mock Interviews

Status: planned.

## Goal

Turn individual learning activities into long-term progress: scheduled reviews, history, and realistic mock interviews.

## User Outcome

The user can:

- see what is due for review;
- revisit past mistakes and wins;
- run a mock interview by target level;
- receive a readiness report;
- understand what to improve next.

## Target Modules

- `packages/scheduling`
- `packages/domain`
- `packages/db`
- `packages/agents`
- `packages/rag`
- `apps/server`
- `apps/web`

## Spaced Repetition Work

Use SM-2-inspired scheduling as the starting point.

Review units:

- skill;
- learning item;
- specific mistake pattern;
- coding task pattern;
- interview question type.

Review outcomes:

- failed;
- hard;
- okay;
- easy;
- mastered.

Routes:

```txt
/reviews
/reviews/today
/reviews/:reviewId
```

API:

- `reviews.listDue`;
- `reviews.submitOutcome`;
- `reviews.reschedule`;
- `reviews.skip`;

## History Work

History should be a real product surface, not a database dump.

Routes:

```txt
/history
/history/attempts/:attemptId
/history/interviews/:interviewId
```

History views:

- timeline;
- by skill;
- by goal;
- by mistake type;
- by coding task;
- by interview.

Each history item should link to:

- attempt;
- evaluation;
- evidence;
- generated recommendations;
- review schedule changes.

## Mock Interview Work

Interview configuration:

- goal;
- seniority;
- duration;
- focus areas;
- question mix;
- allowed hints;
- strict or mentor mode.

Interview flow:

1. create session;
2. generate plan;
3. ask question;
4. user answers;
5. optional hint;
6. follow-up;
7. final evaluation;
8. readiness report.

Routes:

```txt
/interviews/new
/interviews/:sessionId
/interviews/:sessionId/report
```

Agent workflow:

- `interview-mentor`;
- structured interview plan;
- question-by-question evaluation;
- final readiness score;
- evidence extraction;
- recommendations.

## RAG Work

Interview and history should use memory RAG:

- previous weak spots;
- prior interview answers;
- coding mistakes;
- resume context;
- goal-specific expectations.

## Verification

Required:

```powershell
pnpm typecheck
pnpm build
```

Manual:

- due review appears after assessment or coding practice;
- review outcome changes next due date;
- history shows prior attempts;
- mock interview can be started and completed;
- report stores evidence and recommendations.

## Risks

- Review system becoming noisy. Prioritize high-impact weak spots.
- Mock interview becoming a generic chat. It needs session state, plan, scoring, and evidence.
- History becoming unreadable. Provide filters and summaries.

## Done Criteria

- Reviews are scheduled and actionable.
- User can inspect progress history.
- Mock interview produces a structured report.
- Interview results feed evidence and recommendations.

