import SmartRangeTrendChart from './SmartRangeTrendChart'

function WellbeingDashboard({
  title,
  subtitle,
  infoLabel,
  period,
  periodOptions = [],
  onPeriodChange,
  metrics = [],
  chartData = [],
  chartTitle,
  habits = [],
  habitsTitle,
  insights = [],
  insightsTitle,
  lastUpdated,
  isLoading = false,
  error,
  noDataText,
  noInsightsText,
}) {
  const hasChartData = Array.isArray(chartData) && chartData.length > 0
  const hasHabits = Array.isArray(habits) && habits.length > 0
  const hasInsights = Array.isArray(insights) && insights.length > 0

  return (
    <article className="wellbeing-dashboard">
      <div className="wellbeing-dashboard-header">
        <div className="wellbeing-dashboard-heading">
          <span className="wellbeing-dashboard-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" fill="rgba(123, 97, 255, 0.12)" />
              <path d="M8 14l2 2 4-6" stroke="#7b61ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div>
            <p className="eyebrow">{title}</p>
            <h2>{subtitle}</h2>
          </div>
        </div>
        <div className="wellbeing-dashboard-actions">
          <button type="button" className="secondary-button wellbeing-info-button" aria-label={infoLabel}>
            {infoLabel}
          </button>
          <div className="period-toggle wellbeing-period-toggle" aria-label="Zeitraum auswählen">
            {periodOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={option.value === period ? 'selected' : ''}
                onClick={() => onPeriodChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="wellbeing-dashboard-metrics">
        {metrics.map((metric) => (
          <article className="stat-card wellbeing-metric-card" key={metric.label}>
            <span>{metric.label}</span>
            <strong>
              {metric.value !== undefined && metric.value !== null ? (
                <>{metric.value}{metric.unit ? ` ${metric.unit}` : ''}</>
              ) : (
                '—'
              )}
            </strong>
            {metric.description && <p>{metric.description}</p>}
          </article>
        ))}
      </div>

      <div className="wellbeing-dashboard-body">
        <article className="chart-card wellbeing-chart-card">
          <div className="chart-header">
            <span>{chartTitle}</span>
            <small>{lastUpdated || ''}</small>
          </div>
          {isLoading ? (
            <div className="wellbeing-empty-state">{noDataText || 'Lade Daten…'}</div>
          ) : error ? (
            <div className="wellbeing-empty-state">{error}</div>
          ) : hasChartData ? (
            <SmartRangeTrendChart
              data={chartData}
              normalRange={{ min: 0, max: 100 }}
              title=""
              unit="%"
              showTrend={false}
              showCurrentValue={false}
            />
          ) : (
            <div className="wellbeing-empty-state">{noDataText || 'Noch keine Daten vorhanden'}</div>
          )}
        </article>

        <div className="wellbeing-dashboard-side">
          <section className="wellbeing-habits">
            <div className="wellbeing-section-header">
              <span>{habitsTitle}</span>
              <strong>{habitCountText(habits)}</strong>
            </div>
            {hasHabits ? (
              habits.map((habit) => (
                <article className="stat-card wellbeing-habit-card" key={habit.title}>
                  <div className="wellbeing-habit-icon" aria-hidden="true">
                    <span />
                  </div>
                  <div>
                    <strong>{habit.title}</strong>
                    <p>{habit.detail || '—'}</p>
                  </div>
                </article>
              ))
            ) : (
              <div className="wellbeing-empty-state">{noDataText || 'Noch keine Daten vorhanden'}</div>
            )}
          </section>

          <section className="wellbeing-insights">
            <div className="wellbeing-section-header">
              <span>{insightsTitle}</span>
            </div>
            {hasInsights ? (
              insights.map((insight) => (
                <article className="stat-card wellbeing-insight-card" key={insight.title || insight.label}>
                  {insight.title && <strong>{insight.title}</strong>}
                  {insight.text && <p>{insight.text}</p>}
                </article>
              ))
            ) : (
              <div className="wellbeing-empty-state">{noInsightsText || 'Keine Auswertung verfügbar'}</div>
            )}
          </section>
        </div>
      </div>
    </article>
  )
}

function habitCountText(habits = []) {
  if (!Array.isArray(habits) || habits.length === 0) {
    return '—'
  }
  const done = habits.filter((habit) => habit.done || habit.progress >= 100).length
  return `${done}/${habits.length}`
}

export default WellbeingDashboard
