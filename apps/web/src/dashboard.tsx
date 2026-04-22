import { Link } from "@tanstack/react-router";
import {
  CalendarClock,
  CheckCircle2,
  FileText,
  Target,
  Zap,
} from "lucide-react";
import { useTranslation } from "react-i18next";
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
} from "@leetgrind/ui";
import { trpc } from "./trpc";

function readPreferenceArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function readGoalType(value: Record<string, unknown> | undefined) {
  return typeof value?.goalType === "string" ? value.goalType : "job-search";
}

export function DashboardRoute() {
  const { t } = useTranslation();
  const onboarding = trpc.onboarding.getState.useQuery();
  const profile = onboarding.data?.profile;
  const preferences = profile?.preferences ?? {};
  const programmingLanguages = readPreferenceArray(
    preferences.programmingLanguages,
  );
  const goals = onboarding.data?.goals ?? [];
  const skills = onboarding.data?.skills ?? [];
  const weakSkills = skills.filter(
    (skill) => skill.level === "weak" || skill.level === "unknown",
  );
  const strongSkills = skills.filter(
    (skill) => skill.level === "strong" || skill.level === "developing",
  );

  return (
    <Container>
      <PageSection>
        <PageHeader>
          <Stack gap="xs" maw={760}>
            <Kicker>
              {onboarding.data?.isComplete
                ? t("dashboard.ready")
                : t("app.dashboard")}
            </Kicker>
            <PageTitle>{t("dashboard.title")}</PageTitle>
            <PageLead>{t("dashboard.subtitle")}</PageLead>
          </Stack>
          <Button
            color={onboarding.data?.isComplete ? "gray" : "teal"}
            component={Link}
            to="/onboarding"
            variant={onboarding.data?.isComplete ? "default" : "filled"}
          >
            {t("dashboard.continueSetup")}
          </Button>
        </PageHeader>

        {!onboarding.data?.isComplete ? (
          <Alert color="yellow" radius="sm" variant="light">
            {t("dashboard.incomplete")} {t("dashboard.emptyState")}
          </Alert>
        ) : null}

        <SimpleGrid cols={{ base: 1, md: 2, xl: 4 }} spacing="md">
          <Card>
            <CardHeader>
              <CardDescription tt="uppercase">
                {t("dashboard.profile")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Text fw={700} size="xl">
                {profile?.displayName ?? t("options.empty")}
              </Text>
              <Text c="dimmed" size="sm">
                {profile?.targetRole ?? t("options.empty")}
              </Text>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription tt="uppercase">
                {t("dashboard.goals")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Text fw={700} size="xl">
                {goals.length}
              </Text>
              <Text c="dimmed" lineClamp={1} size="sm">
                {goals[0]?.title ?? t("options.empty")}
              </Text>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription tt="uppercase">
                {t("dashboard.skills")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Text fw={700} size="xl">
                {skills.length}
              </Text>
              <Text c="dimmed" size="sm">
                {programmingLanguages.join(", ") || t("options.empty")}
              </Text>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription tt="uppercase">
                {t("dashboard.resume")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Group gap="xs" wrap="nowrap">
                <ThemeIcon
                  color={onboarding.data?.resumeDocument ? "teal" : "gray"}
                  radius="sm"
                  size="sm"
                  variant="light"
                >
                  {onboarding.data?.resumeDocument ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <FileText size={16} />
                  )}
                </ThemeIcon>
                <Text fw={700} lineClamp={2}>
                  {onboarding.data?.resumeDocument?.title ??
                    t("dashboard.noResume")}
                </Text>
              </Group>
            </CardContent>
          </Card>
        </SimpleGrid>

        <Box
          style={{
            display: "grid",
            gap: "var(--mantine-spacing-lg)",
            gridTemplateColumns: "minmax(0, 1fr)",
          }}
        >
          <Card>
            <CardHeader>
              <ThemeIcon color="teal" radius="sm" variant="light">
                <Target size={18} />
              </ThemeIcon>
              <CardTitle>{t("dashboard.primaryGoal")}</CardTitle>
            </CardHeader>
            <CardContent>
              {goals.length > 0 ? (
                goals.map((goal) => (
                  <Paper
                    key={goal.id}
                    bg="var(--mantine-color-default-hover)"
                    p="md"
                    radius="sm"
                  >
                    <Group align="flex-start" justify="space-between" gap="md">
                      <Stack gap={4}>
                        <Text fw={650}>{goal.title}</Text>
                        <Text c="dimmed" size="sm">
                          {goal.targetRole ?? t("options.empty")}
                        </Text>
                      </Stack>
                      <Badge variant="info">
                        {t(`options.goalTypes.${readGoalType(goal.metadata)}`)}
                      </Badge>
                    </Group>
                  </Paper>
                ))
              ) : (
                <Text c="dimmed">{t("dashboard.emptyState")}</Text>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <ThemeIcon color="yellow" radius="sm" variant="light">
                <CalendarClock size={18} />
              </ThemeIcon>
              <CardTitle>{t("dashboard.focusAreas")}</CardTitle>
            </CardHeader>
            <CardContent>
              {[
                t("dashboard.actionReview"),
                t("dashboard.actionGoals"),
                t("dashboard.actionResume"),
              ].map((action) => (
                <Paper
                  key={action}
                  bg="var(--mantine-color-default-hover)"
                  p="sm"
                  radius="sm"
                >
                  <Group gap="sm" wrap="nowrap">
                    <Zap size={16} color="var(--mantine-color-teal-7)" />
                    <Text size="sm">{action}</Text>
                  </Group>
                </Paper>
              ))}
            </CardContent>
          </Card>
        </Box>

        <SimpleGrid component="section" cols={{ base: 1, lg: 2 }} spacing="lg">
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.topSkills")}</CardTitle>
            </CardHeader>
            <CardContent>
              {strongSkills.slice(0, 6).map((skill) => (
                <Paper
                  key={skill.id}
                  bg="var(--mantine-color-default-hover)"
                  p="md"
                  radius="sm"
                >
                  <Group justify="space-between" gap="sm">
                    <Text>{skill.title}</Text>
                    <Badge variant="success">
                      {t(`options.skillLevels.${skill.level}`)}
                    </Badge>
                  </Group>
                </Paper>
              ))}
              {strongSkills.length === 0 ? (
                <Text c="dimmed">{t("options.empty")}</Text>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.weakSkills")}</CardTitle>
            </CardHeader>
            <CardContent>
              {weakSkills.slice(0, 6).map((skill) => (
                <Paper
                  key={skill.id}
                  bg="var(--mantine-color-default-hover)"
                  p="md"
                  radius="sm"
                >
                  <Group justify="space-between" gap="sm">
                    <Text>{skill.title}</Text>
                    <Badge variant="warning">
                      {t(`options.skillLevels.${skill.level}`)}
                    </Badge>
                  </Group>
                </Paper>
              ))}
              {weakSkills.length === 0 ? (
                <Text c="dimmed">{t("options.empty")}</Text>
              ) : null}
            </CardContent>
          </Card>
        </SimpleGrid>
      </PageSection>
    </Container>
  );
}
