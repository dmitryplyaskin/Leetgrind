import { useNavigate } from "@tanstack/react-router";
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
  Stack,
  Text
} from "@leetgrind/ui";
import { trpc } from "./trpc";

function extractErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : null;
}

export function AssessmentsNewRoute() {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const goals = trpc.goals.list.useQuery();
  const skills = trpc.skills.list.useQuery();
  const createSession = trpc.assessments.createSession.useMutation();
  const [goalId, setGoalId] = useState<string | null>(null);
  const [skillId, setSkillId] = useState<string | null>(null);
  const [focusPrompt, setFocusPrompt] = useState("");

  return (
    <Container>
      <PageSection>
        <PageHeader>
          <Stack gap="xs" maw={760}>
            <Kicker>{t("assessments.kicker")}</Kicker>
            <PageTitle>{t("assessments.new.title")}</PageTitle>
            <PageLead>{t("assessments.new.subtitle")}</PageLead>
          </Stack>
        </PageHeader>

        {createSession.error ? (
          <Alert color="red" radius="sm" variant="light">
            <Stack gap="xs">
              <Text>{extractErrorMessage(createSession.error) ?? t("common.loadError")}</Text>
              <Button component="a" href="/settings/ai" size="xs" variant="default">
                {t("assessments.providerCta")}
              </Button>
            </Stack>
          </Alert>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>{t("assessments.new.configure")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Stack gap="md">
              <Select
                clearable
                data={(goals.data ?? []).map((goal) => ({
                  value: goal.id,
                  label: goal.title
                }))}
                label={t("assessments.fields.goal")}
                onChange={setGoalId}
                placeholder={t("assessments.placeholders.goal")}
                value={goalId}
              />
              <Select
                clearable
                data={(skills.data ?? []).map((skill) => ({
                  value: skill.id,
                  label: skill.title
                }))}
                label={t("assessments.fields.skill")}
                onChange={setSkillId}
                placeholder={t("assessments.placeholders.skill")}
                value={skillId}
              />
              <Textarea
                autosize
                label={t("assessments.fields.focus")}
                minRows={3}
                onChange={(event) => setFocusPrompt(event.currentTarget.value)}
                placeholder={t("assessments.placeholders.focus")}
                value={focusPrompt}
              />
              <Group justify="flex-end">
                <Button
                  loading={createSession.isPending}
                  onClick={async () => {
                    const result = await createSession.mutateAsync({
                      goalId: goalId ?? undefined,
                      skillId: skillId ?? undefined,
                      locale: i18n.language === "ru" ? "ru" : "en",
                      focusPrompt
                    });

                    await navigate({
                      to: "/assessments/$sessionId",
                      params: { sessionId: result.session.id }
                    });
                  }}
                >
                  {t("assessments.new.start")}
                </Button>
              </Group>
            </Stack>
          </CardContent>
        </Card>
      </PageSection>
    </Container>
  );
}
