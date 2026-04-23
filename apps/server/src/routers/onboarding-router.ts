import {
  type OnboardingCompleteInput,
  type OnboardingDraftInput,
  type OnboardingNarrativeInput,
  type OnboardingNarrativeExtractionResult,
  onboardingCompleteInputSchema,
  onboardingDraftInputSchema,
  onboardingNarrativeInputSchema
} from "@leetgrind/shared";
import { OnboardingExtractionWorkflow } from "@leetgrind/agents";
import type { AppContext } from "../context.js";
import { resolveRuntimeProvider } from "../services/ai-service.js";
import { publicProcedure, router } from "../trpc.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeTitle(title: string) {
  return title.trim().toLocaleLowerCase();
}

function uniqueNonEmptyTitles(titles: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const title of titles) {
    const trimmed = title.trim();
    const key = normalizeTitle(trimmed);

    if (trimmed.length === 0 || seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(trimmed);
  }

  return result;
}

async function saveOnboardingInput({
  ctx,
  input,
  completedAt
}: {
  ctx: AppContext;
  input: OnboardingCompleteInput | OnboardingDraftInput;
  completedAt: string | null;
}) {
  const currentProfile = await ctx.database.repositories.userProfiles.ensureLocalProfile();
  const existingOnboarding = isRecord(currentProfile.preferences.onboarding)
    ? currentProfile.preferences.onboarding
    : {};
  const savedAt = new Date().toISOString();
  const profile = await ctx.database.repositories.userProfiles.upsert({
    id: currentProfile.id,
    displayName: input.profile.displayName,
    targetRole: input.profile.targetRole,
    experienceLevel: input.profile.experienceLevel,
    resumeText:
      input.resume && input.resume.content.trim().length > 0
        ? input.resume.content
        : currentProfile.resumeText,
    preferences: {
      ...currentProfile.preferences,
      uiLocale: input.preferences.uiLocale,
      contentLanguage: input.preferences.contentLanguage,
      programmingLanguages: input.preferences.programmingLanguages,
      studyRhythm: input.preferences.studyRhythm,
      preferredAiProviderKind: input.preferences.preferredAiProviderKind,
      onboarding: {
        ...existingOnboarding,
        draftSavedAt: savedAt,
        completedAt: completedAt ?? existingOnboarding.completedAt ?? null
      }
    }
  });

  const existingGoals = await ctx.database.repositories.goals.list(profile.id);
  const goalsByTitle = new Map(existingGoals.map((goal) => [normalizeTitle(goal.title), goal]));
  const savedGoals = [];

  for (const goalInput of input.goals.filter((goal) => goal.title.trim().length > 0)) {
    const goal = goalsByTitle.get(normalizeTitle(goalInput.title));
    const goalPayload = {
      title: goalInput.title,
      description: goalInput.description,
      targetRole: goalInput.targetRole ?? input.profile.targetRole,
      metadata: {
        goalType: goalInput.goalType,
        targetCompany: goalInput.targetCompany,
        targetSeniority: goalInput.targetSeniority,
        interviewDate: goalInput.interviewDate,
        focusAreas: goalInput.focusAreas
      }
    };

    if (goal) {
      const savedGoal = await ctx.database.repositories.goals.update(goal.id, {
        ...goalPayload,
        status: "active"
      });

      if (savedGoal) {
        savedGoals.push({ goal: savedGoal, input: goalInput });
      }
    } else {
      savedGoals.push({
        goal: await ctx.database.repositories.goals.create({
          profileId: profile.id,
          ...goalPayload
        }),
        input: goalInput
      });
    }
  }

  const skillInputsByTitle = new Map(
    input.skills
      .filter((skill) => skill.title.trim().length > 0)
      .map((skill) => [normalizeTitle(skill.title), skill])
  );

  for (const focusArea of uniqueNonEmptyTitles(input.goals.flatMap((goal) => goal.focusAreas))) {
    const key = normalizeTitle(focusArea);

    if (!skillInputsByTitle.has(key)) {
      skillInputsByTitle.set(key, {
        title: focusArea,
        level: "unknown",
        description: null
      });
    }
  }

  const skills = await ctx.database.repositories.skills.upsertMany(
    [...skillInputsByTitle.values()].map((skill) => ({
      title: skill.title
    }))
  );
  const skillsByTitle = new Map(skills.map((skill) => [normalizeTitle(skill.title), skill]));
  const savedProfileSkills = await ctx.database.repositories.profileSkills.replaceMany(
    input.skills
      .filter((skill) => skill.title.trim().length > 0)
      .map((skill) => {
        const savedSkill = skillsByTitle.get(normalizeTitle(skill.title));

        if (!savedSkill) {
          throw new Error(`Could not resolve saved skill for ${skill.title}.`);
        }

        return {
          skillId: savedSkill.id,
          level: skill.level,
          notes: skill.description
        };
      }),
    profile.id
  );

  const goalSkillLinks = [];

  for (const savedGoal of savedGoals) {
    const focusAreas = uniqueNonEmptyTitles(savedGoal.input.focusAreas);
    const links = focusAreas
      .map((focusArea, index) => {
        const skill = skillsByTitle.get(normalizeTitle(focusArea));

        return skill
          ? {
              skillId: skill.id,
              relevance: "primary" as const,
              priority: index
            }
          : null;
      })
      .filter((link): link is NonNullable<typeof link> => link !== null);

    goalSkillLinks.push(
      ...(await ctx.database.repositories.goals.replaceSkillLinks(savedGoal.goal.id, links))
    );
  }

  const resumeDocument =
    input.resume && input.resume.content.trim().length > 0
      ? await ctx.database.repositories.documents.upsertResume({
          profileId: profile.id,
          title: input.resume.title.trim().length > 0 ? input.resume.title : "Resume",
          content: input.resume.content,
          metadata: {
            createdBy: "onboarding",
            updatedAt: savedAt
          }
        })
      : null;

  return {
    profile,
    goals: savedGoals.map(({ goal }) => goal),
    goalSkillLinks,
    skills: savedProfileSkills.map((profileSkill) => ({
      ...profileSkill.skill,
      level: profileSkill.level,
      description: profileSkill.notes
    })),
    resumeDocument,
    isComplete: typeof (completedAt ?? existingOnboarding.completedAt) === "string"
  };
}

