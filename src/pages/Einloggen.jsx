import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import PasswordVisibilityButton from '../commponents/PasswordVisibilityButton'

function Einloggen({ onNavigate, t }) {
  const { signin, error: authError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email || !password) {
      setError('Bitte füllen Sie alle Felder aus.')
      return
    }

    setIsLoading(true)
    try {
      await signin(email, password)
      setSuccess('Anmeldung erfolgreich!')
      // Navigation happens automatically via App.jsx after auth state changes
    } catch (err) {
      setError(err.message || 'Anmeldung fehlgeschlagen')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="screen login-screen">
      <button className="login-back" onClick={() => onNavigate('start')} aria-label={t.common.back}>
        &larr;
      </button>
      <header className="login-header">
        <h1>{t.auth.loginTitle}</h1>
        <p>{t.auth.loginText}</p>
      </header>
      <form className="login-form" onSubmit={handleLogin}>
        <label className="login-field">
          <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3.5" y="5.5" width="17" height="13" rx="3" />
            <path d="m5 7 7 5.4L19 7" />
          </svg>
          <span>{t.auth.email}</span>
          <input
            type="email"
            placeholder="name@beispiel.de"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </label>
        <label className="login-field password-field">
          <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="5" y="10" width="14" height="10" rx="2.5" />
            <path d="M8 10V7.7a4 4 0 0 1 8 0V10" />
          </svg>
          <span>{t.auth.password}</span>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
          <PasswordVisibilityButton
            visible={showPassword}
            onClick={() => setShowPassword((current) => !current)}
          />
        </label>

        {error && <div style={{ color: '#e74c3c', fontSize: '14px', marginBottom: '10px' }}>{error}</div>}
        {success && <div style={{ color: '#27ae60', fontSize: '14px', marginBottom: '10px' }}>{success}</div>}
        {authError && <div style={{ color: '#e74c3c', fontSize: '14px', marginBottom: '10px' }}>Auth Error: {authError}</div>}

        <button className="forgot-password" type="button" onClick={() => onNavigate('resetPassword')} disabled={isLoading}>
          {t.auth.forgot}
        </button>
        <button className="login-submit" type="submit" disabled={isLoading}>
          {isLoading ? 'Wird angemeldet...' : t.start.login}
        </button>
      </form>
      <p className="register-copy">
        {t.auth.noAccount} <button type="button" onClick={() => onNavigate('register')} disabled={isLoading}>{t.start.register}</button>
      </p>
    </section>
  )
}

export default Einloggen
