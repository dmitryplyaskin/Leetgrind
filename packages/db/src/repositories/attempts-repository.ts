import { desc, eq } from "drizzle-orm";
import type { Attempt, AttemptKind } from "@leetgrind/domain";
import { LOCAL_USER_PROFILE_ID } from "@leetgrind/domain";
import type { LeetgrindDatabase } from "../pglite.js";
import { attempts } from "../schema.js";

export interface CreateAttemptInput {
  profileId?: string;
  learningItemId?: string | null;
  goalId?: string | null;
  skillId?: string | null;
  kind: AttemptKind;
  prompt?: string | null;
  response?: unknown;
  hintCount?: number;
  durationMs?: number | null;
}

export function createAttemptsRepository(db: LeetgrindDatabase) {
  return {
    async list(profileId = LOCAL_USER_PROFILE_ID): Promise<Attempt[]> {
      const rows = await db
        .select()
        .from(attempts)
        .where(eq(attempts.profileId, profileId))
        .orderBy(desc(attempts.submittedAt));

      return rows as Attempt[];
    },

    async create(input: CreateAttemptInput): Promise<Attempt> {
      const [attempt] = await db
        .insert(attempts)
        .values({
          profileId: input.profileId ?? LOCAL_USER_PROFILE_ID,
          learningItemId: input.learningItemId ?? null,
          goalId: input.goalId ?? null,
          skillId: input.skillId ?? null,
          kind: input.kind,
          prompt: input.prompt ?? null,
          response: input.response ?? {},
          hintCount: input.hintCount ?? 0,
          durationMs: input.durationMs ?? null
        })
        .returning();

      return attempt as Attempt;
    }
  };
}
