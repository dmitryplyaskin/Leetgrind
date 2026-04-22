import { AiProviderRegistry, type ProviderCredentialStore } from "@leetgrind/ai";
import {
  type DatabaseContext,
  type DatabaseContextOptions,
  createDatabaseContext
} from "@leetgrind/db";
import { fileURLToPath } from "node:url";
import { KeyringCredentialStore } from "./ai/keyring-credential-store.js";

const DEFAULT_SERVER_DATA_DIR = fileURLToPath(
  new URL("../../../.leetgrind/pglite", import.meta.url)
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
  options: CreateAppContextOptions = {}
): Promise<AppContext> {
  const dataDir = "dataDir" in (options.database ?? {})
    ? options.database?.dataDir
    : process.env.LEETGRIND_DATA_DIR ?? DEFAULT_SERVER_DATA_DIR;
  const database = await createDatabaseContext({
    runMigrations: true,
    ...options.database,
    dataDir
  });

  await database.repositories.userProfiles.ensureLocalProfile();

  return {
    aiRegistry: options.aiRegistry ?? new AiProviderRegistry(),
    credentialStore: options.credentialStore ?? new KeyringCredentialStore(),
    database
  };
}
