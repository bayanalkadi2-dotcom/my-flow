import { useEffect, useMemo, useRef, useState } from 'react'
import { getContextCheckInQuestion } from '../../config/userPersonalization'
import { useId } from 'react'
import { useCheckins } from '../../context/checkinContextValue'
import { useProfile } from '../../context/profileContextValue'
import { checkInQuestions } from '../../data/checkInQuestions'
import { getTaskById } from '../../data/wellbeingTasks'
import { saveDailyCheckIn } from '../../services/checkInService'
import { buildCheckInSummary, recommendTasks } from '../../services/recommendationService'
import { CHATBOT_UNAVAILABLE_MESSAGE, sendAiChatMessage } from '../../services/aiChatService'
import { getLocalDateKey } from '../../utils/checkins'
import CheckInProgress from './CheckInProgress'

const CHECKIN_COPY = {
  german: { history: 'Verlauf', noHistory: 'Noch keine alten Chats.', saved: 'Check-in gespeichert', freeChat: 'Freier Chat', freeText: 'Schreib mir einfach, wobei ich dir helfen soll.', placeholder: 'Frag deinen MyFlow Coach...', send: 'Senden', home: 'Home', start: 'Check-in starten', newCheckin: 'Neuer Check-in', phase: 'Phase 1', phaseText: 'Ich starte mit deinem kurzen Tages-Check-in. Danach kannst du mir frei schreiben.', back: 'Zurück', evaluate: 'Auswerten', next: 'Weiter', progress: 'Schritt {current} von {total}' },
  english: { history: 'History', noHistory: 'No previous chats.', saved: 'Check-in saved', freeChat: 'Free chat', freeText: 'Just tell me what I can help you with.', placeholder: 'Ask your MyFlow Coach...', send: 'Send', home: 'Home', start: 'Start check-in', newCheckin: 'New check-in', phase: 'Phase 1', phaseText: 'I will start with your short daily check-in. Afterwards, you can chat freely with me.', back: 'Back', evaluate: 'Evaluate', next: 'Next', progress: 'Step {current} of {total}' },
  turkish: { history: 'Geçmiş', noHistory: 'Henüz eski sohbet yok.', saved: 'Kontrol kaydedildi', freeChat: 'Serbest sohbet', freeText: 'Sana nasıl yardımcı olabileceğimi yaz.', placeholder: 'MyFlow Koçuna sor...', send: 'Gönder', home: 'Ana sayfa', start: 'Kontrolü başlat', newCheckin: 'Yeni kontrol', phase: 'Aşama 1', phaseText: 'Kısa günlük kontrolünle başlayacağım. Ardından benimle serbestçe yazışabilirsin.', back: 'Geri', evaluate: 'Değerlendir', next: 'İleri', progress: 'Adım {current} / {total}' },
  arabic: { history: 'السجل', noHistory: 'لا توجد محادثات سابقة.', saved: 'تم حفظ تسجيل الدخول', freeChat: 'محادثة حرة', freeText: 'اكتب لي ببساطة كيف يمكنني مساعدتك.', placeholder: 'اسأل مدرب MyFlow...', send: 'إرسال', home: 'الرئيسية', start: 'بدء تسجيل الحالة', newCheckin: 'تسجيل جديد', phase: 'المرحلة 1', phaseText: 'سأبدأ بتسجيل قصير لحالتك اليومية، وبعد ذلك يمكنك الكتابة لي بحرية.', back: 'رجوع', evaluate: 'تقييم', next: 'متابعة', progress: 'الخطوة {current} من {total}' },
}

