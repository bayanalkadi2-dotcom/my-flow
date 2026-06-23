function CheckInProgress({ currentStep, totalSteps }) {
  const progress = Math.round(((currentStep + 1) / totalSteps) * 100)

  return (
    <div className="checkin-progress" aria-label={`Schritt ${currentStep + 1} von ${totalSteps}`}>
      <div className="checkin-progress-meta">
        <span>Schritt {currentStep + 1} von {totalSteps}</span>
        <strong>{progress}%</strong>
      </div>
      <div className="checkin-progress-track">
        <span style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}

export default CheckInProgress
