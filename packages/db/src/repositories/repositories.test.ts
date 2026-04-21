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
      targetRole: "Frontend Engineer"
    });
    const goals = await context.repositories.goals.list();

    expect(goals).toHaveLength(1);
    expect(goals[0]?.id).toBe(goal.id);

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
  });
});
