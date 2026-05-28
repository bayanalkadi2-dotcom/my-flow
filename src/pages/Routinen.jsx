import { useState } from 'react'
import HabitCard from '../commponents/HabitCard'

function Routinen({ habits, onAddHabit, onIncrement, onDecrement, onToggleDone }) {
  const [title, setTitle] = useState('')
  const [target, setTarget] = useState('8')
  const [unit, setUnit] = useState('Gläser')

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

  return (
    <section className="screen">
      <p className="eyebrow">Routinen</p>
      <h1>Meine Routinen</h1>
      <form className="routine-form" onSubmit={handleSubmit}>
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
            onToggleDone={onToggleDone}
          />
        ))}
      </div>
    </section>
  )
}

export default Routinen
