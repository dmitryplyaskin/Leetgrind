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
    expect(state.skills).toHaveLength(3);
    expect(state.goalSkillLinks).toHaveLength(3);
    expect(state.resumeDocument?.sourceType).toBe("resume");
  });

  it("saves onboarding drafts without marking onboarding complete", async () => {
    const caller = appRouter.createCaller(context);

    const draft = await caller.onboarding.saveDraft({
      profile: {
        displayName: "Draft user",
        targetRole: "Fullstack Engineer",
        experienceLevel: "junior"
      },
      goals: [
        {
          title: "Draft goal",
          goalType: "role-growth",
          targetRole: "Fullstack Engineer",
          targetCompany: null,
          targetSeniority: "junior",
          interviewDate: null,
          focusAreas: ["Node.js"],
          description: null
        },
        {
          title: "",
          goalType: "custom",
          targetRole: null,
          targetCompany: null,
          targetSeniority: null,
          interviewDate: null,
          focusAreas: [],
          description: null
        }
      ],
      skills: [
        {
          title: "Node.js",
          level: "developing",
          description: null
        },
        {
          title: "",
          level: "unknown",
          description: null
        }
      ],
      resume: {
        title: "",
        content: ""
      },
      preferences: {
        uiLocale: "en",
        contentLanguage: "mixed",
        programmingLanguages: ["typescript"],
        studyRhythm: "weekdays",
        preferredAiProviderKind: "not-configured"
      }
    });
    const state = await caller.onboarding.getState();

    expect(draft.isComplete).toBe(false);
    expect(state.isComplete).toBe(false);
    expect(state.profile.displayName).toBe("Draft user");
    expect(state.goals).toHaveLength(1);
    expect(state.skills).toHaveLength(1);
    expect(state.profile.preferences).toMatchObject({
      onboarding: {
        completedAt: null
      }
    });
  });

  it("completes onboarding without creating a placeholder resume document", async () => {
    const caller = appRouter.createCaller(context);

    await caller.onboarding.complete({
      profile: {
        displayName: "No resume user",
        targetRole: "Frontend Engineer",
        experienceLevel: "middle"
      },
      goals: [
        {
          title: "Frontend interviews",
          goalType: "job-search",
          targetRole: "Frontend Engineer",
          targetCompany: null,
          targetSeniority: "middle",
          interviewDate: null,
          focusAreas: ["React"],
          description: null
        }
      ],
      skills: [
        {
          title: "React",
          level: "developing",
          description: null
        }
      ],
      resume: {
        title: "",
        content: ""
      },
      preferences: {
        uiLocale: "en",
        contentLanguage: "mixed",
        programmingLanguages: ["typescript"],
        studyRhythm: "daily",
        preferredAiProviderKind: "not-configured"
      }
    });
    const state = await caller.onboarding.getState();

    expect(state.isComplete).toBe(true);
    expect(state.resumeDocument).toBeNull();
  });

  it("serves dashboard, graph, detail, history, and recommendation read models", async () => {
    const caller = appRouter.createCaller(context);

    await caller.onboarding.complete({
      profile: {
        displayName: "Dashboard user",
        targetRole: "Frontend Engineer",
        experienceLevel: "middle"
      },
      goals: [
        {
          title: "Frontend interviews",
          goalType: "job-search",
          targetRole: "Frontend Engineer",
          targetCompany: null,
          targetSeniority: "middle",
          interviewDate: null,
          focusAreas: ["React"],
          description: null
        }
      ],
      skills: [
        {
          title: "React",
          level: "weak",
          description: "Needs more practice with hooks."
        }
      ],
      resume: null,
      preferences: {
        uiLocale: "en",
        contentLanguage: "mixed",
        programmingLanguages: ["typescript"],
        studyRhythm: "daily",
        preferredAiProviderKind: "not-configured"
      }
    });

    const dashboard = await caller.dashboard.getSummary();
    const goalId = dashboard.activeGoal?.id;
    const skillId = dashboard.skills.find((skill) => skill.skill.slug === "react")?.skill.id;

    expect(goalId).toBeDefined();
    expect(skillId).toBeDefined();
    expect(dashboard.graph.nodes.length).toBeGreaterThan(0);
    expect(dashboard.nextActions.length).toBeGreaterThan(0);

    await expect(caller.goals.getReadiness({ goalId: goalId! })).resolves.toMatchObject({
      readiness: {
        goal: {
          id: goalId
        }
      }
    });
    await expect(caller.skills.getGraph({ goalId })).resolves.toMatchObject({
      nodes: expect.any(Array),
      edges: expect.any(Array)
    });
    await expect(caller.skills.getDetail({ skillId: skillId! })).resolves.toMatchObject({
      skill: {
        id: skillId
      }
    });
    await expect(caller.history.listRecent({ limit: 5 })).resolves.toEqual(expect.any(Array));
    await expect(caller.recommendations.listActive({ goalId })).resolves.toEqual(expect.any(Array));
  });
});
