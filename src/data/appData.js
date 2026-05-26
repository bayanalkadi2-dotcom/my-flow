export const habits = [
  { title: 'Wasser trinken', detail: '6 / 8 Gläser', progress: 75, status: 'Offen' },
  { title: 'Bewegung', detail: '30 / 60 Minuten', progress: 50, status: 'Aktiv' },
  { title: 'Schlaf', detail: '7 h 30 min', progress: 90, status: 'Gut' },
  { title: 'Entspannung', detail: '10 / 15 Minuten', progress: 70, status: 'Offen' },
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
