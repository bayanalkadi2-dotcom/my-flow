export const habits = [
  {
    id: 1,
    title: 'Wasser trinken',
    icon: '💧',
    current: 6,
    target: 8,
    unit: 'Gläser',
    incrementLabel: '1 Glas getrunken',
    status: 'Offen',
    done: false,
    points: 10,
  },
  {
    id: 2,
    title: 'Bewegung',
    icon: '🏃',
    current: 30,
    target: 60,
    unit: 'Minuten',
    incrementLabel: '1 Minute geschafft',
    status: 'Aktiv',
    done: false,
    points: 20,
  },
  {
    id: 3,
    title: 'Schlaf',
    icon: '🌙',
    current: 8,
    target: 8,
    unit: 'Stunden',
    incrementLabel: '1 Stunde geschlafen',
    status: 'Gut',
    done: true,
    points: 15,
  },
  {
    id: 4,
    title: 'Entspannung',
    icon: '🧘',
    current: 10,
    target: 15,
    unit: 'Minuten',
    incrementLabel: '1 Minute entspannt',
    status: 'Offen',
    done: false,
    points: 10,
  },
]

export const navItems = [
  { id: 'dashboard', label: 'Home' },
  { id: 'habits', label: 'Routinen' },
  { id: 'progress', label: 'Statistik' },
  { id: 'freunde', label: 'Freunde' },
  { id: 'profile', label: 'Profil' },
]

export const welcomeFeatures = [
  {
    icon: '◎',
    title: 'Setze Ziele',
    text: 'Plane deine Routinen.',
    tone: 'purple',
  },
  {
    icon: '⌁',
    title: 'Fortschritt',
    text: 'Sieh deine Entwicklung.',
    tone: 'pink',
  },
  {
    icon: '⌂',
    title: 'Bleib dran',
    text: 'Erhalte Erinnerungen.',
    tone: 'blue',
  },
]

export const languageStyles = {
  casual: {
    label: 'Locker',
    greeting: 'Hey, schön dass du da bist!',
    dashboardTitle: 'Heute im Flow',
    dashboardMessage: 'Du hast {count} von {total} Routinen fast geschafft. Weiter so!',
    progressMessage: 'Stark! Du bist heute richtig gut dabei.',
  },
  formal: {
    label: 'Förmlich',
    greeting: 'Willkommen bei MyFlow',
    dashboardTitle: 'Ihre Tagesübersicht',
    dashboardMessage: 'Sie haben {count} von {total} Routinen nahezu abgeschlossen.',
    progressMessage: 'Ihr Tagesziel entwickelt sich positiv.',
  },
}
