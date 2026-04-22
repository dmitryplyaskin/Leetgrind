import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Database, Plus, Save, Trash2 } from "lucide-react";
import { useEffect } from "react";
import type { SelectHTMLAttributes } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { z } from "zod";
import {
  type OnboardingCompleteInput,
  onboardingCompleteInputSchema
} from "@leetgrind/shared";
import { Button } from "@leetgrind/ui";
import { i18n } from "./i18n";
import { trpc } from "./trpc";

type Locale = "ru" | "en";
type OnboardingFormInput = z.input<typeof onboardingCompleteInputSchema>;

const fieldClass =
  "mt-2 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none transition focus:border-emerald-300";
const labelClass = "text-sm font-medium text-zinc-200";

const defaultValues: OnboardingFormInput = {
  profile: {
    displayName: null,
    targetRole: "Frontend Engineer",
    experienceLevel: "middle"
  },
  goals: [
    {
      title: "Frontend interview preparation",
      goalType: "job-search",
      targetRole: "Frontend Engineer",
      targetCompany: null,
      targetSeniority: "middle",
      interviewDate: null,
      focusAreas: ["React", "Algorithms"],
      description: null
    }
  ],
  skills: [
    { title: "React", level: "developing", description: null },
    { title: "Algorithms", level: "weak", description: null },
    { title: "TypeScript", level: "developing", description: null }
  ],
  resume: {
    title: "Resume",
    content: "Paste your resume, background, or current experience summary here."
  },
  preferences: {
      uiLocale: i18n.language === "ru" ? "ru" : "en",
    contentLanguage: "mixed",
    programmingLanguages: ["typescript"],
    studyRhythm: "daily",
    preferredAiProviderKind: "not-configured"
  }
};

function toCsv(value: string[]) {
  return value.join(", ");
}

function fromCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function localeOrDefault(value: unknown, fallback: Locale): Locale {
  return value === "ru" || value === "en" ? value : fallback;
}

function SelectField({
  label,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <label className={labelClass}>
      {label}
      <select {...props} className={fieldClass}>
        {children}
      </select>
    </label>
  );
}

