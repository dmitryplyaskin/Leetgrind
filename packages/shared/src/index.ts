import { z } from "zod";

export const idSchema = z.string().min(1);
export const uuidSchema = z.uuid();
export const nonEmptyStringSchema = z.string().trim().min(1);
export const nullableTrimmedStringSchema = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .nullable()
  .optional();

export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export const appConfigSchema = z.object({
  databaseUrl: z.string().optional(),
  defaultAiProviderId: z.string().optional()
});

export type AppConfig = z.infer<typeof appConfigSchema>;

export const experienceLevelSchema = z.enum(["beginner", "junior", "middle", "senior", "expert"]);
export const goalTypeSchema = z.enum([
  "job-search",
  "company-interview",
  "role-growth",
  "skill-growth",
  "custom"
]);
export const targetSenioritySchema = z.enum([
  "intern",
  "junior",
  "middle",
  "senior",
  "staff",
  "lead"
]);
export const skillLevelSchema = z.enum(["unknown", "weak", "developing", "strong"]);
export const userInterfaceLocaleSchema = z.enum(["ru", "en"]);
export type UserInterfaceLocale = z.infer<typeof userInterfaceLocaleSchema>;
export const userLanguagePreferenceSchema = z.enum(["ru", "en", "mixed"]);
export type UserLanguagePreference = z.infer<typeof userLanguagePreferenceSchema>;
export const studyRhythmSchema = z.enum(["daily", "weekdays", "weekends", "weekly", "flexible"]);
export type StudyRhythm = z.infer<typeof studyRhythmSchema>;
export const aiProviderKindSchema = z.enum([
  "openai-codex",
  "openai-api-key",
  "openrouter",
  "local"
]);
export type AiProviderKind = z.infer<typeof aiProviderKindSchema>;
export const aiProviderPreferenceSchema = z.union([
  aiProviderKindSchema,
  z.literal("not-configured")
]);
export const retrievalDomainSchema = z.enum(["content", "memory"]);
export const assessmentQuestionKindSchema = z.enum([
  "multiple-choice",
  "short-answer",
  "explanation",
  "scenario-analysis"
]);
export type AssessmentQuestionKind = z.infer<typeof assessmentQuestionKindSchema>;
export const assessmentSessionStatusSchema = z.enum([
  "draft",
  "in-progress",
  "completed",
  "abandoned"
]);
export type AssessmentSessionStatus = z.infer<typeof assessmentSessionStatusSchema>;
export const evaluationVerdictSchema = z.enum(["excellent", "pass", "needs-work", "fail"]);
export const recommendationKindSchema = z.enum([
  "lesson",
  "practice",
  "review",
  "assessment",
  "interview",
  "adjacent-topic"
]);
export const recommendationStatusSchema = z.enum([
  "pending",
  "accepted",
  "dismissed",
  "completed"
]);
const nullableRequiredTextSchema = z.union([
  z.string().trim().min(1),
  z.literal("").transform(() => null),
  z.null()
]);
const nullableTargetSenioritySchema = z.union([
  targetSenioritySchema,
  z.literal("").transform(() => null),
  z.null()
]);

export const onboardingProfileInputSchema = z.object({
  displayName: nullableRequiredTextSchema,
  targetRole: nullableRequiredTextSchema,
  experienceLevel: experienceLevelSchema.nullable()
});

export const onboardingGoalInputSchema = z.object({
  title: z.string().trim().min(1),
  goalType: goalTypeSchema,
  targetRole: nullableRequiredTextSchema,
  targetCompany: nullableRequiredTextSchema,
  targetSeniority: nullableTargetSenioritySchema,
  interviewDate: nullableRequiredTextSchema,
  focusAreas: z.array(z.string().trim().min(1)).max(12),
  description: nullableRequiredTextSchema
});

export const selfAssessedSkillInputSchema = z.object({
  title: z.string().trim().min(1),
  level: skillLevelSchema,
  description: nullableRequiredTextSchema
});

export const onboardingPreferencesInputSchema = z.object({
  uiLocale: userInterfaceLocaleSchema,
  contentLanguage: userLanguagePreferenceSchema,
  programmingLanguages: z.array(z.string().trim().min(1)).min(1).max(12),
  studyRhythm: studyRhythmSchema,
  preferredAiProviderKind: aiProviderPreferenceSchema
});

