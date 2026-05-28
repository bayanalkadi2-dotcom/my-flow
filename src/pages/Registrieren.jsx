import { useState } from 'react'
import PasswordVisibilityButton from '../commponents/PasswordVisibilityButton'

function Registrieren({ onNavigate }) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <section className="screen login-screen auth-detail-screen">
      <button className="login-back" onClick={() => onNavigate('login')} aria-label="Zurück">
        ←
      </button>
      <header className="login-header">
        <h1>Konto erstellen</h1>
        <p>Erstelle dein Konto, um MyFlow vollständig zu nutzen.</p>
      </header>
      <form className="login-form" onSubmit={(event) => event.preventDefault()}>
        <label className="login-field">
          <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5.5 19.5c.7-4 3.1-6 6.5-6s5.8 2 6.5 6" />
          </svg>
          <span>Benutzername</span>
          <input type="text" placeholder="Dein Benutzername" required />
        </label>
        <label className="login-field">
          <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3.5" y="5.5" width="17" height="13" rx="3" />
            <path d="m5 7 7 5.4L19 7" />
          </svg>
          <span>E-Mail</span>
          <input type="email" placeholder="name@beispiel.de" required />
        </label>
        <PasswordField
          label="Passwort"
          placeholder="Eigenes Passwort"
          showPassword={showPassword}
          onToggle={() => setShowPassword((current) => !current)}
        />
        <PasswordField
          label="Passwort wiederholen"
          placeholder="Passwort wiederholen"
          showPassword={showPassword}
          onToggle={() => setShowPassword((current) => !current)}
        />
        <button className="login-submit register-submit" type="button" onClick={() => onNavigate('languageStyle')}>
          Registrieren
        </button>
      </form>
      <p className="register-copy">
        Bereits ein Konto? <button type="button" onClick={() => onNavigate('login')}>Einloggen</button>
      </p>
    </section>
  )
}

function PasswordField({ label, placeholder, showPassword, onToggle }) {
  return (
    <label className="login-field password-field">
      <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5" y="10" width="14" height="10" rx="2.5" />
        <path d="M8 10V7.7a4 4 0 0 1 8 0V10" />
      </svg>
      <span>{label}</span>
      <input type={showPassword ? 'text' : 'password'} placeholder={placeholder} required />
      <PasswordVisibilityButton visible={showPassword} onClick={onToggle} />
    </label>
  )
}

export default Registrieren
