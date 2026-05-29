import HabitCard from '../commponents/HabitCard'

function DashboardHome({ habits, tone, onIncrement, onDecrement, onSetMood, onUpdatePeriod, onToggleDone }) {
  const completedHabits = habits.filter((habit) => habit.done || habit.progress >= 100).length
  const totalProgress = habits.reduce((sum, habit) => sum + habit.progress, 0)
  const dayProgress = habits.length ? Math.round(totalProgress / habits.length) : 0
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
        <strong>{dayProgress}%</strong>
        <p>{tone.progressMessage}</p>
      </article>

      <div className="habit-list">
        {habits.map((habit) => (
          <HabitCard
            habit={habit}
            key={habit.id}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            onSetMood={onSetMood}
            onUpdatePeriod={onUpdatePeriod}
            onToggleDone={onToggleDone}
          />
        ))}
      </div>
    </section>
  )
}

export default DashboardHome
