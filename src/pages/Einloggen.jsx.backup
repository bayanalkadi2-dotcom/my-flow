import { useState } from 'react'
import PasswordVisibilityButton from '../commponents/PasswordVisibilityButton'

function Einloggen({ onNavigate, t }) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <section className="screen login-screen">
      <button className="login-back" onClick={() => onNavigate('start')} aria-label={t.common.back}>
        &larr;
      </button>
      <header className="login-header">
        <h1>{t.auth.loginTitle}</h1>
        <p>{t.auth.loginText}</p>
      </header>
      <form className="login-form" onSubmit={(event) => event.preventDefault()}>
        <label className="login-field">
          <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3.5" y="5.5" width="17" height="13" rx="3" />
            <path d="m5 7 7 5.4L19 7" />
          </svg>
          <span>{t.auth.email}</span>
          <input type="email" placeholder="name@beispiel.de" />
        </label>
        <label className="login-field password-field">
          <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="5" y="10" width="14" height="10" rx="2.5" />
            <path d="M8 10V7.7a4 4 0 0 1 8 0V10" />
          </svg>
          <span>{t.auth.password}</span>
          <input type={showPassword ? 'text' : 'password'} placeholder="********" />
          <PasswordVisibilityButton
            visible={showPassword}
            onClick={() => setShowPassword((current) => !current)}
          />
        </label>
        <button className="forgot-password" type="button" onClick={() => onNavigate('resetPassword')}>
          {t.auth.forgot}
        </button>
        <button className="login-submit" type="button" onClick={() => onNavigate('languageStyle')}>
          {t.start.login}
        </button>
      </form>
      <p className="register-copy">
        {t.auth.noAccount} <button type="button" onClick={() => onNavigate('register')}>{t.start.register}</button>
      </p>
    </section>
  )
}

export default Einloggen
