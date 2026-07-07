import { useState } from 'react'
import flowCharacter from '../../assets/flow-character-wall-final.jpg'
import { groundingExercise } from '../../data/groundingExercise'
import VoiceExercise from '../exercises/VoiceExercise'
import { updateDailyCheckInRecommendationState } from '../../services/checkInService'

const labelMap = {
  balanced: 'Ausgeglichen',
  calm: 'Ruhig',
  easy: 'Leicht',
  emotional_relief: 'Emotionale Entlastung',
  exam_stress: 'Prüfungsstress',
  energy: 'Energie',
  exhausted: 'Erschöpft',
  focus: 'Fokus',
  fatigue: 'Müdigkeit bewältigen',
  grounding_focus: 'Erdung und Fokus',
  high: 'Hoch',
  low: 'Niedrig',
  medium: 'Mittel',
  motivation: 'Motivation',
  movement: 'Bewegung',
  movement_relaxation: 'Bewegung und Entspannung',
  learning: 'Lernen',
  concentration: 'Konzentration',
  break: 'Pause',
  self_organization: 'Selbstorganisation',
  social_support: 'Soziale Unterstützung',
  small_success: 'Kleines Erfolgserlebnis',
  stress_reduction: 'Stress reduzieren',
  thought_organization: 'Gedanken ordnen',
  overwhelm_reduction: 'Überforderung reduzieren',
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

function CheckInResult({ activityGuidance, answers, isSaving, recommendations, savedCheckIn, saveError, onBackToDashboard, onRestart }) {
  const savedState = savedCheckIn?.recommendation_state ?? {}
  const [activeIndex, setActiveIndex] = useState(0)
  const [startedTaskId, setStartedTaskId] = useState(savedState.startedTaskId ?? '')
  const [completedTaskIds, setCompletedTaskIds] = useState(savedState.completedTaskIds ?? [])
  const [guidedStepIndex, setGuidedStepIndex] = useState(savedState.guidedStepIndex ?? 0)
  const activeRecommendation = recommendations[activeIndex]
  const isVoiceExerciseActive = activeRecommendation?.task.id === groundingExercise.id
    && startedTaskId === activeRecommendation.task.id

  function persistRecommendationState(updates) {
    if (!savedCheckIn?.id) return
    updateDailyCheckInRecommendationState(savedCheckIn.id, {
      startedTaskId,
      completedTaskIds,
      guidedStepIndex,
      ...updates,
    })
  }

  function showNextRecommendation() {
    setActiveIndex((index) => (index + 1) % recommendations.length)
    setStartedTaskId('')
    setGuidedStepIndex(0)
  }

  function completeTask(taskId) {
    setCompletedTaskIds((taskIds) => {
      const nextIds = taskIds.includes(taskId) ? taskIds : [...taskIds, taskId]
      persistRecommendationState({ completedTaskIds: nextIds, startedTaskId: taskId })
      return nextIds
    })
  }

  function restartTask(taskId) {
    setCompletedTaskIds((taskIds) => {
      const nextIds = taskIds.filter((currentTaskId) => currentTaskId !== taskId)
      persistRecommendationState({ completedTaskIds: nextIds, guidedStepIndex: 0 })
      return nextIds
    })
  }

  function startTask(taskId) {
    setStartedTaskId(taskId)
    setGuidedStepIndex(0)
    persistRecommendationState({ startedTaskId: taskId, guidedStepIndex: 0 })
  }

  function completeGuidedStep() {
    const instructions = activeRecommendation?.task.instructions ?? []

    if (guidedStepIndex < instructions.length - 1) {
      setGuidedStepIndex((index) => {
        const nextIndex = index + 1
        persistRecommendationState({ guidedStepIndex: nextIndex })
        return nextIndex
      })
      return
    }

    if (activeRecommendation) completeTask(activeRecommendation.task.id)
  }

  return (
    <section className="checkin-result-card">
      <p className="eyebrow">Meine Empfehlung</p>
      <h1>Dein Tages-Check-in ist fertig</h1>
      <p className="checkin-disclaimer">
        Die Empfehlungen dienen nur zur Orientierung und ersetzen keine medizinische Beratung oder Diagnose.
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

      {activityGuidance && (
        <div className="checkin-activity-guidance">
          <article data-level={activityGuidance.learning.level}>
            <strong>Lernen</strong>
            <p>{activityGuidance.learning.text}</p>
          </article>
          <article data-level={activityGuidance.movement.level}>
            <strong>Bewegung und Sport</strong>
            <p>{activityGuidance.movement.text}</p>
          </article>
        </div>
      )}

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
            {!isVoiceExerciseActive && <ol>
              {activeRecommendation.task.instructions.map((instruction) => (
                <li key={instruction}>{instruction}</li>
              ))}
            </ol>}
            {isVoiceExerciseActive && (
              <VoiceExercise
                onComplete={() => completeTask(activeRecommendation.task.id)}
                onDashboard={onBackToDashboard}
                onExit={() => setStartedTaskId('')}
                onRestart={() => restartTask(activeRecommendation.task.id)}
              />
            )}
            {startedTaskId === activeRecommendation.task.id
              && activeRecommendation.task.id !== groundingExercise.id
              && !completedTaskIds.includes(activeRecommendation.task.id) && (
              <section className="task-companion" aria-live="polite">
                <div className="task-companion-header">
                  <img src={flowCharacter} alt="Flow begleitet dich bei der Übung" />
                  <div>
                    <span>ICH BLEIBE BEI DIR</span>
                    <h3>Wir machen das Schritt für Schritt.</h3>
                    <p>Du musst gerade nichts anderes schaffen.</p>
                  </div>
                </div>
                <div
                  className="task-companion-progress"
                  aria-label={`Schritt ${guidedStepIndex + 1} von ${activeRecommendation.task.instructions.length}`}
                >
                  <span style={{ width: `${((guidedStepIndex + 1) / activeRecommendation.task.instructions.length) * 100}%` }} />
                </div>
                <div className="task-companion-step">
                  <span>Schritt {guidedStepIndex + 1} von {activeRecommendation.task.instructions.length}</span>
                  <strong>{activeRecommendation.task.instructions[guidedStepIndex]}</strong>
                </div>
                <button className="wide-button" onClick={completeGuidedStep} type="button">
                  {guidedStepIndex === activeRecommendation.task.instructions.length - 1
                    ? 'Übung gemeinsam abschließen'
                    : 'Schritt geschafft'}
                </button>
              </section>
            )}
            {activeRecommendation.task.warning && <small>{activeRecommendation.task.warning}</small>}
            {completedTaskIds.includes(activeRecommendation.task.id) && !isVoiceExerciseActive && (
              <p className="checkin-status">Aufgabe abgeschlossen.</p>
            )}
            {!isVoiceExerciseActive && <div className="checkin-actions">
              <button
                className="wide-button"
                onClick={() => startTask(activeRecommendation.task.id)}
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
            </div>}
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
        {recommendations.length > 1 && (
          <div className="checkin-alternatives" aria-label="Weitere passende Empfehlungen">
            <span>Weitere passende Aufgaben</span>
            {recommendations.map((recommendation, index) => (
              index !== activeIndex && (
                <button key={recommendation.task.id} onClick={() => {
                  setActiveIndex(index)
                  setStartedTaskId('')
                  setGuidedStepIndex(0)
                }} type="button">
                  <strong>{recommendation.task.title}</strong>
                  <small>{recommendation.task.durationLabel}</small>
                </button>
              )
            ))}
          </div>
        )}
      </div>

      {!isVoiceExerciseActive && <div className="checkin-actions">
        <button className="secondary-button checkin-restart" onClick={onRestart} type="button">
          Check-in neu starten
        </button>
        <button className="primary-cta" onClick={onBackToDashboard} type="button">
          Zum Dashboard zurück
        </button>
      </div>}
    </section>
  )
}

export default CheckInResult
