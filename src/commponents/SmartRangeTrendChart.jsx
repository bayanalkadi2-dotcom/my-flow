import { useMemo, useState } from 'react'

const statusLabels = {
  normal: 'Normal',
  low: 'Niedrig',
  high: 'Erhöht',
  'critical-low': 'Kritisch niedrig',
  'critical-high': 'Kritisch hoch',
}

const trendDirections = {
  up: { arrow: '↑', label: 'höher' },
  down: { arrow: '↓', label: 'niedriger' },
  stable: { arrow: '→', label: 'stabil' },
}

function resolveStatus(value, normalRange, criticalRange, explicitStatus) {
  if (explicitStatus) {
    return explicitStatus
  }

  const isLow = value < normalRange.min
  const isHigh = value > normalRange.max
  const criticalLow = criticalRange?.min !== undefined && value < criticalRange.min
  const criticalHigh = criticalRange?.max !== undefined && value > criticalRange.max

  if (criticalLow) return 'critical-low'
  if (criticalHigh) return 'critical-high'
  if (isLow) return 'low'
  if (isHigh) return 'high'
  return 'normal'
}

function formatTrend(current, previous) {
  if (previous === undefined || previous === null) {
    return null
  }

  const delta = current - previous
  const percentage = previous ? Math.round((delta / Math.max(1, previous)) * 100) : 0
  const direction = delta > 0 ? 'up' : delta < 0 ? 'down' : 'stable'
  const indicator = trendDirections[direction]

  return {
    direction,
    arrow: indicator.arrow,
    label: delta === 0 ? 'Stabil' : `${Math.abs(delta)} bpm ${indicator.label}`,
    percent: delta === 0 ? '0 %' : `${delta > 0 ? '+' : '-'}${Math.abs(percentage)} %`,
    delta,
  }
}

