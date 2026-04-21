import { desc, eq } from "drizzle-orm";
import type { Evidence, EvidencePolarity, EvidenceSourceType } from "@leetgrind/domain";
import { LOCAL_USER_PROFILE_ID } from "@leetgrind/domain";
import type { LeetgrindDatabase } from "../pglite.js";
import { evidence } from "../schema.js";

export interface CreateEvidenceInput {
  profileId?: string;
  skillId?: string | null;
  goalId?: string | null;
  sourceType: EvidenceSourceType;
  sourceId?: string | null;
  polarity?: EvidencePolarity;
  summary: string;
  confidence?: number;
}

export function createEvidenceRepository(db: LeetgrindDatabase) {
  return {
    async list(profileId = LOCAL_USER_PROFILE_ID): Promise<Evidence[]> {
      const rows = await db
        .select()
        .from(evidence)
        .where(eq(evidence.profileId, profileId))
        .orderBy(desc(evidence.createdAt));

      return rows as Evidence[];
    },

    async create(input: CreateEvidenceInput): Promise<Evidence> {
      const [item] = await db
        .insert(evidence)
        .values({
          profileId: input.profileId ?? LOCAL_USER_PROFILE_ID,
          skillId: input.skillId ?? null,
          goalId: input.goalId ?? null,
          sourceType: input.sourceType,
          sourceId: input.sourceId ?? null,
          polarity: input.polarity ?? "neutral",
          summary: input.summary,
          confidence: input.confidence ?? 0.5
        })
        .returning();

      return item as Evidence;
    }
  };
}
