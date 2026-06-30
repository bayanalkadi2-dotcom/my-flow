import { useProfile } from '../context/profileContextValue'

function formatGoals(goals) {
  return String(goals || '')
    .split(/[\n,;]/)
    .map((goal) => goal.trim())
    .filter(Boolean)
    .slice(0, 4)
}

function DashboardHome({ accountProfile = {}, habits, profileName, t, onNavigate }) {
  const { personalizedTexts } = useProfile()
  const completedHabits = habits.filter((habit) => habit.done || habit.progress >= 100).length
  const totalProgress = habits.reduce((sum, habit) => sum + habit.progress, 0)
  const dayProgress = habits.length ? Math.round(totalProgress / habits.length) : 0
  const openHabits = habits.length - completedHabits
  const topFocus = habits
    .filter((habit) => !habit.done && habit.progress < 100)
    .sort((firstHabit, secondHabit) => secondHabit.progress - firstHabit.progress)
    .slice(0, 3)
  const firstName = profileName.trim() || 'Gast'
  const visibleGoals = formatGoals(accountProfile.goals)

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
            <span>Meine Ziele</span>
            <h2>{visibleGoals.length > 0 ? 'Das steht heute im Fokus' : 'Noch kein Ziel eingetragen'}</h2>
          </div>
          <button type="button" onClick={() => onNavigate?.('profileSettings')}>
            Bearbeiten
          </button>
        </div>
        {visibleGoals.length > 0 ? (
          <div className="home-goals-list">
            {visibleGoals.map((goal) => (
              <strong key={goal}>{goal}</strong>
            ))}
          </div>
        ) : (
          <p>Trage deine Ziele ein, damit MyFlow passende Routinen und Erinnerungen anzeigen kann.</p>
        )}
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
