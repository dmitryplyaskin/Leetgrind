import type { AiProvider } from "@leetgrind/ai";
import type { Goal } from "@leetgrind/domain";
import type {
  AgentPreviewInput,
  AgentPreviewResult,
  AgentRunSummary,
  RagContextItem,
  UserInterfaceLocale
} from "@leetgrind/shared";
import { z } from "zod";

export interface AgentWorkflow<TInput, TOutput> {
  run(input: TInput): Promise<TOutput>;
}

export type AgentRunRecord = AgentRunSummary;
export type MentorPreviewInput = AgentPreviewInput;
export type MentorPreviewOutput = AgentPreviewResult;

const mentorPreviewSchema = z.object({
  summary: z.string().trim().min(1),
  response: z.string().trim().min(1),
  nextActions: z.array(z.string().trim().min(1)).max(6),
  evidence: z.array(z.string().trim().min(1)).max(8)
});

export interface MentorPreviewWorkflowInput {
  contextItems: RagContextItem[];
  goal: Goal | null;
  locale: UserInterfaceLocale;
  prompt: string;
  provider: AiProvider;
  run: AgentRunRecord;
}

export interface MentorPreviewWorkflowResult {
  evidence: string[];
  nextActions: string[];
  response: string;
  summary: string;
}

function buildMentorSystemPrompt(locale: UserInterfaceLocale) {
  if (locale === "ru") {
    return [
      "Ты выступаешь как личный технический ментор по подготовке к собеседованиям.",
      "Опирайся только на переданный контекст и запрос пользователя.",
      "Отвечай практично, без маркетингового тона, в production-ready стиле.",
      "Если контекста недостаточно, прямо отметь пробел."
    ].join("\n");
  }

  return [
    "You are a personal technical mentor for interview preparation.",
    "Rely on the provided context and the learner request.",
    "Be practical, concise, and production-ready.",
    "If the context is incomplete, say so clearly."
  ].join("\n");
}

function buildMentorPrompt({
  contextItems,
  goal,
  prompt
}: {
  contextItems: RagContextItem[];
  goal: Goal | null;
  prompt: string;
}) {
  const goalContext = goal
    ? `Goal: ${goal.title}${goal.targetRole ? ` (${goal.targetRole})` : ""}`
    : "Goal: not specified";
  const citations =
    contextItems.length > 0
      ? contextItems
          .map(
            (item) =>
              `[${item.citationLabel}] ${item.title} / ${item.sourceType}: ${item.excerpt}`
          )
          .join("\n")
      : "No retrieved context.";

  return [goalContext, "Retrieved context:", citations, "Learner request:", prompt].join("\n\n");
}

export class MentorPreviewWorkflow
  implements AgentWorkflow<MentorPreviewWorkflowInput, MentorPreviewWorkflowResult>
{
  async run(input: MentorPreviewWorkflowInput): Promise<MentorPreviewWorkflowResult> {
    const model =
      input.run.model ??
      (await input.provider.listModels()).find((item) => item.supportsTextGeneration)?.id;

    if (!model) {
      throw new Error("No text-capable model is available for mentor preview.");
    }

    const result = await input.provider.generateObject({
      model,
      system: buildMentorSystemPrompt(input.locale),
      prompt: buildMentorPrompt({
        contextItems: input.contextItems,
        goal: input.goal,
        prompt: input.prompt
      }),
      schema: mentorPreviewSchema
    });

    return {
      summary: result.summary,
      response: result.response,
      nextActions: result.nextActions,
      evidence: result.evidence
    };
  }
}
