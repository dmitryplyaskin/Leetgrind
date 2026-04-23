import { useNavigate, useParams } from "@tanstack/react-router";
import { Radio, Textarea } from "@mantine/core";
import { useEffect, useState } from "react";
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
  Text
} from "@leetgrind/ui";
import { trpc } from "../../shared/api/trpc";

type AnswerState = Record<string, string | string[]>;

export function AssessmentSessionRoute() {
  const { sessionId } = useParams({ from: "/assessments/$sessionId" });
  const { t } = useTranslation();
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const session = trpc.assessments.getSession.useQuery({ sessionId });
  const submitAnswer = trpc.assessments.submitAnswer.useMutation();
  const finishSession = trpc.assessments.finishSession.useMutation();
  const [answers, setAnswers] = useState<AnswerState>({});

  useEffect(() => {
    if (!session.data) {
      return;
    }

    setAnswers(
      Object.fromEntries(
        session.data.answers.map((answer) => [
          answer.questionId,
          answer.answer.kind === "multiple-choice"
            ? answer.answer.selectedChoiceIds[0] ?? ""
            : answer.answer.responseText
        ])
      )
    );
  }, [session.data]);

  return (
    <Container>
      <PageSection>
        <PageHeader>
          <Stack gap="xs" maw={760}>
            <Kicker>{t("assessments.kicker")}</Kicker>
            <PageTitle>{session.data?.session.title ?? t("assessments.session.title")}</PageTitle>
            <PageLead>{session.data?.session.summary ?? t("assessments.session.subtitle")}</PageLead>
          </Stack>
          <Badge variant="info">{session.data?.session.status ?? "in-progress"}</Badge>
        </PageHeader>

        {session.error ? (
          <Alert color="red" radius="sm" variant="light">
            {t("common.loadError")}
          </Alert>
        ) : null}

        {session.data ? (
          <Stack gap="md">
            {session.data.questions.map((question, index) => (
              <Card key={question.id}>
                <CardHeader>
                  <CardTitle>
                    {t("assessments.session.question")} {index + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Stack gap="sm">
                    <Text fw={650}>{question.prompt}</Text>
                    {question.kind === "multiple-choice" ? (
                      <Radio.Group
                        onChange={(value) =>
                          setAnswers((current) => ({
                            ...current,
                            [question.id]: value
                          }))
                        }
                        value={typeof answers[question.id] === "string" ? (answers[question.id] as string) : ""}
                      >
                        <Stack gap="xs">
                          {question.choices.map((choice) => (
                            <Radio key={choice.id} label={choice.label} value={choice.id} />
                          ))}
                        </Stack>
                      </Radio.Group>
                    ) : (
                      <Textarea
                        autosize
                        minRows={4}
                        onChange={(event) =>
                          setAnswers((current) => ({
                            ...current,
                            [question.id]: event.currentTarget.value
                          }))
                        }
                        placeholder={t("assessments.session.answerPlaceholder")}
                        value={typeof answers[question.id] === "string" ? (answers[question.id] as string) : ""}
                      />
                    )}
                    {"scenario" in question ? (
                      <Paper bg="var(--mantine-color-default-hover)" p="md" radius="sm">
                        <Text size="sm">{question.scenario}</Text>
                      </Paper>
                    ) : null}
                  </Stack>
                </CardContent>
              </Card>
            ))}

            <Group justify="flex-end">
              <Button
                loading={submitAnswer.isPending || finishSession.isPending}
                onClick={async () => {
                  if (!session.data) {
                    return;
                  }

                  for (const question of session.data.questions) {
                    const rawValue = answers[question.id];

                    if (question.kind === "multiple-choice") {
                      await submitAnswer.mutateAsync({
                        sessionId,
                        answer: {
                          questionId: question.id,
                          kind: "multiple-choice",
                          selectedChoiceIds: typeof rawValue === "string" && rawValue ? [rawValue] : []
                        }
                      });
                    } else {
                      await submitAnswer.mutateAsync({
                        sessionId,
                        answer: {
                          questionId: question.id,
                          kind: question.kind,
                          responseText: typeof rawValue === "string" ? rawValue.trim() : ""
                        }
                      });
                    }
                  }

                  await finishSession.mutateAsync({ sessionId });
                  await utils.assessments.getSession.invalidate({ sessionId });
                  await navigate({
                    to: "/assessments/$sessionId/result",
                    params: { sessionId }
                  });
                }}
              >
                {t("assessments.session.finish")}
              </Button>
            </Group>
          </Stack>
        ) : null}
      </PageSection>
    </Container>
  );
}
