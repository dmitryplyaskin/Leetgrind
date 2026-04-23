# Phase 02: User Profile, Goals, And Onboarding

Status: done.

## Goal

Let the user describe who they are, what they know, and what they are preparing for. This is the first product loop: Leetgrind should adapt to the user's goals instead of showing generic tasks.

## User Outcome

The user can:

- define one or more goals;
- define target role or interview target;
- enter current skills and confidence;
- paste resume or background text;
- choose Russian or English as the application UI language;
- choose primary programming languages;
- complete onboarding before the main workspace becomes available.
- finish onboarding and land on a personalized dashboard shell.

## Target Modules

- `apps/web`
- `apps/server`
- `packages/domain`
- `packages/db`
- `packages/shared`
- later: `packages/rag` for resume ingestion

## UI Work

Build an onboarding flow with these steps:

1. Profile and UI language.
2. Goal setup:
   - target company or role;
   - seniority level;
   - interview date if known;
   - focus area.
3. Skill self-assessment:
   - frontend;
   - backend;
   - algorithms;
   - system design;
   - language-specific skills;
   - custom skills.
4. Resume/background input and preferences:
   - text paste;
   - future file upload;
   - preferred languages;
   - preferred AI provider placeholder;
   - daily/weekly study rhythm.
5. Review and confirmation:
   - concise summary of profile, goals, skills, and background;
   - explicit finish action into the main workspace.

The implementation may keep these steps inside a single `/onboarding` route by using route search state for the current step, as long as reload and back/forward stay stable.

Suggested routes:

```txt
/               bootstrap redirect to onboarding or dashboard
/onboarding
/dashboard
```

Use:

- React Hook Form;
- Zod;
- TanStack Router;
- TanStack Query mutations.

## Domain Work

Add value objects or schemas for:

- `GoalType`;
- `TargetSeniority`;
- `StudyPreference`;
- `SelfAssessedSkill`;
- `UserLanguagePreference`;
- `UserInterfaceLocale`;
- `ResumeDocumentInput`.

Rules:

- Goals are separate, but skills can be shared.
- The app should not duplicate generic programming knowledge across goal tracks.
- Resume text should become a document source, not just a profile field.
- UI language is a user preference and should not be confused with programming language preferences or content language.

## API Work

Add procedures:

- `onboarding.getState`;
- `onboarding.complete`;
- `profile.upsert`;
- `goals.createMany`;
- `skills.selfAssess`;
- `documents.createResumeDocument`.

Make onboarding idempotent:

- user can restart and edit;
- partial progress can be saved;
- completing onboarding should not destroy existing data.
- protected product routes should redirect back to onboarding until onboarding is complete.

## Data Work

Persist:

- profile fields;
- goals;
- initial skills;
- language preferences;
- UI language preference (`ru` or `en`);
- onboarding completion status;
- resume document metadata and content.

If RAG is not ready yet, store resume content as a plain document and defer chunking to Phase 04.

## Agent/RAG Work

Optional for this phase:

- A non-streaming "profile summarizer" agent can extract candidate skills from resume text, but manual entry must work without AI.

Do not block onboarding on AI provider configuration.

## Verification

Required:

```powershell
pnpm typecheck
pnpm build
```

Manual:

- create a profile;
- create at least two goals;
- enter skills;
- paste resume text;
- switch UI language between Russian and English;
- reload app and confirm data persists.

## Risks

- Asking too many questions before value is visible. Keep onboarding concise.
- Making AI mandatory too early. Onboarding must work offline.
- Treating resume as unstructured profile blob. Store it as a document source for later RAG.

## Done Criteria

- User can complete onboarding without AI.
- Profile, goals, skills, and resume text persist locally.
- UI language preference persists locally and visible onboarding copy renders in Russian and English.
- Dashboard route can read onboarding state.
- Data model supports multiple concurrent goals.
