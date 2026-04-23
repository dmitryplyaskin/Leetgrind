import { useNavigate } from "@tanstack/react-router";
import { PasswordInput, Select, Textarea, ThemeIcon } from "@mantine/core";
import { Brain, CheckCircle2, KeyRound, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import type {
  AiSettings,
  DiscoverOpenRouterModelsResult,
  OnboardingCompleteInput,
  OnboardingNarrativeExtractionResult,
} from "@leetgrind/shared";
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Container,
  Group,
  Kicker,
  PageHeader,
  PageSection,
  Paper,
  SimpleGrid,
  Stack,
  Text,
} from "@leetgrind/ui";
import { i18n } from "../../shared/i18n/i18n";
import { trpc } from "../../shared/api/trpc";

type SetupStep = "provider" | "narrative" | "review";
const SAVED_OPENROUTER_KEY = "sk-or-************";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : null;
}

function hasReadyProvider(settings: AiSettings | undefined) {
  return Boolean(
    settings?.providers.some(
      (provider) =>
        provider.isDefault &&
        provider.kind === "openrouter" &&
        provider.hasSecret &&
        provider.isImplemented,
    ),
  );
}

export function OnboardingRoute() {
  const { t } = useTranslation();
  const navigate = useNavigate({ from: "/onboarding" });
  const utils = trpc.useUtils();
  const settings = trpc.ai.settings.get.useQuery(undefined, {
    staleTime: 10_000,
  });
  const onboarding = trpc.onboarding.getState.useQuery();
  const discover = trpc.ai.providers.discoverOpenRouterModels.useMutation();
  const saveProvider = trpc.ai.providers.save.useMutation();
  const testProvider = trpc.ai.providers.test.useMutation();
  const extract = trpc.onboarding.extractFromNarrative.useMutation();
  const complete = trpc.onboarding.complete.useMutation({
    onSuccess: async () => {
      await utils.onboarding.getState.invalidate();
      await utils.dashboard.getSummary.invalidate();
      await navigate({ to: "/dashboard", replace: true });
    },
  });
  const locale = i18n.language === "ru" ? "ru" : "en";
  const providerReady = hasReadyProvider(settings.data);
  const defaultProvider = settings.data?.providers.find((item) => item.isDefault);
  const [step, setStep] = useState<SetupStep>("provider");
  const [apiKey, setApiKey] = useState("");
  const [providerError, setProviderError] = useState<string | null>(null);
  const [didResolveInitialProviderStep, setDidResolveInitialProviderStep] =
    useState(false);
  const [discoveredModels, setDiscoveredModels] =
    useState<DiscoverOpenRouterModelsResult | null>(null);
  const [selectedTextModel, setSelectedTextModel] = useState<string | null>(null);
  const [selectedEmbeddingModel, setSelectedEmbeddingModel] = useState<string | null>(
    null,
  );
  const [experienceText, setExperienceText] = useState("");
  const [goalText, setGoalText] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [extraction, setExtraction] =
    useState<OnboardingNarrativeExtractionResult | null>(null);
  const [draft, setDraft] = useState<OnboardingCompleteInput | null>(null);
  const isDiscovering = discover.isPending;
  const isSavingProvider = saveProvider.isPending || testProvider.isPending;
  const canExtract =
    experienceText.trim().length >= 20 && goalText.trim().length >= 5;
  const initialName = onboarding.data?.profile.displayName;
  const hasExistingData =
    (onboarding.data?.goals.length ?? 0) > 0 ||
    (onboarding.data?.skills.length ?? 0) > 0;

  useEffect(() => {
    if (settings.isLoading || didResolveInitialProviderStep) {
      return;
    }

    if (providerReady && step === "provider") {
      setStep("narrative");
    }

    setDidResolveInitialProviderStep(true);
  }, [didResolveInitialProviderStep, providerReady, settings.isLoading, step]);

  useEffect(() => {
    if (!settings.data || apiKey.trim().length > 0) {
      return;
    }

    const provider = settings.data.providers.find((item) => item.isDefault);

    if (!provider) {
      return;
    }

    if (provider.hasSecret) {
      setApiKey(SAVED_OPENROUTER_KEY);
    }

    setSelectedTextModel(provider.config.textModel);
    setSelectedEmbeddingModel(provider.config.embeddingModel ?? null);
  }, [apiKey, settings.data]);

  useEffect(() => {
    if (!onboarding.data || experienceText.trim().length > 0) {
      return;
    }

    const skills = onboarding.data.skills
      .map((skill) =>
        [skill.title, skill.level ? `(${skill.level})` : null, skill.description]
          .filter(Boolean)
          .join(" "),
      )
      .join("\n");
    const role = onboarding.data.profile.targetRole;
    const experience = onboarding.data.profile.experienceLevel;

    if (role || experience || skills) {
      setExperienceText(
        [
          role ? `${t("onboardingAi.prefillRole")}: ${role}` : null,
          experience ? `${t("onboardingAi.prefillExperience")}: ${experience}` : null,
          skills ? `${t("onboardingAi.prefillSkills")}:\n${skills}` : null,
        ]
          .filter(Boolean)
          .join("\n"),
      );
    }
  }, [experienceText, onboarding.data, t]);

  useEffect(() => {
    if (!onboarding.data || goalText.trim().length > 0) {
      return;
    }

    const goals = onboarding.data.goals
      .map((goal) => {
        const focusAreas = Array.isArray(goal.metadata.focusAreas)
          ? goal.metadata.focusAreas.join(", ")
          : "";

        return [
          goal.title,
          goal.targetRole ? `${t("onboardingAi.prefillGoalRole")}: ${goal.targetRole}` : null,
          focusAreas ? `${t("onboardingAi.prefillFocus")}: ${focusAreas}` : null,
          goal.description,
        ]
          .filter(Boolean)
          .join("\n");
      })
      .join("\n\n");

    if (goals.trim().length > 0) {
      setGoalText(goals);
    }
  }, [goalText, onboarding.data, t]);

  useEffect(() => {
    if (!onboarding.data || resumeText.trim().length > 0) {
      return;
    }

    const resume =
      onboarding.data.resumeDocument?.content ??
      onboarding.data.profile.resumeText ??
      "";

    if (resume.trim().length > 0) {
      setResumeText(resume);
    }
  }, [onboarding.data, resumeText]);

  const providerStatus = useMemo(() => {
    if (!settings.data?.providers.length) {
      return t("onboardingAi.provider.statusMissing");
    }

    const provider = settings.data.providers.find((item) => item.isDefault);

    return provider
      ? t("onboardingAi.provider.statusReady", {
          model: provider.config.textModel,
        })
      : t("onboardingAi.provider.statusMissing");
  }, [settings.data?.providers, t]);

  const connectOpenRouter = async () => {
    setProviderError(null);

    try {
      const discovered = await discover.mutateAsync(
        apiKey === SAVED_OPENROUTER_KEY && defaultProvider?.id
          ? { providerId: defaultProvider.id }
          : { apiKey },
      );
      setDiscoveredModels(discovered);
      setSelectedTextModel((current) => current ?? discovered.recommendedTextModel);
      setSelectedEmbeddingModel(
        (current) => current ?? discovered.recommendedEmbeddingModel,
      );
    } catch (error) {
      setProviderError(errorMessage(error) ?? t("onboardingAi.provider.discoveryFailed"));
    }
  };

  const saveOpenRouterProvider = async () => {
    if (!selectedTextModel) {
      setProviderError(t("onboardingAi.provider.pickTextModel"));
      return;
    }
    const normalizedApiKey = apiKey.trim();
    const isExistingMaskedKey = normalizedApiKey === SAVED_OPENROUTER_KEY;

    setProviderError(null);

    try {
      const saved = await saveProvider.mutateAsync({
        id: isExistingMaskedKey ? defaultProvider?.id : undefined,
        kind: "openrouter",
        displayName: "OpenRouter",
        textModel: selectedTextModel,
        embeddingModel: selectedEmbeddingModel,
        apiKey: isExistingMaskedKey ? undefined : apiKey,
        isDefault: true,
      });
      const health = await testProvider.mutateAsync({ providerId: saved.id });

      if (health.status !== "ok") {
        setProviderError(health.message ?? t("onboardingAi.provider.testFailed"));
        return;
      }

      await Promise.all([
        utils.ai.providers.list.invalidate(),
        utils.ai.settings.get.invalidate(),
      ]);
      setStep("narrative");
    } catch (error) {
      setProviderError(errorMessage(error) ?? t("onboardingAi.provider.testFailed"));
    }
  };

  const extractProfile = async () => {
    const result = await extract.mutateAsync({
      experienceText,
      goalText,
      resumeText: resumeText.trim() || undefined,
      locale,
    });

    setExtraction(result);
    setDraft(result.draft);
    setStep("review");
  };

  return (
    <Container size="xl">
      <PageSection className="onboarding-ai-page">
        <PageHeader className="onboarding-ai-header">
          <Kicker>{t("onboardingAi.kicker")}</Kicker>
          {hasExistingData ? (
            <Badge variant="info">{t("onboardingAi.existingData")}</Badge>
          ) : null}
        </PageHeader>

        <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="lg">
          <Paper className="onboarding-ai-rail" p="lg" radius="lg">
            <Stack gap="lg">
              <SetupStepItem
                active={step === "provider"}
                complete={providerReady}
                icon={<KeyRound size={18} />}
                label={t("onboardingAi.steps.provider")}
              />
              <SetupStepItem
                active={step === "narrative"}
                complete={Boolean(extraction)}
                icon={<Brain size={18} />}
                label={t("onboardingAi.steps.narrative")}
              />
              <SetupStepItem
                active={step === "review"}
                complete={complete.isSuccess}
                icon={<CheckCircle2 size={18} />}
                label={t("onboardingAi.steps.review")}
              />
              <Box className="onboarding-ai-rail__note">
                <Text fw={700}>{t("onboardingAi.provider.current")}</Text>
                <Text c="dimmed" size="sm">
                  {providerStatus}
                </Text>
              </Box>
            </Stack>
          </Paper>

          <Box className="onboarding-ai-workspace">
            {step === "provider" ? (
              <ProviderSetup
                apiKey={apiKey}
                canUseSavedKey={Boolean(defaultProvider?.hasSecret)}
                discoveredModels={discoveredModels}
                existingTextModel={defaultProvider?.config.textModel ?? null}
                existingEmbeddingModel={
                  defaultProvider?.config.embeddingModel ?? null
                }
                error={providerError}
                isDiscovering={isDiscovering}
                isSavingProvider={isSavingProvider}
                onApiKeyChange={setApiKey}
                onConnect={() => void connectOpenRouter()}
                onEmbeddingModelChange={setSelectedEmbeddingModel}
                onSaveProvider={() => void saveOpenRouterProvider()}
                onTextModelChange={setSelectedTextModel}
                selectedEmbeddingModel={selectedEmbeddingModel}
                selectedTextModel={selectedTextModel}
                t={t}
              />
            ) : null}

            {step === "narrative" ? (
              <NarrativeSetup
                canExtract={canExtract}
                error={errorMessage(extract.error)}
                experienceText={experienceText}
                goalText={goalText}
                isExtracting={extract.isPending}
                onBackToProvider={() => setStep("provider")}
                onExperienceChange={setExperienceText}
                onExtract={() => void extractProfile()}
                onGoalChange={setGoalText}
                onResumeChange={setResumeText}
                resumeText={resumeText}
                t={t}
              />
            ) : null}

            {step === "review" && draft && extraction ? (
              <ExtractionReview
                draft={draft}
                error={errorMessage(complete.error)}
                extraction={extraction}
                isSaving={complete.isPending}
                onBack={() => setStep("narrative")}
                onSave={() => complete.mutate(draft)}
                t={t}
              />
            ) : null}
          </Box>
        </SimpleGrid>
      </PageSection>
    </Container>
  );
}

