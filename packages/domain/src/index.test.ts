import { describe, expect, it } from "vitest";
import { dedupePendingRecommendations, scoreMultipleChoiceAnswer } from "./index";

describe("domain assessment helpers", () => {
  it("scores multiple-choice answers deterministically", () => {
    const result = scoreMultipleChoiceAnswer(
      {
        id: "question-1",
        kind: "multiple-choice",
        skillId: null,
        prompt: "Which hook stores local state?",
        choices: [
          { id: "a", label: "useMemo" },
          { id: "b", label: "useState" },
          { id: "c", label: "useContext" }
        ],
        correctChoiceIds: ["b"]
      },
      {
        questionId: "question-1",
        kind: "multiple-choice",
        selectedChoiceIds: ["b"]
      }
    );

    expect(result.score).toBe(1);
    expect(result.isCorrect).toBe(true);
    expect(result.missedChoiceIds).toEqual([]);
  });

  it("dedupes pending recommendations by goal, skill, and kind", () => {
    const deduped = dedupePendingRecommendations([
      {
        id: "rec-1",
        profileId: "profile-1",
        goalId: "goal-1",
        skillId: "skill-1",
        kind: "lesson",
        status: "pending",
        title: "First",
        rationale: "First rationale",
        evidenceIds: [],
        payload: {},
        createdAt: new Date("2026-04-20T00:00:00.000Z"),
        updatedAt: new Date("2026-04-20T00:00:00.000Z")
      },
      {
        id: "rec-2",
        profileId: "profile-1",
        goalId: "goal-1",
        skillId: "skill-1",
        kind: "lesson",
        status: "pending",
        title: "Second",
        rationale: "Second rationale",
        evidenceIds: [],
        payload: {},
        createdAt: new Date("2026-04-21T00:00:00.000Z"),
        updatedAt: new Date("2026-04-21T00:00:00.000Z")
      },
      {
        id: "rec-3",
        profileId: "profile-1",
        goalId: "goal-1",
        skillId: "skill-1",
        kind: "assessment",
        status: "pending",
        title: "Third",
        rationale: "Third rationale",
        evidenceIds: [],
        payload: {},
        createdAt: new Date("2026-04-21T00:00:00.000Z"),
        updatedAt: new Date("2026-04-21T00:00:00.000Z")
      }
    ]);

    expect(deduped.map((item) => item.id)).toEqual(["rec-1", "rec-3"]);
  });
});
