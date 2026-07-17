function CheckInProgress({ currentStep, totalSteps, label = 'Schritt {current} von {total}' }) {
  const progress = Math.round(((currentStep + 1) / totalSteps) * 100)
  const progressLabel = label.replace('{current}', currentStep + 1).replace('{total}', totalSteps)

  return (
    <div className="checkin-progress" aria-label={progressLabel}>
      <div className="checkin-progress-meta">
        <span>{progressLabel}</span>
        <strong>{progress}%</strong>
      </div>
      <div className="checkin-progress-track">
        <span style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}

export default CheckInProgress
