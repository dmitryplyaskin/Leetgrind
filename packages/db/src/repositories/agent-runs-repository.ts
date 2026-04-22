import { desc, eq } from "drizzle-orm";
import type { AgentRun, AgentRunKind, AgentRunStatus } from "@leetgrind/domain";
import type { LeetgrindDatabase } from "../pglite.js";
import { agentRuns } from "../schema.js";

export interface CreateAgentRunInput {
  kind: AgentRunKind;
  status?: AgentRunStatus;
  providerId?: string | null;
  model?: string | null;
  input?: Record<string, unknown>;
  output?: Record<string, unknown> | null;
  error?: string | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
}

export interface UpdateAgentRunInput {
  status?: AgentRunStatus;
  providerId?: string | null;
  model?: string | null;
  input?: Record<string, unknown>;
  output?: Record<string, unknown> | null;
  error?: string | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
}

export function createAgentRunsRepository(db: LeetgrindDatabase) {
  return {
    async create(input: CreateAgentRunInput): Promise<AgentRun> {
      const [run] = await db
        .insert(agentRuns)
        .values({
          kind: input.kind,
          status: input.status ?? "queued",
          providerId: input.providerId ?? null,
          model: input.model ?? null,
          input: input.input ?? {},
          output: input.output ?? null,
          error: input.error ?? null,
          startedAt: input.startedAt ?? null,
          completedAt: input.completedAt ?? null
        })
        .returning();

      return run as AgentRun;
    },

    async getById(id: string): Promise<AgentRun | null> {
      const [run] = await db.select().from(agentRuns).where(eq(agentRuns.id, id)).limit(1);

      return (run as AgentRun | undefined) ?? null;
    },

    async listRecent(limit = 12): Promise<AgentRun[]> {
      const rows = await db.select().from(agentRuns).orderBy(desc(agentRuns.createdAt)).limit(limit);

      return rows as AgentRun[];
    },

    async update(id: string, input: UpdateAgentRunInput): Promise<AgentRun | null> {
      const [run] = await db
        .update(agentRuns)
        .set({
          ...(input.status !== undefined ? { status: input.status } : {}),
          ...(input.providerId !== undefined ? { providerId: input.providerId } : {}),
          ...(input.model !== undefined ? { model: input.model } : {}),
          ...(input.input !== undefined ? { input: input.input } : {}),
          ...(input.output !== undefined ? { output: input.output } : {}),
          ...(input.error !== undefined ? { error: input.error } : {}),
          ...(input.startedAt !== undefined ? { startedAt: input.startedAt } : {}),
          ...(input.completedAt !== undefined ? { completedAt: input.completedAt } : {})
        })
        .where(eq(agentRuns.id, id))
        .returning();

      return (run as AgentRun | undefined) ?? null;
    }
  };
}
