import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
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
import { trpc } from "./trpc";

export function LessonsRoute({ skillId }: { skillId?: string } = {}) {
  const { t } = useTranslation();
  const lessons = trpc.lessons.list.useQuery(skillId ? { skillId, limit: 12 } : undefined);

  return (
    <Container>
      <PageSection>
        <PageHeader>
          <Stack gap="xs" maw={760}>
            <Kicker>{t("lessons.kicker")}</Kicker>
            <PageTitle>{t("lessons.title")}</PageTitle>
            <PageLead>{t("lessons.subtitle")}</PageLead>
          </Stack>
        </PageHeader>

        {lessons.error ? (
          <Alert color="red" radius="sm" variant="light">
            {t("common.loadError")}
          </Alert>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>{t("lessons.library")}</CardTitle>
          </CardHeader>
          <CardContent>
            {lessons.data && lessons.data.length > 0 ? (
              lessons.data.map((lesson) => (
                <Paper key={lesson.id} bg="var(--mantine-color-default-hover)" p="md" radius="sm">
                  <Group justify="space-between" gap="md">
                    <Stack gap={4}>
                      <Text fw={650}>{lesson.title}</Text>
                      <Text c="dimmed" size="sm">
                        {lesson.summary ?? t("lessons.empty")}
                      </Text>
                    </Stack>
                    <Button
                      color="gray"
                      component="a"
                      href={`/lessons/${lesson.id}`}
                      variant="default"
                    >
                      {t("common.open")}
                    </Button>
                  </Group>
                </Paper>
              ))
            ) : (
              <Text c="dimmed">{t("lessons.empty")}</Text>
            )}
          </CardContent>
        </Card>
      </PageSection>
    </Container>
  );
}
