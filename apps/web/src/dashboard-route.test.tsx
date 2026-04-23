// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { leetgrindTheme } from "@leetgrind/ui";
import "./i18n";
import i18n from "i18next";
import { DashboardRoute } from "./dashboard";

vi.mock("react-cytoscapejs", () => ({
  default: () => <div data-testid="skill-graph" />,
}));

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
  useNavigate: () => vi.fn(),
}));

vi.mock("./trpc", () => ({
  trpc: {
    useUtils: () => ({
      dashboard: { getSummary: { invalidate: vi.fn() } },
    }),
    dashboard: {
      getSummary: {
        useQuery: () => ({
          data: {
            profile: {
              displayName: "Dima",
              targetRole: "Frontend Engineer",
            },
            activeGoal: {
              id: "goal-1",
              title: "Frontend interviews",
              targetRole: "Frontend Engineer",
            },
            readiness: {
              score: 52,
              band: "progressing",
              totalSkills: 2,
              strongSkills: 0,
              dueReviews: 0,
            },
            skills: [
              {
                skill: {
                  id: "skill-1",
                  title: "React",
                  level: "developing",
                },
                score: 64,
                goalRelevance: "primary",
                attemptCount: 0,
                dueReviewCount: 0,
              },
            ],
            strongSkills: [],
            weakSpots: [],
            nextActions: [
              {
                id: "action-1",
                skillId: "skill-1",
                titleKey: "takeAssessment",
                reasonKey: "negativeEvidence",
              },
            ],
            upcomingReviews: [],
            recentActivity: [],
            graph: {
              nodes: [
                {
                  id: "skill-1",
                  label: "React",
                  level: "developing",
                  score: 64,
                  isGoalSkill: true,
                  dueReviewCount: 0,
                },
              ],
              edges: [],
            },
          },
          error: null,
          isLoading: false,
        }),
      },
    },
    recommendations: {
      accept: {
        useMutation: () => ({
          isPending: false,
          mutate: vi.fn(),
        }),
      },
      dismiss: {
        useMutation: () => ({
          isPending: false,
          mutate: vi.fn(),
        }),
      },
      refresh: {
        useMutation: () => ({
          isPending: false,
          error: null,
          mutate: vi.fn(),
        }),
      },
    },
  },
}));

function renderRoute() {
  render(
    <I18nextProvider i18n={i18n}>
      <MantineProvider theme={leetgrindTheme}>
        <DashboardRoute />
      </MantineProvider>
    </I18nextProvider>,
  );
}

describe("DashboardRoute", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("renders the first-session dashboard without empty operational sections", () => {
    renderRoute();

    expect(
      screen.getByRole("heading", {
        name: /Your workspace is ready for the first real session/i,
      }),
    ).toBeVisible();
    expect(screen.getAllByText(/Frontend Engineer/i).length).toBeGreaterThan(0);
    expect(
      screen.queryByText(/No scheduled reviews yet/i),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/No activity has been recorded yet/i)).not.toBeInTheDocument();
  });
});
