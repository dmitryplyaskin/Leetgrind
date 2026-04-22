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
  | "ingestion"
  | "provider-test";
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

export type ReadinessBand = "not-started" | "at-risk" | "progressing" | "ready";
export type RecommendedActionKind =
  | "learn-prerequisite"
  | "practice-weak-skill"
  | "review-due"
  | "take-assessment"
  | "study-adjacent";
export type ActivityEventKind = "attempt" | "evidence" | "recommendation" | "review";

export interface SkillProgressSummary {
  skill: Skill;
  level: SkillLevel;
  score: number;
  goalRelevance: GoalSkillRelevance | null;
  priority: number | null;
  evidenceCounts: {
    strengths: number;
    weaknesses: number;
    gaps: number;
    progress: number;
  };
  attemptCount: number;
  dueReviewCount: number;
  lastActivityAt: Date | null;
}

export interface GoalReadinessSummary {
  goal: Goal | null;
  score: number;
  band: ReadinessBand;
  totalSkills: number;
  strongSkills: number;
  weakSkills: number;
  unknownSkills: number;
  dueReviews: number;
  updatedAt: Date | null;
}

export interface WeakSpot {
  skillId: string;
  title: string;
  level: SkillLevel;
  score: number;
  reason: "unknown" | "weak" | "negative-evidence" | "due-review";
  evidenceCount: number;
  goalRelevance: GoalSkillRelevance | null;
}

export interface RecommendedAction {
  id: string;
  kind: RecommendedActionKind;
  priority: number;
  skillId: string | null;
  goalId: string | null;
  titleKey: string;
  reasonKey: string;
  createdFrom: "deterministic" | "stored";
  title?: string;
  rationale?: string;
}

export interface KnowledgeGraphNode {
  id: string;
  label: string;
  level: SkillLevel;
  score: number;
  goalRelevance: GoalSkillRelevance | null;
  isGoalSkill: boolean;
  dueReviewCount: number;
}

export interface KnowledgeGraphEdge {
  id: string;
  source: string;
  target: string;
  relation: SkillEdgeRelation;
  weight: number;
}

export interface ActivityEvent {
  id: string;
  kind: ActivityEventKind;
  title: string;
  summary: string;
  skillId: string | null;
  goalId: string | null;
  occurredAt: Date;
  tone: "neutral" | "positive" | "warning";
}

export interface DashboardSummary {
  profile: UserProfile;
  activeGoal: Goal | null;
  readiness: GoalReadinessSummary;
  skills: SkillProgressSummary[];
  strongSkills: SkillProgressSummary[];
  weakSpots: WeakSpot[];
  nextActions: RecommendedAction[];
  upcomingReviews: ReviewSchedule[];
  recentActivity: ActivityEvent[];
  graph: {
    nodes: KnowledgeGraphNode[];
    edges: KnowledgeGraphEdge[];
  };
}

export interface ProgressReadModelInput {
  goal: Goal | null;
  skills: Skill[];
  goalSkills: GoalSkill[];
  skillEdges: SkillEdge[];
  evidence: Evidence[];
  attempts: Attempt[];
  recommendations: Recommendation[];
  reviews: ReviewSchedule[];
  now?: Date;
}

const skillLevelScores: Record<SkillLevel, number> = {
  unknown: 10,
  weak: 35,
  developing: 65,
  strong: 90
};

const relevanceWeights: Record<GoalSkillRelevance, number> = {
  primary: 1.25,
  supporting: 1,
  stretch: 0.8
};

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function latestDate(dates: Array<Date | null | undefined>) {
  const timestamps = dates
    .filter((date): date is Date => date instanceof Date)
    .map((date) => date.getTime());

  return timestamps.length > 0 ? new Date(Math.max(...timestamps)) : null;
}

function getGoalSkillMap(goalSkills: GoalSkill[]) {
  return new Map(goalSkills.map((goalSkill) => [goalSkill.skillId, goalSkill]));
}

