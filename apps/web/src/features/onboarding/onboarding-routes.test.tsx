// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { leetgrindTheme } from "@leetgrind/ui";
import "../../shared/i18n/i18n";
import i18n from "i18next";
import { OnboardingRoute } from "./onboarding";

const navigateMock = vi.fn();
const completeMutateMock = vi.fn();
const discoverMutateAsyncMock = vi.fn();
const saveProviderMutateAsyncMock = vi.fn();
const testProviderMutateAsyncMock = vi.fn();
const extractMutateAsyncMock = vi.fn();
let providerReady = false;

const extractedDraft = {
  profile: {
    displayName: "Dima",
    targetRole: "Frontend Engineer",
    experienceLevel: "middle",
  },
  goals: [
    {
      title: "Frontend interviews",
      goalType: "job-search",
      targetRole: "Frontend Engineer",
      targetCompany: null,
      targetSeniority: "senior",
      interviewDate: null,
      focusAreas: ["React", "TypeScript"],
      description: "Prepare for senior frontend interviews.",
    },
  ],
  skills: [
    {
      title: "React",
      level: "developing",
      description: "Uses React in production.",
    },
    {
      title: "Algorithms",
      level: "weak",
      description: "Needs interview practice.",
    },
  ],
  resume: null,
  preferences: {
    uiLocale: "en",
    contentLanguage: "mixed",
    programmingLanguages: ["TypeScript"],
    studyRhythm: "daily",
    preferredAiProviderKind: "openrouter",
  },
};

const mockedOnboardingState: any = {
  profile: {
    displayName: null,
    targetRole: null,
    experienceLevel: null,
    resumeText: null,
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
  useNavigate: () => navigateMock,
}));

