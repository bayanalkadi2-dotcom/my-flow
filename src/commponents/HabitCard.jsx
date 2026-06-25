import { useState } from 'react'

const moodOptions = [
  { value: 'happy', label: 'Glücklich', icon: '😊' },
  { value: 'motivated', label: 'Motiviert', icon: '🤩' },
  { value: 'exhausted', label: 'Erschöpft', icon: '😮‍💨' },
  { value: 'tired', label: 'Müde', icon: '😴' },
  { value: 'sad', label: 'Traurig', icon: '😢' },
  { value: 'angry', label: 'Sauer', icon: '😠' },
  { value: 'sick', label: 'Krank', icon: '🤒' },
  { value: 'unmotivated', label: 'Unmotiviert', icon: '🌧️' },
  { value: 'stressed', label: 'Gestresst', icon: '😣' },
  { value: 'balanced', label: 'Ausgeglichen', icon: '😌' },
]

const iconTypes = [
  { match: ['Dankbarkeit'], type: 'heart' },
  { match: ['Vitamine', 'Medikament', 'Supplement', 'Magnesium'], type: 'pill' },
  { match: ['Tagesplanung'], type: 'checklist' },
  { match: ['Bewegung', 'Sport', 'Laufen'], type: 'movement' },
  { match: ['Wasser'], type: 'drop' },
]

function getProgress(habit) {
  if (habit.done) return 100
  return Math.min(Math.max(Math.round(Number(habit.progress) || 0), 0), 100)
}

function getStatus(habit) {
  const progress = getProgress(habit)
  if (habit.done || progress >= 100) return 'done'
  if (progress > 0) return 'partial'
  return 'skipped'
}

function getIconType(title) {
  return iconTypes.find((entry) => entry.match.some((word) => title.includes(word)))?.type ?? 'checklist'
}

function getMoodOption(value) {
  return moodOptions.find((option) => option.value === value || option.label === value)
}

function getRoutineIcon(title) {
  const type = getIconType(title)

  if (type === 'heart') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 20s-7-4.3-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.7-7 10-7 10Z" />
      </svg>
    )
  }

  if (type === 'pill') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8.2 15.8a4.2 4.2 0 0 1 0-5.9l3.7-3.7a4.2 4.2 0 0 1 5.9 5.9l-3.7 3.7a4.2 4.2 0 0 1-5.9 0Z" />
        <path d="m10.1 8.1 5.8 5.8" />
      </svg>
    )
  }

  if (type === 'movement') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 17.5h10.8c2 0 3.7-1.3 4.2-3.2l.2-.8H15l-2.7-4.2H8.7l1.9 4.2H5a2 2 0 0 0 0 4Z" />
        <path d="M4 20h15" />
      </svg>
    )
  }

  if (type === 'drop') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21a7 7 0 0 0 7-7c0-4.6-7-11-7-11s-7 6.4-7 11a7 7 0 0 0 7 7Z" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5h10v15H6V5h2Z" />
      <path d="M9 5a3 3 0 0 1 6 0" />
      <path d="m9 13 2 2 4-5" />
    </svg>
  )
}

function getStatusText(status, progress, remaining, unit) {
  if (status === 'done') return 'Heute erledigt'
  if (remaining > 0 && unit) return `Noch ${remaining.toLocaleString('de-DE')} ${unit} bis zum Ziel`
  if (progress >= 50) return 'Halbzeit geschafft'
  return 'Noch offen'
}

function getProgressText(habit) {
  const current = Number(habit.current ?? 0)
  const target = Number(habit.target ?? 0)
  const unit = habit.unit || ''

  if (target <= 1) {
    return `${current.toLocaleString('de-DE')} ${unit || 'erledigt'}`.trim()
  }

  return `${current.toLocaleString('de-DE')} von ${target.toLocaleString('de-DE')} ${unit}`.trim()
}

