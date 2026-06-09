import { useMemo, useState } from 'react'

const checkInValues = {
  energy: [1, 2, 3],
  stress: [1, 2, 3],
  time: [2, 5, 10],
}

function getCheckInOptions(t) {
  return {
    energy: t.dashboard.checkIn.energy.map((label, index) => ({ label, value: checkInValues.energy[index] })),
    stress: t.dashboard.checkIn.stress.map((label, index) => ({ label, value: checkInValues.stress[index] })),
    time: t.dashboard.checkIn.time.map((label, index) => ({ label, value: checkInValues.time[index] })),
  }
}

function localizeDuration(duration, languageStyle) {
  if (languageStyle === 'english') {
    return duration
      .replace('1 Minute', '1 minute')
      .replace('2 Minuten', '2 minutes')
      .replace('5 Minuten', '5 minutes')
      .replace('10 Minuten', '10 minutes')
      .replace('5-10 Minuten', '5-10 minutes')
      .replace('2-5 Minuten', '2-5 minutes')
  }

  if (languageStyle === 'turkish') {
    return duration
      .replace('1 Minute', '1 dk')
      .replace('2 Minuten', '2 dk')
      .replace('5 Minuten', '5 dk')
      .replace('10 Minuten', '10 dk')
      .replace('5-10 Minuten', '5-10 dk')
      .replace('2-5 Minuten', '2-5 dk')
  }

  return duration
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
      recommendation: `Fuehre "${almostDoneHabit.displayTitle ?? almostDoneHabit.title}" weiter, weil du dort schon nah am Ziel bist.`,
      activity: almostDoneHabit.displayTitle ?? almostDoneHabit.title,
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
      activity: openHabits[0]?.displayTitle ?? openHabits[0]?.title ?? 'Mini-Routine',
      duration: '2-5 Minuten',
      reason: 'Es sind mehrere Routinen offen. Die KI empfiehlt einen kleinen naechsten Schritt.',
    }
  }

  return {
    action: 'continue',
    title: 'Weiter im Flow',
    badge: 'Weiter machen',
    recommendation: 'Eine weitere Aktivitaet passt gerade gut zu deiner Tagesform.',
    activity: openHabits[0]?.displayTitle ?? openHabits[0]?.title ?? 'Freie Aktivitaet',
    duration: time >= 10 ? '10 Minuten' : '5 Minuten',
    reason: 'Energie, Stress und Fortschritt wirken stabil genug fuer einen naechsten Schritt.',
  }
}

function localizeFlowDecision(decision, languageStyle) {
  if (languageStyle === 'english') {
    const text = {
      end_session: {
        title: 'Wrap up flow',
        badge: 'End session',
        recommendation: 'You have done enough for today. A calm finish fits better than more pressure.',
        activity: 'Short reflection',
        reason: 'Your progress is very high or all routines are complete.',
      },
      pause: {
        title: 'Pause instead of more tasks',
        badge: 'Pause',
        recommendation: 'Do not start another intense activity. A small breathing or rest break is better now.',
        activity: 'Breathing reset',
        reason: 'Energy is low and stress is high. The app reduces the load.',
      },
      switch_activity: {
        title: 'Switch gently',
        badge: 'Alternative',
        recommendation: 'Start with a short, simple activity instead of a big routine.',
        activity: decision.activity === 'Atemuebung' ? 'Breathing exercise' : decision.activity === 'Mini-Fokus' ? 'Mini focus' : decision.activity,
        reason: 'A small next step keeps the flow realistic.',
      },
      continue: {
        title: 'Keep going',
        badge: 'Continue',
        recommendation: `Continue with "${decision.activity}" because it fits your current day.`,
        reason: 'Energy, stress and progress look stable enough for a next step.',
      },
    }

    return { ...decision, ...text[decision.action], duration: localizeDuration(decision.duration, languageStyle) }
  }

  if (languageStyle === 'turkish') {
    const text = {
      end_session: {
        title: 'Akisi tamamla',
        badge: 'Oturumu bitir',
        recommendation: 'Bugun icin yeterince yaptin. Sakin bir kapanis daha iyi olur.',
        activity: 'Kisa yansitma',
        reason: 'Ilerlemen cok yuksek veya tum rutinler tamamlandi.',
      },
      pause: {
        title: 'Daha fazla gorev yerine mola',
        badge: 'Mola',
        recommendation: 'Yeni yogun bir aktiviteye baslama. Kisa bir nefes veya dinlenme molasi daha iyi.',
        activity: 'Nefes molasi',
        reason: 'Enerji dusuk ve stres yuksek. App bu yuzden yuku azaltir.',
      },
      switch_activity: {
        title: 'Yumusak gecis',
        badge: 'Alternatif',
        recommendation: 'Buyuk bir rutin yerine kisa ve kolay bir aktiviteyle basla.',
        activity: decision.activity === 'Atemuebung' ? 'Nefes egzersizi' : decision.activity === 'Mini-Fokus' ? 'Mini odak' : decision.activity,
        reason: 'Kucuk bir sonraki adim akisi gercekci tutar.',
      },
      continue: {
        title: 'Devam et',
        badge: 'Devam',
        recommendation: `"${decision.activity}" ile devam et; su anki gunune uyuyor.`,
        reason: 'Enerji, stres ve ilerleme sonraki adim icin yeterince dengeli gorunuyor.',
      },
    }

    return { ...decision, ...text[decision.action], duration: localizeDuration(decision.duration, languageStyle) }
  }

  return decision
}