export const resumeDocumentInputSchema = z.object({
  title: z.string().trim().min(1),
  content: z.string().trim().min(1)
});

export const optionalResumeDocumentInputSchema = z.preprocess((value) => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return value;
  }

  const record = value as Record<string, unknown>;
  const title = typeof record.title === "string" ? record.title.trim() : "";
  const content = typeof record.content === "string" ? record.content.trim() : "";

  if (content.length === 0) {
    return null;
  }

  return {
    title: title.length > 0 ? title : "Resume",
    content
  };
}, resumeDocumentInputSchema.nullable());

export const onboardingCompleteInputSchema = z.object({
  profile: onboardingProfileInputSchema,
  goals: z.array(onboardingGoalInputSchema).min(1).max(8),
  skills: z.array(selfAssessedSkillInputSchema).min(1).max(80),
  resume: optionalResumeDocumentInputSchema,
  preferences: onboardingPreferencesInputSchema
});

export type OnboardingCompleteInput = z.infer<typeof onboardingCompleteInputSchema>;

export const onboardingDraftInputSchema = z.object({
  profile: onboardingProfileInputSchema,
  goals: z
    .array(
      onboardingGoalInputSchema.extend({
        title: z.string().trim()
      })
    )
    .max(8),
  skills: z
    .array(
      selfAssessedSkillInputSchema.extend({
        title: z.string().trim()
      })
    )
    .max(80),
  resume: z
    .object({
      title: z.string().trim(),
      content: z.string().trim()
    })
    .nullable(),
  preferences: onboardingPreferencesInputSchema
});

export type OnboardingDraftInput = z.infer<typeof onboardingDraftInputSchema>;

const nullableOptionalTextSchema = z.union([
  z.string().trim().min(1),
  z.literal("").transform(() => null),
  z.null(),
  z.undefined()
]);

export const aiProviderConfigSchema = z.object({
  textModel: z.string().trim().min(1),
  embeddingModel: nullableOptionalTextSchema.optional(),
  appName: nullableOptionalTextSchema.optional(),
  appUrl: z.union([
    z.string().trim().url(),
    z.literal("").transform(() => null),
    z.null(),
    z.undefined()
  ]).optional()
});

export type AiProviderConfig = z.infer<typeof aiProviderConfigSchema>;

export const aiProviderCapabilitiesSchema = z.object({
  textGeneration: z.boolean(),
  objectGeneration: z.boolean(),
  textStreaming: z.boolean(),
  embeddings: z.boolean()
});

export type AiProviderCapabilities = z.infer<typeof aiProviderCapabilitiesSchema>;

export const aiProviderSummarySchema = z.object({
  id: uuidSchema,
  kind: aiProviderKindSchema,
  displayName: z.string().trim().min(1),
  isDefault: z.boolean(),
  hasSecret: z.boolean(),
  isImplemented: z.boolean(),
  config: aiProviderConfigSchema,
  capabilities: aiProviderCapabilitiesSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});

export type AiProviderSummary = z.infer<typeof aiProviderSummarySchema>;

export const aiProviderHealthSchema = z.object({
  providerId: uuidSchema,
  status: z.enum(["ok", "error", "not-configured"]),
  checkedAt: z.coerce.date().nullable(),
  latencyMs: z.number().int().nonnegative().nullable(),
  message: z.string().nullable(),
  model: z.string().nullable(),
  capabilities: aiProviderCapabilitiesSchema
});

export type AiProviderHealth = z.infer<typeof aiProviderHealthSchema>;

export const aiSettingsSchema = z.object({
  defaultProviderId: uuidSchema.nullable(),
  providers: z.array(aiProviderSummarySchema)
});

export type AiSettings = z.infer<typeof aiSettingsSchema>;

export const saveAiProviderInputSchema = z.object({
  id: uuidSchema.optional(),
  kind: aiProviderKindSchema,
  displayName: z.string().trim().min(1),
  isDefault: z.boolean().default(false),
  textModel: z.string().trim().min(1),
  embeddingModel: nullableOptionalTextSchema.optional(),
  apiKey: z.string().trim().min(1),
  appName: nullableOptionalTextSchema.optional(),
  appUrl: z.union([
    z.string().trim().url(),
    z.literal("").transform(() => null),
    z.null(),
    z.undefined()
  ]).optional()
});

export type SaveAiProviderInput = z.infer<typeof saveAiProviderInputSchema>;

