import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { AppContext } from "./context.js";
import { appRouter, createApp, createAppContext } from "./index.js";

describe("server API", () => {
  let context: AppContext;

  beforeEach(async () => {
    context = await createAppContext({
      database: {
        dataDir: null,
        runMigrations: true
      }
    });
  });

  afterEach(async () => {
    await context?.database.close();
  });

  it("returns the local server health payload", async () => {
    const app = await createApp({ context });
    const response = await request(app).get("/health").expect(200);

    expect(response.body).toEqual({
      ok: true,
      service: "leetgrind-server"
    });
  });

  it("serves typed tRPC profile and goals procedures", async () => {
    const caller = appRouter.createCaller(context);

    await expect(caller.health.get()).resolves.toMatchObject({
      ok: true,
      service: "leetgrind-server"
    });

    const profile = await caller.profile.upsert({
      displayName: "Dima",
      targetRole: "Frontend Engineer"
    });
    const goal = await caller.goals.create({
      title: "System design interview",
      targetRole: "Senior Frontend Engineer"
    });
    const goals = await caller.goals.list();

    expect(profile.displayName).toBe("Dima");
    expect(goals).toHaveLength(1);
    expect(goals[0]?.id).toBe(goal.id);
  });

  it("rejects invalid tRPC input", async () => {
    const caller = appRouter.createCaller(context);

    await expect(caller.goals.create({ title: "" })).rejects.toThrow();
  });

  it("completes onboarding with profile, goals, skills, preferences, and resume", async () => {
    const caller = appRouter.createCaller(context);

    const result = await caller.onboarding.complete({
      profile: {
        displayName: "Dima",
        targetRole: "Frontend Engineer",
        experienceLevel: "middle"
      },
      goals: [
        {
          title: "Prepare for Yandex frontend interview",
          goalType: "company-interview",
          targetRole: "Frontend Engineer",
          targetCompany: "Yandex",
          targetSeniority: "middle",
          interviewDate: null,
          focusAreas: ["React", "Algorithms"],
          description: "Focus on frontend interview readiness."
        },
        {
          title: "Improve backend fundamentals",
          goalType: "skill-growth",
          targetRole: "Backend Engineer",
          targetCompany: null,
          targetSeniority: null,
          interviewDate: null,
          focusAreas: ["Node.js"],
          description: null
        }
      ],
      skills: [
        {
          title: "React",
          level: "developing",
          description: "Hooks and component design."
        },
        {
          title: "Algorithms",
          level: "weak",
          description: null
        }
      ],
      resume: {
        title: "Resume",
        content: "Frontend developer with React and TypeScript experience."
      },
      preferences: {
        uiLocale: "ru",
        contentLanguage: "ru",
        programmingLanguages: ["typescript", "python"],
        studyRhythm: "daily",
        preferredAiProviderKind: "not-configured"
      }
    });
    const state = await caller.onboarding.getState();

    expect(result.isComplete).toBe(true);
    expect(state.isComplete).toBe(true);
    expect(state.profile.preferences).toMatchObject({
      uiLocale: "ru",
      programmingLanguages: ["typescript", "python"]
    });
    expect(state.goals).toHaveLength(2);
    expect(state.skills).toHaveLength(2);
    expect(state.resumeDocument?.sourceType).toBe("resume");
  });
});