function DashboardHome({ habits, languageStyle, profileName, t }) {
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
  const dashboardMessage = t.dashboard.message
    .replace('{count}', completedHabits)
    .replace('{total}', habits.length)
  const firstName = profileName.trim() || 'Nina'
  const checkInOptions = getCheckInOptions(t)
  const flowDecision = useMemo(
    () =>
      localizeFlowDecision(
        getFlowCoachDecision({
          habits,
          dayProgress,
          ...flowCheckIn,
        }),
        languageStyle,
      ),
    [dayProgress, flowCheckIn, habits, languageStyle],
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
          <p className="eyebrow">{t.dashboard.hello.replace('{name}', firstName)}</p>
          <h1>{t.dashboard.title}</h1>
          <p className="lead">{dashboardMessage}</p>
        </div>
      </div>

      <article className="day-overview-card">
        <div>
          <span>{t.dashboard.dayFeeling}</span>
          <h2>{dayProgress >= 70 ? t.dashboard.goodFlow : t.dashboard.moreRoom}</h2>
          <p>{t.dashboard.progressMessage}</p>
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
          <span>{t.dashboard.done}</span>
          <strong>{completedHabits}</strong>
          <p>{t.dashboard.doneText}</p>
        </article>
        <article className="status-card-open">
          <span>{t.dashboard.open}</span>
          <strong>{openHabits}</strong>
          <p>{t.dashboard.openText}</p>
        </article>
      </div>

      <section className={`flow-coach-card flow-coach-${flowDecision.action}`}>
        <div className="flow-coach-header">
          <div>
            <span>{t.dashboard.coach}</span>
            <h2>{flowDecision.title}</h2>
          </div>
          <strong>{flowDecision.badge}</strong>
        </div>

        <div className="flow-checkin-grid">
          <FlowSegment
            label={t.dashboard.energy}
            options={checkInOptions.energy}
            value={flowCheckIn.energy}
            onChange={(value) => updateFlowCheckIn('energy', value)}
          />
          <FlowSegment
            label={t.dashboard.stress}
            options={checkInOptions.stress}
            value={flowCheckIn.stress}
            onChange={(value) => updateFlowCheckIn('stress', value)}
          />
          <FlowSegment
            label={t.dashboard.time}
            options={checkInOptions.time}
            value={flowCheckIn.time}
            onChange={(value) => updateFlowCheckIn('time', value)}
          />
        </div>

        <div className="flow-recommendation">
          <p>{flowDecision.recommendation}</p>
          <div>
            <span>{t.dashboard.recommendation}</span>
            <strong>{flowDecision.activity}</strong>
            <small>{flowDecision.duration}</small>
          </div>
        </div>

        <p className="flow-reason">{flowDecision.reason}</p>
      </section>

      <section className="daily-focus-card">
        <div className="daily-focus-header">
          <span>{t.dashboard.focus}</span>
          <small>{t.dashboard.topFocus}</small>
        </div>
        {topFocus.length > 0 ? (
          <div className="daily-focus-list">
            {topFocus.map((habit) => (
              <div key={habit.id}>
                <div>
                  <strong>{habit.displayTitle}</strong>
                  <small>{habit.displayDetail}</small>
                </div>
                <span>{habit.progress}%</span>
                <div className="focus-progress-track" aria-hidden="true">
                  <span style={{ width: `${habit.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>{t.dashboard.allDone}</p>
        )}
      </section>

      <section className="day-plan-card">
        <span>{t.dashboard.dayPlan}</span>
        <div>
          <strong>{t.dashboard.morning}</strong>
          <p>{t.dashboard.morningText}</p>
        </div>
        <div>
          <strong>{t.dashboard.noon}</strong>
          <p>{t.dashboard.noonText}</p>
        </div>
        <div>
          <strong>{t.dashboard.evening}</strong>
          <p>{t.dashboard.eveningText}</p>
        </div>
      </section>

      <article className="home-motivation-card">
        <span>{t.dashboard.thought}</span>
        <p>{t.dashboard.thoughtText}</p>
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