export const testAiProviderInputSchema = z.object({
  providerId: uuidSchema
});

export type TestAiProviderInput = z.infer<typeof testAiProviderInputSchema>;

export const providerIdInputSchema = z.object({
  providerId: uuidSchema
});

export const ragDocumentCreateInputSchema = z.object({
  title: z.string().trim().min(1),
  sourceType: z.enum(["resume", "note", "import", "generated"]),
  source: z.string().trim().min(1),
  contentType: z.string().trim().min(1),
  content: z.string().trim().min(1),
  metadata: z.record(z.string(), z.unknown()).optional()
});

export const ragIngestInputSchema = z.union([
  z.object({
    documentId: uuidSchema
  }),
  ragDocumentCreateInputSchema
]).and(
  z.object({
    providerId: uuidSchema.optional()
  })
);

export type RagIngestInput = z.infer<typeof ragIngestInputSchema>;

export const ragSearchInputSchema = z.object({
  query: z.string().trim().min(1),
  limit: z.number().int().min(1).max(12).default(6),
  domain: retrievalDomainSchema.default("content"),
  sourceTypes: z.array(z.enum(["resume", "note", "import", "generated"])).max(4).optional(),
  providerId: uuidSchema.optional(),
  goalId: uuidSchema.optional()
});

export type RagSearchInput = z.infer<typeof ragSearchInputSchema>;

export const ragContextItemSchema = z.object({
  domain: retrievalDomainSchema,
  documentId: uuidSchema,
  chunkId: uuidSchema,
  title: z.string().trim().min(1),
  sourceType: z.enum(["resume", "note", "import", "generated"]),
  source: z.string().trim().min(1),
  excerpt: z.string().trim().min(1),
  score: z.number(),
  citationLabel: z.string().trim().min(1),
  metadata: z.record(z.string(), z.unknown())
});

export type RagContextItem = z.infer<typeof ragContextItemSchema>;

export const assessmentChoiceSchema = z.object({
  id: nonEmptyStringSchema,
  label: nonEmptyStringSchema
});

export const assessmentQuestionBaseSchema = z.object({
  id: uuidSchema,
  skillId: uuidSchema.nullable(),
  prompt: nonEmptyStringSchema,
  explanation: z.string().trim().nullable().optional()
});

export const multipleChoiceQuestionSchema = assessmentQuestionBaseSchema.extend({
  kind: z.literal("multiple-choice"),
  choices: z.array(assessmentChoiceSchema).min(2).max(6),
  correctChoiceIds: z.array(nonEmptyStringSchema).min(1).max(4),
  rationale: z.string().trim().nullable().optional()
});

export const shortAnswerQuestionSchema = assessmentQuestionBaseSchema.extend({
  kind: z.literal("short-answer"),
  expectedConcepts: z.array(nonEmptyStringSchema).min(1).max(6),
  placeholder: z.string().trim().nullable().optional()
});

export const explanationQuestionSchema = assessmentQuestionBaseSchema.extend({
  kind: z.literal("explanation"),
  rubric: z.array(nonEmptyStringSchema).min(2).max(8)
});

export const scenarioAnalysisQuestionSchema = assessmentQuestionBaseSchema.extend({
  kind: z.literal("scenario-analysis"),
  scenario: nonEmptyStringSchema,
  rubric: z.array(nonEmptyStringSchema).min(2).max(8)
});

export const assessmentQuestionSchema = z.discriminatedUnion("kind", [
  multipleChoiceQuestionSchema,
  shortAnswerQuestionSchema,
  explanationQuestionSchema,
  scenarioAnalysisQuestionSchema
]);

export type AssessmentQuestion = z.infer<typeof assessmentQuestionSchema>;

export const multipleChoiceAnswerSchema = z.object({
  questionId: uuidSchema,
  kind: z.literal("multiple-choice"),
  selectedChoiceIds: z.array(nonEmptyStringSchema).max(4)
});

export const textAssessmentAnswerSchema = z.object({
  questionId: uuidSchema,
  kind: z.enum(["short-answer", "explanation", "scenario-analysis"]),
  responseText: nonEmptyStringSchema
});

export const assessmentAnswerSchema = z.discriminatedUnion("kind", [
  multipleChoiceAnswerSchema,
  textAssessmentAnswerSchema
]);

export type AssessmentAnswer = z.infer<typeof assessmentAnswerSchema>;