function buildCurvePath(points) {
  if (points.length < 2) {
    return points.length ? `M ${points[0].x} ${points[0].y}` : ''
  }

  const d = [`M ${points[0].x} ${points[0].y}`]

  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i === 0 ? i : i - 1]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] || p2
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    d.push(`C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`)
  }

  return d.join(' ')
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function SmartRangeTrendChart({
  data = [],
  normalRange = { min: 0, max: 100 },
  criticalRange = {},
  title = 'Verlauf',
  unit = 'bpm',
  showTrend = true,
  showCurrentValue = true,
  showNormalRangeLabel = true,
  height = 320,
}) {
  const [activePoint, setActivePoint] = useState(null)

  const points = useMemo(() => {
    return data.map((point, index) => {
      const status = resolveStatus(point.value, normalRange, criticalRange, point.status)
      const previousValue = index > 0 ? data[index - 1].value : null
      const trend = formatTrend(point.value, previousValue)
      return {
        ...point,
        status,
        trend,
        previousValue,
      }
    })
  }, [data, normalRange, criticalRange])

  const latest = points[points.length - 1]
  const focused = activePoint !== null ? points[activePoint] : null
  const selectedPoint = focused || latest
  const trend = latest?.trend

  const minValue = useMemo(() => {
    const values = points.map((point) => point.value)
    const low = Math.min(normalRange.min, ...values)
    return Math.max(0, low - 8)
  }, [points, normalRange.min])

  const maxValue = useMemo(() => {
    const values = points.map((point) => point.value)
    const high = Math.max(normalRange.max, ...values)
    return Math.min(200, high + 8)
  }, [points, normalRange.max])

  const chartData = useMemo(() => {
    const width = 1000
    const padding = { top: 36, right: 28, bottom: 62, left: 34 }
    const innerWidth = width - padding.left - padding.right
    const innerHeight = height - padding.top - padding.bottom
    const steps = points.length > 1 ? points.length - 1 : 1
    const ratio = maxValue - minValue || 1

    const valueToY = (value) => padding.top + ((maxValue - value) / ratio) * innerHeight

    const mapped = points.map((point, index) => ({
      ...point,
      x: padding.left + (innerWidth / steps) * index,
      y: valueToY(point.value),
    }))

    return {
      width,
      height,
      padding,
      points: mapped,
      valueToY,
      normalTop: valueToY(normalRange.max),
      normalBottom: valueToY(normalRange.min),
    }
  }, [points, height, maxValue, minValue, normalRange.max, normalRange.min])

  const path = buildCurvePath(chartData.points)
  const areaPath = chartData.points.length
    ? `${path} L ${chartData.points[chartData.points.length - 1].x} ${height - chartData.padding.bottom} L ${chartData.points[0].x} ${height - chartData.padding.bottom} Z`
    : ''

  return (
    <article className="chart-card smart-chart-card" style={{ minHeight: `${height + 90}px` }}>
      <div className="smart-chart-overview">
        <div className="smart-chart-overview-left">
          <span className="smart-chart-title">{title}</span>
          {showCurrentValue && latest && (
            <div className="smart-chart-current-value">
              <strong>{latest.value}</strong>
              <span>{unit}</span>
            </div>
          )}
          {trend && showTrend && (
            <p className="smart-chart-trend-text">
              <span className={`smart-chart-trend-arrow ${trend.direction}`}>{trend.arrow}</span>
              {trend.percent} gegenüber letzter Messung
            </p>
          )}
        </div>
        <div className="smart-chart-overview-right">
          {latest && (
            <span className={`status-chip status-${latest.status}`}>{statusLabels[latest.status] || 'Unbekannt'}</span>
          )}
          {showNormalRangeLabel && (
            <p className="smart-chart-normal-range">
              Normalbereich: {normalRange.min}–{normalRange.max} {unit}
            </p>
          )}
          {selectedPoint?.timestamp && (
            <small className="smart-chart-update-time">Aktualisiert: {selectedPoint.timestamp}</small>
          )}
        </div>
      </div>
      <div className="smart-chart-plot">
        <svg viewBox={`0 0 ${chartData.width} ${height}`} preserveAspectRatio="none" className="smart-chart-svg">
          <defs>
            <linearGradient id="smart-chart-line-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#a26fff" />
              <stop offset="100%" stopColor="#5c4bd8" />
            </linearGradient>
            <linearGradient id="smart-chart-area-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(123, 97, 255, 0.18)" />
              <stop offset="100%" stopColor="rgba(123, 97, 255, 0)" />
            </linearGradient>
          </defs>
          <g className="smart-chart-grid">
            {[0, 1, 2, 3].map((index) => {
              const y = chartData.padding.top + ((height - chartData.padding.bottom - chartData.padding.top) / 3) * index
              return (
                <line
                  key={index}
                  x1={chartData.padding.left}
                  x2={chartData.width - chartData.padding.right}
                  y1={y}
                  y2={y}
                  className="smart-chart-grid-line"
                />
              )
            })}
          </g>
          <rect
            x={chartData.padding.left}
            y={Math.min(chartData.normalTop, chartData.normalBottom)}
            width={chartData.width - chartData.padding.left - chartData.padding.right}
            height={Math.max(0, chartData.normalBottom - chartData.normalTop)}
            className="smart-chart-normal-band"
          />
          <path className="smart-chart-area" d={areaPath} fill="url(#smart-chart-area-gradient)" />
          <path className="smart-chart-line" d={path} fill="none" stroke="url(#smart-chart-line-gradient)" />
          {chartData.points.map((point, index) => {
            const pointLabel = selectedPoint?.label === point.label
            return (
              <g key={point.label}>
                {point.status !== 'normal' && (
                  <circle
                    className={`smart-chart-spot-ring ${point.status === 'high' || point.status === 'critical-high' ? 'spot-high' : 'spot-low'}`}
                    cx={point.x}
                    cy={point.y}
                    r={point.status.includes('critical') ? 18 : 14}
                  />
                )}
                <circle
                  className={`smart-chart-point ${point.status === 'normal' ? 'point-normal' : point.status.includes('critical') ? 'point-critical' : 'point-abnormal'}`}
                  cx={point.x}
                  cy={point.y}
                  r={pointLabel ? 10 : 7}
                />
                {showCurrentValue && index === chartData.points.length - 1 && (
                  <g>
                    <line
                      x1={point.x}
                      y1={point.y + 12}
                      x2={point.x}
                      y2={height - chartData.padding.bottom + 8}
                      className="smart-chart-current-line"
                    />
                    <text x={point.x} y={point.y - 18} className="smart-chart-current-tag" textAnchor="middle">
                      Aktuell
                    </text>
                  </g>
                )}
                <circle
                  className="smart-chart-hit-area"
                  cx={point.x}
                  cy={point.y}
                  r="16"
                  tabIndex={0}
                  role="button"
                  aria-label={`${point.label}: ${point.value} ${unit}. Status: ${statusLabels[point.status]}.`}
                  onMouseEnter={() => setActivePoint(index)}
                  onMouseLeave={() => setActivePoint(null)}
                  onFocus={() => setActivePoint(index)}
                  onBlur={() => setActivePoint(null)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      setActivePoint(index)
                    }
                  }}
                />
              </g>
            )
          })}
        </svg>
        {selectedPoint && activePoint !== null && (
          <div
            className="smart-chart-tooltip"
            style={{
              left: `${clamp((selectedPoint.x / chartData.width) * 100, 8, 92)}%`,
              top: `${clamp((selectedPoint.y / height) * 100, 8, 78)}%`,
            }}
            role="tooltip"
          >
            <strong>{selectedPoint.label}</strong>
            <span>{selectedPoint.value} {unit}</span>
            <small>Status: {statusLabels[selectedPoint.status]}</small>
            <small>Normalbereich: {normalRange.min}–{normalRange.max} {unit}</small>
            {selectedPoint.value < normalRange.min && (
              <small>Abweichung: -{normalRange.min - selectedPoint.value} {unit}</small>
            )}
            {selectedPoint.value > normalRange.max && (
              <small>Abweichung: +{selectedPoint.value - normalRange.max} {unit}</small>
            )}
            {selectedPoint.trend && <small>Veränderung: {selectedPoint.trend.percent}</small>}
          </div>
        )}
        <div className="smart-chart-axis">
          {chartData.points.map((point) => (
            <span key={point.label}>{point.label}</span>
          ))}
        </div>
      </div>
    </article>
  )
}

export default SmartRangeTrendChart
