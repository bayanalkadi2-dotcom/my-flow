import { useEffect, useState } from 'react'
import PasswordVisibilityButton from '../commponents/PasswordVisibilityButton'
import { supabase } from '../lib/supabase'

const neutralResetMessage = 'Falls ein Konto mit dieser E-Mail-Adresse existiert, haben wir dir einen Link zum Zurücksetzen deines Passworts gesendet.'

function PasswortAendern({ hasRecoveryToken = false, mode = 'request', onNavigate, t }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(mode === 'recovery')
  const [isRecoveryValid, setIsRecoveryValid] = useState(mode !== 'recovery')
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')

  function goToLogin() {
    window.history.replaceState({}, '', '/')
    onNavigate('login')
  }

  function goToRequest() {
    window.history.replaceState({}, '', '/')
    onNavigate('resetPassword')
  }

  useEffect(() => {
    if (mode !== 'recovery') return undefined

    let active = true

    async function validateRecoverySession() {
      const { data, error } = await supabase.auth.getSession()
      if (!active) return
      setIsRecoveryValid(Boolean(hasRecoveryToken && data.session && !error))
      setIsLoading(false)
    }

    validateRecoverySession()
    return () => { active = false }
  }, [hasRecoveryToken, mode])

  async function requestReset(event) {
    event.preventDefault()
    setErrors({})
    setMessage('')

    if (!email.trim()) {
      setErrors({ email: 'Bitte gib deine E-Mail-Adresse ein.' })
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/passwort-zuruecksetzen`,
      })
      if (error) throw error
      setMessage(neutralResetMessage)
    } catch (error) {
      const text = String(error?.message || '').toLowerCase()
      setErrors({
        form: text.includes('fetch') || text.includes('network')
          ? 'Keine Internetverbindung. Bitte prüfe deine Verbindung und versuche es erneut.'
          : 'Die E-Mail konnte gerade nicht versendet werden. Bitte versuche es später erneut.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function savePassword(event) {
    event.preventDefault()
    const nextErrors = {}
    if (!password) nextErrors.password = 'Bitte gib ein neues Passwort ein.'
    else if (password.length < 8) nextErrors.password = 'Das Passwort muss mindestens 8 Zeichen lang sein.'
    if (!passwordConfirm) nextErrors.passwordConfirm = 'Bitte wiederhole das neue Passwort.'
    else if (password !== passwordConfirm) nextErrors.passwordConfirm = 'Die Passwörter stimmen nicht überein.'
    setErrors(nextErrors)
    setMessage('')
    if (Object.keys(nextErrors).length > 0) return

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setMessage('Dein Passwort wurde erfolgreich geändert.')
      window.setTimeout(async () => {
        await supabase.auth.signOut()
        window.history.replaceState({}, '', '/')
        window.setTimeout(() => onNavigate('login'), 0)
      }, 1400)
    } catch (error) {
      const text = String(error?.message || '').toLowerCase()
      if (text.includes('expired') || text.includes('invalid') || text.includes('session')) {
        setIsRecoveryValid(false)
      } else {
        setErrors({ form: 'Das Passwort konnte nicht gespeichert werden. Bitte versuche es erneut.' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (mode === 'recovery' && isLoading) {
    return <AuthShell title="Link wird geprüft" text="Einen Moment bitte …" onBack={goToLogin} t={t} />
  }

  if (mode === 'recovery' && !isRecoveryValid) {
    return (
      <AuthShell
        title="Link nicht mehr gültig"
        text="Dieser Link ist ungültig oder abgelaufen. Fordere bitte einen neuen Link an."
        onBack={goToLogin}
        t={t}
      >
        <button className="login-submit" type="button" onClick={goToRequest}>Neuen Link anfordern</button>
      </AuthShell>
    )
  }

  const recoveryMode = mode === 'recovery'

  return (
    <AuthShell
      title={recoveryMode ? 'Neues Passwort festlegen' : 'Passwort vergessen?'}
      text={recoveryMode ? 'Lege jetzt ein neues Passwort für dein Konto fest.' : 'Gib deine E-Mail-Adresse ein. Wir senden dir einen sicheren Link.'}
      onBack={goToLogin}
      t={t}
    >
      <form className="login-form" onSubmit={recoveryMode ? savePassword : requestReset}>
        {!recoveryMode && (
          <label className="login-field">
            <MailIcon />
            <span>{t.auth.email}</span>
            <input
              autoComplete="email"
              disabled={isLoading}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@beispiel.de"
              type="email"
              value={email}
            />
            {errors.email && <small className="auth-field-error">{errors.email}</small>}
          </label>
        )}

        {recoveryMode && (
          <>
            <PasswordField
              error={errors.password}
              label="Neues Passwort"
              onChange={setPassword}
              onToggle={() => setShowPassword((current) => !current)}
              showPassword={showPassword}
              value={password}
            />
            <PasswordField
              error={errors.passwordConfirm}
              label="Neues Passwort wiederholen"
              onChange={setPasswordConfirm}
              onToggle={() => setShowPassword((current) => !current)}
              showPassword={showPassword}
              value={passwordConfirm}
            />
          </>
        )}

        {errors.form && <div className="auth-form-message auth-form-error" role="alert">{errors.form}</div>}
        {message && <div className="auth-form-message auth-form-success" role="status">{message}</div>}

        <button className="login-submit reset-submit" disabled={isLoading || Boolean(message)} type="submit">
          {isLoading ? 'Bitte warten …' : recoveryMode ? 'Passwort speichern' : 'Link senden'}
        </button>
      </form>
      <p className="register-copy">
        Zurück zum <button type="button" onClick={goToLogin}>{t.start.login}</button>
      </p>
    </AuthShell>
  )
}

function AuthShell({ children, onBack, t, text, title }) {
  return (
    <section className="screen login-screen auth-detail-screen">
      <button className="login-back" onClick={onBack} aria-label={t.common.back} type="button">&larr;</button>
      <header className="login-header">
        <h1>{title}</h1>
        <p>{text}</p>
      </header>
      {children}
    </section>
  )
}

function MailIcon() {
  return (
    <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="13" rx="3" />
      <path d="m5 7 7 5.4L19 7" />
    </svg>
  )
}

function PasswordField({ error, label, onChange, showPassword, onToggle, value }) {
  return (
    <label className="login-field password-field">
      <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5" y="10" width="14" height="10" rx="2.5" />
        <path d="M8 10V7.7a4 4 0 0 1 8 0V10" />
      </svg>
      <span>{label}</span>
      <input
        autoComplete="new-password"
        onChange={(event) => onChange(event.target.value)}
        placeholder="********"
        type={showPassword ? 'text' : 'password'}
        value={value}
      />
      <PasswordVisibilityButton visible={showPassword} onClick={onToggle} />
      {error && <small className="auth-field-error">{error}</small>}
    </label>
  )
}

export default PasswortAendern
