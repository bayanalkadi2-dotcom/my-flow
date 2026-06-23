import { useState } from 'react'
import SmartRangeTrendChart from '../commponents/SmartRangeTrendChart'
import WellbeingDashboard from '../commponents/WellbeingDashboard'

const categoryByTitle = {
  'Wasser trinken': 'Koerper',
  Bewegung: 'Koerper',
  Sport: 'Koerper',
  Schlaf: 'Koerper',
  'Gesund essen': 'Koerper',
  Periode: 'Koerper',
  Entspannung: 'Mental',
  Meditation: 'Mental',
  Dankbarkeit: 'Mental',
  Tagebuch: 'Mental',
  'Stimmung tracken': 'Mental',
  Lesen: 'Mental',
  'Digitale Pause': 'Mental',
  Lernen: 'Produktiv',
  Tagesplanung: 'Produktiv',
  Fokuszeit: 'Produktiv',
  Aufraeumen: 'Produktiv',
  'Freunde kontaktieren': 'Sozial',
  'Familie kontaktieren': 'Sozial',
  'Soziale Aktivitaet': 'Sozial',
  'Rauchen reduzieren': 'Reduktion',
  'Weniger Social Media': 'Reduktion',
  'Weniger Suessigkeiten': 'Reduktion',
}

<<<<<<< HEAD
const monthlyProgress = [
  { day: 'W1', value: 58 },
  { day: 'W2', value: 64 },
  { day: 'W3', value: 71 },
  { day: 'W4', value: 76 },
]

const smokingProgress = [
  { label: 'Heute', value: '2', detail: 'Zigaretten vermieden' },
  { label: 'Woche', value: '11', detail: 'Zigaretten weniger' },
]

const chartSeries = {
  week: {
    normalRange: { min: 50, max: 72 },
    data: [
      { label: 'Mo', value: 55 },
      { label: 'Di', value: 80 },
      { label: 'Mi', value: 45 },
      { label: 'Do', value: 90 },
      { label: 'Fr', value: 65 },
      { label: 'Sa', value: 75 },
      { label: 'So', value: 60 },
    ],
  },
  month: {
    normalRange: { min: 62, max: 76 },
    data: [
      { label: 'W1', value: 58 },
      { label: 'W2', value: 64 },
      { label: 'W3', value: 71 },
      { label: 'W4', value: 82 },
    ],
  },
}

