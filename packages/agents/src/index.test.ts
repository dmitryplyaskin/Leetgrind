import { describe, expect, it } from "vitest";
import type {
  AiEmbeddingRequest,
  AiEmbeddingResult,
  AiObjectRequest,
  AiProvider,
  AiTextRequest,
  AiTextResult
} from "@leetgrind/ai";
import type { AiProviderHealth } from "@leetgrind/shared";
import {
  AssessmentMentorWorkflow,
  LessonPlannerWorkflow,
  MentorPreviewWorkflow,
  RecommenderWorkflow
} from "./index.js";

class FakeProvider implements AiProvider {
  id = "provider-1";
  kind = "openrouter" as const;
  displayName = "Fake";
  capabilities = {
    textGeneration: true,
    objectGeneration: true,
    textStreaming: true,
    embeddings: true
  };

  async listModels() {
    return [
      {
        id: "fake-model",
        displayName: "Fake model",
        supportsTextGeneration: true,
        supportsStreaming: true,
        supportsStructuredOutput: true,
        supportsEmbeddings: true
      }
    ];
  }

  async generateText(input: AiTextRequest): Promise<AiTextResult> {
    return {
      text: input.prompt,
      model: input.model,
      providerId: this.id
    };
  }

  async *streamText(input: AiTextRequest) {
    yield { text: input.prompt };
  }

  async generateObject<TSchema extends AiObjectRequest["schema"]>(
    input: AiObjectRequest<TSchema>
  ): Promise<import("zod").infer<TSchema>> {
    if (input.prompt.includes("Generate a balanced assessment")) {
      return input.schema.parse({
        title: "Assessment",
        summary: "Generated summary",
        questions: [
          {
            kind: "multiple-choice",
            prompt: "Question 1",
            explanation: null,
            choices: [
              { id: "a", label: "A" },
              { id: "b", label: "B" }
            ],
            correctChoiceIds: ["b"],
            rationale: null
          },
          {
            kind: "short-answer",
            prompt: "Question 2",
            explanation: null,
            expectedConcepts: ["one"],
            placeholder: null
          },
          {
            kind: "explanation",
            prompt: "Question 3",
            explanation: null,
            rubric: ["one", "two"]
          },
          {
            kind: "scenario-analysis",
            prompt: "Question 4",
            explanation: null,
            scenario: "Scenario",
            rubric: ["one", "two"]
          }
        ]
      });
    }

    if (input.prompt.includes("Evaluate the answers")) {
      return input.schema.parse({
        summary: "Evaluation summary",
        overallScore: 70,
        verdict: "pass",
        questionEvaluations: [],
        evidence: [
          {
            summary: "Shows progress",
            polarity: "progress",
            confidence: 0.7,
            skillId: null
          }
        ]
      });
    }

    if (input.prompt.includes("Create 1-3 lessons")) {
      return input.schema.parse({
        lessons: [
          {
            title: "Lesson",
            summary: "Lesson summary",
            skillId: null,
            difficulty: null,
            payload: {
              body: "Lesson body",
              takeaways: ["One"],
              practicePrompt: "Try it",
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
            title: "Recommendation",
            rationale: "Specific rationale",
            skillId: null,
            goalId: null,
            evidenceIds: [],
            payload: {}
          }
        ]
      });
    }

    return input.schema.parse({
      summary: "Summary",
      response: "Response",
      nextActions: ["Act"],
      evidence: ["Evidence"]
    });
  }

  async embed(input: AiEmbeddingRequest): Promise<AiEmbeddingResult> {
    return {
      vectors: input.input.map(() => [1, 0, 0]),
      model: input.model,
      providerId: this.id
    };
  }

  async healthCheck(): Promise<AiProviderHealth> {
    return {
      providerId: this.id,
      status: "ok",
      checkedAt: new Date(),
      latencyMs: 1,
      message: "ok",
      model: "fake-model",
      capabilities: this.capabilities
    };
  }
}

describe("agent workflows", () => {
  const provider = new FakeProvider();

  it("builds a mentor preview", async () => {
    const workflow = new MentorPreviewWorkflow();
    const result = await workflow.run({
      contextItems: [],
      goal: null,
      locale: "en",
      prompt: "Help me",
      provider,
      run: {
        id: "run-1",
        kind: "mentor",
        status: "running",
        providerId: "provider-1",
        model: "fake-model",
        error: null,
        startedAt: new Date(),
        completedAt: null,
        createdAt: new Date()
      }
    });

    expect(result.summary).toBe("Summary");
    expect(result.nextActions).toContain("Act");
  });

  it("creates assessments, lessons, and recommendations with structured outputs", async () => {
    const assessment = new AssessmentMentorWorkflow();
    const lessons = new LessonPlannerWorkflow();
    const recommender = new RecommenderWorkflow();
    const draft = await assessment.createSession({
      contextItems: [],
      goal: null,
      locale: "en",
      focusPrompt: "React",
      skill: {
        id: "skill-1",
        title: "React",
        description: null
      },
      provider
    });
    const evaluation = await assessment.evaluateSession({
      contextItems: [],
      locale: "en",
      questions: draft.questions,
      answers: [
        {
          questionId: draft.questions[0]!.id,
          kind: "multiple-choice",
          selectedChoiceIds: ["b"]
        }
      ],
      provider
    });
    const lessonPlan = await lessons.run({
      contextItems: [],
      locale: "en",
      skill: {
        id: "skill-1",
        title: "React"
      },
      focusPrompt: "React",
      evidenceIds: [],
      provider
    });
    const recommendationPlan = await recommender.run({
      contextItems: [],
      locale: "en",
      goal: null,
      skill: {
        id: "skill-1",
        title: "React"
      },
      evidenceIds: [],
      provider
    });

    expect(draft.questions).toHaveLength(4);
    expect(evaluation.evidence[0]?.summary).toContain("progress");
    expect(lessonPlan.lessons[0]?.payload.body).toBe("Lesson body");
    expect(recommendationPlan.recommendations[0]?.title).toBe("Recommendation");
  });
});
