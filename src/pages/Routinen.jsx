import { useState } from 'react'
import HabitCard from '../commponents/HabitCard'
import { useProfile } from '../context/profileContextValue'
import { translateCategory, translateHabitTitle } from '../i18n'

const routineCategories = [
  {
    title: 'Mentale Gesundheit',
    routines: [
      { title: 'Meditation', target: 10, unit: 'Minuten', incrementLabel: '1 Minute meditiert' },
      { title: 'Dankbarkeit', target: 3, unit: 'Dinge', incrementLabel: '1 Sache notiert' },
      { title: 'Stimmung tracken', target: 1, unit: 'Check-in', incrementLabel: 'Stimmung eingetragen', type: 'mood' },
      { title: 'Digitale Pause', target: 30, unit: 'Minuten', incrementLabel: '1 Minute Pause' },
    ],
  },
  {
    title: 'Körperliche Gesundheit',
    routines: [
      { title: 'Wasser trinken', target: 4, unit: 'Gläser (500 ml)', incrementLabel: '500 ml Wasser getrunken' },
      { title: 'Bewegung', target: 30, unit: 'Minuten', incrementLabel: '1 Minute Bewegung' },
      { title: 'Schlaf', target: 8, unit: 'Stunden', incrementLabel: '1 Stunde geschlafen' },
      { title: 'Periode', target: 1, unit: 'Eintrag', incrementLabel: 'Periode eingetragen', type: 'period' },
    ],
  },
  {
    title: 'Medikamente & Vitamine',
    routines: [
      { title: 'Medikament eingenommen', target: 1, unit: 'Dosis', incrementLabel: 'Dosis eingenommen' },
      { title: 'Vitamine eingenommen', target: 1, unit: 'Portion', incrementLabel: 'Vitamine eingenommen' },
    ],
  },
  {
    title: 'Produktivität',
    routines: [
      { title: 'Wochenplanung', target: 1, unit: 'Planung', incrementLabel: 'Wochenplanung erledigt' },
      { title: 'Mini-Aufgaben erledigen', target: 1, unit: 'Aufgabe', incrementLabel: 'Mini-Aufgabe erledigt' },
      { title: 'Lernen', target: 60, unit: 'Minuten', incrementLabel: '1 Minute gelernt' },
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

const categoryDesign = {
  'Für dich': { icon: '✦', subtitle: 'Empfohlen für dich', tone: 'recommended' },
  'Mentale Gesundheit': { icon: '♡', subtitle: 'Achtsamkeit & Wohlbefinden', tone: 'mind' },
  'Körperliche Gesundheit': { icon: '⌁', subtitle: 'Bewegung & Ernährung', tone: 'body' },
  'Medikamente & Vitamine': { icon: '＋', subtitle: 'Einnahmen im Blick behalten', tone: 'medicine' },
  Produktivität: { icon: '✓', subtitle: 'Fokus & Ziele erreichen', tone: 'productivity' },
  'Gewohnheiten reduzieren': { icon: '↘', subtitle: 'Weniger Stress, mehr Balance', tone: 'balance' },
}

function getCategoryDesign(title) {
  return categoryDesign[title] ?? {
    icon: '+',
    subtitle: 'Passende Routinen hinzufügen',
    tone: 'recommended',
  }
}

function Routinen({ habits, languageStyle, onAddHabit, onIncrement, onDecrement, onResetProgress, onSaveDailyEntry, onSetMood, onSetPartial, onUpdatePeriod, onRemove, onToggleDone, t, translateUnit }) {
  const { routineSuggestions } = useProfile()
  const [title, setTitle] = useState('')
  const [target, setTarget] = useState('4')
  const [unit, setUnit] = useState('Gläser (500 ml)')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [customFormOpen, setCustomFormOpen] = useState(false)
  const [openCategory, setOpenCategory] = useState('')
  const existingTitles = new Set(habits.map((habit) => habit.title.toLowerCase()))
  const availableCategories = [
    { title: 'Für dich', routines: routineSuggestions },
    ...routineCategories,
  ]

  function handleSubmit(event) {
    event.preventDefault()

    if (!title.trim() || existingTitles.has(title.trim().toLowerCase())) {
      return
    }

    onAddHabit({
      title: title.trim(),
      target: Number(target) || 1,
      unit: unit.trim() || 'Mal',
    })

    setTitle('')
    setTarget('4')
    setUnit('Gläser (500 ml)')
    setCustomFormOpen(false)
    setPickerOpen(false)
  }

  function addSuggestedRoutine(routine, categoryTitle) {
    if (existingTitles.has(routine.title.toLowerCase())) {
      return
    }

    onAddHabit({
      ...routine,
      category: categoryTitle,
    })

    setPickerOpen(false)
    setCustomFormOpen(false)
    setOpenCategory('')
  }

  return (
    <section className="screen routines-screen">
      <header className="routines-page-header">
        <div>
          <p className="eyebrow">ROUTINEN</p>
          <h1>Deine Routinen</h1>
          <p>Kleine Schritte, große Wirkung.</p>
        </div>
        <button
          className="routine-add-circle"
          onClick={() => {
            setPickerOpen((open) => !open)
            setCustomFormOpen(false)
            setOpenCategory('')
          }}
          type="button"
          aria-expanded={pickerOpen}
          aria-label={pickerOpen ? t.routines.closeAdd : t.routines.add}
        >
          {pickerOpen ? '×' : '+'}
        </button>
      </header>

      {pickerOpen && (
        <div className="routine-selection-panel">
          <div className="routine-picker" aria-label="Routine-Kategorien">
        {availableCategories.map((category) => {
          const isOpen = openCategory === category.title
          const design = getCategoryDesign(category.title)

          return (
            <div className="routine-category-group" key={category.title}>
              <button
                className={`routine-category routine-category-${design.tone} ${isOpen ? 'active' : ''}`}
                onClick={() => setOpenCategory(isOpen ? '' : category.title)}
                type="button"
              >
                <span className="routine-category-icon" aria-hidden="true">{design.icon}</span>
                <span className="routine-category-copy">
                  <span>{translateCategory(category.title, languageStyle)}</span>
                  <small>{design.subtitle}</small>
                </span>
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

          <article className="custom-routine-card">
        <div>
          <span>Eigene Routine</span>
          <h2>Eigene Routine</h2>
          <p>Erstelle deine ganz persönliche Routine, die perfekt zu dir passt.</p>
          <button type="button" onClick={() => setCustomFormOpen((open) => !open)}>
            Eigene Routine erstellen
          </button>
        </div>
        <div className="custom-routine-illustration" aria-hidden="true">
          <span>＋</span>
          <small>Flow</small>
        </div>
          </article>

          {customFormOpen && (
            <div className="routine-add-panel">
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
        </div>
      )}

      <div className="habit-list">
        {habits.length === 0 && (
          <div className="routines-empty-state">
            <strong>Du hast noch keine Routinen hinzugefügt.</strong>
            <p>Tippe auf das Plus, um eine neue Routine auszuwählen.</p>
          </div>
        )}
        {habits.map((habit) => (
          <HabitCard
            habit={habit}
            key={habit.id}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            onResetProgress={onResetProgress}
            onSaveDailyEntry={onSaveDailyEntry}
            onSetMood={onSetMood}
            onSetPartial={onSetPartial}
            onUpdatePeriod={onUpdatePeriod}
            onRemove={onRemove}
            onToggleDone={onToggleDone}
            t={t}
          />
        ))}
      </div>
    </section>
  )
}

export default Routinen
