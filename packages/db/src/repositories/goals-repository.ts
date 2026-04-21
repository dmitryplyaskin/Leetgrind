import { desc, eq } from "drizzle-orm";
import type { Goal, GoalStatus } from "@leetgrind/domain";
import { LOCAL_USER_PROFILE_ID } from "@leetgrind/domain";
import type { LeetgrindDatabase } from "../pglite.js";
import { goals } from "../schema.js";
import { definedValues } from "./utils.js";

export interface CreateGoalInput {
  profileId?: string;
  title: string;
  description?: string | null;
  targetRole?: string | null;
  status?: GoalStatus;
}

export interface UpdateGoalInput {
  title?: string;
  description?: string | null;
  targetRole?: string | null;
  status?: GoalStatus;
}

export function createGoalsRepository(db: LeetgrindDatabase) {
  return {
    async list(profileId = LOCAL_USER_PROFILE_ID): Promise<Goal[]> {
      const rows = await db
        .select()
        .from(goals)
        .where(eq(goals.profileId, profileId))
        .orderBy(desc(goals.createdAt));

      return rows as Goal[];
    },

    async create(input: CreateGoalInput): Promise<Goal> {
      const [goal] = await db
        .insert(goals)
        .values({
          profileId: input.profileId ?? LOCAL_USER_PROFILE_ID,
          title: input.title,
          description: input.description ?? null,
          targetRole: input.targetRole ?? null,
          status: input.status ?? "active"
        })
        .returning();

      return goal as Goal;
    },

    async update(id: string, input: UpdateGoalInput): Promise<Goal | null> {
      const [goal] = await db
        .update(goals)
        .set(
          definedValues({
            ...input,
            updatedAt: new Date()
          })
        )
        .where(eq(goals.id, id))
        .returning();

      return (goal as Goal | undefined) ?? null;
    }
  };
}
