import { Link, useNavigate } from "@tanstack/react-router";
import { Select, Textarea } from "@mantine/core";
import { useState } from "react";
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

function extractErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : null;
}

export function LessonsRoute({ skillId }: { skillId?: string } = {}) {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const lessons = trpc.lessons.list.useQuery(skillId ? { skillId, limit: 12 } : undefined);
  const goals = trpc.goals.list.useQuery();
  const skills = trpc.skills.list.useQuery();
  const generateLesson = trpc.lessons.generate.useMutation({
    onSuccess: async (createdLessons) => {
      await utils.lessons.list.invalidate();

      if (createdLessons[0]) {
        await navigate({
          to: "/lessons/$lessonId",
          params: { lessonId: createdLessons[0].id }
        });
      }
    }
  });
  const [goalId, setGoalId] = useState<string | null>(null);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(skillId ?? null);
  const [focusPrompt, setFocusPrompt] = useState("");
  const effectiveSkillId = skillId ?? selectedSkillId ?? undefined;

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

        {generateLesson.error ? (
          <Alert color="red" radius="sm" variant="light">
            <Stack gap="xs">
              <Text>{extractErrorMessage(generateLesson.error) ?? t("common.loadError")}</Text>
              <Button component={Link} to="/settings/ai" size="xs" variant="default">
                {t("lessons.providerCta")}
              </Button>
            </Stack>
          </Alert>
        ) : null}

        {lessons.error ? (
          <Alert color="red" radius="sm" variant="light">
            {t("common.loadError")}
          </Alert>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>{t("lessons.create.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Stack gap="md">
              <Select
                clearable
                data={(goals.data ?? []).map((goal) => ({
                  value: goal.id,
                  label: goal.title
                }))}
                label={t("lessons.fields.goal")}
                onChange={setGoalId}
                placeholder={t("lessons.placeholders.goal")}
                value={goalId}
              />
              <Select
                clearable
                data={(skills.data ?? []).map((skill) => ({
                  value: skill.id,
                  label: skill.title
                }))}
                disabled={Boolean(skillId)}
                label={t("lessons.fields.skill")}
                onChange={setSelectedSkillId}
                placeholder={t("lessons.placeholders.skill")}
                value={selectedSkillId}
              />
              <Textarea
                autosize
                label={t("lessons.fields.focus")}
                minRows={3}
                onChange={(event) => setFocusPrompt(event.currentTarget.value)}
                placeholder={t("lessons.placeholders.focus")}
                value={focusPrompt}
              />
              <Group justify="flex-end">
                <Button
                  loading={generateLesson.isPending}
                  onClick={() =>
                    generateLesson.mutate({
                      goalId: goalId ?? undefined,
                      skillId: effectiveSkillId,
                      locale: i18n.language === "ru" ? "ru" : "en",
                      focusPrompt: focusPrompt.trim() || undefined
                    })
                  }
                >
                  {t("lessons.create.submit")}
                </Button>
              </Group>
            </Stack>
          </CardContent>
        </Card>

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
              <Stack gap="sm">
                <Text c="dimmed">{t("lessons.empty")}</Text>
                <Text c="dimmed" size="sm">
                  {t("lessons.emptyHint")}
                </Text>
              </Stack>
            )}
          </CardContent>
        </Card>
      </PageSection>
    </Container>
  );
}
