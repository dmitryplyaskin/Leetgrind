import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Circle,
  CircleDot,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { z } from "zod";
import {
  type OnboardingCompleteInput,
  onboardingCompleteInputSchema,
  onboardingDraftInputSchema,
} from "@leetgrind/shared";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Group,
  Kicker,
  PageHeader,
  PageLead,
  PageSection,
  PageTitle,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@leetgrind/ui";
import { i18n } from "./i18n";
import { trpc } from "./trpc";

type Locale = "ru" | "en";
type OnboardingStep = "profile" | "goals" | "skills" | "background" | "review";
type OnboardingFormInput = Omit<z.input<typeof onboardingDraftInputSchema>, "resume"> & {
  resume: {
    title: string;
    content: string;
  };
};

const onboardingSteps: OnboardingStep[] = [
  "profile",
  "goals",
  "skills",
  "background",
  "review",
];

const stepFieldNames: Record<Exclude<OnboardingStep, "review">, string[]> = {
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

function isOnboardingStep(value: unknown): value is OnboardingStep {
  return (
    value === "profile" ||
    value === "goals" ||
    value === "skills" ||
    value === "background" ||
    value === "review"
  );
}

function toCsv(value: string[]) {
  return value.join(", ");
}

function fromCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function localeOrDefault(value: unknown, fallback: Locale): Locale {
  return value === "ru" || value === "en" ? value : fallback;
}

function createEmptyValues(locale: Locale): OnboardingFormInput {
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

function StepNavigation({
  currentStep,
  onSelect,
  isComplete,
  t,
}: {
  currentStep: OnboardingStep;
  onSelect: (step: OnboardingStep) => void;
  isComplete: boolean;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
    <Paper
      p="lg"
      radius="lg"
      style={{
        border: "1px solid var(--mantine-color-default-border)",
        position: "sticky",
        top: 24,
      }}
    >
      <Stack gap="sm">
        <Kicker>{t("onboarding.progress")}</Kicker>
        <Title order={2} size="h4">
          {isComplete
            ? t("onboarding.reviewingTitle")
            : t("onboarding.startingTitle")}
        </Title>
        <Text c="dimmed" size="sm">
          {t("onboarding.wizardDescription")}
        </Text>
      </Stack>
      <Stack gap="xs" mt="lg">
        {onboardingSteps.map((step, index) => {
          const isActive = step === currentStep;
          const Icon = isActive ? CircleDot : Circle;

          return (
            <Button
              key={step}
              color={isActive ? "dark" : "gray"}
              justify="flex-start"
              leftSection={<Icon size={16} />}
              variant={isActive ? "light" : "subtle"}
              onClick={() => onSelect(step)}
            >
              {index + 1}. {t(`onboarding.steps.${step}`)}
            </Button>
          );
        })}
      </Stack>
    </Paper>
  );
}

function ReviewItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Paper
      bg="var(--mantine-color-default-hover)"
      p="md"
      radius="md"
      style={{ border: "1px solid var(--mantine-color-default-border)" }}
    >
      <Stack gap={4}>
        <Text c="dimmed" size="sm">
          {label}
        </Text>
        <Text fw={650}>{value}</Text>
      </Stack>
    </Paper>
  );
}

