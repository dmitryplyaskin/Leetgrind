// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { leetgrindTheme } from "@leetgrind/ui";
import "./i18n";
import i18n from "i18next";
import { AssessmentResultRoute } from "./assessment-result";
import { AssessmentSessionRoute } from "./assessment-session";

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    ...props
  }: React.ComponentPropsWithoutRef<"a"> & { to?: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useParams: () => ({ sessionId: "session-1" }),
  useNavigate: () => vi.fn()
}));

const invalidate = vi.fn();
const sessionQueryData = {
  session: {
    id: "session-1",
    status: "completed",
    title: "React fundamentals check",
    summary: "Mixed assessment",
    locale: "en"
  },
  questions: [
    {
      id: "question-1",
      kind: "multiple-choice",
      prompt: "Which hook stores local state?",
      choices: [
        { id: "a", label: "useMemo" },
        { id: "b", label: "useState" }
      ]
    },
    {
      id: "question-2",
      kind: "explanation",
      prompt: "Explain reconciliation."
    }
  ],
  answers: [],
  result: {
    overallScore: 72,
    verdict: "pass",
    summary: "Useful structured feedback",
    evidence: [],
    questionEvaluations: [
      {
        questionId: "question-1",
        feedback: "Good answer."
      }
    ],
    lessons: [
      {
        id: "lesson-1",
        title: "Effect dependencies",
        summary: "Follow-up lesson"
      }
    ],
    recommendations: [
      {
        id: "rec-1",
        title: "Review dependencies",
        rationale: "There is still a gap here."
      }
    ]
  }
};

vi.mock("./trpc", () => ({
  trpc: {
    useUtils: () => ({
      assessments: { getSession: { invalidate } },
      dashboard: { getSummary: { invalidate } }
    }),
    assessments: {
      getSession: {
        useQuery: () => ({
          data: sessionQueryData,
          error: null
        })
      },
      submitAnswer: {
        useMutation: () => ({
          isPending: false,
          mutateAsync: vi.fn()
        })
      },
      finishSession: {
        useMutation: () => ({
          isPending: false,
          mutateAsync: vi.fn()
        })
      }
    },
    recommendations: {
      accept: {
        useMutation: () => ({
          isPending: false,
          mutate: vi.fn()
        })
      },
      dismiss: {
        useMutation: () => ({
          isPending: false,
          mutate: vi.fn()
        })
      }
    }
  }
}));

function renderUi(node: React.ReactNode) {
  render(
    <I18nextProvider i18n={i18n}>
      <MantineProvider theme={leetgrindTheme}>{node}</MantineProvider>
    </I18nextProvider>
  );
}

describe("assessment routes", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("renders mixed assessment question types", () => {
    renderUi(<AssessmentSessionRoute />);

    expect(screen.getByText(/React fundamentals check/i)).toBeVisible();
    expect(screen.getByLabelText(/useState/i)).toBeVisible();
    expect(screen.getByPlaceholderText(/Write your answer here/i)).toBeVisible();
  });

  it("renders localized assessment results with follow-up actions", async () => {
    await i18n.changeLanguage("ru");
    renderUi(<AssessmentResultRoute />);

    expect(screen.getByRole("heading", { name: /Результат проверки/i })).toBeVisible();
    expect(screen.getByText(/Effect dependencies/i)).toBeVisible();
    expect(screen.getByRole("button", { name: /Принять/i })).toBeVisible();
    expect(screen.getByRole("button", { name: /Скрыть/i })).toBeVisible();
  });
});
