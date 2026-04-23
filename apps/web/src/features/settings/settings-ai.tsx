import { useEffect, useMemo, useState } from "react";
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
import { Badge, TextInput, Textarea, ThemeIcon } from "@mantine/core";
import { Bot, DatabaseZap, Search, Settings2, Sparkles } from "lucide-react";
import { trpc } from "../../shared/api/trpc";

function runTone(status: string) {
  if (status === "succeeded") return "success";
  if (status === "failed") return "warning";
  return "neutral";
}

export function AiSettingsRoute() {
  const { i18n, t } = useTranslation();
  const utils = trpc.useUtils();
  const settings = trpc.ai.settings.get.useQuery(undefined, {
    staleTime: 10_000
  });
  const recentRuns = trpc.agents.listRecentRuns.useQuery(
    { limit: 8 },
    {
      staleTime: 10_000
    }
  );
  const documents = trpc.documents.list.useQuery(undefined, {
    staleTime: 10_000
  });
  const providerTest = trpc.ai.providers.test.useMutation();
  const preview = trpc.agents.runPreview.useMutation();
  const ingest = trpc.rag.documents.ingest.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.documents.list.invalidate(),
        utils.agents.listRecentRuns.invalidate()
      ]);
    }
  });
  const [defaultHealthRequested, setDefaultHealthRequested] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteSource, setNoteSource] = useState("manual");
  const [noteContent, setNoteContent] = useState("");
  const [previewPrompt, setPreviewPrompt] = useState("");
  const search = trpc.rag.documents.search.useQuery(
    {
      query: submittedQuery ?? "",
      limit: 6,
      domain: "content"
    },
    {
      enabled: submittedQuery !== null && submittedQuery.trim().length > 0,
      staleTime: 0
    }
  );
  const defaultProvider = settings.data?.providers.find((provider) => provider.isDefault) ?? null;
  const defaultHealth = providerTest.data;
  const canSearch = Boolean(defaultProvider?.hasSecret && defaultProvider?.capabilities.embeddings);
  const providerStatusLabel = useMemo(() => {
    if (!defaultProvider) {
      return t("aiSettings.status.notConfigured");
    }

    if (providerTest.isPending) {
      return t("aiSettings.status.checking");
    }

    if (defaultHealth?.status === "ok") {
      return t("aiSettings.status.connected");
    }

    if (defaultHealth?.status === "error") {
      return t("aiSettings.status.error");
    }

    return t("aiSettings.status.idle");
  }, [defaultHealth?.status, defaultProvider, providerTest.isPending, t]);

  useEffect(() => {
    if (defaultProvider && defaultHealthRequested !== defaultProvider.id && !providerTest.isPending) {
      providerTest.mutate({ providerId: defaultProvider.id });
      setDefaultHealthRequested(defaultProvider.id);
    }
  }, [defaultHealthRequested, defaultProvider, providerTest]);

  return (
    <Container>
      <PageSection>
        <PageHeader>
          <Stack gap="xs" maw={760}>
            <Kicker>{t("aiSettings.kicker")}</Kicker>
            <PageTitle>{t("aiSettings.title")}</PageTitle>
            <PageLead>{t("aiSettings.subtitle")}</PageLead>
          </Stack>
          <Group gap="sm">
            <Button color="gray" component={Link} to="/settings/ai/providers" variant="default">
              {t("aiSettings.manageProviders")}
            </Button>
          </Group>
        </PageHeader>

        {settings.isLoading ? <Alert color="blue">{t("common.loading")}</Alert> : null}
        {settings.error ? <Alert color="red">{t("common.loadError")}</Alert> : null}

        <Group align="stretch" grow>
          <Card>
            <CardHeader>
              <ThemeIcon color="teal" radius="sm" variant="light">
                <Settings2 size={18} />
              </ThemeIcon>
              <CardTitle>{t("aiSettings.providerCard")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Text fw={700} size="lg">
                {defaultProvider?.displayName ?? t("aiSettings.noProvider")}
              </Text>
              <Text c="dimmed" size="sm">
                {defaultProvider?.config.textModel ?? t("aiSettings.noModel")}
              </Text>
              <Group gap="xs">
                <Badge color={defaultHealth?.status === "ok" ? "green" : "gray"} variant="light">
                  {providerStatusLabel}
                </Badge>
                {defaultProvider?.config.embeddingModel ? (
                  <Badge color="blue" variant="light">
                    {t("aiSettings.embeddingsReady")}
                  </Badge>
                ) : null}
              </Group>
              {defaultHealth?.message ? (
                <Text c="dimmed" size="sm">
                  {defaultHealth.message}
                </Text>
              ) : null}
              {defaultProvider ? (
                <Button
                  color="gray"
                  loading={providerTest.isPending}
                  onClick={() => providerTest.mutate({ providerId: defaultProvider.id })}
                  variant="default"
                >
                  {t("aiSettings.checkConnection")}
                </Button>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <ThemeIcon color="blue" radius="sm" variant="light">
                <Bot size={18} />
              </ThemeIcon>
              <CardTitle>{t("aiSettings.previewCard")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                autosize
                label={t("aiSettings.previewPrompt")}
                minRows={4}
                onChange={(event) => setPreviewPrompt(event.currentTarget.value)}
                placeholder={t("aiSettings.previewPlaceholder")}
                value={previewPrompt}
              />
              <Button
                disabled={!defaultProvider || previewPrompt.trim().length === 0}
                loading={preview.isPending}
                onClick={() =>
                  preview.mutate({
                    prompt: previewPrompt,
                    locale: i18n.language === "ru" ? "ru" : "en",
                    includeContext: true,
                    limit: 4
                  })
                }
              >
                {t("aiSettings.runPreview")}
              </Button>
              {preview.data ? (
                <Paper bg="var(--mantine-color-default-hover)" p="md" radius="sm">
                  <Stack gap="xs">
                    <Text fw={650}>{preview.data.summary}</Text>
                    <Text size="sm">{preview.data.response}</Text>
                  </Stack>
                </Paper>
              ) : null}
            </CardContent>
          </Card>
        </Group>

        <Card>
          <CardHeader>
            <ThemeIcon color="indigo" radius="sm" variant="light">
              <DatabaseZap size={18} />
            </ThemeIcon>
            <CardTitle>{t("aiSettings.ingestCard")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Group align="flex-start" grow>
              <Stack gap="md" style={{ flex: 1 }}>
                <TextInput
                  label={t("aiSettings.noteTitle")}
                  onChange={(event) => setNoteTitle(event.currentTarget.value)}
                  value={noteTitle}
                />
                <TextInput
                  label={t("aiSettings.noteSource")}
                  onChange={(event) => setNoteSource(event.currentTarget.value)}
                  value={noteSource}
                />
                <Textarea
                  autosize
                  label={t("aiSettings.noteContent")}
                  minRows={6}
                  onChange={(event) => setNoteContent(event.currentTarget.value)}
                  value={noteContent}
                />
                <Button
                  disabled={!defaultProvider || noteTitle.trim().length === 0 || noteContent.trim().length === 0}
                  loading={ingest.isPending}
                  onClick={() =>
                    ingest.mutate({
                      title: noteTitle,
                      sourceType: "note",
                      source: noteSource,
                      contentType: "text/plain",
                      content: noteContent
                    })
                  }
                >
                  {t("aiSettings.ingestDocument")}
                </Button>
              </Stack>

              <Stack gap="sm" style={{ flex: 1 }}>
                <Text fw={650}>{t("aiSettings.existingDocuments")}</Text>
                {documents.data?.length ? (
                  documents.data.map((document) => (
                    <Paper key={document.id} bg="var(--mantine-color-default-hover)" p="md" radius="sm">
                      <Group justify="space-between" gap="md">
                        <Stack gap={4}>
                          <Text fw={650}>{document.title}</Text>
                          <Text c="dimmed" size="sm">
                            {document.sourceType}
                          </Text>
                        </Stack>
                        <Button
                          color="gray"
                          loading={ingest.isPending}
                          onClick={() => ingest.mutate({ documentId: document.id })}
                          size="xs"
                          variant="default"
                        >
                          {t("aiSettings.ingestExisting")}
                        </Button>
                      </Group>
                    </Paper>
                  ))
                ) : (
                  <Text c="dimmed">{t("aiSettings.noDocuments")}</Text>
                )}
              </Stack>
            </Group>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <ThemeIcon color="cyan" radius="sm" variant="light">
              <Search size={18} />
            </ThemeIcon>
            <CardTitle>{t("aiSettings.searchCard")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Group align="flex-end" grow>
              <TextInput
                label={t("aiSettings.searchPrompt")}
                onChange={(event) => setSearchInput(event.currentTarget.value)}
                placeholder={t("aiSettings.searchPlaceholder")}
                value={searchInput}
              />
              <Button
                disabled={!canSearch || searchInput.trim().length === 0}
                onClick={() => setSubmittedQuery(searchInput)}
              >
                {t("aiSettings.search")}
              </Button>
            </Group>
            {!canSearch ? <Text c="dimmed">{t("aiSettings.searchHint")}</Text> : null}
            {search.isFetching ? <Alert color="blue">{t("common.loading")}</Alert> : null}
            {search.data?.length ? (
              search.data.map((item) => (
                <Paper key={item.chunkId} bg="var(--mantine-color-default-hover)" p="md" radius="sm">
                  <Stack gap={4}>
                    <Group justify="space-between" gap="md">
                      <Text fw={650}>{item.title}</Text>
                      <Badge color="teal" variant="light">
                        {item.citationLabel}
                      </Badge>
                    </Group>
                    <Text c="dimmed" size="sm">
                      {t("aiSettings.searchMeta", {
                        sourceType: item.sourceType,
                        score: item.score.toFixed(2)
                      })}
                    </Text>
                    <Text size="sm">{item.excerpt}</Text>
                  </Stack>
                </Paper>
              ))
            ) : submittedQuery ? (
              <Text c="dimmed">{t("aiSettings.noSearchResults")}</Text>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <ThemeIcon color="violet" radius="sm" variant="light">
              <Sparkles size={18} />
            </ThemeIcon>
            <CardTitle>{t("aiSettings.runsCard")}</CardTitle>
          </CardHeader>
          <CardContent>
            {recentRuns.data?.length ? (
              recentRuns.data.map((run) => (
                <Paper key={run.id} bg="var(--mantine-color-default-hover)" p="md" radius="sm">
                  <Group justify="space-between" gap="md">
                    <Stack gap={4}>
                      <Text fw={650}>{t(`aiSettings.runKinds.${run.kind}`)}</Text>
                      <Text c="dimmed" size="sm">
                        {run.model ?? t("aiSettings.noModel")}
                      </Text>
                      {run.error ? (
                        <Text c="red" size="sm">
                          {run.error}
                        </Text>
                      ) : null}
                    </Stack>
                    <Badge color={runTone(run.status) === "success" ? "green" : runTone(run.status) === "warning" ? "yellow" : "gray"} variant="light">
                      {t(`aiSettings.runStatus.${run.status}`)}
                    </Badge>
                  </Group>
                </Paper>
              ))
            ) : (
              <Text c="dimmed">{t("aiSettings.noRuns")}</Text>
            )}
          </CardContent>
        </Card>
      </PageSection>
    </Container>
  );
}
