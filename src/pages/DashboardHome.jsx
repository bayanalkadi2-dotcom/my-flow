import { useMemo, useState } from 'react'

const checkInOptions = {
  energy: [
    { label: 'Niedrig', value: 1 },
    { label: 'Mittel', value: 2 },
    { label: 'Hoch', value: 3 },
  ],
  stress: [
    { label: 'Ruhig', value: 1 },
    { label: 'Angespannt', value: 2 },
    { label: 'Stressig', value: 3 },
  ],
  time: [
    { label: '2 Min', value: 2 },
    { label: '5 Min', value: 5 },
    { label: '10 Min', value: 10 },
  ],
}

function getFlowCoachDecision({ habits, dayProgress, energy, stress, time }) {
  const openHabits = habits.filter((habit) => !habit.done && habit.progress < 100)
  const almostDoneHabit = openHabits
    .filter((habit) => habit.progress >= 60)
    .sort((firstHabit, secondHabit) => secondHabit.progress - firstHabit.progress)[0]
  const lowEnergy = energy === 1
  const highStress = stress === 3
  const shortTime = time <= 2
  const hasManyOpenHabits = openHabits.length >= 4

  if (dayProgress >= 85 || openHabits.length === 0) {
    return {
      action: 'end_session',
      title: 'Flow abschliessen',
      badge: 'Session beenden',
      recommendation: 'Fuer heute ist genug geschafft. Ein ruhiger Abschluss passt jetzt besser als noch mehr Druck.',
      activity: 'Kurze Reflexion',
      duration: '1 Minute',
      reason: 'Dein Fortschritt ist sehr hoch oder alle Routinen sind erledigt.',
    }
  }

  if (lowEnergy && highStress) {
    return {
      action: 'pause',
      title: 'Pause statt mehr Aufgaben',
      badge: 'Pause',
      recommendation: 'Mach keine weitere intensive Aktivitaet. Eine kleine Atem- oder Ruhepause ist sinnvoller.',
      activity: 'Atemreset',
      duration: '2 Minuten',
      reason: 'Energie ist niedrig und Stress ist hoch. Die App reduziert deshalb die Belastung.',
    }
  }

  if (highStress || shortTime) {
    return {
      action: 'switch_activity',
      title: 'Sanft wechseln',
      badge: 'Alternative',
      recommendation: 'Starte mit einer kurzen, einfachen Aktivitaet statt einer grossen Routine.',
      activity: highStress ? 'Atemuebung' : 'Mini-Fokus',
      duration: shortTime ? '2 Minuten' : '5 Minuten',
      reason: highStress
        ? 'Stress ist erhoeht. Eine beruhigende Aktivitaet hilft eher als direkt weiterzuarbeiten.'
        : 'Du hast wenig Zeit. Ein kleiner Schritt haelt den Flow realistisch.',
    }
  }

  if (almostDoneHabit) {
    return {
      action: 'continue',
      title: 'Dranbleiben',
      badge: 'Weiter machen',
      recommendation: `Fuehre "${almostDoneHabit.title}" weiter, weil du dort schon nah am Ziel bist.`,
      activity: almostDoneHabit.title,
      duration: time >= 10 ? '5-10 Minuten' : '2-5 Minuten',
      reason: 'Eine fast fertige Routine gibt schnell sichtbaren Fortschritt.',
    }
  }

  if (hasManyOpenHabits) {
    return {
      action: 'switch_activity',
      title: 'Klein anfangen',
      badge: 'Priorisieren',
      recommendation: 'Waehle eine kurze Routine, damit der Tag uebersichtlich bleibt.',
      activity: openHabits[0]?.title ?? 'Mini-Routine',
      duration: '2-5 Minuten',
      reason: 'Es sind mehrere Routinen offen. Die KI empfiehlt einen kleinen naechsten Schritt.',
    }
  }

  return {
    action: 'continue',
    title: 'Weiter im Flow',
    badge: 'Weiter machen',
    recommendation: 'Eine weitere Aktivitaet passt gerade gut zu deiner Tagesform.',
    activity: openHabits[0]?.title ?? 'Freie Aktivitaet',
    duration: time >= 10 ? '10 Minuten' : '5 Minuten',
    reason: 'Energie, Stress und Fortschritt wirken stabil genug fuer einen naechsten Schritt.',
  }
}

