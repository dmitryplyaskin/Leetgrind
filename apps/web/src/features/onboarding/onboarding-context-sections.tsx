import type { TFunction } from "i18next";
import { Controller, type UseFormReturn } from "react-hook-form";
import type { OnboardingCompleteInput } from "@leetgrind/shared";
import {
  Card,
  CardContent,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@leetgrind/ui";
import {
  fieldError,
  fromCsv,
  toCsv,
  type OnboardingFormInput,
} from "./onboarding-model";

type OnboardingForm = UseFormReturn<
  OnboardingFormInput,
  unknown,
  OnboardingCompleteInput
>;

export function BackgroundStep({
  form,
  t,
}: {
  form: OnboardingForm;
  t: TFunction;
}) {
  const { control, formState, register } = form;

  return (
    <Card className="form-panel">
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
                { value: "mixed", label: t("options.contentLanguage.mixed") },
                { value: "en", label: t("options.contentLanguage.en") },
                { value: "ru", label: t("options.contentLanguage.ru") },
              ]}
              {...register("preferences.contentLanguage")}
            />
            <Select
              label={t("onboarding.fields.studyRhythm")}
              data={[
                { value: "daily", label: t("options.studyRhythm.daily") },
                { value: "weekdays", label: t("options.studyRhythm.weekdays") },
                { value: "weekends", label: t("options.studyRhythm.weekends") },
                { value: "weekly", label: t("options.studyRhythm.weekly") },
                { value: "flexible", label: t("options.studyRhythm.flexible") },
              ]}
              {...register("preferences.studyRhythm")}
            />
            <Controller
              control={control}
              name="preferences.programmingLanguages"
              render={({ field }) => (
                <TextInput
                  error={fieldError(formState.errors, "preferences.programmingLanguages")}
                  label={t("onboarding.fields.programmingLanguages")}
                  value={toCsv(field.value)}
                  onChange={(event) => field.onChange(fromCsv(event.target.value))}
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
  );
}

export function ReviewStep({
  activeGoalCount,
  activeGoals,
  activeSkillCount,
  programmingLanguages,
  t,
  watchedProfile,
  watchedResume,
}: {
  activeGoalCount: number;
  activeGoals: OnboardingFormInput["goals"];
  activeSkillCount: number;
  programmingLanguages: string[];
  t: TFunction;
  watchedProfile: OnboardingFormInput["profile"];
  watchedResume: OnboardingFormInput["resume"];
}) {
  const items = [
    {
      label: t("dashboard.profile"),
      value:
        watchedProfile.displayName ??
        watchedProfile.targetRole ??
        t("options.empty"),
    },
    {
      label: t("dashboard.primaryGoal"),
      value:
        activeGoals[0]?.title?.trim().length
          ? activeGoals[0].title
          : t("options.empty"),
    },
    {
      label: t("dashboard.goals"),
      value: String(activeGoalCount),
    },
    {
      label: t("dashboard.skills"),
      value: String(activeSkillCount),
    },
    {
      label: t("onboarding.fields.programmingLanguages"),
      value:
        programmingLanguages.length > 0
          ? programmingLanguages.join(", ")
          : t("options.empty"),
    },
    {
      label: t("dashboard.resume"),
      value:
        watchedResume.content.trim().length > 0
          ? t("onboarding.reviewResumeReady")
          : t("dashboard.noResume"),
    },
  ];

  return (
    <Card className="form-panel">
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
            {items.map((item) => (
              <Paper className="review-item" key={item.label} p="md" radius="md">
                <Stack gap={4}>
                  <Text c="dimmed" size="sm">
                    {item.label}
                  </Text>
                  <Text fw={650}>{item.value}</Text>
                </Stack>
              </Paper>
            ))}
          </SimpleGrid>
        </Stack>
      </CardContent>
    </Card>
  );
}
