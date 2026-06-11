import logo from '../assets/Icon Gruppe H.png'

function Startseite({ onNavigate, t }) {
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
      <p className="wellness-badge">{t.start.badge}</p>
      <div className="brand-title-wrap">
        <h1>MyFlow</h1>
      </div>
      <p className="welcome-category">
        <span aria-hidden="true">*</span>
        {t.start.category}
        <span aria-hidden="true">*</span>
      </p>
      <p className="lead welcome-copy">{t.start.lead}</p>
      <div className="actions welcome-actions">
        <button className="primary-cta" onClick={() => onNavigate('dashboard')}>
          <span className="button-orb start-orb" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="img">
              <path d="M8 5.5v13l10-6.5-10-6.5Z" />
            </svg>
          </span>
          <span>{t.start.start}</span>
          <span className="button-orb arrow-orb" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="img">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </button>
        <button className="secondary-button login-cta" onClick={() => onNavigate('login')}>
          <span className="button-orb user-orb" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="img">
              <path d="M12 12.5a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4Z" />
              <path d="M4.8 20.2c.8-3.5 3.5-5.6 7.2-5.6s6.4 2.1 7.2 5.6" />
            </svg>
          </span>
          <span>{t.start.login}</span>
          <span className="login-arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="img">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </button>
        <button className="secondary-button login-cta" onClick={() => onNavigate('register')}>
          <span className="button-orb user-orb" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="img">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </span>
          <span>{t.start.register}</span>
          <span className="login-arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="img">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </button>
      </div>
      <div className="feature-strip">
        {t.start.features.map((feature) => (
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