export function OnboardingRoute() {
  const { t } = useTranslation();
  const navigate = useNavigate({ from: "/onboarding" });
  const utils = trpc.useUtils();
  const onboarding = trpc.onboarding.getState.useQuery();
  const saveDraft = trpc.onboarding.saveDraft.useMutation({
    onSuccess: async () => {
      await utils.onboarding.getState.invalidate();
    }
  });
  const complete = trpc.onboarding.complete.useMutation({
    onSuccess: async () => {
      await utils.onboarding.getState.invalidate();
      await navigate({ to: "/dashboard" });
    }
  });

  const form = useForm<OnboardingFormInput, unknown, OnboardingCompleteInput>({
    resolver: zodResolver(onboardingCompleteInputSchema),
    defaultValues
  });
  const { control, formState, handleSubmit, register, reset, watch } = form;
  const goalFields = useFieldArray({ control, name: "goals" });
  const skillFields = useFieldArray({ control, name: "skills" });
  const watchedLocale = watch("preferences.uiLocale");

  useEffect(() => {
    void i18n.changeLanguage(watchedLocale);
  }, [watchedLocale]);

  useEffect(() => {
    if (!onboarding.data) {
      return;
    }

    const preferences = onboarding.data.profile.preferences;
    const uiLocale = localeOrDefault(preferences.uiLocale, watchedLocale);

    reset({
      profile: {
        displayName: onboarding.data.profile.displayName,
        targetRole: onboarding.data.profile.targetRole,
        experienceLevel: onboarding.data.profile.experienceLevel
      },
      goals:
        onboarding.data.goals.length > 0
          ? onboarding.data.goals.map((goal) => {
              const metadata = goal.metadata ?? {};
              return {
                title: goal.title,
                goalType:
                  metadata.goalType === "company-interview" ||
                  metadata.goalType === "role-growth" ||
                  metadata.goalType === "skill-growth" ||
                  metadata.goalType === "custom"
                    ? metadata.goalType
                    : "job-search",
                targetRole: goal.targetRole,
                targetCompany: stringOrNull(metadata.targetCompany),
                targetSeniority:
                  metadata.targetSeniority === "intern" ||
                  metadata.targetSeniority === "junior" ||
                  metadata.targetSeniority === "middle" ||
                  metadata.targetSeniority === "senior" ||
                  metadata.targetSeniority === "staff" ||
                  metadata.targetSeniority === "lead"
                    ? metadata.targetSeniority
                    : null,
                interviewDate: stringOrNull(metadata.interviewDate),
                focusAreas: stringArray(metadata.focusAreas),
                description: goal.description
              };
            })
          : defaultValues.goals,
      skills:
        onboarding.data.skills.length > 0
          ? onboarding.data.skills.map((skill) => ({
              title: skill.title,
              level: skill.level,
              description: skill.description
            }))
          : defaultValues.skills,
      resume: {
        title: onboarding.data.resumeDocument?.title ?? "Resume",
        content: onboarding.data.resumeDocument?.content ?? defaultValues.resume?.content ?? ""
      },
      preferences: {
        uiLocale,
        contentLanguage:
          preferences.contentLanguage === "ru" ||
          preferences.contentLanguage === "en" ||
          preferences.contentLanguage === "mixed"
            ? preferences.contentLanguage
            : "mixed",
        programmingLanguages:
          stringArray(preferences.programmingLanguages).length > 0
            ? stringArray(preferences.programmingLanguages)
            : defaultValues.preferences.programmingLanguages,
        studyRhythm:
          preferences.studyRhythm === "weekdays" ||
          preferences.studyRhythm === "weekends" ||
          preferences.studyRhythm === "weekly" ||
          preferences.studyRhythm === "flexible"
            ? preferences.studyRhythm
            : "daily",
        preferredAiProviderKind:
          preferences.preferredAiProviderKind === "openai-codex" ||
          preferences.preferredAiProviderKind === "openai-api-key" ||
          preferences.preferredAiProviderKind === "openrouter" ||
          preferences.preferredAiProviderKind === "local"
            ? preferences.preferredAiProviderKind
            : "not-configured"
      }
    });
  }, [onboarding.data, reset, watchedLocale]);

  const activeGoals = watch("goals").filter((goal) => goal.title.trim().length > 0);
  const activeSkills = watch("skills").filter((skill) => skill.title.trim().length > 0);
  const programmingLanguages = watch("preferences.programmingLanguages");
  const isSaving = complete.isPending || saveDraft.isPending;

  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-6 py-8">
      <div className="flex flex-col gap-3 border-b border-zinc-800 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-3">
        <p className="text-sm font-medium uppercase text-emerald-300">{t("app.onboarding")}</p>
        <h1 className="text-4xl font-semibold text-zinc-50">{t("onboarding.title")}</h1>
        <p className="text-lg leading-8 text-zinc-300">{t("onboarding.subtitle")}</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-md border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-100">
          <Database className="h-4 w-4" />
          {t("onboarding.offline")}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="h-max rounded-md border border-zinc-800 bg-zinc-900/80 p-5 lg:sticky lg:top-6">
          <h2 className="text-sm font-medium uppercase text-zinc-400">{t("onboarding.progress")}</h2>
          <div className="mt-5 grid gap-3">
            {[
              ["1", t("onboarding.steps.welcome")],
              ["2", t("onboarding.steps.goals")],
              ["3", t("onboarding.steps.skills")],
              ["4", t("onboarding.steps.resume")],
              ["5", t("onboarding.steps.preferences")]
            ].map(([number, label]) => (
              <div key={number} className="flex items-center gap-3 text-sm text-zinc-200">
                <span className="grid h-7 w-7 place-items-center rounded-md bg-zinc-800 text-xs text-emerald-200">
                  {number}
                </span>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 border-t border-zinc-800 pt-5">
            <h3 className="text-sm font-medium uppercase text-zinc-400">{t("onboarding.summary")}</h3>
            <dl className="mt-4 grid gap-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-zinc-400">{t("dashboard.goals")}</dt>
                <dd className="font-semibold text-zinc-50">{activeGoals.length}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-zinc-400">{t("dashboard.skills")}</dt>
                <dd className="font-semibold text-zinc-50">{activeSkills.length}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-zinc-400">{t("onboarding.fields.programmingLanguages")}</dt>
                <dd className="max-w-36 truncate font-semibold text-zinc-50">
                  {programmingLanguages.join(", ")}
                </dd>
              </div>
            </dl>
          </div>
        </aside>

      <form className="grid gap-5" onSubmit={handleSubmit((values) => complete.mutate(values))}>
        <section className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="text-xl font-semibold">{t("onboarding.steps.welcome")}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <label className={labelClass}>
              {t("onboarding.fields.displayName")}
              <input {...register("profile.displayName")} className={fieldClass} />
            </label>
            <label className={labelClass}>
              {t("onboarding.fields.targetRole")}
              <input {...register("profile.targetRole")} className={fieldClass} />
            </label>
            <SelectField label={t("onboarding.fields.experienceLevel")} {...register("profile.experienceLevel")}>
              <option value="beginner">{t("options.levels.beginner")}</option>
              <option value="junior">{t("options.levels.junior")}</option>
              <option value="middle">{t("options.levels.middle")}</option>
              <option value="senior">{t("options.levels.senior")}</option>
              <option value="expert">{t("options.levels.expert")}</option>
            </SelectField>
          </div>
        </section>

        <section className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">{t("onboarding.steps.goals")}</h2>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                goalFields.append({
                  title: "",
                  goalType: "custom",
                  targetRole: null,
                  targetCompany: null,
                  targetSeniority: null,
                  interviewDate: null,
                  focusAreas: [],
                  description: null
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("onboarding.addGoal")}
            </Button>
          </div>
          <div className="mt-5 grid gap-5">
            {goalFields.fields.map((field, index) => (
              <div key={field.id} className="grid gap-4 border-t border-zinc-800 pt-5 md:grid-cols-3">
                <label className={labelClass}>
                  {t("onboarding.fields.goalTitle")}
                  <input {...register(`goals.${index}.title`)} className={fieldClass} />
                </label>
                <SelectField label={t("onboarding.fields.goalType")} {...register(`goals.${index}.goalType`)}>
                  <option value="job-search">{t("options.goalTypes.job-search")}</option>
                  <option value="company-interview">{t("options.goalTypes.company-interview")}</option>
                  <option value="role-growth">{t("options.goalTypes.role-growth")}</option>
                  <option value="skill-growth">{t("options.goalTypes.skill-growth")}</option>
                  <option value="custom">{t("options.goalTypes.custom")}</option>
                </SelectField>
                <label className={labelClass}>
                  {t("onboarding.fields.targetCompany")}
                  <input {...register(`goals.${index}.targetCompany`)} className={fieldClass} />
                </label>
                <label className={labelClass}>
                  {t("onboarding.fields.targetRole")}
                  <input {...register(`goals.${index}.targetRole`)} className={fieldClass} />
                </label>
                <SelectField
                  label={t("onboarding.fields.targetSeniority")}
                  {...register(`goals.${index}.targetSeniority`)}
                >
                  <option value="">{t("options.empty")}</option>
                  <option value="intern">{t("options.seniority.intern")}</option>
                  <option value="junior">{t("options.seniority.junior")}</option>
                  <option value="middle">{t("options.seniority.middle")}</option>
                  <option value="senior">{t("options.seniority.senior")}</option>
                  <option value="staff">{t("options.seniority.staff")}</option>
                  <option value="lead">{t("options.seniority.lead")}</option>
                </SelectField>
                <label className={labelClass}>
                  {t("onboarding.fields.interviewDate")}
                  <input type="date" {...register(`goals.${index}.interviewDate`)} className={fieldClass} />
                </label>
                <Controller
                  control={control}
                  name={`goals.${index}.focusAreas`}
                  render={({ field: controllerField }) => (
                    <label className={labelClass}>
                      {t("onboarding.fields.focusAreas")}
                      <input
                        className={fieldClass}
                        value={toCsv(controllerField.value)}
                        onChange={(event) => controllerField.onChange(fromCsv(event.target.value))}
                        placeholder={t("onboarding.hints.commaSeparated")}
                      />
                    </label>
                  )}
                />
                <label className={`${labelClass} md:col-span-2`}>
                  {t("onboarding.fields.goalDescription")}
                  <input {...register(`goals.${index}.description`)} className={fieldClass} />
                </label>
                {goalFields.fields.length > 1 ? (
                  <Button type="button" variant="ghost" onClick={() => goalFields.remove(index)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("onboarding.remove")}
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">{t("onboarding.steps.skills")}</h2>
            <Button
              type="button"
              variant="secondary"
              onClick={() => skillFields.append({ title: "", level: "unknown", description: null })}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("onboarding.addSkill")}
            </Button>
          </div>
          <div className="mt-5 grid gap-4">
            {skillFields.fields.map((field, index) => (
              <div key={field.id} className="grid gap-4 border-t border-zinc-800 pt-5 md:grid-cols-4">
                <label className={labelClass}>
                  {t("onboarding.fields.skillTitle")}
                  <input {...register(`skills.${index}.title`)} className={fieldClass} />
                </label>
                <SelectField label={t("onboarding.fields.skillLevel")} {...register(`skills.${index}.level`)}>
                  <option value="unknown">{t("options.skillLevels.unknown")}</option>
                  <option value="weak">{t("options.skillLevels.weak")}</option>
                  <option value="developing">{t("options.skillLevels.developing")}</option>
                  <option value="strong">{t("options.skillLevels.strong")}</option>
                </SelectField>
                <label className={`${labelClass} md:col-span-2`}>
                  {t("onboarding.fields.skillDescription")}
                  <input {...register(`skills.${index}.description`)} className={fieldClass} />
                </label>
                {skillFields.fields.length > 1 ? (
                  <Button type="button" variant="ghost" onClick={() => skillFields.remove(index)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("onboarding.remove")}
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="text-xl font-semibold">{t("onboarding.steps.resume")}</h2>
          <div className="mt-5 grid gap-4">
            <label className={labelClass}>
              {t("onboarding.fields.resumeTitle")}
              <input {...register("resume.title")} className={fieldClass} />
            </label>
            <label className={labelClass}>
              {t("onboarding.fields.resumeContent")}
              <textarea {...register("resume.content")} className={`${fieldClass} min-h-40 resize-y`} />
            </label>
          </div>
        </section>

        <section className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="text-xl font-semibold">{t("onboarding.steps.preferences")}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <SelectField label={t("onboarding.fields.uiLocale")} {...register("preferences.uiLocale")}>
              <option value="en">English</option>
              <option value="ru">Русский</option>
            </SelectField>
            <SelectField
              label={t("onboarding.fields.contentLanguage")}
              {...register("preferences.contentLanguage")}
            >
              <option value="mixed">{t("options.contentLanguage.mixed")}</option>
              <option value="en">{t("options.contentLanguage.en")}</option>
              <option value="ru">{t("options.contentLanguage.ru")}</option>
            </SelectField>
            <Controller
              control={control}
              name="preferences.programmingLanguages"
              render={({ field }) => (
                <label className={labelClass}>
                  {t("onboarding.fields.programmingLanguages")}
                  <input
                    className={fieldClass}
                    value={toCsv(field.value)}
                    onChange={(event) => field.onChange(fromCsv(event.target.value))}
                    placeholder={t("onboarding.hints.commaSeparated")}
                  />
                </label>
              )}
            />
            <SelectField label={t("onboarding.fields.studyRhythm")} {...register("preferences.studyRhythm")}>
              <option value="daily">{t("options.studyRhythm.daily")}</option>
              <option value="weekdays">{t("options.studyRhythm.weekdays")}</option>
              <option value="weekends">{t("options.studyRhythm.weekends")}</option>
              <option value="weekly">{t("options.studyRhythm.weekly")}</option>
              <option value="flexible">{t("options.studyRhythm.flexible")}</option>
            </SelectField>
            <SelectField
              label={t("onboarding.fields.preferredAiProviderKind")}
              {...register("preferences.preferredAiProviderKind")}
            >
              <option value="not-configured">{t("options.providers.not-configured")}</option>
              <option value="openai-codex">{t("options.providers.openai-codex")}</option>
              <option value="openai-api-key">{t("options.providers.openai-api-key")}</option>
              <option value="openrouter">{t("options.providers.openrouter")}</option>
              <option value="local">{t("options.providers.local")}</option>
            </SelectField>
          </div>
          <p className="mt-4 text-sm text-zinc-400">{t("onboarding.hints.aiOptional")}</p>
        </section>

        {Object.keys(formState.errors).length > 0 ? (
          <div className="rounded-md border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-100">
            {complete.error?.message ?? "Check required fields before saving."}
          </div>
        ) : null}
        {complete.error || saveDraft.error ? (
          <div className="rounded-md border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-100">
            {complete.error?.message ?? saveDraft.error?.message}
          </div>
        ) : null}
        {complete.isSuccess || saveDraft.isSuccess ? (
          <div className="flex items-center gap-2 rounded-md border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-100">
            <CheckCircle2 className="h-4 w-4" />
            {complete.isSuccess ? t("onboarding.saved") : t("onboarding.draftSaved")}
          </div>
        ) : null}

        <div className="sticky bottom-0 flex flex-col gap-3 border-t border-zinc-800 bg-zinc-950/95 py-4 backdrop-blur sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            disabled={isSaving}
            onClick={handleSubmit((values) => saveDraft.mutate(values))}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving && saveDraft.isPending ? t("onboarding.saving") : t("onboarding.draft")}
          </Button>
          <Button type="submit" disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {complete.isPending ? t("onboarding.saving") : t("onboarding.save")}
          </Button>
        </div>
      </form>
      </div>
    </section>
  );
}