async function extractOnboardingFromNarrative(
  ctx: AppContext,
  input: OnboardingNarrativeInput
): Promise<OnboardingNarrativeExtractionResult> {
  const { config, provider, setting } = await resolveRuntimeProvider(ctx);
  const run = await ctx.database.repositories.agentRuns.create({
    kind: "planner",
    status: "running",
    providerId: setting.id,
    model: config.textModel,
    input: {
      locale: input.locale,
      experienceLength: input.experienceText.length,
      goalLength: input.goalText.length,
      hasResume: Boolean(input.resumeText?.trim())
    },
    startedAt: new Date()
  });
  const workflow = new OnboardingExtractionWorkflow();

  try {
    const result = await workflow.run({
      ...input,
      provider
    });

    await ctx.database.repositories.agentRuns.update(run.id, {
      status: "succeeded",
      output: {
        goalCount: result.draft.goals.length,
        skillCount: result.draft.skills.length,
        suggestedFirstActions: result.suggestedFirstActions
      },
      completedAt: new Date()
    });

    return result;
  } catch (error) {
    await ctx.database.repositories.agentRuns.update(run.id, {
      status: "failed",
      error: error instanceof Error ? error.message : "Onboarding extraction failed.",
      completedAt: new Date()
    });

    throw error;
  }
}

export const onboardingRouter = router({
  getState: publicProcedure.query(async ({ ctx }) => {
    const profile = await ctx.database.repositories.userProfiles.ensureLocalProfile();
    await ctx.database.repositories.profileSkills.backfillLegacyRecords(profile.id);
    const goals = await ctx.database.repositories.goals.list(profile.id);
    const skills = await ctx.database.repositories.profileSkills.list(profile.id);
    const [resumeDocument] = await ctx.database.repositories.documents.listBySourceType(
      "resume",
      profile.id
    );

    const onboarding = isRecord(profile.preferences.onboarding)
      ? profile.preferences.onboarding
      : {};

    return {
      profile,
      goals,
      goalSkillLinks: (
        await Promise.all(
          goals.map((goal) => ctx.database.repositories.goals.listSkillLinks(goal.id))
        )
      ).flat(),
      skills: skills.map((profileSkill) => ({
        ...profileSkill.skill,
        level: profileSkill.level,
        description: profileSkill.notes
      })),
      resumeDocument: resumeDocument ?? null,
      isComplete: typeof onboarding.completedAt === "string",
      preferences: profile.preferences
    };
  }),

  saveDraft: publicProcedure
    .input(onboardingDraftInputSchema)
    .mutation(({ ctx, input }) => saveOnboardingInput({ ctx, input, completedAt: null })),

  extractFromNarrative: publicProcedure
    .input(onboardingNarrativeInputSchema)
    .mutation(({ ctx, input }) => extractOnboardingFromNarrative(ctx, input)),

  complete: publicProcedure
    .input(onboardingCompleteInputSchema)
    .mutation(({ ctx, input }) =>
      saveOnboardingInput({ ctx, input, completedAt: new Date().toISOString() })
    )
});
