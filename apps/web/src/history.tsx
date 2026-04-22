import { Link } from "@tanstack/react-router";
import { Clock3 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Badge,
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
  Text,
  ThemeIcon,
} from "@leetgrind/ui";
import { trpc } from "./trpc";

function formatDate(value: Date | string, locale: string) {
  return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-US", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function HistoryRoute() {
  const { i18n, t } = useTranslation();
  const history = trpc.history.listRecent.useQuery({ limit: 50 });

  return (
    <Container>
      <PageSection>
        <PageHeader>
          <Stack gap="xs" maw={760}>
            <Kicker>{t("history.kicker")}</Kicker>
            <PageTitle>{t("history.title")}</PageTitle>
            <PageLead>{t("history.subtitle")}</PageLead>
          </Stack>
          <Button color="gray" component={Link} to="/dashboard" variant="default">
            {t("common.backToDashboard")}
          </Button>
        </PageHeader>

        {history.isLoading ? (
          <Alert color="blue" radius="sm" variant="light">
            {t("common.loading")}
          </Alert>
        ) : null}

        {history.error ? (
          <Alert color="red" radius="sm" variant="light">
            {t("common.loadError")}
          </Alert>
        ) : null}

        <Card>
          <CardHeader>
            <ThemeIcon color="blue" radius="sm" variant="light">
              <Clock3 size={18} />
            </ThemeIcon>
            <CardTitle>{t("history.events")}</CardTitle>
          </CardHeader>
          <CardContent>
            {(history.data ?? []).length > 0 ? (
              history.data?.map((event) => (
                <Paper
                  key={event.id}
                  bg="var(--mantine-color-default-hover)"
                  p="md"
                  radius="sm"
                >
                  <Group align="flex-start" justify="space-between" gap="md">
                    <Stack gap={4}>
                      <Group gap="xs">
                        <Badge
                          variant={
                            event.tone === "positive"
                              ? "success"
                              : event.tone === "warning"
                                ? "warning"
                                : "neutral"
                          }
                        >
                          {t(`history.kinds.${event.kind}`)}
                        </Badge>
                        <Text c="dimmed" size="xs">
                          {formatDate(event.occurredAt, i18n.language)}
                        </Text>
                      </Group>
                      <Text fw={650}>{event.title}</Text>
                      <Text c="dimmed" size="sm">
                        {event.summary}
                      </Text>
                    </Stack>
                  </Group>
                </Paper>
              ))
            ) : (
              <Text c="dimmed">{t("history.empty")}</Text>
            )}
          </CardContent>
        </Card>
      </PageSection>
    </Container>
  );
}
