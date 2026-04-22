import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  vector
} from "drizzle-orm/pg-core";

const LOCAL_USER_PROFILE_ID = "00000000-0000-0000-0000-000000000001";

export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  displayName: text("display_name"),
  targetRole: text("target_role"),
  experienceLevel: text("experience_level", {
    enum: ["beginner", "junior", "middle", "senior", "expert"]
  }),
  resumeText: text("resume_text"),
  preferences: jsonb("preferences").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const goals = pgTable(
  "goals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id")
      .notNull()
      .default(LOCAL_USER_PROFILE_ID)
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    targetRole: text("target_role"),
    status: text("status", {
      enum: ["active", "paused", "completed", "archived"]
    })
      .notNull()
      .default("active"),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    profileIdIdx: index("goals_profile_id_idx").on(table.profileId),
    statusIdx: index("goals_status_idx").on(table.status)
  })
);

export const skills = pgTable(
  "skills",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    level: text("level", {
      enum: ["unknown", "weak", "developing", "strong"]
    })
      .notNull()
      .default("unknown"),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    slugIdx: uniqueIndex("skills_slug_idx").on(table.slug),
    levelIdx: index("skills_level_idx").on(table.level)
  })
);

export const goalSkills = pgTable(
  "goal_skills",
  {
    goalId: uuid("goal_id")
      .notNull()
      .references(() => goals.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    relevance: text("relevance", {
      enum: ["primary", "supporting", "stretch"]
    })
      .notNull()
      .default("primary"),
    priority: integer("priority").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    pk: primaryKey({ columns: [table.goalId, table.skillId] }),
    skillIdx: index("goal_skills_skill_id_idx").on(table.skillId)
  })
);

export const skillEdges = pgTable(
  "skill_edges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fromSkillId: uuid("from_skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    toSkillId: uuid("to_skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    relation: text("relation", {
      enum: ["prerequisite", "related", "specialization", "supports-goal"]
    }).notNull(),
    weight: real("weight").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    edgeIdx: uniqueIndex("skill_edges_from_to_relation_idx").on(
      table.fromSkillId,
      table.toSkillId,
      table.relation
    )
  })
);

export const learningItems = pgTable(
  "learning_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kind: text("kind", {
      enum: ["lesson", "assessment", "coding-task", "mock-interview", "review"]
    }).notNull(),
    title: text("title").notNull(),
    summary: text("summary"),
    skillId: uuid("skill_id").references(() => skills.id, { onDelete: "set null" }),
    difficulty: text("difficulty"),
    payload: jsonb("payload").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    kindIdx: index("learning_items_kind_idx").on(table.kind),
    skillIdx: index("learning_items_skill_id_idx").on(table.skillId)
  })
);

export const agentRuns = pgTable(
  "agent_runs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kind: text("kind", {
      enum: [
        "mentor",
        "assessment-mentor",
        "interviewer",
        "coding-reviewer",
        "planner",
        "lesson-planner",
        "recommender",
        "ingestion",
        "provider-test"
      ]
    }).notNull(),
    status: text("status", {
      enum: ["queued", "running", "succeeded", "failed", "canceled"]
    })
      .notNull()
      .default("queued"),
    providerId: text("provider_id"),
    model: text("model"),
    input: jsonb("input").notNull().default({}),
    output: jsonb("output"),
    error: text("error"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    kindIdx: index("agent_runs_kind_idx").on(table.kind),
    statusIdx: index("agent_runs_status_idx").on(table.status)
  })
);

export const attempts = pgTable(
  "attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id")
      .notNull()
      .default(LOCAL_USER_PROFILE_ID)
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    learningItemId: uuid("learning_item_id").references(() => learningItems.id, {
      onDelete: "set null"
    }),
    goalId: uuid("goal_id").references(() => goals.id, { onDelete: "set null" }),
    skillId: uuid("skill_id").references(() => skills.id, { onDelete: "set null" }),
    kind: text("kind", {
      enum: ["answer", "code", "interview", "lesson-check", "assessment"]
    }).notNull(),
    prompt: text("prompt"),
    response: jsonb("response").notNull().default({}),
    hintCount: integer("hint_count").notNull().default(0),
    durationMs: integer("duration_ms"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    profileIdx: index("attempts_profile_id_idx").on(table.profileId),
    learningItemIdx: index("attempts_learning_item_id_idx").on(table.learningItemId),
    skillIdx: index("attempts_skill_id_idx").on(table.skillId)
  })
);

