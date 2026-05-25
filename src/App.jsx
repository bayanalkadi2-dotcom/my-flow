import { useMemo, useState } from 'react'
import logo from './assets/Icon Gruppe H.png'
import './App.css'

const habits = [
  { title: 'Wasser trinken', detail: '6 / 8 Gläser', progress: 75, status: 'Offen' },
  { title: 'Bewegung', detail: '30 / 60 Minuten', progress: 50, status: 'Aktiv' },
  { title: 'Schlaf', detail: '7 h 30 min', progress: 90, status: 'Gut' },
  { title: 'Entspannung', detail: '10 / 15 Minuten', progress: 70, status: 'Offen' },
]

const navItems = [
  { id: 'dashboard', label: 'Home' },
  { id: 'habits', label: 'Routinen' },
  { id: 'progress', label: 'Statistik' },
  { id: 'profile', label: 'Profil' },
]

function App() {
  const [screen, setScreen] = useState('start')

  const completedHabits = useMemo(
    () => habits.filter((habit) => habit.progress >= 90).length,
    [],
  )

  function renderScreen() {
    if (screen === 'start') {
      return (
        <section className="screen welcome-screen">
          <img src={logo} alt="MyFlow Logo" className="app-logo" />
          <p className="eyebrow">Gesundheit, Routinen und Motivation</p>
          <h1>MyFlow</h1>
          <p className="lead">
            Baue gesunde Gewohnheiten auf, strukturiere deinen Studienalltag und bleib langfristig motiviert.
          </p>
          <div className="actions">
            <button onClick={() => setScreen('dashboard')}>Loslegen</button>
            <button className="secondary-button" onClick={() => setScreen('login')}>
              Einloggen
            </button>
          </div>
        </section>
      )
    }

    if (screen === 'login') {
      return (
        <section className="screen compact-screen">
          <button className="back-button" onClick={() => setScreen('start')}>←</button>
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
              <p className="lead">Du hast {completedHabits} von {habits.length} Routinen fast geschafft.</p>
            </div>
          </div>

          <article className="stat-card big-stat">
            <span>Tagesfortschritt</span>
            <strong>75%</strong>
            <p>3 von 4 Routinen erledigt.</p>
          </article>

          <HabitList />
        </section>
      )
    }

    if (screen === 'habits') {
      return (
        <section className="screen">
          <p className="eyebrow">Routinen</p>
          <h1>Meine Routinen</h1>
          <HabitList />
          <button className="wide-button">Neue Routine hinzufügen</button>
        </section>
      )
    }

    if (screen === 'progress') {
      return (
        <section className="screen">
          <p className="eyebrow">Statistik</p>
          <h1>Dein Fortschritt</h1>
          <div className="chart-card">
            {[55, 80, 45, 90, 65, 75, 60].map((height, index) => (
              <div className="bar-wrap" key={index}>
                <div className="bar" style={{ height: `${height}%` }} />
                <span>{['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'][index]}</span>
              </div>
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
          <div><span>Name</span><strong>Studentin</strong></div>
          <div><span>Erinnerungen</span><strong>Aktiv</strong></div>
          <div><span>Sprache</span><strong>Deutsch</strong></div>
          <div><span>Design</span><strong>Hell</strong></div>
        </div>
        <button onClick={() => setScreen('start')}>Abmelden</button>
      </section>
    )
  }

  return (
    <main className="app">
      {renderScreen()}

      {screen !== 'start' && screen !== 'login' && (
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
      )}
    </main>
  )
}

function HabitList() {
  return (
    <div className="habit-list">
      {habits.map((habit) => (
        <article className="habit-card" key={habit.title}>
          <div>
            <h2>{habit.title}</h2>
            <p>{habit.detail}</p>
          </div>
          <div className="habit-side">
            <span className="pill">{habit.status}</span>
            <Progress value={habit.progress} />
          </div>
        </article>
      ))}
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