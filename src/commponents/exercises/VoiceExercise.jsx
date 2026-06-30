import { useState } from 'react'
import flowCharacter from '../../assets/flow-character-wall-final.jpg'
import { groundingExercise, evaluateGroundingAnswer } from '../../data/groundingExercise'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'
import { speakText, stopSpeaking } from '../../utils/speechSynthesis'

function VoiceExercise({ onComplete, onDashboard, onExit, onRestart }) {
  const {
    isSupported,
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition()
  const [hasStarted, setHasStarted] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [writtenAnswer, setWrittenAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const currentStep = groundingExercise.steps[currentStepIndex]
  const answer = writtenAnswer.trim() || transcript.trim()
  const speechOutputSupported = typeof window !== 'undefined'
    && 'speechSynthesis' in window
    && Boolean(window.SpeechSynthesisUtterance)

  function beginExercise() {
    setHasStarted(true)
    setFeedback('')
    speakText(currentStep.prompt)
  }

  function beginListening() {
    resetTranscript()
    setWrittenAnswer('')
    setFeedback('')
    startListening()
  }

  function confirmAnswer() {
    const result = evaluateGroundingAnswer(answer, currentStep.expectedCount)
    setFeedback(result.feedback)

    if (!result.isEnough) {
      speakText(result.feedback)
      return
    }

    if (currentStepIndex === groundingExercise.steps.length - 1) {
      stopListening()
      setIsComplete(true)
      onComplete?.()
      speakText(groundingExercise.completionText)
      return
    }

    const nextStep = groundingExercise.steps[currentStepIndex + 1]
    const nextFeedback = `${result.feedback} ${nextStep.prompt}`
    setCurrentStepIndex((index) => index + 1)
    setWrittenAnswer('')
    resetTranscript()
    setFeedback(nextFeedback)
    speakText(nextFeedback)
  }

  function repeatPrompt() {
    speakText(currentStep.prompt)
  }

  function exitExercise() {
    stopListening()
    stopSpeaking()
    onExit?.()
  }

  function restartExercise() {
    stopListening()
    stopSpeaking()
    resetTranscript()
    setCurrentStepIndex(0)
    setWrittenAnswer('')
    setFeedback('')
    setIsComplete(false)
    setHasStarted(true)
    onRestart?.()
    speakText(groundingExercise.steps[0].prompt)
  }

  if (!hasStarted) {
    return (
      <section className="voice-exercise voice-exercise-privacy">
        <div className="voice-exercise-guide">
          <img src={flowCharacter} alt="Flow begleitet dich bei der Übung" />
          <div>
            <span>SPRACHGEFÜHRTE ÜBUNG</span>
            <h3>Ich bleibe während der Übung bei dir.</h3>
          </div>
        </div>
        <p>
          Für diese Übung wird dein Mikrofon nur während der Spracheingabe verwendet. Deine Aufnahme wird nicht in
          der App gespeichert.
        </p>
        <small>Auch der erkannte Text wird nicht dauerhaft gespeichert oder an Supabase gesendet.</small>
        <button className="wide-button" onClick={beginExercise} type="button">Übung starten</button>
      </section>
    )
  }

  if (isComplete) {
    return (
      <section className="voice-exercise voice-exercise-complete" aria-live="polite">
        <img src={flowCharacter} alt="Flow freut sich mit dir über die abgeschlossene Übung" />
        <span>GESCHAFFT</span>
        <h3>Aufgabe abgeschlossen</h3>
        <p>{groundingExercise.completionText}</p>
        <div className="voice-exercise-actions">
          <button className="secondary-button" onClick={restartExercise} type="button">Noch einmal durchführen</button>
          <button className="primary-cta" onClick={onDashboard} type="button">Zum Dashboard</button>
        </div>
      </section>
    )
  }

  return (
    <section className="voice-exercise" aria-live="polite">
      <div className="voice-exercise-guide">
        <img src={flowCharacter} alt="Flow begleitet dich bei der Übung" />
        <div>
          <span>ICH BIN BEI DIR · {currentStepIndex + 1} VON {groundingExercise.steps.length}</span>
          <h3>{currentStep.prompt}</h3>
        </div>
      </div>

      <div className="voice-exercise-progress" aria-hidden="true">
        <span style={{ width: `${((currentStepIndex + 1) / groundingExercise.steps.length) * 100}%` }} />
      </div>

      <button
        className={`voice-microphone-button ${isListening ? 'listening' : ''}`}
        disabled={!isSupported || isListening}
        onClick={beginListening}
        type="button"
        aria-pressed={isListening}
      >
        <span aria-hidden="true">{isListening ? '●' : '🎙'}</span>
        {isListening ? 'Ich höre zu …' : 'Mit Mikrofon antworten'}
      </button>

      {!isSupported && (
        <p className="voice-exercise-notice">
          Die Spracheingabe wird in diesem Browser nicht unterstützt. Du kannst deine Antwort schreiben.
        </p>
      )}
      {error && <p className="voice-exercise-error">{error}</p>}

      <div className="voice-transcript" aria-label="Erkannter Text">
        <span>Erkannter Text</span>
        <output>{transcript || 'Noch nichts erkannt.'}</output>
      </div>

      <label className="voice-answer-field">
        Antwort alternativ schreiben
        <textarea
          rows="3"
          value={writtenAnswer}
          onChange={(event) => setWrittenAnswer(event.target.value)}
          placeholder="Trenne die Dinge zum Beispiel mit Kommas oder ‚und‘."
        />
      </label>

      {feedback && <p className="voice-exercise-feedback">{feedback}</p>}

      <div className="voice-exercise-actions">
        <button className="primary-cta" disabled={isListening} onClick={confirmAnswer} type="button">
          Antwort bestätigen
        </button>
        <button className="secondary-button" disabled={!isSupported || isListening} onClick={beginListening} type="button">
          Noch einmal sprechen
        </button>
        <button className="secondary-button" disabled={!speechOutputSupported} onClick={repeatPrompt} type="button">
          Sprachausgabe wiederholen
        </button>
        <button className="secondary-button" onClick={exitExercise} type="button">Übung beenden</button>
      </div>
    </section>
  )
}

export default VoiceExercise
