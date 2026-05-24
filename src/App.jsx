import { useMemo, useState } from 'react'
import logo from './assets/Icon Gruppe H.png'
import './App.css'

const goals = [
  'Wasser trinken',
  'Bewegung',
  'Schlaf',
  'Lernen',
  'Pausen',
  'Mental Health',
]

const habits = [
  { title: '2 Liter Wasser', detail: '1,5 L geschafft', progress: 75, status: 'Heute offen' },
  { title: '30 Minuten Bewegung', detail: 'Morgenroutine erledigt', progress: 100, status: 'Erledigt' },
  { title: 'Lernfokus', detail: '25 von 60 Minuten', progress: 42, status: 'Aktiv' },
  { title: 'Achtsame Pause', detail: '10 Minuten einplanen', progress: 0, status: 'Offen' },
]

const challenges = [
  { title: '7 Tage Wasser-Challenge', members: '12 Teilnehmende', progress: 57 },
  { title: 'Lernfokus-Woche', members: 'Freunde: 3 aktiv', progress: 74 },
  { title: 'Sleep Reset', members: 'Besser schlafen', progress: 35 },
]

const navItems = [
  { id: 'dashboard', label: 'Home' },
  { id: 'habits', label: 'Habits' },
  { id: 'progress', label: 'Fortschritt' },
  { id: 'challenges', label: 'Challenges' },
  { id: 'profile', label: 'Profil' },
]

