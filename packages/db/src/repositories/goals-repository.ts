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
  metadata?: Record<string, unknown>;
}

export interface UpdateGoalInput {
  title?: string;
  description?: string | null;
  targetRole?: string | null;
  status?: GoalStatus;
  metadata?: Record<string, unknown>;
}

export function createGoalsRepository(db: LeetgrindDatabase) {
  const repository = {
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
          status: input.status ?? "active",
          metadata: input.metadata ?? {}
        })
        .returning();

      return goal as Goal;
    },

    async createMany(input: CreateGoalInput[]): Promise<Goal[]> {
      const saved: Goal[] = [];

      for (const goal of input) {
        saved.push(await repository.create(goal));
      }

      return saved;
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

  return repository;
}
