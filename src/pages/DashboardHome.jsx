import HabitCard from '../commponents/HabitCard'

function DashboardHome({ habits, tone }) {
  const completedHabits = habits.filter((habit) => habit.progress >= 90).length
  const averageProgress = Math.round(
    habits.reduce((total, habit) => total + habit.progress, 0) / habits.length,
  )
  const dashboardMessage = tone.dashboardMessage
    .replace('{count}', completedHabits)
    .replace('{total}', habits.length)

  return (
    <section className="screen dashboard-screen">
      <div className="page-header dashboard-header">
        <div>
          <p className="eyebrow">{tone.greeting}</p>
          <h1>{tone.dashboardTitle}</h1>
          <p className="lead">{dashboardMessage}</p>
        </div>
        <div className="dashboard-date">
          <span>Heute</span>
          <strong>{new Date().toLocaleDateString('de-DE', { weekday: 'short' })}</strong>
        </div>
      </div>

      <section className="dashboard-hero-card">
        <div className="progress-ring" style={{ '--progress': `${averageProgress * 3.6}deg` }}>
          <div>
            <strong>{averageProgress}%</strong>
            <span>erreicht</span>
          </div>
        </div>
        <div className="dashboard-hero-copy">
          <span>Tagesfortschritt</span>
          <h2>{completedHabits} von {habits.length} Routinen fast geschafft</h2>
          <p>{tone.progressMessage}</p>
        </div>
      </section>

      <section className="dashboard-metrics">
        <article>
          <span>Aktiv</span>
          <strong>{habits.filter((habit) => habit.progress > 0 && habit.progress < 90).length}</strong>
        </article>
        <article>
          <span>Erledigt</span>
          <strong>{completedHabits}</strong>
        </article>
        <article>
          <span>Offen</span>
          <strong>{habits.filter((habit) => habit.progress === 0).length}</strong>
        </article>
      </section>

      <div className="section-title-row">
        <h2>Heutige Routinen</h2>
        <span>{habits.length} Ziele</span>
      </div>
      <div className="habit-list">
        {habits.map((habit) => (
          <HabitCard habit={habit} key={habit.title} />
        ))}
      </div>
    </section>
  )
}

export default DashboardHome
