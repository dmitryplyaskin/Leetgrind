import { Link, useNavigate } from "@tanstack/react-router";
import CytoscapeComponent from "react-cytoscapejs";
import type { Core, EventObject } from "cytoscape";
import {
  AlertTriangle,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  GitBranch,
  LineChart,
  ListChecks,
  Target,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Progress, RingProgress, Select } from "@mantine/core";
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  CardDescription,
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
  Title,
} from "@leetgrind/ui";
import { trpc } from "./trpc";

type CytoscapeStylesheet = Array<{
  selector: string;
  style: Record<string, string | number>;
}>;

interface DashboardSkillSummary {
  skill: { id: string; title: string; level: string };
  score: number;
  goalRelevance: string | null;
  attemptCount: number;
  dueReviewCount: number;
}

interface DashboardAction {
  id: string;
  skillId: string | null;
  recommendationId?: string;
  titleKey: string;
  reasonKey: string;
  title?: string;
  rationale?: string;
}

interface DashboardReview {
  id: string;
  skillId: string | null;
  dueAt: Date | string;
  state: string;
}

interface DashboardWeakSpot {
  skillId: string;
  title: string;
  score: number;
  reason: string;
}

interface DashboardActivity {
  id: string;
  kind: string;
  title: string;
  summary: string;
  occurredAt: Date | string;
  tone: string;
}

interface DashboardData {
  profile: {
    displayName: string | null;
    targetRole: string | null;
  };
  activeGoal: { id: string; title: string; targetRole: string | null } | null;
  readiness: {
    score: number;
    band: string;
    totalSkills: number;
    strongSkills: number;
    dueReviews: number;
  };
  skills: DashboardSkillSummary[];
  strongSkills: DashboardSkillSummary[];
  weakSpots: DashboardWeakSpot[];
  nextActions: DashboardAction[];
  upcomingReviews: DashboardReview[];
  recentActivity: DashboardActivity[];
  graph: SkillGraphProps["graph"];
}

const graphStylesheet: CytoscapeStylesheet = [
  {
    selector: "node",
    style: {
      "background-color": "data(color)",
      "border-color": "data(borderColor)",
      "border-width": 2,
      color: "var(--mantine-color-text)",
      "font-size": 11,
      height: "mapData(score, 0, 100, 28, 52)",
      label: "data(label)",
      "overlay-padding": 8,
      shape: "round-rectangle",
      "text-max-width": 92,
      "text-valign": "center",
      "text-wrap": "wrap",
      width: "mapData(score, 0, 100, 82, 128)",
    },
  },
  {
    selector: "edge",
    style: {
      "curve-style": "bezier",
      "line-color": "data(color)",
      "target-arrow-color": "data(color)",
      "target-arrow-shape": "triangle",
      width: "mapData(weight, 0, 1, 1, 3)",
    },
  },
];

function formatDate(value: Date | string | null | undefined, locale: string) {
  if (!value) {
    return "";
  }

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

function skillColor(level: string) {
  if (level === "strong") return "success";
  if (level === "developing") return "info";
  if (level === "weak") return "warning";
  return "neutral";
}

function graphNodeColor(level: string) {
  if (level === "strong") return "var(--mantine-color-green-5)";
  if (level === "developing") return "var(--mantine-color-blue-5)";
  if (level === "weak") return "var(--mantine-color-yellow-5)";
  return "var(--mantine-color-gray-5)";
}

function graphEdgeColor(relation: string) {
  if (relation === "prerequisite") return "var(--mantine-color-teal-6)";
  if (relation === "specialization") return "var(--mantine-color-blue-6)";
  return "var(--mantine-color-gray-5)";
}

interface SkillGraphProps {
  graph: {
    nodes: Array<{
      id: string;
      label: string;
      level: string;
      score: number;
      isGoalSkill: boolean;
      dueReviewCount: number;
    }>;
    edges: Array<{
      id: string;
      source: string;
      target: string;
      relation: string;
      weight: number;
    }>;
  };
}

export function SkillGraph({ graph }: SkillGraphProps) {
  const navigate = useNavigate();
  const cyRef = useRef<Core | null>(null);
  const elements = useMemo(
    () => [
      ...graph.nodes.map((node) => ({
        data: {
          id: node.id,
          label: node.label,
          score: node.score,
          color: graphNodeColor(node.level),
          borderColor: node.isGoalSkill
            ? "var(--mantine-color-teal-8)"
            : "var(--mantine-color-default-border)",
        },
      })),
      ...graph.edges.map((edge) => ({
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          weight: edge.weight,
          color: graphEdgeColor(edge.relation),
        },
      })),
    ],
    [graph.edges, graph.nodes],
  );

  useEffect(() => {
    const cy = cyRef.current;

    if (!cy) {
      return undefined;
    }

    const handleNodeTap = (event: EventObject) => {
      const skillId = event.target.id();

      void navigate({
        to: "/skills/$skillId",
        params: { skillId },
      });
    };

    cy.on("tap", "node", handleNodeTap);

    return () => {
      cy.removeListener("tap", "node", handleNodeTap);
    };
  }, [navigate]);

  return (
    <Box
      style={{
        border: "1px solid var(--mantine-color-default-border)",
        borderRadius: "var(--mantine-radius-sm)",
        height: 460,
        overflow: "hidden",
      }}
    >
      <CytoscapeComponent
        cy={(cy) => {
          cyRef.current = cy;
        }}
        elements={elements}
        layout={{ name: "cose", animate: false, fit: true, padding: 36 }}
        stylesheet={graphStylesheet}
        style={{ height: "100%", width: "100%" }}
      />
    </Box>
  );
}

