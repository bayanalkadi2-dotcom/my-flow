function DashboardHome({ habits, profileName, tone }) {
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
        </div>
        <strong>{dayProgress}%</strong>
      </article>

      <div className="home-status-grid">
        <article>
          <span>Erledigt</span>
          <strong>{completedHabits}</strong>
          <p>Routinen geschafft</p>
        </article>
        <article>
          <span>Offen</span>
          <strong>{openHabits}</strong>
          <p>noch im Tag</p>
        </article>
      </div>

      <section className="daily-focus-card">
        <div className="daily-focus-header">
          <span>Heute wichtig</span>
          <small>Top Fokus</small>
        </div>
        {topFocus.length > 0 ? (
          <div className="daily-focus-list">
            {topFocus.map((habit) => (
              <div key={habit.id}>
                <strong>{habit.title}</strong>
                <span>{habit.progress}%</span>
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

export default DashboardHome
