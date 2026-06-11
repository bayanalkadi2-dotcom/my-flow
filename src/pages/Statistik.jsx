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

const dayLabels = {
  german: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
  english: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  turkish: ['Pzt', 'Sal', 'Car', 'Per', 'Cum', 'Cmt', 'Paz'],
  arabic: ['ن', 'ث', 'ر', 'خ', 'ج', 'س', 'ح'],
}

const monthLabels = {
  german: ['W1', 'W2', 'W3', 'W4'],
  english: ['W1', 'W2', 'W3', 'W4'],
  turkish: ['H1', 'H2', 'H3', 'H4'],
  arabic: ['أ1', 'أ2', 'أ3', 'أ4'],
}

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

function Statistik({ languageStyle, t }) {
  const [period, setPeriod] = useState('week')
  const activeStats = periodStats[period]
  const chartLabels = period === 'week'
    ? dayLabels[languageStyle] ?? dayLabels.german
    : monthLabels[languageStyle] ?? monthLabels.german

  return (
    <section className="screen">
      <p className="eyebrow">{t.stats.eyebrow}</p>
      <h1>{t.stats.title}</h1>
      <div className="period-toggle" aria-label={t.stats.periodLabel}>
        <button
          className={period === 'week' ? 'selected' : ''}
          onClick={() => setPeriod('week')}
          type="button"
        >
          {t.stats.week}
        </button>
        <button
          className={period === 'month' ? 'selected' : ''}
          onClick={() => setPeriod('month')}
          type="button"
        >
          {t.stats.month}
        </button>
      </div>
      <div className="stat-summary-grid">
        <article className="stat-card summary-card">
          <span>{t.stats.average}</span>
          <strong>{activeStats.average}%</strong>
          <p>{t.stats.inFlow.replace('{period}', period === 'week' ? t.stats.week : t.stats.month)}</p>
        </article>
        <article className="stat-card summary-card">
          <span>{t.stats.steps}</span>
          <strong>{activeStats.steps.toLocaleString(languageStyle === 'german' ? 'de-DE' : 'en-US')}</strong>
          <p>{t.stats.total}</p>
        </article>
        <article className="stat-card summary-card improvement-card">
          <span>{t.stats.improvement}</span>
          <strong>+{activeStats.improvement}%</strong>
          <p>{t.stats.compared}</p>
        </article>
      </div>
      <div className="chart-card">
        {activeStats.progress.map((entry, index) => (
          <div className="bar-wrap" key={entry.day}>
            <div className="bar" style={{ height: `${entry.value}%` }} />
            <span>{chartLabels[index] ?? entry.day}</span>
          </div>
        ))}
      </div>
      <div className="smoking-stats">
        {smokingProgress.map((entry, index) => (
          <article className="stat-card smoking-card" key={entry.label}>
            <span>{index === 0 ? t.stats.today : t.stats.week}</span>
            <strong>{entry.value}</strong>
            <p>{index === 0 ? t.stats.cigarettesAvoided : t.stats.fewerCigarettes}</p>
          </article>
        ))}
      </div>
      <article className="motivation-card">
        <div className="motivation-bubble">
          <span>{t.stats.thoughtBubble}</span>
          <h2>{t.stats.quietDay}</h2>
          <p>
            {t.stats.stepText.replace('{steps}', todaySteps.toLocaleString(languageStyle === 'german' ? 'de-DE' : 'en-US'))}
          </p>
        </div>
        <div className="motivation-progress" aria-label={`${stepProgress}% vom Schrittziel erreicht`}>
          <span style={{ width: `${stepProgress}%` }} />
        </div>
        <small>
          {t.stats.stepGoal
            .replace('{progress}', stepProgress)
            .replace('{goal}', stepGoal.toLocaleString(languageStyle === 'german' ? 'de-DE' : 'en-US'))}
        </small>
      </article>
    </section>
  )
}

export default Statistik
