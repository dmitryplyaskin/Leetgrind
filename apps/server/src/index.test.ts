import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { AiEmbeddingRequest, AiEmbeddingResult, AiObjectRequest, AiProvider, AiProviderFactory, AiTextRequest, AiTextResult } from "@leetgrind/ai";
import { AiProviderRegistry } from "@leetgrind/ai";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { InMemoryCredentialStore } from "./ai/credential-store.js";
import type { AppContext } from "./context.js";
import { acquireDataDirLock } from "./database-lock.js";
import { appRouter, createApp, createAppContext } from "./index.js";

function vectorFor(input: string) {
  return Array.from({ length: 1536 }, (_, index) =>
    index === input.toLowerCase().split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % 1536 ? 1 : 0
  );
}

class FakeOpenRouterProvider implements AiProvider {
  readonly id: string;
  readonly kind = "openrouter" as const;
  readonly displayName: string;
  readonly capabilities = {
    textGeneration: true,
    objectGeneration: true,
    textStreaming: true,
    embeddings: true
  };

  constructor(id: string, displayName: string) {
    this.id = id;
    this.displayName = displayName;
  }

  async listModels() {
    return [
      {
        id: "openai/gpt-4o-mini",
        displayName: "Fake GPT-4o mini",
        supportsTextGeneration: true,
        supportsStreaming: true,
        supportsStructuredOutput: true,
        supportsEmbeddings: false
      },
      {
        id: "openai/text-embedding-3-small",
        displayName: "Fake embedding model",
        supportsTextGeneration: false,
        supportsStreaming: false,
        supportsStructuredOutput: false,
        supportsEmbeddings: true
      }
    ];
  }

  async generateText(input: AiTextRequest): Promise<AiTextResult> {
    return {
      text: `Echo: ${input.prompt}`,
      model: input.model,
      providerId: this.id
    };
  }

  async *streamText(input: AiTextRequest) {
    yield {
      text: `Echo: ${input.prompt}`
    };
  }

  async generateObject<TSchema extends AiObjectRequest["schema"]>(
    input: AiObjectRequest<TSchema>
  ): Promise<import("zod").infer<TSchema>> {
    if (input.prompt.includes("Generate a balanced assessment")) {
      return input.schema.parse({
        title: "React fundamentals check",
        summary: "A mixed-format check for React interview readiness.",
        questions: [
          {
            kind: "multiple-choice",
            prompt: "Which hook is used for local component state?",
            explanation: null,
            choices: [
              { id: "a", label: "useMemo" },
              { id: "b", label: "useState" },
              { id: "c", label: "useContext" }
            ],
            correctChoiceIds: ["b"],
            rationale: "useState manages local component state."
          },
          {
            kind: "short-answer",
            prompt: "What does the dependency array control in useEffect?",
            explanation: null,
            expectedConcepts: ["effect reruns", "dependency tracking"],
            placeholder: null
          },
          {
            kind: "explanation",
            prompt: "Explain reconciliation in React.",
            explanation: null,
            rubric: ["tree comparison", "minimal DOM work"]
          },
          {
            kind: "scenario-analysis",
            prompt: "How would you reduce re-rendering in a dashboard?",
            explanation: null,
            scenario: "Typing in one widget causes the whole dashboard to update.",
            rubric: ["state isolation", "measured optimization"]
          }
        ]
      });
    }

    if (input.prompt.includes("Evaluate the answers")) {
      return input.schema.parse({
        summary: "The learner has solid React fundamentals but still needs sharper explanation quality.",
        overallScore: 72,
        verdict: "pass",
        questionEvaluations: [
          {
            questionId: "00000000-0000-4000-8000-000000000002",
            score: 0.72,
            verdict: "pass",
            feedback: "Good direction, but the dependency array should be tied more explicitly to effect reruns.",
            strengths: ["Recognized that dependencies affect reruns."],
            gaps: ["Needs clearer explanation of rerun control."],
            citedContextIds: []
          },
          {
            questionId: "00000000-0000-4000-8000-000000000003",
            score: 0.64,
            verdict: "needs-work",
            feedback: "The explanation covers diffing but misses the practical impact on DOM updates.",
            strengths: ["Understands virtual comparison."],
            gaps: ["Needs stronger explanation of update minimization."],
            citedContextIds: []
          },
          {
            questionId: "00000000-0000-4000-8000-000000000004",
            score: 0.76,
            verdict: "pass",
            feedback: "Reasonable scenario analysis with a good instinct for isolating state.",
            strengths: ["Suggested state isolation."],
            gaps: ["Could be more concrete about component boundaries."],
            citedContextIds: []
          }
        ],
        evidence: [
          {
            summary: "Correctly identified local state management in React.",
            polarity: "strength",
            confidence: 0.82,
            skillId: null
          },
          {
            summary: "Needs clearer explanation of effect dependencies and render isolation.",
            polarity: "gap",
            confidence: 0.76,
            skillId: null
          }
        ]
      });
    }

    if (input.prompt.includes("Create 1-3 lessons")) {
      return input.schema.parse({
        lessons: [
          {
            title: "Effect dependencies without guesswork",
            summary: "A short lesson on how to reason about effect dependencies.",
            skillId: null,
            difficulty: null,
            payload: {
              body: "Start from what the effect reads and then derive the dependency list from those reads.",
              takeaways: ["Model reads before writing dependencies", "Avoid cargo-cult fixes"],
              practicePrompt: "Review one useEffect and justify each dependency.",
              evidenceIds: [],
              contextItemIds: []
            }
          }
        ]
      });
    }

    if (input.prompt.includes("Return no more than four recommendations")) {
      return input.schema.parse({
        recommendations: [
          {
            kind: "lesson",
            title: "Review effect dependency reasoning",
            rationale: "Recent evidence shows explanation gaps around effect dependencies.",
            skillId: null,
            goalId: null,
            evidenceIds: [],
            payload: {}
          }
        ]
      });
    }

    return input.schema.parse({
      summary: "Context looks relevant.",
      response: `Mentor answer for: ${input.prompt}`,
      nextActions: ["Review the retrieved material"],
      evidence: ["Retrieved local content was used"]
    });
  }

