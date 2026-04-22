import type { AiProvider } from "@leetgrind/ai";
import type {
  AssessmentAnswer,
  AssessmentQuestion,
  Goal,
  LessonPayload,
  RecommendationKind
} from "@leetgrind/domain";
import type {
  AgentPreviewInput,
  AgentPreviewResult,
  AgentRunSummary,
  AssessmentEvidenceSeed,
  AssessmentQuestionEvaluation,
  RagContextItem,
  RecommendationSummary,
  UserInterfaceLocale
} from "@leetgrind/shared";
import {
  assessmentEvidenceSeedSchema,
  assessmentQuestionEvaluationSchema,
  ragContextItemSchema
} from "@leetgrind/shared";
import { z } from "zod";

function createUuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === "x" ? random : (random & 0x3) | 0x8;

    return value.toString(16);
  });
}

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

const assessmentQuestionSeedSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("multiple-choice"),
    prompt: z.string().trim().min(1),
    explanation: z.string().trim().nullable(),
    choices: z
      .array(
        z.object({
          id: z.string().trim().min(1),
          label: z.string().trim().min(1)
        })
      )
      .min(2)
      .max(6),
    correctChoiceIds: z.array(z.string().trim().min(1)).min(1).max(4),
    rationale: z.string().trim().nullable()
  }),
  z.object({
    kind: z.literal("short-answer"),
    prompt: z.string().trim().min(1),
    explanation: z.string().trim().nullable(),
    expectedConcepts: z.array(z.string().trim().min(1)).min(1).max(6),
    placeholder: z.string().trim().nullable()
  }),
  z.object({
    kind: z.literal("explanation"),
    prompt: z.string().trim().min(1),
    explanation: z.string().trim().nullable(),
    rubric: z.array(z.string().trim().min(1)).min(2).max(8)
  }),
  z.object({
    kind: z.literal("scenario-analysis"),
    prompt: z.string().trim().min(1),
    explanation: z.string().trim().nullable(),
    scenario: z.string().trim().min(1),
    rubric: z.array(z.string().trim().min(1)).min(2).max(8)
  })
]);

const assessmentDraftSchema = z.object({
  title: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  questions: z.array(assessmentQuestionSeedSchema).min(4).max(8)
});

const assessmentEvaluationSchema = z.object({
  summary: z.string().trim().min(1),
  overallScore: z.number().min(0).max(100),
  verdict: z.enum(["excellent", "pass", "needs-work", "fail"]),
  questionEvaluations: z.array(assessmentQuestionEvaluationSchema).max(8),
  evidence: z.array(assessmentEvidenceSeedSchema).max(10)
});

const lessonSeedSchema = z.object({
  title: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  skillId: z.string().trim().uuid().nullable(),
  difficulty: z.string().trim().nullable(),
  payload: z.object({
    body: z.string().trim().min(1),
    takeaways: z.array(z.string().trim().min(1)).min(1).max(8),
    practicePrompt: z.string().trim().nullable(),
    evidenceIds: z.array(z.string().trim().uuid()).max(12),
    contextItemIds: z.array(z.string().trim().uuid()).max(12)
  })
});

const lessonPlanSchema = z.object({
  lessons: z.array(lessonSeedSchema).min(1).max(3)
});

const recommendationSeedSchema = z.object({
  kind: z.enum(["lesson", "practice", "review", "assessment", "interview", "adjacent-topic"]),
  title: z.string().trim().min(1),
  rationale: z.string().trim().min(1),
  skillId: z.string().trim().uuid().nullable(),
  goalId: z.string().trim().uuid().nullable(),
  evidenceIds: z.array(z.string().trim().uuid()).max(12),
  payload: z.record(z.string(), z.unknown())
});

const recommenderSchema = z.object({
  recommendations: z.array(recommendationSeedSchema).min(1).max(4)
});

type AssessmentQuestionSeed = z.infer<typeof assessmentQuestionSeedSchema>;

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