function App() {
  const [screen, setScreen] = useState('start')
  const [selectedGoals, setSelectedGoals] = useState(['Wasser trinken', 'Lernen', 'Pausen'])

  const completedHabits = useMemo(
    () => habits.filter((habit) => habit.progress === 100).length,
    [],
  )

  function toggleGoal(goal) {
    setSelectedGoals((currentGoals) =>
      currentGoals.includes(goal)
        ? currentGoals.filter((currentGoal) => currentGoal !== goal)
        : [...currentGoals, goal],
    )
  }

  function renderScreen() {
    if (screen === 'start') {
      return (
        <section className="screen welcome-screen">
          <div className="hero-copy">
            <img src={logo} alt="MyFlow Logo" className="app-logo" />
            <p className="eyebrow">Gesundheit, Routinen und Motivation</p>
            <h1>MyFlow</h1>
            <p className="lead">
              Baue gesunde Gewohnheiten auf, strukturiere deinen Studienalltag und bleib
              langfristig motiviert.
            </p>
            <div className="actions">
              <button onClick={() => setScreen('goals')}>Loslegen</button>
              <button className="secondary-button" onClick={() => setScreen('login')}>
                Einloggen
              </button>
            </div>
          </div>
          <div className="phone-preview" aria-label="MyFlow Vorschau">
            <div className="preview-top">
              <span>Heute</span>
              <strong>72%</strong>
            </div>
            <div className="preview-ring">5</div>
            <p>5 Tage im Flow</p>
            <div className="mini-list">
              <span>Wasser trinken</span>
              <span>Bewegung</span>
              <span>Lernfokus</span>
            </div>
          </div>
        </section>
      )
    }

    if (screen === 'login') {
      return (
        <section className="screen auth-screen compact-screen">
          <img src={logo} alt="MyFlow Logo" className="small-logo" />
          <p className="eyebrow">Willkommen zurück</p>
          <h1>Einloggen</h1>
          <label>
            E-Mail
            <input type="email" placeholder="name@hochschule.de" />
          </label>
          <label>
            Passwort
            <input type="password" placeholder="Passwort" />
          </label>
          <button onClick={() => setScreen('dashboard')}>Einloggen</button>
          <button className="text-button" onClick={() => setScreen('start')}>
            Zurück zur Startseite
          </button>
        </section>
      )
    }

    if (screen === 'goals') {
      return (
        <section className="screen compact-screen">
          <p className="eyebrow">Personalisierung</p>
          <h1>Was möchtest du verbessern?</h1>
          <p className="lead">
            Wähle die Bereiche aus, die MyFlow für deinen Alltag in den Vordergrund stellen soll.
          </p>
          <div className="goal-grid">
            {goals.map((goal) => (
              <button
                className={`goal-card ${selectedGoals.includes(goal) ? 'is-selected' : ''}`}
                key={goal}
                onClick={() => toggleGoal(goal)}
              >
                {goal}
              </button>
            ))}
          </div>
          <button onClick={() => setScreen('dashboard')}>Mein Dashboard erstellen</button>
        </section>
      )
    }

    if (screen === 'dashboard') {
      return (
        <section className="screen">
          <div className="page-header">
            <div>
              <p className="eyebrow">Tagesübersicht</p>
              <h1>Heute im Flow</h1>
              <p className="lead">Du hast {completedHabits} von {habits.length} Routinen erledigt.</p>
            </div>
            <button onClick={() => setScreen('addHabit')}>+ Habit</button>
          </div>
          <div className="dashboard-grid">
            <article className="stat-card big-stat">
              <span>Wochenziel</span>
              <strong>72%</strong>
              <p>Du bist auf einem sehr guten Weg.</p>
            </article>
            <article className="stat-card">
              <span>Streak</span>
              <strong>5 Tage</strong>
              <p>Bleib dran, kleine Schritte zählen.</p>
            </article>
            <article className="stat-card">
              <span>Fokuszeit</span>
              <strong>85 Min</strong>
              <p>Heute gesammelt.</p>
            </article>
          </div>
          <HabitList onOpenAdd={() => setScreen('addHabit')} />
        </section>
      )
    }

    if (screen === 'habits') {
      return (
        <section className="screen">
          <div className="page-header">
            <div>
              <p className="eyebrow">Routinen</p>
              <h1>Deine Habits</h1>
              <p className="lead">Verwalte alles, was dir im Alltag wichtig ist.</p>
            </div>
            <button onClick={() => setScreen('addHabit')}>Neue Gewohnheit</button>
          </div>
          <HabitList onOpenAdd={() => setScreen('addHabit')} />
        </section>
      )
    }

    if (screen === 'addHabit') {
      return (
        <section className="screen compact-screen">
          <p className="eyebrow">Neue Routine</p>
          <h1>Gewohnheit hinzufügen</h1>
          <label>
            Name der Gewohnheit
            <input placeholder="z. B. 2 Liter Wasser trinken" />
          </label>
          <label>
            Kategorie
            <select defaultValue="Körperliche Gesundheit">
              <option>Körperliche Gesundheit</option>
              <option>Mentale Gesundheit</option>
              <option>Lernen</option>
              <option>Schlaf</option>
            </select>
          </label>
          <label>
            Erinnerung
            <input type="time" defaultValue="09:00" />
          </label>
          <label>
            Häufigkeit
            <select defaultValue="Täglich">
              <option>Täglich</option>
              <option>Wochentags</option>
              <option>3x pro Woche</option>
            </select>
          </label>
          <div className="actions">
            <button onClick={() => setScreen('habits')}>Speichern</button>
            <button className="secondary-button" onClick={() => setScreen('dashboard')}>
              Abbrechen
            </button>
          </div>
        </section>
      )
    }

    if (screen === 'progress') {
      return (
        <section className="screen">
          <p className="eyebrow">Statistik</p>
          <h1>Dein Fortschritt</h1>
          <p className="lead">So entwickeln sich deine Routinen in dieser Woche.</p>
          <div className="chart-card">
            {[52, 68, 45, 88, 72, 64, 80].map((height, index) => (
              <div className="bar-wrap" key={height + index}>
                <div className="bar" style={{ height: `${height}%` }} />
                <span>{['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'][index]}</span>
              </div>
            ))}
          </div>
          <div className="dashboard-grid">
            <article className="stat-card">
              <span>Beste Serie</span>
              <strong>12 Tage</strong>
            </article>
            <article className="stat-card">
              <span>Stärkster Habit</span>
              <strong>Wasser</strong>
            </article>
            <article className="stat-card">
              <span>Wochenbilanz</span>
              <strong>5/7 Tage</strong>
            </article>
          </div>
        </section>
      )
    }

    if (screen === 'challenges') {
      return (
        <section className="screen">
          <p className="eyebrow">Soziale Motivation</p>
          <h1>Challenges</h1>
          <p className="lead">Bleib gemeinsam mit Freundinnen, Freunden oder deiner Lerngruppe dran.</p>
          <div className="card-grid">
            {challenges.map((challenge) => (
              <article className="challenge-card" key={challenge.title}>
                <h2>{challenge.title}</h2>
                <p>{challenge.members}</p>
                <Progress value={challenge.progress} />
                <button>Challenge starten</button>
              </article>
            ))}
          </div>
        </section>
      )
    }

    return (
      <section className="screen compact-screen">
        <img src={logo} alt="MyFlow Logo" className="small-logo" />
        <p className="eyebrow">Einstellungen</p>
        <h1>Profil</h1>
        <div className="settings-list">
          <div>
            <span>Name</span>
            <strong>Studentin</strong>
          </div>
          <div>
            <span>Sprachstil</span>
            <strong>Motivierend</strong>
          </div>
          <div>
            <span>Erinnerungen</span>
            <strong>Aktiv</strong>
          </div>
          <div>
            <span>Datenschutz</span>
            <strong>Privat</strong>
          </div>
        </div>
        <button onClick={() => setScreen('goals')}>Ziele bearbeiten</button>
      </section>
    )
  }

  return (
    <main className="app">
      <header className="topbar">
        <button className="brand" onClick={() => setScreen('start')}>
          <img src={logo} alt="" />
          <span>MyFlow</span>
        </button>
        <nav className="desktop-nav">
          {navItems.map((item) => (
            <button
              className={screen === item.id ? 'nav-item active' : 'nav-item'}
              key={item.id}
              onClick={() => setScreen(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      {renderScreen()}

      <nav className="bottom-nav">
        {navItems.map((item) => (
          <button
            className={screen === item.id ? 'bottom-item active' : 'bottom-item'}
            key={item.id}
            onClick={() => setScreen(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </main>
  )
}

function HabitList({ onOpenAdd }) {
  return (
    <div className="habit-list">
      {habits.map((habit) => (
        <article className="habit-card" key={habit.title}>
          <div>
            <h2>{habit.title}</h2>
            <p>{habit.detail}</p>
          </div>
          <div className="habit-side">
            <span className={habit.progress === 100 ? 'pill done' : 'pill'}>{habit.status}</span>
            <Progress value={habit.progress} />
          </div>
        </article>
      ))}
      <button className="wide-button" onClick={onOpenAdd}>Weitere Gewohnheit hinzufügen</button>
    </div>
  )
}

function Progress({ value }) {
  return (
    <div className="progress">
      <span style={{ width: `${value}%` }} />
    </div>
  )
}

export default App