export const evaluations = pgTable(
  "evaluations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    attemptId: uuid("attempt_id").references(() => attempts.id, { onDelete: "set null" }),
    agentRunId: uuid("agent_run_id").references(() => agentRuns.id, { onDelete: "set null" }),
    score: real("score").notNull(),
    verdict: text("verdict", {
      enum: ["excellent", "pass", "needs-work", "fail"]
    }).notNull(),
    summary: text("summary").notNull(),
    payload: jsonb("payload").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    attemptIdx: index("evaluations_attempt_id_idx").on(table.attemptId),
    agentRunIdx: index("evaluations_agent_run_id_idx").on(table.agentRunId)
  })
);

export const assessmentSessions = pgTable(
  "assessment_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id")
      .notNull()
      .default(LOCAL_USER_PROFILE_ID)
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    goalId: uuid("goal_id").references(() => goals.id, { onDelete: "set null" }),
    skillId: uuid("skill_id").references(() => skills.id, { onDelete: "set null" }),
    attemptId: uuid("attempt_id").references(() => attempts.id, { onDelete: "set null" }),
    evaluationId: uuid("evaluation_id").references(() => evaluations.id, { onDelete: "set null" }),
    status: text("status", {
      enum: ["draft", "in-progress", "completed", "abandoned"]
    })
      .notNull()
      .default("draft"),
    locale: text("locale", { enum: ["ru", "en"] }).notNull().default("en"),
    title: text("title").notNull(),
    summary: text("summary"),
    difficulty: text("difficulty"),
    focusPrompt: text("focus_prompt"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true })
  },
  (table) => ({
    profileIdx: index("assessment_sessions_profile_id_idx").on(table.profileId),
    statusIdx: index("assessment_sessions_status_idx").on(table.status),
    goalIdx: index("assessment_sessions_goal_id_idx").on(table.goalId),
    skillIdx: index("assessment_sessions_skill_id_idx").on(table.skillId)
  })
);

export const assessmentQuestions = pgTable(
  "assessment_questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => assessmentSessions.id, { onDelete: "cascade" }),
    ordinal: integer("ordinal").notNull(),
    kind: text("kind", {
      enum: ["multiple-choice", "short-answer", "explanation", "scenario-analysis"]
    }).notNull(),
    skillId: uuid("skill_id").references(() => skills.id, { onDelete: "set null" }),
    prompt: text("prompt").notNull(),
    payload: jsonb("payload").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    sessionOrdinalIdx: uniqueIndex("assessment_questions_session_ordinal_idx").on(
      table.sessionId,
      table.ordinal
    ),
    skillIdx: index("assessment_questions_skill_id_idx").on(table.skillId)
  })
);

export const assessmentAnswers = pgTable(
  "assessment_answers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => assessmentSessions.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => assessmentQuestions.id, { onDelete: "cascade" }),
    answer: jsonb("answer").notNull().default({}),
    score: real("score"),
    feedback: text("feedback"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    sessionQuestionIdx: uniqueIndex("assessment_answers_session_question_idx").on(
      table.sessionId,
      table.questionId
    )
  })
);

export const evidence = pgTable(
  "evidence",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id")
      .notNull()
      .default(LOCAL_USER_PROFILE_ID)
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id").references(() => skills.id, { onDelete: "set null" }),
    goalId: uuid("goal_id").references(() => goals.id, { onDelete: "set null" }),
    sourceType: text("source_type", {
      enum: ["attempt", "evaluation", "document", "agent-run", "manual"]
    }).notNull(),
    sourceId: text("source_id"),
    polarity: text("polarity", {
      enum: ["strength", "weakness", "gap", "progress", "neutral"]
    })
      .notNull()
      .default("neutral"),
    summary: text("summary").notNull(),
    confidence: real("confidence").notNull().default(0.5),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    profileIdx: index("evidence_profile_id_idx").on(table.profileId),
    skillIdx: index("evidence_skill_id_idx").on(table.skillId),
    goalIdx: index("evidence_goal_id_idx").on(table.goalId)
  })
);

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id")
      .notNull()
      .default(LOCAL_USER_PROFILE_ID)
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    sourceType: text("source_type", {
      enum: ["resume", "note", "import", "generated"]
    }).notNull(),
    source: text("source").notNull(),
    contentType: text("content_type").notNull(),
    content: text("content").notNull(),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    profileIdx: index("documents_profile_id_idx").on(table.profileId),
    sourceTypeIdx: index("documents_source_type_idx").on(table.sourceType)
  })
);

