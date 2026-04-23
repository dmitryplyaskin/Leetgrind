// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { leetgrindTheme } from "@leetgrind/ui";
import "./i18n";
import i18n from "i18next";
import { OnboardingRoute } from "./onboarding";

let mockedStep = "profile";
const mockedOnboardingState = {
  profile: {
    displayName: null,
    targetRole: null,
    experienceLevel: null,
    preferences: {
      uiLocale: "en",
      contentLanguage: "mixed",
      programmingLanguages: [],
      studyRhythm: "daily",
      preferredAiProviderKind: "not-configured",
      onboarding: {
        completedAt: null,
      },
    },
  },
  goals: [],
  goalSkillLinks: [],
  skills: [],
  resumeDocument: null,
  isComplete: false,
  preferences: {},
};

vi.mock("@tanstack/react-router", () => ({
  useLocation: () => ({
    pathname: "/onboarding",
    search: {
      step: mockedStep,
    },
  }),
  useNavigate: () => vi.fn(),
}));

vi.mock("./trpc", () => ({
  trpc: {
    useUtils: () => ({
      onboarding: { getState: { invalidate: vi.fn() } },
    }),
    onboarding: {
      getState: {
        useQuery: () => ({
          data: mockedOnboardingState,
        }),
      },
      saveDraft: {
        useMutation: () => ({
          isPending: false,
          isSuccess: false,
          error: null,
          mutate: vi.fn(),
        }),
      },
      complete: {
        useMutation: () => ({
          isPending: false,
          isSuccess: false,
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
        <OnboardingRoute />
      </MantineProvider>
    </I18nextProvider>,
  );
}

describe("OnboardingRoute", () => {
  beforeEach(async () => {
    mockedStep = "profile";
    await i18n.changeLanguage("en");
  });

  it("renders a blank profile step without prefilled user data", () => {
    renderRoute();

    expect(
      screen.getByRole("heading", { name: /Build your starting skill map/i }),
    ).toBeVisible();
    expect(screen.getByLabelText(/Display name/i)).toHaveValue("");
    expect(screen.getByLabelText(/Target role/i)).toHaveValue("");
    expect(screen.queryByDisplayValue(/Frontend Engineer/i)).not.toBeInTheDocument();
  });

  it("shows an explicit empty state instead of a prefilled first goal", () => {
    mockedStep = "goals";
    renderRoute();

    expect(screen.getByText(/No goals yet/i)).toBeVisible();
    expect(screen.getByRole("button", { name: /Add the first goal/i })).toBeVisible();
    expect(screen.queryByLabelText(/Goal title/i)).not.toBeInTheDocument();
  });
});