function buildAssessmentSystemPrompt(locale: UserInterfaceLocale) {
  if (locale === "ru") {
    return [
      "Ты создаешь и оцениваешь assessment для подготовки к техническим собеседованиям.",
      "Вопросы должны быть конкретными, проверяемыми и полезными для обучения.",
      "Избегай воды. Все выводы должны быть объяснимы."
    ].join("\n");
  }

  return [
    "You create and evaluate interview-preparation assessments.",
    "Questions must be concrete, learner-useful, and explainable.",
    "Avoid fluff and keep outputs actionable."
  ].join("\n");
}

function buildContextBlock(contextItems: RagContextItem[]) {
  return contextItems.length > 0
    ? contextItems
        .map((item) => `[${item.citationLabel}] ${item.title}: ${item.excerpt}`)
        .join("\n")
    : "No retrieved context.";
}

function withQuestionIds(question: AssessmentQuestionSeed, skillId: string | null): AssessmentQuestion {
  return {
    id: createUuid(),
    skillId,
    ...question
  };
}

async function resolveTextModel(provider: AiProvider) {
  const model = (await provider.listModels()).find((item) => item.supportsTextGeneration)?.id;

  if (!model) {
    throw new Error("No text-capable model is available.");
  }

  return model;
}

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

  return [
    goalContext,
    "Retrieved context:",
    buildContextBlock(contextItems),
    "Learner request:",
    prompt
  ].join("\n\n");
}

