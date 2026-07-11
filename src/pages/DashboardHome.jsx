import { useCallback, useEffect, useMemo, useState } from 'react'
import mascotImage from '../assets/flowtree/mascot-cutout.webp'
import { useProfile } from '../context/profileContextValue'
import { useCheckins } from '../context/checkinContextValue'
import { flowtreeLevels } from '../data/flowtreeLevels'
import { getDailyThought } from '../data/dailyThoughts'
import { getUserCheckIns } from '../services/checkInService'
import { calculateDailyRoutineProgress } from '../utils/dailyRoutineProgress'
import { calculateFlowtreeStats } from '../utils/flowtreeStats'
import { getLocalDateKey } from '../utils/checkins'

function formatProfileList(value) {
  return String(value || '')
    .split(/[\n,;]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4)
}

function getGrowthPresentation(treeType, level) {
  const stages = {
    oak: [
      ['Eiche als Samen', '🌰'],
      ['Eichenkeimling', '🌱'],
      ['Junge Eiche', '🌿'],
      ['Eiche', '🌳'],
      ['Starke Eiche', '🌳'],
    ],
    pine: [
      ['Tanne als Samen', '🌰'],
      ['Tannenkeimling', '🌱'],
      ['Junge Tanne', '🌿'],
      ['Tanne', '🌲'],
      ['Starke Tanne', '🌲'],
    ],
    flower: [
      ['Blumensamen', '🌰'],
      ['Blumenkeimling', '🌱'],
      ['Knospe', '🌷'],
      ['Blume', '🌸'],
      ['Blühende FlowFlower', '🌺'],
    ],
  }
  const safeType = stages[treeType] ? treeType : 'oak'
  const stageIndex = Math.min(Math.max(Number(level) - 1, 0), 4)
  const [name, symbol] = stages[safeType][stageIndex]

  return {
    name,
    symbol,
    productName: safeType === 'flower' ? 'FlowFlower' : 'FlowTree',
  }
}

