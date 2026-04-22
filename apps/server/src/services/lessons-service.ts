import { LessonPlannerWorkflow } from "@leetgrind/agents";
import type { LearningItem } from "@leetgrind/domain";
import type { GenerateLessonInput, LessonDetail, LessonSummary } from "@leetgrind/shared";
import type { AppContext } from "../context.js";
import { resolveRuntimeProvider, toAgentRunSummary } from "./ai-service.js";
import { searchRagContext } from "./rag-service.js";

function toLessonSummary(item: LearningItem): LessonSummary {
  return {
    id: item.id,
    kind: "lesson",
    title: item.title,
    summary: item.summary,
    skillId: item.skillId,
    difficulty: item.difficulty,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  };
}

function toLessonDetail(item: LearningItem): LessonDetail {
  return {
    ...toLessonSummary(item),
    payload: item.payload as LessonDetail["payload"]
  };
}

export async function listLessons(
  ctx: AppContext,
  input: { skillId?: string; limit?: number } = {}
): Promise<LessonSummary[]> {
  const lessons = await ctx.database.repositories.learningItems.listLessons(input);

  return lessons.map(toLessonSummary);
}

export async function getLesson(ctx: AppContext, lessonId: string): Promise<LessonDetail | null> {
  const lesson = await ctx.database.repositories.learningItems.getById(lessonId);

  if (!lesson || lesson.kind !== "lesson") {
    return null;
  }

  return toLessonDetail(lesson);
}

export async function generateLessons(
  ctx: AppContext,
  input: GenerateLessonInput
): Promise<LessonDetail[]> {
  const { config, provider, setting } = await resolveRuntimeProvider(ctx);
  const skill = input.skillId ? await ctx.database.repositories.skills.getById(input.skillId) : null;
  const query = input.focusPrompt ?? skill?.title ?? "interview preparation";
  const contextItems = await searchRagContext(ctx, {
    query,
    limit: 4,
    domain: "content",
    providerId: setting.id
  });
  const run = await ctx.database.repositories.agentRuns.create({
    kind: "lesson-planner",
    status: "running",
    providerId: setting.id,
    model: config.textModel,
    input: {
      goalId: input.goalId ?? null,
      skillId: input.skillId ?? null,
      evidenceIds: input.evidenceIds ?? [],
      contextItemIds: contextItems.map((item) => item.chunkId)
    },
    startedAt: new Date()
  });
  const workflow = new LessonPlannerWorkflow();

  try {
    const result = await workflow.run({
      contextItems,
      locale: input.locale,
      skill: skill ? { id: skill.id, title: skill.title } : null,
      focusPrompt: input.focusPrompt ?? null,
      evidenceIds: input.evidenceIds ?? [],
      provider
    });
    const created = await Promise.all(
      result.lessons.map((lesson) =>
        ctx.database.repositories.learningItems.createLesson({
          title: lesson.title,
          summary: lesson.summary,
          skillId: lesson.skillId,
          difficulty: lesson.difficulty,
          payload: lesson.payload
        })
      )
    );

    await ctx.database.repositories.agentRuns.update(run.id, {
      status: "succeeded",
      output: {
        lessonIds: created.map((lesson) => lesson.id),
        contextItemIds: contextItems.map((item) => item.chunkId)
      },
      completedAt: new Date()
    });

    return created.map(toLessonDetail);
  } catch (error) {
    await ctx.database.repositories.agentRuns.update(run.id, {
      status: "failed",
      error: error instanceof Error ? error.message : "Lesson generation failed.",
      completedAt: new Date()
    });

    throw Object.assign(error instanceof Error ? error : new Error("Lesson generation failed."), {
      run: toAgentRunSummary(run)
    });
  }
}
