import { useState } from 'react'
import HabitCard from '../commponents/HabitCard'

const routineCategories = [
  {
    title: '😌 Mentale Gesundheit',
    routines: [
      { icon: '🧘', title: 'Meditation', target: 10, unit: 'Minuten', incrementLabel: '1 Minute meditiert' },
      { icon: '🙏', title: 'Dankbarkeit', target: 3, unit: 'Dinge', incrementLabel: '1 Sache notiert' },
      { icon: '📝', title: 'Tagebuch', target: 1, unit: 'Eintrag', incrementLabel: 'Eintrag geschrieben' },
      { icon: '😌', title: 'Stimmung tracken', target: 1, unit: 'Check-in', incrementLabel: 'Stimmung eingetragen', type: 'mood' },
      { icon: '📖', title: 'Lesen', target: 20, unit: 'Minuten', incrementLabel: '1 Minute gelesen' },
      { icon: '📵', title: 'Digitale Pause', target: 30, unit: 'Minuten', incrementLabel: '1 Minute Pause' },
    ],
  },
  {
    title: '💪 Körperliche Gesundheit',
    routines: [
      { icon: '💧', title: 'Wasser trinken', target: 8, unit: 'Gläser', incrementLabel: '1 Glas getrunken' },
      { icon: '🚶', title: 'Bewegung', target: 30, unit: 'Minuten', incrementLabel: '1 Minute Bewegung' },
      { icon: '🏋️', title: 'Sport', target: 30, unit: 'Minuten', incrementLabel: '1 Minute Sport' },
      { icon: '😴', title: 'Schlaf', target: 8, unit: 'Stunden', incrementLabel: '1 Stunde geschlafen' },
      { icon: '🥗', title: 'Gesund essen', target: 3, unit: 'Mahlzeiten', incrementLabel: '1 gesunde Mahlzeit' },
      { icon: '🍓', title: 'Periode', target: 1, unit: 'Eintrag', incrementLabel: 'Periode eingetragen', type: 'period' },
    ],
  },
  {
    title: '💊 Medikamente & Vitamine',
    routines: [
      { icon: '💊', title: 'Medikament eingenommen', target: 1, unit: 'Dosis', incrementLabel: 'Dosis eingenommen' },
      { icon: '🍊', title: 'Vitamine eingenommen', target: 1, unit: 'Portion', incrementLabel: 'Vitamine eingenommen' },
      { icon: '🌿', title: 'Supplement eingenommen', target: 1, unit: 'Portion', incrementLabel: 'Supplement eingenommen' },
      { icon: '🧃', title: 'Magnesium/Zink eingenommen', target: 1, unit: 'Portion', incrementLabel: 'Portion eingenommen' },
    ],
  },
  {
    title: '📚 Produktivität',
    routines: [
      { icon: '📅', title: 'Tagesplanung', target: 1, unit: 'Plan', incrementLabel: 'Plan erstellt' },
      { icon: '📚', title: 'Lernen', target: 60, unit: 'Minuten', incrementLabel: '1 Minute gelernt' },
      { icon: '🎯', title: 'Fokuszeit', target: 45, unit: 'Minuten', incrementLabel: '1 Minute fokussiert' },
      { icon: '🧹', title: 'Aufräumen', target: 15, unit: 'Minuten', incrementLabel: '1 Minute aufgeräumt' },
    ],
  },
  {
    title: '👥 Soziales',
    routines: [
      { icon: '💬', title: 'Freunde kontaktieren', target: 1, unit: 'Kontakt', incrementLabel: 'Kontakt erledigt' },
      { icon: '📞', title: 'Familie kontaktieren', target: 1, unit: 'Kontakt', incrementLabel: 'Kontakt erledigt' },
      { icon: '👥', title: 'Soziale Aktivität', target: 1, unit: 'Aktivität', incrementLabel: 'Aktivität gemacht' },
    ],
  },
  {
    title: '🚭 Gewohnheiten reduzieren',
    routines: [
      { icon: '🚬', title: 'Rauchen reduzieren', target: 5, unit: 'Zigaretten vermieden', incrementLabel: '1 Zigarette vermieden' },
      { icon: '📱', title: 'Weniger Social Media', target: 2, unit: 'Stunden vermieden', incrementLabel: '1 Stunde vermieden' },
      { icon: '🍭', title: 'Weniger Süßigkeiten', target: 3, unit: 'Snacks vermieden', incrementLabel: '1 Snack vermieden' },
    ],
  },
]

function Routinen({ habits, onAddHabit, onIncrement, onDecrement, onSetMood, onUpdatePeriod, onRemove, onToggleDone }) {
  const [title, setTitle] = useState('')
  const [target, setTarget] = useState('8')
  const [unit, setUnit] = useState('Gläser')
  const [activeCategory, setActiveCategory] = useState(routineCategories[0].title)
  const selectedCategory = routineCategories.find((category) => category.title === activeCategory)
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
    setUnit('Gläser')
  }

  function addSuggestedRoutine(routine) {
    if (existingTitles.has(routine.title.toLowerCase())) {
      return
    }

    onAddHabit({
      ...routine,
      category: activeCategory,
    })
  }

  return (
    <section className="screen">
      <p className="eyebrow">Routinen</p>
      <h1>Meine Routinen</h1>

      <div className="routine-picker">
        <div className="routine-category-list" aria-label="Routinen Kategorien">
          {routineCategories.map((category) => (
            <button
              className={`routine-category ${category.title === activeCategory ? 'active' : ''}`}
              key={category.title}
              onClick={() => setActiveCategory(category.title)}
              type="button"
            >
              {category.title}
            </button>
          ))}
        </div>

        <div className="routine-suggestions">
          {selectedCategory.routines.map((routine) => {
            const isAdded = existingTitles.has(routine.title.toLowerCase())

            return (
              <button
                className="routine-suggestion"
                disabled={isAdded}
                key={routine.title}
                onClick={() => addSuggestedRoutine(routine)}
                type="button"
              >
                <span>{routine.icon}</span>
                <strong>{routine.title}</strong>
                <small>{isAdded ? 'Hinzugefügt' : `Ziel: ${routine.target} ${routine.unit}`}</small>
              </button>
            )
          })}
        </div>
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
              placeholder="Gläser"
            />
          </label>
        </div>
        <button className="wide-button" type="submit">Routine hinzufügen</button>
      </form>
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
    </section>
  )
}

export default Routinen
