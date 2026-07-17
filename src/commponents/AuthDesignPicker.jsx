function AuthDesignPicker({ color, mode, onChange }) {
  return (
    <section className="auth-design-picker" aria-label="Design auswählen">
      <div className="auth-design-group">
        <div className="auth-design-heading">
          <strong>1. Farbe</strong>
          <p>Wähle deine Lieblingsfarbe für die App.</p>
        </div>
        <div className="auth-design-card-grid">
          {[
            ['Lila', 'Der klassische MyFlow-Look für dich.'],
            ['Blau', 'Ein frischer Look in blauem Design.'],
          ].map(([nextColor, description]) => (
            <button
              className={`auth-design-card color-card ${nextColor.toLowerCase()} ${color === nextColor ? 'selected' : ''}`}
              key={nextColor}
              onClick={() => onChange(nextColor, mode)}
              type="button"
              aria-pressed={color === nextColor}
            >
              <span className="auth-design-card-title">
                <i aria-hidden="true" />
                <strong>{nextColor}</strong>
                {color === nextColor && <b aria-hidden="true">✓</b>}
              </span>
              <small>{description}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="auth-design-group">
        <div className="auth-design-heading">
          <strong>2. Helligkeit</strong>
          <p>Wähle zwischen hellem oder dunklem Modus.</p>
        </div>
        <div className="auth-design-card-grid">
          {[
            ['Hell', '☀', 'Helles Design für tägliche Motivation.'],
            ['Dunkel', '☾', 'Dunkles Design für entspannte Nächte.'],
          ].map(([nextMode, icon, description]) => (
          <button
            className={`auth-design-card mode-card ${mode === nextMode ? 'selected' : ''}`}
            key={nextMode}
            onClick={() => onChange(color, nextMode)}
            type="button"
            aria-pressed={mode === nextMode}
          >
            <span className="auth-design-card-title">
              <i aria-hidden="true">{icon}</i>
              <strong>{nextMode}</strong>
              {mode === nextMode && <b aria-hidden="true">✓</b>}
            </span>
            <small>{description}</small>
          </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default AuthDesignPicker
