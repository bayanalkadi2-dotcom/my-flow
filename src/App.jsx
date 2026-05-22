import logo from './assets/Icon Gruppe H.png'
import './App.css'

function App() {
  return (
    <main className="app">
      <section className="hero">
        <div className="hero-content">
          <img src={logo} alt="MyFlow Logo" className="app-logo" />

          <p className="tagline">Gesundheit • Routinen • Motivation</p>
          <h1>MyFlow</h1>
          <p className="description">
            MyFlow ist eine Gesundheits- und Gewohnheiten-App für junge Menschen und Studierende.
            Die App hilft dabei, gesunde Routinen aufzubauen, Fortschritte zu verfolgen und den Alltag
            strukturierter zu gestalten.
          </p>
          <button>Jetzt starten</button>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <h2>Gewohnheiten tracken</h2>
          <p>Erstelle persönliche Ziele und verfolge deine täglichen Routinen.</p>
        </div>

        <div className="feature-card">
          <h2>Fortschritt sehen</h2>
          <p>Behalte deine Entwicklung mit Statistiken und Streaks im Blick.</p>
        </div>

        <div className="feature-card">
          <h2>Motiviert bleiben</h2>
          <p>Erinnerungen und Challenges helfen dir, langfristig dranzubleiben.</p>
        </div>
      </section>
    </main>
  )
}

export default App
