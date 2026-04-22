import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { DatabaseContext } from "../pglite.js";
import { createDatabaseContext } from "../pglite.js";

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
});