export const documentChunks = pgTable(
  "document_chunks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    ordinal: integer("ordinal").notNull(),
    content: text("content").notNull(),
    tokenCount: integer("token_count"),
    metadata: jsonb("metadata").notNull().default({}),
    embedding: vector("embedding", { dimensions: 1536 })
  },
  (table) => ({
    documentOrdinalIdx: uniqueIndex("document_chunks_document_ordinal_idx").on(
      table.documentId,
      table.ordinal
    )
  })
);

export const recommendations = pgTable(
  "recommendations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id")
      .notNull()
      .default(LOCAL_USER_PROFILE_ID)
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    goalId: uuid("goal_id").references(() => goals.id, { onDelete: "set null" }),
    skillId: uuid("skill_id").references(() => skills.id, { onDelete: "set null" }),
    kind: text("kind", {
      enum: ["lesson", "practice", "review", "assessment", "interview", "adjacent-topic"]
    }).notNull(),
    status: text("status", {
      enum: ["pending", "accepted", "dismissed", "completed"]
    })
      .notNull()
      .default("pending"),
    title: text("title").notNull(),
    rationale: text("rationale").notNull(),
    evidenceIds: jsonb("evidence_ids").notNull().default([]),
    payload: jsonb("payload").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    profileIdx: index("recommendations_profile_id_idx").on(table.profileId),
    statusIdx: index("recommendations_status_idx").on(table.status)
  })
);

export const reviewSchedules = pgTable(
  "review_schedules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id")
      .notNull()
      .default(LOCAL_USER_PROFILE_ID)
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id").references(() => skills.id, { onDelete: "cascade" }),
    learningItemId: uuid("learning_item_id").references(() => learningItems.id, {
      onDelete: "cascade"
    }),
    state: text("state", {
      enum: ["new", "learning", "review", "relearning", "suspended"]
    })
      .notNull()
      .default("new"),
    dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
    intervalDays: real("interval_days").notNull().default(0),
    easeFactor: real("ease_factor").notNull().default(2.5),
    repetitions: integer("repetitions").notNull().default(0),
    lapses: integer("lapses").notNull().default(0),
    lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    profileDueIdx: index("review_schedules_profile_due_idx").on(table.profileId, table.dueAt),
    skillIdx: index("review_schedules_skill_id_idx").on(table.skillId)
  })
);

export const providerSettings = pgTable(
  "provider_settings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kind: text("kind", {
      enum: ["openai-codex", "openai-api-key", "openrouter", "local"]
    }).notNull(),
    displayName: text("display_name").notNull(),
    isDefault: boolean("is_default").notNull().default(false),
    config: jsonb("config").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    kindIdx: index("provider_settings_kind_idx").on(table.kind)
  })
);

export const userProfilesRelations = relations(userProfiles, ({ many }) => ({
  goals: many(goals),
  assessmentSessions: many(assessmentSessions),
  attempts: many(attempts),
  evidence: many(evidence),
  documents: many(documents),
  recommendations: many(recommendations),
  reviewSchedules: many(reviewSchedules)
}));

export const goalsRelations = relations(goals, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [goals.profileId],
    references: [userProfiles.id]
  }),
  assessmentSessions: many(assessmentSessions),
  goalSkills: many(goalSkills),
  attempts: many(attempts),
  evidence: many(evidence),
  recommendations: many(recommendations)
}));

export const skillsRelations = relations(skills, ({ many }) => ({
  goalSkills: many(goalSkills),
  outgoingEdges: many(skillEdges, { relationName: "fromSkill" }),
  incomingEdges: many(skillEdges, { relationName: "toSkill" }),
  learningItems: many(learningItems),
  assessmentSessions: many(assessmentSessions),
  assessmentQuestions: many(assessmentQuestions),
  attempts: many(attempts),
  evidence: many(evidence),
  recommendations: many(recommendations),
  reviewSchedules: many(reviewSchedules)
}));

export const goalSkillsRelations = relations(goalSkills, ({ one }) => ({
  goal: one(goals, {
    fields: [goalSkills.goalId],
    references: [goals.id]
  }),
  skill: one(skills, {
    fields: [goalSkills.skillId],
    references: [skills.id]
  })
}));

