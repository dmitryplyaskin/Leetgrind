import type { FieldErrors } from "react-hook-form";
import type { z } from "zod";
import {
  onboardingDraftInputSchema,
} from "@leetgrind/shared";

export type Locale = "ru" | "en";
export type OnboardingStep =
  | "profile"
  | "goals"
  | "skills"
  | "background"
  | "review";

export type OnboardingFormInput = Omit<
  z.input<typeof onboardingDraftInputSchema>,
  "resume"
> & {
  resume: {
    title: string;
    content: string;
  };
};

export const onboardingSteps: OnboardingStep[] = [
  "profile",
  "goals",
  "skills",
  "background",
  "review",
];

export const stepFieldNames: Record<Exclude<OnboardingStep, "review">, string[]> = {
  profile: [
    "profile.displayName",
    "profile.targetRole",
    "profile.experienceLevel",
    "preferences.uiLocale",
  ],
  goals: ["goals"],
  skills: ["skills"],
  background: [
    "resume.title",
    "resume.content",
    "preferences.contentLanguage",
    "preferences.programmingLanguages",
    "preferences.studyRhythm",
  ],
};

export function isOnboardingStep(value: unknown): value is OnboardingStep {
  return (
    value === "profile" ||
    value === "goals" ||
    value === "skills" ||
    value === "background" ||
    value === "review"
  );
}

export function toCsv(value: string[]) {
  return value.join(", ");
}

export function fromCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

export function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export function localeOrDefault(value: unknown, fallback: Locale): Locale {
  return value === "ru" || value === "en" ? value : fallback;
}

export function createEmptyValues(locale: Locale): OnboardingFormInput {
  return {
    profile: {
      displayName: null,
      targetRole: null,
      experienceLevel: null,
    },
    goals: [],
    skills: [],
    resume: {
      title: "",
      content: "",
    },
    preferences: {
      uiLocale: locale,
      contentLanguage: "mixed",
      programmingLanguages: [],
      studyRhythm: "daily",
      preferredAiProviderKind: "not-configured",
    },
  };
}

interface OnboardingGoalState {
  title: string;
  targetRole: string | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
}

interface OnboardingSkillState {
  title: string;
  level: OnboardingFormInput["skills"][number]["level"];
  description: string | null;
}

interface OnboardingStateSnapshot {
  profile: {
    displayName: string | null;
    targetRole: string | null;
    experienceLevel: OnboardingFormInput["profile"]["experienceLevel"];
    preferences: Record<string, unknown>;
  };
  goals: OnboardingGoalState[];
  skills: OnboardingSkillState[];
  resumeDocument: {
    title: string;
    content: string;
  } | null;
}

export function coerceSearchStep(search: unknown): OnboardingStep {
  if (
    search &&
    typeof search === "object" &&
    "step" in search &&
    isOnboardingStep((search as { step?: unknown }).step)
  ) {
    return (search as { step: OnboardingStep }).step;
  }

  return "profile";
}

export function mapOnboardingStateToFormValues(
  data: OnboardingStateSnapshot,
  fallbackLocale: Locale,
): OnboardingFormInput {
  const preferences = data.profile.preferences;
  const uiLocale = localeOrDefault(preferences.uiLocale, fallbackLocale);

  return {
    profile: {
      displayName: data.profile.displayName,
      targetRole: data.profile.targetRole,
      experienceLevel: data.profile.experienceLevel,
    },
    goals: data.goals.map((goal) => {
      const metadata = goal.metadata ?? {};

      return {
        title: goal.title,
        goalType:
          metadata.goalType === "company-interview" ||
          metadata.goalType === "role-growth" ||
          metadata.goalType === "skill-growth" ||
          metadata.goalType === "custom"
            ? metadata.goalType
            : "job-search",
        targetRole: goal.targetRole,
        targetCompany: stringOrNull(metadata.targetCompany),
        targetSeniority:
          metadata.targetSeniority === "intern" ||
          metadata.targetSeniority === "junior" ||
          metadata.targetSeniority === "middle" ||
          metadata.targetSeniority === "senior" ||
          metadata.targetSeniority === "staff" ||
          metadata.targetSeniority === "lead"
            ? metadata.targetSeniority
            : null,
        interviewDate: stringOrNull(metadata.interviewDate),
        focusAreas: stringArray(metadata.focusAreas),
        description: goal.description,
      };
    }),
    skills: data.skills.map((skill) => ({
      title: skill.title,
      level: skill.level,
      description: skill.description,
    })),
    resume: {
      title: data.resumeDocument?.title ?? "",
      content: data.resumeDocument?.content ?? "",
    },
    preferences: {
      uiLocale,
      contentLanguage:
        preferences.contentLanguage === "ru" ||
        preferences.contentLanguage === "en" ||
        preferences.contentLanguage === "mixed"
          ? preferences.contentLanguage
          : "mixed",
      programmingLanguages: stringArray(preferences.programmingLanguages),
      studyRhythm:
        preferences.studyRhythm === "weekdays" ||
        preferences.studyRhythm === "weekends" ||
        preferences.studyRhythm === "weekly" ||
        preferences.studyRhythm === "flexible"
          ? preferences.studyRhythm
          : "daily",
      preferredAiProviderKind:
        preferences.preferredAiProviderKind === "openai-codex" ||
        preferences.preferredAiProviderKind === "openai-api-key" ||
        preferences.preferredAiProviderKind === "openrouter" ||
        preferences.preferredAiProviderKind === "local"
          ? preferences.preferredAiProviderKind
          : "not-configured",
    },
  };
}

export function fieldError(
  errors: FieldErrors<OnboardingFormInput>,
  path: string,
) {
  const value = path
    .split(".")
    .reduce<unknown>((current, segment) => {
      if (!current || typeof current !== "object") {
        return undefined;
      }

      return (current as Record<string, unknown>)[segment];
    }, errors);

  if (value && typeof value === "object" && "message" in value) {
    const message = (value as { message?: unknown }).message;

    return typeof message === "string" ? message : undefined;
  }

  return undefined;
}
