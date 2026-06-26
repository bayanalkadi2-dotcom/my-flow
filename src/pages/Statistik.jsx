import { useCallback, useEffect, useMemo, useState } from 'react'
import { getTaskById } from '../data/wellbeingTasks'
import { getUserCheckIns } from '../services/checkInService'

const categoryByTitle = {
  'Wasser trinken': 'Körper',
  Bewegung: 'Körper',
  Schlaf: 'Körper',
  Periode: 'Körper',
  Entspannung: 'Mental',
  Meditation: 'Mental',
  Dankbarkeit: 'Mental',
  'Stimmung tracken': 'Mental',
  'Digitale Pause': 'Mental',
  Lernen: 'Produktiv',
  Aufräumen: 'Produktiv',
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

const valueLabels = {
  very_bad: 'Sehr schlecht',
  bad: 'Schlecht',
  neutral: 'Neutral',
  good: 'Gut',
  very_good: 'Sehr gut',
  none: 'Keine',
  very_low: 'Sehr niedrig',
  low: 'Niedrig',
  medium: 'Mittel',
  high: 'Hoch',
  very_high: 'Sehr hoch',
  exhausted: 'Erschöpft',
  calm: 'Ruhig',
  tense: 'Angespannt',
  sad: 'Traurig',
  irritated: 'Gereizt',
  motivated: 'Motiviert',
  overwhelmed: 'Überfordert',
  balanced: 'Ausgeglichen',
  relaxation: 'Entspannung',
  movement: 'Bewegung',
  focus: 'Fokus',
  motivation: 'Motivation',
  emotional_relief: 'Emotionale Entlastung',
  energy: 'Energie',
  sleep_preparation: 'Schlafvorbereitung',
}

const levelMap = {
  none: 0,
  very_bad: 1,
  very_low: 1,
  bad: 2,
  low: 2,
  neutral: 3,
  medium: 3,
  good: 4,
  high: 4,
  very_good: 5,
  very_high: 5,
  exhausted: 5,
}

function labelValue(value) {
  if (value === null || value === undefined || value === '') return 'Nicht angegeben'
  return valueLabels[value] ?? String(value).replaceAll('_', ' ')
}

function clampProgress(value) {
  return Math.min(Math.max(Math.round(Number(value) || 0), 0), 100)
}

function safeNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? Math.max(number, 0) : fallback
}

function getHabitProgress(habit) {
  if (habit.done) return 100
  if (habit.progress !== undefined) return clampProgress(habit.progress)

  const target = safeNumber(habit.target, 0)
  if (target <= 0) return 0

  return clampProgress((safeNumber(habit.current) / target) * 100)
}

function getAverageProgress(items) {
  if (items.length === 0) return 0
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
  return words.length > 1 ? words.map((word) => word[0]).join('').slice(0, 3) : title.slice(0, 3)
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
    return { ...result, [category]: [...(result[category] ?? []), habit] }
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

  if (!target) return getHabitDetail(habit) || `${getHabitProgress(habit)}%`
  return `${copy.current}: ${current.toLocaleString()}${unit ? ` ${unit}` : ''} · ${copy.target}: ${target.toLocaleString()}${unit ? ` ${unit}` : ''}`
}

function formatDateTime(value) {
  if (!value) return { date: 'Kein Datum', time: '' }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return { date: 'Kein Datum', time: '' }
  return {
    date: date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    time: date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
  }
}

function averageLevel(checkIns, key) {
  const values = checkIns
    .map((checkIn) => levelMap[checkIn[key]])
    .filter((value) => Number.isFinite(value))

  if (values.length === 0) return 0
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10
}

function mostCommonGoal(checkIns) {
  const counts = checkIns.reduce((result, checkIn) => {
    if (!checkIn.support_goal) return result
    return { ...result, [checkIn.support_goal]: (result[checkIn.support_goal] ?? 0) + 1 }
  }, {})
  const [goal] = Object.entries(counts).sort((first, second) => second[1] - first[1])[0] ?? []
  return goal ? labelValue(goal) : 'Noch kein Ziel'
}

function recommendationLabel(taskId) {
  const task = getTaskById(taskId)
  return task?.title ?? labelValue(taskId)
}

function recommendationText(checkIn) {
  const ids = Array.isArray(checkIn.recommended_task_ids) ? checkIn.recommended_task_ids : []
  if (ids.length === 0) return 'Keine Empfehlung gespeichert'
  return ids.map(recommendationLabel).join(', ')
}

