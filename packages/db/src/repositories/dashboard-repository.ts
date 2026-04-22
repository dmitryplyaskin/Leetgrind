import { eq } from "drizzle-orm";
import {
  LOCAL_USER_PROFILE_ID,
  buildActivityEvents,
  buildDashboardSummary,
  buildGoalReadinessSummary,
  buildKnowledgeGraph,
  buildRecommendedActions,
  buildSkillProgressSummaries,
  buildWeakSpots,
  type ActivityEvent,
  type Attempt,
  type DashboardSummary,
  type Evidence,
  type Goal,
  type GoalReadinessSummary,
  type GoalSkill,
  type KnowledgeGraphEdge,
  type KnowledgeGraphNode,
  type Recommendation,
  type RecommendedAction,
  type ReviewSchedule,
  type Skill,
  type SkillEdge,
  type SkillProgressSummary,
  type UserProfile,
  type WeakSpot
} from "@leetgrind/domain";
import type { LeetgrindDatabase } from "../pglite.js";
import {
  attempts,
  evidence,
  goalSkills,
  goals,
  recommendations,
  reviewSchedules,
  skillEdges,
  skills,
  userProfiles
} from "../schema.js";
import { createSkillGraphSeedRepository } from "./skill-graph-seed-repository.js";

export interface DashboardQueryInput {
  profileId?: string;
  goalId?: string;
}

export interface GoalReadinessResult {
  readiness: GoalReadinessSummary;
  skills: SkillProgressSummary[];
  weakSpots: WeakSpot[];
  nextActions: RecommendedAction[];
}

export interface SkillGraphResult {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
}

export interface SkillDetailResult {
  skill: Skill;
  progress: SkillProgressSummary;
  connectedSkills: Skill[];
  edges: SkillEdge[];
  evidence: Evidence[];
  attempts: Attempt[];
  recommendations: Recommendation[];
  reviews: ReviewSchedule[];
  goalLinks: GoalSkill[];
}

export function createDashboardRepository(db: LeetgrindDatabase) {
  return {
    async getSummary(input: DashboardQueryInput = {}): Promise<DashboardSummary> {
      const snapshot = await loadProgressSnapshot(db, input);

      return buildDashboardSummary(snapshot);
    },

    async getGoalReadiness(input: DashboardQueryInput): Promise<GoalReadinessResult> {
      const snapshot = await loadProgressSnapshot(db, input);
      const skills = buildSkillProgressSummaries(snapshot);

      return {
        readiness: buildGoalReadinessSummary(snapshot, skills),
        skills,
        weakSpots: buildWeakSpots(skills),
        nextActions: buildRecommendedActions(snapshot, skills)
      };
    },

    async getSkillGraph(input: DashboardQueryInput = {}): Promise<SkillGraphResult> {
      const snapshot = await loadProgressSnapshot(db, input);
      const scoped = scopeGraphSnapshot(snapshot);
      const summaries = buildSkillProgressSummaries(scoped);

      return buildKnowledgeGraph(scoped, summaries);
    },

    async getSkillDetail({
      profileId = LOCAL_USER_PROFILE_ID,
      skillId
    }: {
      profileId?: string;
      skillId: string;
    }): Promise<SkillDetailResult | null> {
      const snapshot = await loadProgressSnapshot(db, { profileId });
      const skill = snapshot.skills.find((item) => item.id === skillId);

      if (!skill) {
        return null;
      }

      const progress = buildSkillProgressSummaries(snapshot).find(
        (summary) => summary.skill.id === skillId
      );

      if (!progress) {
        return null;
      }

      const edges = snapshot.skillEdges.filter(
        (edge) => edge.fromSkillId === skillId || edge.toSkillId === skillId
      );
      const connectedSkillIds = new Set(
        edges.flatMap((edge) => [edge.fromSkillId, edge.toSkillId]).filter((id) => id !== skillId)
      );

      return {
        skill,
        progress,
        connectedSkills: snapshot.skills.filter((item) => connectedSkillIds.has(item.id)),
        edges,
        evidence: snapshot.evidence.filter((item) => item.skillId === skillId),
        attempts: snapshot.attempts.filter((attempt) => attempt.skillId === skillId),
        recommendations: snapshot.recommendations.filter(
          (recommendation) => recommendation.skillId === skillId
        ),
        reviews: snapshot.reviews.filter((review) => review.skillId === skillId),
        goalLinks: snapshot.goalSkills.filter((goalSkill) => goalSkill.skillId === skillId)
      };
    },

    async listRecentActivity({
      profileId = LOCAL_USER_PROFILE_ID,
      limit = 20
    }: {
      profileId?: string;
      limit?: number;
    } = {}): Promise<ActivityEvent[]> {
      const snapshot = await loadProgressSnapshot(db, { profileId });

      return buildActivityEvents(snapshot, limit);
    }
  };
}

