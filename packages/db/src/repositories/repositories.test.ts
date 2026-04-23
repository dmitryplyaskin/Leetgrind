import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { DatabaseContext } from "../pglite.js";
import { createDatabaseContext } from "../pglite.js";

function vectorWith(index: number) {
  return Array.from({ length: 1536 }, (_, itemIndex) => (itemIndex === index ? 1 : 0));
}

describe("local repositories", () => {
  let context: DatabaseContext;

  beforeEach(async () => {
    context = await createDatabaseContext({
      dataDir: null,
      runMigrations: true
    });
  });

  afterEach(async () => {
    await context?.close();
  });

  it("persists profile, goals, skills, and documents", async () => {
    const profile = await context.repositories.userProfiles.upsert({
      displayName: "Local learner",
      targetRole: "Frontend Engineer",
      experienceLevel: "middle",
      preferences: { language: "typescript" }
    });

    expect(profile.displayName).toBe("Local learner");

    const goal = await context.repositories.goals.create({
      title: "Prepare for frontend interviews",
      targetRole: "Frontend Engineer",
      metadata: {
        goalType: "job-search"
      }
    });
    const goals = await context.repositories.goals.list();

    expect(goals).toHaveLength(1);
    expect(goals[0]?.id).toBe(goal.id);
    expect(goals[0]?.metadata).toMatchObject({ goalType: "job-search" });

    const [skill] = await context.repositories.skills.upsertMany([
      {
        slug: "react",
        title: "React",
        level: "developing"
      }
    ]);
    const skills = await context.repositories.skills.list();

    expect(skill?.slug).toBe("react");
    expect(skills).toHaveLength(1);

    const document = await context.repositories.documents.create({
      title: "Resume",
      sourceType: "resume",
      source: "manual",
      contentType: "text/plain",
      content: "React and TypeScript experience"
    });
    const documents = await context.repositories.documents.list();

    expect(documents[0]?.id).toBe(document.id);

    const updatedResume = await context.repositories.documents.upsertResume({
      title: "Resume",
      content: "React, TypeScript, and testing experience"
    });
    const resumeDocuments = await context.repositories.documents.listBySourceType("resume");

    expect(updatedResume.content).toContain("testing");
    expect(resumeDocuments).toHaveLength(2);
  });

  it("creates stable skill slugs for localized and technical titles", async () => {
    const saved = await context.repositories.skills.upsertMany([
      {
        title: "Графы",
        level: "weak"
      },
      {
        title: "C++",
        level: "developing"
      },
      {
        title: "C#",
        level: "developing"
      }
    ]);
    const slugs = new Set(saved.map((skill) => skill.slug));

    expect(slugs.has("графы")).toBe(true);
    expect(slugs.has("c-plus-plus")).toBe(true);
    expect(slugs.has("c-sharp")).toBe(true);
    expect(slugs.size).toBe(3);
  });

  it("seeds the common skill graph without fabricating profile skill state", async () => {
    await context.repositories.skills.upsertMany([
      {
        slug: "react",
        title: "React",
        level: "developing",
        description: "User-assessed React skill."
      }
    ]);

    const seed = await context.repositories.seed.ensureCommonTemplates();
    const skills = await context.repositories.skills.list();
    const edges = await context.repositories.skills.listEdges();
    const profileSkills = await context.repositories.profileSkills.list();
    const react = skills.find((skill) => skill.slug === "react");

    expect(seed.skillCount).toBeGreaterThan(0);
    expect(seed.edgeCount).toBeGreaterThan(0);
    expect(edges.length).toBeGreaterThan(0);
    expect(react?.level).toBe("developing");
    expect(react?.description).toBe("User-assessed React skill.");
    expect(profileSkills).toHaveLength(0);
  });

  it("backfills legacy self-assessed skills into profile skills", async () => {
    await context.repositories.userProfiles.ensureLocalProfile();
    await context.repositories.skills.upsertMany([
      {
        slug: "react",
        title: "React",
        level: "developing",
        description: "User-assessed React skill."
      }
    ]);

    const backfilled = await context.repositories.profileSkills.backfillLegacyRecords();

    expect(backfilled).toHaveLength(1);
    expect(backfilled[0]?.skill.slug).toBe("react");
    expect(backfilled[0]?.level).toBe("developing");
    expect(backfilled[0]?.notes).toBe("User-assessed React skill.");
  });

  it("builds dashboard summaries from local evidence and goal links", async () => {
    const profile = await context.repositories.userProfiles.ensureLocalProfile();
    const [react] = await context.repositories.skills.upsertMany([
      {
        slug: "react",
        title: "React",
        level: "developing",
        description: "Components and hooks."
      }
    ]);

    expect(react).toBeDefined();

    const goal = await context.repositories.goals.create({
      profileId: profile.id,
      title: "Frontend interviews",
      targetRole: "Frontend Engineer"
    });

    await context.repositories.goals.replaceSkillLinks(goal.id, [
      {
        skillId: react!.id,
        relevance: "primary",
        priority: 0
      }
    ]);
    await context.repositories.evidence.create({
      profileId: profile.id,
      goalId: goal.id,
      skillId: react!.id,
      sourceType: "manual",
      polarity: "weakness",
      summary: "Needs clearer hook dependency reasoning.",
      confidence: 0.9
    });

    const summary = await context.repositories.dashboard.getSummary({
      profileId: profile.id,
      goalId: goal.id
    });
    const detail = await context.repositories.dashboard.getSkillDetail({
      profileId: profile.id,
      skillId: react!.id
    });

    expect(summary.activeGoal?.id).toBe(goal.id);
    expect(summary.readiness.totalSkills).toBe(1);
    expect(summary.weakSpots.some((weakSpot) => weakSpot.skillId === react!.id)).toBe(true);
    expect(summary.nextActions.length).toBeGreaterThan(0);
    expect(summary.graph.nodes.length).toBeGreaterThan(0);
    expect(detail?.evidence).toHaveLength(1);
  });

  it("stores provider settings and keeps only one default provider", async () => {
    const first = await context.repositories.providerSettings.save({
      kind: "openrouter",
      displayName: "OpenRouter A",
      isDefault: true,
      config: {
        textModel: "openai/gpt-4o-mini",
        embeddingModel: "openai/text-embedding-3-small"
      }
    });
    const second = await context.repositories.providerSettings.save({
      kind: "openrouter",
      displayName: "OpenRouter B",
      isDefault: false,
      config: {
        textModel: "openai/gpt-4o-mini",
        embeddingModel: "openai/text-embedding-3-small"
      }
    });

    await context.repositories.providerSettings.setDefault(second.id);

    const listed = await context.repositories.providerSettings.list();
    const currentDefault = await context.repositories.providerSettings.getDefault();

    expect(listed).toHaveLength(2);
    expect(currentDefault?.id).toBe(second.id);
    expect(currentDefault?.displayName).toBe("OpenRouter B");
    expect(first.id).not.toBe(second.id);
  });

  it("persists and searches document chunks with source metadata", async () => {
    await context.repositories.userProfiles.ensureLocalProfile();
    const document = await context.repositories.documents.create({
      title: "Resume",
      sourceType: "resume",
      source: "manual",
      contentType: "text/plain",
      content: "React and TypeScript experience"
    });

    await context.repositories.documentChunks.replaceForDocument({
      documentId: document.id,
      chunks: [
        {
          ordinal: 0,
          content: "React and TypeScript experience",
          tokenCount: 6,
          metadata: {
            domain: "content",
            ordinal: 0
          },
          embedding: vectorWith(0)
        }
      ]
    });

    const listed = await context.repositories.documentChunks.listByDocumentId(document.id);
    const candidates = await context.repositories.documentChunks.searchCandidates({
      sourceTypes: ["resume"]
    });

    expect(listed).toHaveLength(1);
    expect(candidates).toEqual([
      expect.objectContaining({
        documentId: document.id,
        title: "Resume",
        sourceType: "resume"
      })
    ]);
  });

  it("stores assessment sessions, answers, evaluations, and lessons", async () => {
    await context.repositories.userProfiles.ensureLocalProfile();
    const [skill] = await context.repositories.skills.upsertMany([
      {
        slug: "react",
        title: "React",
        level: "developing"
      }
    ]);

    const created = await context.repositories.assessmentSessions.create({
      skillId: skill!.id,
      locale: "en",
      title: "React check",
      summary: "Assessment summary",
      questions: [
        {
          id: "00000000-0000-0000-0000-000000000101",
          kind: "multiple-choice",
          skillId: skill!.id,
          prompt: "Which hook stores local state?",
          choices: [
            { id: "a", label: "useMemo" },
            { id: "b", label: "useState" }
          ],
          correctChoiceIds: ["b"]
        }
      ]
    });
    const answer = await context.repositories.assessmentSessions.upsertAnswer({
      sessionId: created.session.id,
      questionId: created.questions[0]!.id,
      answer: {
        questionId: created.questions[0]!.id,
        kind: "multiple-choice",
        selectedChoiceIds: ["b"]
      },
      score: 1,
      feedback: "Correct"
    });
    const lesson = await context.repositories.learningItems.createLesson({
      title: "React lesson",
      summary: "Follow-up",
      skillId: skill!.id,
      payload: {
        body: "Lesson body",
        takeaways: ["One"],
        practicePrompt: "Try it",
        evidenceIds: [],
        contextItemIds: []
      }
    });
    const attempt = await context.repositories.attempts.create({
      skillId: skill!.id,
      kind: "assessment",
      prompt: "React check",
      response: {}
    });
    const evaluation = await context.repositories.evaluations.create({
      attemptId: attempt.id,
      score: 80,
      verdict: "pass",
      summary: "Strong basics",
      payload: {}
    });
    const updated = await context.repositories.assessmentSessions.update(created.session.id, {
      attemptId: attempt.id,
      evaluationId: evaluation.id,
      status: "completed",
      completedAt: new Date()
    });
    const detail = await context.repositories.assessmentSessions.getDetail(created.session.id);

    expect(answer.score).toBe(1);
    expect(lesson.kind).toBe("lesson");
    expect(updated?.evaluationId).toBe(evaluation.id);
    expect(detail?.answers).toHaveLength(1);
  });
});
