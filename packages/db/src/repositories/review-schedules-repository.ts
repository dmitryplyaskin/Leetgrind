import { desc, eq } from "drizzle-orm";
import { LOCAL_USER_PROFILE_ID, type ReviewSchedule } from "@leetgrind/domain";
import type { LeetgrindDatabase } from "../pglite.js";
import { reviewSchedules } from "../schema.js";

export function createReviewSchedulesRepository(db: LeetgrindDatabase) {
  return {
    async list(profileId = LOCAL_USER_PROFILE_ID): Promise<ReviewSchedule[]> {
      const rows = await db
        .select()
        .from(reviewSchedules)
        .where(eq(reviewSchedules.profileId, profileId))
        .orderBy(desc(reviewSchedules.dueAt));

      return rows as ReviewSchedule[];
    }
  };
}
