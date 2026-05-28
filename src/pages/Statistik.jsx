const weeklyProgress = [
  { day: 'Mo', value: 55, label: 'Fokus' },
  { day: 'Di', value: 80, label: 'Top' },
  { day: 'Mi', value: 45, label: 'Leicht' },
  { day: 'Do', value: 90, label: 'Best' },
  { day: 'Fr', value: 65, label: 'Stabil' },
  { day: 'Sa', value: 75, label: 'Flow' },
  { day: 'So', value: 60, label: 'Reset' },
]

const statHighlights = [
  { label: 'Wochenziel', value: '68%', detail: '+12% zu letzter Woche' },
  { label: 'Streak', value: '6', detail: 'Tage in Folge' },
  { label: 'Beste Zeit', value: '18:30', detail: 'meiste Erfolge' },
]

function Statistik() {
  const averageProgress = Math.round(
    weeklyProgress.reduce((total, entry) => total + entry.value, 0) / weeklyProgress.length,
  )
  const bestDay = weeklyProgress.reduce((best, entry) => (entry.value > best.value ? entry : best))

  return (
    <section className="screen stats-screen">
      <div className="stats-hero">
        <div>
          <p className="eyebrow">Statistik</p>
          <h1>Dein Fortschritt</h1>
          <p className="lead">Eine klare Woche: mehr Routine, bessere Energie und sichtbarer Flow.</p>
        </div>
        <div className="stats-ring" aria-label={`${averageProgress}% durchschnittlicher Fortschritt`}>
          <span>{averageProgress}%</span>
          <small>Woche</small>
        </div>
      </div>

      <div className="stats-grid">
        {statHighlights.map((item) => (
          <article className="mini-stat" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.detail}</small>
          </article>
        ))}
      </div>

      <div className="chart-card stats-chart-card">
        <div className="chart-topline">
          <div>
            <h2>Wochenverlauf</h2>
            <p>Bester Tag: {bestDay.day} mit {bestDay.value}%</p>
          </div>
          <span>7 Tage</span>
        </div>

        <div className="stats-chart">
          {weeklyProgress.map((entry) => (
            <div className="bar-wrap stats-bar-wrap" key={entry.day}>
              <span className="bar-value">{entry.value}%</span>
              <div className="bar-track">
                <div className="bar" style={{ height: `${entry.value}%` }} />
              </div>
              <strong>{entry.day}</strong>
              <small>{entry.label}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Statistik
