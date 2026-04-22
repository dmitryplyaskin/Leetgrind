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
export const userLanguagePreferenceSchema = z.enum(["ru", "en", "mixed"]);
export const studyRhythmSchema = z.enum(["daily", "weekdays", "weekends", "weekly", "flexible"]);
export const aiProviderPreferenceSchema = z.enum([
  "openai-codex",
  "openai-api-key",
  "openrouter",
  "local",
  "not-configured"
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

export const onboardingCompleteInputSchema = z.object({
  profile: onboardingProfileInputSchema,
  goals: z.array(onboardingGoalInputSchema).min(1).max(8),
  skills: z.array(selfAssessedSkillInputSchema).min(1).max(80),
  resume: resumeDocumentInputSchema.nullable(),
  preferences: onboardingPreferencesInputSchema
});

export type OnboardingCompleteInput = z.infer<typeof onboardingCompleteInputSchema>;
