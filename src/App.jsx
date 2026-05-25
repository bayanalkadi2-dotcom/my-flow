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

const welcomeFeatures = [
  {
    icon: '◎',
    title: 'Setze Ziele',
    text: 'Plane deine Routinen.',
    tone: 'purple',
  },
  {
    icon: '⌁',
    title: 'Fortschritt',
    text: 'Sieh deine Entwicklung.',
    tone: 'pink',
  },
  {
    icon: '⌂',
    title: 'Bleib dran',
    text: 'Erhalte Erinnerungen.',
    tone: 'blue',
  },
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
          <div className="orb orb-one" />
          <div className="orb orb-two" />
          <div className="soft-shape shape-pink" />
          <div className="soft-shape shape-blue" />
          <div className="leaf-shape" aria-hidden="true" />
          <div className="logo-stage">
            <span className="ring ring-one" />
            <span className="ring ring-two" />
            <img src={logo} alt="MyFlow Logo" className="app-logo hero-logo" />
          </div>
          <p className="wellness-badge">♡ Dein Wohlbefinden. Dein Flow.</p>
          <div className="brand-title-wrap">
            <h1>MyFlow</h1>
          </div>
          <p className="welcome-category">
            <span aria-hidden="true">✦</span>
            Gesundheit, Routinen und Motivation
            <span aria-hidden="true">✦</span>
          </p>
          <p className="lead welcome-copy">
            Baue gesunde Gewohnheiten auf, strukturiere deinen Studienalltag und bleib langfristig motiviert.
          </p>
          <div className="actions welcome-actions">
            <button className="primary-cta" onClick={() => setScreen('dashboard')}>
              <span className="button-orb" aria-hidden="true">✦</span>
              <span>Loslegen</span>
              <span className="button-orb arrow-orb" aria-hidden="true">→</span>
            </button>
            <button className="secondary-button login-cta" onClick={() => setScreen('login')}>
              <span className="button-orb user-orb" aria-hidden="true">
                <svg viewBox="0 0 24 24" role="img">
                  <path d="M12 12.5a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4Z" />
                  <path d="M4.8 20.2c.8-3.5 3.5-5.6 7.2-5.6s6.4 2.1 7.2 5.6" />
                </svg>
              </span>
              <span>Einloggen</span>
              <span className="login-arrow" aria-hidden="true">→</span>
            </button>
          </div>
          <div className="feature-strip">
            {welcomeFeatures.map((feature) => (
              <article className="welcome-feature" key={feature.title}>
                <span className={`feature-icon ${feature.tone}`}>{feature.icon}</span>
                <div>
                  <h2>{feature.title}</h2>
                  <p>{feature.text}</p>
                </div>
              </article>
            ))}
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
