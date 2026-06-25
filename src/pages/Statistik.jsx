import { useState } from 'react'

const categoryByTitle = {
  'Wasser trinken': 'Körper',
  Bewegung: 'Körper',
  Sport: 'Körper',
  Schlaf: 'Körper',
  'Gesund essen': 'Körper',
  Periode: 'Körper',
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
  Aufräumen: 'Produktiv',
  'Freunde kontaktieren': 'Sozial',
  'Familie kontaktieren': 'Sozial',
  'Soziale Aktivität': 'Sozial',
  'Rauchen reduzieren': 'Reduktion',
  'Weniger Social Media': 'Reduktion',
  'Weniger Süßigkeiten': 'Reduktion',
}

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
    categories: 'Bereichsauswertung',
    routineList: 'Routinen im Überblick',
    current: 'Aktuell',
    target: 'Ziel',
    summary: 'Tageszusammenfassung',
    allDone: 'Alle Routinen sind geschafft.',
    strongDay: 'Du bist heute gut im Flow.',
    quietDay: 'Heute ist noch Luft nach oben.',
    nextStep: 'Nächster sinnvoller Schritt',
    noRoutines: 'Noch keine Routinen vorhanden',
    noRoutinesText: 'Starte mit einer Routine, damit hier deine Statistik sichtbar wird.',
    noCategoryData: 'Noch keine Bereiche verfügbar.',
    fallbackCategory: 'Alltag',
    bestArea: 'Stärkster Bereich',
    calendar: 'Heute',
  },
  english: {
    today: 'Today',
    areas: 'Areas',
    completed: 'Done',
    open: 'Open',
    routines: 'Routines',
    averageText: 'Average of all routines',
    chartToday: 'Progress per routine',
    chartAreas: 'Progress by area',
    categories: 'Area overview',
    routineList: 'Routine overview',
    current: 'Current',
    target: 'Target',
    summary: 'Daily summary',
    allDone: 'All routines are done.',
    strongDay: 'You are in a good flow today.',
    quietDay: 'There is still room today.',
    nextStep: 'Best next step',
    noRoutines: 'No routines yet',
    noRoutinesText: 'Start a routine so your statistics can appear here.',
    noCategoryData: 'No areas available yet.',
    fallbackCategory: 'Daily life',
    bestArea: 'Strongest area',
    calendar: 'Today',
  },
  turkish: {
    today: 'Bugün',
    areas: 'Alanlar',
    completed: 'Tamam',
    open: 'Açık',
    routines: 'Rutinler',
    averageText: 'Tüm rutinlerin ortalaması',
    chartToday: 'Rutin başına ilerleme',
    chartAreas: 'Alanlara göre ilerleme',
    categories: 'Alan özeti',
    routineList: 'Rutin özeti',
    current: 'Güncel',
    target: 'Hedef',
    summary: 'Gün özeti',
    allDone: 'Tüm rutinler tamamlandı.',
    strongDay: 'Bugün iyi bir akıştasın.',
    quietDay: 'Bugün hala alan var.',
    nextStep: 'En uygun sonraki adım',
    noRoutines: 'Henüz rutin yok',
    noRoutinesText: 'İstatistiklerini görmek için bir rutin başlat.',
    noCategoryData: 'Henüz alan yok.',
    fallbackCategory: 'Günlük',
    bestArea: 'En güçlü alan',
    calendar: 'Bugün',
  },
  arabic: {
    today: 'Today',
    areas: 'Areas',
    completed: 'Done',
    open: 'Open',
    routines: 'Routines',
    averageText: 'Average of all routines',
    chartToday: 'Progress per routine',
    chartAreas: 'Progress by area',
    categories: 'Area overview',
    routineList: 'Routine overview',
    current: 'Current',
    target: 'Target',
    summary: 'Daily summary',
    allDone: 'All routines are done.',
    strongDay: 'You are in a good flow today.',
    quietDay: 'There is still room today.',
    nextStep: 'Best next step',
    noRoutines: 'No routines yet',
    noRoutinesText: 'Start a routine so your statistics can appear here.',
    noCategoryData: 'No areas available yet.',
    fallbackCategory: 'Daily life',
    bestArea: 'Strongest area',
    calendar: 'Today',
  },
}