const TURKISH_QUESTIONS = {
  general_mood: ['Genel durum', 'Bugün nasıl hissediyorsun?', { very_bad: 'çok kötü', bad: 'kötü', neutral: 'normal', good: 'iyi', very_good: 'çok iyi' }],
  stress_level: ['Stres', 'Bugün çok stres yaşadın mı?', { none: 'stres yok', low: 'az stres', medium: 'orta', high: 'çok stres', very_high: 'aşırı stres' }],
  tiredness_level: ['Yorgunluk', 'Kendini ne kadar yorgun hissediyorsun?', { none: 'hiç yorgun değilim', low: 'biraz yorgunum', medium: 'orta', high: 'çok yorgunum', exhausted: 'bitkinim' }],
  physical_energy: ['Fiziksel enerji', 'Fiziksel olarak ne kadar dinç hissediyorsun?', { very_low: 'çok güçsüz', low: 'biraz güçsüz', medium: 'normal', high: 'dinç', very_high: 'çok dinç' }],
  mental_energy: ['Zihinsel enerji', 'Şu anda ne kadar zihinsel gücün var?', { none: 'hiç gücüm yok', low: 'az gücüm var', medium: 'orta', high: 'çok gücüm var', very_high: 'çok fazla gücüm var' }],
  concentration_level: ['Konsantrasyon', 'Şu anda ne kadar iyi odaklanabiliyorsun?', { none: 'hiç', low: 'kötü', medium: 'orta', high: 'iyi', very_high: 'çok iyi' }],
  mood_tags: ['Ruh hali', 'Bugün seni en iyi hangi ruh hali anlatıyor?', { calm: 'sakin', tense: 'gergin', sad: 'üzgün', irritated: 'sinirli', motivated: 'motive', overwhelmed: 'bunalmış', balanced: 'dengeli' }],
  available_time: ['Uygun zaman', 'Bugün ne kadar zaman ayırmak istiyorsun?', { 2: '2 dakika', 5: '5 dakika', 10: '10 dakika', 15: '15 dakika', 20: '20 dakika veya daha fazla' }],
  support_goal: ['Destek türü', 'Şu anda sana en çok ne yardımcı olur?', { relaxation: 'rahatlama', movement: 'hareket', focus: 'odaklanma', motivation: 'motivasyon', emotional_relief: 'duygusal rahatlama', energy: 'enerji', sleep_preparation: 'uykuya hazırlık' }],
}

function localizeQuestion(question, languageStyle) {
  if (languageStyle !== 'turkish') return question
  const translated = TURKISH_QUESTIONS[question.id]
  if (!translated) return question
  return { ...question, label: translated[0], question: translated[1], options: question.options.map((option) => ({ ...option, label: translated[2][option.value] ?? option.label })) }
}

function getAnswerLabel(question, answer) {
  const values = Array.isArray(answer) ? answer : [answer].filter(Boolean)
  return values
    .map((value) => question.options.find((option) => option.value === value)?.label || value)
    .join(', ')
}

function getSelectedValues(question, answer) {
  return question.multiple ? (Array.isArray(answer) ? answer : []) : [answer].filter(Boolean)
}

function getTodayNote(calendarNotes) {
  const entry = calendarNotes[getLocalDateKey()]
  return typeof entry === 'object' ? String(entry.text || '').trim() : String(entry || '').trim()
}

function createChatContext({ answers, recommendations, habits, accountProfile, calendarNotes, profileName }) {
  return {
    name: profileName && profileName !== 'Gast' ? profileName : 'du',
    goals: String(accountProfile.goals || '').trim(),
    dailyRoutine: String(accountProfile.dailyRoutine || '').trim(),
    todayNote: getTodayNote(calendarNotes),
    openHabits: habits
      .filter((habit) => !habit.done && Number(habit.progress || 0) < 100)
      .slice(0, 4)
      .map((habit) => habit.displayTitle || habit.title),
    doneHabits: habits
      .filter((habit) => habit.done || Number(habit.progress || 0) >= 100)
      .slice(0, 4)
      .map((habit) => habit.displayTitle || habit.title),
    checkIn: buildCheckInSummary(answers),
    recommendations: recommendations.slice(0, 3).map((recommendation) => recommendation.task.title),
  }
}

function buildSummaryText(answers) {
  const summary = buildCheckInSummary(answers)
  const getLabel = (questionId, value) => {
    const question = checkInQuestions.find((item) => item.id === questionId)
    return question?.options.find((option) => option.value === value)?.label || value || 'nicht angegeben'
  }

  return [
    `Stress: ${getLabel('stress_level', summary.stress_level)}`,
    `Energie: ${getLabel('mental_energy', summary.mental_energy || summary.physical_energy)}`,
    `Konzentration: ${getLabel('concentration_level', summary.concentration_level)}`,
    `Zeit: ${summary.available_time_minutes || 10} Minuten`,
  ].join(' · ')
}

function formatChatText(text) {
  return String(text || '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/(^|\s)(\d+\.)\s+/g, '\n$2 ')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function readChatHistory(storageKey) {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || '[]')
    return Array.isArray(stored) ? stored : []
  } catch {
    return []
  }
}

function formatChatDate(value) {
  try {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))
  } catch {
    return 'Alter Chat'
  }
}

