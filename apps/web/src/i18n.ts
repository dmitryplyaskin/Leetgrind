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
        aiSettings: "AI settings",
        assessments: "Assessments",
        dashboard: "Dashboard",
        history: "History",
        lessons: "Lessons",
        onboarding: "Setup",
        navigation: {
          hideMenu: "Hide menu",
          showMenu: "Show menu",
        },
        theme: {
          toggle: "Theme",
          light: "Light theme",
          dark: "Dark theme",
        },
      },
      common: {
        backToDashboard: "Back to dashboard",
        loadError: "Could not load this view.",
        loading: "Loading...",
        loadingDetail: "Preparing your local workspace.",
        open: "Open",
      },
      aiSettings: {
        kicker: "AI runtime",
        title: "Provider status, content RAG, and preview runs",
        subtitle:
          "Configure the active provider, ingest local documents, inspect retrieval, and verify traced agent runs.",
        manageProviders: "Manage providers",
        providerCard: "Default provider",
        noProvider: "No provider configured",
        noModel: "No model selected",
        embeddingsReady: "Embeddings ready",
        checkConnection: "Check connection",
        previewCard: "Mentor preview",
        previewPrompt: "Preview prompt",
        previewPlaceholder: "Ask for a concise mentor answer grounded in your local documents.",
        runPreview: "Run preview",
        ingestCard: "Document ingestion",
        noteTitle: "Document title",
        noteSource: "Source label",
        noteContent: "Document content",
        ingestDocument: "Ingest document",
        existingDocuments: "Existing documents",
        ingestExisting: "Ingest",
        noDocuments: "No local documents are available yet.",
        searchCard: "RAG search",
        searchPrompt: "Search query",
        searchPlaceholder: "Search local context",
        search: "Search context",
        searchHint: "Save and connect a provider with embeddings before searching.",
        searchMeta: "{{sourceType}} · score {{score}}",
        noSearchResults: "No matching chunks were retrieved.",
        runsCard: "Recent agent runs",
        noRuns: "No agent runs have been recorded yet.",
        runKinds: {
          mentor: "Mentor preview",
          "assessment-mentor": "Assessment workflow",
          interviewer: "Interview workflow",
          "coding-reviewer": "Coding review",
          planner: "Planner workflow",
          "lesson-planner": "Lesson planner",
          recommender: "Recommendation workflow",
          ingestion: "Document ingestion",
          "provider-test": "Provider test"
        },
        runStatus: {
          queued: "Queued",
          running: "Running",
          succeeded: "Succeeded",
          failed: "Failed",
          canceled: "Canceled"
        },
        status: {
          checking: "Checking connection",
          connected: "Connected",
          error: "Connection failed",
          idle: "Status not checked yet",
          notConfigured: "No provider configured"
        }
      },
      aiProviders: {
        kicker: "Provider setup",
        title: "Configure OpenRouter and secure secrets",
        subtitle:
          "Provider metadata stays in the local database, while API secrets are stored in the OS keychain.",
        backToSettings: "Back to AI settings",
        openrouterCard: "OpenRouter provider",
        displayName: "Display name",
        textModel: "Text model",
        embeddingModel: "Embedding model",
        apiKey: "API key",
        makeDefault: "Use as default provider",
        save: "Save provider",
        savedProviders: "Saved providers",
        noProviders: "No providers have been saved yet.",
        default: "Default",
        setDefault: "Set default",
        test: "Test",
        remove: "Remove",
        plannedKinds: "Recognized provider kinds",
        plannedCopy: "This provider kind is recognized in the product contract but not implemented in phase 04.",
        kindNames: {
          "openai-codex": "Codex subscription auth",
          "openai-api-key": "OpenAI API key",
          local: "Local provider"
        }
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
        activeGoal: "Active goal",
        actionReasons: {
          adjacentToStrongSkill: "This topic is close to a skill that already looks strong.",
          negativeEvidence: "Recent evidence points to a gap that should be checked.",
          reviewDue: "The review window for this skill is coming up.",
          storedRecommendation: "This recommendation is already saved in your plan.",
          unknownPrerequisite: "A goal skill depends on this prerequisite.",
          weakGoalSkill: "This skill is important for the active goal and still needs work.",
        },
        actions: {
          learnPrerequisite: "Study the prerequisite",
          practiceWeakSkill: "Practice the weak skill",
          reviewDue: "Review this skill",
          storedRecommendation: "Saved recommendation",
          studyAdjacent: "Study the adjacent topic",
          takeAssessment: "Take a focused check",
        },
        chooseSkill: "Choose a skill",
        dueReviews: "{{count}} due reviews",
        currentRole: "Current role",
        firstSessionKicker: "Ready to start",
        firstSessionTitle: "Your workspace is ready for the first real session.",
        firstSessionSubtitle:
          "Start with one focused check or create the first lesson from the goals and skills you just mapped.",
        goalSkillJump: "Open a goal skill",
        graph: "Knowledge graph",
        kicker: "Progress",
        noActions: "No urgent action is available yet.",
        noActivity: "No activity has been recorded yet.",
        noGoal: "No active goal",
        noGraph: "Add goals and skills to build the graph.",
        noReviews: "No scheduled reviews yet.",
        noWeakSpots: "No weak spots are visible yet.",
        nextActions: "Next actions",
        ofSkills: "of {{count}} tracked skills",
        openGoal: "Open goal",
        openHistory: "Open history",
        title: "Preparation dashboard",
        subtitle:
          "Goals, skills, weak spots, and practice priorities in one view.",
        readiness: "Readiness",
        readinessBands: {
          "at-risk": "At risk",
          "not-started": "Not started",
          progressing: "Progressing",
          ready: "Ready",
        },
        recentActivity: "Recent activity",
        review: "Review",
        skillSignals: "{{attempts}} attempts, {{reviews}} due reviews",
        strongSkills: "Strong skills",
        updatePlan: "Update plan",
        upcomingReviews: "Upcoming reviews",
        weakSpotReasons: {
          "due-review": "Review is due",
          "negative-evidence": "Evidence shows a gap",
          unknown: "Current level is unknown",
          weak: "Current level is weak",
        },
        weakSpots: "Weak spots",
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
        skillMapReady: "{{count}} mapped skills are ready for practice and graph navigation.",
        focusAreas: "Focus areas",
        weakSkills: "Skills to improve",
        actionReview: "Review weak skills",
        actionGoals: "Refine goal focus areas",
        actionResume: "Add resume context",
        emptyState: "Add goals and skills to see your first priorities.",
      },
      goalDetail: {
        kicker: "Goal readiness",
        skillCoverage: "Skill coverage",
        skillCoverageCopy: "{{strong}} strong, {{weak}} weak, {{unknown}} unknown",
        skills: "Goal skills",
        subtitle: "Readiness, weak spots, and next actions for this goal.",
        title: "Goal detail",
      },
      skillDetail: {
        attempts: "{{count}} attempts",
        connected: "Connected skills",
        evidence: "Evidence",
        kicker: "Skill detail",
        level: "Level",
        noConnections: "No connected skills are available yet.",
        noEvidence: "No evidence has been recorded for this skill yet.",
        polarity: {
          gap: "Gap",
          neutral: "Neutral",
          progress: "Progress",
          strength: "Strength",
          weakness: "Weakness",
        },
        reviews: "Reviews",
        score: "Progress score",
        subtitle: "Progress signals, evidence, and graph connections.",
        title: "Skill detail",
      },
      history: {
        empty: "No history events yet.",
        events: "Events",
        kicker: "Progress history",
        kinds: {
          attempt: "Attempt",
          evidence: "Evidence",
          recommendation: "Recommendation",
          review: "Review",
        },
        subtitle: "Attempts, evidence, recommendations, and review signals in one timeline.",
        title: "History",
      },
      assessments: {
        kicker: "Assessments",
        providerCta: "Open AI settings",
        fields: {
          goal: "Goal",
          skill: "Skill",
          focus: "Focus"
        },
        placeholders: {
          goal: "Choose a goal",
          skill: "Choose a skill",
          focus: "Add any specific angle you want the assessment to cover."
        },
        verdicts: {
          excellent: "Excellent",
          pass: "Pass",
          "needs-work": "Needs work",
          fail: "Fail"
        },
        new: {
          title: "Start a focused assessment",
          subtitle: "Pick a goal or skill and generate a mixed-format knowledge check.",
          configure: "Assessment setup",
          start: "Start assessment"
        },
        session: {
          title: "Assessment session",
          subtitle: "Answer each question and then finish the session to get structured feedback.",
          question: "Question",
          answerPlaceholder: "Write your answer here.",
          finish: "Finish assessment"
        },
        result: {
          title: "Assessment result",
          subtitle: "Structured feedback, follow-up lessons, and next actions.",
          pending: "The result is not available yet.",
          score: "Score",
          verdict: "Verdict",
          evidence: "Evidence",
          feedback: "Question feedback"
        }
      },
      lessons: {
        kicker: "Lessons",
        title: "Lessons",
        subtitle: "Create focused lessons from a skill, goal, or custom topic.",
        library: "Lesson library",
        empty: "No lessons are available yet.",
        emptyHint: "Generate a lesson above, or finish an assessment to create follow-up material.",
        providerCta: "Open AI settings",
        back: "Back to lessons",
        openForSkill: "Open lessons",
        fields: {
          goal: "Goal",
          skill: "Skill",
          focus: "Topic"
        },
        placeholders: {
          goal: "Choose a goal",
          skill: "Choose a skill",
          focus: "Describe what you want to learn or clarify."
        },
        create: {
          title: "Create a lesson",
          submit: "Create lesson"
        },
        detail: {
          title: "Lesson detail",
          content: "Lesson content",
          takeaways: "Key takeaways",
          practicePrompt: "Practice prompt"
        }
      },
      recommendations: {
        title: "Recommendations",
        empty: "No explainable recommendations are available yet.",
        accept: "Accept",
        dismiss: "Dismiss",
        refresh: "Refresh recommendations",
        refreshError: "Could not refresh recommendations. Check the active AI provider and try again."
      },
      onboarding: {
        title: "Build your starting skill map",
        subtitle:
          "Answer a few focused questions so Leetgrind starts from your goals, current strengths, and real gaps.",
        save: "Save plan",
        finish: "Open workspace",
        draft: "Save draft",
        back: "Back",
        continue: "Continue",
        saving: "Saving...",
        checkRequired: "Check required fields before saving.",
        draftSaved: "Draft saved",
        saved: "Plan saved",
        progress: "Setup",
        reviewingTitle: "Update your setup",
        startingTitle: "Start from a blank profile",
        wizardDescription:
          "Keep the first pass short. You can refine goals, skills, and preferences later.",
        addGoal: "Add goal",
        addFirstGoal: "Add the first goal",
        addSkill: "Add skill",
        addFirstSkill: "Add the first skill",
        remove: "Remove",
        stepLabel: "Step {{step}}",
        reviewTitle: "Check the starting picture",
        reviewDescription:
          "Review the essentials before Leetgrind unlocks the main workspace.",
        reviewResumeReady: "Background added",
        goalSectionTitle: "What are you preparing for?",
        goalSectionDescription:
          "Add the concrete interview tracks or growth goals that should shape the workspace.",
        skillSectionTitle: "What do you already know?",
        skillSectionDescription:
          "Capture the skills you want Leetgrind to track from day one.",
        backgroundSectionTitle: "Background and learning preferences",
        backgroundSectionDescription:
          "Add context that helps tailor lessons, checks, and follow-up work.",
        emptyGoalsTitle: "No goals yet",
        emptyGoalsDescription:
          "Add at least one goal so the app can prioritize the right topics and interviews.",
        emptySkillsTitle: "No skills yet",
        emptySkillsDescription:
          "Add at least one self-assessed skill so the first dashboard reflects your current level.",
        goalCard: "Goal {{index}}",
        skillCard: "Skill {{index}}",
        validation: {
          goalRequired: "Add at least one goal before moving on.",
          skillRequired: "Add at least one skill before moving on.",
        },
        steps: {
          profile: "Profile",
          goals: "Goals",
          skills: "Skills",
          background: "Background",
          review: "Review",
        },
        stepDescriptions: {
          profile: "Set the basic context: name, target role, experience level, and interface language.",
          goals: "Define the interview tracks or learning outcomes that matter right now.",
          skills: "List the skills you want tracked from the first session.",
          background: "Add resume context, content language, and study rhythm.",
          review: "Confirm the starting picture before entering the main workspace.",
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
        placeholders: {
          displayName: "How should Leetgrind address you?",
          targetRole: "Frontend Engineer, Backend Engineer, Fullstack Engineer...",
          goalTitle: "Prepare for mid-level frontend interviews",
          targetCompany: "Optional company name",
          focusAreas: "React, algorithms, system design",
          goalDescription: "What should this goal optimize for?",
          skillTitle: "React, SQL, graphs, HTTP...",
          skillDescription: "Optional notes about confidence, blind spots, or recent practice",
          programmingLanguages: "TypeScript, Python, Go",
          resumeTitle: "Resume or background note",
        },
        hints: {
          resumePlaceholder:
            "Paste your resume, current experience summary, or any context that should influence future lessons and checks.",
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
        aiSettings: "AI настройки",
        assessments: "Проверки",
        dashboard: "Дашборд",
        history: "История",
        lessons: "Уроки",
        onboarding: "Настройка",
        navigation: {
          hideMenu: "Скрыть меню",
          showMenu: "Показать меню",
        },
        theme: {
          toggle: "Тема",
          light: "Светлая тема",
          dark: "Темная тема",
        },
      },
      common: {
        backToDashboard: "Вернуться к дашборду",
        loadError: "Не удалось загрузить этот экран.",
        loading: "Загрузка...",
        loadingDetail: "Подготавливаем локальное рабочее пространство.",
        open: "Открыть",
      },
      aiSettings: {
        kicker: "AI runtime",
        title: "Статус провайдера, content RAG и preview-запуски",
        subtitle:
          "Настраивай активного провайдера, индексируй локальные документы, проверяй retrieval и смотри trace последних agent runs.",
        manageProviders: "Управлять провайдерами",
        providerCard: "Провайдер по умолчанию",
        noProvider: "Провайдер не настроен",
        noModel: "Модель не выбрана",
        embeddingsReady: "Эмбеддинги готовы",
        checkConnection: "Проверить подключение",
        previewCard: "Mentor preview",
        previewPrompt: "Промпт для preview",
        previewPlaceholder: "Попроси короткий ответ ментора с опорой на локальные документы.",
        runPreview: "Запустить preview",
        ingestCard: "Индексация документов",
        noteTitle: "Название документа",
        noteSource: "Метка источника",
        noteContent: "Содержимое документа",
        ingestDocument: "Проиндексировать документ",
        existingDocuments: "Существующие документы",
        ingestExisting: "Индексировать",
        noDocuments: "Локальные документы пока не добавлены.",
        searchCard: "RAG поиск",
        searchPrompt: "Поисковый запрос",
        searchPlaceholder: "Поиск по локальному контексту",
        search: "Искать контекст",
        searchHint: "Сначала сохрани и подключи провайдера с поддержкой эмбеддингов.",
        searchMeta: "{{sourceType}} · score {{score}}",
        noSearchResults: "Подходящие чанки не найдены.",
        runsCard: "Последние agent runs",
        noRuns: "Запуски агентов пока не записаны.",
        runKinds: {
          mentor: "Mentor preview",
          "assessment-mentor": "Assessment workflow",
          interviewer: "Интервью workflow",
          "coding-reviewer": "Code review",
          planner: "Planner workflow",
          "lesson-planner": "Lesson planner",
          recommender: "Recommendation workflow",
          ingestion: "Индексация документа",
          "provider-test": "Проверка провайдера"
        },
        runStatus: {
          queued: "В очереди",
          running: "В работе",
          succeeded: "Успешно",
          failed: "Ошибка",
          canceled: "Отменено"
        },
        status: {
          checking: "Проверяем подключение",
          connected: "Подключен",
          error: "Подключение не прошло",
          idle: "Статус еще не проверялся",
          notConfigured: "Провайдер не настроен"
        }
      },
      aiProviders: {
        kicker: "Настройка провайдера",
        title: "Настрой OpenRouter и secure storage секретов",
        subtitle:
          "Метаданные провайдера живут в локальной БД, а API secrets хранятся в системном keychain.",
        backToSettings: "Назад к AI настройкам",
        openrouterCard: "Провайдер OpenRouter",
        displayName: "Название",
        textModel: "Текстовая модель",
        embeddingModel: "Модель эмбеддингов",
        apiKey: "API ключ",
        makeDefault: "Сделать провайдером по умолчанию",
        save: "Сохранить провайдера",
        savedProviders: "Сохраненные провайдеры",
        noProviders: "Провайдеры пока не сохранены.",
        default: "По умолчанию",
        setDefault: "Сделать основным",
        test: "Проверить",
        remove: "Удалить",
        plannedKinds: "Распознанные виды провайдеров",
        plannedCopy: "Этот вид провайдера уже учтен в контракте продукта, но не реализован в phase 04.",
        kindNames: {
          "openai-codex": "Codex subscription auth",
          "openai-api-key": "OpenAI API key",
          local: "Локальный провайдер"
        }
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
        activeGoal: "Активная цель",
        actionReasons: {
          adjacentToStrongSkill: "Эта тема близка к навыку, который уже выглядит сильным.",
          negativeEvidence: "Последние сигналы показывают пробел, который стоит проверить.",
          reviewDue: "Для этого навыка подходит время повторения.",
          storedRecommendation: "Эта рекомендация уже сохранена в плане.",
          unknownPrerequisite: "Навык из цели зависит от этой базы.",
          weakGoalSkill: "Этот навык важен для активной цели и пока требует практики.",
        },
        actions: {
          learnPrerequisite: "Изучить базу",
          practiceWeakSkill: "Потренировать слабый навык",
          reviewDue: "Повторить навык",
          storedRecommendation: "Сохраненная рекомендация",
          studyAdjacent: "Изучить смежную тему",
          takeAssessment: "Пройти точечную проверку",
        },
        chooseSkill: "Выбери навык",
        dueReviews: "{{count}} повторений",
        currentRole: "Текущая роль",
        firstSessionKicker: "Можно начинать",
        firstSessionTitle: "Рабочее место готово к первой нормальной сессии.",
        firstSessionSubtitle:
          "Запусти точечную проверку или создай первый урок на основе целей и навыков, которые ты только что зафиксировал.",
        goalSkillJump: "Открыть навык цели",
        graph: "Граф знаний",
        kicker: "Прогресс",
        noActions: "Сейчас нет срочного следующего действия.",
        noActivity: "История пока пустая.",
        noGoal: "Нет активной цели",
        noGraph: "Добавь цели и навыки, чтобы построить граф.",
        noReviews: "Повторения еще не запланированы.",
        noWeakSpots: "Слабые места пока не видны.",
        nextActions: "Следующие действия",
        ofSkills: "из {{count}} отслеживаемых навыков",
        openGoal: "Открыть цель",
        openHistory: "Открыть историю",
        title: "Дашборд подготовки",
        subtitle:
          "Цели, навыки, слабые места и приоритеты практики в одном месте.",
        readiness: "Готовность",
        readinessBands: {
          "at-risk": "В зоне риска",
          "not-started": "Не начато",
          progressing: "Есть прогресс",
          ready: "Готов",
        },
        recentActivity: "Недавняя активность",
        review: "Повторение",
        skillSignals: "{{attempts}} попыток, {{reviews}} повторений",
        strongSkills: "Сильные навыки",
        updatePlan: "Обновить план",
        upcomingReviews: "Ближайшие повторения",
        weakSpotReasons: {
          "due-review": "Пора повторить",
          "negative-evidence": "Сигналы показывают пробел",
          unknown: "Текущий уровень неизвестен",
          weak: "Текущий уровень слабый",
        },
        weakSpots: "Слабые места",
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
        skillMapReady: "{{count}} навыков уже готовы для практики и навигации по графу.",
        focusAreas: "Фокус",
        weakSkills: "Навыки для прокачки",
        actionReview: "Разобрать слабые навыки",
        actionGoals: "Уточнить фокус целей",
        actionResume: "Добавить контекст резюме",
        emptyState: "Добавь цели и навыки, чтобы увидеть первые приоритеты.",
      },
      goalDetail: {
        kicker: "Готовность цели",
        skillCoverage: "Покрытие навыков",
        skillCoverageCopy: "{{strong}} сильных, {{weak}} слабых, {{unknown}} неизвестных",
        skills: "Навыки цели",
        subtitle: "Готовность, слабые места и следующие действия по этой цели.",
        title: "Детали цели",
      },
      skillDetail: {
        attempts: "{{count}} попыток",
        connected: "Связанные навыки",
        evidence: "Сигналы",
        kicker: "Детали навыка",
        level: "Уровень",
        noConnections: "Связанные навыки пока не доступны.",
        noEvidence: "По этому навыку пока нет сохраненных сигналов.",
        polarity: {
          gap: "Пробел",
          neutral: "Нейтрально",
          progress: "Прогресс",
          strength: "Сильная сторона",
          weakness: "Слабое место",
        },
        reviews: "Повторения",
        score: "Оценка прогресса",
        subtitle: "Сигналы прогресса, evidence и связи в графе.",
        title: "Детали навыка",
      },
      history: {
        empty: "В истории пока нет событий.",
        events: "События",
        kicker: "История прогресса",
        kinds: {
          attempt: "Попытка",
          evidence: "Сигнал",
          recommendation: "Рекомендация",
          review: "Повторение",
        },
        subtitle: "Попытки, сигналы, рекомендации и повторения в одной ленте.",
        title: "История",
      },
      assessments: {
        kicker: "Проверки знаний",
        providerCta: "Открыть AI настройки",
        fields: {
          goal: "Цель",
          skill: "Навык",
          focus: "Фокус"
        },
        placeholders: {
          goal: "Выбери цель",
          skill: "Выбери навык",
          focus: "Укажи, на чем стоит сфокусировать проверку."
        },
        verdicts: {
          excellent: "Отлично",
          pass: "Зачтено",
          "needs-work": "Нужно доработать",
          fail: "Не пройдено"
        },
        new: {
          title: "Запусти точечную проверку",
          subtitle: "Выбери цель или навык и сгенерируй mixed-format assessment.",
          configure: "Параметры проверки",
          start: "Начать проверку"
        },
        session: {
          title: "Сессия проверки",
          subtitle: "Ответь на все вопросы и заверши сессию, чтобы получить структурированный разбор.",
          question: "Вопрос",
          answerPlaceholder: "Напиши ответ здесь.",
          finish: "Завершить проверку"
        },
        result: {
          title: "Результат проверки",
          subtitle: "Структурированный разбор, уроки и следующие шаги.",
          pending: "Результат пока недоступен.",
          score: "Оценка",
          verdict: "Вердикт",
          evidence: "Сигналы",
          feedback: "Разбор по вопросам"
        }
      },
      lessons: {
        kicker: "Уроки",
        title: "Уроки",
        subtitle: "Создавай точечные уроки по навыку, цели или свободной теме.",
        library: "Библиотека уроков",
        empty: "Уроки пока не доступны.",
        emptyHint: "Сгенерируй урок выше или заверши проверку знаний, чтобы получить материалы по итогам.",
        providerCta: "Открыть AI настройки",
        back: "Назад к урокам",
        openForSkill: "Открыть уроки",
        fields: {
          goal: "Цель",
          skill: "Навык",
          focus: "Тема"
        },
        placeholders: {
          goal: "Выбери цель",
          skill: "Выбери навык",
          focus: "Опиши, что хочешь изучить или прояснить."
        },
        create: {
          title: "Создать урок",
          submit: "Создать урок"
        },
        detail: {
          title: "Детали урока",
          content: "Содержимое урока",
          takeaways: "Ключевые выводы",
          practicePrompt: "Практическая подсказка"
        }
      },
      recommendations: {
        title: "Рекомендации",
        empty: "Объяснимые рекомендации пока не доступны.",
        accept: "Принять",
        dismiss: "Скрыть",
        refresh: "Обновить рекомендации",
        refreshError: "Не удалось обновить рекомендации. Проверь активного AI-провайдера и повтори попытку."
      },
      onboarding: {
        title: "Собери стартовую карту навыков",
        subtitle:
          "Ответь на несколько коротких вопросов, чтобы Leetgrind начал с твоих целей, сильных сторон и реальных пробелов.",
        save: "Сохранить план",
        finish: "Открыть рабочее место",
        draft: "Сохранить черновик",
        back: "Назад",
        continue: "Дальше",
        saving: "Сохранение...",
        checkRequired: "Проверь обязательные поля перед сохранением.",
        draftSaved: "Черновик сохранен",
        saved: "План сохранен",
        progress: "Настройка",
        reviewingTitle: "Обновление стартовой настройки",
        startingTitle: "Старт с пустого профиля",
        wizardDescription:
          "Сначала зафиксируй основу. Детали по целям, навыкам и предпочтениям можно уточнить позже.",
        addGoal: "Добавить цель",
        addFirstGoal: "Добавить первую цель",
        addSkill: "Добавить навык",
        addFirstSkill: "Добавить первый навык",
        remove: "Удалить",
        stepLabel: "Шаг {{step}}",
        reviewTitle: "Проверь стартовую картину",
        reviewDescription:
          "Посмотри на основу еще раз, прежде чем Leetgrind откроет основное рабочее пространство.",
        reviewResumeReady: "Контекст добавлен",
        goalSectionTitle: "К чему ты готовишься?",
        goalSectionDescription:
          "Добавь направления подготовки или цели роста, которые должны управлять рабочим пространством.",
        skillSectionTitle: "Что ты уже умеешь?",
        skillSectionDescription:
          "Зафиксируй навыки, которые Leetgrind должен отслеживать с первого дня.",
        backgroundSectionTitle: "Контекст и учебные предпочтения",
        backgroundSectionDescription:
          "Добавь данные, которые помогут точнее подбирать уроки, проверки и следующие шаги.",
        emptyGoalsTitle: "Цели пока не добавлены",
        emptyGoalsDescription:
          "Добавь хотя бы одну цель, чтобы приложение понимало, какие темы и собеседования приоритизировать.",
        emptySkillsTitle: "Навыки пока не добавлены",
        emptySkillsDescription:
          "Добавь хотя бы один навык с самооценкой, чтобы первый дашборд отражал твой текущий уровень.",
        goalCard: "Цель {{index}}",
        skillCard: "Навык {{index}}",
        validation: {
          goalRequired: "Добавь хотя бы одну цель, прежде чем идти дальше.",
          skillRequired: "Добавь хотя бы один навык, прежде чем идти дальше.",
        },
        steps: {
          profile: "Профиль",
          goals: "Цели",
          skills: "Навыки",
          background: "Контекст",
          review: "Проверка",
        },
        stepDescriptions: {
          profile: "Задай базовый контекст: имя, целевую роль, уровень опыта и язык интерфейса.",
          goals: "Определи направления подготовки или результаты, которые сейчас реально важны.",
          skills: "Перечисли навыки, которые нужно отслеживать с первой сессии.",
          background: "Добавь резюме, язык учебного контента и ритм занятий.",
          review: "Подтверди стартовую картину перед входом в основное рабочее пространство.",
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
        placeholders: {
          displayName: "Как к тебе обращаться в приложении?",
          targetRole: "Frontend Engineer, Backend Engineer, Fullstack Engineer...",
          goalTitle: "Подготовиться к frontend-собеседованиям на middle",
          targetCompany: "Необязательное название компании",
          focusAreas: "React, алгоритмы, system design",
          goalDescription: "Что именно должно измениться по этой цели?",
          skillTitle: "React, SQL, графы, HTTP...",
          skillDescription: "Необязательные заметки про уверенность, пробелы или недавнюю практику",
          programmingLanguages: "TypeScript, Python, Go",
          resumeTitle: "Резюме или заметка о бэкграунде",
        },
        hints: {
          resumePlaceholder:
            "Вставь резюме, описание текущего опыта или любой контекст, который должен влиять на будущие уроки и проверки.",
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
