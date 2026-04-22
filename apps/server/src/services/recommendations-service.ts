import { RecommenderWorkflow } from "@leetgrind/agents";
import { dedupePendingRecommendations, type RecommendationRefreshResult } from "@leetgrind/domain";
import type { RefreshRecommendationsInput } from "@leetgrind/shared";
import type { AppContext } from "../context.js";
import { resolveRuntimeProvider, toAgentRunSummary } from "./ai-service.js";
import { searchRagContext } from "./rag-service.js";

export async function refreshRecommendations(
  ctx: AppContext,
  input: RefreshRecommendationsInput
): Promise<RecommendationRefreshResult> {
  const { config, provider, setting } = await resolveRuntimeProvider(ctx);
  const [goal, skill, evidence] = await Promise.all([
    input.goalId ? ctx.database.repositories.goals.getById(input.goalId) : Promise.resolve(null),
    input.skillId ? ctx.database.repositories.skills.getById(input.skillId) : Promise.resolve(null),
    ctx.database.repositories.evidence.list()
  ]);
  const scopedEvidence = evidence
    .filter(
      (item) =>
        (!input.goalId || item.goalId === input.goalId) &&
        (!input.skillId || item.skillId === input.skillId)
    )
    .slice(0, 8);
  const query = skill?.title ?? goal?.title ?? "interview preparation";
  const contextItems = await searchRagContext(ctx, {
    query,
    limit: 4,
    domain: "content",
    providerId: setting.id,
    goalId: input.goalId
  });
  const run = await ctx.database.repositories.agentRuns.create({
    kind: "recommender",
    status: "running",
    providerId: setting.id,
    model: config.textModel,
    input: {
      goalId: input.goalId ?? null,
      skillId: input.skillId ?? null,
      evidenceIds: scopedEvidence.map((item) => item.id),
      contextItemIds: contextItems.map((item) => item.chunkId)
    },
    startedAt: new Date()
  });
  const workflow = new RecommenderWorkflow();

  try {
    const result = await workflow.run({
      contextItems,
      locale:
        (goal?.metadata?.uiLocale as "ru" | "en" | undefined) ??
        ((await ctx.database.repositories.userProfiles.ensureLocalProfile()).preferences
          ?.uiLocale as "ru" | "en" | undefined) ??
        "en",
      goal,
      skill: skill ? { id: skill.id, title: skill.title } : null,
      evidenceIds: scopedEvidence.map((item) => item.id),
      provider
    });
    const created = [];
    const reused = [];

    for (const seed of result.recommendations.slice(0, input.limit)) {
      const existing = await ctx.database.repositories.recommendations.findPendingByScope({
        goalId: seed.goalId,
        skillId: seed.skillId,
        kind: seed.kind
      });

      if (existing) {
        reused.push(existing);
        continue;
      }

      created.push(
        await ctx.database.repositories.recommendations.create({
          goalId: seed.goalId,
          skillId: seed.skillId,
          kind: seed.kind,
          title: seed.title,
          rationale: seed.rationale,
          evidenceIds: seed.evidenceIds,
          payload: seed.payload
        })
      );
    }

    await ctx.database.repositories.agentRuns.update(run.id, {
      status: "succeeded",
      output: {
        createdIds: created.map((item) => item.id),
        reusedIds: reused.map((item) => item.id)
      },
      completedAt: new Date()
    });

    return {
      created: dedupePendingRecommendations(created),
      reused: dedupePendingRecommendations(reused)
    };
  } catch (error) {
    await ctx.database.repositories.agentRuns.update(run.id, {
      status: "failed",
      error: error instanceof Error ? error.message : "Recommendation refresh failed.",
      completedAt: new Date()
    });

    throw Object.assign(
      error instanceof Error ? error : new Error("Recommendation refresh failed."),
      {
        run: toAgentRunSummary(run)
      }
    );
  }
}

export async function acceptRecommendation(ctx: AppContext, recommendationId: string) {
  return ctx.database.repositories.recommendations.accept(recommendationId);
}

export async function dismissRecommendation(ctx: AppContext, recommendationId: string) {
  return ctx.database.repositories.recommendations.dismiss(recommendationId);
}
