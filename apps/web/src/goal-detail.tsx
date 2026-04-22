import { Link, useParams } from "@tanstack/react-router";
import { AlertTriangle, LineChart, ListChecks, Target } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Progress, RingProgress } from "@mantine/core";
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
  PageLead,
  PageSection,
  PageTitle,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from "@leetgrind/ui";
import { trpc } from "./trpc";

function readinessColor(score: number) {
  if (score >= 78) return "green";
  if (score >= 50) return "teal";
  if (score >= 25) return "yellow";
  return "red";
}

function skillBadge(level: string) {
  if (level === "strong") return "success";
  if (level === "developing") return "info";
  if (level === "weak") return "warning";
  return "neutral";
}

export function GoalDetailRoute() {
  const { goalId } = useParams({ from: "/goals/$goalId" });
  const { t } = useTranslation();
  const readiness = trpc.goals.getReadiness.useQuery({ goalId });
  const data = readiness.data;

  return (
    <Container>
      <PageSection>
        <PageHeader>
          <Stack gap="xs" maw={760}>
            <Kicker>{t("goalDetail.kicker")}</Kicker>
            <PageTitle>{data?.readiness.goal?.title ?? t("goalDetail.title")}</PageTitle>
            <PageLead>{t("goalDetail.subtitle")}</PageLead>
          </Stack>
          <Button color="gray" component={Link} to="/dashboard" variant="default">
            {t("common.backToDashboard")}
          </Button>
        </PageHeader>

        {readiness.isLoading ? (
          <Alert color="blue" radius="sm" variant="light">
            {t("common.loading")}
          </Alert>
        ) : null}

        {data ? (
          <>
            <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="lg">
              <Card>
                <CardHeader>
                  <ThemeIcon color={readinessColor(data.readiness.score)} radius="sm" variant="light">
                    <LineChart size={18} />
                  </ThemeIcon>
                  <CardTitle>{t("dashboard.readiness")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <RingProgress
                    label={
                      <Text fw={700} ta="center">
                        {data.readiness.score}%
                      </Text>
                    }
                    sections={[
                      {
                        value: data.readiness.score,
                        color: readinessColor(data.readiness.score),
                      },
                    ]}
                    size={120}
                    thickness={10}
                  />
                  <Badge variant={data.readiness.score >= 50 ? "success" : "warning"}>
                    {t(`dashboard.readinessBands.${data.readiness.band}`)}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <ThemeIcon color="teal" radius="sm" variant="light">
                    <Target size={18} />
                  </ThemeIcon>
                  <CardTitle>{t("goalDetail.skillCoverage")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Text fw={700} size="xl">
                    {data.readiness.totalSkills}
                  </Text>
                  <Text c="dimmed" size="sm">
                    {t("goalDetail.skillCoverageCopy", {
                      strong: data.readiness.strongSkills,
                      weak: data.readiness.weakSkills,
                      unknown: data.readiness.unknownSkills,
                    })}
                  </Text>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <ThemeIcon color="yellow" radius="sm" variant="light">
                    <AlertTriangle size={18} />
                  </ThemeIcon>
                  <CardTitle>{t("dashboard.weakSpots")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Text fw={700} size="xl">
                    {data.weakSpots.length}
                  </Text>
                  <Text c="dimmed" size="sm">
                    {t("dashboard.dueReviews", { count: data.readiness.dueReviews })}
                  </Text>
                </CardContent>
              </Card>
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
              <Card>
                <CardHeader>
                  <CardTitle>{t("goalDetail.skills")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.skills.map((summary) => (
                    <Paper
                      key={summary.skill.id}
                      bg="var(--mantine-color-default-hover)"
                      p="md"
                      radius="sm"
                    >
                      <Group justify="space-between" gap="md">
                        <Stack gap={6} style={{ flex: 1 }}>
                          <Group justify="space-between" gap="sm">
                            <Text fw={650}>{summary.skill.title}</Text>
                            <Badge variant={skillBadge(summary.skill.level)}>
                              {t(`options.skillLevels.${summary.skill.level}`)}
                            </Badge>
                          </Group>
                          <Progress value={summary.score} color={readinessColor(summary.score)} />
                        </Stack>
                        <Button
                          color="gray"
                          component="a"
                          href={`/skills/${summary.skill.id}`}
                          size="xs"
                          variant="default"
                        >
                          {t("common.open")}
                        </Button>
                      </Group>
                    </Paper>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <ThemeIcon color="teal" radius="sm" variant="light">
                    <ListChecks size={18} />
                  </ThemeIcon>
                  <CardTitle>{t("dashboard.nextActions")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.nextActions.length > 0 ? (
                    data.nextActions.map((action) => (
                      <Paper
                        key={action.id}
                        bg="var(--mantine-color-default-hover)"
                        p="md"
                        radius="sm"
                      >
                        <Stack gap={4}>
                          <Text fw={650}>
                            {action.title ?? t(`dashboard.actions.${action.titleKey}`)}
                          </Text>
                          <Text c="dimmed" size="sm">
                            {action.rationale ?? t(`dashboard.actionReasons.${action.reasonKey}`)}
                          </Text>
                        </Stack>
                      </Paper>
                    ))
                  ) : (
                    <Text c="dimmed">{t("dashboard.noActions")}</Text>
                  )}
                </CardContent>
              </Card>
            </SimpleGrid>
          </>
        ) : null}

        {readiness.error ? (
          <Box>
            <Alert color="red" radius="sm" variant="light">
              {t("common.loadError")}
            </Alert>
          </Box>
        ) : null}
      </PageSection>
    </Container>
  );
}
