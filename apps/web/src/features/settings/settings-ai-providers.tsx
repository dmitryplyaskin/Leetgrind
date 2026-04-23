import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Container,
  Group,
  Kicker,
  PageHeader,
  PageLead,
  PageSection,
  PageTitle,
  Paper,
  Stack,
  Text
} from "@leetgrind/ui";
import { Checkbox, TextInput, ThemeIcon } from "@mantine/core";
import { Cpu, KeyRound, PlugZap } from "lucide-react";
import { trpc } from "../../shared/api/trpc";

export function AiProvidersRoute() {
  const { t } = useTranslation();
  const utils = trpc.useUtils();
  const providers = trpc.ai.providers.list.useQuery(undefined, {
    staleTime: 10_000
  });
  const save = trpc.ai.providers.save.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.ai.providers.list.invalidate(),
        utils.ai.settings.get.invalidate()
      ]);
    }
  });
  const remove = trpc.ai.providers.remove.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.ai.providers.list.invalidate(),
        utils.ai.settings.get.invalidate()
      ]);
    }
  });
  const setDefault = trpc.ai.providers.setDefault.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.ai.providers.list.invalidate(),
        utils.ai.settings.get.invalidate()
      ]);
    }
  });
  const test = trpc.ai.providers.test.useMutation();
  const [displayName, setDisplayName] = useState("OpenRouter");
  const [textModel, setTextModel] = useState("openai/gpt-4o-mini");
  const [embeddingModel, setEmbeddingModel] = useState("openai/text-embedding-3-small");
  const [apiKey, setApiKey] = useState("");
  const [isDefault, setIsDefault] = useState(true);

  return (
    <Container>
      <PageSection>
        <PageHeader>
          <Stack gap="xs" maw={760}>
            <Kicker>{t("aiProviders.kicker")}</Kicker>
            <PageTitle>{t("aiProviders.title")}</PageTitle>
            <PageLead>{t("aiProviders.subtitle")}</PageLead>
          </Stack>
          <Group gap="sm">
            <Button color="gray" component={Link} to="/settings/ai" variant="default">
              {t("aiProviders.backToSettings")}
            </Button>
          </Group>
        </PageHeader>

        {providers.error ? <Alert color="red">{t("common.loadError")}</Alert> : null}

        <Card>
          <CardHeader>
            <ThemeIcon color="teal" radius="sm" variant="light">
              <PlugZap size={18} />
            </ThemeIcon>
            <CardTitle>{t("aiProviders.openrouterCard")}</CardTitle>
          </CardHeader>
          <CardContent>
            <TextInput
              label={t("aiProviders.displayName")}
              onChange={(event) => setDisplayName(event.currentTarget.value)}
              value={displayName}
            />
            <TextInput
              label={t("aiProviders.textModel")}
              onChange={(event) => setTextModel(event.currentTarget.value)}
              value={textModel}
            />
            <TextInput
              label={t("aiProviders.embeddingModel")}
              onChange={(event) => setEmbeddingModel(event.currentTarget.value)}
              value={embeddingModel}
            />
            <TextInput
              label={t("aiProviders.apiKey")}
              onChange={(event) => setApiKey(event.currentTarget.value)}
              type="password"
              value={apiKey}
            />
            <Checkbox
              checked={isDefault}
              label={t("aiProviders.makeDefault")}
              onChange={(event) => setIsDefault(event.currentTarget.checked)}
            />
            <Button
              disabled={
                displayName.trim().length === 0 ||
                textModel.trim().length === 0 ||
                embeddingModel.trim().length === 0 ||
                apiKey.trim().length === 0
              }
              loading={save.isPending}
              onClick={() =>
                save.mutate({
                  kind: "openrouter",
                  displayName,
                  textModel,
                  embeddingModel,
                  apiKey,
                  isDefault
                })
              }
            >
              {t("aiProviders.save")}
            </Button>
          </CardContent>
        </Card>

        <Group align="stretch" grow>
          <Card>
            <CardHeader>
              <ThemeIcon color="blue" radius="sm" variant="light">
                <KeyRound size={18} />
              </ThemeIcon>
              <CardTitle>{t("aiProviders.savedProviders")}</CardTitle>
            </CardHeader>
            <CardContent>
              {providers.isLoading ? <Alert color="blue">{t("common.loading")}</Alert> : null}
              {providers.data?.length ? (
                providers.data.map((provider) => (
                  <Paper key={provider.id} bg="var(--mantine-color-default-hover)" p="md" radius="sm">
                    <Stack gap="sm">
                      <Group justify="space-between" gap="md">
                        <Stack gap={4}>
                          <Text fw={650}>{provider.displayName}</Text>
                          <Text c="dimmed" size="sm">
                            {provider.config.textModel}
                          </Text>
                        </Stack>
                        {provider.isDefault ? (
                          <Text c="teal" fw={700} size="sm">
                            {t("aiProviders.default")}
                          </Text>
                        ) : null}
                      </Group>
                      <Group gap="sm">
                        <Button
                          color="gray"
                          loading={setDefault.isPending}
                          onClick={() => setDefault.mutate({ providerId: provider.id })}
                          size="xs"
                          variant="default"
                        >
                          {t("aiProviders.setDefault")}
                        </Button>
                        <Button
                          color="gray"
                          loading={test.isPending}
                          onClick={() => test.mutate({ providerId: provider.id })}
                          size="xs"
                          variant="default"
                        >
                          {t("aiProviders.test")}
                        </Button>
                        <Button
                          color="red"
                          loading={remove.isPending}
                          onClick={() => remove.mutate({ providerId: provider.id })}
                          size="xs"
                          variant="light"
                        >
                          {t("aiProviders.remove")}
                        </Button>
                      </Group>
                    </Stack>
                  </Paper>
                ))
              ) : (
                <Text c="dimmed">{t("aiProviders.noProviders")}</Text>
              )}
              {test.data ? (
                <Alert color={test.data.status === "ok" ? "green" : "yellow"}>
                  {test.data.message}
                </Alert>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <ThemeIcon color="grape" radius="sm" variant="light">
                <Cpu size={18} />
              </ThemeIcon>
              <CardTitle>{t("aiProviders.plannedKinds")}</CardTitle>
            </CardHeader>
            <CardContent>
              {["openai-codex", "openai-api-key", "local"].map((kind) => (
                <Paper key={kind} bg="var(--mantine-color-default-hover)" p="md" radius="sm">
                  <Stack gap={4}>
                    <Text fw={650}>{t(`aiProviders.kindNames.${kind}`)}</Text>
                    <Text c="dimmed" size="sm">
                      {t("aiProviders.plannedCopy")}
                    </Text>
                  </Stack>
                </Paper>
              ))}
            </CardContent>
          </Card>
        </Group>
      </PageSection>
    </Container>
  );
}
