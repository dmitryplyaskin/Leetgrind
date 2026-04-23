import type { TFunction } from "i18next";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Circle,
  CircleDot,
  Save,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Group,
  Kicker,
  Paper,
  Stack,
  Text,
  Title,
} from "@leetgrind/ui";
import {
  onboardingSteps,
  type OnboardingStep,
} from "./onboarding-model";

export function StepNavigation({
  currentStep,
  onSelect,
  isComplete,
  t,
}: {
  currentStep: OnboardingStep;
  onSelect: (step: OnboardingStep) => void;
  isComplete: boolean;
  t: TFunction;
}) {
  return (
    <Paper className="onboarding-steps" p="lg" radius="lg">
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
              className={isActive ? "onboarding-step is-active" : "onboarding-step"}
              color={isActive ? "teal" : "gray"}
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

export function StepIntro({
  description,
  step,
  title,
  t,
}: {
  description: string | undefined;
  step: number;
  title: string | undefined;
  t: TFunction;
}) {
  return (
    <Card className="step-intro">
      <CardContent>
        <Stack gap="xs">
          <Kicker>{t("onboarding.stepLabel", { step })}</Kicker>
          <Title order={2} size="h3">
            {title}
          </Title>
          <Text c="dimmed" maw={640}>
            {description}
          </Text>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function OnboardingActionBar({
  canGoBack,
  currentStep,
  isSaving,
  isSubmitting,
  isSavingDraft,
  onBack,
  onDraft,
  onNext,
  t,
}: {
  canGoBack: boolean;
  currentStep: OnboardingStep;
  isSaving: boolean;
  isSubmitting: boolean;
  isSavingDraft: boolean;
  onBack: () => void;
  onDraft: () => void;
  onNext: () => void;
  t: TFunction;
}) {
  return (
    <Paper className="onboarding-actions" p="md" radius="md">
      <Group justify="space-between" gap="sm">
        <Button
          disabled={!canGoBack || isSaving}
          leftSection={<ChevronLeft size={16} />}
          type="button"
          variant="default"
          onClick={onBack}
        >
          {t("onboarding.back")}
        </Button>
        <Group gap="sm">
          <Button
            color="gray"
            disabled={isSaving}
            leftSection={<Save size={16} />}
            loading={isSavingDraft}
            type="button"
            variant="default"
            onClick={onDraft}
          >
            {isSavingDraft ? t("onboarding.saving") : t("onboarding.draft")}
          </Button>
          {currentStep === "review" ? (
            <Button
              disabled={isSaving}
              leftSection={<CheckCircle2 size={16} />}
              loading={isSubmitting}
              type="submit"
            >
              {isSubmitting ? t("onboarding.saving") : t("onboarding.finish")}
            </Button>
          ) : (
            <Button
              disabled={isSaving}
              leftSection={<ArrowRight size={16} />}
              type="button"
              onClick={onNext}
            >
              {t("onboarding.continue")}
            </Button>
          )}
        </Group>
      </Group>
    </Paper>
  );
}
