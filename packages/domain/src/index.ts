export const LOCAL_USER_PROFILE_ID = "00000000-0000-0000-0000-000000000001";

export type ExperienceLevel = "beginner" | "junior" | "middle" | "senior" | "expert";
export type GoalStatus = "active" | "paused" | "completed" | "archived";
export type GoalType =
  | "job-search"
  | "company-interview"
  | "role-growth"
  | "skill-growth"
  | "custom";
export type TargetSeniority = "intern" | "junior" | "middle" | "senior" | "staff" | "lead";
export type GoalSkillRelevance = "primary" | "supporting" | "stretch";
export type SkillLevel = "unknown" | "weak" | "developing" | "strong";
export type SkillEdgeRelation =
  | "prerequisite"
  | "related"
  | "specialization"
  | "supports-goal";
export type LearningItemKind =
  | "lesson"
  | "assessment"
  | "coding-task"
  | "mock-interview"
  | "review";
export type AttemptKind = "answer" | "code" | "interview" | "lesson-check" | "assessment";
export type EvaluationVerdict = "excellent" | "pass" | "needs-work" | "fail";
export type EvidenceSourceType =
  | "attempt"
  | "evaluation"
  | "document"
  | "agent-run"
  | "manual";
export type EvidencePolarity = "strength" | "weakness" | "gap" | "progress" | "neutral";
export type DocumentSourceType = "resume" | "note" | "import" | "generated";
export type RecommendationKind =
  | "lesson"
  | "practice"
  | "review"
  | "assessment"
  | "interview"
  | "adjacent-topic";
export type RecommendationStatus = "pending" | "accepted" | "dismissed" | "completed";
export type ReviewState = "new" | "learning" | "review" | "relearning" | "suspended";
export type AgentRunKind =
  | "mentor"
  | "interviewer"
  | "coding-reviewer"
  | "planner"
  | "recommender"
  | "ingestion";
export type AgentRunStatus = "queued" | "running" | "succeeded" | "failed" | "canceled";
export type AiProviderKind = "openai-codex" | "openai-api-key" | "openrouter" | "local";
export type UserInterfaceLocale = "ru" | "en";
export type UserLanguagePreference = "ru" | "en" | "mixed";
export type StudyRhythm = "daily" | "weekdays" | "weekends" | "weekly" | "flexible";

export interface SelfAssessedSkill {
  title: string;
  level: SkillLevel;
  description: string | null;
}

export interface ResumeDocumentInput {
  title: string;
  content: string;
  source: "manual-onboarding";
}

export interface OnboardingPreferences {
  uiLocale: UserInterfaceLocale;
  contentLanguage: UserLanguagePreference;
  programmingLanguages: string[];
  studyRhythm: StudyRhythm;
  preferredAiProviderKind: AiProviderKind | "not-configured";
  onboarding: {
    completedAt: string | null;
  };
}

export interface UserProfile {
  id: string;
  displayName: string | null;
  targetRole: string | null;
  experienceLevel: ExperienceLevel | null;
  resumeText: string | null;
  preferences: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Goal {
  id: string;
  profileId: string;
  title: string;
  description: string | null;
  targetRole: string | null;
  status: GoalStatus;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoalSkill {
  goalId: string;
  skillId: string;
  relevance: GoalSkillRelevance;
  priority: number;
  createdAt: Date;
}

export interface Skill {
  id: string;
  slug: string;
  title: string;
  level: SkillLevel;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SkillEdge {
  id: string;
  fromSkillId: string;
  toSkillId: string;
  relation: SkillEdgeRelation;
  weight: number;
  createdAt: Date;
}

export interface LearningItem {
  id: string;
  kind: LearningItemKind;
  title: string;
  summary: string | null;
  skillId: string | null;
  difficulty: string | null;
  payload: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attempt {
  id: string;
  profileId: string;
  learningItemId: string | null;
  goalId: string | null;
  skillId: string | null;
  kind: AttemptKind;
  prompt: string | null;
  response: unknown;
  hintCount: number;
  durationMs: number | null;
  submittedAt: Date;
}

export interface Evaluation {
  id: string;
  attemptId: string | null;
  agentRunId: string | null;
  score: number;
  verdict: EvaluationVerdict;
  summary: string;
  payload: Record<string, unknown>;
  createdAt: Date;
}

export interface Evidence {
  id: string;
  profileId: string;
  skillId: string | null;
  goalId: string | null;
  sourceType: EvidenceSourceType;
  sourceId: string | null;
  polarity: EvidencePolarity;
  summary: string;
  confidence: number;
  createdAt: Date;
}

export interface Document {
  id: string;
  profileId: string;
  title: string;
  sourceType: DocumentSourceType;
  source: string;
  contentType: string;
  content: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  ordinal: number;
  content: string;
  tokenCount: number | null;
  metadata: Record<string, unknown>;
  embedding: number[] | null;
}

export interface Recommendation {
  id: string;
  profileId: string;
  goalId: string | null;
  skillId: string | null;
  kind: RecommendationKind;
  status: RecommendationStatus;
  title: string;
  rationale: string;
  evidenceIds: string[];
  payload: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewSchedule {
  id: string;
  profileId: string;
  skillId: string | null;
  learningItemId: string | null;
  state: ReviewState;
  dueAt: Date;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  lapses: number;
  lastReviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentRun {
  id: string;
  kind: AgentRunKind;
  status: AgentRunStatus;
  providerId: string | null;
  model: string | null;
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  error: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
}

export interface ProviderSettings {
  id: string;
  kind: AiProviderKind;
  displayName: string;
  isDefault: boolean;
  config: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
