import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const savedLocale =
  typeof window === "undefined"
    ? null
    : window.localStorage.getItem("leetgrind.uiLocale");

const browserLocale =
  typeof navigator === "undefined"
    ? "en"
    : navigator.language.toLocaleLowerCase().startsWith("ru")
      ? "ru"
      : "en";

export const resources = {
  en: {
    translation: {
      app: {
        dashboard: "Dashboard",
        onboarding: "Onboarding",
        theme: {
          toggle: "Theme",
          light: "Light theme",
          dark: "Dark theme",
        },
      },
      home: {
        eyebrow: "Interview preparation workspace",
        title:
          "AI mentor, coding practice, and skill progress in one focused workspace.",
        copy: "Create your profile, goals, and skill map so practice and reviews start from the right context.",
        start: "Start setup",
        dashboard: "Open dashboard",
      },
      dashboard: {
        title: "Preparation dashboard",
        subtitle:
          "Goals, skills, weak spots, and practice priorities in one view.",
        incomplete:
          "Add your profile, goals, and skills before relying on the dashboard.",
        continueSetup: "Update setup",
        profile: "Profile",
        goals: "Goals",
        skills: "Skills",
        resume: "Resume",
        ready: "Ready to practice",
        noResume: "No resume added",
        primaryGoal: "Primary goal",
        topSkills: "Initial skill map",
        focusAreas: "Focus areas",
        weakSkills: "Skills to improve",
        actionReview: "Review weak skills",
        actionGoals: "Refine goal focus areas",
        actionResume: "Add resume context",
        emptyState: "Add goals and skills to see your first priorities.",
      },
      onboarding: {
        title: "Set up your interview plan",
        subtitle:
          "Tell Leetgrind what you are preparing for, where you feel confident, and what needs work.",
        save: "Save plan",
        draft: "Save draft",
        saving: "Saving...",
        checkRequired: "Check required fields before saving.",
        draftSaved: "Draft saved",
        saved: "Plan saved",
        progress: "Setup",
        summary: "Summary",
        addGoal: "Add goal",
        addSkill: "Add skill",
        remove: "Remove",
        steps: {
          welcome: "Welcome",
          goals: "Goals",
          skills: "Skills",
          resume: "Resume",
          preferences: "Preferences",
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
        },
        hints: {
          commaSeparated: "Comma-separated",
        },
      },
      options: {
        empty: "Not specified",
        levels: {
          beginner: "Beginner",
          junior: "Junior",
          middle: "Middle",
          senior: "Senior",
          expert: "Expert",
        },
        skillLevels: {
          unknown: "Unknown",
          weak: "Weak",
          developing: "Developing",
          strong: "Strong",
        },
        goalTypes: {
          "job-search": "Job search",
          "company-interview": "Company interview",
          "role-growth": "Role growth",
          "skill-growth": "Skill growth",
          custom: "Custom",
        },
        seniority: {
          intern: "Intern",
          junior: "Junior",
          middle: "Middle",
          senior: "Senior",
          staff: "Staff",
          lead: "Lead",
        },
        contentLanguage: {
          ru: "Russian",
          en: "English",
          mixed: "Mixed",
        },
        studyRhythm: {
          daily: "Daily",
          weekdays: "Weekdays",
          weekends: "Weekends",
          weekly: "Weekly",
          flexible: "Flexible",
        },
      },
    },
  },
  ru: {
    translation: {
      app: {
        dashboard: "Дашборд",
        onboarding: "Онбординг",
        theme: {
          toggle: "Тема",
          light: "Светлая тема",
          dark: "Темная тема",
        },
      },
      home: {
        eyebrow: "Рабочее место подготовки",
        title:
          "AI-ментор, практика кода и прогресс навыков в одном сфокусированном рабочем месте.",
        copy: "Создай профиль, цели и карту навыков, чтобы практика и повторения начинались с правильного контекста.",
        start: "Начать настройку",
        dashboard: "Открыть дашборд",
      },
      dashboard: {
        title: "Дашборд подготовки",
        subtitle:
          "Цели, навыки, слабые места и приоритеты практики в одном месте.",
        incomplete:
          "Добавь профиль, цели и навыки, прежде чем опираться на дашборд.",
        continueSetup: "Обновить настройку",
        profile: "Профиль",
        goals: "Цели",
        skills: "Навыки",
        resume: "Резюме",
        ready: "Готов к практике",
        noResume: "Резюме не добавлено",
        primaryGoal: "Главная цель",
        topSkills: "Начальная карта навыков",
        focusAreas: "Фокус",
        weakSkills: "Навыки для прокачки",
        actionReview: "Разобрать слабые навыки",
        actionGoals: "Уточнить фокус целей",
        actionResume: "Добавить контекст резюме",
        emptyState: "Добавь цели и навыки, чтобы увидеть первые приоритеты.",
      },
      onboarding: {
        title: "Настрой план подготовки",
        subtitle:
          "Расскажи, к чему готовишься, где уже уверен и что нужно подтянуть.",
        save: "Сохранить план",
        draft: "Сохранить черновик",
        saving: "Сохранение...",
        checkRequired: "Проверь обязательные поля перед сохранением.",
        draftSaved: "Черновик сохранен",
        saved: "План сохранен",
        progress: "Настройка",
        summary: "Сводка",
        addGoal: "Добавить цель",
        addSkill: "Добавить навык",
        remove: "Удалить",
        steps: {
          welcome: "Старт",
          goals: "Цели",
          skills: "Навыки",
          resume: "Резюме",
          preferences: "Предпочтения",
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
        },
        hints: {
          commaSeparated: "Через запятую",
        },
      },
      options: {
        empty: "Не указано",
        levels: {
          beginner: "Начинающий",
          junior: "Junior",
          middle: "Middle",
          senior: "Senior",
          expert: "Expert",
        },
        skillLevels: {
          unknown: "Неизвестно",
          weak: "Слабый",
          developing: "Развивается",
          strong: "Сильный",
        },
        goalTypes: {
          "job-search": "Поиск работы",
          "company-interview": "Собеседование в компанию",
          "role-growth": "Рост в роли",
          "skill-growth": "Рост навыка",
          custom: "Другое",
        },
        seniority: {
          intern: "Intern",
          junior: "Junior",
          middle: "Middle",
          senior: "Senior",
          staff: "Staff",
          lead: "Lead",
        },
        contentLanguage: {
          ru: "Русский",
          en: "Английский",
          mixed: "Смешанный",
        },
        studyRhythm: {
          daily: "Каждый день",
          weekdays: "По будням",
          weekends: "По выходным",
          weekly: "Раз в неделю",
          flexible: "Гибко",
        },
      },
    },
  },
} as const;

void i18n.use(initReactI18next).init({
  resources,
  lng:
    savedLocale === "ru" || savedLocale === "en" ? savedLocale : browserLocale,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

i18n.on("languageChanged", (locale) => {
  if (typeof window !== "undefined" && (locale === "ru" || locale === "en")) {
    window.localStorage.setItem("leetgrind.uiLocale", locale);
  }
});

export { i18n };
