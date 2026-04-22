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

export const agentRunSummarySchema = z.object({
  id: uuidSchema,
  kind: z.enum([
    "mentor",
    "interviewer",
    "coding-reviewer",
    "planner",
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
