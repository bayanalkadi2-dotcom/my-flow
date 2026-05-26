function HabitCard({ habit }) {
  return (
    <article className="habit-card">
      <div>
        <h2>{habit.title}</h2>
        <p>{habit.detail}</p>
      </div>
      <div className="habit-side">
        <span className="pill">{habit.status}</span>
        <div className="progress">
          <span style={{ width: `${habit.progress}%` }} />
        </div>
      </div>
    </article>
  )
}

export default HabitCard
