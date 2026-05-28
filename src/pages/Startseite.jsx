import logo from '../assets/Icon Gruppe H.png'
import { welcomeFeatures } from '../data/appData'

function Startseite({ onNavigate }) {
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
        <button className="primary-cta" onClick={() => onNavigate('dashboard')}>
          <span className="button-orb" aria-hidden="true">✦</span>
          <span>Loslegen</span>
          <span className="button-orb arrow-orb" aria-hidden="true">→</span>
        </button>
        <button className="secondary-button login-cta" onClick={() => onNavigate('login')}>
          <span className="button-orb user-orb" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="img">
              <path d="M12 12.5a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4Z" />
              <path d="M4.8 20.2c.8-3.5 3.5-5.6 7.2-5.6s6.4 2.1 7.2 5.6" />
            </svg>
          </span>
          <span>Einloggen</span>
          <span className="login-arrow" aria-hidden="true">→</span>
        </button>
        <button className="secondary-button login-cta" onClick={() => onNavigate('register')}>
          <span className="button-orb user-orb" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="img">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </span>
          <span>Registrieren</span>
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

export default Startseite
