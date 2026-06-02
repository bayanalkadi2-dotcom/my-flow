import { useState } from 'react'

const weeklyProgress = [
  { day: 'Mo', value: 55 },
  { day: 'Di', value: 80 },
  { day: 'Mi', value: 45 },
  { day: 'Do', value: 90 },
  { day: 'Fr', value: 65 },
  { day: 'Sa', value: 75 },
  { day: 'So', value: 60 },
]

const monthlyProgress = [
  { day: 'W1', value: 58 },
  { day: 'W2', value: 64 },
  { day: 'W3', value: 71 },
  { day: 'W4', value: 76 },
]

const smokingProgress = [
  { label: 'Heute', value: '2', detail: 'Zigaretten vermieden' },
  { label: 'Woche', value: '11', detail: 'Zigaretten weniger' },
]

const periodStats = {
  week: {
    label: 'Woche',
    average: 68,
    steps: 28400,
    improvement: 12,
    progress: weeklyProgress,
  },
  month: {
    label: 'Monat',
    average: 67,
    steps: 124600,
    improvement: 18,
    progress: monthlyProgress,
  },
}

const todaySteps = 3200
const stepGoal = 8000
const stepProgress = Math.round((todaySteps / stepGoal) * 100)

function Statistik() {
  const [period, setPeriod] = useState('week')
  const activeStats = periodStats[period]

  return (
    <section className="screen">
      <p className="eyebrow">Statistik</p>
      <h1>Dein Fortschritt</h1>
      <div className="period-toggle" aria-label="Statistik Zeitraum auswählen">
        <button
          className={period === 'week' ? 'selected' : ''}
          onClick={() => setPeriod('week')}
          type="button"
        >
          Woche
        </button>
        <button
          className={period === 'month' ? 'selected' : ''}
          onClick={() => setPeriod('month')}
          type="button"
        >
          Monat
        </button>
      </div>
      <div className="stat-summary-grid">
        <article className="stat-card summary-card">
          <span>Durchschnitt</span>
          <strong>{activeStats.average}%</strong>
          <p>{activeStats.label} im Flow</p>
        </article>
        <article className="stat-card summary-card">
          <span>Schritte</span>
          <strong>{activeStats.steps.toLocaleString('de-DE')}</strong>
          <p>gesamt</p>
        </article>
        <article className="stat-card summary-card improvement-card">
          <span>Verbesserung</span>
          <strong>+{activeStats.improvement}%</strong>
          <p>gegenüber vorher</p>
        </article>
      </div>
      <div className="chart-card">
        {activeStats.progress.map((entry) => (
          <div className="bar-wrap" key={entry.day}>
            <div className="bar" style={{ height: `${entry.value}%` }} />
            <span>{entry.day}</span>
          </div>
        ))}
      </div>
      <div className="smoking-stats">
        {smokingProgress.map((entry) => (
          <article className="stat-card smoking-card" key={entry.label}>
            <span>{entry.label}</span>
            <strong>{entry.value}</strong>
            <p>{entry.detail}</p>
          </article>
        ))}
      </div>
      <article className="motivation-card">
        <div className="motivation-bubble">
          <span>Gedankenblase</span>
          <h2>Heute war es etwas ruhiger.</h2>
          <p>
            Du bist heute {todaySteps.toLocaleString('de-DE')} Schritte gelaufen.
            Ein kurzer Spaziergang bringt dich deinem Ziel schon naeher.
          </p>
        </div>
        <div className="motivation-progress" aria-label={`${stepProgress}% vom Schrittziel erreicht`}>
          <span style={{ width: `${stepProgress}%` }} />
        </div>
        <small>{stepProgress}% von {stepGoal.toLocaleString('de-DE')} Schritten</small>
      </article>
    </section>
  )
}

export default Statistik