async function loadProgressSnapshot(
  db: LeetgrindDatabase,
  { profileId = LOCAL_USER_PROFILE_ID, goalId }: DashboardQueryInput
) {
  await createSkillGraphSeedRepository(db).ensureCommonTemplates();

  const [
    [profile],
    goalRows,
    skillRows,
    goalSkillRows,
    edgeRows,
    evidenceRows,
    attemptRows,
    recommendationRows,
    reviewRows
  ] = await Promise.all([
    db.select().from(userProfiles).where(eq(userProfiles.id, profileId)),
    db.select().from(goals).where(eq(goals.profileId, profileId)),
    db.select().from(skills),
    db.select().from(goalSkills),
    db.select().from(skillEdges),
    db.select().from(evidence).where(eq(evidence.profileId, profileId)),
    db.select().from(attempts).where(eq(attempts.profileId, profileId)),
    db.select().from(recommendations).where(eq(recommendations.profileId, profileId)),
    db.select().from(reviewSchedules).where(eq(reviewSchedules.profileId, profileId))
  ]);

  if (!profile) {
    throw new Error(`Profile ${profileId} was not found.`);
  }

  const typedGoals = goalRows as Goal[];
  const selectedGoal =
    (goalId ? typedGoals.find((goal) => goal.id === goalId) : null) ??
    typedGoals.find((goal) => goal.status === "active") ??
    typedGoals[0] ??
    null;
  const selectedGoalSkills = selectedGoal
    ? (goalSkillRows as GoalSkill[]).filter((goalSkill) => goalSkill.goalId === selectedGoal.id)
    : [];

  return {
    profile: profile as UserProfile,
    goal: selectedGoal,
    skills: skillRows as Skill[],
    goalSkills: selectedGoalSkills,
    skillEdges: edgeRows as SkillEdge[],
    evidence: evidenceRows as Evidence[],
    attempts: attemptRows as Attempt[],
    recommendations: (recommendationRows as Recommendation[]).filter(
      (recommendation) => !selectedGoal || !recommendation.goalId || recommendation.goalId === selectedGoal.id
    ),
    reviews: reviewRows as ReviewSchedule[]
  };
}

function scopeGraphSnapshot(snapshot: Awaited<ReturnType<typeof loadProgressSnapshot>>) {
  if (!snapshot.goal) {
    return snapshot;
  }

  const goalSkillIds = new Set(snapshot.goalSkills.map((goalSkill) => goalSkill.skillId));

  if (goalSkillIds.size === 0) {
    return snapshot;
  }

  const scopedSkillIds = new Set(goalSkillIds);

  for (const edge of snapshot.skillEdges) {
    if (goalSkillIds.has(edge.fromSkillId) || goalSkillIds.has(edge.toSkillId)) {
      scopedSkillIds.add(edge.fromSkillId);
      scopedSkillIds.add(edge.toSkillId);
    }
  }

  return {
    ...snapshot,
    skills: snapshot.skills.filter((skill) => scopedSkillIds.has(skill.id)),
    skillEdges: snapshot.skillEdges.filter(
      (edge) => scopedSkillIds.has(edge.fromSkillId) && scopedSkillIds.has(edge.toSkillId)
    )
  };
}
