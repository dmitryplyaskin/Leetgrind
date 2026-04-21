import { desc, eq } from "drizzle-orm";
import type {
  Recommendation,
  RecommendationKind,
  RecommendationStatus
} from "@leetgrind/domain";
import { LOCAL_USER_PROFILE_ID } from "@leetgrind/domain";
import type { LeetgrindDatabase } from "../pglite.js";
import { recommendations } from "../schema.js";
import { definedValues } from "./utils.js";

export interface CreateRecommendationInput {
  profileId?: string;
  goalId?: string | null;
  skillId?: string | null;
  kind: RecommendationKind;
  status?: RecommendationStatus;
  title: string;
  rationale: string;
  evidenceIds?: string[];
  payload?: Record<string, unknown>;
}

export interface UpdateRecommendationInput {
  status?: RecommendationStatus;
  title?: string;
  rationale?: string;
  evidenceIds?: string[];
  payload?: Record<string, unknown>;
}

export function createRecommendationsRepository(db: LeetgrindDatabase) {
  return {
    async list(profileId = LOCAL_USER_PROFILE_ID): Promise<Recommendation[]> {
      const rows = await db
        .select()
        .from(recommendations)
        .where(eq(recommendations.profileId, profileId))
        .orderBy(desc(recommendations.createdAt));

      return rows as Recommendation[];
    },

    async create(input: CreateRecommendationInput): Promise<Recommendation> {
      const [recommendation] = await db
        .insert(recommendations)
        .values({
          profileId: input.profileId ?? LOCAL_USER_PROFILE_ID,
          goalId: input.goalId ?? null,
          skillId: input.skillId ?? null,
          kind: input.kind,
          status: input.status ?? "pending",
          title: input.title,
          rationale: input.rationale,
          evidenceIds: input.evidenceIds ?? [],
          payload: input.payload ?? {}
        })
        .returning();

      return recommendation as Recommendation;
    },

    async update(id: string, input: UpdateRecommendationInput): Promise<Recommendation | null> {
      const [recommendation] = await db
        .update(recommendations)
        .set(
          definedValues({
            ...input,
            updatedAt: new Date()
          })
        )
        .where(eq(recommendations.id, id))
        .returning();

      return (recommendation as Recommendation | undefined) ?? null;
    }
  };
}
