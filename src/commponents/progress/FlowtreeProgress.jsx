import mascotImage from '../../assets/flow-character-robot-crossed-card.png'
import { flowtreeLevels } from '../../data/flowtreeLevels'

function FlowtreeProgress({ stats }) {
  const { currentLevel, nextLevel, nextLevelPoints, pointsToNextLevel, progressPercent } = stats.flowtree
  const hasProgress = stats.growthPoints > 0
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

      <section className="flowtree-week-card">
        <div className="stats-section-header flowtree-week-header">
          <div>
            <span>Wochenübersicht</span>
            <h2>Deine Woche im Überblick</h2>
          </div>
          <button type="button">Diese Woche</button>
        </div>
        <div className="flowtree-week-days">
          {stats.week.map((day) => (
            <div className={day.active ? 'active' : ''} key={day.dateKey}>
              <span>{day.label}</span>
              <b>{day.active ? '✓' : ''}</b>
            </div>
          ))}
        </div>
        <div className="flowtree-week-meta">
          <span>{stats.activeDays.length} von 7 Tagen aktiv</span>
          <strong>{stats.weekProgress}%</strong>
        </div>
        <div
          className="flowtree-progress-track"
          role="progressbar"
          aria-label="Aktive Tage dieser Woche"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={stats.weekProgress}
        >
          <span style={{ width: `${stats.weekProgress}%` }} />
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
