import { PGlite } from "@electric-sql/pglite";
import { vector } from "@electric-sql/pglite/vector";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "./schema";

export type LeetgrindDatabase = ReturnType<typeof createDatabase>;

export function createPgliteClient(dataDir = ".leetgrind/pglite") {
  return new PGlite({
    dataDir,
    extensions: {
      vector
    }
  });
}

export function createDatabase(dataDir?: string) {
  return drizzle(createPgliteClient(dataDir), { schema });
}

