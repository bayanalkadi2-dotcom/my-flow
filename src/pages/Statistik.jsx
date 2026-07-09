import { useCallback, useEffect, useMemo, useState } from 'react'
import FlowtreeProgress from '../commponents/progress/FlowtreeProgress'
import { useProfile } from '../context/profileContextValue'
import { getUserCheckIns } from '../services/checkInService'
import { getSleepEntries, saveSleepEntry } from '../services/sleepService'
import { calculateFlowtreeStats } from '../utils/flowtreeStats'

const USAGE_STORAGE_KEY = 'myflow_app_usage_ms'
const WEEKDAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

function formatUsageTime(milliseconds) {
  const totalMinutes = Math.floor(milliseconds / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours <= 0) return `${minutes} Min`
  if (minutes === 0) return `${hours} Std`
  return `${hours} Std ${minutes} Min`
}

function readStoredUsageTime() {
  const storedValue = Number(localStorage.getItem(USAGE_STORAGE_KEY))
  return Number.isFinite(storedValue) && storedValue > 0 ? storedValue : 0
}

function getAverageSleepHours(entries) {
  if (entries.length === 0) return null

  const totalMinutes = entries.reduce((sum, entry) => sum + Number(entry.duration_minutes || 0), 0)
  return totalMinutes / entries.length / 60
}

function toLocalDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getCurrentWeek() {
  const today = new Date()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))

  return WEEKDAY_LABELS.map((label, index) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)
    return { date, dateKey: toLocalDateKey(date), label }
  })
}

function getCalendarDays(monthDate) {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate()
  const leadingDays = (firstDay.getDay() + 6) % 7

  return Array.from({ length: leadingDays + daysInMonth }, (_, index) => {
    const day = index - leadingDays + 1
    if (day < 1) return null
    const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day)
    return { day, dateKey: toLocalDateKey(date) }
  })
}

function formatCompactHours(minutes) {
  if (!Number.isFinite(Number(minutes))) return '-'
  return `${(Number(minutes) / 60).toFixed(1)}h`
}

function formatStoredTime(time) {
  return time ? time.slice(0, 5) : '-'
}

function calculateSleepDurationMinutes(bedtime, wakeTime) {
  if (!bedtime || !wakeTime) return null

  const [bedtimeHours, bedtimeMinutes] = bedtime.split(':').map(Number)
  const [wakeHours, wakeMinutes] = wakeTime.split(':').map(Number)
  const bedtimeTotal = bedtimeHours * 60 + bedtimeMinutes
  const wakeTotal = wakeHours * 60 + wakeMinutes
  const duration = (wakeTotal - bedtimeTotal + 24 * 60) % (24 * 60)

  return duration || 24 * 60
}

function formatSleepDuration(totalMinutes) {
  if (totalMinutes === null) return 'Noch keine Schlafdauer berechnet.'

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (minutes === 0) return `${hours} Std.`
  return `${hours} Std. ${minutes} Min.`
}