  async embed(input: AiEmbeddingRequest): Promise<AiEmbeddingResult> {
    return {
      vectors: input.input.map(vectorFor),
      model: input.model,
      providerId: this.id
    };
  }

  async healthCheck() {
    return {
      providerId: this.id,
      status: "ok" as const,
      checkedAt: new Date(),
      latencyMs: 5,
      message: "Connection succeeded.",
      model: "openai/gpt-4o-mini",
      capabilities: this.capabilities
    };
  }
}

const fakeOpenRouterFactory: AiProviderFactory = {
  kind: "openrouter",
  create(params) {
    return new FakeOpenRouterProvider(params.id, params.displayName);
  },
  getCapabilities() {
    return {
      textGeneration: true,
      objectGeneration: true,
      textStreaming: true,
      embeddings: true
    };
  },
  listModels() {
    return [
      {
        id: "openai/gpt-4o-mini",
        displayName: "Fake GPT-4o mini",
        supportsTextGeneration: true,
        supportsStreaming: true,
        supportsStructuredOutput: true,
        supportsEmbeddings: false
      }
    ];
  }
};

describe("server API", () => {
  let context: AppContext;
  let credentialStore: InMemoryCredentialStore;

  beforeEach(async () => {
    credentialStore = new InMemoryCredentialStore();
    context = await createAppContext({
      aiRegistry: new AiProviderRegistry([fakeOpenRouterFactory]),
      credentialStore,
      database: {
        dataDir: null,
        runMigrations: true
      }
    });
  }, 20000);

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

  it("rejects a second app context for the same persistent data directory", async () => {
    const dataDir = await mkdtemp(join(tmpdir(), "leetgrind-pglite-lock-"));
    const lock = acquireDataDirLock(dataDir);

    try {
      await expect(
        createAppContext({
          aiRegistry: new AiProviderRegistry([fakeOpenRouterFactory]),
          credentialStore: new InMemoryCredentialStore(),
          database: {
            dataDir,
            runMigrations: true
          }
        })
      ).rejects.toThrow(/already using the PGLite data directory/);
    } finally {
      await lock?.release();
      await rm(dataDir, { force: true, recursive: true });
    }
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

  it("returns an empty onboarding state for a fresh local profile", async () => {
    const caller = appRouter.createCaller(context);
    const state = await caller.onboarding.getState();

    expect(state.isComplete).toBe(false);
    expect(state.goals).toHaveLength(0);
    expect(state.skills).toHaveLength(0);
    expect(state.resumeDocument).toBeNull();
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

  it("saves, tests, and selects an AI provider through the typed API", async () => {
    const caller = appRouter.createCaller(context);

    const provider = await caller.ai.providers.save({
      kind: "openrouter",
      displayName: "Primary OpenRouter",
      textModel: "openai/gpt-4o-mini",
      embeddingModel: "openai/text-embedding-3-small",
      apiKey: "test-key",
      isDefault: true
    });
    const listed = await caller.ai.providers.list();
    const settings = await caller.ai.settings.get();
    const health = await caller.ai.providers.test({
      providerId: provider.id
    });

    expect(provider.hasSecret).toBe(true);
    expect(listed).toHaveLength(1);
    expect(settings.defaultProviderId).toBe(provider.id);
    expect(health.status).toBe("ok");
    await expect(credentialStore.getSecret(provider.id)).resolves.toBe("test-key");
  });

  it("ingests documents, retrieves context, and stores preview run traces", async () => {
    const caller = appRouter.createCaller(context);
    const provider = await caller.ai.providers.save({
      kind: "openrouter",
      displayName: "Primary OpenRouter",
      textModel: "openai/gpt-4o-mini",
      embeddingModel: "openai/text-embedding-3-small",
      apiKey: "test-key",
      isDefault: true
    });
    const ingested = await caller.rag.documents.ingest({
      title: "Resume",
      sourceType: "resume",
      source: "manual",
      contentType: "text/plain",
      content: "React hooks, TypeScript, and interview preparation."
    });
    const searchResults = await caller.rag.documents.search({
      query: "React hooks",
      limit: 3,
      domain: "content"
    });
    const preview = await caller.agents.runPreview({
      prompt: "What should I revise next?",
      locale: "en",
      providerId: provider.id,
      includeContext: true,
      limit: 3
    });
    const runs = await caller.agents.listRecentRuns({
      limit: 10
    });

    expect(ingested.chunkCount).toBeGreaterThan(0);
    expect(searchResults[0]?.title).toBe("Resume");
    expect(preview.contextItems.length).toBeGreaterThan(0);
    expect(preview.run.status).toBe("succeeded");
    expect(runs.some((run) => run.kind === "ingestion")).toBe(true);
    expect(runs.some((run) => run.kind === "mentor")).toBe(true);
  });

  it("creates, completes, and follows up on an assessment", async () => {
    const caller = appRouter.createCaller(context);
    const provider = await caller.ai.providers.save({
      kind: "openrouter",
      displayName: "Primary OpenRouter",
      textModel: "openai/gpt-4o-mini",
      embeddingModel: "openai/text-embedding-3-small",
      apiKey: "test-key",
      isDefault: true
    });
    const [skill] = await caller.skills.upsertMany({
      skills: [
        {
          title: "React",
          level: "developing",
          description: "Hooks and rendering."
        }
      ]
    });
    const session = await caller.assessments.createSession({
      skillId: skill.id,
      locale: "en",
      focusPrompt: "Check React fundamentals"
    });

    expect(provider.id).toBeTruthy();
    expect(session.questions).toHaveLength(4);

    for (const question of session.questions) {
      if (question.kind === "multiple-choice") {
        await caller.assessments.submitAnswer({
          sessionId: session.session.id,
          answer: {
            questionId: question.id,
            kind: "multiple-choice",
            selectedChoiceIds: [question.correctChoiceIds[0]!]
          }
        });
      } else {
        await caller.assessments.submitAnswer({
          sessionId: session.session.id,
          answer: {
            questionId: question.id,
            kind: question.kind,
            responseText: "Structured answer"
          }
        });
      }
    }

    const completed = await caller.assessments.finishSession({
      sessionId: session.session.id
    });

    expect(completed?.result?.overallScore).toBeGreaterThan(0);
    expect(completed?.result?.lessons.length).toBeGreaterThan(0);
    expect(completed?.result?.recommendations.length).toBeGreaterThan(0);

    const lessons = await caller.lessons.list();
    const lesson = await caller.lessons.get({
      lessonId: lessons[0]!.id
    });

    expect(lesson?.payload.body).toContain("dependency");

    const refreshed = await caller.recommendations.refresh({
      skillId: skill.id,
      limit: 2
    });

    expect(refreshed.created.length + refreshed.reused.length).toBeGreaterThan(0);

    const active = await caller.recommendations.listActive();

    await caller.recommendations.accept({
      recommendationId: active[0]!.id
    });
    await caller.recommendations.dismiss({
      recommendationId: completed!.result!.recommendations[0]!.id
    });

    const runs = await caller.agents.listRecentRuns({
      limit: 12
    });

    expect(runs.some((run) => run.kind === "assessment-mentor")).toBe(true);
    expect(runs.some((run) => run.kind === "lesson-planner")).toBe(true);
    expect(runs.some((run) => run.kind === "recommender")).toBe(true);
  });
});
