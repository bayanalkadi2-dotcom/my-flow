import { useState } from 'react'
import SmartRangeTrendChart from '../commponents/SmartRangeTrendChart'
import WellbeingDashboard from '../commponents/WellbeingDashboard'

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

const chartSeries = {
  week: {
    normalRange: { min: 50, max: 72 },
    data: [
      { label: 'Mo', value: 55 },
      { label: 'Di', value: 80 },
      { label: 'Mi', value: 45 },
      { label: 'Do', value: 90 },
      { label: 'Fr', value: 65 },
      { label: 'Sa', value: 75 },
      { label: 'So', value: 60 },
    ],
  },
  month: {
    normalRange: { min: 62, max: 76 },
    data: [
      { label: 'W1', value: 58 },
      { label: 'W2', value: 64 },
      { label: 'W3', value: 71 },
      { label: 'W4', value: 82 },
    ],
  },
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
      <WellbeingDashboard
        title={t.stats.wellbeingTitle}
        subtitle={t.stats.wellbeingSubtitle}
        infoLabel={t.stats.wellbeingInfo}
        period={period}
        periodOptions={[
          { value: 'week', label: t.stats.week },
          { value: 'month', label: t.stats.month },
        ]}
        onPeriodChange={setPeriod}
        metrics={[
          { label: t.stats.wellbeingMood, value: activeStats.average, unit: '%' },
          { label: t.stats.wellbeingStrength, value: activeStats.improvement, unit: '%' },
          { label: t.stats.wellbeingHabits, value: smokingProgress.length },
        ]}
        chartData={chartSeries[period].data}
        chartTitle={t.stats.wellbeingChart}
        habits={smokingProgress.map((entry) => ({
          title: entry.label,
          detail: entry.detail,
        }))}
        habitsTitle={t.stats.wellbeingHabits}
        insights={[]}
        insightsTitle={t.stats.wellbeingInsights}
        lastUpdated={t.stats.wellbeingLastUpdated}
        noDataText={t.stats.wellbeingNoData}
        noInsightsText={t.stats.wellbeingNoInsights}
      />
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