function clampProgress(value) {
  return Math.min(Math.max(Math.round(Number(value) || 0), 0), 100)
}

function safeNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? Math.max(number, 0) : fallback
}

function getHabitProgress(habit) {
  if (habit.done) {
    return 100
  }

  if (habit.progress !== undefined) {
    return clampProgress(habit.progress)
  }

  const target = safeNumber(habit.target, 0)
  if (target <= 0) {
    return 0
  }

  return clampProgress((safeNumber(habit.current) / target) * 100)
}

function getAverageProgress(items) {
  if (items.length === 0) {
    return 0
  }

  return Math.round(items.reduce((sum, item) => sum + getHabitProgress(item), 0) / items.length)
}

function getHabitTitle(habit) {
  return habit.displayTitle ?? habit.title ?? 'Routine'
}

function getHabitDetail(habit) {
  return habit.displayDetail ?? habit.detail ?? ''
}

function getShortLabel(habit) {
  const title = getHabitTitle(habit)
  const words = title.split(' ').filter(Boolean)

  return words.length > 1
    ? words.map((word) => word[0]).join('').slice(0, 3)
    : title.slice(0, 3)
}

function getInitial(value) {
  return String(value || 'R').trim().slice(0, 1).toUpperCase()
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

  return Object.entries(groups)
    .map(([category, categoryHabits]) => ({
      label: category,
      value: getAverageProgress(categoryHabits),
      count: categoryHabits.length,
      title: category,
    }))
    .sort((first, second) => second.value - first.value)
}

function formatRoutineValue(habit, copy) {
  const current = safeNumber(habit.current)
  const target = safeNumber(habit.target)
  const unit = habit.unit || ''

  if (!target) {
    return getHabitDetail(habit) || `${getHabitProgress(habit)}%`
  }

  return `${copy.current}: ${current.toLocaleString()}${unit ? ` ${unit}` : ''} · ${copy.target}: ${target.toLocaleString()}${unit ? ` ${unit}` : ''}`
}