export const skillEdgesRelations = relations(skillEdges, ({ one }) => ({
  fromSkill: one(skills, {
    fields: [skillEdges.fromSkillId],
    references: [skills.id],
    relationName: "fromSkill"
  }),
  toSkill: one(skills, {
    fields: [skillEdges.toSkillId],
    references: [skills.id],
    relationName: "toSkill"
  })
}));

export const learningItemsRelations = relations(learningItems, ({ one, many }) => ({
  skill: one(skills, {
    fields: [learningItems.skillId],
    references: [skills.id]
  }),
  attempts: many(attempts),
  reviewSchedules: many(reviewSchedules)
}));

export const attemptsRelations = relations(attempts, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [attempts.profileId],
    references: [userProfiles.id]
  }),
  learningItem: one(learningItems, {
    fields: [attempts.learningItemId],
    references: [learningItems.id]
  }),
  goal: one(goals, {
    fields: [attempts.goalId],
    references: [goals.id]
  }),
  skill: one(skills, {
    fields: [attempts.skillId],
    references: [skills.id]
  }),
  evaluations: many(evaluations)
}));

export const evaluationsRelations = relations(evaluations, ({ one }) => ({
  attempt: one(attempts, {
    fields: [evaluations.attemptId],
    references: [attempts.id]
  }),
  agentRun: one(agentRuns, {
    fields: [evaluations.agentRunId],
    references: [agentRuns.id]
  })
}));

export const assessmentSessionsRelations = relations(assessmentSessions, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [assessmentSessions.profileId],
    references: [userProfiles.id]
  }),
  goal: one(goals, {
    fields: [assessmentSessions.goalId],
    references: [goals.id]
  }),
  skill: one(skills, {
    fields: [assessmentSessions.skillId],
    references: [skills.id]
  }),
  attempt: one(attempts, {
    fields: [assessmentSessions.attemptId],
    references: [attempts.id]
  }),
  evaluation: one(evaluations, {
    fields: [assessmentSessions.evaluationId],
    references: [evaluations.id]
  }),
  questions: many(assessmentQuestions),
  answers: many(assessmentAnswers)
}));

export const assessmentQuestionsRelations = relations(assessmentQuestions, ({ one, many }) => ({
  session: one(assessmentSessions, {
    fields: [assessmentQuestions.sessionId],
    references: [assessmentSessions.id]
  }),
  skill: one(skills, {
    fields: [assessmentQuestions.skillId],
    references: [skills.id]
  }),
  answers: many(assessmentAnswers)
}));

export const assessmentAnswersRelations = relations(assessmentAnswers, ({ one }) => ({
  session: one(assessmentSessions, {
    fields: [assessmentAnswers.sessionId],
    references: [assessmentSessions.id]
  }),
  question: one(assessmentQuestions, {
    fields: [assessmentAnswers.questionId],
    references: [assessmentQuestions.id]
  })
}));

export const evidenceRelations = relations(evidence, ({ one }) => ({
  profile: one(userProfiles, {
    fields: [evidence.profileId],
    references: [userProfiles.id]
  }),
  skill: one(skills, {
    fields: [evidence.skillId],
    references: [skills.id]
  }),
  goal: one(goals, {
    fields: [evidence.goalId],
    references: [goals.id]
  })
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [documents.profileId],
    references: [userProfiles.id]
  }),
  chunks: many(documentChunks)
}));

export const documentChunksRelations = relations(documentChunks, ({ one }) => ({
  document: one(documents, {
    fields: [documentChunks.documentId],
    references: [documents.id]
  })
}));

export const recommendationsRelations = relations(recommendations, ({ one }) => ({
  profile: one(userProfiles, {
    fields: [recommendations.profileId],
    references: [userProfiles.id]
  }),
  goal: one(goals, {
    fields: [recommendations.goalId],
    references: [goals.id]
  }),
  skill: one(skills, {
    fields: [recommendations.skillId],
    references: [skills.id]
  })
}));

export const reviewSchedulesRelations = relations(reviewSchedules, ({ one }) => ({
  profile: one(userProfiles, {
    fields: [reviewSchedules.profileId],
    references: [userProfiles.id]
  }),
  skill: one(skills, {
    fields: [reviewSchedules.skillId],
    references: [skills.id]
  }),
  learningItem: one(learningItems, {
    fields: [reviewSchedules.learningItemId],
    references: [learningItems.id]
  })
}));
