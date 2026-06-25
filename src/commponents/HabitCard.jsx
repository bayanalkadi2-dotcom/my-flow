import { useState } from 'react'
import waterGlassEmpty from '../assets/water-glass-empty.svg'
import waterGlassFull from '../assets/water-glass-full.svg'

const routineVisuals = {
  'Wasser trinken': {
    kind: 'water',
    label: 'Ein Glas getrunken',
  },
  'Rauchen reduzieren': {
    kind: 'smoking',
    label: 'Eine Zigarette vermieden',
  },
}

function HabitCard({ habit, onIncrement, onDecrement, onSetMood, onUpdatePeriod, onRemove, onToggleDone, t }) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const isMoodRoutine = habit.type === 'mood'
  const isPeriodRoutine = habit.type === 'period'
  const hasDetails = isMoodRoutine || isPeriodRoutine
  const routineVisual = routineVisuals[habit.title]

  return (
    <article className={`habit-card ${habit.done ? 'habit-card-done' : ''}`}>
      {onRemove && (
        <button
          className="habit-remove-button"
          onClick={() => onRemove(habit)}
          type="button"
          aria-label={`${habit.displayTitle ?? habit.title} entfernen`}
        >
          ×
        </button>
      )}
      <div className="habit-main">
        <h2 className="habit-title">{habit.displayTitle ?? habit.title}</h2>
        <p>{habit.displayDetail ?? habit.detail}</p>

        {hasDetails ? (
          <>
            <button
              className="habit-button detail-toggle"
              onClick={() => setDetailsOpen((open) => !open)}
              type="button"
            >
              {detailsOpen ? t.habitCard.closeDetails : isMoodRoutine ? t.habitCard.mood : t.habitCard.period}
            </button>

            {detailsOpen && isMoodRoutine && (
              <div className="mood-tracker">
                <p>{t.habitCard.moodQuestion}</p>
                <div className="mood-options">
                  {t.habitCard.moods.map((mood) => (
                    <button
                      className={`mood-option ${habit.mood === mood ? 'selected' : ''}`}
                      key={mood}
                      onClick={() => onSetMood(habit.id, mood)}
                      type="button"
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {detailsOpen && isPeriodRoutine && (
              <div className="period-tracker">
                <label>
                  {t.habitCard.cycleLength}
                  <input
                    min="1"
                    onChange={(event) => onUpdatePeriod(habit.id, { cycleLength: event.target.value })}
                    placeholder="z. B. 28"
                    type="number"
                    value={habit.period?.cycleLength ?? ''}
                  />
                </label>
                <PeriodScale
                  label={t.habitCard.flowStrength}
                  labels={t.habitCard.scale}
                  value={habit.period?.flowStrength ?? 3}
                  onChange={(value) => onUpdatePeriod(habit.id, { flowStrength: value })}
                />
                <PeriodScale
                  label={t.habitCard.pain}
                  labels={t.habitCard.scale}
                  value={habit.period?.painLevel ?? 1}
                  onChange={(value) => onUpdatePeriod(habit.id, { painLevel: value })}
                />
                <div>
                  <p>{t.habitCard.wellbeing}</p>
                  <div className="mood-options">
                    {t.habitCard.moods.map((wellbeing) => (
                      <button
                        className={`mood-option ${habit.period?.phaseWellbeing === wellbeing ? 'selected' : ''}`}
                        key={wellbeing}
                        onClick={() => onUpdatePeriod(habit.id, { phaseWellbeing: wellbeing })}
                        type="button"
                      >
                        {wellbeing}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="habit-actions">
            <button
              className="habit-button habit-count-button"
              onClick={() => onDecrement(habit.id)}
              disabled={habit.current <= 0}
              aria-label={`${habit.displayTitle ?? habit.title} um 1 reduzieren`}
            >
              −
            </button>
            <button
              className="habit-button habit-count-button habit-plus-button"
              onClick={() => onIncrement(habit.id)}
              disabled={habit.done}
              aria-label={habit.incrementLabel}
            >
              +
            </button>
            <button
              className="habit-button habit-count-button habit-done-button"
              onClick={() => onToggleDone(habit)}
              aria-label={habit.done ? `${habit.displayTitle ?? habit.title} nicht erledigt markieren` : `${habit.displayTitle ?? habit.title} erledigt markieren`}
            >
              ✓
            </button>
          </div>
        )}
      </div>

      <div className="habit-side">
        <div className="progress-ring" aria-label={`${habit.progress}% Fortschritt`}>
          <svg viewBox="0 0 52 52" aria-hidden="true">
            <circle className="progress-ring-track" cx="26" cy="26" r="22" />
            <circle
              className="progress-ring-value"
              cx="26"
              cy="26"
              r="22"
              pathLength="100"
              strokeDasharray={`${habit.progress} 100`}
            />
          </svg>
          <span>{habit.progress}%</span>
        </div>
      </div>

      {routineVisual && !hasDetails && (
        <RoutineVisualAction
          habit={habit}
          visual={routineVisual}
          onActivate={() => onIncrement(habit.id)}
        />
      )}
    </article>
  )
}

function RoutineVisualAction({ habit, visual, onActivate }) {
  const isComplete = habit.done || Number(habit.progress ?? 0) >= 100
  const current = Math.max(0, Math.min(Number(habit.current ?? 0), Number(habit.target ?? 1)))
  const target = Math.max(1, Math.min(Number(habit.target ?? 1), 12))

  return (
    <button
      className={`routine-visual-action ${visual.kind} ${current > 0 ? 'is-active' : ''}`}
      disabled={isComplete}
      onClick={onActivate}
      type="button"
      aria-label={habit.incrementLabel ?? visual.label}
    >
      <span className="routine-visual-grid" aria-hidden="true">
        {Array.from({ length: target }).map((_, index) => {
          const itemActive = index < current

          return (
            <span className={`routine-visual-stage ${itemActive ? 'is-filled' : ''}`} key={`${visual.kind}-${index}`}>
              {visual.kind === 'water' ? (
                <img
                  className="routine-visual-img"
                  src={itemActive ? waterGlassFull : waterGlassEmpty}
                  alt=""
                />
              ) : (
                <span className="cigarette-symbol">
                  <span className="cigarette-body" />
                  <span className="cigarette-filter" />
                  <span className="cigarette-smoke" />
                </span>
              )}
            </span>
          )
        })}
      </span>
    </button>
  )
}

function PeriodScale({ label, labels, value, onChange }) {
  const currentValue = Number(value)

  return (
    <div className="period-scale">
      <div className="period-scale-header">
        <p>{label}</p>
        <span>{labels[currentValue - 1]}</span>
      </div>
      <div className="period-bars" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((bar) => (
          <span
            className={bar <= currentValue ? 'active' : ''}
            key={bar}
            style={{ height: `${10 + bar * 5}px` }}
          />
        ))}
      </div>
      <input
        aria-label={label}
        className="period-slider"
        max="5"
        min="1"
        onChange={(event) => onChange(Number(event.target.value))}
        type="range"
        value={currentValue}
      />
    </div>
  )
}

export default HabitCard