function DailyCheckIn({
  accountProfile = {},
  calendarNotes = {},
  habits = [],
  onNavigate,
  profileName = 'Gast',
  t,
  languageStyle = 'german',
  user,
}) {
  const arabic = t?.nav?.dashboard === 'الرئيسية'
  const copy = arabic ? {
    history: 'السجل', noHistory: 'لا توجد محادثات سابقة.', saved: 'تم حفظ تسجيل الدخول', ai: 'ذكاء MyFlow الاصطناعي', signIn: 'يرجى تسجيل الدخول', signInText: 'يحفظ تسجيل الدخول بالذكاء الاصطناعي بيانات شخصية حساسة، لذلك لا يمكن استخدامه إلا بعد تسجيل الدخول.'
  } : null
  const ui = CHECKIN_COPY[languageStyle] ?? CHECKIN_COPY.german
  const { personalization, profile } = useProfile()
  const { addCheckin, hasCheckin } = useCheckins()
  const [answers, setAnswers] = useState({})
  const [currentStep, setCurrentStep] = useState(0)
  const [hasConsent, setHasConsent] = useState(true)
  const [isComplete, setIsComplete] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [restoredRecommendationIds, setRestoredRecommendationIds] = useState([])
  const [freeMessages, setFreeMessages] = useState([])
  const [freeDraft, setFreeDraft] = useState('')
  const [isReplyLoading, setIsReplyLoading] = useState(false)
  const [chatError, setChatError] = useState('')
  const chatHistoryKey = `myflow-ai-chat-history-${user?.id ?? 'guest'}`
  const [chatHistory, setChatHistory] = useState(() => readChatHistory(chatHistoryKey))
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [viewedChat, setViewedChat] = useState(null)
  const chatEndRef = useRef(null)
  const generatedChatId = useId()
  const activeChatIdRef = useRef(`chat-${generatedChatId}`)

  const personalizedQuestions = useMemo(() => [
    ...checkInQuestions.slice(0, 2),
    getContextCheckInQuestion(profile),
    ...checkInQuestions.slice(2),
  ].map((question) => localizeQuestion(question, languageStyle)), [languageStyle, profile])
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
  const recommendations = useMemo(() => {
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
  }, [answers, isComplete, personalization.status, recentTaskIds, restoredRecommendationIds])

  useEffect(() => {
    if (!isComplete) return
    if (typeof chatEndRef.current?.scrollIntoView !== 'function') return
    chatEndRef.current.scrollIntoView({ behavior: isReplyLoading ? 'auto' : 'smooth', block: 'end' })
  }, [freeMessages, isReplyLoading, isComplete])

  function selectAnswer(questionId, value, multiple = false) {
    setAnswers((currentAnswers) => {
      if (!multiple) return { ...currentAnswers, [questionId]: value }

      const selectedValues = Array.isArray(currentAnswers[questionId]) ? currentAnswers[questionId] : []
      const nextValues = selectedValues.includes(value)
        ? selectedValues.filter((selectedValue) => selectedValue !== value)
        : [...selectedValues, value]

      return { ...currentAnswers, [questionId]: nextValues }
    })
  }

  function goBack() {
    setSaveError('')
    if (currentStep === 0) {
      onNavigate?.('dashboard')
      return
    }

    setCurrentStep((step) => Math.max(step - 1, 0))
  }

  function restartCheckIn() {
    activeChatIdRef.current = `chat-${Date.now()}`
    setHasConsent(true)
    setAnswers({})
    setCurrentStep(0)
    setIsComplete(false)
    setSaveError('')
    setRestoredRecommendationIds([])
    setFreeMessages([])
    setFreeDraft('')
    setChatError('')
    setViewedChat(null)
  }

  function startDirectChat() {
    activeChatIdRef.current = `chat-${Date.now()}`
    setHasConsent(true)
    setAnswers({})
    setCurrentStep(0)
    setIsComplete(true)
    setIsSaving(false)
    setSaveError('')
    setRestoredRecommendationIds([])
    setFreeMessages([])
    setFreeDraft('')
    setChatError('')
    setViewedChat(null)
  }

  function saveChatToHistory({ nextAnswers = answers, nextMessages = freeMessages, nextRecommendations = recommendations } = {}) {
    const hasAnswers = Object.values(nextAnswers).some((answer) => Array.isArray(answer) ? answer.length : answer)
    if (!hasAnswers && !nextMessages.length) return

    const now = new Date().toISOString()
    const snapshot = {
      id: activeChatIdRef.current,
      title: `KI-Chat ${formatChatDate(now)}`,
      createdAt: now,
      answers: nextAnswers,
      recommendationIds: nextRecommendations.slice(0, 3).map((recommendation) => recommendation.task.id),
      messages: nextMessages,
    }

    setChatHistory((currentHistory) => {
      const nextHistory = [
        snapshot,
        ...currentHistory.filter((chat) => chat.id !== snapshot.id),
      ].slice(0, 20)
      localStorage.setItem(chatHistoryKey, JSON.stringify(nextHistory))
      return nextHistory
    })
  }

  async function finishCheckIn(nextAnswers) {
    setIsComplete(true)
    setIsSaving(true)
    setSaveError('')

    try {
      if (hasCheckin('daily-check-in', getLocalDateKey())) {
        saveChatToHistory({
          nextAnswers,
          nextRecommendations: recommendTasks(nextAnswers, undefined, {
            studentStatus: personalization.status,
            excludeTaskIds: recentTaskIds,
            maxResults: 4,
          }),
        })
        return
      }

      const nextRecommendations = recommendTasks(nextAnswers, undefined, {
        studentStatus: personalization.status,
        excludeTaskIds: recentTaskIds,
        maxResults: 4,
      })
      const savedDailyCheckIn = await saveDailyCheckIn(nextAnswers, nextRecommendations)
      setRestoredRecommendationIds(nextRecommendations.map((recommendation) => recommendation.task.id))
      saveChatToHistory({ nextAnswers, nextRecommendations })
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

  function advanceCheckIn(nextAnswers) {
    setSaveError('')
    if (currentStep < personalizedQuestions.length - 1) {
      setCurrentStep((step) => step + 1)
      return
    }

    finishCheckIn(nextAnswers)
  }

  function selectChatAnswer(question, option) {
    if (question.multiple) {
      selectAnswer(question.id, option.value, true)
      return
    }

    const nextAnswers = { ...answers, [question.id]: option.value }
    setAnswers(nextAnswers)
    advanceCheckIn(nextAnswers)
  }

  function continueCheckIn() {
    const currentAnswer = answers[currentQuestion.id]
    if (!currentAnswer || (Array.isArray(currentAnswer) && currentAnswer.length === 0)) {
      setSaveError('Bitte wähle eine Antwort aus.')
      return
    }

    advanceCheckIn(answers)
  }

  async function sendFreeMessage() {
    const cleanMessage = freeDraft.trim()
    if (!cleanMessage || isReplyLoading) return

    const nextMessages = [...freeMessages, { role: 'user', text: cleanMessage }]
    setFreeMessages(nextMessages)
    saveChatToHistory({ nextMessages })
    setFreeDraft('')
    setChatError('')
    setIsReplyLoading(true)

    try {
      const reply = await sendAiChatMessage({
        messages: nextMessages,
        context: createChatContext({
          answers,
          recommendations,
          habits,
          accountProfile,
          calendarNotes,
          profileName,
        }),
      })
      const answeredMessages = [...nextMessages, { role: 'assistant', text: reply }]
      setFreeMessages(answeredMessages)
      saveChatToHistory({ nextMessages: answeredMessages })
    } catch {
      setChatError(CHATBOT_UNAVAILABLE_MESSAGE)
    } finally {
      setIsReplyLoading(false)
    }
  }

  function renderAnsweredQuestions() {
    return personalizedQuestions.slice(0, currentStep).map((question) => (
      <div className="checkin-chat-pair" key={question.id}>
        <article className="checkin-chat-bubble assistant">
          <span>{question.label}</span>
          <p>{question.question}</p>
        </article>
        <article className="checkin-chat-bubble user">
          <p>{getAnswerLabel(question, answers[question.id])}</p>
        </article>
      </div>
    ))
  }

  function renderHistoryButton() {
    return (
      <div className="ai-chat-history">
        <button className="ai-chat-history-toggle" onClick={() => setIsHistoryOpen((open) => !open)} type="button">
          {copy?.history ?? ui.history}
          {chatHistory.length > 0 && <span>{chatHistory.length}</span>}
        </button>
        {isHistoryOpen && (
          <div className="ai-chat-history-menu">
            {chatHistory.length === 0 ? (
              <p>{copy?.noHistory ?? ui.noHistory}</p>
            ) : chatHistory.map((chat) => (
              <button
                key={chat.id}
                onClick={() => {
                  setViewedChat(chat)
                  setIsHistoryOpen(false)
                }}
                type="button"
              >
                <strong>{chat.title}</strong>
                <small>{chat.messages?.[0]?.text || copy?.saved || ui.saved}</small>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  const hasCheckInAnswers = Object.values(answers).some((answer) => Array.isArray(answer) ? answer.length : answer)

  if (viewedChat) {
    const archivedRecommendations = (viewedChat.recommendationIds || [])
      .map(getTaskById)
      .filter(Boolean)

    return (
      <section className="screen checkin-screen">
        {renderHistoryButton()}
        <section className="checkin-chat-card unified-ai-chat" aria-label="Alter MyFlow KI Chat">
          <div className="checkin-chat-messages">
            <article className="checkin-chat-bubble assistant">
              <span>Alter Chat</span>
              <p>{viewedChat.title}</p>
            </article>

            <article className="checkin-chat-bubble assistant current">
              <span>Zusammenfassung</span>
              <p>{buildSummaryText(viewedChat.answers || {})}</p>
            </article>

            {archivedRecommendations.length > 0 && (
              <article className="checkin-chat-bubble assistant current">
                <span>Empfehlungen</span>
                <ul className="unified-ai-recommendations">
                  {archivedRecommendations.map((task) => <li key={task.id}>{task.title}</li>)}
                </ul>
              </article>
            )}

            {(viewedChat.messages || []).map((message, index) => (
              <article className={`checkin-chat-bubble ${message.role}`} key={`${message.role}-${index}`}>
                {formatChatText(message.text).map((line, lineIndex) => (
                  <p className="checkin-chat-line" key={`${message.role}-${index}-${lineIndex}`}>
                    {line}
                  </p>
                ))}
              </article>
            ))}
          </div>
        </section>

        <div className="checkin-actions">
          <button className="secondary-button" onClick={() => setViewedChat(null)} type="button">
            Zurück
          </button>
          <button className="primary-cta" onClick={restartCheckIn} type="button">
            Neuer Chat
          </button>
        </div>
      </section>
    )
  }

  if (!user) {
    return (
      <section className="screen checkin-screen">
        {renderHistoryButton()}
        <div className="checkin-intro-card">
          <p className="eyebrow">{copy?.ai ?? 'MyFlow KI'}</p>
          <h1>{copy?.signIn ?? 'Bitte melde dich an'}</h1>
          <p>{copy?.signInText ?? 'Der KI-Check-in speichert sensible persönliche Angaben und ist deshalb nur angemeldet nutzbar.'}</p>
        </div>
      </section>
    )
  }

  if (!hasConsent) {
    return (
      <section className="screen checkin-screen">
        {renderHistoryButton()}
        <div className="checkin-intro-card ai-start-card">
          <p className="eyebrow">MyFlow KI</p>
          <h1>Wie möchtest du starten?</h1>
          <p>Du kannst direkt mit der KI schreiben oder zuerst einen kurzen Tages-Check-in machen.</p>
          <p className="checkin-disclaimer">
            Keine medizinischen Diagnosen. Nur allgemeine Motivation und Alltagstipps.
          </p>
          <div className="ai-start-options">
            <button className="ai-start-option primary" onClick={startDirectChat} type="button">
              <span className="ai-start-icon">KI</span>
              <span>
                <strong>Direkt chatten</strong>
                <small>Sofort eine Frage stellen</small>
              </span>
            </button>
            <button className="ai-start-option" onClick={() => setHasConsent(true)} type="button">
              <span className="ai-start-icon">✓</span>
              <span>
                <strong>Check-in starten</strong>
                <small>Erst kurz deinen Tag erfassen</small>
              </span>
            </button>
          </div>
        </div>
      </section>
    )
  }

  if (isComplete) {
    return (
      <section className="screen checkin-screen">
        {renderHistoryButton()}
        <section className="checkin-chat-card unified-ai-chat" aria-label="MyFlow KI Chat">
          <div className="checkin-chat-messages">
            {hasCheckInAnswers ? (
              <article className="checkin-chat-bubble assistant">
                <span>Phase 1 abgeschlossen</span>
                <p>Danke. Ich habe deinen Check-in gespeichert und nutze ihn jetzt für den Coach-Chat.</p>
              </article>
            ) : (
              <article className="checkin-chat-bubble assistant">
                <span>{ui.freeChat}</span>
                <p>{ui.freeText}</p>
              </article>
            )}

            {hasCheckInAnswers && personalizedQuestions.map((question) => (
              answers[question.id] ? (
                <div className="checkin-chat-pair" key={question.id}>
                  <article className="checkin-chat-bubble assistant compact">
                    <span>{question.label}</span>
                    <p>{question.question}</p>
                  </article>
                  <article className="checkin-chat-bubble user compact">
                    <p>{getAnswerLabel(question, answers[question.id])}</p>
                  </article>
                </div>
              ) : null
            ))}

            {hasCheckInAnswers && (
              <article className="checkin-chat-bubble assistant current">
                <span>Kurze Zusammenfassung</span>
                <p>{buildSummaryText(answers)}</p>
              </article>
            )}

            {hasCheckInAnswers && (
              <article className="checkin-chat-bubble assistant current">
                <span>2-3 Empfehlungen</span>
                <ul className="unified-ai-recommendations">
                  {recommendations.slice(0, 3).map((recommendation) => (
                    <li key={recommendation.task.id}>{recommendation.task.title}</li>
                  ))}
                  {!recommendations.length && <li>Starte mit einer kleinen Pause und einer einfachen Aufgabe.</li>}
                </ul>
              </article>
            )}

            {isSaving && (
              <article className="checkin-chat-bubble assistant loading">
                <p>Check-in wird gespeichert...</p>
              </article>
            )}
            {saveError && <p className="checkin-error">{saveError}</p>}

            {hasCheckInAnswers && (
              <article className="checkin-chat-bubble assistant">
                <span>Phase 2</span>
                <p>Jetzt kannst du mir frei schreiben, zum Beispiel: Plane meinen Tag, motiviere mich oder hilf mir beim Tagebuch.</p>
              </article>
            )}

            {freeMessages.map((message, index) => (
              <article className={`checkin-chat-bubble ${message.role}`} key={`${message.role}-${index}`}>
                {formatChatText(message.text).map((line, lineIndex) => (
                  <p className="checkin-chat-line" key={`${message.role}-${index}-${lineIndex}`}>
                    {line}
                  </p>
                ))}
              </article>
            ))}
            {isReplyLoading && (
              <article className="checkin-chat-bubble assistant loading">
                <p>Antwort wird erstellt...</p>
              </article>
            )}
            <div aria-hidden="true" ref={chatEndRef} />
          </div>

          {chatError && <p className="ai-chat-error" role="status">{chatError}</p>}

          <form
            className="ai-chat-form unified-ai-form"
            onSubmit={(event) => {
              event.preventDefault()
              sendFreeMessage()
            }}
          >
            <input
              disabled={isReplyLoading}
              value={freeDraft}
              onChange={(event) => setFreeDraft(event.target.value)}
              placeholder={ui.placeholder}
            />
            <button disabled={isReplyLoading} type="submit">{ui.send}</button>
          </form>
        </section>

        <div className="checkin-actions">
          <button className="secondary-button" onClick={() => onNavigate?.('dashboard')} type="button">
            {ui.home}
          </button>
          <button className="secondary-button" onClick={restartCheckIn} type="button">
            {hasCheckInAnswers ? ui.newCheckin : ui.start}
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="screen checkin-screen">
      {renderHistoryButton()}
      <CheckInProgress currentStep={currentStep} label={ui.progress} totalSteps={personalizedQuestions.length} />
      <section className="checkin-chat-card" aria-label="MyFlow KI Chat">
        <div className="checkin-chat-messages">
          <article className="checkin-chat-bubble assistant">
            <span>{ui.phase}</span>
            <p>{ui.phaseText}</p>
          </article>

          {renderAnsweredQuestions()}

          <article className="checkin-chat-bubble assistant current">
            <span>{currentQuestion.label}</span>
            <p>{currentQuestion.question}</p>
          </article>
        </div>

        <div
          className="checkin-chat-options"
          role="listbox"
          aria-label={currentQuestion.question}
          aria-multiselectable={currentQuestion.multiple || undefined}
        >
          {currentQuestion.options.map((option) => {
            const isSelected = getSelectedValues(currentQuestion, answers[currentQuestion.id]).includes(option.value)

            return (
              <button
                aria-selected={isSelected}
                className={`checkin-chat-option ${isSelected ? 'selected' : ''}`}
                key={option.value}
                onClick={() => selectChatAnswer(currentQuestion, option)}
                role="option"
                type="button"
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </section>
      {saveError && <p className="checkin-error">{saveError}</p>}
      <div className="checkin-actions">
        <button className="secondary-button" onClick={goBack} type="button">
          {ui.back}
        </button>
        {currentQuestion.multiple && (
          <button className="primary-cta" onClick={continueCheckIn} type="button">
            {currentStep === personalizedQuestions.length - 1 ? ui.evaluate : ui.next}
          </button>
        )}
      </div>
    </section>
  )
}

export default DailyCheckIn