function DashboardHome({ habits, profileName, tone }) {
  const [flowCheckIn, setFlowCheckIn] = useState({
    energy: 2,
    stress: 2,
    time: 5,
  })
  const completedHabits = habits.filter((habit) => habit.done || habit.progress >= 100).length
  const totalProgress = habits.reduce((sum, habit) => sum + habit.progress, 0)
  const dayProgress = habits.length ? Math.round(totalProgress / habits.length) : 0
  const openHabits = habits.length - completedHabits
  const topFocus = habits
    .filter((habit) => !habit.done && habit.progress < 100)
    .sort((firstHabit, secondHabit) => secondHabit.progress - firstHabit.progress)
    .slice(0, 3)
  const dashboardMessage = tone.dashboardMessage
    .replace('{count}', completedHabits)
    .replace('{total}', habits.length)
  const firstName = profileName.trim() || 'Nina'
  const flowDecision = useMemo(
    () =>
      getFlowCoachDecision({
        habits,
        dayProgress,
        ...flowCheckIn,
      }),
    [dayProgress, flowCheckIn, habits],
  )

  function updateFlowCheckIn(key, value) {
    setFlowCheckIn((currentCheckIn) => ({
      ...currentCheckIn,
      [key]: value,
    }))
  }

  return (
    <section className="screen home-screen">
      <div className="page-header">
        <div>
          <p className="eyebrow">Hey {firstName}, schön dass du da bist!</p>
          <h1>Wie läuft dein Tag?</h1>
          <p className="lead">{dashboardMessage}</p>
        </div>
      </div>

      <article className="day-overview-card">
        <div>
          <span>Tagesgefühl</span>
          <h2>{dayProgress >= 70 ? 'Du bist gut im Flow.' : 'Heute ist noch Luft nach oben.'}</h2>
          <p>{tone.progressMessage}</p>
          <div className="day-progress-track" aria-label={`${dayProgress}% Tagesfortschritt`}>
            <span style={{ width: `${dayProgress}%` }} />
          </div>
        </div>
        <strong>
          <span>{dayProgress}%</span>
        </strong>
      </article>

      <div className="home-status-grid">
        <article className="status-card-done">
          <span>Erledigt</span>
          <strong>{completedHabits}</strong>
          <p>Routinen geschafft</p>
        </article>
        <article className="status-card-open">
          <span>Offen</span>
          <strong>{openHabits}</strong>
          <p>noch im Tag</p>
        </article>
      </div>

      <section className={`flow-coach-card flow-coach-${flowDecision.action}`}>
        <div className="flow-coach-header">
          <div>
            <span>MyFlow KI Coach</span>
            <h2>{flowDecision.title}</h2>
          </div>
          <strong>{flowDecision.badge}</strong>
        </div>

        <div className="flow-checkin-grid">
          <FlowSegment
            label="Energie"
            options={checkInOptions.energy}
            value={flowCheckIn.energy}
            onChange={(value) => updateFlowCheckIn('energy', value)}
          />
          <FlowSegment
            label="Stress"
            options={checkInOptions.stress}
            value={flowCheckIn.stress}
            onChange={(value) => updateFlowCheckIn('stress', value)}
          />
          <FlowSegment
            label="Zeit"
            options={checkInOptions.time}
            value={flowCheckIn.time}
            onChange={(value) => updateFlowCheckIn('time', value)}
          />
        </div>

        <div className="flow-recommendation">
          <p>{flowDecision.recommendation}</p>
          <div>
            <span>Empfehlung</span>
            <strong>{flowDecision.activity}</strong>
            <small>{flowDecision.duration}</small>
          </div>
        </div>

        <p className="flow-reason">{flowDecision.reason}</p>
      </section>

      <section className="daily-focus-card">
        <div className="daily-focus-header">
          <span>Heute wichtig</span>
          <small>Top Fokus</small>
        </div>
        {topFocus.length > 0 ? (
          <div className="daily-focus-list">
            {topFocus.map((habit) => (
              <div key={habit.id}>
                <div>
                  <strong>{habit.title}</strong>
                  <small>{habit.detail}</small>
                </div>
                <span>{habit.progress}%</span>
                <div className="focus-progress-track" aria-hidden="true">
                  <span style={{ width: `${habit.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Alles erledigt. Heute darf sich leicht anfühlen.</p>
        )}
      </section>

      <section className="day-plan-card">
        <span>Tagesplan</span>
        <div>
          <strong>Morgen</strong>
          <p>kurz starten und Wasser nicht vergessen</p>
        </div>
        <div>
          <strong>Mittag</strong>
          <p>eine kleine Bewegungspause einbauen</p>
        </div>
        <div>
          <strong>Abend</strong>
          <p>den Tag ruhig abschließen und Fortschritt ansehen</p>
        </div>
      </section>

      <article className="home-motivation-card">
        <span>Gedanke für heute</span>
        <p>Du musst heute nicht perfekt sein. Ein kleiner Schritt zählt schon als Richtung.</p>
      </article>
    </section>
  )
}

function FlowSegment({ label, options, value, onChange }) {
  return (
    <div className="flow-segment">
      <span>{label}</span>
      <div>
        {options.map((option) => (
          <button
            className={value === option.value ? 'selected' : ''}
            key={option.label}
            onClick={() => onChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default DashboardHome

