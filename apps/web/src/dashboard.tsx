import { Link } from "@tanstack/react-router";
import { CalendarClock, CheckCircle2, Database, FileText, Target, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@leetgrind/ui";
import { trpc } from "./trpc";

function readPreferenceArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function readGoalType(value: Record<string, unknown> | undefined) {
  return typeof value?.goalType === "string" ? value.goalType : "job-search";
}

export function DashboardRoute() {
  const { t } = useTranslation();
  const onboarding = trpc.onboarding.getState.useQuery();
  const profile = onboarding.data?.profile;
  const preferences = profile?.preferences ?? {};
  const programmingLanguages = readPreferenceArray(preferences.programmingLanguages);
  const goals = onboarding.data?.goals ?? [];
  const skills = onboarding.data?.skills ?? [];
  const weakSkills = skills.filter((skill) => skill.level === "weak" || skill.level === "unknown");
  const strongSkills = skills.filter((skill) => skill.level === "strong" || skill.level === "developing");

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8">
      <div className="grid gap-5 border-b border-zinc-800 pb-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase text-cyan-300">
            {onboarding.data?.isComplete ? t("dashboard.ready") : t("app.dashboard")}
          </p>
          <h1 className="text-4xl font-semibold text-zinc-50">{t("dashboard.title")}</h1>
          <p className="max-w-3xl text-lg leading-8 text-zinc-300">{t("dashboard.subtitle")}</p>
        </div>
        <div className="rounded-md border border-zinc-800 bg-zinc-900 p-4">
          <div className="flex items-center gap-2 text-sm text-emerald-200">
            <Database className="h-4 w-4" />
            {t("dashboard.localOnly")}
          </div>
          <Button asChild className="mt-4 w-full" variant={onboarding.data?.isComplete ? "secondary" : "default"}>
            <Link to="/onboarding">{t("dashboard.continueSetup")}</Link>
          </Button>
        </div>
      </div>

      {!onboarding.data?.isComplete ? (
        <div className="rounded-md border border-amber-400/30 bg-amber-400/10 p-5 text-amber-100">
          {t("dashboard.incomplete")} {t("dashboard.emptyState")}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="text-sm font-medium uppercase text-zinc-400">{t("dashboard.profile")}</h2>
          <p className="mt-4 text-2xl font-semibold">{profile?.displayName ?? t("options.empty")}</p>
          <p className="mt-2 text-sm text-zinc-400">{profile?.targetRole ?? t("options.empty")}</p>
        </article>
        <article className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="text-sm font-medium uppercase text-zinc-400">{t("dashboard.goals")}</h2>
          <p className="mt-4 text-2xl font-semibold">{goals.length}</p>
          <p className="mt-2 truncate text-sm text-zinc-400">{goals[0]?.title ?? t("options.empty")}</p>
        </article>
        <article className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="text-sm font-medium uppercase text-zinc-400">{t("dashboard.skills")}</h2>
          <p className="mt-4 text-2xl font-semibold">{skills.length}</p>
          <p className="mt-2 text-sm text-zinc-400">{programmingLanguages.join(", ") || t("options.empty")}</p>
        </article>
        <article className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="text-sm font-medium uppercase text-zinc-400">{t("dashboard.resume")}</h2>
          <div className="mt-4 flex items-center gap-2 text-lg font-semibold">
            {onboarding.data?.resumeDocument ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-300" />
            ) : (
              <FileText className="h-5 w-5 text-zinc-500" />
            )}
            <span>{onboarding.data?.resumeDocument?.title ?? t("dashboard.noResume")}</span>
          </div>
        </article>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-300" />
            <h2 className="text-xl font-semibold">{t("dashboard.primaryGoal")}</h2>
          </div>
          <div className="mt-5 grid gap-3">
            {goals.length > 0 ? (
              goals.map((goal) => (
                <div key={goal.id} className="grid gap-3 rounded-md border border-zinc-800 bg-zinc-950 p-4 md:grid-cols-[1fr_auto]">
                  <div>
                    <h3 className="font-semibold text-zinc-50">{goal.title}</h3>
                    <p className="mt-1 text-sm text-zinc-400">{goal.targetRole ?? t("options.empty")}</p>
                  </div>
                  <span className="h-max rounded-md bg-cyan-400/10 px-3 py-1 text-sm text-cyan-200">
                    {t(`options.goalTypes.${readGoalType(goal.metadata)}`)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-zinc-400">{t("dashboard.emptyState")}</p>
            )}
          </div>
        </section>

        <section className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-amber-300" />
            <h2 className="text-xl font-semibold">{t("dashboard.nextActions")}</h2>
          </div>
          <div className="mt-5 grid gap-3">
            {[t("dashboard.actionReview"), t("dashboard.actionDashboard"), t("dashboard.actionPractice")].map(
              (action) => (
                <div key={action} className="flex items-center gap-3 rounded-md border border-zinc-800 bg-zinc-950 p-3 text-sm">
                  <Zap className="h-4 w-4 text-emerald-300" />
                  <span>{action}</span>
                </div>
              )
            )}
          </div>
        </section>
      </div>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="text-xl font-semibold">{t("dashboard.topSkills")}</h2>
          <div className="mt-5 grid gap-3">
            {strongSkills.slice(0, 6).map((skill) => (
              <div key={skill.id} className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-950 px-4 py-3">
                <span>{skill.title}</span>
                <span className="rounded-md bg-emerald-400/10 px-2 py-1 text-xs text-emerald-200">
                  {t(`options.skillLevels.${skill.level}`)}
                </span>
              </div>
            ))}
            {strongSkills.length === 0 ? <p className="text-zinc-400">{t("options.empty")}</p> : null}
          </div>
        </div>

        <div className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="text-xl font-semibold">{t("dashboard.nextActions")}</h2>
          <div className="mt-5 grid gap-3">
            {weakSkills.slice(0, 6).map((skill) => (
              <div key={skill.id} className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-950 px-4 py-3">
                <span>{skill.title}</span>
                <span className="rounded-md bg-amber-400/10 px-2 py-1 text-xs text-amber-200">
                  {t(`options.skillLevels.${skill.level}`)}
                </span>
              </div>
            ))}
            {weakSkills.length === 0 ? <p className="text-zinc-400">{t("options.empty")}</p> : null}
          </div>
        </div>
      </section>

      <div className="border-t border-zinc-800 pt-6 text-zinc-300">{t("dashboard.next")}</div>
    </section>
  );
}