export function DashboardRoute() {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const acceptRecommendation = trpc.recommendations.accept.useMutation({
    onSuccess: async () => {
      await utils.dashboard.getSummary.invalidate();
    },
  });
  const dismissRecommendation = trpc.recommendations.dismiss.useMutation({
    onSuccess: async () => {
      await utils.dashboard.getSummary.invalidate();
    },
  });
  const refreshRecommendations = trpc.recommendations.refresh.useMutation({
    onSuccess: async () => {
      await utils.dashboard.getSummary.invalidate();
    },
  });
  const summary = trpc.dashboard.getSummary.useQuery(undefined, {
    staleTime: 30_000,
  });
  const data = summary.data as DashboardData | undefined;
  const isFirstSession =
    (data?.recentActivity.length ?? 0) === 0 &&
    (data?.upcomingReviews.length ?? 0) === 0;
  const goalOptions =
    data?.skills
      .filter((skill) => skill.goalRelevance)
      .map((skill) => ({
        value: skill.skill.id,
        label: skill.skill.title,
      })) ?? [];

  return (
    <Container>
      <PageSection>
        <PageHeader>
          <Stack gap="xs" maw={760}>
            <Kicker>{t("dashboard.kicker")}</Kicker>
            <PageTitle>{t("dashboard.title")}</PageTitle>
            <PageLead>{t("dashboard.subtitle")}</PageLead>
          </Stack>
          <Group gap="xs">
            <Button component={Link} leftSection={<BookOpen size={16} />} to="/lessons">
              {t("lessons.create.submit")}
            </Button>
            <Button
              color="gray"
              component={Link}
              leftSection={<ClipboardCheck size={16} />}
              to="/assessments/new"
              variant="default"
            >
              {t("assessments.new.start")}
            </Button>
            <Button color="gray" component={Link} to="/onboarding" variant="default">
              {t("dashboard.updatePlan")}
            </Button>
          </Group>
        </PageHeader>

        {summary.isLoading ? (
          <Alert color="blue" radius="sm" variant="light">
            {t("common.loading")}
          </Alert>
        ) : null}

        {summary.error ? (
          <Alert color="red" radius="sm" variant="light">
            {t("common.loadError")}
          </Alert>
        ) : null}

        {refreshRecommendations.error ? (
          <Alert color="red" radius="sm" variant="light">
            <Stack gap="xs">
              <Text>{t("recommendations.refreshError")}</Text>
              <Button component={Link} to="/settings/ai" size="xs" variant="default">
                {t("assessments.providerCta")}
              </Button>
            </Stack>
          </Alert>
        ) : null}

        {data ? (
          <>
            <Paper
              p={{ base: "lg", md: "xl" }}
              radius="lg"
              style={{ border: "1px solid var(--mantine-color-default-border)" }}
            >
              <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
                <Stack gap="sm">
                  <Kicker>
                    {isFirstSession
                      ? t("dashboard.firstSessionKicker")
                      : t("dashboard.kicker")}
                  </Kicker>
                  <Title order={2}>
                    {isFirstSession
                      ? t("dashboard.firstSessionTitle")
                      : t("dashboard.title")}
                  </Title>
                  <Text c="dimmed" maw={620}>
                    {isFirstSession
                      ? t("dashboard.firstSessionSubtitle")
                      : t("dashboard.subtitle")}
                  </Text>
                  <Group gap="sm">
                    <Button component={Link} leftSection={<ClipboardCheck size={16} />} to="/assessments/new">
                      {t("assessments.new.start")}
                    </Button>
                    <Button component={Link} leftSection={<BookOpen size={16} />} to="/lessons" variant="default">
                      {t("lessons.create.submit")}
                    </Button>
                    <Button color="gray" component={Link} to="/onboarding" variant="default">
                      {t("dashboard.updatePlan")}
                    </Button>
                  </Group>
                </Stack>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  <ReviewItem
                    label={t("dashboard.activeGoal")}
                    value={data.activeGoal?.title ?? t("dashboard.noGoal")}
                    description={data.activeGoal?.targetRole ?? t("options.empty")}
                  />
                  <ReviewItem
                    label={t("dashboard.currentRole")}
                    value={data.profile.targetRole ?? t("options.empty")}
                    description={data.profile.displayName ?? t("options.empty")}
                  />
                  <ReviewItem
                    label={t("dashboard.readiness")}
                    value={`${data.readiness.score}%`}
                    description={t(`dashboard.readinessBands.${data.readiness.band}`)}
                  />
                  <ReviewItem
                    label={t("dashboard.topSkills")}
                    value={t("dashboard.ofSkills", { count: data.readiness.totalSkills })}
                    description={t("dashboard.skillMapReady", {
                      count: data.skills.length,
                    })}
                  />
                </SimpleGrid>
              </SimpleGrid>
            </Paper>

            {!isFirstSession ? (
              <SimpleGrid cols={{ base: 1, md: 2, xl: 4 }} spacing="md">
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
                      size={112}
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
                    <CardTitle>{t("dashboard.activeGoal")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Text fw={700} size="lg">
                      {data.activeGoal?.title ?? t("dashboard.noGoal")}
                    </Text>
                    <Text c="dimmed" size="sm">
                      {data.activeGoal?.targetRole ?? t("options.empty")}
                    </Text>
                    {data.activeGoal ? (
                      <Button
                        color="gray"
                        component="a"
                        href={`/goals/${data.activeGoal.id}`}
                        size="xs"
                        variant="default"
                      >
                        {t("dashboard.openGoal")}
                      </Button>
                    ) : null}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <ThemeIcon color="green" radius="sm" variant="light">
                      <CheckCircle2 size={18} />
                    </ThemeIcon>
                    <CardTitle>{t("dashboard.strongSkills")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Text fw={700} size="xl">
                      {data.readiness.strongSkills}
                    </Text>
                    <Text c="dimmed" size="sm">
                      {t("dashboard.ofSkills", { count: data.readiness.totalSkills })}
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
            ) : null}

            <SimpleGrid cols={{ base: 1, lg: data.upcomingReviews.length > 0 ? 2 : 1 }} spacing="lg">
              <Card>
                <CardHeader>
                  <ThemeIcon color="teal" radius="sm" variant="light">
                    <ListChecks size={18} />
                  </ThemeIcon>
                  <CardTitle>{t("dashboard.nextActions")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Group justify="flex-end">
                    <Button
                      color="gray"
                      loading={refreshRecommendations.isPending}
                      onClick={() =>
                        refreshRecommendations.mutate({
                          goalId: data.activeGoal?.id,
                          limit: 4,
                        })
                      }
                      size="xs"
                      variant="default"
                    >
                      {t("recommendations.refresh")}
                    </Button>
                  </Group>
                  {data.nextActions.length > 0 ? (
                    data.nextActions.map((action) => {
                      const skill = data.skills.find((item) => item.skill.id === action.skillId);

                      return (
                        <Paper
                          key={action.id}
                          bg="var(--mantine-color-default-hover)"
                          p="md"
                          radius="sm"
                        >
                          <Group align="flex-start" justify="space-between" gap="md">
                            <Stack gap={4}>
                              <Text fw={650}>
                                {action.title ?? t(`dashboard.actions.${action.titleKey}`)}
                              </Text>
                              <Text c="dimmed" size="sm">
                                {action.rationale ?? t(`dashboard.actionReasons.${action.reasonKey}`)}
                              </Text>
                              {skill ? (
                                <Text c="dimmed" size="xs">
                                  {skill.skill.title}
                                </Text>
                              ) : null}
                            </Stack>
                            {action.skillId ? (
                              <Group gap="xs">
                                {action.recommendationId ? (
                                  <>
                                    <Button
                                      loading={acceptRecommendation.isPending}
                                      onClick={() =>
                                        acceptRecommendation.mutate({
                                          recommendationId: action.recommendationId!,
                                        })
                                      }
                                      size="xs"
                                      variant="default"
                                    >
                                      {t("recommendations.accept")}
                                    </Button>
                                    <Button
                                      color="gray"
                                      loading={dismissRecommendation.isPending}
                                      onClick={() =>
                                        dismissRecommendation.mutate({
                                          recommendationId: action.recommendationId!,
                                        })
                                      }
                                      size="xs"
                                      variant="default"
                                    >
                                      {t("recommendations.dismiss")}
                                    </Button>
                                  </>
                                ) : action.titleKey === "takeAssessment" ? (
                                  <Button
                                    color="gray"
                                    component={Link}
                                    size="xs"
                                    to="/assessments/new"
                                    variant="default"
                                  >
                                    {t("assessments.new.start")}
                                  </Button>
                                ) : (
                                  <Button
                                    color="gray"
                                    component="a"
                                    href={`/skills/${action.skillId}`}
                                    size="xs"
                                    variant="default"
                                  >
                                    {t("common.open")}
                                  </Button>
                                )}
                              </Group>
                            ) : null}
                          </Group>
                        </Paper>
                      );
                    })
                  ) : (
                    <Stack gap="sm">
                      <Text c="dimmed">{t("dashboard.noActions")}</Text>
                      <Group gap="xs">
                        <Button component={Link} size="xs" to="/lessons">
                          {t("lessons.create.submit")}
                        </Button>
                        <Button
                          color="gray"
                          component={Link}
                          size="xs"
                          to="/assessments/new"
                          variant="default"
                        >
                          {t("assessments.new.start")}
                        </Button>
                      </Group>
                    </Stack>
                  )}
                </CardContent>
              </Card>

              {data.upcomingReviews.length > 0 ? (
                <Card>
                  <CardHeader>
                    <ThemeIcon color="yellow" radius="sm" variant="light">
                      <CalendarClock size={18} />
                    </ThemeIcon>
                    <CardTitle>{t("dashboard.upcomingReviews")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {data.upcomingReviews.map((review) => {
                      const skill = data.skills.find((item) => item.skill.id === review.skillId);

                      return (
                        <Paper
                          key={review.id}
                          bg="var(--mantine-color-default-hover)"
                          p="md"
                          radius="sm"
                        >
                          <Group justify="space-between" gap="md">
                            <Stack gap={4}>
                              <Text fw={650}>{skill?.skill.title ?? t("dashboard.review")}</Text>
                              <Text c="dimmed" size="sm">
                                {formatDate(review.dueAt, i18n.language)}
                              </Text>
                            </Stack>
                            <Badge variant="info">{review.state}</Badge>
                          </Group>
                        </Paper>
                      );
                    })}
                  </CardContent>
                </Card>
              ) : null}
            </SimpleGrid>

            {data.strongSkills.length > 0 || data.weakSpots.length > 0 ? (
              <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
                {data.strongSkills.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("dashboard.strongSkills")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {data.strongSkills.map((summary) => (
                        <SkillProgressRow key={summary.skill.id} summary={summary} />
                      ))}
                    </CardContent>
                  </Card>
                ) : null}

                {data.weakSpots.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("dashboard.weakSpots")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {data.weakSpots.map((weakSpot) => (
                        <Paper
                          key={weakSpot.skillId}
                          bg="var(--mantine-color-default-hover)"
                          p="md"
                          radius="sm"
                        >
                          <Group justify="space-between" gap="md">
                            <Stack gap={4} style={{ flex: 1 }}>
                              <Text fw={650}>{weakSpot.title}</Text>
                              <Progress value={weakSpot.score} color={readinessColor(weakSpot.score)} />
                              <Text c="dimmed" size="sm">
                                {t(`dashboard.weakSpotReasons.${weakSpot.reason}`)}
                              </Text>
                            </Stack>
                            <Button
                              color="gray"
                              component="a"
                              href={`/skills/${weakSpot.skillId}`}
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
                ) : null}
              </SimpleGrid>
            ) : null}

            <Card>
              <CardHeader>
                <ThemeIcon color="teal" radius="sm" variant="light">
                  <GitBranch size={18} />
                </ThemeIcon>
                <CardTitle>{t("dashboard.graph")}</CardTitle>
              </CardHeader>
              <CardContent>
                {goalOptions.length > 0 ? (
                  <Select
                    data={goalOptions}
                    label={t("dashboard.goalSkillJump")}
                    onChange={(skillId) => {
                      if (skillId) {
                        void navigate({
                          to: "/skills/$skillId",
                          params: { skillId },
                        });
                      }
                    }}
                    placeholder={t("dashboard.chooseSkill")}
                  />
                ) : null}
                {data.graph.nodes.length > 0 ? (
                  <SkillGraph graph={data.graph} />
                ) : (
                  <Text c="dimmed">{t("dashboard.noGraph")}</Text>
                )}
              </CardContent>
            </Card>

            {data.recentActivity.length > 0 ? (
              <Card>
                <CardHeader>
                  <ThemeIcon color="blue" radius="sm" variant="light">
                    <Clock3 size={18} />
                  </ThemeIcon>
                  <CardTitle>{t("dashboard.recentActivity")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.recentActivity.slice(0, 6).map((event) => (
                    <ActivityRow key={event.id} event={event} locale={i18n.language} />
                  ))}
                  <Button color="gray" component={Link} to="/history" variant="default">
                    {t("dashboard.openHistory")}
                  </Button>
                </CardContent>
              </Card>
            ) : null}
          </>
        ) : null}
      </PageSection>
    </Container>
  );
}

function ReviewItem({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <Paper
      bg="var(--mantine-color-default-hover)"
      p="md"
      radius="md"
      style={{ border: "1px solid var(--mantine-color-default-border)" }}
    >
      <Stack gap={4}>
        <Text c="dimmed" size="sm">
          {label}
        </Text>
        <Text fw={700}>{value}</Text>
        <Text c="dimmed" size="sm">
          {description}
        </Text>
      </Stack>
    </Paper>
  );
}

function SkillProgressRow({
  summary,
}: {
  summary: {
    skill: { id: string; title: string; level: string };
    score: number;
    attemptCount: number;
    dueReviewCount: number;
  };
}) {
  const { t } = useTranslation();

  return (
    <Paper bg="var(--mantine-color-default-hover)" p="md" radius="sm">
      <Group justify="space-between" gap="md">
        <Stack gap={6} style={{ flex: 1 }}>
          <Group justify="space-between" gap="sm">
            <Text fw={650}>{summary.skill.title}</Text>
            <Badge variant={skillColor(summary.skill.level)}>
              {t(`options.skillLevels.${summary.skill.level}`)}
            </Badge>
          </Group>
          <Progress value={summary.score} color={readinessColor(summary.score)} />
          <Text c="dimmed" size="xs">
            {t("dashboard.skillSignals", {
              attempts: summary.attemptCount,
              reviews: summary.dueReviewCount,
            })}
          </Text>
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
  );
}

function ActivityRow({
  event,
  locale,
}: {
  event: {
    id: string;
    kind: string;
    title: string;
    summary: string;
    occurredAt: Date | string;
    tone: string;
  };
  locale: string;
}) {
  const { t } = useTranslation();

  return (
    <Paper bg="var(--mantine-color-default-hover)" p="md" radius="sm">
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
              {formatDate(event.occurredAt, locale)}
            </Text>
          </Group>
          <Text fw={650}>{event.title}</Text>
          <Text c="dimmed" size="sm" lineClamp={2}>
            {event.summary}
          </Text>
        </Stack>
      </Group>
    </Paper>
  );
}
