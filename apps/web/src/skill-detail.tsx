import { Link, useParams } from "@tanstack/react-router";
import { BookOpen, CalendarClock, GitBranch, Target } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Progress } from "@mantine/core";
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
  Text,
  ThemeIcon,
} from "@leetgrind/ui";
import { trpc } from "./trpc";

function formatDate(value: Date | string | null | undefined, locale: string) {
  if (!value) return "";

  return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function readinessColor(score: number) {
  if (score >= 78) return "green";
  if (score >= 50) return "teal";
  if (score >= 25) return "yellow";
  return "red";
}

function badgeForLevel(level: string) {
  if (level === "strong") return "success";
  if (level === "developing") return "info";
  if (level === "weak") return "warning";
  return "neutral";
}

export function SkillDetailRoute() {
  const { skillId } = useParams({ from: "/skills/$skillId" });
  const { i18n, t } = useTranslation();
  const detail = trpc.skills.getDetail.useQuery({ skillId });
  const data = detail.data;

  return (
    <Container>
      <PageSection>
        <PageHeader>
          <Stack gap="xs" maw={760}>
            <Kicker>{t("skillDetail.kicker")}</Kicker>
            <PageTitle>{data?.skill.title ?? t("skillDetail.title")}</PageTitle>
            <PageLead>{data?.skill.description ?? t("skillDetail.subtitle")}</PageLead>
          </Stack>
          <Button color="gray" component={Link} to="/dashboard" variant="default">
            {t("common.backToDashboard")}
          </Button>
        </PageHeader>

        {detail.isLoading ? (
          <Alert color="blue" radius="sm" variant="light">
            {t("common.loading")}
          </Alert>
        ) : null}

        {detail.error ? (
          <Alert color="red" radius="sm" variant="light">
            {t("common.loadError")}
          </Alert>
        ) : null}

        {data ? (
          <>
            <SimpleGrid cols={{ base: 1, md: 2, xl: 4 }} spacing="md">
              <Card>
                <CardHeader>
                  <ThemeIcon color={readinessColor(data.progress.score)} radius="sm" variant="light">
                    <Target size={18} />
                  </ThemeIcon>
                  <CardTitle>{t("skillDetail.score")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Text fw={700} size="xl">
                    {data.progress.score}%
                  </Text>
                  <Progress value={data.progress.score} color={readinessColor(data.progress.score)} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("skillDetail.level")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant={badgeForLevel(data.skill.level)}>
                    {t(`options.skillLevels.${data.skill.level}`)}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <ThemeIcon color="blue" radius="sm" variant="light">
                    <BookOpen size={18} />
                  </ThemeIcon>
                  <CardTitle>{t("skillDetail.evidence")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Text fw={700} size="xl">
                    {data.evidence.length}
                  </Text>
                  <Text c="dimmed" size="sm">
                    {t("skillDetail.attempts", { count: data.attempts.length })}
                  </Text>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <ThemeIcon color="yellow" radius="sm" variant="light">
                    <CalendarClock size={18} />
                  </ThemeIcon>
                  <CardTitle>{t("skillDetail.reviews")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Text fw={700} size="xl">
                    {data.reviews.length}
                  </Text>
                  <Text c="dimmed" size="sm">
                    {data.reviews[0]?.dueAt
                      ? formatDate(data.reviews[0].dueAt, i18n.language)
                      : t("options.empty")}
                  </Text>
                </CardContent>
              </Card>
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
              <Card>
                <CardHeader>
                  <CardTitle>{t("skillDetail.evidence")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.evidence.length > 0 ? (
                    data.evidence.map((item) => (
                      <Paper
                        key={item.id}
                        bg="var(--mantine-color-default-hover)"
                        p="md"
                        radius="sm"
                      >
                        <Group justify="space-between" gap="md">
                          <Stack gap={4}>
                            <Badge
                              variant={
                                item.polarity === "strength" || item.polarity === "progress"
                                  ? "success"
                                  : item.polarity === "weakness" || item.polarity === "gap"
                                    ? "warning"
                                    : "neutral"
                              }
                            >
                              {t(`skillDetail.polarity.${item.polarity}`)}
                            </Badge>
                            <Text>{item.summary}</Text>
                          </Stack>
                          <Text c="dimmed" size="xs">
                            {formatDate(item.createdAt, i18n.language)}
                          </Text>
                        </Group>
                      </Paper>
                    ))
                  ) : (
                    <Text c="dimmed">{t("skillDetail.noEvidence")}</Text>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <ThemeIcon color="teal" radius="sm" variant="light">
                    <GitBranch size={18} />
                  </ThemeIcon>
                  <CardTitle>{t("skillDetail.connected")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.connectedSkills.length > 0 ? (
                    data.connectedSkills.map((skill) => (
                      <Paper
                        key={skill.id}
                        bg="var(--mantine-color-default-hover)"
                        p="md"
                        radius="sm"
                      >
                        <Group justify="space-between" gap="md">
                          <Stack gap={4}>
                            <Text fw={650}>{skill.title}</Text>
                            <Text c="dimmed" size="sm">
                              {skill.description ?? t("options.empty")}
                            </Text>
                          </Stack>
                          <Button
                            color="gray"
                            component="a"
                            href={`/skills/${skill.id}`}
                            size="xs"
                            variant="default"
                          >
                            {t("common.open")}
                          </Button>
                        </Group>
                      </Paper>
                    ))
                  ) : (
                    <Text c="dimmed">{t("skillDetail.noConnections")}</Text>
                  )}
                </CardContent>
              </Card>
            </SimpleGrid>
          </>
        ) : null}
      </PageSection>
    </Container>
  );
}
