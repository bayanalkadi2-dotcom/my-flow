import mascotImage from '../../assets/flow-character-robot.jpg'

const mascotLevels = [
  {
    minProgress: 0,
    maxProgress: 24,
    tone: 'starter',
    label: 'Start',
    message: 'Dein Weg beginnt.',
  },
  {
    minProgress: 25,
    maxProgress: 49,
    tone: 'bronze',
    label: 'Im Aufbau',
    message: 'Du entwickelst deine Routine weiter.',
  },
  {
    minProgress: 50,
    maxProgress: 74,
    tone: 'silver',
    label: 'Fortgeschritten',
    message: 'Du bist gut im Flow.',
  },
  {
    minProgress: 75,
    maxProgress: 99,
    tone: 'gold',
    label: 'Stark',
    message: 'Du bist kurz vor der nächsten Stufe.',
  },
  {
    minProgress: 100,
    maxProgress: Infinity,
    tone: 'complete',
    label: 'Level abgeschlossen',
    message: 'Du hast die aktuelle Stufe erreicht.',
  },
]

function getMascotLevel(progressPercent) {
  return mascotLevels.find((level) => progressPercent >= level.minProgress && progressPercent <= level.maxProgress) ?? mascotLevels[0]
}

function ProgressMascot({ currentLevel, nextLevel, nextLevelPoints, points, progressPercent }) {
  const progress = Math.min(Math.max(Math.round(Number(progressPercent) || 0), 0), 100)
  const mascot = getMascotLevel(progress)
  const nextText = nextLevel === 'Max Level'
    ? 'Maximale Stufe erreicht'
    : `${nextLevelPoints} Punkte bis ${nextLevel}`

  return (
    <aside className={`progress-mascot progress-mascot-${mascot.tone}`} aria-label={`Fortschrittsmaskottchen: ${currentLevel}`}>
      <div className="progress-mascot-image-wrap">
        <img src={mascotImage} alt={`MyFlow Maskottchen für Level ${currentLevel}`} />
      </div>
      <div className="progress-mascot-copy">
        <span>{mascot.label}</span>
        <strong>Level: {currentLevel}</strong>
        <p>{points} Punkte · {mascot.message}</p>
        <div className="progress-mascot-track" aria-label={`${progress}% bis zur nächsten Stufe`}>
          <span style={{ width: `${progress}%` }} />
        </div>
        <small>{progress}% · {nextText}</small>
      </div>
    </aside>
  )
}

export default ProgressMascot