function Statistik({ habits = [], t }) {
  const { personalizedTexts } = useProfile()
  const [checkIns, setCheckIns] = useState([])
  const [checkInsLoading, setCheckInsLoading] = useState(true)
  const [checkInsError, setCheckInsError] = useState('')
  const [usageTimeMs, setUsageTimeMs] = useState(readStoredUsageTime)
  const [todayDateKey] = useState(() => toLocalDateKey(new Date()))
  const [sleepDate, setSleepDate] = useState(() => toLocalDateKey(new Date()))
  const [sleepBedtime, setSleepBedtime] = useState('')
  const [sleepWakeTime, setSleepWakeTime] = useState('')
  const [sleepEntries, setSleepEntries] = useState([])
  const [sleepLoading, setSleepLoading] = useState(true)
  const [sleepError, setSleepError] = useState('')
  const [sleepSaving, setSleepSaving] = useState(false)
  const [isSleepCalendarOpen, setIsSleepCalendarOpen] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(() => new Date())
  const sleepDurationMinutes = calculateSleepDurationMinutes(sleepBedtime, sleepWakeTime)
  const currentWeek = useMemo(() => getCurrentWeek(), [])
  const weeklyEntries = useMemo(() => {
    const weekKeys = new Set(currentWeek.map((day) => day.dateKey))
    return sleepEntries.filter((entry) => weekKeys.has(entry.sleep_date))
  }, [currentWeek, sleepEntries])
  const entriesByDate = useMemo(
    () => new Map(sleepEntries.map((entry) => [entry.sleep_date, entry])),
    [sleepEntries],
  )
  const averageSleepHours = getAverageSleepHours(weeklyEntries)
  const calendarDays = useMemo(() => getCalendarDays(calendarMonth), [calendarMonth])
  const selectedSleepEntry = entriesByDate.get(sleepDate)
  const stats = useMemo(() => ({
    ...calculateFlowtreeStats({ routines: habits, checkIns }),
    usageTime: formatUsageTime(usageTimeMs),
  }), [habits, checkIns, usageTimeMs])
  const hasProgress = stats.growthPoints > 0 || stats.checkIns > 0 || stats.completedRoutines > 0
  const headerMessage = hasProgress
    ? personalizedTexts.statisticsIntro
    : 'Starte deine erste Routine oder deinen ersten Check-in.'

  const loadCheckIns = useCallback(async () => {
    setCheckInsLoading(true)
    setCheckInsError('')

    try {
      const data = await getUserCheckIns()
      setCheckIns(data)
    } catch (error) {
      console.error('Check-ins konnten nicht geladen werden:', error)
      setCheckIns([])
      setCheckInsError(error.message || 'Check-ins konnten nicht geladen werden.')
    } finally {
      setCheckInsLoading(false)
    }
  }, [])

  const loadSleepEntries = useCallback(async () => {
    setSleepLoading(true)
    setSleepError('')

    try {
      const entries = await getSleepEntries()
      const todayEntry = entries.find((entry) => entry.sleep_date === toLocalDateKey(new Date()))
      setSleepEntries(entries)
      if (todayEntry) {
        setSleepBedtime(formatStoredTime(todayEntry.bedtime))
        setSleepWakeTime(formatStoredTime(todayEntry.wake_time))
      }
    } catch (error) {
      console.error('Schlafdaten konnten nicht geladen werden:', error)
      setSleepEntries([])
      setSleepError('Schlafdaten konnten nicht geladen werden.')
    } finally {
      setSleepLoading(false)
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
    let cancelled = false

    Promise.resolve().then(() => {
      if (!cancelled) loadSleepEntries()
    })

    return () => {
      cancelled = true
    }
  }, [loadSleepEntries])

  useEffect(() => {
    function handleFocus() {
      loadCheckIns()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [loadCheckIns])

  useEffect(() => {
    let activeSince = document.visibilityState === 'visible' ? Date.now() : null

    function saveUsageTime() {
      if (!activeSince) return

      const now = Date.now()
      const nextUsageTime = readStoredUsageTime() + now - activeSince
      activeSince = now
      localStorage.setItem(USAGE_STORAGE_KEY, String(nextUsageTime))
      setUsageTimeMs(nextUsageTime)
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        activeSince = Date.now()
        return
      }

      saveUsageTime()
      activeSince = null
    }

    const intervalId = window.setInterval(saveUsageTime, 30000)

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', saveUsageTime)

    return () => {
      saveUsageTime()
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', saveUsageTime)
    }
  }, [])

  async function handleSaveSleepEntry(event) {
    event.preventDefault()

    if (sleepDurationMinutes === null) return
    setSleepSaving(true)
    setSleepError('')

    try {
      const savedEntry = await saveSleepEntry({
        sleepDate,
        bedtime: sleepBedtime,
        wakeTime: sleepWakeTime,
        durationMinutes: sleepDurationMinutes,
      })
      setSleepEntries((entries) => [
        ...entries.filter((entry) => entry.sleep_date !== savedEntry.sleep_date),
        savedEntry,
      ].sort((first, second) => first.sleep_date.localeCompare(second.sleep_date)))
    } catch (error) {
      console.error('Schlafeintrag konnte nicht gespeichert werden:', error)
      setSleepError('Schlaf konnte nicht gespeichert werden.')
    } finally {
      setSleepSaving(false)
    }
  }

  function changeCalendarMonth(offset) {
    setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() + offset, 1))
  }

  function selectSleepDate(dateKey) {
    if (!dateKey || dateKey > todayDateKey) return

    const entry = entriesByDate.get(dateKey)
    setSleepDate(dateKey)
    setSleepBedtime(entry ? formatStoredTime(entry.bedtime) : '')
    setSleepWakeTime(entry ? formatStoredTime(entry.wake_time) : '')
    setSleepError('')
  }

  function openSleepCalendar() {
    const [year, month] = sleepDate.split('-').map(Number)
    setCalendarMonth(new Date(year, month - 1, 1))
    setIsSleepCalendarOpen(true)
  }

  return (
    <section className="screen stats-page flowtree-stats-page">
      <header className="stats-hero flowtree-hero">
        <div>
          <p className="eyebrow">{t.stats.eyebrow}</p>
          <h1>{personalizedTexts.statisticsTitle}</h1>
          <p>{headerMessage}</p>
        </div>
        <span className="stats-date-chip">Heute</span>
      </header>

      {checkInsError && (
        <div className="stats-empty-state flowtree-error-state" role="alert">
          <strong>Check-ins konnten nicht geladen werden.</strong>
          <p>{checkInsError}</p>
          <button className="secondary-button" onClick={loadCheckIns} type="button">Erneut laden</button>
        </div>
      )}

      {checkInsLoading ? (
        <section className="flowtree-loading-card" aria-busy="true">
          <span />
          <span />
          <span />
        </section>
      ) : (
        <>
          <FlowtreeProgress stats={stats} />
          <section className="sleep-tracker-card" aria-labelledby="sleep-tracker-title">
            <div className="sleep-tracker-header">
              <span className="sleep-tracker-icon" aria-hidden="true">Zz</span>
              <div>
                <span>Schlaf</span>
                <h2 id="sleep-tracker-title">Trage deinen Schlaf ein</h2>
              </div>
            </div>

            <p className="sleep-tracker-description">
              Erfasse deinen Schlaf und behalte deine Schlafgewohnheiten im Blick.
            </p>
            <form className="sleep-tracker-form" onSubmit={handleSaveSleepEntry}>
              <label>
                <span>Schlafenszeit</span>
                <input
                  aria-label="Schlafenszeit"
                  onChange={(event) => setSleepBedtime(event.target.value)}
                  type="time"
                  value={sleepBedtime}
                />
              </label>
              <label>
                <span>Aufstehzeit</span>
                <input
                  aria-label="Aufstehzeit"
                  onChange={(event) => setSleepWakeTime(event.target.value)}
                  type="time"
                  value={sleepWakeTime}
                />
              </label>
              <div className="sleep-duration-result" aria-live="polite">
                <span>Wie lange habe ich geschlafen?</span>
                <strong>{formatSleepDuration(sleepDurationMinutes)}</strong>
              </div>
              <button disabled={sleepDurationMinutes === null || sleepSaving} type="submit">
                {sleepSaving ? 'Wird gespeichert …' : 'Eintrag speichern'}
              </button>
            </form>
            {sleepError && <p className="sleep-tracker-error" role="alert">{sleepError}</p>}
            <div className="sleep-tracker-average">
              <span>Wochendurchschnitt</span>
              <strong>
                {sleepLoading
                  ? 'Wird geladen …'
                  : averageSleepHours === null
                  ? 'Noch kein Schlaf eingetragen.'
                  : `${averageSleepHours.toFixed(1)} Stunden pro Nacht`}
              </strong>
            </div>
            <div className="sleep-week-row">
              <div className="sleep-week-strip" aria-label="Schlafdauer dieser Woche">
                {currentWeek.map((day) => {
                  const entry = entriesByDate.get(day.dateKey)
                  return (
                    <button
                      aria-label={`${day.label}, ${day.date.toLocaleDateString('de-DE')}${entry ? `, ${formatCompactHours(entry.duration_minutes)}` : ', kein Eintrag'}`}
                      className={`${entry ? 'has-entry' : ''} ${sleepDate === day.dateKey ? 'selected' : ''}`}
                      disabled={day.dateKey > todayDateKey}
                      key={day.dateKey}
                      onClick={() => selectSleepDate(day.dateKey)}
                      type="button"
                    >
                      <span>{day.label}</span>
                      <strong>{entry ? formatCompactHours(entry.duration_minutes) : '-'}</strong>
                      {entry && <i aria-hidden="true" />}
                    </button>
                  )
                })}
              </div>
              <button
                aria-label="Schlafkalender öffnen"
                className="sleep-calendar-button"
                onClick={openSleepCalendar}
                type="button"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <path d="M7 3v3m10-3v3M4.5 9h15M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
                </svg>
              </button>
            </div>
          </section>

          {isSleepCalendarOpen && (
            <div className="sleep-calendar-overlay" role="presentation">
              <section
                aria-labelledby="sleep-calendar-title"
                aria-modal="true"
                className="sleep-calendar-sheet"
                role="dialog"
              >
                <header>
                  <div>
                    <span>Schlafübersicht</span>
                    <h3 id="sleep-calendar-title">
                      {calendarMonth.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                    </h3>
                  </div>
                  <button
                    aria-label="Schlafkalender schließen"
                    className="sleep-calendar-close"
                    onClick={() => setIsSleepCalendarOpen(false)}
                    type="button"
                  >×</button>
                </header>
                <div className="sleep-calendar-navigation">
                  <button aria-label="Vorheriger Monat" onClick={() => changeCalendarMonth(-1)} type="button">‹</button>
                  <button aria-label="Nächster Monat" onClick={() => changeCalendarMonth(1)} type="button">›</button>
                </div>
                <div className="sleep-calendar-grid" aria-label="Kalender">
                  {WEEKDAY_LABELS.map((label) => <span className="sleep-calendar-weekday" key={label}>{label}</span>)}
                  {calendarDays.map((day, index) => day ? (
                    <button
                      aria-label={`${day.day}. ${calendarMonth.toLocaleDateString('de-DE', { month: 'long' })}`}
                      className={`${entriesByDate.has(day.dateKey) ? 'has-entry' : ''} ${sleepDate === day.dateKey ? 'selected' : ''}`}
                      disabled={day.dateKey > todayDateKey}
                      key={day.dateKey}
                      onClick={() => selectSleepDate(day.dateKey)}
                      type="button"
                    >
                      {day.day}
                      {entriesByDate.has(day.dateKey) && <i aria-hidden="true" />}
                    </button>
                  ) : <span aria-hidden="true" key={`empty-${index}`} />)}
                </div>
                {selectedSleepEntry && (
                  <div className="sleep-calendar-detail" aria-live="polite">
                    <strong>{new Date(`${selectedSleepEntry.sleep_date}T12:00:00`).toLocaleDateString('de-DE', {
                      weekday: 'long', day: '2-digit', month: 'long',
                    })}</strong>
                    <dl>
                      <div><dt>Schlafenszeit</dt><dd>{formatStoredTime(selectedSleepEntry.bedtime)} Uhr</dd></div>
                      <div><dt>Aufstehzeit</dt><dd>{formatStoredTime(selectedSleepEntry.wake_time)} Uhr</dd></div>
                      <div><dt>Schlafdauer</dt><dd>{formatSleepDuration(selectedSleepEntry.duration_minutes)}</dd></div>
                    </dl>
                  </div>
                )}
                {!selectedSleepEntry && (
                  <p className="sleep-calendar-hint">
                    Für dieses Datum gibt es noch keinen Eintrag. Du kannst ihn jetzt nachtragen.
                  </p>
                )}
                <button
                  className="sleep-calendar-select-button"
                  onClick={() => setIsSleepCalendarOpen(false)}
                  type="button"
                >Datum übernehmen</button>
              </section>
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default Statistik
