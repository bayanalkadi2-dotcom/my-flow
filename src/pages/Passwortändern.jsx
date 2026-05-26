import { useState } from 'react'
import PasswordVisibilityButton from '../commponents/PasswordVisibilityButton'

function PasswortAendern({ onNavigate }) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <section className="screen login-screen auth-detail-screen">
      <button className="login-back" onClick={() => onNavigate('login')} aria-label="Zurück">
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
        <PasswordField
          label="Neues Passwort"
          showPassword={showPassword}
          onToggle={() => setShowPassword((current) => !current)}
        />
        <PasswordField
          label="Passwort bestätigen"
          showPassword={showPassword}
          onToggle={() => setShowPassword((current) => !current)}
        />
        <button className="login-submit reset-submit" type="button" onClick={() => onNavigate('login')}>
          Passwort speichern
        </button>
      </form>
      <p className="register-copy">
        Zurück zum <button type="button" onClick={() => onNavigate('login')}>Einloggen</button>
      </p>
    </section>
  )
}

function PasswordField({ label, showPassword, onToggle }) {
  return (
    <label className="login-field password-field">
      <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5" y="10" width="14" height="10" rx="2.5" />
        <path d="M8 10V7.7a4 4 0 0 1 8 0V10" />
      </svg>
      <span>{label}</span>
      <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" />
      <PasswordVisibilityButton visible={showPassword} onClick={onToggle} />
    </label>
  )
}

export default PasswortAendern