function Statistik({ habits = [], languageStyle, t }) {
  const [view, setView] = useState('today')
  const copy = text[languageStyle] ?? text.german
  const locale = languageStyle === 'german' ? 'de-DE' : 'en-US'
  const averageProgress = getAverageProgress(habits)
  const completedHabits = habits.filter((habit) => getHabitProgress(habit) >= 100).length
  const openHabits = Math.max(habits.length - completedHabits, 0)
  const categoryData = getCategoryData(habits, copy)
  const chartData = view === 'today'
    ? habits.map((habit) => ({
        label: getShortLabel(habit),
        value: getHabitProgress(habit),
        title: getHabitTitle(habit),
      }))
    : categoryData
  const nextHabit = habits
    .filter((habit) => getHabitProgress(habit) < 100)
    .sort((firstHabit, secondHabit) => getHabitProgress(secondHabit) - getHabitProgress(firstHabit))[0]
  const topCategory = categoryData[0]
  const summaryTitle = habits.length === 0
    ? copy.noRoutines
    : openHabits === 0
      ? copy.allDone
      : averageProgress >= 60
        ? copy.strongDay
        : copy.quietDay
  const summaryText = habits.length === 0
    ? copy.noRoutinesText
    : nextHabit
      ? `${copy.nextStep}: ${getHabitTitle(nextHabit)}.`
      : `${averageProgress}% ${copy.averageText.toLowerCase()}`
  const headerSummary = habits.length === 0
    ? copy.noRoutinesText
    : `${completedHabits.toLocaleString(locale)} von ${habits.length.toLocaleString(locale)} ${copy.routines.toLowerCase()} abgeschlossen.`

  return (
    <section className="screen stats-page">
      <header className="stats-hero">
        <div>
          <p className="eyebrow">{t.stats.eyebrow}</p>
          <h1>{t.stats.title}</h1>
          <p>{headerSummary}</p>
        </div>
        <span className="stats-date-chip">{copy.calendar}</span>
      </header>

      <div className="period-toggle stats-view-toggle" aria-label={t.stats.periodLabel}>
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

      <div className="stat-summary-grid stats-overview-grid">
        <article className="stat-card summary-card stats-metric-card">
          <span>{t.stats.average}</span>
          <strong>{averageProgress}%</strong>
          <p>{copy.averageText}</p>
        </article>
        <article className="stat-card summary-card stats-metric-card">
          <span>{copy.completed}</span>
          <strong>{completedHabits.toLocaleString(locale)}</strong>
          <p>{copy.routines}</p>
        </article>
        <article className="stat-card summary-card stats-metric-card">
          <span>{copy.open}</span>
          <strong>{openHabits.toLocaleString(locale)}</strong>
          <p>{copy.routines}</p>
        </article>
        <article className="stat-card summary-card stats-metric-card">
          <span>{copy.bestArea}</span>
          <strong>{topCategory ? `${topCategory.value}%` : '0%'}</strong>
          <p>{topCategory?.label ?? copy.noCategoryData}</p>
        </article>
      </div>

      <section className="chart-card stats-chart-card" aria-label={view === 'today' ? copy.chartToday : copy.chartAreas}>
        <div className="stats-section-header">
          <div>
            <span>{view === 'today' ? copy.chartToday : copy.chartAreas}</span>
            <h2>{view === 'today' ? copy.today : copy.areas}</h2>
          </div>
          <strong>{averageProgress}%</strong>
        </div>

        {chartData.length > 0 ? (
          <div className="stats-bar-chart">
            {chartData.map((entry) => (
              <div className="stats-bar-item" key={`${entry.label}-${entry.title}`} title={entry.title}>
                <div className="stats-bar-track" aria-label={`${entry.title}: ${entry.value}%`}>
                  <span style={{ height: `${entry.value}%` }} />
                </div>
                <strong>{entry.value}%</strong>
                <small>{entry.label}</small>
              </div>
            ))}
          </div>
        ) : (
          <div className="stats-empty-state">
            <strong>{copy.noRoutines}</strong>
            <p>{copy.noRoutinesText}</p>
          </div>
        )}
      </section>

      <section className="stats-category-section">
        <div className="stats-section-header">
          <div>
            <span>{copy.categories}</span>
            <h2>{copy.areas}</h2>
          </div>
        </div>

        {categoryData.length > 0 ? (
          <div className="stats-category-grid">
            {categoryData.map((category) => (
              <article className="stats-category-card" key={category.label}>
                <div className="stats-category-top">
                  <span aria-hidden="true">{getInitial(category.label)}</span>
                  <div>
                    <strong>{category.label}</strong>
                    <small>{category.count.toLocaleString(locale)} {copy.routines.toLowerCase()}</small>
                  </div>
                  <b>{category.value}%</b>
                </div>
                <div className="stats-progress-track" aria-label={`${category.label}: ${category.value}%`}>
                  <span style={{ width: `${category.value}%` }} />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="stats-empty-state">
            <strong>{copy.noCategoryData}</strong>
            <p>{copy.noRoutinesText}</p>
          </div>
        )}
      </section>

      <section className="stats-routine-section">
        <div className="stats-section-header">
          <div>
            <span>{copy.routineList}</span>
            <h2>{copy.routines}</h2>
          </div>
        </div>

        {habits.length > 0 ? (
          <div className="routine-progress-list stats-routine-list" aria-label={copy.routineList}>
            {habits.map((habit) => {
              const progress = getHabitProgress(habit)

              return (
                <article className="routine-progress-row stats-routine-row" key={habit.id}>
                  <span className="stats-routine-icon" aria-hidden="true">{getInitial(getHabitTitle(habit))}</span>
                  <div>
                    <strong>{getHabitTitle(habit)}</strong>
                    <span>{formatRoutineValue(habit, copy)}</span>
                    <div className="stats-progress-track" aria-label={`${getHabitTitle(habit)}: ${progress}%`}>
                      <span style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <b>{progress}%</b>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="stats-empty-state">
            <strong>{copy.noRoutines}</strong>
            <p>{copy.noRoutinesText}</p>
          </div>
        )}
      </section>

      <article className="motivation-card stats-summary-card">
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