export const assessmentQuestionEvaluationSchema = z.object({
  questionId: uuidSchema,
  score: z.number().min(0).max(1),
  verdict: evaluationVerdictSchema,
  feedback: nonEmptyStringSchema,
  strengths: z.array(nonEmptyStringSchema).max(4),
  gaps: z.array(nonEmptyStringSchema).max(4),
  citedContextIds: z.array(uuidSchema).max(8)
});

export type AssessmentQuestionEvaluation = z.infer<typeof assessmentQuestionEvaluationSchema>;

export const assessmentEvidenceSeedSchema = z.object({
  summary: nonEmptyStringSchema,
  polarity: z.enum(["strength", "weakness", "gap", "progress", "neutral"]),
  confidence: z.number().min(0).max(1),
  skillId: uuidSchema.nullable().optional()
});

export type AssessmentEvidenceSeed = z.infer<typeof assessmentEvidenceSeedSchema>;

export const assessmentSessionSummarySchema = z.object({
  id: uuidSchema,
  profileId: uuidSchema,
  goalId: uuidSchema.nullable(),
  skillId: uuidSchema.nullable(),
  status: assessmentSessionStatusSchema,
  locale: userInterfaceLocaleSchema,
  title: nonEmptyStringSchema,
  summary: z.string().trim().nullable(),
  difficulty: z.string().trim().nullable(),
  focusPrompt: z.string().trim().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  completedAt: z.coerce.date().nullable()
});

export type AssessmentSessionSummary = z.infer<typeof assessmentSessionSummarySchema>;

export const assessmentAnswerRecordSchema = z.object({
  id: uuidSchema,
  sessionId: uuidSchema,
  questionId: uuidSchema,
  answer: assessmentAnswerSchema,
  score: z.number().min(0).max(1).nullable(),
  feedback: z.string().trim().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});

export type AssessmentAnswerRecord = z.infer<typeof assessmentAnswerRecordSchema>;

export const lessonPayloadSchema = z.object({
  body: nonEmptyStringSchema,
  takeaways: z.array(nonEmptyStringSchema).min(1).max(8),
  practicePrompt: z.string().trim().nullable().optional(),
  evidenceIds: z.array(uuidSchema).max(12).default([]),
  contextItemIds: z.array(uuidSchema).max(12).default([])
});

export type LessonPayload = z.infer<typeof lessonPayloadSchema>;

export const lessonSummarySchema = z.object({
  id: uuidSchema,
  kind: z.literal("lesson"),
  title: nonEmptyStringSchema,
  summary: z.string().trim().nullable(),
  skillId: uuidSchema.nullable(),
  difficulty: z.string().trim().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});

export type LessonSummary = z.infer<typeof lessonSummarySchema>;

export const lessonDetailSchema = lessonSummarySchema.extend({
  payload: lessonPayloadSchema
});

export type LessonDetail = z.infer<typeof lessonDetailSchema>;

export const recommendationSummarySchema = z.object({
  id: uuidSchema,
  profileId: uuidSchema,
  goalId: uuidSchema.nullable(),
  skillId: uuidSchema.nullable(),
  kind: recommendationKindSchema,
  status: recommendationStatusSchema,
  title: nonEmptyStringSchema,
  rationale: nonEmptyStringSchema,
  evidenceIds: z.array(uuidSchema),
  payload: z.record(z.string(), z.unknown()),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});

export type RecommendationSummary = z.infer<typeof recommendationSummarySchema>;

export const assessmentResultSchema = z.object({
  session: assessmentSessionSummarySchema,
  overallScore: z.number().min(0).max(100),
  verdict: evaluationVerdictSchema,
  summary: nonEmptyStringSchema,
  evaluationId: uuidSchema,
  attemptId: uuidSchema,
  evidence: z.array(
    z.object({
      id: uuidSchema,
      summary: nonEmptyStringSchema,
      polarity: z.enum(["strength", "weakness", "gap", "progress", "neutral"]),
      confidence: z.number().min(0).max(1),
      skillId: uuidSchema.nullable(),
      goalId: uuidSchema.nullable(),
      createdAt: z.coerce.date()
    })
  ),
  questionEvaluations: z.array(assessmentQuestionEvaluationSchema),
  lessons: z.array(lessonSummarySchema),
  recommendations: z.array(recommendationSummarySchema)
});

export type AssessmentResult = z.infer<typeof assessmentResultSchema>;

