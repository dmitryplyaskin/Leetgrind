import { Link, useParams } from "@tanstack/react-router";
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
  SimpleGrid,
  Stack,
  Text
} from "@leetgrind/ui";
import { trpc } from "../../shared/api/trpc";

export function AssessmentResultRoute() {
  const { sessionId } = useParams({ from: "/assessments/$sessionId/result" });
  const { t } = useTranslation();
  const utils = trpc.useUtils();
  const session = trpc.assessments.getSession.useQuery({ sessionId });
  const accept = trpc.recommendations.accept.useMutation({
    onSuccess: async () => {
      await utils.assessments.getSession.invalidate({ sessionId });
      await utils.dashboard.getSummary.invalidate();
    }
  });
  const dismiss = trpc.recommendations.dismiss.useMutation({
    onSuccess: async () => {
      await utils.assessments.getSession.invalidate({ sessionId });
      await utils.dashboard.getSummary.invalidate();
    }
  });
  const result = session.data?.result;

  return (
    <Container>
      <PageSection>
        <PageHeader>
          <Stack gap="xs" maw={760}>
            <Kicker>{t("assessments.kicker")}</Kicker>
            <PageTitle>{t("assessments.result.title")}</PageTitle>
            <PageLead>{result?.summary ?? t("assessments.result.subtitle")}</PageLead>
          </Stack>
          <Button color="gray" component={Link} to="/dashboard" variant="default">
            {t("common.backToDashboard")}
          </Button>
        </PageHeader>

        {!result ? (
          <Alert color="yellow" radius="sm" variant="light">
            {t("assessments.result.pending")}
          </Alert>
        ) : (
          <Stack gap="lg">
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
              <Card>
                <CardHeader>
                  <CardTitle>{t("assessments.result.score")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Text fw={700} size="xl">
                    {result.overallScore}%
                  </Text>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t("assessments.result.verdict")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant={result.overallScore >= 65 ? "success" : "warning"}>
                    {t(`assessments.verdicts.${result.verdict}`)}
                  </Badge>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t("assessments.result.evidence")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Text fw={700} size="xl">
                    {result.evidence.length}
                  </Text>
                </CardContent>
              </Card>
            </SimpleGrid>

            <Card>
              <CardHeader>
                <CardTitle>{t("assessments.result.feedback")}</CardTitle>
              </CardHeader>
              <CardContent>
                {result.questionEvaluations.map((item, index) => (
                  <Paper key={item.questionId} bg="var(--mantine-color-default-hover)" p="md" radius="sm">
                    <Stack gap={4}>
                      <Text fw={650}>
                        {t("assessments.session.question")} {index + 1}
                      </Text>
                      <Text size="sm">{item.feedback}</Text>
                    </Stack>
                  </Paper>
                ))}
              </CardContent>
            </Card>

            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
              <Card>
                <CardHeader>
                  <CardTitle>{t("lessons.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {result.lessons.length > 0 ? (
                    result.lessons.map((lesson) => (
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

              <Card>
                <CardHeader>
                  <CardTitle>{t("recommendations.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {result.recommendations.length > 0 ? (
                    result.recommendations.map((recommendation) => (
                      <Paper
                        key={recommendation.id}
                        bg="var(--mantine-color-default-hover)"
                        p="md"
                        radius="sm"
                      >
                        <Stack gap="sm">
                          <Text fw={650}>{recommendation.title}</Text>
                          <Text c="dimmed" size="sm">
                            {recommendation.rationale}
                          </Text>
                          <Group justify="flex-end">
                            <Button
                              loading={accept.isPending}
                              onClick={() => accept.mutate({ recommendationId: recommendation.id })}
                              size="xs"
                              variant="default"
                            >
                              {t("recommendations.accept")}
                            </Button>
                            <Button
                              color="gray"
                              loading={dismiss.isPending}
                              onClick={() => dismiss.mutate({ recommendationId: recommendation.id })}
                              size="xs"
                              variant="default"
                            >
                              {t("recommendations.dismiss")}
                            </Button>
                          </Group>
                        </Stack>
                      </Paper>
                    ))
                  ) : (
                    <Text c="dimmed">{t("recommendations.empty")}</Text>
                  )}
                </CardContent>
              </Card>
            </SimpleGrid>
          </Stack>
        )}
      </PageSection>
    </Container>
  );
}
