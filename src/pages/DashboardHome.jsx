import { useProfile } from '../context/profileContextValue'
import { calculateDailyRoutineProgress } from '../utils/dailyRoutineProgress'
import { getLocalDateKey } from '../utils/checkins'

function formatProfileList(value) {
  return String(value || '')
    .split(/[\n,;]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4)
}

function DashboardHome({ accountProfile = {}, calendarNotes = {}, habits, profileName, t, onNavigate }) {
  const { personalizedTexts } = useProfile()
  const dailyProgress = calculateDailyRoutineProgress(habits)
  const completedHabits = dailyProgress.completed
  const dayProgress = dailyProgress.percent
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

  return (
    <section className="screen home-screen">
      <div className="page-header">
        <div>
          <p className="eyebrow">{t.dashboard.hello.replace('{name}', firstName)}</p>
          <h1>{personalizedTexts.homeQuestion}</h1>
        </div>
      </div>

      <article className="day-overview-card">
        <div>
          <span>{personalizedTexts.contextLabel}</span>
          <h2>{dayProgress >= 70 ? t.dashboard.goodFlow : t.dashboard.moreRoom}</h2>
          <p>{personalizedTexts.dashboardSubtitle}</p>
          <div className="day-progress-track" aria-label={`${dayProgress}% Tagesfortschritt`}>
            <span style={{ width: `${dayProgress}%` }} />
          </div>
        </div>
        <strong>
          <span>{dayProgress}%</span>
        </strong>
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

      <section className="day-plan-card">
        <span>{t.dashboard.dayPlan}</span>
        <div>
          <strong>{t.dashboard.morning}</strong>
          <p>{t.dashboard.morningText}</p>
        </div>
        <div>
          <strong>{t.dashboard.noon}</strong>
          <p>{t.dashboard.noonText}</p>
        </div>
        <div>
          <strong>{t.dashboard.evening}</strong>
          <p>{t.dashboard.eveningText}</p>
        </div>
      </section>

      <article className="home-motivation-card">
        <span>{t.dashboard.thought}</span>
        <p>{t.dashboard.thoughtText}</p>
      </article>
    </section>
  )
}

export default DashboardHome
