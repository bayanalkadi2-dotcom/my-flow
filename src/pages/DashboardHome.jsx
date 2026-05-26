import HabitCard from '../commponents/HabitCard'

function DashboardHome({ habits, tone }) {
  const completedHabits = habits.filter((habit) => habit.progress >= 90).length
  const dashboardMessage = tone.dashboardMessage
    .replace('{count}', completedHabits)
    .replace('{total}', habits.length)

  return (
    <section className="screen">
      <div className="page-header">
        <div>
          <p className="eyebrow">{tone.greeting}</p>
          <h1>{tone.dashboardTitle}</h1>
          <p className="lead">{dashboardMessage}</p>
        </div>
      </div>

      <article className="stat-card big-stat">
        <span>Tagesfortschritt</span>
        <strong>75%</strong>
        <p>{tone.progressMessage}</p>
      </article>

      <div className="habit-list">
        {habits.map((habit) => (
          <HabitCard habit={habit} key={habit.title} />
        ))}
      </div>
    </section>
  )
}

export default DashboardHome
