const neutralPersonalization = {
  status: 'other',
  userType: 'Nutzer:in',
  contextLabel: 'Alltag',
  taskLabel: 'Aufgabe',
  eventLabel: 'Termin',
  planningLabel: 'Tagesplanung',
  focusLabel: 'Fokuszeit',
  breakLabel: 'kurze Pause',
  homeQuestion: 'Wie läuft dein Tag?',
  statisticsTitle: 'Dein Fortschritt',
  contextQuestionOptions: [
    ['tasks', 'Aufgaben'],
    ['appointments', 'Termine'],
    ['self_organization', 'Selbstorganisation'],
    ['conflicts', 'Konflikte'],
    ['little_recovery', 'zu wenig Erholung'],
  ],
  texts: {
    dashboardTitle: 'Dein Alltag im Überblick',
    dashboardSubtitle: 'Plane deine Aufgaben, Pausen und persönlichen Routinen.',
    routinesTitle: 'Routinen für deinen Alltag',
    checkInIntro: 'Wie geht es dir in deinem Alltag gerade?',
    statisticsIntro: 'Hier siehst du deinen Fortschritt bei Check-ins und Routinen.',
    profileDescription: 'Deine persönlichen Angaben helfen MyFlow, Inhalte passend auszuwählen.',
  },
  routineSuggestions: [
    { id: 'daily-planning', title: 'Tagesplanung', category: 'Organisation', target: 1, unit: 'Mal' },
    { id: 'focus-time', title: 'Fokuszeit', category: 'Fokus', target: 25, unit: 'Minuten' },
    { id: 'movement-break', title: 'Bewegungspause', category: 'Gesundheit', target: 10, unit: 'Minuten' },
    { id: 'sleep-routine', title: 'Schlafroutine', category: 'Erholung', target: 1, unit: 'Mal' },
  ],
}

