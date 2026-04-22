import { desc, eq } from "drizzle-orm";
import type { Evaluation, EvaluationVerdict } from "@leetgrind/domain";
import type { LeetgrindDatabase } from "../pglite.js";
import { evaluations } from "../schema.js";

export interface CreateEvaluationInput {
  attemptId?: string | null;
  agentRunId?: string | null;
  score: number;
  verdict: EvaluationVerdict;
  summary: string;
  payload?: Record<string, unknown>;
}

export function createEvaluationsRepository(db: LeetgrindDatabase) {
  return {
    async getById(id: string): Promise<Evaluation | null> {
      const [evaluation] = await db.select().from(evaluations).where(eq(evaluations.id, id));

      return (evaluation as Evaluation | undefined) ?? null;
    },

    async listByAttemptId(attemptId: string): Promise<Evaluation[]> {
      const rows = await db
        .select()
        .from(evaluations)
        .where(eq(evaluations.attemptId, attemptId))
        .orderBy(desc(evaluations.createdAt));

      return rows as Evaluation[];
    },

    async create(input: CreateEvaluationInput): Promise<Evaluation> {
      const [evaluation] = await db
        .insert(evaluations)
        .values({
          attemptId: input.attemptId ?? null,
          agentRunId: input.agentRunId ?? null,
          score: input.score,
          verdict: input.verdict,
          summary: input.summary,
          payload: input.payload ?? {}
        })
        .returning();

      return evaluation as Evaluation;
    }
  };
}