export const assessmentSessionDetailSchema = z.object({
  session: assessmentSessionSummarySchema,
  questions: z.array(assessmentQuestionSchema),
  answers: z.array(assessmentAnswerRecordSchema),
  result: assessmentResultSchema.nullable()
});

export type AssessmentSessionDetail = z.infer<typeof assessmentSessionDetailSchema>;

export const agentRunSummarySchema = z.object({
  id: uuidSchema,
  kind: z.enum([
    "mentor",
    "assessment-mentor",
    "interviewer",
    "coding-reviewer",
    "planner",
    "lesson-planner",
    "recommender",
    "ingestion",
    "provider-test"
  ]),
  status: z.enum(["queued", "running", "succeeded", "failed", "canceled"]),
  providerId: z.string().nullable(),
  model: z.string().nullable(),
  error: z.string().nullable(),
  startedAt: z.coerce.date().nullable(),
  completedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date()
});

export type AgentRunSummary = z.infer<typeof agentRunSummarySchema>;

export const assessmentCreateSessionInputSchema = z.object({
  goalId: uuidSchema.optional(),
  skillId: uuidSchema.optional(),
  locale: userInterfaceLocaleSchema,
  difficulty: nullableOptionalTextSchema.optional(),
  focusPrompt: nullableOptionalTextSchema.optional()
});

export type AssessmentCreateSessionInput = z.infer<typeof assessmentCreateSessionInputSchema>;

export const assessmentSubmitAnswerInputSchema = z.object({
  sessionId: uuidSchema,
  answer: assessmentAnswerSchema
});

export type AssessmentSubmitAnswerInput = z.infer<typeof assessmentSubmitAnswerInputSchema>;

export const assessmentSessionInputSchema = z.object({
  sessionId: uuidSchema
});

export type AssessmentSessionInput = z.infer<typeof assessmentSessionInputSchema>;

export const lessonsListInputSchema = z
  .object({
    skillId: uuidSchema.optional(),
    limit: z.number().int().min(1).max(24).default(12)
  })
  .optional();

export type LessonsListInput = z.infer<typeof lessonsListInputSchema>;

export const lessonIdInputSchema = z.object({
  lessonId: uuidSchema
});

export type LessonIdInput = z.infer<typeof lessonIdInputSchema>;

export const generateLessonInputSchema = z.object({
  goalId: uuidSchema.optional(),
  skillId: uuidSchema.optional(),
  locale: userInterfaceLocaleSchema,
  focusPrompt: nullableOptionalTextSchema.optional(),
  evidenceIds: z.array(uuidSchema).max(12).optional()
});

export type GenerateLessonInput = z.infer<typeof generateLessonInputSchema>;

export const refreshRecommendationsInputSchema = z.object({
  goalId: uuidSchema.optional(),
  skillId: uuidSchema.optional(),
  limit: z.number().int().min(1).max(8).default(4)
});

export type RefreshRecommendationsInput = z.infer<typeof refreshRecommendationsInputSchema>;

export const recommendationMutationInputSchema = z.object({
  recommendationId: uuidSchema
});

export type RecommendationMutationInput = z.infer<typeof recommendationMutationInputSchema>;

export const recommendationRefreshResultSchema = z.object({
  created: z.array(recommendationSummarySchema),
  reused: z.array(recommendationSummarySchema)
});

export type RecommendationRefreshResult = z.infer<typeof recommendationRefreshResultSchema>;

export const agentPreviewInputSchema = z.object({
  prompt: z.string().trim().min(1),
  locale: userInterfaceLocaleSchema,
  goalId: uuidSchema.optional(),
  providerId: uuidSchema.optional(),
  limit: z.number().int().min(1).max(8).default(4),
  includeContext: z.boolean().default(true)
});

export type AgentPreviewInput = z.infer<typeof agentPreviewInputSchema>;

export const agentPreviewResultSchema = z.object({
  run: agentRunSummarySchema,
  providerId: uuidSchema,
  model: z.string().min(1),
  summary: z.string().trim().min(1),
  response: z.string().trim().min(1),
  nextActions: z.array(z.string().trim().min(1)).max(6),
  evidence: z.array(z.string().trim().min(1)).max(8),
  contextItems: z.array(ragContextItemSchema)
});

export type AgentPreviewResult = z.infer<typeof agentPreviewResultSchema>;
