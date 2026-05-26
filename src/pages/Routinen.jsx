import HabitCard from '../commponents/HabitCard'

function Routinen({ habits }) {
  return (
    <section className="screen">
      <p className="eyebrow">Routinen</p>
      <h1>Meine Routinen</h1>
      <div className="habit-list">
        {habits.map((habit) => (
          <HabitCard habit={habit} key={habit.title} />
        ))}
      </div>
      <button className="wide-button">Neue Routine hinzufügen</button>
    </section>
  )
}

export default Routinen
