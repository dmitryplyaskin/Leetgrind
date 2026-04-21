import { desc, eq } from "drizzle-orm";
import type { Document, DocumentSourceType } from "@leetgrind/domain";
import { LOCAL_USER_PROFILE_ID } from "@leetgrind/domain";
import type { LeetgrindDatabase } from "../pglite.js";
import { documents } from "../schema.js";

export interface CreateDocumentInput {
  profileId?: string;
  title: string;
  sourceType: DocumentSourceType;
  source: string;
  contentType: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export function createDocumentsRepository(db: LeetgrindDatabase) {
  return {
    async list(profileId = LOCAL_USER_PROFILE_ID): Promise<Document[]> {
      const rows = await db
        .select()
        .from(documents)
        .where(eq(documents.profileId, profileId))
        .orderBy(desc(documents.createdAt));

      return rows as Document[];
    },

    async create(input: CreateDocumentInput): Promise<Document> {
      const [document] = await db
        .insert(documents)
        .values({
          profileId: input.profileId ?? LOCAL_USER_PROFILE_ID,
          title: input.title,
          sourceType: input.sourceType,
          source: input.source,
          contentType: input.contentType,
          content: input.content,
          metadata: input.metadata ?? {}
        })
        .returning();

      return document as Document;
    }
  };
}
