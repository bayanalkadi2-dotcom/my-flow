import { useState } from 'react'
import HabitCard from '../commponents/HabitCard'

const routineCategories = [
  {
    title: 'Mentale Gesundheit',
    routines: [
      { title: 'Meditation', target: 10, unit: 'Minuten', incrementLabel: '1 Minute meditiert' },
      { title: 'Dankbarkeit', target: 3, unit: 'Dinge', incrementLabel: '1 Sache notiert' },
      { title: 'Tagebuch', target: 1, unit: 'Eintrag', incrementLabel: 'Eintrag geschrieben' },
      { title: 'Stimmung tracken', target: 1, unit: 'Check-in', incrementLabel: 'Stimmung eingetragen', type: 'mood' },
      { title: 'Lesen', target: 20, unit: 'Minuten', incrementLabel: '1 Minute gelesen' },
      { title: 'Digitale Pause', target: 30, unit: 'Minuten', incrementLabel: '1 Minute Pause' },
    ],
  },
  {
    title: 'Koerperliche Gesundheit',
    routines: [
      { title: 'Wasser trinken', target: 8, unit: 'Glaeser', incrementLabel: '1 Glas getrunken' },
      { title: 'Bewegung', target: 30, unit: 'Minuten', incrementLabel: '1 Minute Bewegung' },
      { title: 'Sport', target: 30, unit: 'Minuten', incrementLabel: '1 Minute Sport' },
      { title: 'Schlaf', target: 8, unit: 'Stunden', incrementLabel: '1 Stunde geschlafen' },
      { title: 'Gesund essen', target: 3, unit: 'Mahlzeiten', incrementLabel: '1 gesunde Mahlzeit' },
      { title: 'Periode', target: 1, unit: 'Eintrag', incrementLabel: 'Periode eingetragen', type: 'period' },
    ],
  },
  {
    title: 'Medikamente & Vitamine',
    routines: [
      { title: 'Medikament eingenommen', target: 1, unit: 'Dosis', incrementLabel: 'Dosis eingenommen' },
      { title: 'Vitamine eingenommen', target: 1, unit: 'Portion', incrementLabel: 'Vitamine eingenommen' },
      { title: 'Supplement eingenommen', target: 1, unit: 'Portion', incrementLabel: 'Supplement eingenommen' },
      { title: 'Magnesium/Zink eingenommen', target: 1, unit: 'Portion', incrementLabel: 'Portion eingenommen' },
    ],
  },
  {
    title: 'Produktivitaet',
    routines: [
      { title: 'Tagesplanung', target: 1, unit: 'Plan', incrementLabel: 'Plan erstellt' },
      { title: 'Lernen', target: 60, unit: 'Minuten', incrementLabel: '1 Minute gelernt' },
      { title: 'Fokuszeit', target: 45, unit: 'Minuten', incrementLabel: '1 Minute fokussiert' },
      { title: 'Aufraeumen', target: 15, unit: 'Minuten', incrementLabel: '1 Minute aufgeraeumt' },
    ],
  },
  {
    title: 'Soziales',
    routines: [
      { title: 'Freunde kontaktieren', target: 1, unit: 'Kontakt', incrementLabel: 'Kontakt erledigt' },
      { title: 'Familie kontaktieren', target: 1, unit: 'Kontakt', incrementLabel: 'Kontakt erledigt' },
      { title: 'Soziale Aktivitaet', target: 1, unit: 'Aktivitaet', incrementLabel: 'Aktivitaet gemacht' },
    ],
  },
  {
    title: 'Gewohnheiten reduzieren',
    routines: [
      { title: 'Rauchen reduzieren', target: 5, unit: 'Zigaretten vermieden', incrementLabel: '1 Zigarette vermieden' },
      { title: 'Weniger Social Media', target: 2, unit: 'Stunden vermieden', incrementLabel: '1 Stunde vermieden' },
      { title: 'Weniger Suessigkeiten', target: 3, unit: 'Snacks vermieden', incrementLabel: '1 Snack vermieden' },
    ],
  },
]

function Routinen({ habits, onAddHabit, onIncrement, onDecrement, onSetMood, onUpdatePeriod, onRemove, onToggleDone }) {
  const [title, setTitle] = useState('')
  const [target, setTarget] = useState('8')
  const [unit, setUnit] = useState('Glaeser')
  const [addPanelOpen, setAddPanelOpen] = useState(false)
  const [openCategory, setOpenCategory] = useState('')
  const existingTitles = new Set(habits.map((habit) => habit.title.toLowerCase()))

  function handleSubmit(event) {
    event.preventDefault()

    if (!title.trim()) {
      return
    }

    onAddHabit({
      title: title.trim(),
      target: Number(target) || 1,
      unit: unit.trim() || 'Mal',
    })

    setTitle('')
    setTarget('8')
    setUnit('Glaeser')
    setAddPanelOpen(false)
  }

  function addSuggestedRoutine(routine, categoryTitle) {
    if (existingTitles.has(routine.title.toLowerCase())) {
      return
    }

    onAddHabit({
      ...routine,
      category: categoryTitle,
    })

    setAddPanelOpen(false)
    setOpenCategory('')
  }

  return (
    <section className="screen">
      <p className="eyebrow">Routinen</p>
      <h1>Meine Routinen</h1>

      <div className="habit-list">
        {habits.map((habit) => (
          <HabitCard
            habit={habit}
            key={habit.id}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            onSetMood={onSetMood}
            onUpdatePeriod={onUpdatePeriod}
            onRemove={onRemove}
            onToggleDone={onToggleDone}
          />
        ))}
      </div>

      <button
        className="add-routine-toggle"
        onClick={() => setAddPanelOpen((open) => !open)}
        type="button"
      >
        {addPanelOpen ? 'Hinzufuegen schliessen' : '+ Routine hinzufuegen'}
      </button>

      {addPanelOpen && (
        <div className="routine-add-panel">
          <div className="routine-picker">
            {routineCategories.map((category) => {
              const isOpen = openCategory === category.title

              return (
                <div className="routine-category-group" key={category.title}>
                  <button
                    className={`routine-category ${isOpen ? 'active' : ''}`}
                    onClick={() => setOpenCategory(isOpen ? '' : category.title)}
                    type="button"
                  >
                    <span>{category.title}</span>
                    <strong aria-hidden="true">{isOpen ? '-' : '+'}</strong>
                  </button>

                  {isOpen && (
                    <div className="routine-suggestions">
                      {category.routines.map((routine) => {
                        const isAdded = existingTitles.has(routine.title.toLowerCase())

                        return (
                          <button
                            className="routine-suggestion"
                            disabled={isAdded}
                            key={routine.title}
                            onClick={() => addSuggestedRoutine(routine, category.title)}
                            type="button"
                          >
                            <strong>{routine.title}</strong>
                            <small>{isAdded ? 'Hinzugefuegt' : `Ziel: ${routine.target} ${routine.unit}`}</small>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <form className="routine-form" onSubmit={handleSubmit}>
            <p className="form-title">Eigene Routine</p>
            <label>
              Routine
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="z. B. Wasser trinken"
              />
            </label>
            <div className="routine-form-row">
              <label>
                Ziel
                <input
                  min="1"
                  type="number"
                  value={target}
                  onChange={(event) => setTarget(event.target.value)}
                />
              </label>
              <label>
                Einheit
                <input
                  value={unit}
                  onChange={(event) => setUnit(event.target.value)}
                  placeholder="Glaeser"
                />
              </label>
            </div>
            <button className="wide-button" type="submit">Routine hinzufuegen</button>
          </form>
        </div>
      )}
    </section>
  )
}

export default Routinen
