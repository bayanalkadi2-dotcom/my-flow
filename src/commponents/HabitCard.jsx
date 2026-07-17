import { useCallback, useEffect, useState } from 'react'
import waterGlassEmpty from '../assets/water-glass-empty.svg'
import waterGlassFull from '../assets/water-glass-full.svg'
import { calculateCompletedItemsProgress, getRoutineProgress } from '../utils/routineProgress'
import { getLocalDateKey } from '../utils/checkins'

const routineVisuals = {
  'Wasser trinken': {
    kind: 'water',
    label: 'Ein Glas getrunken',
  },
  'Rauchen reduzieren': {
    kind: 'smoking',
    label: 'Eine Zigarette vermieden',
  },
}

const moodOptions = [
  { value: 'happy', label: 'Glücklich', icon: '😊' },
  { value: 'motivated', label: 'Motiviert', icon: '🤩' },
  { value: 'exhausted', label: 'Erschöpft', icon: '😮‍💨' },
  { value: 'tired', label: 'Müde', icon: '😴' },
  { value: 'sad', label: 'Traurig', icon: '😢' },
  { value: 'angry', label: 'Sauer', icon: '😠' },
  { value: 'sick', label: 'Krank', icon: '🤒' },
  { value: 'unmotivated', label: 'Unmotiviert', icon: '🌧️' },
  { value: 'stressed', label: 'Gestresst', icon: '😣' },
  { value: 'balanced', label: 'Ausgeglichen', icon: '😌' },
]

const iconTypes = [
  { match: ['Dankbarkeit'], type: 'heart' },
  { match: ['Vitamine', 'Medikament', 'Supplement', 'Magnesium'], type: 'pill' },
  { match: ['Tagesplanung'], type: 'checklist' },
  { match: ['Bewegung', 'Sport', 'Laufen'], type: 'movement' },
  { match: ['Wasser'], type: 'drop' },
]

function getStatus(habit) {
  const progress = getRoutineProgress(habit)
  if (habit.done || progress >= 100) return 'done'
  if (progress > 0) return 'partial'
  return 'skipped'
}

function getIconType(title) {
  return iconTypes.find((entry) => entry.match.some((word) => title.includes(word)))?.type ?? 'checklist'
}

function getRoutineIcon(title) {
  const type = getIconType(title)

  if (type === 'heart') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 20s-7-4.3-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.7-7 10-7 10Z" />
      </svg>
    )
  }

  if (type === 'pill') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8.2 15.8a4.2 4.2 0 0 1 0-5.9l3.7-3.7a4.2 4.2 0 0 1 5.9 5.9l-3.7 3.7a4.2 4.2 0 0 1-5.9 0Z" />
        <path d="m10.1 8.1 5.8 5.8" />
      </svg>
    )
  }

  if (type === 'movement') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 17.5h10.8c2 0 3.7-1.3 4.2-3.2l.2-.8H15l-2.7-4.2H8.7l1.9 4.2H5a2 2 0 0 0 0 4Z" />
        <path d="M4 20h15" />
      </svg>
    )
  }

  if (type === 'drop') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21a7 7 0 0 0 7-7c0-4.6-7-11-7-11s-7 6.4-7 11a7 7 0 0 0 7 7Z" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5h10v15H6V5h2Z" />
      <path d="M9 5a3 3 0 0 1 6 0" />
      <path d="m9 13 2 2 4-5" />
    </svg>
  )
}

function getStatusText(status, progress, remaining, unit, copy) {
  if (status === 'done') return copy.todayDone
  if (remaining > 0 && unit) return copy.remaining.replace('{count}', remaining.toLocaleString(copy.locale)).replace('{unit}', unit)
  if (progress >= 50) return copy.halfway
  return copy.open
}

function getProgressText(habit, copy) {
  const current = Number(habit.current ?? 0)
  const target = Number(habit.target ?? 0)
  const unit = habit.displayUnit ?? habit.unit ?? ''

  if (target <= 1) {
    return `${current.toLocaleString(copy.locale)} ${unit || copy.doneLower}`.trim()
  }

  return copy.progress.replace('{current}', current.toLocaleString(copy.locale)).replace('{target}', target.toLocaleString(copy.locale)).replace('{unit}', unit).trim()
}

