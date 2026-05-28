function HabitCard({ habit, onIncrement, onDecrement, onToggleDone }) {
  return (
    <article className={`habit-card ${habit.done ? 'habit-card-done' : ''}`}>
      <div className="habit-main">
        <h2>{habit.title}</h2>
        <p>{habit.detail}</p>
        <div className="habit-actions">
          <button
            className="habit-button habit-count-button"
            onClick={() => onDecrement(habit.id)}
            disabled={habit.current <= 0}
            aria-label={`${habit.title} um 1 reduzieren`}
          >
            −
          </button>
          <button
            className="habit-button habit-step-button"
            onClick={() => onIncrement(habit.id)}
            disabled={habit.done}
          >
            + {habit.incrementLabel}
          </button>
          <button
            className="habit-button"
            onClick={() => onToggleDone(habit)}
          >
            <span className="habit-check" aria-hidden="true">
              {habit.done ? '✓' : ''}
            </span>
            <span>{habit.done ? 'Erledigt' : 'Abhaken'}</span>
          </button>
        </div>
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
