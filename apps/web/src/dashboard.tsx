import { Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@leetgrind/ui";
import { trpc } from "./trpc";

function readPreferenceArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function DashboardRoute() {
  const { t } = useTranslation();
  const onboarding = trpc.onboarding.getState.useQuery();
  const profile = onboarding.data?.profile;
  const preferences = profile?.preferences ?? {};
  const programmingLanguages = readPreferenceArray(preferences.programmingLanguages);

  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-6 py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl space-y-3">
          <p className="text-sm font-medium uppercase text-cyan-300">{t("dashboard.ready")}</p>
          <h1 className="text-4xl font-semibold text-zinc-50">{t("dashboard.title")}</h1>
          <p className="text-lg leading-8 text-zinc-300">{t("dashboard.subtitle")}</p>
        </div>
        <Button asChild variant={onboarding.data?.isComplete ? "secondary" : "default"}>
          <Link to="/onboarding">{t("dashboard.continueSetup")}</Link>
        </Button>
      </div>

      {!onboarding.data?.isComplete ? (
        <div className="rounded-md border border-amber-400/30 bg-amber-400/10 p-5 text-amber-100">
          {t("dashboard.incomplete")}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <article className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="text-sm font-medium uppercase text-zinc-400">{t("dashboard.profile")}</h2>
          <p className="mt-4 text-2xl font-semibold">{profile?.displayName ?? t("options.empty")}</p>
          <p className="mt-2 text-sm text-zinc-400">{profile?.targetRole ?? t("options.empty")}</p>
        </article>
        <article className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="text-sm font-medium uppercase text-zinc-400">{t("dashboard.goals")}</h2>
          <p className="mt-4 text-2xl font-semibold">{onboarding.data?.goals.length ?? 0}</p>
          <p className="mt-2 text-sm text-zinc-400">
            {onboarding.data?.goals[0]?.title ?? t("options.empty")}
          </p>
        </article>
        <article className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="text-sm font-medium uppercase text-zinc-400">{t("dashboard.skills")}</h2>
          <p className="mt-4 text-2xl font-semibold">{onboarding.data?.skills.length ?? 0}</p>
          <p className="mt-2 text-sm text-zinc-400">
            {programmingLanguages.join(", ") || t("options.empty")}
          </p>
        </article>
        <article className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="text-sm font-medium uppercase text-zinc-400">{t("dashboard.resume")}</h2>
          <div className="mt-4 flex items-center gap-2 text-lg font-semibold">
            {onboarding.data?.resumeDocument ? <CheckCircle2 className="h-5 w-5 text-emerald-300" /> : null}
            <span>{onboarding.data?.resumeDocument?.title ?? t("dashboard.noResume")}</span>
          </div>
        </article>
      </div>

      <div className="border-t border-zinc-800 pt-6 text-zinc-300">{t("dashboard.next")}</div>
    </section>
  );
}