function getEntryKind(title) {
  const normalized = String(title || '').toLowerCase()
  if (normalized === 'tagesplanung' || normalized.includes('tag vorbereiten')) return 'dailyPlanning'
  if (normalized === 'fokuszeit' || normalized === 'lernzeit') return 'focusTime'
  if (normalized === 'lernblock' || normalized === 'lernen') return 'learning'
  if (normalized === 'wochenplanung') return 'weekly'
  if (normalized.startsWith('mini-aufgaben')) return 'miniTasks'
  if (normalized === 'dankbarkeit') return 'gratitude'
  if (normalized.includes('medikament') || normalized.includes('vitamin')) return 'medication'
  return null
}

function HabitCard({ habit, languageStyle = 'german', onIncrement, onResetProgress, onSaveDailyEntry, onSetMood, onSetPartial, onUpdatePeriod, onRemove, onToggleDone, t }) {
  const statusCopy = {
    german: { skipped: 'Ausgelassen', partial: 'Teilweise', done: 'Erledigt', doneLower: 'erledigt', choose: 'Status auswählen', remove: 'entfernen', todayDone: 'Heute erledigt', remaining: 'Noch {count} {unit} bis zum Ziel', halfway: 'Halbzeit geschafft', open: 'Noch offen', progress: '{current} von {target} {unit}', progressLabel: 'Fortschritt', moodQuestion: 'Wie fühlst du dich heute?', selected: 'Aktuell ausgewählt: {moods}', noMood: 'Heute noch keine Stimmung ausgewählt', locale: 'de-DE' },
    english: { skipped: 'Skipped', partial: 'Partially', done: 'Completed', doneLower: 'completed', choose: 'Select status', remove: 'remove', todayDone: 'Completed today', remaining: '{count} {unit} remaining to reach the goal', halfway: 'Halfway there', open: 'Still open', progress: '{current} of {target} {unit}', progressLabel: 'Progress', moodQuestion: 'How do you feel today?', selected: 'Currently selected: {moods}', noMood: 'No mood selected today', locale: 'en-US' },
    turkish: { skipped: 'Atlandı', partial: 'Kısmen', done: 'Tamamlandı', doneLower: 'tamamlandı', choose: 'Durum seç', remove: 'kaldır', todayDone: 'Bugün tamamlandı', remaining: 'Hedefe {count} {unit} kaldı', halfway: 'Yarısı tamamlandı', open: 'Henüz tamamlanmadı', progress: '{current} / {target} {unit}', progressLabel: 'İlerleme', moodQuestion: 'Bugün nasıl hissediyorsun?', selected: 'Seçilen: {moods}', noMood: 'Bugün henüz ruh hali seçilmedi', locale: 'tr-TR' },
    arabic: { skipped: 'تم التخطي', partial: 'جزئيا', done: 'مكتمل', doneLower: 'مكتمل', choose: 'اختيار الحالة', remove: 'إزالة', todayDone: 'تم الإنجاز اليوم', remaining: 'باقي {count} {unit} للوصول إلى الهدف', halfway: 'تم إنجاز النصف', open: 'لم يكتمل بعد', progress: '{current} من {target} {unit}', progressLabel: 'التقدم', moodQuestion: 'كيف تشعر اليوم؟', selected: 'المحدد حاليا: {moods}', noMood: 'لم يتم اختيار المزاج اليوم', locale: 'ar' },
  }[languageStyle] ?? { skipped: 'Ausgelassen', partial: 'Teilweise', done: 'Erledigt', choose: 'Status auswählen', remove: 'entfernen' }
  const [detailsOpen, setDetailsOpen] = useState(false)
  const dateKey = getLocalDateKey()
  const dailyEntry = habit.period?.dailyEntries?.[dateKey] ?? {}
  const [selectedMoods, setSelectedMoods] = useState(() => {
    if (Array.isArray(dailyEntry.moods)) return dailyEntry.moods
    return String(habit.mood || '').split(',').filter(Boolean)
  })
  const [moodSaved, setMoodSaved] = useState(false)
  const isMoodRoutine = habit.type === 'mood'
  const isPeriodRoutine = habit.type === 'period'
  const routineVisual = routineVisuals[habit.title]
  const entryKind = getEntryKind(habit.title)
  const title = habit.displayTitle ?? habit.title
  const progress = getRoutineProgress(habit)
  const status = getStatus(habit)
  const current = Math.max(Number(habit.current ?? 0), 0)
  const target = Math.max(Number(habit.target ?? 1), 1)
  const remaining = Math.max(target - current, 0)
  const moodTranslations = {
    german: ['Glücklich','Motiviert','Erschöpft','Müde','Traurig','Sauer','Krank','Unmotiviert','Gestresst','Ausgeglichen'],
    english: ['Happy','Motivated','Exhausted','Tired','Sad','Angry','Sick','Unmotivated','Stressed','Balanced'],
    turkish: ['Mutlu','Motivasyonlu','Bitkin','Yorgun','Üzgün','Kızgın','Hasta','Motivasyonsuz','Stresli','Dengeli'],
    arabic: ['سعيد','متحمس','مرهق','متعب','حزين','غاضب','مريض','غير متحمس','متوتر','متوازن'],
  }[languageStyle]
  const savedMoodLabels = selectedMoods.map((mood) => {
    const index = moodOptions.findIndex((option) => option.value === mood || option.label === mood)
    return moodTranslations[index]
  }).filter(Boolean)

  function markSkipped() {
    onResetProgress(habit)
  }

  function markPartial() {
    if (entryKind === 'miniTasks') return
    if (progress >= 100 || habit.done) return
    if (target <= 1) onSetPartial(habit)
    else onIncrement(habit.id)
  }

  function markDone() {
    if (entryKind === 'miniTasks') return
    if (!habit.done || progress < 100) {
      onToggleDone(habit)
    }
  }

  function saveMood() {
    if (selectedMoods.length === 0) return
    onSetMood(habit.id, selectedMoods)
    setMoodSaved(true)
  }

  return (
    <article className={`habit-card routine-card routine-card-${status}`}>
      {onRemove && (
        <button
          className="habit-remove-button"
          onClick={() => onRemove(habit)}
          type="button"
          aria-label={`${title} ${statusCopy.remove}`}
        >
          ×
        </button>
      )}

      <div className="routine-card-main">
        <div className="routine-icon" aria-hidden="true">
          {getRoutineIcon(habit.title)}
        </div>

        <div className="routine-content">
          <div className="routine-card-top">
            <div>
              <h2 className="habit-title">{title}</h2>
              {isMoodRoutine ? (
                <>
                  <p className="routine-progress-copy">{statusCopy.moodQuestion}</p>
                  <p className="routine-status-copy">
                    {savedMoodLabels.length > 0
                      ? statusCopy.selected.replace('{moods}', savedMoodLabels.join(', '))
                      : statusCopy.noMood}
                  </p>
                </>
              ) : (
                <>
                  <p className="routine-progress-copy">{getProgressText(habit, statusCopy)}</p>
                  <p className="routine-status-copy">{getStatusText(status, progress, remaining, habit.displayUnit ?? habit.unit, statusCopy)}</p>
                </>
              )}
            </div>

            <div className={`progress-ring routine-progress-ring progress-${status}`} aria-label={`${progress}% ${statusCopy.progressLabel}`}>
              <svg viewBox="0 0 52 52" aria-hidden="true">
                <circle className="progress-ring-track" cx="26" cy="26" r="22" />
                <circle
                  className="progress-ring-value"
                  cx="26"
                  cy="26"
                  r="22"
                  pathLength="100"
                  strokeDasharray={`${progress} 100`}
                />
              </svg>
              <span>{progress}%</span>
            </div>
          </div>

          {isMoodRoutine ? (
            <MoodRoutineSelector
              moodSaved={moodSaved}
              onSave={saveMood}
              onSelect={(value) => {
                setSelectedMoods((current) => (
                  current.includes(value)
                    ? current.filter((mood) => mood !== value)
                    : [...current, value]
                ))
                setMoodSaved(false)
              }}
              selectedMoods={selectedMoods}
              languageStyle={languageStyle}
              moodTranslations={moodTranslations}
            />
          ) : (
            <>
              {entryKind !== 'miniTasks' && <div className="routine-status-control" aria-label={`${title}: ${statusCopy.choose}`}>
                <button
                  className={`routine-status-option skipped ${status === 'skipped' ? 'selected' : ''}`}
                  onClick={markSkipped}
                  type="button"
                >
                  <span aria-hidden="true">⊘</span>
                  {statusCopy.skipped}
                </button>
                <button
                  className={`routine-status-option partial ${status === 'partial' ? 'selected' : ''}`}
                  onClick={markPartial}
                  type="button"
                >
                  <span aria-hidden="true">◐</span>
                  {statusCopy.partial}
                </button>
                <button
                  className={`routine-status-option done ${status === 'done' ? 'selected' : ''}`}
                  onClick={markDone}
                  type="button"
                >
                  <span aria-hidden="true">✓</span>
                  {statusCopy.done}
                </button>
              </div>}

              {routineVisual && !isPeriodRoutine && (
                <RoutineVisualAction
                  habit={habit}
                  visual={routineVisual}
                  onActivate={() => onIncrement(habit.id)}
                />
              )}

              {entryKind && onSaveDailyEntry && (
                <RoutineDailyEditor
                  dateKey={dateKey}
                  entry={dailyEntry}
                  habit={habit}
                  kind={entryKind}
                  languageStyle={languageStyle}
                  onSave={onSaveDailyEntry}
                />
              )}

              {isPeriodRoutine && (
                <>
                  <button
                    className="habit-button detail-toggle"
                    onClick={() => setDetailsOpen((open) => !open)}
                    type="button"
                  >
                    {detailsOpen ? t.habitCard.closeDetails : t.habitCard.period}
                  </button>

                  {detailsOpen && (
                    <div className="period-tracker">
                      <label>
                        {t.habitCard.cycleLength}
                        <input
                          min="1"
                          onChange={(event) => onUpdatePeriod(habit.id, { cycleLength: event.target.value })}
                          placeholder="z. B. 28"
                          type="number"
                          value={habit.period?.cycleLength ?? ''}
                        />
                      </label>
                      <PeriodScale
                        label={t.habitCard.flowStrength}
                        labels={t.habitCard.scale}
                        value={habit.period?.flowStrength ?? 3}
                        onChange={(value) => onUpdatePeriod(habit.id, { flowStrength: value })}
                      />
                      <PeriodScale
                        label={t.habitCard.pain}
                        labels={t.habitCard.scale}
                        value={habit.period?.painLevel ?? 1}
                        onChange={(value) => onUpdatePeriod(habit.id, { painLevel: value })}
                      />
                      <div>
                        <p>{t.habitCard.wellbeing}</p>
                        <div className="mood-options">
                          {t.habitCard.moods.map((wellbeing) => (
                            <button
                              className={`mood-option ${habit.period?.phaseWellbeing === wellbeing ? 'selected' : ''}`}
                              key={wellbeing}
                              onClick={() => onUpdatePeriod(habit.id, { phaseWellbeing: wellbeing })}
                              type="button"
                            >
                              {wellbeing}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  )
}

function RoutineVisualAction({ habit, visual, onActivate }) {
  const isComplete = habit.done || Number(habit.progress ?? 0) >= 100
  const current = Math.max(0, Math.min(Number(habit.current ?? 0), Number(habit.target ?? 1)))
  const target = Math.max(1, Math.min(Number(habit.target ?? 1), 12))

  return (
    <button
      className={`routine-visual-action ${visual.kind} ${current > 0 ? 'is-active' : ''}`}
      disabled={isComplete}
      onClick={onActivate}
      type="button"
      aria-label={habit.incrementLabel ?? visual.label}
    >
      <span className="routine-visual-grid" aria-hidden="true">
        {Array.from({ length: target }).map((_, index) => {
          const itemActive = index < current

          return (
            <span className={`routine-visual-stage ${itemActive ? 'is-filled' : ''}`} key={`${visual.kind}-${index}`}>
              {visual.kind === 'water' ? (
                <img
                  className="routine-visual-img"
                  src={itemActive ? waterGlassFull : waterGlassEmpty}
                  alt=""
                />
              ) : (
                <span className="cigarette-symbol">
                  <span className="cigarette-body" />
                  <span className="cigarette-filter" />
                  <span className="cigarette-smoke" />
                </span>
              )}
            </span>
          )
        })}
      </span>
    </button>
  )
}

const entryEditorCopy = {
  dailyPlanning: {
    question: 'Tagesplanung',
    help: 'Plane deinen Tag und notiere, was du heute erledigen oder berücksichtigen möchtest.',
    placeholder: 'Tagesablauf, Ziele oder wichtige Aufgaben',
  },
  learning: {
    question: 'Was möchtest du lernen?',
    placeholder: 'Kapitel, Karteikarten oder Übungsaufgaben',
  },
  weekly: {
    question: 'Wie sieht deine Wochenplanung aus?',
    placeholder: 'Was möchtest du diese Woche erledigen?',
  },
  gratitude: {
    question: 'Wofür bist du heute dankbar?',
    placeholder: 'Schreibe deine Gedanken hier auf.',
  },
  medication: {
    question: 'Was hast du eingenommen?',
    placeholder: 'Vitamin, Medikament oder mehrere Einträge',
  },
}

function RoutineDailyEditor({ dateKey, entry, habit, kind, languageStyle = 'german', onSave }) {
  const [text, setText] = useState(entry.text ?? '')
  const [dosage, setDosage] = useState(entry.dosage ?? '')
  const [focusGoal, setFocusGoal] = useState(entry.focusGoal ?? '')
  const [focusDuration, setFocusDuration] = useState(Number(entry.focusDuration ?? habit.target ?? 25) || 25)
  const [remainingSeconds, setRemainingSeconds] = useState(Number(entry.remainingSeconds ?? 0))
  const [timerState, setTimerState] = useState(entry.timerState ?? 'idle')
  const [newTask, setNewTask] = useState('')
  const [saved, setSaved] = useState(false)
  const tasks = Array.isArray(entry.miniTasks) ? entry.miniTasks : []
  const focusDurations = [15, 25, 45, 60]
  const editorTranslations = {
    english: { dailyPlanning: ['Daily planning', 'Daily schedule, goals or important tasks'], learning: ['What would you like to learn?', 'Chapters, flashcards or exercises'], weekly: ['What does your weekly plan look like?', 'What would you like to complete this week?'], gratitude: ['What are you grateful for today?', 'Write your thoughts here.'], medication: ['What did you take?', 'Vitamin, medication or multiple entries'], dosage: 'Amount or dosage (optional)', optional: 'Optional information', save: 'Save entry', saved: 'Saved.', mini: ['Which mini task would you like to complete?', 'Your own mini task', 'Add'], focus: ['Focus time', 'Choose a task and focus only on it for a fixed period.', 'e.g. study math or prepare a presentation', 'Select duration', 'min', 'Focus time completed.', 'Timer paused.', 'Focus time is running.', 'Ready to start.', 'Start focus time', 'Pause', 'Continue', 'Stop early'] },
    turkish: { dailyPlanning: ['Günlük planlama', 'Günlük program, hedefler veya önemli görevler'], learning: ['Ne öğrenmek istiyorsun?', 'Bölümler, bilgi kartları veya alıştırmalar'], weekly: ['Haftalık planın nasıl?', 'Bu hafta neyi tamamlamak istiyorsun?'], gratitude: ['Bugün ne için minnettarsın?', 'Düşüncelerini buraya yaz.'], medication: ['Ne kullandın?', 'Vitamin, ilaç veya birden fazla kayıt'], dosage: 'Miktar veya doz (isteğe bağlı)', optional: 'İsteğe bağlı bilgi', save: 'Kaydı kaydet', saved: 'Kaydedildi.', mini: ['Hangi mini görevi tamamlamak istiyorsun?', 'Kendi mini görevin', 'Ekle'], focus: ['Odak süresi', 'Bir görev seç ve belirli bir süre yalnızca ona odaklan.', 'örn. matematik çalış veya sunum hazırla', 'Süre seç', 'dk', 'Odak süresi tamamlandı.', 'Zamanlayıcı duraklatıldı.', 'Odak süresi devam ediyor.', 'Başlamaya hazır.', 'Odak süresini başlat', 'Duraklat', 'Devam et', 'Erken bitir'] },
    arabic: { dailyPlanning: ['التخطيط اليومي', 'جدول اليوم أو الأهداف أو المهام المهمة'], learning: ['ماذا تريد أن تتعلم؟', 'فصول أو بطاقات تعليمية أو تمارين'], weekly: ['كيف تبدو خطتك الأسبوعية؟', 'ماذا تريد إنجازه هذا الأسبوع؟'], gratitude: ['لماذا أنت ممتن اليوم؟', 'اكتب أفكارك هنا.'], medication: ['ماذا تناولت؟', 'فيتامين أو دواء أو عدة إدخالات'], dosage: 'الكمية أو الجرعة (اختياري)', optional: 'معلومات اختيارية', save: 'حفظ الإدخال', saved: 'تم الحفظ.', mini: ['ما المهمة الصغيرة التي تريد إنجازها؟', 'مهمة صغيرة خاصة', 'إضافة'], focus: ['وقت التركيز', 'اختر مهمة وركز عليها فقط لفترة زمنية محددة.', 'مثلا: دراسة الرياضيات أو تحضير عرض', 'اختيار المدة', 'دقيقة', 'اكتمل وقت التركيز.', 'المؤقت متوقف.', 'وقت التركيز قيد التشغيل.', 'جاهز للبدء.', 'بدء وقت التركيز', 'إيقاف مؤقت', 'متابعة', 'إنهاء مبكر'] },
  }[languageStyle]

  const saveFocusEntry = useCallback((nextEntry, nextUpdates = {}) => {
    onSave(habit.id, dateKey, { ...entry, ...nextEntry }, nextUpdates)
  }, [dateKey, entry, habit.id, onSave])

  const completeFocusSession = useCallback(() => {
    const completedEntry = {
      focusGoal: focusGoal.trim(),
      focusDuration,
      remainingSeconds: 0,
      timerState: 'completed',
      completedAt: new Date().toISOString(),
    }
    const routineUpdates = {
      current: Number(habit.target ?? focusDuration),
      progress: 100,
      done: true,
    }

    setTimerState('completed')
    saveFocusEntry(completedEntry, routineUpdates)
  }, [focusDuration, focusGoal, habit.target, saveFocusEntry])

  useEffect(() => {
    if (kind !== 'focusTime' || timerState !== 'running') return undefined

    const intervalId = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(intervalId)
          completeFocusSession()
          return 0
        }

        const nextSeconds = current - 1
        onSave(habit.id, dateKey, {
          ...entry,
          focusGoal: focusGoal.trim(),
          focusDuration,
          remainingSeconds: nextSeconds,
          timerState: 'running',
        })
        return nextSeconds
      })
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [completeFocusSession, dateKey, entry, focusDuration, focusGoal, habit.id, kind, onSave, timerState])

  function saveTextEntry() {
    const isDailyPlanning = kind === 'dailyPlanning'
    const routineUpdates = isDailyPlanning && text.trim()
      ? { current: Number(habit.target ?? 1), progress: 100, done: true }
      : {}

    onSave(habit.id, dateKey, { ...entry, text: text.trim(), dosage: dosage.trim() }, routineUpdates)
    setSaved(true)
  }

  function startFocusTimer() {
    const goal = focusGoal.trim() || 'Fokuszeit'
    if (!focusGoal.trim()) {
      setFocusGoal(goal)
    }

    const nextSeconds = Math.max(Number(focusDuration) || 25, 1) * 60
    setRemainingSeconds(nextSeconds)
    setTimerState('running')
    saveFocusEntry({
      focusGoal: goal,
      focusDuration,
      remainingSeconds: nextSeconds,
      timerState: 'running',
      completedAt: '',
    })
  }

  function pauseFocusTimer() {
    setTimerState('paused')
    saveFocusEntry({
      focusGoal: focusGoal.trim(),
      focusDuration,
      remainingSeconds,
      timerState: 'paused',
    })
  }

  function resumeFocusTimer() {
    if (remainingSeconds <= 0) return
    setTimerState('running')
    saveFocusEntry({
      focusGoal: focusGoal.trim(),
      focusDuration,
      remainingSeconds,
      timerState: 'running',
    })
  }

  function stopFocusTimer() {
    setTimerState('idle')
    setRemainingSeconds(0)
    saveFocusEntry({
      focusGoal: focusGoal.trim(),
      focusDuration,
      remainingSeconds: 0,
      timerState: 'idle',
    })
  }

  function formatSeconds(seconds) {
    const safeSeconds = Math.max(Number(seconds) || 0, 0)
    const minutes = Math.floor(safeSeconds / 60)
    const restSeconds = safeSeconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(restSeconds).padStart(2, '0')}`
  }

  function saveTasks(nextTasks) {
    onSave(
      habit.id,
      dateKey,
      { ...entry, miniTasks: nextTasks },
      calculateCompletedItemsProgress(nextTasks),
    )
  }

  function addTask() {
    const value = newTask.trim()
    if (!value) return
    const task = {
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${tasks.length}`,
      text: value,
      done: false,
    }
    saveTasks([...tasks, task])
    setNewTask('')
  }

  if (kind === 'miniTasks') {
    return (
      <div className="routine-entry-panel">
        <strong>{editorTranslations?.mini?.[0] ?? 'Welche Mini-Aufgabe möchtest du erledigen?'}</strong>
        {tasks.length > 0 && (
          <div className="routine-mini-task-list">
            {tasks.map((task) => (
              <button
                aria-pressed={task.done}
                className={task.done ? 'is-done' : ''}
                key={task.id}
                onClick={() => saveTasks(tasks.map((item) => (
                  item.id === task.id ? { ...item, done: !item.done } : item
                )))}
                type="button"
              >
                <span aria-hidden="true">{task.done ? '✓' : '○'}</span>
                {task.text}
              </button>
            ))}
          </div>
        )}
        <div className="routine-entry-add-row">
          <input
            onChange={(event) => setNewTask(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                addTask()
              }
            }}
            placeholder={editorTranslations?.mini?.[1] ?? 'Eigene Mini-Aufgabe'}
            type="text"
            value={newTask}
          />
          <button disabled={!newTask.trim()} onClick={addTask} type="button">{editorTranslations?.mini?.[2] ?? 'Hinzufügen'}</button>
        </div>
      </div>
    )
  }

  if (kind === 'focusTime') {
    const displaySeconds = timerState === 'idle' || timerState === 'completed'
      ? Math.max(Number(focusDuration) || 25, 1) * 60
      : remainingSeconds

    return (
      <div className="routine-entry-panel routine-focus-panel">
        <label>
          <strong>{editorTranslations?.focus?.[0] ?? 'Fokuszeit'}</strong>
          <span>{editorTranslations?.focus?.[1] ?? 'Wähle eine Aufgabe und konzentriere dich für einen festen Zeitraum nur darauf.'}</span>
          <input
            onChange={(event) => setFocusGoal(event.target.value)}
            placeholder={editorTranslations?.focus?.[2] ?? 'z. B. Mathe lernen oder Präsentation vorbereiten'}
            type="text"
            value={focusGoal}
          />
        </label>

        <div className="routine-duration-options" aria-label={editorTranslations?.focus?.[3] ?? 'Dauer auswählen'}>
          {focusDurations.map((duration) => (
            <button
              className={Number(focusDuration) === duration ? 'selected' : ''}
              disabled={timerState === 'running'}
              key={duration}
              onClick={() => {
                setFocusDuration(duration)
                if (timerState === 'idle') setRemainingSeconds(0)
              }}
              type="button"
            >
              {duration} {editorTranslations?.focus?.[4] ?? 'Min'}
            </button>
          ))}
        </div>

        <div className="routine-focus-timer" aria-live="polite">
          <strong>{formatSeconds(displaySeconds)}</strong>
          <span>
            {timerState === 'completed'
              ? (editorTranslations?.focus?.[5] ?? 'Fokuszeit abgeschlossen.')
              : timerState === 'paused'
                ? (editorTranslations?.focus?.[6] ?? 'Timer pausiert.')
                : timerState === 'running'
                  ? (editorTranslations?.focus?.[7] ?? 'Fokuszeit läuft.')
                  : (editorTranslations?.focus?.[8] ?? 'Bereit zum Start.')}
          </span>
        </div>

        <div className="routine-focus-actions">
          {(timerState === 'idle' || timerState === 'completed') && (
            <button className="routine-entry-save" onClick={startFocusTimer} type="button">
              {editorTranslations?.focus?.[9] ?? 'Fokuszeit starten'}
            </button>
          )}
          {timerState === 'running' && (
            <button className="routine-entry-save" onClick={pauseFocusTimer} type="button">{editorTranslations?.focus?.[10] ?? 'Pausieren'}</button>
          )}
          {timerState === 'paused' && (
            <button className="routine-entry-save" onClick={resumeFocusTimer} type="button">{editorTranslations?.focus?.[11] ?? 'Fortsetzen'}</button>
          )}
          {(timerState === 'running' || timerState === 'paused') && (
            <button className="routine-entry-save secondary" onClick={stopFocusTimer} type="button">{editorTranslations?.focus?.[12] ?? 'Vorzeitig beenden'}</button>
          )}
        </div>
      </div>
    )
  }

  const baseCopy = entryEditorCopy[kind]
  const localizedEditor = editorTranslations?.[kind]
  const localizedHelp = {
    english: 'Plan your day and note what you want to complete or keep in mind today.',
    turkish: 'Gününü planla ve bugün tamamlamak veya aklında tutmak istediklerini not et.',
    arabic: 'خطط ليومك ودون ما تريد إنجازه أو مراعاته اليوم.',
  }[languageStyle]
  const copy = localizedEditor
    ? { ...baseCopy, question: localizedEditor[0], placeholder: localizedEditor[1], help: kind === 'dailyPlanning' ? localizedHelp : baseCopy.help }
    : baseCopy
  if (!copy) return null

  return (
    <div className="routine-entry-panel">
      <label>
        <strong>{copy.question}</strong>
        {copy.help && <span>{copy.help}</span>}
        <textarea
          onChange={(event) => {
            setText(event.target.value)
            setSaved(false)
          }}
          placeholder={copy.placeholder}
          rows={kind === 'weekly' || kind === 'dailyPlanning' ? 6 : 4}
          value={text}
        />
      </label>
      {kind === 'medication' && (
        <label>
          <span>{editorTranslations?.dosage ?? 'Menge oder Dosierung (optional)'}</span>
          <input
            onChange={(event) => {
              setDosage(event.target.value)
              setSaved(false)
            }}
            placeholder={editorTranslations?.optional ?? 'Freiwillige Angabe'}
            type="text"
            value={dosage}
          />
        </label>
      )}
      <button className="routine-entry-save" onClick={saveTextEntry} type="button">
        {editorTranslations?.save ?? (kind === 'dailyPlanning' ? 'Speichern und abschließen' : 'Eintrag speichern')}
      </button>
      {saved && <small className="routine-entry-feedback">{editorTranslations?.saved ?? 'Gespeichert.'}</small>}
    </div>
  )
}

function MoodRoutineSelector({ languageStyle, moodSaved, moodTranslations, onSave, onSelect, selectedMoods }) {
  const copy = {
    german: ['Stimmung auswählen', 'Stimmung {mood} auswählen', 'Stimmung eintragen', 'Stimmung gespeichert.'],
    english: ['Select mood', 'Select {mood} mood', 'Save mood', 'Mood saved.'],
    turkish: ['Ruh hali seç', '{mood} ruh halini seç', 'Ruh halini kaydet', 'Ruh hali kaydedildi.'],
    arabic: ['اختيار المزاج', 'اختيار مزاج {mood}', 'تسجيل المزاج', 'تم حفظ المزاج.'],
  }[languageStyle]
  return (
    <div className="mood-routine-panel">
      <div className="mood-choice-grid" aria-label={copy[0]}>
        {moodOptions.map((mood, index) => {
          const isSelected = selectedMoods.includes(mood.value)
          const label = moodTranslations[index]

          return (
            <button
              aria-label={copy[1].replace('{mood}', label)}
              aria-pressed={isSelected}
              className={`mood-choice ${isSelected ? 'selected' : ''}`}
              key={mood.value}
              onClick={() => onSelect(mood.value)}
              type="button"
            >
              <span aria-hidden="true">{mood.icon}</span>
              <strong>{label}</strong>
              {isSelected && <small aria-hidden="true">✓</small>}
            </button>
          )
        })}
      </div>

      <button
        className="mood-save-button"
        disabled={selectedMoods.length === 0}
        onClick={onSave}
        type="button"
      >
        {copy[2]}
      </button>

      {moodSaved && (
        <p className="mood-save-feedback">{copy[3]}</p>
      )}
    </div>
  )
}

function PeriodScale({ label, labels, value, onChange }) {
  const currentValue = Number(value)

  return (
    <div className="period-scale">
      <div className="period-scale-header">
        <p>{label}</p>
        <span>{labels[currentValue - 1]}</span>
      </div>
      <div className="period-bars" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((bar) => (
          <span
            className={bar <= currentValue ? 'active' : ''}
            key={bar}
            style={{ height: `${10 + bar * 5}px` }}
          />
        ))}
      </div>
      <input
        aria-label={label}
        className="period-slider"
        max="5"
        min="1"
        onChange={(event) => onChange(Number(event.target.value))}
        type="range"
        value={currentValue}
      />
    </div>
  )
}

export default HabitCard