export function OnboardingRoute() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate({ from: "/onboarding" });
  const utils = trpc.useUtils();
  const onboarding = trpc.onboarding.getState.useQuery();
  const saveDraft = trpc.onboarding.saveDraft.useMutation({
    onSuccess: async () => {
      await utils.onboarding.getState.invalidate();
    },
  });
  const complete = trpc.onboarding.complete.useMutation({
    onSuccess: async () => {
      await utils.onboarding.getState.invalidate();
      await navigate({ to: "/dashboard" });
    },
  });
  const fallbackLocale = i18n.language === "ru" ? "ru" : "en";
  const [stepAlert, setStepAlert] = useState<string | null>(null);
  const currentSearch = location.search as { step?: string } | undefined;
  const currentStep = isOnboardingStep(currentSearch?.step)
    ? currentSearch.step
    : "profile";

  const form = useForm<OnboardingFormInput, unknown, OnboardingCompleteInput>({
    resolver: zodResolver(onboardingCompleteInputSchema) as Resolver<
      OnboardingFormInput,
      unknown,
      OnboardingCompleteInput
    >,
    defaultValues: createEmptyValues(fallbackLocale),
  });
  const { control, formState, getValues, handleSubmit, register, reset, trigger, watch } =
    form;
  const goalFields = useFieldArray({ control, name: "goals" });
  const skillFields = useFieldArray({ control, name: "skills" });
  const watchedLocale = watch("preferences.uiLocale");
  const activeGoals = watch("goals");
  const activeSkills = watch("skills");
  const programmingLanguages = watch("preferences.programmingLanguages");
  const watchedProfile = watch("profile");
  const watchedResume = watch("resume");
  const isSaving = complete.isPending || saveDraft.isPending;
  const isComplete = onboarding.data?.isComplete ?? false;
  const stepIndex = onboardingSteps.indexOf(currentStep);

  const stepMeta = useMemo(
    () =>
      onboardingSteps.map((step) => ({
        id: step,
        title: t(`onboarding.steps.${step}`),
        description: t(`onboarding.stepDescriptions.${step}`),
      })),
    [t],
  );

  useEffect(() => {
    void i18n.changeLanguage(watchedLocale);
  }, [watchedLocale]);

  useEffect(() => {
    if (!isOnboardingStep(currentSearch?.step)) {
      void navigate({
        replace: true,
        to: "/onboarding",
        search: { step: "profile" } as never,
      });
    }
  }, [currentSearch?.step, navigate]);

  useEffect(() => {
    if (!onboarding.data) {
      return;
    }

    const preferences = onboarding.data.profile.preferences;
    const uiLocale = localeOrDefault(preferences.uiLocale, fallbackLocale);

    reset({
      profile: {
        displayName: onboarding.data.profile.displayName,
        targetRole: onboarding.data.profile.targetRole,
        experienceLevel: onboarding.data.profile.experienceLevel,
      },
      goals: onboarding.data.goals.map((goal) => {
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
      skills: onboarding.data.skills.map((skill) => ({
        title: skill.title,
        level: skill.level,
        description: skill.description,
      })),
      resume: {
        title: onboarding.data.resumeDocument?.title ?? "",
        content: onboarding.data.resumeDocument?.content ?? "",
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
    });
  }, [fallbackLocale, onboarding.data, reset]);

  useEffect(() => {
    setStepAlert(null);
  }, [currentStep]);

  const goToStep = (step: OnboardingStep) =>
    navigate({
      to: "/onboarding",
      search: { step } as never,
    });

  const validateCurrentStep = async () => {
    if (currentStep === "goals" && goalFields.fields.length === 0) {
      setStepAlert(t("onboarding.validation.goalRequired"));
      return false;
    }

    if (currentStep === "skills" && skillFields.fields.length === 0) {
      setStepAlert(t("onboarding.validation.skillRequired"));
      return false;
    }

    if (currentStep === "review") {
      return true;
    }

    return trigger(stepFieldNames[currentStep as Exclude<OnboardingStep, "review">] as never);
  };

  const handleNext = async () => {
    const isStepValid = await validateCurrentStep();

    if (!isStepValid) {
      return;
    }

    const nextStep = onboardingSteps[stepIndex + 1];

    if (nextStep) {
      await goToStep(nextStep);
    }
  };

  const activeGoalCount = activeGoals.filter((goal) => goal.title.trim().length > 0).length;
  const activeSkillCount = activeSkills.filter((skill) => skill.title.trim().length > 0).length;

  return (
    <Container size="xl">
      <PageSection>
        <PageHeader>
          <Stack gap="xs" maw={720}>
            <Kicker>{t("app.onboarding")}</Kicker>
            <PageTitle>{t("onboarding.title")}</PageTitle>
            <PageLead>{t("onboarding.subtitle")}</PageLead>
          </Stack>
        </PageHeader>

        <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="lg">
          <StepNavigation
            currentStep={currentStep}
            isComplete={isComplete}
            onSelect={goToStep}
            t={t}
          />

          <Box
            component="form"
            style={{ gridColumn: "span 2" }}
            onSubmit={handleSubmit((values) => complete.mutate(values))}
          >
            <Stack gap="lg">
              <Card>
                <CardContent>
                  <Stack gap="xs">
                    <Kicker>{t("onboarding.stepLabel", { step: stepIndex + 1 })}</Kicker>
                    <Title order={2} size="h3">
                      {stepMeta[stepIndex]?.title}
                    </Title>
                    <Text c="dimmed" maw={640}>
                      {stepMeta[stepIndex]?.description}
                    </Text>
                  </Stack>
                </CardContent>
              </Card>

              {currentStep === "profile" ? (
                <Card>
                  <CardContent>
                    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                      <TextInput
                        label={t("onboarding.fields.displayName")}
                        placeholder={t("onboarding.placeholders.displayName")}
                        {...register("profile.displayName")}
                      />
                      <TextInput
                        label={t("onboarding.fields.targetRole")}
                        placeholder={t("onboarding.placeholders.targetRole")}
                        {...register("profile.targetRole")}
                      />
                      <Select
                        label={t("onboarding.fields.experienceLevel")}
                        data={[
                          { value: "", label: t("options.empty") },
                          { value: "beginner", label: t("options.levels.beginner") },
                          { value: "junior", label: t("options.levels.junior") },
                          { value: "middle", label: t("options.levels.middle") },
                          { value: "senior", label: t("options.levels.senior") },
                          { value: "expert", label: t("options.levels.expert") },
                        ]}
                        {...register("profile.experienceLevel")}
                      />
                      <Select
                        label={t("onboarding.fields.uiLocale")}
                        data={[
                          { value: "en", label: "English" },
                          { value: "ru", label: "Русский" },
                        ]}
                        {...register("preferences.uiLocale")}
                      />
                    </SimpleGrid>
                  </CardContent>
                </Card>
              ) : null}

              {currentStep === "goals" ? (
                <Card>
                  <CardContent>
                    <Group align="center" justify="space-between" gap="md" mb="md">
                      <Stack gap={4}>
                        <Title order={3} size="h4">
                          {t("onboarding.goalSectionTitle")}
                        </Title>
                        <Text c="dimmed" size="sm">
                          {t("onboarding.goalSectionDescription")}
                        </Text>
                      </Stack>
                      <Button
                        leftSection={<Plus size={16} />}
                        type="button"
                        variant="default"
                        onClick={() =>
                          goalFields.append({
                            title: "",
                            goalType: "job-search",
                            targetRole: null,
                            targetCompany: null,
                            targetSeniority: null,
                            interviewDate: null,
                            focusAreas: [],
                            description: null,
                          })
                        }
                      >
                        {goalFields.fields.length === 0
                          ? t("onboarding.addFirstGoal")
                          : t("onboarding.addGoal")}
                      </Button>
                    </Group>

                    {goalFields.fields.length === 0 ? (
                      <Paper
                        bg="var(--mantine-color-default-hover)"
                        p="lg"
                        radius="md"
                        style={{ border: "1px dashed var(--mantine-color-default-border)" }}
                      >
                        <Stack gap="xs">
                          <Title order={4} size="h5">
                            {t("onboarding.emptyGoalsTitle")}
                          </Title>
                          <Text c="dimmed" size="sm">
                            {t("onboarding.emptyGoalsDescription")}
                          </Text>
                        </Stack>
                      </Paper>
                    ) : (
                      <Stack gap="lg">
                        {goalFields.fields.map((field, index) => (
                          <Paper
                            key={field.id}
                            p="lg"
                            radius="md"
                            style={{ border: "1px solid var(--mantine-color-default-border)" }}
                          >
                            <Stack gap="md">
                              <Group justify="space-between" gap="md">
                                <Title order={4} size="h5">
                                  {t("onboarding.goalCard", { index: index + 1 })}
                                </Title>
                                <Button
                                  color="red"
                                  leftSection={<Trash2 size={16} />}
                                  type="button"
                                  variant="subtle"
                                  onClick={() => goalFields.remove(index)}
                                >
                                  {t("onboarding.remove")}
                                </Button>
                              </Group>
                              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                                <TextInput
                                  label={t("onboarding.fields.goalTitle")}
                                  placeholder={t("onboarding.placeholders.goalTitle")}
                                  {...register(`goals.${index}.title`)}
                                />
                                <Select
                                  label={t("onboarding.fields.goalType")}
                                  data={[
                                    {
                                      value: "job-search",
                                      label: t("options.goalTypes.job-search"),
                                    },
                                    {
                                      value: "company-interview",
                                      label: t("options.goalTypes.company-interview"),
                                    },
                                    {
                                      value: "role-growth",
                                      label: t("options.goalTypes.role-growth"),
                                    },
                                    {
                                      value: "skill-growth",
                                      label: t("options.goalTypes.skill-growth"),
                                    },
                                    { value: "custom", label: t("options.goalTypes.custom") },
                                  ]}
                                  {...register(`goals.${index}.goalType`)}
                                />
                                <TextInput
                                  label={t("onboarding.fields.targetRole")}
                                  placeholder={t("onboarding.placeholders.targetRole")}
                                  {...register(`goals.${index}.targetRole`)}
                                />
                                <TextInput
                                  label={t("onboarding.fields.targetCompany")}
                                  placeholder={t("onboarding.placeholders.targetCompany")}
                                  {...register(`goals.${index}.targetCompany`)}
                                />
                                <Select
                                  label={t("onboarding.fields.targetSeniority")}
                                  data={[
                                    { value: "", label: t("options.empty") },
                                    { value: "intern", label: t("options.seniority.intern") },
                                    { value: "junior", label: t("options.seniority.junior") },
                                    { value: "middle", label: t("options.seniority.middle") },
                                    { value: "senior", label: t("options.seniority.senior") },
                                    { value: "staff", label: t("options.seniority.staff") },
                                    { value: "lead", label: t("options.seniority.lead") },
                                  ]}
                                  {...register(`goals.${index}.targetSeniority`)}
                                />
                                <TextInput
                                  label={t("onboarding.fields.interviewDate")}
                                  type="date"
                                  {...register(`goals.${index}.interviewDate`)}
                                />
                                <Controller
                                  control={control}
                                  name={`goals.${index}.focusAreas`}
                                  render={({ field: controllerField }) => (
                                    <TextInput
                                      label={t("onboarding.fields.focusAreas")}
                                      value={toCsv(controllerField.value)}
                                      onChange={(event) =>
                                        controllerField.onChange(
                                          fromCsv(event.target.value),
                                        )
                                      }
                                      placeholder={t("onboarding.placeholders.focusAreas")}
                                    />
                                  )}
                                />
                              </SimpleGrid>
                              <Textarea
                                autosize
                                label={t("onboarding.fields.goalDescription")}
                                minRows={2}
                                placeholder={t("onboarding.placeholders.goalDescription")}
                                {...register(`goals.${index}.description`)}
                              />
                            </Stack>
                          </Paper>
                        ))}
                      </Stack>
                    )}
                  </CardContent>
                </Card>
              ) : null}

              {currentStep === "skills" ? (
                <Card>
                  <CardContent>
                    <Group align="center" justify="space-between" gap="md" mb="md">
                      <Stack gap={4}>
                        <Title order={3} size="h4">
                          {t("onboarding.skillSectionTitle")}
                        </Title>
                        <Text c="dimmed" size="sm">
                          {t("onboarding.skillSectionDescription")}
                        </Text>
                      </Stack>
                      <Button
                        leftSection={<Plus size={16} />}
                        type="button"
                        variant="default"
                        onClick={() =>
                          skillFields.append({
                            title: "",
                            level: "unknown",
                            description: null,
                          })
                        }
                      >
                        {skillFields.fields.length === 0
                          ? t("onboarding.addFirstSkill")
                          : t("onboarding.addSkill")}
                      </Button>
                    </Group>

                    {skillFields.fields.length === 0 ? (
                      <Paper
                        bg="var(--mantine-color-default-hover)"
                        p="lg"
                        radius="md"
                        style={{ border: "1px dashed var(--mantine-color-default-border)" }}
                      >
                        <Stack gap="xs">
                          <Title order={4} size="h5">
                            {t("onboarding.emptySkillsTitle")}
                          </Title>
                          <Text c="dimmed" size="sm">
                            {t("onboarding.emptySkillsDescription")}
                          </Text>
                        </Stack>
                      </Paper>
                    ) : (
                      <Stack gap="lg">
                        {skillFields.fields.map((field, index) => (
                          <Paper
                            key={field.id}
                            p="lg"
                            radius="md"
                            style={{ border: "1px solid var(--mantine-color-default-border)" }}
                          >
                            <Stack gap="md">
                              <Group justify="space-between" gap="md">
                                <Title order={4} size="h5">
                                  {t("onboarding.skillCard", { index: index + 1 })}
                                </Title>
                                <Button
                                  color="red"
                                  leftSection={<Trash2 size={16} />}
                                  type="button"
                                  variant="subtle"
                                  onClick={() => skillFields.remove(index)}
                                >
                                  {t("onboarding.remove")}
                                </Button>
                              </Group>
                              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                                <TextInput
                                  label={t("onboarding.fields.skillTitle")}
                                  placeholder={t("onboarding.placeholders.skillTitle")}
                                  {...register(`skills.${index}.title`)}
                                />
                                <Select
                                  label={t("onboarding.fields.skillLevel")}
                                  data={[
                                    {
                                      value: "unknown",
                                      label: t("options.skillLevels.unknown"),
                                    },
                                    { value: "weak", label: t("options.skillLevels.weak") },
                                    {
                                      value: "developing",
                                      label: t("options.skillLevels.developing"),
                                    },
                                    {
                                      value: "strong",
                                      label: t("options.skillLevels.strong"),
                                    },
                                  ]}
                                  {...register(`skills.${index}.level`)}
                                />
                              </SimpleGrid>
                              <Textarea
                                autosize
                                label={t("onboarding.fields.skillDescription")}
                                minRows={2}
                                placeholder={t("onboarding.placeholders.skillDescription")}
                                {...register(`skills.${index}.description`)}
                              />
                            </Stack>
                          </Paper>
                        ))}
                      </Stack>
                    )}
                  </CardContent>
                </Card>
              ) : null}

              {currentStep === "background" ? (
                <Card>
                  <CardContent>
                    <Stack gap="lg">
                      <Stack gap={4}>
                        <Title order={3} size="h4">
                          {t("onboarding.backgroundSectionTitle")}
                        </Title>
                        <Text c="dimmed" size="sm">
                          {t("onboarding.backgroundSectionDescription")}
                        </Text>
                      </Stack>
                      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                        <Select
                          label={t("onboarding.fields.contentLanguage")}
                          data={[
                            {
                              value: "mixed",
                              label: t("options.contentLanguage.mixed"),
                            },
                            { value: "en", label: t("options.contentLanguage.en") },
                            { value: "ru", label: t("options.contentLanguage.ru") },
                          ]}
                          {...register("preferences.contentLanguage")}
                        />
                        <Select
                          label={t("onboarding.fields.studyRhythm")}
                          data={[
                            { value: "daily", label: t("options.studyRhythm.daily") },
                            {
                              value: "weekdays",
                              label: t("options.studyRhythm.weekdays"),
                            },
                            {
                              value: "weekends",
                              label: t("options.studyRhythm.weekends"),
                            },
                            {
                              value: "weekly",
                              label: t("options.studyRhythm.weekly"),
                            },
                            {
                              value: "flexible",
                              label: t("options.studyRhythm.flexible"),
                            },
                          ]}
                          {...register("preferences.studyRhythm")}
                        />
                        <Controller
                          control={control}
                          name="preferences.programmingLanguages"
                          render={({ field }) => (
                            <TextInput
                              label={t("onboarding.fields.programmingLanguages")}
                              value={toCsv(field.value)}
                              onChange={(event) =>
                                field.onChange(fromCsv(event.target.value))
                              }
                              placeholder={t("onboarding.placeholders.programmingLanguages")}
                            />
                          )}
                        />
                        <TextInput
                          label={t("onboarding.fields.resumeTitle")}
                          placeholder={t("onboarding.placeholders.resumeTitle")}
                          {...register("resume.title")}
                        />
                      </SimpleGrid>
                      <Textarea
                        autosize
                        label={t("onboarding.fields.resumeContent")}
                        minRows={8}
                        placeholder={t("onboarding.hints.resumePlaceholder")}
                        {...register("resume.content")}
                      />
                    </Stack>
                  </CardContent>
                </Card>
              ) : null}

              {currentStep === "review" ? (
                <Card>
                  <CardContent>
                    <Stack gap="lg">
                      <Stack gap={4}>
                        <Title order={3} size="h4">
                          {t("onboarding.reviewTitle")}
                        </Title>
                        <Text c="dimmed" size="sm">
                          {t("onboarding.reviewDescription")}
                        </Text>
                      </Stack>
                      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                        <ReviewItem
                          label={t("dashboard.profile")}
                          value={
                            watchedProfile.displayName ??
                            watchedProfile.targetRole ??
                            t("options.empty")
                          }
                        />
                        <ReviewItem
                          label={t("dashboard.primaryGoal")}
                          value={
                            activeGoals[0]?.title?.trim().length
                              ? activeGoals[0].title
                              : t("options.empty")
                          }
                        />
                        <ReviewItem
                          label={t("dashboard.goals")}
                          value={String(activeGoalCount)}
                        />
                        <ReviewItem
                          label={t("dashboard.skills")}
                          value={String(activeSkillCount)}
                        />
                        <ReviewItem
                          label={t("onboarding.fields.programmingLanguages")}
                          value={
                            programmingLanguages.length > 0
                              ? programmingLanguages.join(", ")
                              : t("options.empty")
                          }
                        />
                        <ReviewItem
                          label={t("dashboard.resume")}
                          value={
                            watchedResume.content.trim().length > 0
                              ? t("onboarding.reviewResumeReady")
                              : t("dashboard.noResume")
                          }
                        />
                      </SimpleGrid>
                    </Stack>
                  </CardContent>
                </Card>
              ) : null}

              {stepAlert ? (
                <Alert color="red" radius="sm" variant="light">
                  {stepAlert}
                </Alert>
              ) : null}

              {Object.keys(formState.errors).length > 0 && currentStep === "review" ? (
                <Alert color="red" radius="sm" variant="light">
                  {complete.error?.message ?? t("onboarding.checkRequired")}
                </Alert>
              ) : null}

              {complete.error || saveDraft.error ? (
                <Alert color="red" radius="sm" variant="light">
                  {complete.error?.message ?? saveDraft.error?.message}
                </Alert>
              ) : null}

              {complete.isSuccess || saveDraft.isSuccess ? (
                <Alert
                  color="green"
                  icon={<CheckCircle2 size={16} />}
                  radius="sm"
                  variant="light"
                >
                  {complete.isSuccess
                    ? t("onboarding.saved")
                    : t("onboarding.draftSaved")}
                </Alert>
              ) : null}

              <Paper
                bg="color-mix(in srgb, var(--mantine-color-body) 95%, transparent)"
                bottom={0}
                p="md"
                pos="sticky"
                radius={0}
                style={{
                  backdropFilter: "blur(12px)",
                  borderTop: "1px solid var(--mantine-color-default-border)",
                  zIndex: 10,
                }}
              >
                <Group justify="space-between" gap="sm">
                  <Button
                    disabled={stepIndex === 0 || isSaving}
                    leftSection={<ChevronLeft size={16} />}
                    type="button"
                    variant="default"
                    onClick={() => {
                      const previousStep = onboardingSteps[stepIndex - 1];

                      if (previousStep) {
                        void goToStep(previousStep);
                      }
                    }}
                  >
                    {t("onboarding.back")}
                  </Button>
                  <Group gap="sm">
                    <Button
                      color="gray"
                      disabled={isSaving}
                      leftSection={<Save size={16} />}
                      loading={saveDraft.isPending}
                      type="button"
                      variant="default"
                      onClick={() => {
                        const draft = onboardingDraftInputSchema.safeParse(getValues());

                        if (draft.success) {
                          saveDraft.mutate(draft.data);
                        }
                      }}
                    >
                      {saveDraft.isPending
                        ? t("onboarding.saving")
                        : t("onboarding.draft")}
                    </Button>
                    {currentStep === "review" ? (
                      <Button
                        disabled={isSaving}
                        leftSection={<CheckCircle2 size={16} />}
                        loading={complete.isPending}
                        type="submit"
                      >
                        {complete.isPending
                          ? t("onboarding.saving")
                          : t("onboarding.finish")}
                      </Button>
                    ) : (
                      <Button
                        disabled={isSaving}
                        leftSection={<ArrowRight size={16} />}
                        type="button"
                        onClick={() => {
                          void handleNext();
                        }}
                      >
                        {t("onboarding.continue")}
                      </Button>
                    )}
                  </Group>
                </Group>
              </Paper>
            </Stack>
          </Box>
        </SimpleGrid>
      </PageSection>
    </Container>
  );
}