export const userPersonalizations = {
  school: {
    status: 'school',
    userType: 'Schüler:in',
    contextLabel: 'Schulalltag',
    taskLabel: 'Hausaufgabe',
    eventLabel: 'Klausur',
    planningLabel: 'Stundenplan',
    focusLabel: 'Lernzeit',
    breakLabel: 'Lernpause',
    homeQuestion: 'Wie läuft dein Schultag?',
    statisticsTitle: 'Fortschritt im Schulalltag',
    contextQuestionOptions: [
      ['classes', 'Unterricht'],
      ['homework', 'Hausaufgaben'],
      ['exams', 'Klausuren'],
      ['performance_pressure', 'Leistungsdruck'],
      ['little_free_time', 'zu wenig Freizeit'],
    ],
    texts: {
      dashboardTitle: 'Dein Schulalltag im Überblick',
      dashboardSubtitle: 'Behalte Hausaufgaben, Klausuren und Lernpausen im Blick.',
      routinesTitle: 'Routinen für deinen Schulalltag',
      checkInIntro: 'Wie geht es dir heute mit Schule, Lernen und Erholung?',
      statisticsIntro: 'Hier siehst du deinen Fortschritt bei Lernroutinen und Check-ins.',
      profileDescription: 'Deine Angaben helfen MyFlow, deinen Schulalltag passend zu begleiten.',
    },
    routineSuggestions: [
      { id: 'homework', title: 'Hausaufgaben starten', category: 'Schule', target: 1, unit: 'Mal' },
      { id: 'school-bag', title: 'Schultasche vorbereiten', category: 'Schule', target: 1, unit: 'Mal' },
      { id: 'learning-break', title: 'Lernpause', category: 'Erholung', target: 10, unit: 'Minuten' },
      { id: 'exam-preparation', title: 'Klausurvorbereitung', category: 'Lernen', target: 25, unit: 'Minuten' },
    ],
  },
  university: {
    status: 'university',
    userType: 'Student:in',
    contextLabel: 'Studienalltag',
    taskLabel: 'Abgabe',
    eventLabel: 'Prüfung',
    planningLabel: 'Vorlesungsplan',
    focusLabel: 'Lernblock',
    breakLabel: 'Lernpause',
    homeQuestion: 'Wie läuft dein Studientag?',
    statisticsTitle: 'Fortschritt im Studienalltag',
    contextQuestionOptions: [
      ['lectures', 'Vorlesungen'],
      ['exams', 'Prüfungen'],
      ['assignments', 'Abgaben'],
      ['self_organization', 'Selbstorganisation'],
      ['side_job', 'Nebenjob'],
    ],
    texts: {
      dashboardTitle: 'Dein Studienalltag im Überblick',
      dashboardSubtitle: 'Organisiere Vorlesungen, Prüfungen, Abgaben und Lernblöcke.',
      routinesTitle: 'Routinen für deinen Studienalltag',
      checkInIntro: 'Wie geht es dir heute mit Studium, Lernen und Erholung?',
      statisticsIntro: 'Hier siehst du deinen Fortschritt bei Lernblöcken und Check-ins.',
      profileDescription: 'Deine Angaben helfen MyFlow, deinen Studienalltag passend zu begleiten.',
    },
    routineSuggestions: [
      { id: 'lecture-review', title: 'Vorlesung nachbereiten', category: 'Studium', target: 1, unit: 'Mal' },
      { id: 'study-block', title: 'Lernblock', category: 'Lernen', target: 45, unit: 'Minuten' },
      { id: 'assignment', title: 'Abgabe planen', category: 'Studium', target: 1, unit: 'Mal' },
      { id: 'weekly-planning', title: 'Wochenplanung', category: 'Organisation', target: 1, unit: 'Mal' },
    ],
  },
  training: {
    status: 'training',
    userType: 'Auszubildende:r',
    contextLabel: 'Ausbildungsalltag',
    taskLabel: 'Berichtsheft',
    eventLabel: 'Prüfung',
    planningLabel: 'Wochenplanung',
    focusLabel: 'Lernzeit',
    breakLabel: 'Erholung nach der Arbeit',
    homeQuestion: 'Wie läuft dein Ausbildungsalltag?',
    statisticsTitle: 'Fortschritt im Ausbildungsalltag',
    contextQuestionOptions: [
      ['company', 'Betrieb'],
      ['vocational_school', 'Berufsschule'],
      ['exams', 'Prüfungen'],
      ['working_hours', 'Arbeitszeit'],
      ['little_recovery', 'zu wenig Erholung'],
    ],
    texts: {
      dashboardTitle: 'Dein Ausbildungsalltag im Überblick',
      dashboardSubtitle: 'Verbinde Betrieb, Berufsschule, Prüfungsvorbereitung und Erholung.',
      routinesTitle: 'Routinen für deinen Ausbildungsalltag',
      checkInIntro: 'Wie geht es dir heute mit Ausbildung, Arbeit und Erholung?',
      statisticsIntro: 'Hier siehst du deinen Fortschritt in Ausbildung und Alltag.',
      profileDescription: 'Deine Angaben helfen MyFlow, deinen Ausbildungsalltag passend zu begleiten.',
    },
    routineSuggestions: [
      { id: 'report-book', title: 'Berichtsheft', category: 'Ausbildung', target: 1, unit: 'Mal' },
      { id: 'vocational-school', title: 'Berufsschulstoff', category: 'Lernen', target: 25, unit: 'Minuten' },
      { id: 'work-clothes', title: 'Arbeitskleidung vorbereiten', category: 'Ausbildung', target: 1, unit: 'Mal' },
      { id: 'after-work-recovery', title: 'Erholung nach der Arbeit', category: 'Erholung', target: 20, unit: 'Minuten' },
    ],
  },
  other: neutralPersonalization,
}

