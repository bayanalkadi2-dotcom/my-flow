import { useCallback, useEffect, useMemo, useState } from 'react'
import FlowtreeProgress from '../commponents/progress/FlowtreeProgress'
import { useProfile } from '../context/profileContextValue'
import { getUserCheckIns } from '../services/checkInService'
import { calculateFlowtreeStats } from '../utils/flowtreeStats'

const USAGE_STORAGE_KEY = 'myflow_app_usage_ms'
const SLEEP_ENTRIES_STORAGE_KEY = 'myflow_sleep_entries'

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

function readStoredSleepEntries() {
  try {
    const entries = JSON.parse(localStorage.getItem(SLEEP_ENTRIES_STORAGE_KEY) || '[]')
    return Array.isArray(entries) ? entries : []
  } catch {
    return []
  }
}

function getAverageSleepHours(entries) {
  if (entries.length === 0) return null

  const totalHours = entries.reduce((sum, entry) => sum + Number(entry.duration || 0), 0)
  return totalHours / entries.length
}

function Statistik({ habits = [], t }) {
  const { personalizedTexts } = useProfile()
  const [checkIns, setCheckIns] = useState([])
  const [checkInsLoading, setCheckInsLoading] = useState(true)
  const [checkInsError, setCheckInsError] = useState('')
  const [usageTimeMs, setUsageTimeMs] = useState(readStoredUsageTime)
  const [sleepBedtime, setSleepBedtime] = useState('')
  const [sleepDuration, setSleepDuration] = useState('')
  const [sleepEntries, setSleepEntries] = useState(readStoredSleepEntries)
  const averageSleepHours = getAverageSleepHours(sleepEntries)
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

  function handleSaveSleepEntry(event) {
    event.preventDefault()

    if (!sleepBedtime || !sleepDuration) return

    const nextEntries = [
      ...sleepEntries,
      {
        id: Date.now(),
        date: new Date().toISOString(),
        bedtime: sleepBedtime,
        duration: Number(sleepDuration),
      },
    ].slice(-7)

    setSleepEntries(nextEntries)
    localStorage.setItem(SLEEP_ENTRIES_STORAGE_KEY, JSON.stringify(nextEntries))
    setSleepBedtime('')
    setSleepDuration('')
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
                <h2 id="sleep-tracker-title">Schlaf-Tracker</h2>
              </div>
            </div>

            <p>Der Nutzer trägt ein:</p>
            <form className="sleep-tracker-form" onSubmit={handleSaveSleepEntry}>
              <label>
                <span>Wann bin ich schlafen gegangen?</span>
                <input
                  aria-label="Schlafenszeit"
                  onChange={(event) => setSleepBedtime(event.target.value)}
                  type="time"
                  value={sleepBedtime}
                />
              </label>
              <label>
                <span>Wie lange habe ich geschlafen?</span>
                <input
                  aria-label="Schlafdauer in Stunden"
                  min="0"
                  onChange={(event) => setSleepDuration(event.target.value)}
                  placeholder="z. B. 7.5"
                  step="0.25"
                  type="number"
                  value={sleepDuration}
                />
              </label>
              <button type="submit">Eintrag speichern</button>
            </form>
            <div className="sleep-tracker-average">
              <span>Wochendurchschnitt</span>
              <strong>
                {averageSleepHours === null
                  ? 'Noch kein Schlaf eingetragen.'
                  : `${averageSleepHours.toFixed(1)} Stunden pro Nacht`}
              </strong>
            </div>
          </section>
        </>
      )}
    </section>
  )
}

export default Statistik
