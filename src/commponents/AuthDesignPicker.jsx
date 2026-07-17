function AuthDesignPicker({ color, mode, onChange, t }) {
  const copy = t?.profile?.designPicker
  return (
    <section className="auth-design-picker" aria-label={copy?.label ?? 'Design auswählen'}>
      <div className="auth-design-group">
        <div className="auth-design-heading">
          <strong>{copy?.color ?? '1. Farbe'}</strong>
          <p>{copy?.colorText ?? 'Wähle deine Lieblingsfarbe für die App.'}</p>
        </div>
        <div className="auth-design-card-grid">
          {[
            ['Lila', copy?.purple ?? 'Lila', copy?.purpleText ?? 'Der klassische MyFlow-Look für dich.'],
            ['Blau', copy?.blue ?? 'Blau', copy?.blueText ?? 'Ein frischer Look in blauem Design.'],
          ].map(([nextColor, label, description]) => (
            <button
              className={`auth-design-card color-card ${nextColor.toLowerCase()} ${color === nextColor ? 'selected' : ''}`}
              key={nextColor}
              onClick={() => onChange(nextColor, mode)}
              type="button"
              aria-pressed={color === nextColor}
            >
              <span className="auth-design-card-title">
                <i aria-hidden="true" />
                <strong>{label}</strong>
                {color === nextColor && <b aria-hidden="true">✓</b>}
              </span>
              <small>{description}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="auth-design-group">
        <div className="auth-design-heading">
          <strong>{copy?.brightness ?? '2. Helligkeit'}</strong>
          <p>{copy?.brightnessText ?? 'Wähle zwischen hellem oder dunklem Modus.'}</p>
        </div>
        <div className="auth-design-card-grid">
          {[
            ['Hell', copy?.light ?? 'Hell', '☀', copy?.lightText ?? 'Helles Design für tägliche Motivation.'],
            ['Dunkel', copy?.dark ?? 'Dunkel', '☾', copy?.darkText ?? 'Dunkles Design für entspannte Nächte.'],
          ].map(([nextMode, label, icon, description]) => (
          <button
            className={`auth-design-card mode-card ${mode === nextMode ? 'selected' : ''}`}
            key={nextMode}
            onClick={() => onChange(color, nextMode)}
            type="button"
            aria-pressed={mode === nextMode}
          >
            <span className="auth-design-card-title">
              <i aria-hidden="true">{icon}</i>
              <strong>{label}</strong>
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
