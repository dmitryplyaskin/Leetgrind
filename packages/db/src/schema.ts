import { relations } from "drizzle-orm";
import {
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
  vector
} from "drizzle-orm/pg-core";

export const goals = pgTable("goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  targetRole: text("target_role"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const skills = pgTable("skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  level: text("level", {
    enum: ["unknown", "weak", "developing", "strong"]
  })
    .notNull()
    .default("unknown"),
  description: text("description")
});

export const skillEdges = pgTable("skill_edges", {
  id: uuid("id").primaryKey().defaultRandom(),
  fromSkillId: uuid("from_skill_id")
    .notNull()
    .references(() => skills.id),
  toSkillId: uuid("to_skill_id")
    .notNull()
    .references(() => skills.id),
  relation: text("relation", {
    enum: ["prerequisite", "related", "specialization", "supports-goal"]
  }).notNull(),
  weight: real("weight").notNull().default(1)
});

export const learningItems = pgTable("learning_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  kind: text("kind", {
    enum: ["lesson", "assessment", "coding-task", "mock-interview", "review"]
  }).notNull(),
  title: text("title").notNull(),
  skillId: uuid("skill_id").references(() => skills.id),
  payload: jsonb("payload").notNull().default({})
});

export const attempts = pgTable("attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().default("local-user"),
  learningItemId: uuid("learning_item_id")
    .notNull()
    .references(() => learningItems.id),
  hintCount: integer("hint_count").notNull().default(0),
  payload: jsonb("payload").notNull().default({}),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow()
});

export const evaluations = pgTable("evaluations", {
  id: uuid("id").primaryKey().defaultRandom(),
  attemptId: uuid("attempt_id")
    .notNull()
    .references(() => attempts.id),
  score: real("score").notNull(),
  summary: text("summary").notNull(),
  payload: jsonb("payload").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const evidence = pgTable("evidence", {
  id: uuid("id").primaryKey().defaultRandom(),
  skillId: uuid("skill_id")
    .notNull()
    .references(() => skills.id),
  sourceAttemptId: uuid("source_attempt_id").references(() => attempts.id),
  summary: text("summary").notNull(),
  confidence: real("confidence").notNull().default(0.5),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  source: text("source").notNull(),
  contentType: text("content_type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const documentChunks = pgTable("document_chunks", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id")
    .notNull()
    .references(() => documents.id),
  ordinal: integer("ordinal").notNull(),
  content: text("content").notNull(),
  embedding: vector("embedding", { dimensions: 1536 })
});

export const skillsRelations = relations(skills, ({ many }) => ({
  learningItems: many(learningItems),
  evidence: many(evidence)
}));

