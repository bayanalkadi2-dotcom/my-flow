import { useState } from 'react'
import waterGlassEmpty from '../assets/water-glass-empty.svg'
import waterGlassFull from '../assets/water-glass-full.svg'
import { calculateCompletedItemsProgress, getRoutineProgress } from '../utils/routineProgress'
import { getLocalDateKey } from '../utils/checkins'

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

function getStatus(habit) {
  const progress = getRoutineProgress(habit)
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

function getEntryKind(title) {
  const normalized = String(title || '').toLowerCase()
  if (normalized === 'lernblock' || normalized === 'lernen') return 'learning'
  if (normalized === 'wochenplanung') return 'weekly'
  if (normalized.startsWith('mini-aufgaben')) return 'miniTasks'
  if (normalized === 'dankbarkeit') return 'gratitude'
  if (normalized.includes('medikament') || normalized.includes('vitamin')) return 'medication'
  return null
}

function HabitCard({ habit, onIncrement, onResetProgress, onSaveDailyEntry, onSetMood, onSetPartial, onUpdatePeriod, onRemove, onToggleDone, t }) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const dateKey = getLocalDateKey()
  const dailyEntry = habit.period?.dailyEntries?.[dateKey] ?? {}
  const [selectedMoods, setSelectedMoods] = useState(() => {
    if (Array.isArray(dailyEntry.moods)) return dailyEntry.moods
    return String(habit.mood || '').split(',').filter(Boolean)
  })
  const [moodSaved, setMoodSaved] = useState(false)
  const isMoodRoutine = habit.type === 'mood'
  const isPeriodRoutine = habit.type === 'period'
  const routineVisual = routineVisuals[habit.title]
  const entryKind = getEntryKind(habit.title)
  const title = habit.displayTitle ?? habit.title
  const progress = getRoutineProgress(habit)
  const status = getStatus(habit)
  const current = Math.max(Number(habit.current ?? 0), 0)
  const target = Math.max(Number(habit.target ?? 1), 1)
  const remaining = Math.max(target - current, 0)
  const savedMoodLabels = selectedMoods.map((mood) => getMoodOption(mood)?.label).filter(Boolean)

  function markSkipped() {
    onResetProgress(habit)
  }

  function markPartial() {
    if (entryKind === 'miniTasks') return
    if (progress >= 100 || habit.done) return
    if (target <= 1) onSetPartial(habit)
    else onIncrement(habit.id)
  }

  function markDone() {
    if (entryKind === 'miniTasks') return
    if (!habit.done || progress < 100) {
      onToggleDone(habit)
    }
  }

  function saveMood() {
    if (selectedMoods.length === 0) return
    onSetMood(habit.id, selectedMoods)
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
                    {savedMoodLabels.length > 0
                      ? `Aktuell ausgewählt: ${savedMoodLabels.join(', ')}`
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
                setSelectedMoods((current) => (
                  current.includes(value)
                    ? current.filter((mood) => mood !== value)
                    : [...current, value]
                ))
                setMoodSaved(false)
              }}
              selectedMoods={selectedMoods}
            />
          ) : (
            <>
              {entryKind !== 'miniTasks' && <div className="routine-status-control" aria-label={`${title} Status auswählen`}>
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
              </div>}

              {routineVisual && !isPeriodRoutine && (
                <RoutineVisualAction
                  habit={habit}
                  visual={routineVisual}
                  onActivate={() => onIncrement(habit.id)}
                />
              )}

              {entryKind && onSaveDailyEntry && (
                <RoutineDailyEditor
                  dateKey={dateKey}
                  entry={dailyEntry}
                  habit={habit}
                  kind={entryKind}
                  onSave={onSaveDailyEntry}
                />
              )}

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

const entryEditorCopy = {
  learning: {
    question: 'Was möchtest du lernen?',
    placeholder: 'Kapitel, Karteikarten oder Übungsaufgaben',
  },
  weekly: {
    question: 'Wie sieht deine Wochenplanung aus?',
    placeholder: 'Was möchtest du diese Woche erledigen?',
  },
  gratitude: {
    question: 'Wofür bist du heute dankbar?',
    placeholder: 'Schreibe deine Gedanken hier auf.',
  },
  medication: {
    question: 'Was hast du eingenommen?',
    placeholder: 'Vitamin, Medikament oder mehrere Einträge',
  },
}

function RoutineDailyEditor({ dateKey, entry, habit, kind, onSave }) {
  const [text, setText] = useState(entry.text ?? '')
  const [dosage, setDosage] = useState(entry.dosage ?? '')
  const [newTask, setNewTask] = useState('')
  const [saved, setSaved] = useState(false)
  const tasks = Array.isArray(entry.miniTasks) ? entry.miniTasks : []

  function saveTextEntry() {
    onSave(habit.id, dateKey, { ...entry, text: text.trim(), dosage: dosage.trim() })
    setSaved(true)
  }

  function saveTasks(nextTasks) {
    onSave(
      habit.id,
      dateKey,
      { ...entry, miniTasks: nextTasks },
      calculateCompletedItemsProgress(nextTasks),
    )
  }

  function addTask() {
    const value = newTask.trim()
    if (!value) return
    const task = {
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${tasks.length}`,
      text: value,
      done: false,
    }
    saveTasks([...tasks, task])
    setNewTask('')
  }

  if (kind === 'miniTasks') {
    return (
      <div className="routine-entry-panel">
        <strong>Welche Mini-Aufgabe möchtest du erledigen?</strong>
        {tasks.length > 0 && (
          <div className="routine-mini-task-list">
            {tasks.map((task) => (
              <button
                aria-pressed={task.done}
                className={task.done ? 'is-done' : ''}
                key={task.id}
                onClick={() => saveTasks(tasks.map((item) => (
                  item.id === task.id ? { ...item, done: !item.done } : item
                )))}
                type="button"
              >
                <span aria-hidden="true">{task.done ? '✓' : '○'}</span>
                {task.text}
              </button>
            ))}
          </div>
        )}
        <div className="routine-entry-add-row">
          <input
            onChange={(event) => setNewTask(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                addTask()
              }
            }}
            placeholder="Eigene Mini-Aufgabe"
            type="text"
            value={newTask}
          />
          <button disabled={!newTask.trim()} onClick={addTask} type="button">Hinzufügen</button>
        </div>
      </div>
    )
  }

  const copy = entryEditorCopy[kind]
  if (!copy) return null

  return (
    <div className="routine-entry-panel">
      <label>
        <strong>{copy.question}</strong>
        <textarea
          onChange={(event) => {
            setText(event.target.value)
            setSaved(false)
          }}
          placeholder={copy.placeholder}
          rows={kind === 'weekly' ? 5 : 4}
          value={text}
        />
      </label>
      {kind === 'medication' && (
        <label>
          <span>Menge oder Dosierung (optional)</span>
          <input
            onChange={(event) => {
              setDosage(event.target.value)
              setSaved(false)
            }}
            placeholder="Freiwillige Angabe"
            type="text"
            value={dosage}
          />
        </label>
      )}
      <button className="routine-entry-save" onClick={saveTextEntry} type="button">Eintrag speichern</button>
      {saved && <small className="routine-entry-feedback">Gespeichert.</small>}
    </div>
  )
}

function MoodRoutineSelector({ moodSaved, onSave, onSelect, selectedMoods }) {
  return (
    <div className="mood-routine-panel">
      <div className="mood-choice-grid" aria-label="Stimmung auswählen">
        {moodOptions.map((mood) => {
          const isSelected = selectedMoods.includes(mood.value)

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
        disabled={selectedMoods.length === 0}
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