function SetupStepItem({
  active,
  complete,
  icon,
  label,
}: {
  active: boolean;
  complete: boolean;
  icon: ReactNode;
  label: string;
}) {
  return (
    <Group
      className={
        active
          ? "onboarding-ai-step onboarding-ai-step--active"
          : "onboarding-ai-step"
      }
      gap="sm"
      wrap="nowrap"
    >
      <ThemeIcon
        color={complete ? "green" : active ? "teal" : "gray"}
        radius="sm"
        variant={active || complete ? "light" : "default"}
      >
        {icon}
      </ThemeIcon>
      <Text fw={700}>{label}</Text>
    </Group>
  );
}

function ProviderSetup({
  apiKey,
  canUseSavedKey,
  discoveredModels,
  existingEmbeddingModel,
  existingTextModel,
  error,
  isDiscovering,
  isSavingProvider,
  onApiKeyChange,
  onConnect,
  onEmbeddingModelChange,
  onSaveProvider,
  onTextModelChange,
  selectedEmbeddingModel,
  selectedTextModel,
  t,
}: {
  apiKey: string;
  canUseSavedKey: boolean;
  discoveredModels: DiscoverOpenRouterModelsResult | null;
  existingEmbeddingModel: string | null;
  existingTextModel: string | null;
  error: string | null;
  isDiscovering: boolean;
  isSavingProvider: boolean;
  onApiKeyChange: (value: string) => void;
  onConnect: () => void;
  onEmbeddingModelChange: (value: string | null) => void;
  onSaveProvider: () => void;
  onTextModelChange: (value: string | null) => void;
  selectedEmbeddingModel: string | null;
  selectedTextModel: string | null;
  t: TFunction;
}) {
  const textModelOptions =
    discoveredModels?.textModels.map((model) => ({
      value: model.id,
      label: model.displayName === model.id ? model.id : `${model.displayName} · ${model.id}`,
    })) ??
    (existingTextModel
      ? [
          {
            value: existingTextModel,
            label: existingTextModel,
          },
        ]
      : []);
  const embeddingModelOptions =
    discoveredModels?.embeddingModels.map((model) => ({
      value: model.id,
      label: model.displayName === model.id ? model.id : `${model.displayName} · ${model.id}`,
    })) ??
    (existingEmbeddingModel
      ? [
          {
            value: existingEmbeddingModel,
            label: existingEmbeddingModel,
          },
        ]
      : []);
  const hasModelSelection = textModelOptions.length > 0 || embeddingModelOptions.length > 0;

  return (
    <Card>
      <CardHeader>
        <ThemeIcon color="teal" radius="sm" variant="light">
          <Sparkles size={18} />
        </ThemeIcon>
        <CardTitle>{t("onboardingAi.provider.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <PasswordInput
          label={t("onboardingAi.provider.apiKey")}
          onChange={(event) => onApiKeyChange(event.currentTarget.value)}
          placeholder={t("onboardingAi.provider.apiKeyPlaceholder")}
          value={apiKey}
        />
        {apiKey === SAVED_OPENROUTER_KEY && canUseSavedKey ? (
          <Text c="dimmed" size="sm">
            {t("onboardingAi.provider.savedKey")}
          </Text>
        ) : null}
        {hasModelSelection ? (
          <Paper className="onboarding-ai-review-block" p="md" radius="md">
            <Stack gap="md">
              <Stack gap={4}>
                <Text fw={750}>{t("onboardingAi.provider.modelTitle")}</Text>
                {discoveredModels ? (
                  <Text c="dimmed" size="sm">
                    {t("onboardingAi.provider.modelCopy", {
                      textCount: discoveredModels.textModels.length,
                      embeddingCount: discoveredModels.embeddingModels.length,
                    })}
                  </Text>
                ) : null}
              </Stack>
              <Select
                data={textModelOptions}
                label={t("onboardingAi.provider.textModel")}
                onChange={onTextModelChange}
                searchable
                value={selectedTextModel}
              />
              <Select
                clearable
                data={embeddingModelOptions}
                label={t("onboardingAi.provider.embeddingModel")}
                onChange={onEmbeddingModelChange}
                searchable
                value={selectedEmbeddingModel}
              />
            </Stack>
          </Paper>
        ) : null}
        {error ? (
          <Alert color="red" radius="sm" variant="light">
            {error}
          </Alert>
        ) : null}
        <Group justify="flex-end">
          {hasModelSelection ? (
            <>
              <Button
                color="gray"
                disabled={apiKey.trim().length === 0}
                loading={isDiscovering}
                onClick={onConnect}
                variant="default"
              >
                {discoveredModels
                  ? t("onboardingAi.provider.reloadModels")
                  : t("onboardingAi.provider.loadModels")}
              </Button>
              <Button
                disabled={!selectedTextModel || apiKey.trim().length === 0}
                loading={isSavingProvider}
                onClick={onSaveProvider}
              >
                {t("onboardingAi.provider.saveAndContinue")}
              </Button>
            </>
          ) : (
            <Button
              disabled={apiKey.trim().length === 0}
              loading={isDiscovering}
              onClick={onConnect}
            >
              {t("onboardingAi.provider.connect")}
            </Button>
          )}
        </Group>
      </CardContent>
    </Card>
  );
}

function NarrativeSetup({
  canExtract,
  error,
  experienceText,
  goalText,
  isExtracting,
  onBackToProvider,
  onExperienceChange,
  onExtract,
  onGoalChange,
  onResumeChange,
  resumeText,
  t,
}: {
  canExtract: boolean;
  error: string | null;
  experienceText: string;
  goalText: string;
  isExtracting: boolean;
  onBackToProvider: () => void;
  onExperienceChange: (value: string) => void;
  onExtract: () => void;
  onGoalChange: (value: string) => void;
  onResumeChange: (value: string) => void;
  resumeText: string;
  t: TFunction;
}) {
  return (
    <Card>
      <CardHeader>
        <ThemeIcon color="teal" radius="sm" variant="light">
          <Brain size={18} />
        </ThemeIcon>
        <CardTitle>{t("onboardingAi.narrative.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          autosize
          label={t("onboardingAi.narrative.experience")}
          minRows={8}
          onChange={(event) => onExperienceChange(event.currentTarget.value)}
          placeholder={t("onboardingAi.narrative.experiencePlaceholder")}
          value={experienceText}
        />
        <Textarea
          autosize
          label={t("onboardingAi.narrative.goal")}
          minRows={4}
          onChange={(event) => onGoalChange(event.currentTarget.value)}
          placeholder={t("onboardingAi.narrative.goalPlaceholder")}
          value={goalText}
        />
        <Textarea
          autosize
          label={t("onboardingAi.narrative.resume")}
          minRows={5}
          onChange={(event) => onResumeChange(event.currentTarget.value)}
          placeholder={t("onboardingAi.narrative.resumePlaceholder")}
          value={resumeText}
        />
        {error ? (
          <Alert color="red" radius="sm" variant="light">
            {error}
          </Alert>
        ) : null}
        <Group justify="space-between">
          <Button color="gray" onClick={onBackToProvider} variant="default">
            {t("onboardingAi.provider.change")}
          </Button>
          <Button disabled={!canExtract} loading={isExtracting} onClick={onExtract}>
            {t("onboardingAi.narrative.extract")}
          </Button>
        </Group>
      </CardContent>
    </Card>
  );
}

function ExtractionReview({
  draft,
  error,
  extraction,
  isSaving,
  onBack,
  onSave,
  t,
}: {
  draft: OnboardingCompleteInput;
  error: string | null;
  extraction: OnboardingNarrativeExtractionResult;
  isSaving: boolean;
  onBack: () => void;
  onSave: () => void;
  t: TFunction;
}) {
  const programmingLanguages =
    draft.preferences.programmingLanguages.length > 0
      ? draft.preferences.programmingLanguages.join(", ")
      : t("options.empty");

  return (
    <Stack gap="lg">
      <Card>
        <CardHeader>
          <ThemeIcon color="green" radius="sm" variant="light">
            <CheckCircle2 size={18} />
          </ThemeIcon>
          <CardTitle>{t("onboardingAi.review.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Text className="onboarding-ai-review-summary">{extraction.summary}</Text>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            <ReviewSection title={t("onboardingAi.review.profile")}>
              <ReviewField
                label={t("onboarding.fields.displayName")}
                value={draft.profile.displayName ?? t("options.empty")}
              />
              <ReviewField
                label={t("onboarding.fields.targetRole")}
                value={draft.profile.targetRole ?? t("options.empty")}
              />
              <ReviewField
                label={t("onboarding.fields.experienceLevel")}
                value={
                  draft.profile.experienceLevel
                    ? t(`options.levels.${draft.profile.experienceLevel}`)
                    : t("options.empty")
                }
              />
            </ReviewSection>
            <ReviewSection title={t("onboardingAi.review.preferences")}>
              <ReviewField
                label={t("onboarding.fields.contentLanguage")}
                value={t(`options.contentLanguage.${draft.preferences.contentLanguage}`)}
              />
              <ReviewField
                label={t("onboarding.fields.studyRhythm")}
                value={t(`options.studyRhythm.${draft.preferences.studyRhythm}`)}
              />
              <ReviewField
                label={t("onboarding.fields.programmingLanguages")}
                value={programmingLanguages}
              />
            </ReviewSection>
          </SimpleGrid>
        </CardContent>
      </Card>

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        <ReviewSection title={t("onboardingAi.review.goals")}>
          <Stack gap="sm">
            {draft.goals.map((goal) => (
              <Box key={goal.title} className="onboarding-ai-review-item">
                <Text fw={750}>{goal.title}</Text>
                <Text c="dimmed" size="sm">
                  {[
                    goal.targetRole,
                    goal.targetCompany,
                    goal.targetSeniority
                      ? t(`options.seniority.${goal.targetSeniority}`)
                      : null,
                    goal.focusAreas.length > 0 ? goal.focusAreas.join(", ") : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>
                {goal.description ? (
                  <Text size="sm">{goal.description}</Text>
                ) : null}
              </Box>
            ))}
          </Stack>
        </ReviewSection>
        <ReviewSection title={t("onboardingAi.review.skills")}>
          <Stack gap="sm">
            {draft.skills.map((skill) => (
              <Box key={skill.title} className="onboarding-ai-review-item">
                <Group justify="space-between" gap="md">
                  <Text fw={750}>{skill.title}</Text>
                  <Text c="dimmed" size="sm">
                    {t(`options.skillLevels.${skill.level}`)}
                  </Text>
                </Group>
                {skill.description ? (
                  <Text size="sm">{skill.description}</Text>
                ) : null}
              </Box>
            ))}
          </Stack>
        </ReviewSection>
      </SimpleGrid>

      {extraction.assumptions.length > 0 ? (
        <ReviewTextList
          title={t("onboardingAi.review.assumptions")}
          values={extraction.assumptions}
        />
      ) : null}

      {extraction.suggestedFirstActions.length > 0 ? (
        <ReviewTextList
          title={t("onboardingAi.review.firstActions")}
          values={extraction.suggestedFirstActions}
        />
      ) : null}

      {error ? (
        <Alert color="red" radius="sm" variant="light">
          {error}
        </Alert>
      ) : null}

      <Group justify="space-between">
        <Button color="gray" onClick={onBack} variant="default">
          {t("onboardingAi.review.back")}
        </Button>
        <Button loading={isSaving} onClick={onSave}>
          {t("onboardingAi.review.save")}
        </Button>
      </Group>
    </Stack>
  );
}

function ReviewSection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <Paper className="onboarding-ai-review-block" p="md" radius="md">
      <Stack gap="sm">
        <Text fw={750}>{title}</Text>
        {children}
      </Stack>
    </Paper>
  );
}

function ReviewField({ label, value }: { label: string; value: string }) {
  return (
    <Group className="onboarding-ai-review-field" justify="space-between" gap="md">
      <Text c="dimmed" size="sm">
        {label}
      </Text>
      <Text fw={650} ta="right">
        {value}
      </Text>
    </Group>
  );
}

function ReviewTextList({ title, values }: { title: string; values: string[] }) {
  return (
    <ReviewSection title={title}>
      <Stack gap="xs">
        {values.map((value) => (
          <Text key={value} className="onboarding-ai-review-list-item" size="sm">
            {value}
          </Text>
        ))}
      </Stack>
    </ReviewSection>
  );
}
