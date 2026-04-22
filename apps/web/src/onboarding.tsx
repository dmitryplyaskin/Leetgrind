import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Plus, Save, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { z } from "zod";
import {
  type OnboardingCompleteInput,
  onboardingCompleteInputSchema,
} from "@leetgrind/shared";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
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
  ThemeIcon,
  Title,
} from "@leetgrind/ui";
import { i18n } from "./i18n";
import { trpc } from "./trpc";

type Locale = "ru" | "en";
type OnboardingFormInput = z.input<typeof onboardingCompleteInputSchema>;

const defaultValues: OnboardingFormInput = {
  profile: {
    displayName: null,
    targetRole: "Frontend Engineer",
    experienceLevel: "middle",
  },
  goals: [
    {
      title: "Frontend interview preparation",
      goalType: "job-search",
      targetRole: "Frontend Engineer",
      targetCompany: null,
      targetSeniority: "middle",
      interviewDate: null,
      focusAreas: ["React", "Algorithms"],
      description: null,
    },
  ],
  skills: [
    { title: "React", level: "developing", description: null },
    { title: "Algorithms", level: "weak", description: null },
    { title: "TypeScript", level: "developing", description: null },
  ],
  resume: {
    title: "Resume",
    content:
      "Paste your resume, background, or current experience summary here.",
  },
  preferences: {
    uiLocale: i18n.language === "ru" ? "ru" : "en",
    contentLanguage: "mixed",
    programmingLanguages: ["typescript"],
    studyRhythm: "daily",
    preferredAiProviderKind: "not-configured",
  },
};

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