const challengeSuggestions = {
  exam_stress: [
    { id: 'learning-plan', title: 'Lernplan erstellen', category: 'Lernen', target: 1, unit: 'Mal' },
    { id: 'breathing-exercise', title: 'Atemübung', category: 'Erholung', target: 5, unit: 'Minuten' },
    { id: 'small-learning-step', title: 'Kleiner Lernschritt', category: 'Lernen', target: 15, unit: 'Minuten' },
  ],
  concentration: [
    { id: 'focus-session', title: 'Fokuszeit', category: 'Fokus', target: 25, unit: 'Minuten' },
    { id: 'reduce-distractions', title: 'Reize reduzieren', category: 'Fokus', target: 1, unit: 'Mal' },
  ],
  missing_learning_routine: [
    { id: 'regular-learning-block', title: 'Regelmäßiger Lernblock', category: 'Lernen', target: 25, unit: 'Minuten' },
  ],
  low_motivation: [
    { id: 'mini-task', title: 'Mini-Aufgabe erledigen', category: 'Motivation', target: 1, unit: 'Mal' },
  ],
  too_little_recovery: [
    { id: 'recovery-break', title: 'Kurze Erholungspause', category: 'Erholung', target: 10, unit: 'Minuten' },
    { id: 'sleep-routine', title: 'Schlafroutine', category: 'Erholung', target: 1, unit: 'Mal' },
  ],
  difficult_day_structure: [
    { id: 'structured-day', title: 'Tagesplanung', category: 'Organisation', target: 1, unit: 'Mal' },
  ],
  sleep_problems: [
    { id: 'evening-routine', title: 'Ruhige Abendroutine', category: 'Erholung', target: 1, unit: 'Mal' },
  ],
  mental_exhaustion: [
    { id: 'mental-break', title: 'Pause ohne Bildschirm', category: 'Erholung', target: 10, unit: 'Minuten' },
  ],
  physical_tiredness: [
    { id: 'gentle-movement', title: 'Sanfte Bewegung', category: 'Gesundheit', target: 10, unit: 'Minuten' },
  ],
  too_many_tasks: [
    { id: 'prioritize-tasks', title: 'Drei Aufgaben priorisieren', category: 'Organisation', target: 1, unit: 'Mal' },
  ],
  study_life_balance: [
    { id: 'free-time-block', title: 'Freizeit bewusst einplanen', category: 'Erholung', target: 1, unit: 'Mal' },
  ],
}

const goalSuggestions = {
  better_day_structure: [
    { id: 'goal-day-planning', title: 'Tagesplanung', category: 'Organisation', target: 1, unit: 'Mal' },
  ],
  build_learning_routine: [
    { id: 'goal-learning-block', title: 'Regelmäßiger Lernblock', category: 'Lernen', target: 25, unit: 'Minuten' },
  ],
  reduce_stress: [
    { id: 'goal-breathing', title: 'Atemübung', category: 'Erholung', target: 5, unit: 'Minuten' },
  ],
  more_breaks: [
    { id: 'goal-break', title: 'Kurze Pause', category: 'Erholung', target: 10, unit: 'Minuten' },
  ],
  improve_sleep: [
    { id: 'goal-sleep', title: 'Schlafroutine', category: 'Erholung', target: 1, unit: 'Mal' },
  ],
  increase_focus: [
    { id: 'goal-focus', title: 'Fokuszeit', category: 'Fokus', target: 25, unit: 'Minuten' },
  ],
  strengthen_motivation: [
    { id: 'goal-mini-task', title: 'Mini-Aufgabe erledigen', category: 'Motivation', target: 1, unit: 'Mal' },
  ],
  healthy_habits: [
    { id: 'goal-healthy-routine', title: 'Gesunde Gewohnheit', category: 'Gesundheit', target: 1, unit: 'Mal' },
  ],
  show_progress: [
    { id: 'goal-reflection', title: 'Tagesfortschritt festhalten', category: 'Reflexion', target: 1, unit: 'Mal' },
  ],
  regular_checkins: [
    { id: 'goal-checkin', title: 'Täglicher Check-in', category: 'Reflexion', target: 1, unit: 'Mal' },
  ],
}

const educationLabels = {
  lower_school: 'Unterstufe',
  middle_school: 'Mittelstufe',
  upper_school: 'Oberstufe',
  vocational_school: 'Berufsschule',
  university: 'Universität',
  university_of_applied_sciences: 'Fachhochschule',
  dual_university: 'Duale Hochschule',
  remote_study: 'Fernstudium',
  company_training: 'Betriebliche Ausbildung',
  school_training: 'Schulische Ausbildung',
  dual_study: 'Duales Studium',
  other: 'Andere',
}

