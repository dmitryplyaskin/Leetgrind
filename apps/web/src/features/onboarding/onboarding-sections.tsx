import { Controller, type FieldErrors, type UseFormReturn } from "react-hook-form";
import type { UseFieldArrayReturn } from "react-hook-form";
import type { TFunction } from "i18next";
import type { OnboardingCompleteInput } from "@leetgrind/shared";
import {
  Plus,
  Trash2,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Group,
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
type GoalFields = UseFieldArrayReturn<OnboardingFormInput, "goals">;
type SkillFields = UseFieldArrayReturn<OnboardingFormInput, "skills">;

function EmptyPanel({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Paper className="onboarding-empty" p="lg" radius="md">
      <Stack gap="xs">
        <Title order={4} size="h5">
          {title}
        </Title>
        <Text c="dimmed" size="sm">
          {description}
        </Text>
      </Stack>
    </Paper>
  );
}

function FieldErrorText({
  errors,
  path,
}: {
  errors: FieldErrors<OnboardingFormInput>;
  path: string;
}) {
  const message = fieldError(errors, path);

  return message ? (
    <Text c="red" size="xs">
      {message}
    </Text>
  ) : null;
}

export function ProfileStep({
  form,
  t,
}: {
  form: OnboardingForm;
  t: TFunction;
}) {
  const { formState, register } = form;

  return (
    <Card className="form-panel">
      <CardContent>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          <TextInput
            error={fieldError(formState.errors, "profile.displayName")}
            label={t("onboarding.fields.displayName")}
            placeholder={t("onboarding.placeholders.displayName")}
            {...register("profile.displayName")}
          />
          <TextInput
            error={fieldError(formState.errors, "profile.targetRole")}
            label={t("onboarding.fields.targetRole")}
            placeholder={t("onboarding.placeholders.targetRole")}
            {...register("profile.targetRole")}
          />
          <Select
            error={fieldError(formState.errors, "profile.experienceLevel")}
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
  );
}

export function GoalsStep({
  form,
  goalFields,
  t,
}: {
  form: OnboardingForm;
  goalFields: GoalFields;
  t: TFunction;
}) {
  const { control, formState, register } = form;

  return (
    <Card className="form-panel">
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
          <EmptyPanel
            title={t("onboarding.emptyGoalsTitle")}
            description={t("onboarding.emptyGoalsDescription")}
          />
        ) : (
          <Stack gap="md">
            {goalFields.fields.map((field, index) => (
              <Paper className="form-row-panel" key={field.id} p="lg" radius="md">
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
                      error={fieldError(formState.errors, `goals.${index}.title`)}
                      label={t("onboarding.fields.goalTitle")}
                      placeholder={t("onboarding.placeholders.goalTitle")}
                      {...register(`goals.${index}.title`)}
                    />
                    <Select
                      label={t("onboarding.fields.goalType")}
                      data={[
                        { value: "job-search", label: t("options.goalTypes.job-search") },
                        {
                          value: "company-interview",
                          label: t("options.goalTypes.company-interview"),
                        },
                        { value: "role-growth", label: t("options.goalTypes.role-growth") },
                        { value: "skill-growth", label: t("options.goalTypes.skill-growth") },
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
                            controllerField.onChange(fromCsv(event.target.value))
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
        <FieldErrorText errors={formState.errors} path="goals" />
      </CardContent>
    </Card>
  );
}

export function SkillsStep({
  form,
  skillFields,
  t,
}: {
  form: OnboardingForm;
  skillFields: SkillFields;
  t: TFunction;
}) {
  const { formState, register } = form;

  return (
    <Card className="form-panel">
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
          <EmptyPanel
            title={t("onboarding.emptySkillsTitle")}
            description={t("onboarding.emptySkillsDescription")}
          />
        ) : (
          <Stack gap="md">
            {skillFields.fields.map((field, index) => (
              <Paper className="form-row-panel" key={field.id} p="lg" radius="md">
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
                      error={fieldError(formState.errors, `skills.${index}.title`)}
                      label={t("onboarding.fields.skillTitle")}
                      placeholder={t("onboarding.placeholders.skillTitle")}
                      {...register(`skills.${index}.title`)}
                    />
                    <Select
                      label={t("onboarding.fields.skillLevel")}
                      data={[
                        { value: "unknown", label: t("options.skillLevels.unknown") },
                        { value: "weak", label: t("options.skillLevels.weak") },
                        { value: "developing", label: t("options.skillLevels.developing") },
                        { value: "strong", label: t("options.skillLevels.strong") },
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
        <FieldErrorText errors={formState.errors} path="skills" />
      </CardContent>
    </Card>
  );
}
