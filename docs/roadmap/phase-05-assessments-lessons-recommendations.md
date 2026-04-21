# Phase 05: Assessments, Lessons, And Recommendations

Status: planned.

## Goal

Create the first complete AI learning loop:

1. user chooses or receives a topic;
2. system asks assessment questions;
3. user answers;
4. AI and deterministic rules evaluate;
5. evidence is stored;
6. progress changes;
7. lessons and next actions are recommended.

## User Outcome

The user can test knowledge on a topic and receive a concrete explanation of what they know, what they missed, and what to do next.

## Target Modules

- `packages/domain`
- `packages/agents`
- `packages/rag`
- `packages/db`
- `apps/server`
- `apps/web`
- `packages/scheduling`

## Assessment Work

Assessment types:

- multiple choice;
- short written answer;
- explanation prompt;
- scenario analysis;
- later: code-related conceptual question.

Core entities:

- `AssessmentSession`;
- `AssessmentQuestion`;
- `AssessmentAnswer`;
- `Attempt`;
- `Evaluation`;
- `Evidence`.

User flow:

```txt
/assessments/new
/assessments/:sessionId
/assessments/:sessionId/result
```

Assessment generation:

- use goal;
- use skill;
- use difficulty;
- use prior evidence;
- use RAG context when available.

Evaluation:

- validate answer shape;
- run deterministic checks when possible;
- ask AI for structured evaluation;
- extract evidence items;
- update skill progress summary;
- schedule reviews if needed.

## Lesson Work

Lesson types:

- generated explanation;
- curated/generated reading;
- example-driven walkthrough;
- mini quiz;
- practice prompt;
- bridge lesson between skills.

Routes:

```txt
/lessons
/lessons/:lessonId
/skills/:skillId/lessons
```

Lesson generation should use:

- current goal;
- skill prerequisites;
- user weak evidence;
- preferred language/domain;
- retrieved context.

## Recommendation Work

Recommendation categories:

- study this lesson;
- repeat this topic;
- solve this coding task;
- take this assessment;
- bridge from skill X to skill Y;
- prepare mock interview section.

Recommendation reason should include:

- linked goal;
- linked skill;
- linked evidence;
- due review if relevant;
- confidence or priority.

## API Work

Add procedures:

- `assessments.createSession`;
- `assessments.getSession`;
- `assessments.submitAnswer`;
- `assessments.finishSession`;
- `lessons.generate`;
- `lessons.get`;
- `recommendations.refresh`;
- `recommendations.accept`;
- `recommendations.dismiss`.

## Agent Work

Implement or stub:

- `assessment-mentor`;
- `lesson-planner`;
- `recommender`.

All AI outputs must be structured and validated.

## Verification

Required:

```powershell
pnpm typecheck
pnpm build
```

Manual:

- create assessment for a skill;
- answer questions;
- finish session;
- see result page;
- confirm evidence stored;
- see recommendation generated from result.

## Risks

- AI evaluation that feels arbitrary. Always store reason and evidence.
- Too many generated lessons without testing. Lessons should connect back to assessment or practice.
- Recommendation spam. Keep recommendation list small and prioritized.

## Done Criteria

- Assessment loop persists attempts, evaluations, and evidence.
- Skill progress changes after assessment.
- At least one lesson can be generated or displayed.
- Recommendations are linked to evidence and goals.