const periodStats = {
  week: {
    label: 'Woche',
    average: 68,
    steps: 28400,
    improvement: 12,
    progress: weeklyProgress,
=======
const text = {
  german: {
    today: 'Heute',
    areas: 'Bereiche',
    completed: 'Erledigt',
    open: 'Offen',
    routines: 'Routinen',
    averageText: 'Durchschnitt aller Routinen',
    chartToday: 'Fortschritt pro Routine',
    chartAreas: 'Fortschritt nach Bereichen',
    details: 'Aktuelle Routinen',
    summary: 'Heute-Zusammenfassung',
    allDone: 'Alle Routinen sind geschafft. Sehr stark.',
    strongDay: 'Du bist heute gut im Flow.',
    quietDay: 'Heute ist noch Luft nach oben.',
    nextStep: 'Naechster sinnvoller Schritt: {habit}.',
    empty: 'Lege eine Routine an, damit hier dein Fortschritt erscheint.',
    fallbackCategory: 'Alltag',
>>>>>>> e5c3053684b9aa4cea450f1fe37dc7d00f9e4859
  },
  english: {
    today: 'Today',
    areas: 'Areas',
    completed: 'Done',
    open: 'Open',
    routines: 'routines',
    averageText: 'Average of all routines',
    chartToday: 'Progress per routine',
    chartAreas: 'Progress by area',
    details: 'Current routines',
    summary: 'Today summary',
    allDone: 'All routines are done. Strong work.',
    strongDay: 'You are in a good flow today.',
    quietDay: 'There is still room today.',
    nextStep: 'Best next step: {habit}.',
    empty: 'Add a routine so your progress can appear here.',
    fallbackCategory: 'Daily life',
  },
  turkish: {
    today: 'Bugun',
    areas: 'Alanlar',
    completed: 'Tamam',
    open: 'Acik',
    routines: 'rutin',
    averageText: 'Tum rutinlerin ortalamasi',
    chartToday: 'Rutin basina ilerleme',
    chartAreas: 'Alanlara gore ilerleme',
    details: 'Guncel rutinler',
    summary: 'Bugun ozeti',
    allDone: 'Tum rutinler tamamlandi. Cok iyi.',
    strongDay: 'Bugun iyi bir akistasin.',
    quietDay: 'Bugun hala alan var.',
    nextStep: 'En uygun sonraki adim: {habit}.',
    empty: 'Ilerlemeni gormek icin bir rutin ekle.',
    fallbackCategory: 'Gunluk',
  },
  arabic: {
    today: 'Today',
    areas: 'Areas',
    completed: 'Done',
    open: 'Open',
    routines: 'routines',
    averageText: 'Average of all routines',
    chartToday: 'Progress per routine',
    chartAreas: 'Progress by area',
    details: 'Current routines',
    summary: 'Today summary',
    allDone: 'All routines are done. Strong work.',
    strongDay: 'You are in a good flow today.',
    quietDay: 'There is still room today.',
    nextStep: 'Best next step: {habit}.',
    empty: 'Add a routine so your progress can appear here.',
    fallbackCategory: 'Daily life',
  },
}

function clampProgress(value) {
  return Math.min(Math.max(Math.round(Number(value) || 0), 0), 100)
}

function getHabitProgress(habit) {
  if (habit.done) {
    return 100
  }

  if (habit.progress !== undefined) {
    return clampProgress(habit.progress)
  }

  return clampProgress((Number(habit.current ?? 0) / Number(habit.target ?? 1)) * 100)
}

function getAverageProgress(items) {
  if (items.length === 0) {
    return 0
  }

  return Math.round(items.reduce((sum, item) => sum + getHabitProgress(item), 0) / items.length)
}

function getHabitTitle(habit) {
  return habit.displayTitle ?? habit.title
}

function getShortLabel(habit) {
  const title = getHabitTitle(habit)
  const words = title.split(' ').filter(Boolean)

  return words.length > 1
    ? words.map((word) => word[0]).join('').slice(0, 3)
    : title.slice(0, 3)
}

function getHabitCategory(habit, copy) {
  return habit.category ?? categoryByTitle[habit.title] ?? copy.fallbackCategory
}

function getCategoryData(habits, copy) {
  const groups = habits.reduce((result, habit) => {
    const category = getHabitCategory(habit, copy)

    return {
      ...result,
      [category]: [...(result[category] ?? []), habit],
    }
  }, {})

  return Object.entries(groups).map(([category, categoryHabits]) => ({
    label: category,
    value: getAverageProgress(categoryHabits),
    title: category,
  }))
}

function Statistik({ habits = [], languageStyle, t }) {
  const [view, setView] = useState('today')
  const copy = text[languageStyle] ?? text.german
  const locale = languageStyle === 'german' ? 'de-DE' : 'en-US'
  const averageProgress = getAverageProgress(habits)
  const completedHabits = habits.filter((habit) => getHabitProgress(habit) >= 100).length
  const openHabits = Math.max(habits.length - completedHabits, 0)
  const chartData = view === 'today'
    ? habits.map((habit) => ({
        label: getShortLabel(habit),
        value: getHabitProgress(habit),
        title: getHabitTitle(habit),
      }))
    : getCategoryData(habits, copy)
  const nextHabit = habits
    .filter((habit) => getHabitProgress(habit) < 100)
    .sort((firstHabit, secondHabit) => getHabitProgress(secondHabit) - getHabitProgress(firstHabit))[0]
  const summaryTitle = habits.length === 0
    ? copy.empty
    : openHabits === 0
      ? copy.allDone
      : averageProgress >= 60
        ? copy.strongDay
        : copy.quietDay
  const summaryText = nextHabit
    ? copy.nextStep.replace('{habit}', getHabitTitle(nextHabit))
    : `${averageProgress}% ${copy.averageText.toLowerCase()}`

  return (
    <section className="screen">
      <p className="eyebrow">{t.stats.eyebrow}</p>
      <h1>{t.stats.title}</h1>

      <div className="period-toggle" aria-label={t.stats.periodLabel}>
        <button
          className={view === 'today' ? 'selected' : ''}
          onClick={() => setView('today')}
          type="button"
        >
          {copy.today}
        </button>
        <button
          className={view === 'areas' ? 'selected' : ''}
          onClick={() => setView('areas')}
          type="button"
        >
          {copy.areas}
        </button>
      </div>

      <div className="stat-summary-grid">
        <article className="stat-card summary-card">
          <span>{t.stats.average}</span>
          <strong>{averageProgress}%</strong>
          <p>{copy.averageText}</p>
        </article>
        <article className="stat-card summary-card improvement-card">
          <span>{copy.completed}</span>
          <strong>{completedHabits.toLocaleString(locale)}</strong>
          <p>{copy.routines}</p>
        </article>
        <article className="stat-card summary-card">
          <span>{copy.open}</span>
          <strong>{openHabits.toLocaleString(locale)}</strong>
          <p>{copy.routines}</p>
        </article>
      </div>
<<<<<<< HEAD
      <WellbeingDashboard
        title={t.stats.wellbeingTitle}
        subtitle={t.stats.wellbeingSubtitle}
        infoLabel={t.stats.wellbeingInfo}
        period={period}
        periodOptions={[
          { value: 'week', label: t.stats.week },
          { value: 'month', label: t.stats.month },
        ]}
        onPeriodChange={setPeriod}
        metrics={[
          { label: t.stats.wellbeingMood, value: activeStats.average, unit: '%' },
          { label: t.stats.wellbeingStrength, value: activeStats.improvement, unit: '%' },
          { label: t.stats.wellbeingHabits, value: smokingProgress.length },
        ]}
        chartData={chartSeries[period].data}
        chartTitle={t.stats.wellbeingChart}
        habits={smokingProgress.map((entry) => ({
          title: entry.label,
          detail: entry.detail,
        }))}
        habitsTitle={t.stats.wellbeingHabits}
        insights={[]}
        insightsTitle={t.stats.wellbeingInsights}
        lastUpdated={t.stats.wellbeingLastUpdated}
        noDataText={t.stats.wellbeingNoData}
        noInsightsText={t.stats.wellbeingNoInsights}
      />
      <div className="smoking-stats">
        {smokingProgress.map((entry, index) => (
          <article className="stat-card smoking-card" key={entry.label}>
            <span>{index === 0 ? t.stats.today : t.stats.week}</span>
            <strong>{entry.value}</strong>
            <p>{index === 0 ? t.stats.cigarettesAvoided : t.stats.fewerCigarettes}</p>
          </article>
        ))}
=======

      <div
        className="chart-card dynamic-chart-card"
        aria-label={view === 'today' ? copy.chartToday : copy.chartAreas}
      >
        {chartData.map((entry) => (
          <div className="bar-wrap" key={`${entry.label}-${entry.title}`} title={entry.title}>
            <div className="bar" style={{ height: `${entry.value}%` }} />
            <span>{entry.label}</span>
          </div>
        ))}
      </div>

      <div className="routine-progress-list" aria-label={copy.details}>
        {habits.map((habit) => {
          const progress = getHabitProgress(habit)

          return (
            <article className="routine-progress-row" key={habit.id}>
              <div>
                <strong>{getHabitTitle(habit)}</strong>
                <span>{habit.detail}</span>
              </div>
              <b>{progress}%</b>
            </article>
          )
        })}
>>>>>>> e5c3053684b9aa4cea450f1fe37dc7d00f9e4859
      </div>

      <article className="motivation-card">
        <div className="motivation-bubble">
          <span>{copy.summary}</span>
          <h2>{summaryTitle}</h2>
          <p>{summaryText}</p>
        </div>
        <div className="motivation-progress" aria-label={`${averageProgress}% ${t.stats.average}`}>
          <span style={{ width: `${averageProgress}%` }} />
        </div>
        <small>{averageProgress}% {copy.averageText.toLowerCase()}</small>
      </article>
    </section>
  )
}

export default Statistik
