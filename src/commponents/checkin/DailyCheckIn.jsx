import { useMemo, useState } from 'react'
import { checkInQuestions } from '../../data/checkInQuestions'
import { saveDailyCheckIn } from '../../services/checkInService'
import { buildCheckInSummary, recommendTasks } from '../../services/recommendationService'
import CheckInProgress from './CheckInProgress'
import CheckInQuestion from './CheckInQuestion'
import CheckInResult from './CheckInResult'

function DailyCheckIn({ onNavigate, user }) {
  const [answers, setAnswers] = useState({})
  const [currentStep, setCurrentStep] = useState(0)
  const [hasConsent, setHasConsent] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [savedCheckIn, setSavedCheckIn] = useState(null)
  const currentQuestion = checkInQuestions[currentStep]
  const recommendations = useMemo(
    () => (isComplete ? recommendTasks(answers) : []),
    [answers, isComplete],
  )

  function selectAnswer(questionId, value) {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: value,
    }))
  }

  function goBack() {
    setSaveError('')
    setCurrentStep((step) => Math.max(step - 1, 0))
  }

  function cancelCheckIn() {
    setAnswers({})
    setCurrentStep(0)
    setIsComplete(false)
    setSaveError('')
  }

  async function finishCheckIn(nextAnswers) {
    setIsComplete(true)
    setIsSaving(true)
    setSaveError('')
    setSavedCheckIn(null)

    try {
      const nextRecommendations = recommendTasks(nextAnswers)
      const savedDailyCheckIn = await saveDailyCheckIn(nextAnswers, nextRecommendations)
      console.log('Check-in gespeichert:', savedDailyCheckIn)
      setSaveError('')
      setSavedCheckIn(savedDailyCheckIn)
    } catch (error) {
      console.error('Check-in-Speicherfehler:', error)
      setSaveError(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  function continueCheckIn() {
    if (!answers[currentQuestion.id]) {
      setSaveError('Bitte wähle eine Antwort aus.')
      return
    }

    setSaveError('')

    if (currentStep < checkInQuestions.length - 1) {
      setCurrentStep((step) => step + 1)
      return
    }

    finishCheckIn(answers)
  }

  if (!user) {
    return (
      <section className="screen checkin-screen">
        <div className="checkin-intro-card">
          <p className="eyebrow">Tages-Check-in</p>
          <h1>Bitte melde dich an</h1>
          <p>Der Tages-Check-in speichert sensible persönliche Angaben und ist deshalb nur angemeldet nutzbar.</p>
        </div>
      </section>
    )
  }

  if (!hasConsent) {
    return (
      <section className="screen checkin-screen">
        <div className="checkin-intro-card">
          <p className="eyebrow">Tages-Check-in</p>
          <h1>Wie geht es dir heute?</h1>
          <p>
            MyFlow stellt dir Schritt für Schritt kurze Fragen und speichert deine Antworten in deinem Konto, damit
            passende Empfehlungen angezeigt werden können.
          </p>
          <p className="checkin-disclaimer">
            Die Funktion ersetzt keine medizinische Beratung, stellt keine Diagnose und gibt keine therapeutischen
            Aussagen. Bei akuter Gefahr wird später ein sicherer Hilfe-Hinweis ergänzt.
          </p>
          <button className="primary-cta" onClick={() => setHasConsent(true)} type="button">
            Check-in starten
          </button>
        </div>
      </section>
    )
  }

  if (isComplete) {
    return (
      <section className="screen checkin-screen">
        <CheckInResult
          answers={buildCheckInSummary(answers)}
          isSaving={isSaving}
          recommendations={recommendations}
          savedCheckIn={savedCheckIn}
          saveError={saveError}
          onBackToDashboard={() => onNavigate?.('dashboard')}
          onRestart={cancelCheckIn}
        />
      </section>
    )
  }

  return (
    <section className="screen checkin-screen">
      <CheckInProgress currentStep={currentStep} totalSteps={checkInQuestions.length} />
      <CheckInQuestion
        question={currentQuestion}
        selectedValue={answers[currentQuestion.id]}
        onSelect={selectAnswer}
      />
      {saveError && <p className="checkin-error">{saveError}</p>}
      <div className="checkin-actions">
        <button className="secondary-button" disabled={currentStep === 0} onClick={goBack} type="button">
          Zurück
        </button>
        <button className="secondary-button" onClick={cancelCheckIn} type="button">
          Abbrechen
        </button>
        <button className="primary-cta" onClick={continueCheckIn} type="button">
          {currentStep === checkInQuestions.length - 1 ? 'Auswerten' : 'Weiter'}
        </button>
      </div>
    </section>
  )
}

export default DailyCheckIn