function HabitCard({ habit, onIncrement, onDecrement, onSetMood, onUpdatePeriod, onRemove, onToggleDone, t }) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedMood, setSelectedMood] = useState(() => getMoodOption(habit.mood)?.value ?? '')
  const [moodSaved, setMoodSaved] = useState(false)
  const isMoodRoutine = habit.type === 'mood'
  const isPeriodRoutine = habit.type === 'period'
  const title = habit.displayTitle ?? habit.title
  const progress = getProgress(habit)
  const status = getStatus(habit)
  const current = Math.max(Number(habit.current ?? 0), 0)
  const target = Math.max(Number(habit.target ?? 1), 1)
  const remaining = Math.max(target - current, 0)
  const savedMood = getMoodOption(habit.mood)

  function markSkipped() {
    if (habit.done) {
      onToggleDone(habit)
    }

    Array.from({ length: Math.ceil(current) }).forEach(() => onDecrement(habit.id))
  }

  function markPartial() {
    if (progress < 100 && !habit.done) {
      onIncrement(habit.id)
    }
  }

  function markDone() {
    if (!habit.done || progress < 100) {
      onToggleDone(habit)
    }
  }

  function saveMood() {
    if (!selectedMood) return
    onSetMood(habit.id, selectedMood)
    setMoodSaved(true)
  }

  return (
    <article className={`habit-card routine-card routine-card-${status}`}>
      {onRemove && (
        <button
          className="habit-remove-button"
          onClick={() => onRemove(habit)}
          type="button"
          aria-label={`${title} entfernen`}
        >
          ×
        </button>
      )}

      <div className="routine-card-main">
        <div className="routine-icon" aria-hidden="true">
          {getRoutineIcon(habit.title)}
        </div>

        <div className="routine-content">
          <div className="routine-card-top">
            <div>
              <h2 className="habit-title">{title}</h2>
              {isMoodRoutine ? (
                <>
                  <p className="routine-progress-copy">Wie fühlst du dich heute?</p>
                  <p className="routine-status-copy">
                    {savedMood
                      ? `Aktuell ausgewählt: ${savedMood.label}`
                      : 'Heute noch keine Stimmung ausgewählt'}
                  </p>
                </>
              ) : (
                <>
                  <p className="routine-progress-copy">{getProgressText(habit)}</p>
                  <p className="routine-status-copy">{getStatusText(status, progress, remaining, habit.unit)}</p>
                </>
              )}
            </div>

            <div className={`progress-ring routine-progress-ring progress-${status}`} aria-label={`${progress}% Fortschritt`}>
              <svg viewBox="0 0 52 52" aria-hidden="true">
                <circle className="progress-ring-track" cx="26" cy="26" r="22" />
                <circle
                  className="progress-ring-value"
                  cx="26"
                  cy="26"
                  r="22"
                  pathLength="100"
                  strokeDasharray={`${progress} 100`}
                />
              </svg>
              <span>{progress}%</span>
            </div>
          </div>

          {isMoodRoutine ? (
            <MoodRoutineSelector
              moodSaved={moodSaved}
              onSave={saveMood}
              onSelect={(value) => {
                setSelectedMood(value)
                setMoodSaved(false)
              }}
              selectedMood={selectedMood}
            />
          ) : (
            <>
              <div className="routine-status-control" aria-label={`${title} Status auswählen`}>
                <button
                  className={`routine-status-option skipped ${status === 'skipped' ? 'selected' : ''}`}
                  onClick={markSkipped}
                  type="button"
                >
                  <span aria-hidden="true">⊘</span>
                  Ausgelassen
                </button>
                <button
                  className={`routine-status-option partial ${status === 'partial' ? 'selected' : ''}`}
                  onClick={markPartial}
                  type="button"
                >
                  <span aria-hidden="true">◐</span>
                  Teilweise
                </button>
                <button
                  className={`routine-status-option done ${status === 'done' ? 'selected' : ''}`}
                  onClick={markDone}
                  type="button"
                >
                  <span aria-hidden="true">✓</span>
                  Erledigt
                </button>
              </div>

              {isPeriodRoutine && (
                <>
                  <button
                    className="habit-button detail-toggle"
                    onClick={() => setDetailsOpen((open) => !open)}
                    type="button"
                  >
                    {detailsOpen ? t.habitCard.closeDetails : t.habitCard.period}
                  </button>

                  {detailsOpen && (
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
              )}
            </>
          )}
        </div>
      </div>
    </article>
  )
}

function MoodRoutineSelector({ moodSaved, onSave, onSelect, selectedMood }) {
  const selectedOption = getMoodOption(selectedMood)

  return (
    <div className="mood-routine-panel">
      <div className="mood-choice-grid" aria-label="Stimmung auswählen">
        {moodOptions.map((mood) => {
          const isSelected = selectedMood === mood.value

          return (
            <button
              aria-label={`Stimmung ${mood.label} auswählen`}
              aria-pressed={isSelected}
              className={`mood-choice ${isSelected ? 'selected' : ''}`}
              key={mood.value}
              onClick={() => onSelect(mood.value)}
              type="button"
            >
              <span aria-hidden="true">{mood.icon}</span>
              <strong>{mood.label}</strong>
              {isSelected && <small aria-hidden="true">✓</small>}
            </button>
          )
        })}
      </div>

      <button
        className="mood-save-button"
        disabled={!selectedOption}
        onClick={onSave}
        type="button"
      >
        Stimmung eintragen
      </button>

      {moodSaved && (
        <p className="mood-save-feedback">Stimmung gespeichert.</p>
      )}
    </div>
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
