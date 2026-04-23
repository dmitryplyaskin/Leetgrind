import {
  AiProviderRegistry,
  type ProviderCredentialStore,
} from "@leetgrind/ai";
import {
  type DatabaseContext,
  type DatabaseContextOptions,
  createDatabaseContext,
  removeStalePglitePostmasterPid,
} from "@leetgrind/db";
import { fileURLToPath } from "node:url";
import { KeyringCredentialStore } from "./ai/keyring-credential-store.js";
import { acquireDataDirLock } from "./database-lock.js";

const DEFAULT_SERVER_DATA_DIR = fileURLToPath(
  new URL("../../../.leetgrind/pglite", import.meta.url),
);

export interface AppContext {
  aiRegistry: AiProviderRegistry;
  credentialStore: ProviderCredentialStore;
  database: DatabaseContext;
}

export interface CreateAppContextOptions {
  aiRegistry?: AiProviderRegistry;
  credentialStore?: ProviderCredentialStore;
  database?: DatabaseContextOptions;
}

export async function createAppContext(
  options: CreateAppContextOptions = {},
): Promise<AppContext> {
  const dataDir =
    "dataDir" in (options.database ?? {})
      ? options.database?.dataDir
      : (process.env.LEETGRIND_DATA_DIR ?? DEFAULT_SERVER_DATA_DIR);
  const dataDirLock = acquireDataDirLock(dataDir);
  let database: DatabaseContext;

  try {
    removeStalePglitePostmasterPid(dataDir);
    database = await createDatabaseContext({
      runMigrations: true,
      ...options.database,
      dataDir,
    });
  } catch (error) {
    await dataDirLock?.release();
    throw error;
  }

  const closeDatabase = database.close;
  let isClosed = false;

  database.close = async () => {
    if (isClosed) {
      return;
    }

    isClosed = true;

    try {
      await closeDatabase();
    } finally {
      await dataDirLock?.release();
    }
  };

  try {
    await database.repositories.userProfiles.ensureLocalProfile();
  } catch (error) {
    await database.close();
    throw error;
  }

  return {
    aiRegistry: options.aiRegistry ?? new AiProviderRegistry(),
    credentialStore: options.credentialStore ?? new KeyringCredentialStore(),
    database,
  };
}
