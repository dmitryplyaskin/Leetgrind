import { desc, eq } from "drizzle-orm";
import { LOCAL_USER_PROFILE_ID, type ReviewSchedule } from "@leetgrind/domain";
import type { LeetgrindDatabase } from "../pglite.js";
import { reviewSchedules } from "../schema.js";
import { definedValues } from "./utils.js";

export function createReviewSchedulesRepository(db: LeetgrindDatabase) {
  return {
    async list(profileId = LOCAL_USER_PROFILE_ID): Promise<ReviewSchedule[]> {
      const rows = await db
        .select()
        .from(reviewSchedules)
        .where(eq(reviewSchedules.profileId, profileId))
        .orderBy(desc(reviewSchedules.dueAt));

      return rows as ReviewSchedule[];
    },

    async upsertForSkill({
      profileId = LOCAL_USER_PROFILE_ID,
      skillId,
      learningItemId,
      state,
      dueAt,
      intervalDays,
      easeFactor,
      repetitions,
      lapses,
      lastReviewedAt
    }: {
      profileId?: string;
      skillId?: string | null;
      learningItemId?: string | null;
      state: ReviewSchedule["state"];
      dueAt: Date;
      intervalDays: number;
      easeFactor: number;
      repetitions: number;
      lapses: number;
      lastReviewedAt?: Date | null;
    }): Promise<ReviewSchedule> {
      const existing = (
        await db
          .select()
          .from(reviewSchedules)
          .where(eq(reviewSchedules.profileId, profileId))
      ).find(
        (review) =>
          (review.skillId ?? null) === (skillId ?? null) &&
          (review.learningItemId ?? null) === (learningItemId ?? null)
      );

      if (existing) {
        const [updated] = await db
          .update(reviewSchedules)
          .set(
            definedValues({
              state,
              dueAt,
              intervalDays,
              easeFactor,
              repetitions,
              lapses,
              lastReviewedAt: lastReviewedAt ?? null,
              updatedAt: new Date()
            })
          )
          .where(eq(reviewSchedules.id, existing.id))
          .returning();

        return updated as ReviewSchedule;
      }

      const [created] = await db
        .insert(reviewSchedules)
        .values({
          profileId,
          skillId: skillId ?? null,
          learningItemId: learningItemId ?? null,
          state,
          dueAt,
          intervalDays,
          easeFactor,
          repetitions,
          lapses,
          lastReviewedAt: lastReviewedAt ?? null
        })
        .returning();

      return created as ReviewSchedule;
    }
  };
}
