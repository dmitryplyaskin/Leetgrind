import {
  type DatabaseContext,
  type DatabaseContextOptions,
  createDatabaseContext
} from "@leetgrind/db";
import { fileURLToPath } from "node:url";

const DEFAULT_SERVER_DATA_DIR = fileURLToPath(
  new URL("../../../.leetgrind/pglite", import.meta.url)
);

export interface AppContext {
  database: DatabaseContext;
}

export interface CreateAppContextOptions {
  database?: DatabaseContextOptions;
}

export async function createAppContext(
  options: CreateAppContextOptions = {}
): Promise<AppContext> {
  const dataDir = "dataDir" in (options.database ?? {})
    ? options.database?.dataDir
    : DEFAULT_SERVER_DATA_DIR;
  const database = await createDatabaseContext({
    runMigrations: true,
    ...options.database,
    dataDir
  });

  await database.repositories.userProfiles.ensureLocalProfile();

  return {
    database
  };
}
