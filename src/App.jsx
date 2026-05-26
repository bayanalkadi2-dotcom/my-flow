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

const languageStyles = {
  casual: {
    label: 'Locker',
    greeting: 'Hey, schön dass du da bist!',
    dashboardTitle: 'Heute im Flow',
    dashboardMessage: 'Du hast {count} von {total} Routinen fast geschafft. Weiter so!',
    progressMessage: 'Stark! Du bist heute richtig gut dabei.',
  },
  formal: {
    label: 'Förmlich',
    greeting: 'Willkommen bei MyFlow',
    dashboardTitle: 'Ihre Tagesübersicht',
    dashboardMessage: 'Sie haben {count} von {total} Routinen nahezu abgeschlossen.',
    progressMessage: 'Ihr Tagesziel entwickelt sich positiv.',
  },
}

function App() {
  const [screen, setScreen] = useState('start')
  const [languageStyle, setLanguageStyle] = useState('casual')
  const [showPassword, setShowPassword] = useState(false)

  const completedHabits = useMemo(
    () => habits.filter((habit) => habit.progress >= 90).length,
    [],
  )
  const tone = languageStyles[languageStyle]
  const dashboardMessage = tone.dashboardMessage
    .replace('{count}', completedHabits)
    .replace('{total}', habits.length)

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
        <section className="screen login-screen">
          <button className="login-back" onClick={() => setScreen('start')} aria-label="Zurück">
            ←
          </button>
          <header className="login-header">
            <h1>Willkommen zurück! <span aria-hidden="true">👋</span></h1>
            <p>Schön, dass du wieder da bist.</p>
          </header>
          <form className="login-form" onSubmit={(event) => event.preventDefault()}>
            <label className="login-field">
              <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3.5" y="5.5" width="17" height="13" rx="3" />
                <path d="m5 7 7 5.4L19 7" />
              </svg>
              <span>E-Mail</span>
              <input type="email" placeholder="name@beispiel.de" />
            </label>
            <label className="login-field password-field">
              <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="5" y="10" width="14" height="10" rx="2.5" />
                <path d="M8 10V7.7a4 4 0 0 1 8 0V10" />
              </svg>
              <span>Passwort</span>
              <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" />
              <button
                className="visibility-button"
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M2.8 12s3.3-6 9.2-6 9.2 6 9.2 6-3.3 6-9.2 6-9.2-6-9.2-6Z" />
                  <circle cx="12" cy="12" r="2.7" />
                </svg>
              </button>
            </label>
            <button className="forgot-password" type="button" onClick={() => setScreen('resetPassword')}>
              Passwort vergessen?
            </button>
            <button className="login-submit" type="button" onClick={() => setScreen('languageStyle')}>
              Einloggen
            </button>
          </form>
          <p className="register-copy">
            Noch kein Konto? <button type="button" onClick={() => setScreen('register')}>Registrieren</button>
          </p>
        </section>
      )
    }

    if (screen === 'register') {
      return (
        <section className="screen login-screen auth-detail-screen">
          <button className="login-back" onClick={() => setScreen('login')} aria-label="Zurück">
            ←
          </button>
          <header className="login-header">
            <h1>Konto erstellen</h1>
            <p>Starte noch heute mit MyFlow.</p>
          </header>
          <form className="login-form" onSubmit={(event) => event.preventDefault()}>
            <label className="login-field">
              <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5.5 19.5c.7-4 3.1-6 6.5-6s5.8 2 6.5 6" />
              </svg>
              <span>Name</span>
              <input type="text" placeholder="Dein Name" />
            </label>
            <label className="login-field">
              <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3.5" y="5.5" width="17" height="13" rx="3" />
                <path d="m5 7 7 5.4L19 7" />
              </svg>
              <span>E-Mail</span>
              <input type="email" placeholder="name@beispiel.de" />
            </label>
            <label className="login-field password-field">
              <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="5" y="10" width="14" height="10" rx="2.5" />
                <path d="M8 10V7.7a4 4 0 0 1 8 0V10" />
              </svg>
              <span>Passwort</span>
              <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" />
              <PasswordVisibilityButton
                visible={showPassword}
                onClick={() => setShowPassword((current) => !current)}
              />
            </label>
            <label className="login-field password-field">
              <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="5" y="10" width="14" height="10" rx="2.5" />
                <path d="M8 10V7.7a4 4 0 0 1 8 0V10" />
              </svg>
              <span>Passwort bestätigen</span>
              <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" />
              <PasswordVisibilityButton
                visible={showPassword}
                onClick={() => setShowPassword((current) => !current)}
              />
            </label>
            <button className="login-submit register-submit" type="button" onClick={() => setScreen('languageStyle')}>
              Registrieren
            </button>
          </form>
          <p className="register-copy">
            Bereits ein Konto? <button type="button" onClick={() => setScreen('login')}>Einloggen</button>
          </p>
        </section>
      )
    }

    if (screen === 'resetPassword') {
      return (
        <section className="screen login-screen auth-detail-screen">
          <button className="login-back" onClick={() => setScreen('login')} aria-label="Zurück">
            ←
          </button>
          <header className="login-header">
            <h1>Passwort zurücksetzen</h1>
            <p>Lege ein neues Passwort für dein Konto fest.</p>
          </header>
          <form className="login-form" onSubmit={(event) => event.preventDefault()}>
            <label className="login-field">
              <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3.5" y="5.5" width="17" height="13" rx="3" />
                <path d="m5 7 7 5.4L19 7" />
              </svg>
              <span>E-Mail</span>
              <input type="email" placeholder="name@beispiel.de" />
            </label>
            <label className="login-field password-field">
              <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="5" y="10" width="14" height="10" rx="2.5" />
                <path d="M8 10V7.7a4 4 0 0 1 8 0V10" />
              </svg>
              <span>Neues Passwort</span>
              <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" />
              <PasswordVisibilityButton
                visible={showPassword}
                onClick={() => setShowPassword((current) => !current)}
              />
            </label>
            <label className="login-field password-field">
              <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="5" y="10" width="14" height="10" rx="2.5" />
                <path d="M8 10V7.7a4 4 0 0 1 8 0V10" />
              </svg>
              <span>Passwort bestätigen</span>
              <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" />
              <PasswordVisibilityButton
                visible={showPassword}
                onClick={() => setShowPassword((current) => !current)}
              />
            </label>
            <button className="login-submit reset-submit" type="button" onClick={() => setScreen('login')}>
              Passwort speichern
            </button>
          </form>
          <p className="register-copy">
            Zurück zum <button type="button" onClick={() => setScreen('login')}>Einloggen</button>
          </p>
        </section>
      )
    }

    if (screen === 'languageStyle') {
      return (
        <section className="screen compact-screen style-screen">
          <button className="back-button" onClick={() => setScreen('login')}>←</button>
          <img src={logo} alt="MyFlow Logo" className="small-logo" />
          <p className="eyebrow">Personalisierung</p>
          <h1>Wie soll MyFlow mit dir sprechen?</h1>
          <p className="style-intro">
            Du kannst später in deinem Profil jederzeit zwischen den Sprachstilen wechseln.
          </p>
          <div className="language-style-options">
            <button
              className={`language-style-card ${languageStyle === 'casual' ? 'selected' : ''}`}
              onClick={() => setLanguageStyle('casual')}
            >
              <span className="style-check">{languageStyle === 'casual' ? '✓' : ''}</span>
              <strong>Locker und nahbar</strong>
              <p>„Hey! Lust, heute deine Ziele gemeinsam anzugehen?“</p>
              <small>Persönlich, motivierend und weniger förmlich</small>
            </button>
            <button
              className={`language-style-card ${languageStyle === 'formal' ? 'selected' : ''}`}
              onClick={() => setLanguageStyle('formal')}
            >
              <span className="style-check">{languageStyle === 'formal' ? '✓' : ''}</span>
              <strong>Normal und förmlich</strong>
              <p>„Willkommen. Ihre Tagesziele stehen bereit.“</p>
              <small>Sachlich, klar und wie in klassischen Apps</small>
            </button>
          </div>
          <button className="style-continue" onClick={() => setScreen('dashboard')}>
            Mit „{tone.label}“ fortfahren
          </button>
        </section>
      )
    }

    if (screen === 'dashboard') {
      return (
        <section className="screen">
          <div className="page-header">
            <div>
              <p className="eyebrow">{tone.greeting}</p>
              <h1>{tone.dashboardTitle}</h1>
              <p className="lead">{dashboardMessage}</p>
            </div>
          </div>

          <article className="stat-card big-stat">
            <span>Tagesfortschritt</span>
            <strong>75%</strong>
            <p>{tone.progressMessage}</p>
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
          <div><span>Sprachstil</span><strong>{tone.label}</strong></div>
          <div><span>Design</span><strong>Hell</strong></div>
        </div>
        <button className="secondary-button profile-style-button" onClick={() => setScreen('languageStyle')}>
          Sprachstil ändern
        </button>
        <button onClick={() => setScreen('start')}>Abmelden</button>
      </section>
    )
  }

  return (
    <main className="app">
      {renderScreen()}

      {!['start', 'login', 'register', 'resetPassword', 'languageStyle'].includes(screen) && (
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

function PasswordVisibilityButton({ visible, onClick }) {
  return (
    <button
      className="visibility-button"
      type="button"
      onClick={onClick}
      aria-label={visible ? 'Passwort verbergen' : 'Passwort anzeigen'}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M2.8 12s3.3-6 9.2-6 9.2 6 9.2 6-3.3 6-9.2 6-9.2-6-9.2-6Z" />
        <circle cx="12" cy="12" r="2.7" />
      </svg>
    </button>
  )
}

export default App
