import { useEffect, useMemo, useRef, useState } from 'react'
import mascotImage from '../../assets/flow-character-robot-crossed-card.png'
import { flowtreeLevels, getFlowtreeProgress } from '../../data/flowtreeLevels'

const SUSTAINABILITY_TREE_COST = 1000

function useAnimatedNumber(value, duration = 520) {
  const [displayValue, setDisplayValue] = useState(() => Math.max(Number(value) || 0, 0))
  const previousValueRef = useRef(displayValue)

  useEffect(() => {
    const startValue = previousValueRef.current
    const endValue = Math.max(Number(value) || 0, 0)
    if (startValue === endValue) return

    let frameId
    const startedAt = performance.now()

    function tick(now) {
      const progress = Math.min((now - startedAt) / duration, 1)
      const easedProgress = 1 - (1 - progress) ** 3
      const nextValue = Math.round(startValue + (endValue - startValue) * easedProgress)
      setDisplayValue(nextValue)

      if (progress < 1) {
        frameId = requestAnimationFrame(tick)
        return
      }

      previousValueRef.current = endValue
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [duration, value])

  return displayValue
}

function FlowtreeProgress({
  coinMessage = '',
  flowCoins = 0,
  onRedeemTree,
  plantedTrees = 0,
  redeemingTree = false,
  stats,
  t,
  languageStyle = 'german',
}) {
  const arabic = t?.nav?.progress === 'الإحصائيات'
  const graphCopy = arabic ? { week: 'الأسبوع', streak: 'السلسلة', day: 'اليوم', active: '7 أيام نشطة متتالية', until: '{days} أيام حتى سلسلة 7 أيام', weekdays: ['الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت','الأحد'] } : null
  const copy = arabic ? { tree: 'شجرة التدفق', yours: 'شجرة التدفق الخاصة بك', grow: 'انمُ مع كل نشاط – من أجلك ومن أجل البيئة.', points: 'نقاط النمو', until: '{points} نقطة حتى المستوى التالي', max: 'تم الوصول إلى أعلى مستوى.', checkins: 'تسجيلات الدخول', routines: 'الروتينات', streak: 'السلسلة', appTime: 'وقت التطبيق', done: 'مكتمل', completed: 'منجز', activeDays: 'أيام نشطة', total: 'إجمالي الاستخدام', stages: ['بذرة','بادرة','نبتة','شجرة','شجرة مزهرة'] } : null
  const localizedGraph = {
    german: ['Fortschritt', 'Grafischer Überblick', 'Heute', 'Tagesziele', '{done} von {total} Routinen erledigt'],
    english: ['Progress', 'Graphical overview', 'Today', 'Daily goals', '{done} of {total} routines completed'],
    turkish: ['İlerleme', 'Grafiksel genel bakış', 'Bugün', 'Günlük hedefler', '{total} rutinden {done} tanesi tamamlandı'],
    arabic: ['التقدم', 'نظرة عامة بالرسوم', 'اليوم', 'الأهداف اليومية', 'تم إنجاز {done} من {total} روتينات'],
  }[languageStyle] ?? ['Fortschritt', 'Grafischer Überblick', 'Heute', 'Tagesziele', '{done} von {total} Routinen erledigt']
  const animatedGrowthPoints = useAnimatedNumber(stats.growthPoints)
  const animatedFlowCoins = useAnimatedNumber(flowCoins)
  const animatedFlowtree = useMemo(() => getFlowtreeProgress(animatedGrowthPoints), [animatedGrowthPoints])
  const { currentLevel, nextLevel, nextLevelPoints, pointsToNextLevel, progressPercent } = animatedFlowtree
  const streakDays = Array.from({ length: 7 }, (_, index) => index < Math.min(stats.streak, 7))
  const safeFlowCoins = Math.max(Number(animatedFlowCoins) || 0, 0)
  const currentLevelId = stats.flowtree.currentLevel.id
  const [levelAnimationId, setLevelAnimationId] = useState(currentLevelId)
  const [isCoinSheetOpen, setIsCoinSheetOpen] = useState(false)
  const [redeemSuccessVisible, setRedeemSuccessVisible] = useState(false)
  const previousLevelIdRef = useRef(currentLevelId)
  const coinsUntilTree = Math.max(SUSTAINABILITY_TREE_COST - safeFlowCoins, 0)
  const sustainabilityProgress = Math.min(Math.round((safeFlowCoins / SUSTAINABILITY_TREE_COST) * 100), 100)
  const statusMessage = nextLevel
    ? (copy ? copy.until.replace('{points}', pointsToNextLevel) : `${pointsToNextLevel} Punkte bis ${nextLevel.name}`)
    : (copy?.max ?? 'Höchste FlowTree-Stufe erreicht.')
  const pointsRangeText = nextLevel ? `${animatedGrowthPoints} / ${nextLevelPoints}` : `${animatedGrowthPoints}`
  const statCards = [
    { icon: '✓', label: copy?.checkins ?? 'Check-ins', value: stats.checkIns, note: copy?.done ?? 'abgeschlossen' },
    { icon: '↟', label: copy?.routines ?? 'Routinen', value: stats.completedRoutines, note: copy?.completed ?? 'erledigt' },
    { icon: '•', label: copy?.streak ?? 'Serie', value: stats.streak, note: copy?.activeDays ?? 'Tage aktiv' },
    { icon: '◷', label: copy?.appTime ?? 'App-Zeit', value: stats.usageTime, note: copy?.total ?? 'insgesamt genutzt' },
  ]

  useEffect(() => {
    if (previousLevelIdRef.current === currentLevelId) return

    previousLevelIdRef.current = currentLevelId
    setLevelAnimationId(currentLevelId)
    const timeoutId = window.setTimeout(() => setLevelAnimationId(''), 760)
    return () => window.clearTimeout(timeoutId)
  }, [currentLevelId])

  async function handleRedeemTree() {
    const result = await onRedeemTree?.()
    if (result?.success) {
      setRedeemSuccessVisible(true)
      window.setTimeout(() => setRedeemSuccessVisible(false), 4600)
    }
  }

  return (
    <section className="flowtree-dashboard" aria-label="Flowtree Fortschritt">
      <div className="flowtree-card">
        <div className="flowtree-hero-row">
          <div className="flowtree-card-copy">
            <span>{copy?.yours ?? 'Dein Flowtree'}</span>
            <button
              aria-label={`FlowCoins öffnen, aktueller Stand ${safeFlowCoins}`}
              className="flowtree-coin-chip"
              onClick={() => setIsCoinSheetOpen(true)}
              type="button"
            >
              <span aria-hidden="true">🪙</span> FlowCoins: {safeFlowCoins}
            </button>
            <small>{copy?.grow ?? 'Wachse mit jeder Aktivität – für dich und die Umwelt.'}</small>
          </div>

          <div className="flowtree-visual-panel">
            <img className="flowtree-stage-image" src={currentLevel.image} alt={`Flowtree-Stufe ${currentLevel.name}`} />
            <img className="flowtree-mascot-image" src={mascotImage} alt="MyFlow Maskottchen neben dem Flowtree" />
          </div>
        </div>

        <div className="flowtree-points-panel">
          <div className="flowtree-points-head">
            <div>
              <span>{copy?.points ?? 'Wachstumspunkte'}</span>
              <strong>{pointsRangeText}</strong>
            </div>
          </div>
          <div
            className="flowtree-progress-track"
            role="progressbar"
            aria-label="Fortschritt zur nächsten Flowtree-Stufe"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={progressPercent}
          >
            <span style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="flowtree-status-message">{statusMessage}</p>

          <div className="flowtree-level-rail" aria-label="Flowtree Entwicklungsstufen">
            {flowtreeLevels.map((level, index) => {
              const isCurrent = level.id === currentLevel.id
              const isReached = stats.growthPoints >= level.minPoints
              const isUnlocking = levelAnimationId === level.id

              return (
                <div className={`flowtree-level-step ${isCurrent ? 'current' : ''} ${isReached ? 'reached' : ''} ${isUnlocking ? 'level-unlocked' : ''}`} key={level.id}>
                  <div className="flowtree-step-node">
                    <img src={level.image} alt="" aria-hidden="true" />
                  </div>
                  <small>{copy?.stages[index] ?? level.name}</small>
                  {index < flowtreeLevels.length - 1 && <i aria-hidden="true" />}
                </div>
              )
            })}
          </div>
        </div>

        {coinMessage && <p className="flowtree-coin-burst" aria-live="polite">{coinMessage}</p>}
      </div>

      <div className="flowtree-stat-grid">
        {statCards.map((card) => (
          <article key={card.label}>
            <span className="flowtree-stat-icon" aria-hidden="true">{card.icon}</span>
            <div>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <small>{card.note}</small>
            </div>
          </article>
        ))}
      </div>

      <section className="flowtree-graph-card" aria-label="Grafischer Fortschritt">
        <div className="stats-section-header flowtree-week-header">
          <div>
            <span>{localizedGraph[0]}</span>
            <h2>{localizedGraph[1]}</h2>
          </div>
        </div>

        <div className="flowtree-graph-grid">
          <article className="flowtree-donut-card">
            <div
              className="flowtree-donut"
              role="progressbar"
              aria-label="Tagesziele"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={stats.dailyGoalProgress}
              style={{ '--progress': `${stats.dailyGoalProgress}%` }}
            >
              <strong>{stats.dailyGoalProgress}%</strong>
              <span>{localizedGraph[2]}</span>
            </div>
            <div>
              <span>{localizedGraph[3]}</span>
              <p>{localizedGraph[4].replace('{done}', stats.dailyGoalCompleted).replace('{total}', stats.dailyGoalTotal)}</p>
            </div>
          </article>

          <article className="flowtree-bars-card">
            <div>
              <span>{graphCopy?.week ?? 'Woche'}</span>
              <strong>{stats.activeDays.length}/7</strong>
            </div>
            <div className="flowtree-week-bars" aria-label="Aktive Tage als Balkendiagramm">
              {stats.week.map((day, index) => (
                <div key={day.dateKey}>
                  <i style={{ height: day.active ? '100%' : '18%' }} />
                  <span>{graphCopy?.weekdays[index] ?? day.label}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="flowtree-streak-card">
            <div>
              <span>{graphCopy?.streak ?? 'Streak'}</span>
              <strong>{stats.streak} {graphCopy?.day ?? 'Tage'}</strong>
              <p>{stats.streak >= 7 ? (graphCopy?.active ?? '7 Tage in Folge aktiv') : (graphCopy ? graphCopy.until.replace('{days}', Math.max(7 - stats.streak, 0)) : `${Math.max(7 - stats.streak, 0)} Tage bis zur 7er-Serie`)}</p>
            </div>
            <div className="flowtree-streak-dots" aria-label={`${stats.streak} Tage in Folge aktiv`}>
              {streakDays.map((active, index) => (
                <span className={active ? 'active' : ''} key={index} />
              ))}
            </div>
          </article>
        </div>
      </section>

      {isCoinSheetOpen && (
        <div
          className="flowcoin-sheet-overlay"
          onClick={() => setIsCoinSheetOpen(false)}
          role="presentation"
        >
          <section
            aria-labelledby="flowcoin-sheet-title"
            aria-modal="true"
            className="flowcoin-sheet"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <button
              aria-label="FlowCoins schließen"
              className="flowcoin-sheet-close"
              onClick={() => setIsCoinSheetOpen(false)}
              type="button"
            >×</button>
            <div className="flowcoin-sheet-copy">
              <span>FlowCoins</span>
              <h3 id="flowcoin-sheet-title">🪙 {safeFlowCoins} FlowCoins</h3>
              <p>
                {coinsUntilTree > 0
                  ? `Noch ${coinsUntilTree} FlowCoins bis zu deinem ersten echten Baum.`
                  : 'Du kannst jetzt einen echten Baum im Regenwald unterstützen.'}
              </p>
            </div>
            <div
              aria-label="Fortschritt zum ersten echten Baum"
              aria-valuemax="100"
              aria-valuemin="0"
              aria-valuenow={sustainabilityProgress}
              className="flowtree-sustainability-track"
              role="progressbar"
            >
              <span style={{ width: `${sustainabilityProgress}%` }} />
            </div>
            <p className="flowcoin-sheet-tree-count">🌳 Bereits unterstützte Bäume: {Math.max(Number(plantedTrees) || 0, 0)}</p>
            <button
              className="flowcoin-redeem-button"
              disabled={safeFlowCoins < SUSTAINABILITY_TREE_COST || redeemingTree}
              onClick={handleRedeemTree}
              type="button"
            >
              {redeemingTree ? 'Wird eingelöst …' : '🌳 Baum pflanzen'}
            </button>

            {redeemSuccessVisible && (
              <div className="flowcoin-success" aria-live="polite">
                <span aria-hidden="true">🌳</span>
                <strong>Herzlichen Glückwunsch!</strong>
                <p>Du hast deine FlowCoins eingesetzt und unterstützt nun die Pflanzung eines echten Baumes im Regenwald.</p>
                <small>Vielen Dank für deinen Beitrag zur Umwelt. 💚</small>
              </div>
            )}
          </section>
        </div>
      )}
    </section>
  )
}

export default FlowtreeProgress