export function buildSkillProgressSummaries(input: ProgressReadModelInput): SkillProgressSummary[] {
  const goalSkillMap = getGoalSkillMap(input.goalSkills);
  const now = input.now ?? new Date();

  return input.skills
    .map((skill) => {
      const linkedGoalSkill = goalSkillMap.get(skill.id) ?? null;
      const skillEvidence = input.evidence.filter((item) => item.skillId === skill.id);
      const skillAttempts = input.attempts.filter((attempt) => attempt.skillId === skill.id);
      const skillReviews = input.reviews.filter((review) => review.skillId === skill.id);
      const dueReviewCount = skillReviews.filter((review) => review.dueAt <= now).length;
      const evidenceCounts = {
        strengths: skillEvidence.filter((item) => item.polarity === "strength").length,
        weaknesses: skillEvidence.filter((item) => item.polarity === "weakness").length,
        gaps: skillEvidence.filter((item) => item.polarity === "gap").length,
        progress: skillEvidence.filter((item) => item.polarity === "progress").length
      };
      const evidenceSignal = skillEvidence.reduce((total, item) => {
        const confidence = Math.max(0, Math.min(1, item.confidence));

        if (item.polarity === "strength") return total + 12 * confidence;
        if (item.polarity === "weakness") return total - 15 * confidence;
        if (item.polarity === "gap") return total - 18 * confidence;
        if (item.polarity === "progress") return total + 8 * confidence;
        return total;
      }, 0);
      const attemptSignal = Math.min(8, skillAttempts.length * 2);
      const reviewSignal = dueReviewCount > 0 ? -5 : 0;
      const score = clampScore(skillLevelScores[skill.level] + evidenceSignal + attemptSignal + reviewSignal);
      const lastActivityAt = latestDate([
        skill.updatedAt,
        ...skillEvidence.map((item) => item.createdAt),
        ...skillAttempts.map((attempt) => attempt.submittedAt),
        ...skillReviews.map((review) => review.lastReviewedAt ?? review.createdAt)
      ]);

      return {
        skill,
        level: skill.level,
        score,
        goalRelevance: linkedGoalSkill?.relevance ?? null,
        priority: linkedGoalSkill?.priority ?? null,
        evidenceCounts,
        attemptCount: skillAttempts.length,
        dueReviewCount,
        lastActivityAt
      };
    })
    .sort((left, right) => {
      const leftPriority = left.priority ?? Number.MAX_SAFE_INTEGER;
      const rightPriority = right.priority ?? Number.MAX_SAFE_INTEGER;

      return leftPriority - rightPriority || left.skill.title.localeCompare(right.skill.title);
    });
}

export function buildGoalReadinessSummary(
  input: ProgressReadModelInput,
  summaries = buildSkillProgressSummaries(input)
): GoalReadinessSummary {
  const goalLinked = summaries.filter((summary) => summary.goalRelevance !== null);
  const scoped = goalLinked.length > 0 ? goalLinked : summaries;
  const weightedScores = scoped.map((summary) => {
    const weight = summary.goalRelevance ? relevanceWeights[summary.goalRelevance] : 0.75;
    return { score: summary.score * weight, weight };
  });
  const weightTotal = weightedScores.reduce((total, item) => total + item.weight, 0);
  const score =
    weightTotal > 0
      ? clampScore(weightedScores.reduce((total, item) => total + item.score, 0) / weightTotal)
      : 0;
  const band: ReadinessBand =
    score >= 78 ? "ready" : score >= 50 ? "progressing" : score >= 25 ? "at-risk" : "not-started";

  return {
    goal: input.goal,
    score,
    band,
    totalSkills: scoped.length,
    strongSkills: scoped.filter((summary) => summary.level === "strong").length,
    weakSkills: scoped.filter((summary) => summary.level === "weak").length,
    unknownSkills: scoped.filter((summary) => summary.level === "unknown").length,
    dueReviews: scoped.reduce((total, summary) => total + summary.dueReviewCount, 0),
    updatedAt: latestDate(scoped.map((summary) => summary.lastActivityAt))
  };
}

export function buildWeakSpots(
  summaries: SkillProgressSummary[],
  limit = 8
): WeakSpot[] {
  return summaries
    .filter(
      (summary) =>
        summary.level === "unknown" ||
        summary.level === "weak" ||
        summary.evidenceCounts.weaknesses > 0 ||
        summary.evidenceCounts.gaps > 0 ||
        summary.dueReviewCount > 0
    )
    .map((summary) => {
      const negativeEvidence = summary.evidenceCounts.weaknesses + summary.evidenceCounts.gaps;
      const reason: WeakSpot["reason"] =
        summary.dueReviewCount > 0
          ? "due-review"
          : negativeEvidence > 0
            ? "negative-evidence"
            : summary.level === "unknown"
              ? "unknown"
              : "weak";

      return {
        skillId: summary.skill.id,
        title: summary.skill.title,
        level: summary.level,
        score: summary.score,
        reason,
        evidenceCount: negativeEvidence,
        goalRelevance: summary.goalRelevance
      };
    })
    .sort((left, right) => {
      const leftGoalPriority = left.goalRelevance ? 0 : 1;
      const rightGoalPriority = right.goalRelevance ? 0 : 1;

      return leftGoalPriority - rightGoalPriority || left.score - right.score || left.title.localeCompare(right.title);
    })
    .slice(0, limit);
}