function DashboardHome({ accountProfile = {}, calendarNotes = {}, habits, profileName, t, onNavigate }) {
  const { personalizedTexts } = useProfile()
  const { checkins: localCheckIns } = useCheckins()
  const [checkIns, setCheckIns] = useState([])
  const [checkInsLoading, setCheckInsLoading] = useState(true)
  const dailyProgress = calculateDailyRoutineProgress(habits)
  const mergedCheckIns = useMemo(() => {
    const merged = new Map()
    ;[...checkIns, ...localCheckIns].forEach((checkIn, index) => {
      const key = `${checkIn.routineId ?? checkIn.habitId ?? checkIn.id ?? index}:${checkIn.date ?? checkIn.created_at ?? checkIn.createdAt ?? index}`
      merged.set(key, checkIn)
    })
    return [...merged.values()]
  }, [checkIns, localCheckIns])
  const flowtreeStats = useMemo(() => (
    calculateFlowtreeStats({ routines: habits, checkIns: mergedCheckIns })
  ), [habits, mergedCheckIns])
  const flowtree = flowtreeStats.flowtree
  const currentLevel = flowtree.currentLevel
  const treeType = localStorage.getItem('myflow-tree-type') || 'oak'
  const growthPresentation = getGrowthPresentation(treeType, currentLevel.level)
  const nextLevelTarget = flowtree.nextLevelPoints ?? flowtreeStats.growthPoints
  const completedHabits = dailyProgress.completed
  const openHabits = dailyProgress.open
  const topFocus = habits
    .filter((habit) => !habit.done && habit.progress < 100)
    .sort((firstHabit, secondHabit) => secondHabit.progress - firstHabit.progress)
    .slice(0, 3)
  const firstName = profileName.trim() || 'Gast'
  const visibleGoals = formatProfileList(accountProfile.goals)
  const visibleDailyRoutine = formatProfileList(accountProfile.dailyRoutine)
  const todayNote = String(calendarNotes[getLocalDateKey()] || '').trim()
  const hasProfileDetails = visibleGoals.length > 0 || visibleDailyRoutine.length > 0
  const todayThought = getDailyThought()
  const loadCheckIns = useCallback(async () => {
    setCheckInsLoading(true)

    try {
      const data = await getUserCheckIns()
      setCheckIns(data)
    } catch (error) {
      console.error('Flowtree-Check-ins konnten auf der Startseite nicht geladen werden:', error)
      setCheckIns([])
    } finally {
      setCheckInsLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    Promise.resolve().then(async () => {
      if (cancelled) return
      await loadCheckIns()
    })

    return () => {
      cancelled = true
    }
  }, [loadCheckIns])

  useEffect(() => {
    window.addEventListener('focus', loadCheckIns)
    return () => window.removeEventListener('focus', loadCheckIns)
  }, [loadCheckIns])

  return (
    <section className="screen home-screen">
      <div className="page-header">
        <div>
          <p className="eyebrow">{t.dashboard.hello.replace('{name}', firstName)}</p>
          <h1>{personalizedTexts.homeQuestion}</h1>
        </div>
      </div>

      <article className="home-flowtree-card" aria-label={`${growthPresentation.productName}-Statistik`}>
        <div className="home-flowtree-copy">
          <span className="home-flowtree-badge">✦ Dein {growthPresentation.productName}</span>
          <h2>{growthPresentation.name}</h2>
          <p className="home-flowtree-level">✦ Stufe {currentLevel.level} von {flowtreeLevels.length}</p>
          <div className="home-flowtree-message">
            <strong>Du bist auf einem großartigen Weg!</strong>
            <small>✦</small>
          </div>
        </div>

        <div className="home-flowtree-visual">
          <img className="home-flowtree-stage-symbol" src={currentLevel.image} alt={growthPresentation.name} />
          <img className="home-flowtree-mascot-image" src={mascotImage} alt={`MyFlow Maskottchen neben dem ${growthPresentation.productName}`} />
        </div>

        <div className="home-flowtree-progress">
          <div>
            <span>Wachstumspunkte</span>
            <strong>
              {flowtreeStats.growthPoints} / {nextLevelTarget}
            </strong>
          </div>
          <div className="home-flowtree-track" aria-label={`${flowtree.progressPercent}% bis zur nächsten Flowtree-Stufe`}>
            <span style={{ width: `${flowtree.progressPercent}%` }} />
            <b style={{ left: `${flowtree.progressPercent}%` }}>{flowtree.progressPercent}%</b>
          </div>
          <small className="home-flowtree-status">
            {checkInsLoading
              ? 'Flowtree wird aktualisiert …'
              : flowtree.nextLevel
                ? `Noch ${flowtree.pointsToNextLevel} Punkte bis zur nächsten Stufe (${flowtree.nextLevel.name}).`
                : 'Maximale Stufe erreicht.'}
          </small>
        </div>
      </article>

      <section className="home-goals-card">
        <div className="home-goals-header">
          <div>
            <span>Mein Alltag</span>
            <h2>{todayNote ? 'Notiz für heute' : hasProfileDetails ? 'Ziele und Tagesablauf' : 'Noch nichts eingetragen'}</h2>
          </div>
          <button type="button" onClick={() => onNavigate?.('calendar')}>
            Bearbeiten
          </button>
        </div>
        {todayNote && <p className="home-day-note">{todayNote}</p>}
        {hasProfileDetails ? (
          <div className="home-profile-summary">
            <div>
              <small>Meine Ziele</small>
              {visibleGoals.length > 0 ? (
                <div className="home-goals-list">
                  {visibleGoals.map((goal) => (
                    <strong key={goal}>{goal}</strong>
                  ))}
                </div>
              ) : (
                <p>Noch kein Ziel eingetragen.</p>
              )}
            </div>
            <div>
              <small>Mein Tagesablauf</small>
              {visibleDailyRoutine.length > 0 ? (
                <div className="home-goals-list">
                  {visibleDailyRoutine.map((routineItem) => (
                    <strong key={routineItem}>{routineItem}</strong>
                  ))}
                </div>
              ) : (
                <p>Noch kein Tagesablauf eingetragen.</p>
              )}
            </div>
          </div>
        ) : !todayNote ? (
          <p>Trage Ziele und Tagesablauf ein, damit MyFlow passende Routinen und Erinnerungen anzeigen kann.</p>
        ) : null}
      </section>

      <div className="home-status-grid">
        <article className="status-card-done">
          <span>{t.dashboard.done}</span>
          <strong>{completedHabits}</strong>
          <p>{t.dashboard.doneText}</p>
        </article>
        <article className="status-card-open">
          <span>{t.dashboard.open}</span>
          <strong>{openHabits}</strong>
          <p>{t.dashboard.openText}</p>
        </article>
      </div>

      <section className="daily-focus-card">
        <div className="daily-focus-header">
          <span>{t.dashboard.focus}</span>
          <small>{t.dashboard.topFocus}</small>
        </div>
        {topFocus.length > 0 ? (
          <div className="daily-focus-list">
            {topFocus.map((habit) => (
              <div key={habit.id}>
                <div>
                  <strong>{habit.displayTitle}</strong>
                  <small>{habit.displayDetail}</small>
                </div>
                <span>{habit.progress}%</span>
                <div className="focus-progress-track" aria-hidden="true">
                  <span style={{ width: `${habit.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>{t.dashboard.allDone}</p>
        )}
      </section>

      <article className="home-motivation-card">
        <span>{t.dashboard.thought}</span>
        <p>{todayThought}</p>
      </article>
    </section>
  )
}

export default DashboardHome
