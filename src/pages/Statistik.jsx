const weeklyProgress = [
  { day: 'Mo', value: 55 },
  { day: 'Di', value: 80 },
  { day: 'Mi', value: 45 },
  { day: 'Do', value: 90 },
  { day: 'Fr', value: 65 },
  { day: 'Sa', value: 75 },
  { day: 'So', value: 60 },
]

function Statistik() {
  return (
    <section className="screen">
      <p className="eyebrow">Statistik</p>
      <h1>Dein Fortschritt</h1>
      <div className="chart-card">
        {weeklyProgress.map((entry) => (
          <div className="bar-wrap" key={entry.day}>
            <div className="bar" style={{ height: `${entry.value}%` }} />
            <span>{entry.day}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Statistik
