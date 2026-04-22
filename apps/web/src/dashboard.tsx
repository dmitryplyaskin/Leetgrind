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
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Container,
  Kicker,
  PageHeader,
  PageLead,
  PageSection,
  PageTitle,
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
          <div className="space-y-3">
            <Kicker>
              {onboarding.data?.isComplete
                ? t("dashboard.ready")
                : t("app.dashboard")}
            </Kicker>
            <PageTitle>{t("dashboard.title")}</PageTitle>
            <PageLead>{t("dashboard.subtitle")}</PageLead>
          </div>
          <Button
            asChild
            variant={onboarding.data?.isComplete ? "secondary" : "default"}
          >
            <Link to="/onboarding">{t("dashboard.continueSetup")}</Link>
          </Button>
        </PageHeader>

        {!onboarding.data?.isComplete ? (
          <div className="rounded-md border border-[var(--lg-warning-soft)] bg-[var(--lg-warning-soft)] p-5 text-sm text-[var(--lg-warning-text)]">
            {t("dashboard.incomplete")} {t("dashboard.emptyState")}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader>
              <CardDescription className="uppercase">
                {t("dashboard.profile")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">
                {profile?.displayName ?? t("options.empty")}
              </p>
              <p className="mt-2 text-sm text-[var(--lg-muted)]">
                {profile?.targetRole ?? t("options.empty")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription className="uppercase">
                {t("dashboard.goals")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{goals.length}</p>
              <p className="mt-2 truncate text-sm text-[var(--lg-muted)]">
                {goals[0]?.title ?? t("options.empty")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription className="uppercase">
                {t("dashboard.skills")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{skills.length}</p>
              <p className="mt-2 text-sm text-[var(--lg-muted)]">
                {programmingLanguages.join(", ") || t("options.empty")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription className="uppercase">
                {t("dashboard.resume")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-lg font-semibold">
                {onboarding.data?.resumeDocument ? (
                  <CheckCircle2 className="h-5 w-5 text-[var(--lg-primary-text)]" />
                ) : (
                  <FileText className="h-5 w-5 text-[var(--lg-subtle)]" />
                )}
                <span>
                  {onboarding.data?.resumeDocument?.title ??
                    t("dashboard.noResume")}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card>
            <CardHeader className="flex items-center gap-2">
              <Target className="h-5 w-5 text-[var(--lg-primary-text)]" />
              <CardTitle>{t("dashboard.primaryGoal")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {goals.length > 0 ? (
                goals.map((goal) => (
                  <div
                    key={goal.id}
                    className="grid gap-3 border-t border-[var(--lg-border)] pt-4 first:border-t-0 first:pt-0 md:grid-cols-[1fr_auto]"
                  >
                    <div>
                      <h3 className="font-semibold text-[var(--lg-text)]">
                        {goal.title}
                      </h3>
                      <p className="mt-1 text-sm text-[var(--lg-muted)]">
                        {goal.targetRole ?? t("options.empty")}
                      </p>
                    </div>
                    <Badge variant="info">
                      {t(`options.goalTypes.${readGoalType(goal.metadata)}`)}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-[var(--lg-muted)]">
                  {t("dashboard.emptyState")}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-[var(--lg-warning-text)]" />
              <CardTitle>{t("dashboard.focusAreas")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {[
                t("dashboard.actionReview"),
                t("dashboard.actionGoals"),
                t("dashboard.actionResume"),
              ].map((action) => (
                <div
                  key={action}
                  className="flex items-center gap-3 rounded-md bg-[var(--lg-surface-muted)] p-3 text-sm"
                >
                  <Zap className="h-4 w-4 text-[var(--lg-primary-text)]" />
                  <span>{action}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <section className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.topSkills")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {strongSkills.slice(0, 6).map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center justify-between gap-3 rounded-md bg-[var(--lg-surface-muted)] px-4 py-3"
                >
                  <span>{skill.title}</span>
                  <Badge variant="success">
                    {t(`options.skillLevels.${skill.level}`)}
                  </Badge>
                </div>
              ))}
              {strongSkills.length === 0 ? (
                <p className="text-[var(--lg-muted)]">{t("options.empty")}</p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.weakSkills")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {weakSkills.slice(0, 6).map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center justify-between gap-3 rounded-md bg-[var(--lg-surface-muted)] px-4 py-3"
                >
                  <span>{skill.title}</span>
                  <Badge variant="warning">
                    {t(`options.skillLevels.${skill.level}`)}
                  </Badge>
                </div>
              ))}
              {weakSkills.length === 0 ? (
                <p className="text-[var(--lg-muted)]">{t("options.empty")}</p>
              ) : null}
            </CardContent>
          </Card>
        </section>
      </PageSection>
    </Container>
  );
}