function getCheckInTrend(checkIns) {
  return [...checkIns]
    .slice(0, 7)
    .reverse()
    .map((checkIn) => ({
      label: formatDateTime(checkIn.created_at).date.slice(0, 5),
      stress: levelMap[checkIn.stress_level] ?? 0,
      energy: levelMap[checkIn.mental_energy] ?? 0,
    }))
}

function Statistik({ habits = [], languageStyle, onNavigate, t }) {
  const [view, setView] = useState('today')
  const [checkIns, setCheckIns] = useState([])
  const [checkInsLoading, setCheckInsLoading] = useState(true)
  const [checkInsError, setCheckInsError] = useState('')
  const copy = text[languageStyle] ?? text.german
  const locale = languageStyle === 'german' ? 'de-DE' : 'en-US'
  const averageProgress = getAverageProgress(habits)
  const completedHabits = habits.filter((habit) => getHabitProgress(habit) >= 100).length
  const openHabits = Math.max(habits.length - completedHabits, 0)
  const categoryData = getCategoryData(habits, copy)
  const chartData = view === 'today'
    ? habits.map((habit) => ({ label: getShortLabel(habit), value: getHabitProgress(habit), title: getHabitTitle(habit) }))
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
  const latestCheckIn = checkIns[0]
  const checkInStats = useMemo(() => ({
    count: checkIns.length,
    averageStress: averageLevel(checkIns, 'stress_level'),
    averageTiredness: averageLevel(checkIns, 'tiredness_level'),
    averageMentalEnergy: averageLevel(checkIns, 'mental_energy'),
    commonGoal: mostCommonGoal(checkIns),
    trend: getCheckInTrend(checkIns),
  }), [checkIns])

  const loadCheckIns = useCallback(async () => {
    setCheckInsLoading(true)
    setCheckInsError('')
    try {
      const data = await getUserCheckIns()
      setCheckIns(data)
    } catch (error) {
      console.error('Check-ins konnten nicht geladen werden:', error)
      setCheckInsError(error.message || 'Check-ins konnten nicht geladen werden.')
    } finally {
      setCheckInsLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    Promise.resolve().then(() => {
      if (!cancelled) loadCheckIns()
    })

    return () => {
      cancelled = true
    }
  }, [loadCheckIns])

  useEffect(() => {
    function handleFocus() {
      loadCheckIns()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [loadCheckIns])

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
        <button className={view === 'today' ? 'selected' : ''} onClick={() => setView('today')} type="button">
          {copy.today}
        </button>
        <button className={view === 'areas' ? 'selected' : ''} onClick={() => setView('areas')} type="button">
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

      <CheckInStatsSection
        checkIns={checkIns}
        error={checkInsError}
        latestCheckIn={latestCheckIn}
        loading={checkInsLoading}
        onNavigate={onNavigate}
        onReload={loadCheckIns}
        stats={checkInStats}
      />

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

function CheckInStatsSection({ checkIns, error, latestCheckIn, loading, onNavigate, onReload, stats }) {
  if (loading) {
    return (
      <section className="stats-checkin-section" aria-busy="true">
        <div className="stats-section-header">
          <div>
            <span>Deine Check-ins</span>
            <h2>Tages-Check-in</h2>
          </div>
        </div>
        <div className="checkin-skeleton-grid">
          <span />
          <span />
          <span />
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="stats-checkin-section">
        <div className="stats-section-header">
          <div>
            <span>Deine Check-ins</span>
            <h2>Tages-Check-in</h2>
          </div>
        </div>
        <div className="stats-empty-state">
          <strong>Check-ins konnten nicht geladen werden.</strong>
          <p>{error}</p>
          <button className="secondary-button" onClick={onReload} type="button">Erneut laden</button>
        </div>
      </section>
    )
  }

  if (checkIns.length === 0) {
    return (
      <section className="stats-checkin-section">
        <div className="stats-section-header">
          <div>
            <span>Deine Check-ins</span>
            <h2>Tages-Check-in</h2>
          </div>
        </div>
        <div className="stats-empty-state">
          <strong>Noch keine Check-ins vorhanden.</strong>
          <p>Führe deinen ersten Tages-Check-in durch, um hier deinen Verlauf zu sehen.</p>
          <button className="primary-cta" onClick={() => onNavigate?.('checkin')} type="button">Check-in starten</button>
        </div>
      </section>
    )
  }

  return (
    <section className="stats-checkin-section">
      <div className="stats-section-header">
        <div>
          <span>Deine Check-ins</span>
          <h2>Tages-Check-in</h2>
        </div>
        <button className="secondary-button stats-refresh-button" onClick={onReload} type="button">Aktualisieren</button>
      </div>

      <div className="checkin-overview-grid">
        <article>
          <span>Anzahl</span>
          <strong>{stats.count}</strong>
          <p>gespeicherte Check-ins</p>
        </article>
        <article>
          <span>Stress Ø</span>
          <strong>{stats.averageStress || '0'}</strong>
          <p>von 5</p>
        </article>
        <article>
          <span>Müdigkeit Ø</span>
          <strong>{stats.averageTiredness || '0'}</strong>
          <p>von 5</p>
        </article>
        <article>
          <span>Mentale Energie Ø</span>
          <strong>{stats.averageMentalEnergy || '0'}</strong>
          <p>von 5</p>
        </article>
        <article>
          <span>Häufigstes Ziel</span>
          <strong>{stats.commonGoal}</strong>
          <p>aus deinen Check-ins</p>
        </article>
      </div>

      <LatestCheckIn checkIn={latestCheckIn} />
      <CheckInTrend trend={stats.trend} />
      <CheckInHistory checkIns={checkIns.slice(0, 5)} />
    </section>
  )
}

function LatestCheckIn({ checkIn }) {
  const { date, time } = formatDateTime(checkIn.created_at)
  const detailItems = [
    ['Befinden', labelValue(checkIn.general_mood)],
    ['Stress', labelValue(checkIn.stress_level)],
    ['Müdigkeit', labelValue(checkIn.tiredness_level)],
    ['Körperliche Energie', labelValue(checkIn.physical_energy)],
    ['Mentale Energie', labelValue(checkIn.mental_energy)],
    ['Konzentration', labelValue(checkIn.concentration_level)],
    ['Stimmung', labelValue(checkIn.mood)],
    ['Zeitfenster', `${checkIn.available_time_minutes ?? 'Nicht angegeben'} Min`],
    ['Ziel', labelValue(checkIn.support_goal)],
  ]

  return (
    <article className="latest-checkin-card">
      <div className="stats-section-header">
        <div>
          <span>Neuester Check-in</span>
          <h2>{date}</h2>
        </div>
        <strong>{time}</strong>
      </div>
      <div className="latest-checkin-grid">
        {detailItems.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <p className="checkin-recommendation-line">
        <span>Empfehlung</span>
        {recommendationText(checkIn)}
      </p>
    </article>
  )
}

function CheckInTrend({ trend }) {
  return (
    <article className="checkin-trend-card">
      <div className="stats-section-header">
        <div>
          <span>Verlauf</span>
          <h2>Letzte Check-ins</h2>
        </div>
      </div>
      <div className="checkin-trend-bars">
        {trend.map((entry) => (
          <div className="checkin-trend-item" key={entry.label}>
            <div>
              <span className="stress" style={{ height: `${entry.stress * 18}%` }} />
              <span className="energy" style={{ height: `${entry.energy * 18}%` }} />
            </div>
            <small>{entry.label}</small>
          </div>
        ))}
      </div>
    </article>
  )
}

function CheckInHistory({ checkIns }) {
  return (
    <article className="checkin-history-card">
      <div className="stats-section-header">
        <div>
          <span>Historie</span>
          <h2>Letzte Einträge</h2>
        </div>
      </div>
      <div className="checkin-history-list">
        {checkIns.map((checkIn) => {
          const { date } = formatDateTime(checkIn.created_at)

          return (
            <details className="checkin-history-item" key={checkIn.id}>
              <summary>
                <span>{date}</span>
                <strong>{labelValue(checkIn.general_mood)}</strong>
                <small>{labelValue(checkIn.support_goal)}</small>
              </summary>
              <div>
                <p>Stress: {labelValue(checkIn.stress_level)}</p>
                <p>Müdigkeit: {labelValue(checkIn.tiredness_level)}</p>
                <p>Empfehlung: {recommendationText(checkIn)}</p>
              </div>
            </details>
          )
        })}
      </div>
    </article>
  )
}

export default Statistik