export class MentorPreviewWorkflow
  implements AgentWorkflow<MentorPreviewWorkflowInput, MentorPreviewWorkflowResult>
{
  async run(input: MentorPreviewWorkflowInput): Promise<MentorPreviewWorkflowResult> {
    const model = input.run.model ?? (await resolveTextModel(input.provider));
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

export interface AssessmentDraftWorkflowInput {
  contextItems: RagContextItem[];
  goal: Goal | null;
  locale: UserInterfaceLocale;
  focusPrompt: string | null;
  skill: { id: string; title: string; description: string | null } | null;
  provider: AiProvider;
}

export interface AssessmentDraftWorkflowResult {
  title: string;
  summary: string;
  questions: AssessmentQuestion[];
}

export interface AssessmentEvaluationWorkflowInput {
  contextItems: RagContextItem[];
  locale: UserInterfaceLocale;
  questions: AssessmentQuestion[];
  answers: AssessmentAnswer[];
  provider: AiProvider;
}

export interface AssessmentEvaluationWorkflowResult {
  summary: string;
  overallScore: number;
  verdict: "excellent" | "pass" | "needs-work" | "fail";
  questionEvaluations: AssessmentQuestionEvaluation[];
  evidence: AssessmentEvidenceSeed[];
}

export class AssessmentMentorWorkflow {
  async createSession(input: AssessmentDraftWorkflowInput): Promise<AssessmentDraftWorkflowResult> {
    const model = await resolveTextModel(input.provider);
    const result = await input.provider.generateObject({
      model,
      system: buildAssessmentSystemPrompt(input.locale),
      prompt: [
        `Skill: ${input.skill?.title ?? "General interview preparation"}`,
        `Goal: ${input.goal?.title ?? "Not specified"}`,
        `Focus: ${input.focusPrompt ?? "Use the current skill and goal context."}`,
        "Retrieved context:",
        buildContextBlock(input.contextItems),
        "Generate a balanced assessment with mixed question types."
      ].join("\n\n"),
      schema: assessmentDraftSchema
    });

    return {
      title: result.title,
      summary: result.summary,
      questions: result.questions.map((question) => withQuestionIds(question, input.skill?.id ?? null))
    };
  }

  async evaluateSession(
    input: AssessmentEvaluationWorkflowInput
  ): Promise<AssessmentEvaluationWorkflowResult> {
    const model = await resolveTextModel(input.provider);
    const result = await input.provider.generateObject({
      model,
      system: buildAssessmentSystemPrompt(input.locale),
      prompt: [
        "Assessment questions:",
        JSON.stringify(input.questions),
        "Learner answers:",
        JSON.stringify(input.answers),
        "Retrieved context:",
        buildContextBlock(input.contextItems),
        "Evaluate the answers, produce question-level feedback, and extract explainable evidence."
      ].join("\n\n"),
      schema: assessmentEvaluationSchema
    });

    return result;
  }
}

export interface LessonSeed {
  title: string;
  summary: string;
  skillId: string | null;
  difficulty: string | null;
  payload: LessonPayload;
}

export interface LessonPlannerWorkflowInput {
  contextItems: RagContextItem[];
  locale: UserInterfaceLocale;
  skill: { id: string; title: string } | null;
  focusPrompt: string | null;
  evidenceIds: string[];
  provider: AiProvider;
}

export interface LessonPlannerWorkflowResult {
  lessons: LessonSeed[];
}

export class LessonPlannerWorkflow
  implements AgentWorkflow<LessonPlannerWorkflowInput, LessonPlannerWorkflowResult>
{
  async run(input: LessonPlannerWorkflowInput): Promise<LessonPlannerWorkflowResult> {
    const model = await resolveTextModel(input.provider);
    const result = await input.provider.generateObject({
      model,
      system:
        input.locale === "ru"
          ? "Ты создаешь короткие, практичные уроки для подготовки к собеседованиям."
          : "You create concise, practical interview-preparation lessons.",
      prompt: [
        `Skill: ${input.skill?.title ?? "General skill growth"}`,
        `Focus: ${input.focusPrompt ?? "Derive the lesson from recent evidence."}`,
        `Evidence ids: ${input.evidenceIds.join(", ") || "none"}`,
        "Retrieved context:",
        buildContextBlock(input.contextItems),
        "Create 1-3 lessons with concrete takeaways. Use null for skillId, difficulty, or practicePrompt when there is no useful value."
      ].join("\n\n"),
      schema: lessonPlanSchema
    });

    return {
      lessons: result.lessons.map((lesson) => ({
        title: lesson.title,
        summary: lesson.summary,
        skillId: lesson.skillId ?? input.skill?.id ?? null,
        difficulty: lesson.difficulty ?? null,
        payload: {
          ...lesson.payload,
          evidenceIds:
            lesson.payload.evidenceIds.length > 0
              ? lesson.payload.evidenceIds
              : input.evidenceIds,
          contextItemIds:
            lesson.payload.contextItemIds.length > 0
              ? lesson.payload.contextItemIds
              : input.contextItems.map((item) => item.chunkId)
        }
      }))
    };
  }
}

export interface RecommendationSeed {
  kind: RecommendationKind;
  title: string;
  rationale: string;
  skillId: string | null;
  goalId: string | null;
  evidenceIds: string[];
  payload: RecommendationSummary["payload"];
}

export interface RecommenderWorkflowInput {
  contextItems: RagContextItem[];
  locale: UserInterfaceLocale;
  goal: Goal | null;
  skill: { id: string; title: string } | null;
  evidenceIds: string[];
  provider: AiProvider;
}

export interface RecommenderWorkflowResult {
  recommendations: RecommendationSeed[];
}

export class RecommenderWorkflow
  implements AgentWorkflow<RecommenderWorkflowInput, RecommenderWorkflowResult>
{
  async run(input: RecommenderWorkflowInput): Promise<RecommenderWorkflowResult> {
    const model = await resolveTextModel(input.provider);
    const result = await input.provider.generateObject({
      model,
      system:
        input.locale === "ru"
          ? "Ты формируешь небольшой набор объяснимых следующих шагов."
          : "You generate a small set of explainable next actions.",
      prompt: [
        `Goal: ${input.goal?.title ?? "Not specified"}`,
        `Skill: ${input.skill?.title ?? "Not specified"}`,
        `Evidence ids: ${input.evidenceIds.join(", ") || "none"}`,
        "Retrieved context:",
        buildContextBlock(input.contextItems),
        "Return no more than four recommendations and keep rationale specific. Use null for goalId or skillId when not scoped."
      ].join("\n\n"),
      schema: recommenderSchema
    });

    return {
      recommendations: result.recommendations.map((recommendation) => ({
        ...recommendation,
        skillId: recommendation.skillId ?? input.skill?.id ?? null,
        goalId: recommendation.goalId ?? input.goal?.id ?? null,
        evidenceIds:
          recommendation.evidenceIds.length > 0 ? recommendation.evidenceIds : input.evidenceIds
      }))
    };
  }
}

export { assessmentDraftSchema, assessmentEvaluationSchema, lessonPlanSchema, recommenderSchema };
export type { AssessmentQuestionSeed };
export { ragContextItemSchema };