const challengeLabels = {
  exam_stress: 'Prüfungsstress',
  concentration: 'Konzentrationsprobleme',
  missing_learning_routine: 'Fehlende Lernroutine',
  low_motivation: 'Wenig Motivation',
  too_little_recovery: 'Zu wenig Erholung',
  difficult_day_structure: 'Schwierige Tagesstruktur',
  sleep_problems: 'Schlafprobleme',
  mental_exhaustion: 'Mentale Erschöpfung',
  physical_tiredness: 'Körperliche Müdigkeit',
  too_many_tasks: 'Zu viele Aufgaben gleichzeitig',
  study_life_balance: 'Balance zwischen Lernen und Freizeit',
  other: 'Sonstiges',
}

const goalLabels = {
  better_day_structure: 'Bessere Tagesstruktur',
  build_learning_routine: 'Lernroutine aufbauen',
  reduce_stress: 'Stress reduzieren',
  more_breaks: 'Mehr Pausen machen',
  improve_sleep: 'Schlaf verbessern',
  increase_focus: 'Fokus steigern',
  strengthen_motivation: 'Motivation stärken',
  healthy_habits: 'Gesunde Gewohnheiten aufbauen',
  show_progress: 'Fortschritt sichtbar machen',
  regular_checkins: 'Regelmäßige Check-ins',
}

function normalizeList(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === 'string') : []
}

export function getUserPersonalization(profile) {
  const status = Object.hasOwn(userPersonalizations, profile?.student_status)
    ? profile.student_status
    : 'other'
  const personalization = userPersonalizations[status]

  return {
    ...personalization,
    texts: { ...personalization.texts },
    routineSuggestions: personalization.routineSuggestions.map((suggestion) => ({ ...suggestion })),
    contextQuestionOptions: personalization.contextQuestionOptions.map(([value, label]) => ({ value, label })),
    educationLevel: profile?.education_level ?? null,
    mainChallenges: normalizeList(profile?.main_challenges),
    supportGoals: normalizeList(profile?.support_goals),
  }
}

export function getPersonalizedTexts(profile) {
  const personalization = getUserPersonalization(profile)

  return {
    ...personalization.texts,
    userType: personalization.userType,
    contextLabel: personalization.contextLabel,
    taskLabel: personalization.taskLabel,
    eventLabel: personalization.eventLabel,
    planningLabel: personalization.planningLabel,
    focusLabel: personalization.focusLabel,
    breakLabel: personalization.breakLabel,
    homeQuestion: personalization.homeQuestion,
    statisticsTitle: personalization.statisticsTitle,
  }
}

export function getRoutineSuggestions(profile) {
  const personalization = getUserPersonalization(profile)
  const suggestions = [
    ...personalization.routineSuggestions,
    ...personalization.mainChallenges.flatMap((challenge) => challengeSuggestions[challenge] ?? []),
    ...personalization.supportGoals.flatMap((goal) => goalSuggestions[goal] ?? []),
  ]
  const uniqueSuggestions = new Map()

  suggestions.forEach((suggestion) => {
    const key = suggestion.title.trim().toLocaleLowerCase('de-DE')
    if (!uniqueSuggestions.has(key)) uniqueSuggestions.set(key, { ...suggestion })
  })

  return [...uniqueSuggestions.values()]
}

export function getContextCheckInQuestion(profile) {
  const personalization = getUserPersonalization(profile)

  return {
    id: 'context_stressor',
    label: personalization.contextLabel,
    question: 'Was hat dich heute am meisten belastet?',
    options: personalization.contextQuestionOptions.map((option) => ({ ...option })),
  }
}

export function getProfileSituation(profile) {
  const personalization = getUserPersonalization(profile)
  const challenges = personalization.mainChallenges
    .map((value) => challengeLabels[value])
    .filter(Boolean)
  const goals = personalization.supportGoals
    .map((value) => goalLabels[value])
    .filter(Boolean)

  return {
    userType: personalization.userType,
    educationLevel: educationLabels[profile?.education_level] || 'Keine Angabe',
    challenges: challenges.length ? challenges : ['Keine Angabe'],
    supportGoals: goals.length ? goals : ['Keine Angabe'],
  }
}
