import { PGlite } from "@electric-sql/pglite";
import { vector } from "@electric-sql/pglite/vector";
import { drizzle } from "drizzle-orm/pglite";
import type { PgliteDatabase } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createAttemptsRepository } from "./repositories/attempts-repository.js";
import { createAgentRunsRepository } from "./repositories/agent-runs-repository.js";
import { createAssessmentSessionsRepository } from "./repositories/assessment-sessions-repository.js";
import { createDashboardRepository } from "./repositories/dashboard-repository.js";
import { createDocumentChunksRepository } from "./repositories/document-chunks-repository.js";
import { createDocumentsRepository } from "./repositories/documents-repository.js";
import { createEvidenceRepository } from "./repositories/evidence-repository.js";
import { createEvaluationsRepository } from "./repositories/evaluations-repository.js";
import { createGoalsRepository } from "./repositories/goals-repository.js";
import { createLearningItemsRepository } from "./repositories/learning-items-repository.js";
import { createProfileSkillsRepository } from "./repositories/profile-skills-repository.js";
import { createProviderSettingsRepository } from "./repositories/provider-settings-repository.js";
import { createRecommendationsRepository } from "./repositories/recommendations-repository.js";
import { createReviewSchedulesRepository } from "./repositories/review-schedules-repository.js";
import { createSkillGraphSeedRepository } from "./repositories/skill-graph-seed-repository.js";
import { createSkillsRepository } from "./repositories/skills-repository.js";
import { createUserProfileRepository } from "./repositories/user-profile-repository.js";
import * as schema from "./schema.js";

export const DEFAULT_DATA_DIR = ".leetgrind/pglite";

export type LeetgrindSchema = typeof schema;
export type LeetgrindDatabase = PgliteDatabase<LeetgrindSchema> & {
  $client: PGlite;
};

export interface CreateDatabaseOptions {
  dataDir?: string | null;
}

export interface DatabaseContextOptions extends CreateDatabaseOptions {
  runMigrations?: boolean;
  migrationsFolder?: string;
}

export interface DatabaseContext {
  db: LeetgrindDatabase;
  client: PGlite;
  repositories: ReturnType<typeof createRepositories>;
  close: () => Promise<void>;
}

export function getDefaultMigrationsFolder() {
  return fileURLToPath(new URL("../drizzle", import.meta.url));
}

export function createPgliteClient(dataDir: string | null = DEFAULT_DATA_DIR) {
  const options = {
    extensions: {
      vector
    }
  };

  if (dataDir === null) {
    return new PGlite(options);
  }

  mkdirSync(dataDir, { recursive: true });

  return new PGlite({
    ...options,
    dataDir
  });
}

export function createDatabase(options: CreateDatabaseOptions = {}): LeetgrindDatabase {
  const dataDir = "dataDir" in options ? options.dataDir : DEFAULT_DATA_DIR;
  return drizzle(createPgliteClient(dataDir ?? null), { schema });
}

export async function migrateDatabase(
  db: LeetgrindDatabase,
  migrationsFolder = getDefaultMigrationsFolder()
) {
  await db.$client.exec("CREATE EXTENSION IF NOT EXISTS vector;");
  await migrate(db, { migrationsFolder });
}

export function createRepositories(db: LeetgrindDatabase) {
  return {
    userProfiles: createUserProfileRepository(db),
    goals: createGoalsRepository(db),
    skills: createSkillsRepository(db),
    assessmentSessions: createAssessmentSessionsRepository(db),
    learningItems: createLearningItemsRepository(db),
    profileSkills: createProfileSkillsRepository(db),
    attempts: createAttemptsRepository(db),
    evaluations: createEvaluationsRepository(db),
    agentRuns: createAgentRunsRepository(db),
    evidence: createEvidenceRepository(db),
    documents: createDocumentsRepository(db),
    documentChunks: createDocumentChunksRepository(db),
    providerSettings: createProviderSettingsRepository(db),
    recommendations: createRecommendationsRepository(db),
    reviewSchedules: createReviewSchedulesRepository(db),
    seed: createSkillGraphSeedRepository(db),
    dashboard: createDashboardRepository(db)
  };
}

export async function createDatabaseContext(
  options: DatabaseContextOptions = {}
): Promise<DatabaseContext> {
  const dataDir = "dataDir" in options ? options.dataDir : DEFAULT_DATA_DIR;
  const db = createDatabase({ dataDir });

  if (options.runMigrations) {
    await migrateDatabase(db, options.migrationsFolder);
  }

  return {
    db,
    client: db.$client,
    repositories: createRepositories(db),
    close: () => db.$client.close()
  };
}
