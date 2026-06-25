export const habits = []

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
  german: {
    label: 'Deutsch',
    greeting: 'Hey, schön dass du da bist!',
    dashboardTitle: 'Heute im Flow',
    dashboardMessage: 'Du hast {count} von {total} Routinen fast geschafft. Weiter so!',
    progressMessage: 'Stark! Du bist heute richtig gut dabei.',
  },
  english: {
    label: 'English',
    greeting: 'Hey, good to see you!',
    dashboardTitle: 'Today in Flow',
    dashboardMessage: 'You nearly completed {count} of {total} routines. Keep going!',
    progressMessage: 'Nice! You are making good progress today.',
  },
  turkish: {
    label: 'Türkçe',
    greeting: 'Merhaba, seni görmek güzel!',
    dashboardTitle: 'Bugünkü Akış',
    dashboardMessage: '{total} rutinden {count} tanesini neredeyse tamamladın. Devam et!',
    progressMessage: 'Harika! Bugün iyi ilerliyorsun.',
  },
  arabic: {
    label: 'العربية',
    greeting: 'أهلا، سعيد بوجودك!',
    dashboardTitle: 'تدفق اليوم',
    dashboardMessage: 'أكملت تقريبا {count} من {total} روتينات. استمر!',
    progressMessage: 'رائع! أنت تتقدم بشكل جيد اليوم.',
  },
}
