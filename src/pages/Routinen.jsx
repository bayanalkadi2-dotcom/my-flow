import { useState } from 'react'
import HabitCard from '../commponents/HabitCard'
import { translateCategory, translateHabitTitle } from '../i18n'

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
    title: 'Körperliche Gesundheit',
    routines: [
      { title: 'Wasser trinken', target: 4, unit: 'Gläser (500 ml)', incrementLabel: '500 ml Wasser getrunken' },
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
    title: 'Produktivität',
    routines: [
      { title: 'Tagesplanung', target: 1, unit: 'Plan', incrementLabel: 'Plan erstellt' },
      { title: 'Lernen', target: 60, unit: 'Minuten', incrementLabel: '1 Minute gelernt' },
      { title: 'Fokuszeit', target: 45, unit: 'Minuten', incrementLabel: '1 Minute fokussiert' },
      { title: 'Aufräumen', target: 15, unit: 'Minuten', incrementLabel: '1 Minute aufgeräumt' },
    ],
  },
  {
    title: 'Soziales',
    routines: [
      { title: 'Freunde kontaktieren', target: 1, unit: 'Kontakt', incrementLabel: 'Kontakt erledigt' },
      { title: 'Familie kontaktieren', target: 1, unit: 'Kontakt', incrementLabel: 'Kontakt erledigt' },
      { title: 'Soziale Aktivität', target: 1, unit: 'Aktivität', incrementLabel: 'Aktivität gemacht' },
    ],
  },
  {
    title: 'Gewohnheiten reduzieren',
    routines: [
      { title: 'Rauchen reduzieren', target: 5, unit: 'Zigaretten vermieden', incrementLabel: '1 Zigarette vermieden' },
      { title: 'Weniger Social Media', target: 2, unit: 'Stunden vermieden', incrementLabel: '1 Stunde vermieden' },
      { title: 'Weniger Süßigkeiten', target: 3, unit: 'Snacks vermieden', incrementLabel: '1 Snack vermieden' },
    ],
  },
]

function Routinen({ habits, languageStyle, onAddHabit, onIncrement, onDecrement, onSetMood, onUpdatePeriod, onRemove, onToggleDone, t, translateUnit }) {
  const [title, setTitle] = useState('')
  const [target, setTarget] = useState('1')
  const [unit, setUnit] = useState('Mal')
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
    setTarget('1')
    setUnit('Mal')
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
      <p className="eyebrow">{t.routines.eyebrow}</p>
      <h1>{t.routines.title}</h1>

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
            t={t}
          />
        ))}
      </div>

      <button
        className="add-routine-toggle"
        onClick={() => setAddPanelOpen((open) => !open)}
        type="button"
      >
        {addPanelOpen ? t.routines.closeAdd : t.routines.add}
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
                    <span>{translateCategory(category.title, languageStyle)}</span>
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
                            <strong>{translateHabitTitle(routine.title, languageStyle)}</strong>
                            <small>
                              {isAdded
                                ? t.routines.added
                                : `${t.routines.target}: ${routine.target} ${translateUnit(routine.unit)}`}
                            </small>
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
            <p className="form-title">{t.routines.custom}</p>
            <label>
              {t.routines.routine}
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={t.routines.placeholder}
              />
            </label>
            <div className="routine-form-row">
              <label>
                {t.routines.target}
                <input
                  min="1"
                  type="number"
                  value={target}
                  onChange={(event) => setTarget(event.target.value)}
                />
              </label>
              <label>
                {t.routines.unit}
                <input
                  value={unit}
                  onChange={(event) => setUnit(event.target.value)}
                  placeholder={translateUnit('Gläser (500 ml)')}
                />
              </label>
            </div>
            <button className="wide-button" type="submit">{t.routines.addRoutine}</button>
          </form>
        </div>
      )}
    </section>
  )
}

export default Routinen
