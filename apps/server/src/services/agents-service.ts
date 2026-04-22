import { MentorPreviewWorkflow } from "@leetgrind/agents";
import type { AgentPreviewInput, AgentPreviewResult } from "@leetgrind/shared";
import type { AppContext } from "../context.js";
import { resolveRuntimeProvider, toAgentRunSummary } from "./ai-service.js";
import { searchRagContext } from "./rag-service.js";

export async function runMentorPreview(
  ctx: AppContext,
  input: AgentPreviewInput
): Promise<AgentPreviewResult> {
  const { config, provider, setting } = await resolveRuntimeProvider(ctx, input.providerId);
  const goal = input.goalId ? await ctx.database.repositories.goals.getById(input.goalId) : null;
  const contextItems = input.includeContext
    ? await searchRagContext(ctx, {
        query: input.prompt,
        limit: input.limit,
        domain: "content",
        providerId: input.providerId
      })
    : [];
  const run = await ctx.database.repositories.agentRuns.create({
    kind: "mentor",
    status: "running",
    providerId: setting.id,
    model: config.textModel,
    input: {
      prompt: input.prompt,
      locale: input.locale,
      goalId: input.goalId ?? null,
      contextItemIds: contextItems.map((item) => item.chunkId)
    },
    startedAt: new Date()
  });
  const workflow = new MentorPreviewWorkflow();

  try {
    const result = await workflow.run({
      contextItems,
      goal,
      locale: input.locale,
      prompt: input.prompt,
      provider,
      run: toAgentRunSummary(run)
    });
    const completedRun =
      (await ctx.database.repositories.agentRuns.update(run.id, {
        status: "succeeded",
        output: {
          ...result,
          contextItemIds: contextItems.map((item) => item.chunkId)
        },
        completedAt: new Date()
      })) ?? run;

    return {
      run: toAgentRunSummary(completedRun),
      providerId: setting.id,
      model: config.textModel,
      summary: result.summary,
      response: result.response,
      nextActions: result.nextActions,
      evidence: result.evidence,
      contextItems
    };
  } catch (error) {
    const completedRun =
      (await ctx.database.repositories.agentRuns.update(run.id, {
        status: "failed",
        error: error instanceof Error ? error.message : "Mentor preview failed.",
        completedAt: new Date()
      })) ?? run;

    throw Object.assign(error instanceof Error ? error : new Error("Mentor preview failed."), {
      run: toAgentRunSummary(completedRun)
    });
  }
}