export function OnboardingRoute() {
  const { t } = useTranslation();
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

  const form = useForm<OnboardingFormInput, unknown, OnboardingCompleteInput>({
    resolver: zodResolver(onboardingCompleteInputSchema),
    defaultValues,
  });
  const { control, formState, handleSubmit, register, reset, watch } = form;
  const goalFields = useFieldArray({ control, name: "goals" });
  const skillFields = useFieldArray({ control, name: "skills" });
  const watchedLocale = watch("preferences.uiLocale");

  useEffect(() => {
    void i18n.changeLanguage(watchedLocale);
  }, [watchedLocale]);

  useEffect(() => {
    if (!onboarding.data) {
      return;
    }

    const preferences = onboarding.data.profile.preferences;
    const uiLocale = localeOrDefault(preferences.uiLocale, watchedLocale);

    reset({
      profile: {
        displayName: onboarding.data.profile.displayName,
        targetRole: onboarding.data.profile.targetRole,
        experienceLevel: onboarding.data.profile.experienceLevel,
      },
      goals:
        onboarding.data.goals.length > 0
          ? onboarding.data.goals.map((goal) => {
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
            })
          : defaultValues.goals,
      skills:
        onboarding.data.skills.length > 0
          ? onboarding.data.skills.map((skill) => ({
              title: skill.title,
              level: skill.level,
              description: skill.description,
            }))
          : defaultValues.skills,
      resume: {
        title: onboarding.data.resumeDocument?.title ?? "Resume",
        content:
          onboarding.data.resumeDocument?.content ??
          defaultValues.resume?.content ??
          "",
      },
      preferences: {
        uiLocale,
        contentLanguage:
          preferences.contentLanguage === "ru" ||
          preferences.contentLanguage === "en" ||
          preferences.contentLanguage === "mixed"
            ? preferences.contentLanguage
            : "mixed",
        programmingLanguages:
          stringArray(preferences.programmingLanguages).length > 0
            ? stringArray(preferences.programmingLanguages)
            : defaultValues.preferences.programmingLanguages,
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
  }, [onboarding.data, reset, watchedLocale]);

  const activeGoals = watch("goals").filter(
    (goal) => goal.title.trim().length > 0,
  );
  const activeSkills = watch("skills").filter(
    (skill) => skill.title.trim().length > 0,
  );
  const programmingLanguages = watch("preferences.programmingLanguages");
  const isSaving = complete.isPending || saveDraft.isPending;

  return (
    <Container>
      <PageSection>
        <PageHeader>
          <Stack gap="xs" maw={760}>
            <Kicker>{t("app.onboarding")}</Kicker>
            <PageTitle>{t("onboarding.title")}</PageTitle>
            <PageLead>{t("onboarding.subtitle")}</PageLead>
          </Stack>
        </PageHeader>

        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
          <Card style={{ alignSelf: "start" }}>
            <CardContent>
              <Kicker c="dimmed">{t("onboarding.progress")}</Kicker>
              <Stack gap="sm">
                {[
                  ["1", t("onboarding.steps.welcome")],
                  ["2", t("onboarding.steps.goals")],
                  ["3", t("onboarding.steps.skills")],
                  ["4", t("onboarding.steps.resume")],
                  ["5", t("onboarding.steps.preferences")],
                ].map(([number, label]) => (
                  <Group key={number} gap="sm" wrap="nowrap">
                    <ThemeIcon
                      color="teal"
                      radius="sm"
                      size="md"
                      variant="light"
                    >
                      {number}
                    </ThemeIcon>
                    <Text size="sm">{label}</Text>
                  </Group>
                ))}
              </Stack>
              <Divider />
              <Kicker c="dimmed">{t("onboarding.summary")}</Kicker>
              <dl
                style={{
                  display: "grid",
                  gap: "var(--mantine-spacing-sm)",
                  margin: 0,
                }}
              >
                {[
                  [t("dashboard.goals"), activeGoals.length],
                  [t("dashboard.skills"), activeSkills.length],
                  [
                    t("onboarding.fields.programmingLanguages"),
                    programmingLanguages.join(", "),
                  ],
                ].map(([label, value]) => (
                  <Group
                    component="div"
                    key={label}
                    justify="space-between"
                    gap="md"
                  >
                    <Text c="dimmed" component="dt" size="sm">
                      {label}
                    </Text>
                    <Text component="dd" fw={700} lineClamp={1} m={0} size="sm">
                      {value}
                    </Text>
                  </Group>
                ))}
              </dl>
            </CardContent>
          </Card>

          <form
            style={{ display: "grid", gap: "var(--mantine-spacing-lg)" }}
            onSubmit={handleSubmit((values) => complete.mutate(values))}
          >
            <Card>
              <CardContent>
                <Title order={2} size="h3">
                  {t("onboarding.steps.welcome")}
                </Title>
                <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                  <TextInput
                    label={t("onboarding.fields.displayName")}
                    {...register("profile.displayName")}
                  />
                  <TextInput
                    label={t("onboarding.fields.targetRole")}
                    {...register("profile.targetRole")}
                  />
                  <Select
                    label={t("onboarding.fields.experienceLevel")}
                    data={[
                      {
                        value: "beginner",
                        label: t("options.levels.beginner"),
                      },
                      { value: "junior", label: t("options.levels.junior") },
                      { value: "middle", label: t("options.levels.middle") },
                      { value: "senior", label: t("options.levels.senior") },
                      { value: "expert", label: t("options.levels.expert") },
                    ]}
                    {...register("profile.experienceLevel")}
                  />
                </SimpleGrid>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Group align="center" justify="space-between" gap="md">
                  <Title order={2} size="h3">
                    {t("onboarding.steps.goals")}
                  </Title>
                  <Button
                    color="gray"
                    leftSection={<Plus size={16} />}
                    type="button"
                    variant="default"
                    onClick={() =>
                      goalFields.append({
                        title: "",
                        goalType: "custom",
                        targetRole: null,
                        targetCompany: null,
                        targetSeniority: null,
                        interviewDate: null,
                        focusAreas: [],
                        description: null,
                      })
                    }
                  >
                    {t("onboarding.addGoal")}
                  </Button>
                </Group>
                <Stack gap="xl">
                  {goalFields.fields.map((field, index) => (
                    <Box key={field.id}>
                      {index > 0 ? <Divider mb="lg" /> : null}
                      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                        <TextInput
                          label={t("onboarding.fields.goalTitle")}
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
                            {
                              value: "custom",
                              label: t("options.goalTypes.custom"),
                            },
                          ]}
                          {...register(`goals.${index}.goalType`)}
                        />
                        <TextInput
                          label={t("onboarding.fields.targetCompany")}
                          {...register(`goals.${index}.targetCompany`)}
                        />
                        <TextInput
                          label={t("onboarding.fields.targetRole")}
                          {...register(`goals.${index}.targetRole`)}
                        />
                        <Select
                          label={t("onboarding.fields.targetSeniority")}
                          data={[
                            { value: "", label: t("options.empty") },
                            {
                              value: "intern",
                              label: t("options.seniority.intern"),
                            },
                            {
                              value: "junior",
                              label: t("options.seniority.junior"),
                            },
                            {
                              value: "middle",
                              label: t("options.seniority.middle"),
                            },
                            {
                              value: "senior",
                              label: t("options.seniority.senior"),
                            },
                            {
                              value: "staff",
                              label: t("options.seniority.staff"),
                            },
                            {
                              value: "lead",
                              label: t("options.seniority.lead"),
                            },
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
                              placeholder={t("onboarding.hints.commaSeparated")}
                            />
                          )}
                        />
                        <TextInput
                          label={t("onboarding.fields.goalDescription")}
                          {...register(`goals.${index}.description`)}
                        />
                      </SimpleGrid>
                      {goalFields.fields.length > 1 ? (
                        <Button
                          color="red"
                          leftSection={<Trash2 size={16} />}
                          mt="md"
                          type="button"
                          variant="subtle"
                          onClick={() => goalFields.remove(index)}
                        >
                          {t("onboarding.remove")}
                        </Button>
                      ) : null}
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Group align="center" justify="space-between" gap="md">
                  <Title order={2} size="h3">
                    {t("onboarding.steps.skills")}
                  </Title>
                  <Button
                    color="gray"
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
                    {t("onboarding.addSkill")}
                  </Button>
                </Group>
                <Stack gap="lg">
                  {skillFields.fields.map((field, index) => (
                    <Box key={field.id}>
                      {index > 0 ? <Divider mb="lg" /> : null}
                      <SimpleGrid cols={{ base: 1, md: 4 }} spacing="md">
                        <TextInput
                          label={t("onboarding.fields.skillTitle")}
                          {...register(`skills.${index}.title`)}
                        />
                        <Select
                          label={t("onboarding.fields.skillLevel")}
                          data={[
                            {
                              value: "unknown",
                              label: t("options.skillLevels.unknown"),
                            },
                            {
                              value: "weak",
                              label: t("options.skillLevels.weak"),
                            },
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
                        <TextInput
                          label={t("onboarding.fields.skillDescription")}
                          {...register(`skills.${index}.description`)}
                        />
                      </SimpleGrid>
                      {skillFields.fields.length > 1 ? (
                        <Button
                          color="red"
                          leftSection={<Trash2 size={16} />}
                          mt="md"
                          type="button"
                          variant="subtle"
                          onClick={() => skillFields.remove(index)}
                        >
                          {t("onboarding.remove")}
                        </Button>
                      ) : null}
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Title order={2} size="h3">
                  {t("onboarding.steps.resume")}
                </Title>
                <Stack gap="md">
                  <TextInput
                    label={t("onboarding.fields.resumeTitle")}
                    {...register("resume.title")}
                  />
                  <Textarea
                    autosize
                    label={t("onboarding.fields.resumeContent")}
                    minRows={6}
                    {...register("resume.content")}
                  />
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Title order={2} size="h3">
                  {t("onboarding.steps.preferences")}
                </Title>
                <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                  <Select
                    label={t("onboarding.fields.uiLocale")}
                    data={[
                      { value: "en", label: "English" },
                      { value: "ru", label: "Русский" },
                    ]}
                    {...register("preferences.uiLocale")}
                  />
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
                        placeholder={t("onboarding.hints.commaSeparated")}
                      />
                    )}
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
                </SimpleGrid>
              </CardContent>
            </Card>

            {Object.keys(formState.errors).length > 0 ? (
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
              <Group justify="flex-end" gap="sm">
                <Button
                  color="gray"
                  disabled={isSaving}
                  leftSection={<Save size={16} />}
                  loading={saveDraft.isPending}
                  type="button"
                  variant="default"
                  onClick={handleSubmit((values) => saveDraft.mutate(values))}
                >
                  {isSaving && saveDraft.isPending
                    ? t("onboarding.saving")
                    : t("onboarding.draft")}
                </Button>
                <Button
                  disabled={isSaving}
                  leftSection={<Save size={16} />}
                  loading={complete.isPending}
                  type="submit"
                >
                  {complete.isPending
                    ? t("onboarding.saving")
                    : t("onboarding.save")}
                </Button>
              </Group>
            </Paper>
          </form>
        </SimpleGrid>
      </PageSection>
    </Container>
  );
}
