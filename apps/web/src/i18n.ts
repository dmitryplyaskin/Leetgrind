import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const savedLocale =
  typeof window === "undefined" ? null : window.localStorage.getItem("leetgrind.uiLocale");

const browserLocale =
  typeof navigator === "undefined" ? "en" : navigator.language.toLocaleLowerCase().startsWith("ru") ? "ru" : "en";

export const resources = {
  en: {
    translation: {
      app: {
        dashboard: "Dashboard",
        onboarding: "Onboarding",
        localApi: "Local API",
        apiState: {
          online: "online",
          offline: "offline",
          checking: "checking"
        }
      },
      home: {
        eyebrow: "Local-first interview preparation",
        title: "AI mentor, coding practice, and skill progress in one local workspace.",
        copy: "Start with a compact onboarding flow so Leetgrind can adapt practice, reviews, and future AI mentoring to your goals.",
        start: "Start setup",
        dashboard: "Open dashboard"
      },
      dashboard: {
        title: "Preparation dashboard",
        subtitle: "Your local workspace for goals, skills, evidence, and review planning.",
        incomplete: "Onboarding is not complete yet.",
        continueSetup: "Continue setup",
        profile: "Profile",
        goals: "Goals",
        skills: "Skills",
        resume: "Resume source",
        ready: "Onboarding complete",
        noResume: "No resume document yet",
        next: "Next phase will turn this saved context into progress signals and graph views."
      },
      onboarding: {
        title: "Set up your local mentor context",
        subtitle: "This data stays in the local database and works without an AI provider.",
        save: "Complete onboarding",
        saving: "Saving...",
        saved: "Onboarding saved locally",
        addGoal: "Add goal",
        addSkill: "Add skill",
        remove: "Remove",
        steps: {
          welcome: "Welcome",
          goals: "Goals",
          skills: "Skills",
          resume: "Resume",
          preferences: "Preferences"
        },
        fields: {
          displayName: "Display name",
          targetRole: "Target role",
          experienceLevel: "Experience level",
          goalTitle: "Goal title",
          goalType: "Goal type",
          targetCompany: "Target company",
          targetSeniority: "Target seniority",
          interviewDate: "Interview date",
          focusAreas: "Focus areas",
          goalDescription: "Goal notes",
          skillTitle: "Skill",
          skillLevel: "Confidence",
          skillDescription: "Notes",
          resumeTitle: "Document title",
          resumeContent: "Resume or background text",
          uiLocale: "Interface language",
          contentLanguage: "Learning content language",
          programmingLanguages: "Programming languages",
          studyRhythm: "Study rhythm",
          preferredAiProviderKind: "AI provider"
        },
        hints: {
          commaSeparated: "Comma-separated",
          aiOptional: "AI can be configured later."
        }
      },
      options: {
        empty: "Not specified",
        levels: {
          beginner: "Beginner",
          junior: "Junior",
          middle: "Middle",
          senior: "Senior",
          expert: "Expert"
        },
        skillLevels: {
          unknown: "Unknown",
          weak: "Weak",
          developing: "Developing",
          strong: "Strong"
        },
        goalTypes: {
          "job-search": "Job search",
          "company-interview": "Company interview",
          "role-growth": "Role growth",
          "skill-growth": "Skill growth",
          custom: "Custom"
        },
        seniority: {
          intern: "Intern",
          junior: "Junior",
          middle: "Middle",
          senior: "Senior",
          staff: "Staff",
          lead: "Lead"
        },
        contentLanguage: {
          ru: "Russian",
          en: "English",
          mixed: "Mixed"
        },
        studyRhythm: {
          daily: "Daily",
          weekdays: "Weekdays",
          weekends: "Weekends",
          weekly: "Weekly",
          flexible: "Flexible"
        },
        providers: {
          "not-configured": "Configure later",
          "openai-codex": "Codex subscription auth",
          "openai-api-key": "OpenAI API key",
          openrouter: "OpenRouter",
          local: "Local provider"
        }
      }
    }
  },
  ru: {
    translation: {
      app: {
        dashboard: "Дашборд",
        onboarding: "Онбординг",
        localApi: "Локальный API",
        apiState: {
          online: "онлайн",
          offline: "офлайн",
          checking: "проверка"
        }
      },
      home: {
        eyebrow: "Локальная подготовка к собеседованиям",
        title: "AI-ментор, практика кода и прогресс навыков в одном локальном рабочем месте.",
        copy: "Начни с короткого онбординга, чтобы Leetgrind адаптировал практику, повторение и будущего AI-ментора под твои цели.",
        start: "Начать настройку",
        dashboard: "Открыть дашборд"
      },
      dashboard: {
        title: "Дашборд подготовки",
        subtitle: "Локальное рабочее место для целей, навыков, evidence и планирования повторений.",
        incomplete: "Онбординг еще не завершен.",
        continueSetup: "Продолжить настройку",
        profile: "Профиль",
        goals: "Цели",
        skills: "Навыки",
        resume: "Источник резюме",
        ready: "Онбординг завершен",
        noResume: "Документ резюме пока не добавлен",
        next: "Следующая фаза превратит сохраненный контекст в сигналы прогресса и граф знаний."
      },
      onboarding: {
        title: "Настрой локальный контекст ментора",
        subtitle: "Эти данные остаются в локальной базе и работают без AI-провайдера.",
        save: "Завершить онбординг",
        saving: "Сохранение...",
        saved: "Онбординг сохранен локально",
        addGoal: "Добавить цель",
        addSkill: "Добавить навык",
        remove: "Удалить",
        steps: {
          welcome: "Старт",
          goals: "Цели",
          skills: "Навыки",
          resume: "Резюме",
          preferences: "Предпочтения"
        },
        fields: {
          displayName: "Имя",
          targetRole: "Целевая роль",
          experienceLevel: "Уровень опыта",
          goalTitle: "Название цели",
          goalType: "Тип цели",
          targetCompany: "Целевая компания",
          targetSeniority: "Уровень собеседования",
          interviewDate: "Дата собеседования",
          focusAreas: "Фокусные темы",
          goalDescription: "Заметки по цели",
          skillTitle: "Навык",
          skillLevel: "Уверенность",
          skillDescription: "Заметки",
          resumeTitle: "Название документа",
          resumeContent: "Резюме или описание опыта",
          uiLocale: "Язык интерфейса",
          contentLanguage: "Язык учебного контента",
          programmingLanguages: "Языки программирования",
          studyRhythm: "Ритм занятий",
          preferredAiProviderKind: "AI-провайдер"
        },
        hints: {
          commaSeparated: "Через запятую",
          aiOptional: "AI можно настроить позже."
        }
      },
      options: {
        empty: "Не указано",
        levels: {
          beginner: "Начинающий",
          junior: "Junior",
          middle: "Middle",
          senior: "Senior",
          expert: "Expert"
        },
        skillLevels: {
          unknown: "Неизвестно",
          weak: "Слабый",
          developing: "Развивается",
          strong: "Сильный"
        },
        goalTypes: {
          "job-search": "Поиск работы",
          "company-interview": "Собеседование в компанию",
          "role-growth": "Рост в роли",
          "skill-growth": "Рост навыка",
          custom: "Другое"
        },
        seniority: {
          intern: "Intern",
          junior: "Junior",
          middle: "Middle",
          senior: "Senior",
          staff: "Staff",
          lead: "Lead"
        },
        contentLanguage: {
          ru: "Русский",
          en: "Английский",
          mixed: "Смешанный"
        },
        studyRhythm: {
          daily: "Каждый день",
          weekdays: "По будням",
          weekends: "По выходным",
          weekly: "Раз в неделю",
          flexible: "Гибко"
        },
        providers: {
          "not-configured": "Настроить позже",
          "openai-codex": "Codex subscription auth",
          "openai-api-key": "OpenAI API key",
          openrouter: "OpenRouter",
          local: "Локальный провайдер"
        }
      }
    }
  }
} as const;

void i18n.use(initReactI18next).init({
  resources,
  lng: savedLocale === "ru" || savedLocale === "en" ? savedLocale : browserLocale,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false
  }
});

i18n.on("languageChanged", (locale) => {
  if (typeof window !== "undefined" && (locale === "ru" || locale === "en")) {
    window.localStorage.setItem("leetgrind.uiLocale", locale);
  }
});

export { i18n };
