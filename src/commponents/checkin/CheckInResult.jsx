import { useState } from 'react'

const labelMap = {
  balanced: 'Ausgeglichen',
  calm: 'Ruhig',
  easy: 'Leicht',
  emotional_relief: 'Emotionale Entlastung',
  energy: 'Energie',
  exhausted: 'Erschöpft',
  focus: 'Fokus',
  grounding_focus: 'Erdung und Fokus',
  high: 'Hoch',
  low: 'Niedrig',
  medium: 'Mittel',
  motivation: 'Motivation',
  movement: 'Bewegung',
  movement_relaxation: 'Bewegung und Entspannung',
  neutral: 'Neutral',
  none: 'Keine',
  productivity: 'Produktivität',
  recovery: 'Erholung',
  relaxation: 'Entspannung',
  self_regulation: 'Selbstregulation',
  sleep_preparation: 'Schlafvorbereitung',
  sleep_reflection: 'Tagesabschluss',
  very_high: 'Sehr hoch',
  very_low: 'Sehr niedrig',
}

function readable(value) {
  if (!value) return ''
  return labelMap[value] || String(value)
}

function CheckInResult({ answers, isSaving, recommendations, saveError, onBackToDashboard, onRestart }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [startedTaskId, setStartedTaskId] = useState('')
  const [completedTaskIds, setCompletedTaskIds] = useState([])
  const activeRecommendation = recommendations[activeIndex]

  function showNextRecommendation() {
    setActiveIndex((index) => (index + 1) % recommendations.length)
    setStartedTaskId('')
  }

  function completeTask(taskId) {
    setCompletedTaskIds((taskIds) => (taskIds.includes(taskId) ? taskIds : [...taskIds, taskId]))
  }

  return (
    <section className="checkin-result-card">
      <p className="eyebrow">Meine Empfehlung</p>
      <h1>Dein Tages-Check-in ist fertig</h1>
      <p className="checkin-disclaimer">
        Diese Funktion ersetzt keine medizinische Beratung und stellt keine Diagnose. Die Empfehlungen sind einfache,
        regelbasierte Unterstützung für deinen Alltag.
      </p>

      <div className="checkin-summary-grid">
        <article>
          <span>Stress</span>
          <strong>{readable(answers.stress_level)}</strong>
        </article>
        <article>
          <span>Müdigkeit</span>
          <strong>{readable(answers.tiredness_level)}</strong>
        </article>
        <article>
          <span>Zeit</span>
          <strong>{answers.available_time_minutes} Min</strong>
        </article>
        <article>
          <span>Ziel</span>
          <strong>{readable(answers.support_goal)}</strong>
        </article>
      </div>

      {isSaving && <p className="checkin-status">Check-in wird gespeichert...</p>}
      {saveError && <p className="checkin-error">{saveError}</p>}

      <div className="checkin-recommendations">
        {activeRecommendation ? (
          <article className="checkin-recommendation" key={activeRecommendation.task.id}>
            <div>
              <span>
                {readable(activeRecommendation.task.category)} -{' '}
                {activeRecommendation.task.durationLabel || `${activeRecommendation.task.durationMinutes} Min`} -{' '}
                {readable(activeRecommendation.task.difficulty)}
              </span>
              <h2>{activeRecommendation.task.title}</h2>
              <p>{activeRecommendation.task.description}</p>
            </div>
            <p className="checkin-reason">{activeRecommendation.reason}</p>
            <ol>
              {activeRecommendation.task.instructions.map((instruction) => (
                <li key={instruction}>{instruction}</li>
              ))}
            </ol>
            {activeRecommendation.task.warning && <small>{activeRecommendation.task.warning}</small>}
            {completedTaskIds.includes(activeRecommendation.task.id) && (
              <p className="checkin-status">Aufgabe abgeschlossen.</p>
            )}
            <div className="checkin-actions">
              <button
                className="wide-button"
                onClick={() => setStartedTaskId(activeRecommendation.task.id)}
                type="button"
              >
                {startedTaskId === activeRecommendation.task.id ? 'Aufgabe läuft' : 'Aufgabe starten'}
              </button>
              <button
                className="secondary-button"
                disabled={
                  startedTaskId !== activeRecommendation.task.id ||
                  completedTaskIds.includes(activeRecommendation.task.id)
                }
                onClick={() => completeTask(activeRecommendation.task.id)}
                type="button"
              >
                Aufgabe abgeschlossen
              </button>
              {recommendations.length > 1 && (
                <button className="secondary-button" onClick={showNextRecommendation} type="button">
                  Andere passende Aufgabe
                </button>
              )}
            </div>
          </article>
        ) : (
          <article className="checkin-recommendation">
            <h2>Ruhig starten</h2>
            <p>
              Für diese Kombination wurde gerade keine passende Aufgabe gefunden. Starte mit einer kurzen Pause und
              prüfe danach, was sich realistisch anfühlt.
            </p>
          </article>
        )}
      </div>

      <div className="checkin-actions">
        <button className="secondary-button checkin-restart" onClick={onRestart} type="button">
          Check-in neu starten
        </button>
        <button className="primary-cta" onClick={onBackToDashboard} type="button">
          Zum Dashboard zurück
        </button>
      </div>
    </section>
  )
}

export default CheckInResult