vi.mock("../../shared/api/trpc", () => ({
  trpc: {
    useUtils: () => ({
      ai: {
        providers: { list: { invalidate: vi.fn() } },
        settings: { get: { invalidate: vi.fn() } },
      },
      dashboard: { getSummary: { invalidate: vi.fn() } },
      onboarding: { getState: { invalidate: vi.fn() } },
    }),
    ai: {
      settings: {
        get: {
          useQuery: () => ({
            data: {
              defaultProviderId: providerReady ? "provider-1" : null,
              providers: providerReady
                ? [
                    {
                      id: "provider-1",
                      kind: "openrouter",
                      displayName: "OpenRouter",
                      isDefault: true,
                      hasSecret: true,
                      isImplemented: true,
                      config: {
                        textModel: "openai/gpt-4o-mini",
                        embeddingModel: "openai/text-embedding-3-small",
                      },
                    },
                  ]
                : [],
            },
            isLoading: false,
          }),
        },
      },
      providers: {
        discoverOpenRouterModels: {
          useMutation: () => ({
            isPending: false,
            mutateAsync: discoverMutateAsyncMock,
          }),
        },
        save: {
          useMutation: () => ({
            isPending: false,
            mutateAsync: saveProviderMutateAsyncMock,
          }),
        },
        test: {
          useMutation: () => ({
            isPending: false,
            mutateAsync: testProviderMutateAsyncMock,
          }),
        },
      },
    },
    onboarding: {
      getState: {
        useQuery: () => ({
          data: mockedOnboardingState,
        }),
      },
      extractFromNarrative: {
        useMutation: () => ({
          isPending: false,
          error: null,
          mutateAsync: extractMutateAsyncMock,
        }),
      },
      complete: {
        useMutation: (options: { onSuccess?: () => Promise<void> }) => ({
          isPending: false,
          isSuccess: false,
          error: null,
          mutate: (input: unknown) => {
            completeMutateMock(input);
            void options.onSuccess?.();
          },
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
    providerReady = false;
    navigateMock.mockReset();
    completeMutateMock.mockReset();
    discoverMutateAsyncMock.mockReset();
    saveProviderMutateAsyncMock.mockReset();
    testProviderMutateAsyncMock.mockReset();
    extractMutateAsyncMock.mockReset();
    discoverMutateAsyncMock.mockResolvedValue({
      textModels: [
        {
          id: "openai/gpt-4o-mini",
          displayName: "OpenAI GPT-4o mini",
          supportsTextGeneration: true,
          supportsStructuredOutput: true,
          supportsEmbeddings: false,
        },
      ],
      embeddingModels: [
        {
          id: "openai/text-embedding-3-small",
          displayName: "OpenAI text-embedding-3-small",
          supportsTextGeneration: false,
          supportsStructuredOutput: false,
          supportsEmbeddings: true,
        },
      ],
      recommendedTextModel: "openai/gpt-4o-mini",
      recommendedEmbeddingModel: "openai/text-embedding-3-small",
    });
    saveProviderMutateAsyncMock.mockResolvedValue({ id: "provider-1" });
    testProviderMutateAsyncMock.mockResolvedValue({
      status: "ok",
      message: "Connection succeeded.",
    });
    extractMutateAsyncMock.mockResolvedValue({
      draft: extractedDraft,
      summary: "Leetgrind understood the goal and extracted a starting map.",
      assumptions: ["Algorithms need validation."],
      suggestedFirstActions: ["Run a React assessment."],
    });
    mockedOnboardingState.profile.displayName = null;
    mockedOnboardingState.profile.targetRole = null;
    mockedOnboardingState.profile.experienceLevel = null;
    mockedOnboardingState.goals = [];
    mockedOnboardingState.skills = [];
    await i18n.changeLanguage("en");
  });

  it("starts with OpenRouter setup when no provider is ready", () => {
    renderRoute();

    expect(screen.getByText(/Setup/i)).toBeVisible();
    expect(screen.getByRole("heading", { name: /OpenRouter/i })).toBeVisible();
    expect(screen.getByLabelText(/OpenRouter API key/i)).toBeVisible();
  });

  it("loads models before saving the provider", async () => {
    const user = userEvent.setup();

    renderRoute();
    fireEvent.change(screen.getByLabelText(/OpenRouter API key/i), {
      target: { value: "sk-or-test" },
    });
    await user.click(screen.getByRole("button", { name: /Find models/i }));

    expect(discoverMutateAsyncMock).toHaveBeenCalledWith({ apiKey: "sk-or-test" });
    expect(screen.getByText(/Choose models/i)).toBeVisible();
    expect(saveProviderMutateAsyncMock).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /Save and continue/i }));

    expect(saveProviderMutateAsyncMock).toHaveBeenCalledWith(
      expect.objectContaining({
        textModel: "openai/gpt-4o-mini",
        embeddingModel: "openai/text-embedding-3-small",
      }),
    );
  });

  it("uses one free-form context screen after provider setup", () => {
    providerReady = true;
    mockedOnboardingState.profile.targetRole = "Frontend Engineer";
    mockedOnboardingState.profile.experienceLevel = "middle";
    mockedOnboardingState.goals = [
      {
        id: "goal-1",
        profileId: "profile-1",
        title: "Frontend interviews",
        description: "Prepare for senior frontend interviews.",
        targetRole: "Frontend Engineer",
        status: "active",
        metadata: {
          focusAreas: ["React", "TypeScript"],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    mockedOnboardingState.skills = [
      {
        id: "skill-1",
        slug: "react",
        title: "React",
        level: "developing",
        description: "Production React experience.",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    renderRoute();

    expect(screen.getByRole("heading", { name: /Profile and goal/i })).toBeVisible();
    expect(
      (screen.getByLabelText(/Experience, skills, and weak spots/i) as HTMLTextAreaElement)
        .value,
    ).toContain("Frontend Engineer");
    expect(
      (screen.getByLabelText(/Experience, skills, and weak spots/i) as HTMLTextAreaElement)
        .value,
    ).toContain("React");
    expect((screen.getByLabelText(/Preparation goal/i) as HTMLTextAreaElement).value).toContain(
      "Frontend interviews",
    );
    expect(screen.queryByLabelText(/Display name/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Goal title/i)).not.toBeInTheDocument();
  });

  it("shows the saved key placeholder and model selectors when editing provider", async () => {
    providerReady = true;
    const user = userEvent.setup();

    renderRoute();
    await user.click(screen.getByRole("button", { name: /Change provider/i }));

    expect(screen.getByLabelText(/OpenRouter API key/i)).toHaveValue("sk-or-************");
    expect(screen.getAllByLabelText(/Text model/i).length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/Embedding model/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /Save and continue/i })).toBeEnabled();
  });

  it("extracts a structured map and saves it after review", async () => {
    providerReady = true;
    const user = userEvent.setup();

    renderRoute();
    fireEvent.change(screen.getByLabelText(/Experience, skills, and weak spots/i), {
      target: {
        value:
          "I am a frontend engineer using React and TypeScript. Algorithms are weak.",
      },
    });
    fireEvent.change(
      screen.getByLabelText(/Preparation goal/i),
      {
        target: {
          value: "Prepare for senior frontend interviews.",
        },
      },
    );
    await user.click(screen.getByRole("button", { name: /Build my map/i }));
    await user.click(screen.getByRole("button", { name: /Save and open workspace/i }));

    expect(extractMutateAsyncMock).toHaveBeenCalledWith(
      expect.objectContaining({
        goalText: "Prepare for senior frontend interviews.",
      }),
    );
    expect(completeMutateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        goals: expect.arrayContaining([
          expect.objectContaining({ title: "Frontend interviews" }),
        ]),
        skills: expect.arrayContaining([
          expect.objectContaining({ title: "React" }),
        ]),
      }),
    );
    expect(navigateMock).toHaveBeenCalledWith({
      to: "/dashboard",
      replace: true,
    });
  });
});
