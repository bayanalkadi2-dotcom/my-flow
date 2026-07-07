import { useEffect, useMemo, useState } from 'react'
import { checkInQuestions } from '../../data/checkInQuestions'
import { getContextCheckInQuestion } from '../../config/userPersonalization'
import { useProfile } from '../../context/profileContextValue'
import { useCheckins } from '../../context/checkinContextValue'
import { getLocalDateKey } from '../../utils/checkins'
import { getDailyCheckIns, saveDailyCheckIn } from '../../services/checkInService'
import { getTaskById } from '../../data/wellbeingTasks'
import { buildCheckInSummary, getDailyActivityGuidance, recommendTasks } from '../../services/recommendationService'
import CheckInProgress from './CheckInProgress'
import CheckInQuestion from './CheckInQuestion'
import CheckInResult from './CheckInResult'

function DailyCheckIn({ onNavigate, user }) {
  const { personalization, profile } = useProfile()
  const { addCheckin, hasCheckin } = useCheckins()
  const [answers, setAnswers] = useState({})
  const [currentStep, setCurrentStep] = useState(0)
  const [hasConsent, setHasConsent] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [savedCheckIn, setSavedCheckIn] = useState(null)
  const [restoredRecommendationIds, setRestoredRecommendationIds] = useState([])
  const personalizedQuestions = useMemo(() => [
    ...checkInQuestions.slice(0, 2),
    getContextCheckInQuestion(profile),
    ...checkInQuestions.slice(2),
  ], [profile])
  const currentQuestion = personalizedQuestions[currentStep]
  const recommendationHistoryKey = `myflow-recent-recommendations-${user?.id ?? 'guest'}`
  const recentTaskIds = useMemo(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(recommendationHistoryKey) || '[]')
      return Array.isArray(stored) ? stored : []
    } catch {
      return []
    }
  }, [recommendationHistoryKey])
  const recommendations = useMemo(
    () => {
      if (!isComplete) return []
      if (restoredRecommendationIds.length > 0) {
        return restoredRecommendationIds
          .map(getTaskById)
          .filter(Boolean)
          .map((task) => ({ task, score: 0, reason: 'Passend zu deinem heutigen Check-in.' }))
      }
      return recommendTasks(answers, undefined, {
      studentStatus: personalization.status,
      excludeTaskIds: recentTaskIds,
      maxResults: 4,
      })
    },
    [answers, isComplete, personalization.status, recentTaskIds, restoredRecommendationIds],
  )

  useEffect(() => {
    if (!user?.id) return
    let cancelled = false

    getDailyCheckIns(user.id).then((result) => {
      if (cancelled || !result.success) return
      const today = result.checkIns.find((checkIn) => getLocalDateKey(checkIn.created_at) === getLocalDateKey())
      if (!today) return

      setAnswers({
        general_mood: today.general_mood,
        stress_level: today.stress_level,
        tiredness_level: today.tiredness_level,
        physical_energy: today.physical_energy,
        mental_energy: today.mental_energy,
        concentration_level: today.concentration_level,
        context_stressor: String(today.context_stressor || '').split(',').filter(Boolean),
        mood_tags: String(today.mood || '').split(',').filter(Boolean),
        available_time: String(today.available_time_minutes || 10),
        support_goal: String(today.support_goal || '').split(',').filter(Boolean),
      })
      setRestoredRecommendationIds(today.recommended_task_ids ?? [])
      setSavedCheckIn(today)
      setHasConsent(true)
      setIsComplete(true)
    })

    return () => {
      cancelled = true
    }
  }, [user?.id])

  function selectAnswer(questionId, value, multiple = false) {
    setAnswers((currentAnswers) => {
      if (!multiple) {
        return { ...currentAnswers, [questionId]: value }
      }

      const selectedValues = Array.isArray(currentAnswers[questionId]) ? currentAnswers[questionId] : []
      const nextValues = selectedValues.includes(value)
        ? selectedValues.filter((selectedValue) => selectedValue !== value)
        : [...selectedValues, value]

      return { ...currentAnswers, [questionId]: nextValues }
    })
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
    setRestoredRecommendationIds([])
  }

  async function finishCheckIn(nextAnswers) {
    setIsComplete(true)
    setIsSaving(true)
    setSaveError('')
    setSavedCheckIn(null)

    try {
      if (hasCheckin('daily-check-in', getLocalDateKey())) {
        setSavedCheckIn({ duplicate: true })
        return
      }

      const nextRecommendations = recommendTasks(nextAnswers, undefined, {
        studentStatus: personalization.status,
        excludeTaskIds: recentTaskIds,
        maxResults: 4,
      })
      const savedDailyCheckIn = await saveDailyCheckIn(nextAnswers, nextRecommendations)
      console.log('Check-in gespeichert:', savedDailyCheckIn)
      setSaveError('')
      setSavedCheckIn(savedDailyCheckIn)
      setRestoredRecommendationIds(nextRecommendations.map((recommendation) => recommendation.task.id))
      localStorage.setItem(
        recommendationHistoryKey,
        JSON.stringify([
          ...nextRecommendations.map((recommendation) => recommendation.task.id),
          ...recentTaskIds,
        ].slice(0, 16)),
      )
      addCheckin({
        id: savedDailyCheckIn.id,
        routineId: 'daily-check-in',
        title: 'Tages-Check-in',
        createdAt: savedDailyCheckIn.created_at,
        source: 'supabase',
      })
    } catch (error) {
      console.error('Check-in-Speicherfehler:', error)
      setSaveError(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  function continueCheckIn() {
    const currentAnswer = answers[currentQuestion.id]
    if (!currentAnswer || (Array.isArray(currentAnswer) && currentAnswer.length === 0)) {
      setSaveError('Bitte wähle eine Antwort aus.')
      return
    }

    setSaveError('')

    if (currentStep < personalizedQuestions.length - 1) {
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
          <h1>Wie geht es dir heute mit Studium, Lernen und Erholung?</h1>
          <p>Beantworte kurze Fragen. Deine Antworten werden gespeichert und für passende Empfehlungen genutzt.</p>
          <p className="checkin-disclaimer">
            Kein Ersatz für medizinische Beratung, Diagnose oder Therapie. Bei akuter Gefahr wird ein Hilfe-Hinweis angezeigt.
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
          key={savedCheckIn?.id ?? 'pending-checkin-result'}
          activityGuidance={getDailyActivityGuidance(answers)}
          answers={buildCheckInSummary(answers)}
          isSaving={isSaving}
          recommendations={recommendations}
          savedCheckIn={savedCheckIn}
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
      <CheckInProgress currentStep={currentStep} totalSteps={personalizedQuestions.length} />
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
        <button className="primary-cta" onClick={continueCheckIn} type="button">
          {currentStep === personalizedQuestions.length - 1 ? 'Auswerten' : 'Weiter'}
        </button>
      </div>
    </section>
  )
}

export default DailyCheckIn