export function buildKnowledgeGraph(
  input: ProgressReadModelInput,
  summaries = buildSkillProgressSummaries(input)
) {
  const summaryBySkillId = new Map(summaries.map((summary) => [summary.skill.id, summary]));
  const goalSkillIds = new Set(input.goalSkills.map((goalSkill) => goalSkill.skillId));
  const nodes = summaries.map((summary): KnowledgeGraphNode => ({
    id: summary.skill.id,
    label: summary.skill.title,
    level: summary.level,
    score: summary.score,
    goalRelevance: summary.goalRelevance,
    isGoalSkill: goalSkillIds.has(summary.skill.id),
    dueReviewCount: summary.dueReviewCount
  }));
  const edges = input.skillEdges
    .filter(
      (edge) =>
        summaryBySkillId.has(edge.fromSkillId) &&
        summaryBySkillId.has(edge.toSkillId)
    )
    .map((edge): KnowledgeGraphEdge => ({
      id: edge.id,
      source: edge.fromSkillId,
      target: edge.toSkillId,
      relation: edge.relation,
      weight: edge.weight
    }));

  return { nodes, edges };
}

export function buildRecommendedActions(
  input: ProgressReadModelInput,
  summaries = buildSkillProgressSummaries(input)
): RecommendedAction[] {
  const actions: RecommendedAction[] = [];
  const summaryBySkillId = new Map(summaries.map((summary) => [summary.skill.id, summary]));
  const goalId = input.goal?.id ?? null;
  const goalSkillIds = new Set(input.goalSkills.map((goalSkill) => goalSkill.skillId));
  const prerequisiteEdges = input.skillEdges.filter((edge) => edge.relation === "prerequisite");

  for (const edge of prerequisiteEdges) {
    if (!goalSkillIds.has(edge.toSkillId)) continue;

    const prerequisite = summaryBySkillId.get(edge.fromSkillId);
    const target = summaryBySkillId.get(edge.toSkillId);

    if (prerequisite && target && prerequisite.level === "unknown") {
      actions.push({
        id: `learn-prerequisite:${prerequisite.skill.id}:${target.skill.id}`,
        kind: "learn-prerequisite",
        priority: 10 + (target.priority ?? 0),
        skillId: prerequisite.skill.id,
        goalId,
        titleKey: "learnPrerequisite",
        reasonKey: "unknownPrerequisite",
        createdFrom: "deterministic"
      });
    }
  }

  for (const summary of summaries) {
    if (summary.goalRelevance && (summary.level === "weak" || summary.score < 45)) {
      actions.push({
        id: `practice-weak-skill:${summary.skill.id}`,
        kind: "practice-weak-skill",
        priority: 30 + (summary.priority ?? 0),
        skillId: summary.skill.id,
        goalId,
        titleKey: "practiceWeakSkill",
        reasonKey: "weakGoalSkill",
        createdFrom: "deterministic"
      });
    }

    if (summary.dueReviewCount > 0) {
      actions.push({
        id: `review-due:${summary.skill.id}`,
        kind: "review-due",
        priority: 20 + (summary.priority ?? 0),
        skillId: summary.skill.id,
        goalId,
        titleKey: "reviewDue",
        reasonKey: "reviewDue",
        createdFrom: "deterministic"
      });
    }

    if (summary.evidenceCounts.gaps > 0 || summary.evidenceCounts.weaknesses > 0) {
      actions.push({
        id: `take-assessment:${summary.skill.id}`,
        kind: "take-assessment",
        priority: 40 + (summary.priority ?? 0),
        skillId: summary.skill.id,
        goalId,
        titleKey: "takeAssessment",
        reasonKey: "negativeEvidence",
        createdFrom: "deterministic"
      });
    }
  }

  const strongSkillIds = new Set(
    summaries
      .filter((summary) => summary.level === "strong" || summary.score >= 80)
      .map((summary) => summary.skill.id)
  );

  for (const edge of input.skillEdges.filter((item) => item.relation === "related")) {
    const target = summaryBySkillId.get(edge.toSkillId);

    if (strongSkillIds.has(edge.fromSkillId) && target?.level === "unknown") {
      actions.push({
        id: `study-adjacent:${target.skill.id}`,
        kind: "study-adjacent",
        priority: 70,
        skillId: target.skill.id,
        goalId,
        titleKey: "studyAdjacent",
        reasonKey: "adjacentToStrongSkill",
        createdFrom: "deterministic"
      });
    }
  }

  for (const recommendation of input.recommendations.filter((item) => item.status === "pending")) {
    actions.push({
      id: `stored:${recommendation.id}`,
      kind: recommendation.kind === "review" ? "review-due" : "practice-weak-skill",
      priority: 50,
      skillId: recommendation.skillId,
      goalId: recommendation.goalId,
      titleKey: "storedRecommendation",
      reasonKey: "storedRecommendation",
      createdFrom: "stored",
      title: recommendation.title,
      rationale: recommendation.rationale
    });
  }

  const seen = new Set<string>();

  return actions
    .sort((left, right) => left.priority - right.priority || left.id.localeCompare(right.id))
    .filter((action) => {
      const key = `${action.kind}:${action.skillId ?? "none"}:${action.goalId ?? "none"}`;

      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 8);
}

export function buildActivityEvents(input: ProgressReadModelInput, limit = 8): ActivityEvent[] {
  const skillTitleById = new Map(input.skills.map((skill) => [skill.id, skill.title]));
  const events: ActivityEvent[] = [];

  for (const attempt of input.attempts) {
    events.push({
      id: `attempt:${attempt.id}`,
      kind: "attempt",
      title: skillTitleById.get(attempt.skillId ?? "") ?? "Practice attempt",
      summary: attempt.prompt ?? attempt.kind,
      skillId: attempt.skillId,
      goalId: attempt.goalId,
      occurredAt: attempt.submittedAt,
      tone: "neutral"
    });
  }

  for (const item of input.evidence) {
    events.push({
      id: `evidence:${item.id}`,
      kind: "evidence",
      title: skillTitleById.get(item.skillId ?? "") ?? "Learning evidence",
      summary: item.summary,
      skillId: item.skillId,
      goalId: item.goalId,
      occurredAt: item.createdAt,
      tone:
        item.polarity === "strength" || item.polarity === "progress"
          ? "positive"
          : item.polarity === "weakness" || item.polarity === "gap"
            ? "warning"
            : "neutral"
    });
  }

  for (const recommendation of input.recommendations) {
    events.push({
      id: `recommendation:${recommendation.id}`,
      kind: "recommendation",
      title: recommendation.title,
      summary: recommendation.rationale,
      skillId: recommendation.skillId,
      goalId: recommendation.goalId,
      occurredAt: recommendation.createdAt,
      tone: recommendation.status === "pending" ? "warning" : "neutral"
    });
  }

  for (const review of input.reviews) {
    events.push({
      id: `review:${review.id}`,
      kind: "review",
      title: skillTitleById.get(review.skillId ?? "") ?? "Review",
      summary: review.state,
      skillId: review.skillId,
      goalId: null,
      occurredAt: review.lastReviewedAt ?? review.createdAt,
      tone: review.dueAt <= (input.now ?? new Date()) ? "warning" : "neutral"
    });
  }

  return events
    .sort((left, right) => right.occurredAt.getTime() - left.occurredAt.getTime())
    .slice(0, limit);
}

export function buildDashboardSummary(input: ProgressReadModelInput & { profile: UserProfile }): DashboardSummary {
  const skills = buildSkillProgressSummaries(input);
  const readiness = buildGoalReadinessSummary(input, skills);
  const weakSpots = buildWeakSpots(skills);
  const graph = buildKnowledgeGraph(input, skills);

  return {
    profile: input.profile,
    activeGoal: input.goal,
    readiness,
    skills,
    strongSkills: skills
      .filter((summary) => summary.level === "strong" || summary.score >= 65)
      .sort((left, right) => right.score - left.score)
      .slice(0, 8),
    weakSpots,
    nextActions: buildRecommendedActions(input, skills),
    upcomingReviews: input.reviews
      .filter((review) => review.dueAt >= (input.now ?? new Date()))
      .sort((left, right) => left.dueAt.getTime() - right.dueAt.getTime())
      .slice(0, 6),
    recentActivity: buildActivityEvents(input),
    graph
  };
}

export * from "./skill-templates/index.js";
