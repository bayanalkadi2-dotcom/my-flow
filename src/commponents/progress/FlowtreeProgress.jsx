import mascotImage from '../../assets/flow-character-robot-crossed-card.png'
import { flowtreeLevels } from '../../data/flowtreeLevels'

function FlowtreeProgress({ stats }) {
  const { currentLevel, nextLevel, nextLevelPoints, pointsToNextLevel, progressPercent } = stats.flowtree
  const hasProgress = stats.growthPoints > 0
  const streakDays = Array.from({ length: 7 }, (_, index) => index < Math.min(stats.streak, 7))
  const statusMessage = hasProgress
    ? `${pointsToNextLevel} Punkte bis zur nächsten Stufe.`
    : 'Dein Flowtree wartet auf den ersten Schritt.'
  const targetText = nextLevel
    ? `${nextLevelPoints} Punkte bis ${nextLevel.name}`
    : 'Höchste Stufe erreicht'
  const pointsRangeText = nextLevel ? `${stats.growthPoints} / ${nextLevelPoints}` : `${stats.growthPoints}`
  const statCards = [
    { icon: '✓', label: 'Check-ins', value: stats.checkIns, note: 'abgeschlossen' },
    { icon: '↟', label: 'Routinen', value: stats.completedRoutines, note: 'erledigt' },
    { icon: '•', label: 'Serie', value: stats.streak, note: 'Tage aktiv' },
    { icon: '◷', label: 'App-Zeit', value: stats.usageTime, note: 'insgesamt genutzt' },
  ]

  return (
    <section className="flowtree-dashboard" aria-label="Flowtree Fortschritt">
      <div className="flowtree-card">
        <div className="flowtree-hero-row">
          <div className="flowtree-card-copy">
            <span>Dein Flowtree</span>
            <h2>{currentLevel.name}</h2>
            <p>Stufe {currentLevel.level} von {flowtreeLevels.length}</p>
            <small>{hasProgress ? 'Dein Fortschritt basiert auf echten Aktivitäten.' : 'Starte deine erste Routine oder deinen ersten Check-in.'}</small>
          </div>

          <div className="flowtree-visual-panel">
            <img className="flowtree-stage-image" src={currentLevel.image} alt={`Flowtree-Stufe ${currentLevel.name}`} />
            <img className="flowtree-mascot-image" src={mascotImage} alt="MyFlow Maskottchen neben dem Flowtree" />
          </div>
        </div>

        <div className="flowtree-points-panel">
          <div className="flowtree-points-head">
            <div>
              <span>Wachstumspunkte</span>
              <strong>{pointsRangeText}</strong>
            </div>
            <small>{targetText}</small>
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
        </div>

        <div className="flowtree-level-rail" aria-label="Flowtree Entwicklungsstufen">
          {flowtreeLevels.map((level, index) => {
            const isCurrent = level.id === currentLevel.id
            const isReached = stats.growthPoints >= level.minPoints

            return (
              <div className={`flowtree-level-step ${isCurrent ? 'current' : ''} ${isReached ? 'reached' : ''}`} key={level.id}>
                <div className="flowtree-step-node">
                  <img src={level.image} alt="" aria-hidden="true" />
                </div>
                <small>{level.name}</small>
                {index < flowtreeLevels.length - 1 && <i aria-hidden="true" />}
              </div>
            )
          })}
        </div>
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
            <span>Fortschritt</span>
            <h2>Grafischer Überblick</h2>
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
              <span>Heute</span>
            </div>
            <div>
              <span>Tagesziele</span>
              <p>{stats.dailyGoalCompleted} von {stats.dailyGoalTotal} Routinen erledigt</p>
            </div>
          </article>

          <article className="flowtree-bars-card">
            <div>
              <span>Woche</span>
              <strong>{stats.activeDays.length}/7</strong>
            </div>
            <div className="flowtree-week-bars" aria-label="Aktive Tage als Balkendiagramm">
              {stats.week.map((day) => (
                <div key={day.dateKey}>
                  <i style={{ height: day.active ? '100%' : '18%' }} />
                  <span>{day.label}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="flowtree-streak-card">
            <div>
              <span>Streak</span>
              <strong>{stats.streak} Tage</strong>
              <p>{stats.streak >= 7 ? '7 Tage in Folge aktiv' : `${Math.max(7 - stats.streak, 0)} Tage bis zur 7er-Serie`}</p>
            </div>
            <div className="flowtree-streak-dots" aria-label={`${stats.streak} Tage in Folge aktiv`}>
              {streakDays.map((active, index) => (
                <span className={active ? 'active' : ''} key={index} />
              ))}
            </div>
          </article>
        </div>
      </section>

      <article className="flowtree-explain-card">
        <span>So wächst dein Flowtree</span>
        <p>Erledige Check-ins und Routinen, um Wachstumspunkte zu sammeln und deinen Flowtree wachsen zu lassen.</p>
      </article>
    </section>
  )
}

export default FlowtreeProgress
