import { useState } from 'react'
import { useAuth } from '../context/authContextValue'
import PasswordVisibilityButton from '../commponents/PasswordVisibilityButton'
import { getProfileAgeError, MAX_PROFILE_AGE, MIN_PROFILE_AGE } from '../utils/profileValidation'

const genderOptions = [
  ['female', 'Weiblich'],
  ['male', 'Männlich'],
  ['diverse', 'Divers'],
]

const activityOptions = [
  ['low', 'Wenig aktiv'],
  ['medium', 'Normal aktiv'],
  ['high', 'Sehr aktiv'],
]

const situationOptions = [
  ['study', 'Studium'],
  ['training', 'Ausbildung'],
  ['work', 'Arbeit'],
  ['transition', 'Übergangsphase'],
  ['other', 'Andere'],
]

const languageOptions = [
  ['german', 'Deutsch'],
  ['english', 'English'],
  ['turkish', 'Türkçe'],
  ['arabic', 'العربية'],
]

const communicationOptions = [
  ['casual', 'Locker'],
  ['formal', 'Formal'],
]

const designOptions = [
  ['Hell', 'Hell'],
  ['Dunkel', 'Dunkel'],
]

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function getRegisterErrorMessage(error) {
  const message = String(error?.message || error || '').toLowerCase()

  if (message.includes('already registered') || message.includes('already exists') || message.includes('user already')) {
    return 'Diese E-Mail-Adresse wird bereits verwendet.'
  }

  if (message.includes('network') || message.includes('fetch')) {
    return 'Keine Internetverbindung.'
  }

  if (message.includes('timeout')) {
    return 'Zeitüberschreitung. Bitte versuche es erneut.'
  }

  return 'Registrierung fehlgeschlagen. Bitte versuche es später erneut.'
}

function Registrieren({ onNavigate, t }) {
  const { signup } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [gender, setGender] = useState('')
  const [age, setAge] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [activityLevel, setActivityLevel] = useState('')
  const [dailyContext, setDailyContext] = useState('')
  const [languageStyle, setLanguageStyle] = useState('german')
  const [communicationStyle, setCommunicationStyle] = useState('casual')
  const [theme, setTheme] = useState('Hell')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleRegister(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!displayName.trim()) {
      setError('Bitte gib einen Namen ein.')
      return
    }

    if (!email.trim() || !isValidEmail(email)) {
      setError('Bitte gib eine gültige E-Mail-Adresse ein.')
      return
    }


    const ageError = getProfileAgeError(age)
    if (ageError) {
      setError(ageError)
      return
    }

    if (!gender || !heightCm || Number(heightCm) <= 0 || !activityLevel || !dailyContext) {
      setError('Bitte fülle alle Pflichtfelder aus.')
      return
    }

    if (weightKg && Number(weightKg) <= 0) {
      setError('Ungültiges Gewicht.')
      return
    }

    if (password !== passwordConfirm) {
      setError('Die Passwörter stimmen nicht überein.')
      return
    }

    if (password.length < 8) {
      setError('Das Passwort muss mindestens 8 Zeichen lang sein.')
      return
    }

    if (!acceptedPrivacy) {
      setError('Bitte akzeptiere die Datenschutzbestimmungen.')
      return
    }

    setIsLoading(true)
    try {
      await signup(email, password, displayName.trim(), {
        gender,
        age,
        height_cm: heightCm,
        weight_kg: weightKg,
        activity_level: activityLevel,
        daily_context: dailyContext,
        language_style: languageStyle,
        communication_style: communicationStyle,
        theme,
        onboarding_completed: true,
      })
      setSuccess('Registrierung erfolgreich! Bitte überprüfen Sie Ihre E-Mail.')
      setEmail('')
      setPassword('')
      setPasswordConfirm('')
      setDisplayName('')
      setGender('')
      setAge('')
      setWeightKg('')
      setHeightCm('')
      setActivityLevel('')
      setDailyContext('')
      setLanguageStyle('german')
      setCommunicationStyle('casual')
      setTheme('Hell')
      setAcceptedPrivacy(false)
    } catch (err) {
      setError(getRegisterErrorMessage(err))
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
        <h1>{t.auth.registerTitle}</h1>
        <p>{t.auth.registerText}</p>
      </header>
      <form className="login-form" onSubmit={handleRegister}>
        <label className="login-field">
          <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
          <span>Name</span>
          <input
            type="text"
            placeholder="Dein Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={isLoading}
            required
          />
        </label>

        <label className="student-onboarding-label">
          Geschlecht
          <div className="student-chip-grid">
            {genderOptions.map(([value, label]) => (
              <button className={`student-onboarding-option ${gender === value ? 'selected' : ''}`} key={value} onClick={() => setGender(value)} type="button" disabled={isLoading}>
                <strong>{label}</strong>
                <span aria-hidden="true">{gender === value ? '✓' : ''}</span>
              </button>
            ))}
          </div>
        </label>

        <div className="register-profile-grid">
          <label className="login-field">
            <span>Alter</span>
            <input type="number" min={MIN_PROFILE_AGE} max={MAX_PROFILE_AGE} placeholder="z. B. 21" value={age} onChange={(e) => setAge(e.target.value)} disabled={isLoading} required />
          </label>
          <label className="login-field">
            <span>Gewicht</span>
            <input type="number" min="1" step="0.1" placeholder="kg" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} disabled={isLoading} />
          </label>
          <label className="login-field">
            <span>Größe</span>
            <input type="number" min="1" placeholder="cm" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} disabled={isLoading} required />
          </label>
        </div>

        <label className="student-onboarding-label">
          Aktivität
          <div className="student-chip-grid">
            {activityOptions.map(([value, label]) => (
              <button className={`student-onboarding-option ${activityLevel === value ? 'selected' : ''}`} key={value} onClick={() => setActivityLevel(value)} type="button" disabled={isLoading}>
                <strong>{label}</strong>
                <span aria-hidden="true">{activityLevel === value ? '✓' : ''}</span>
              </button>
            ))}
          </div>
        </label>

        <label className="student-onboarding-label">
          Situation
          <div className="student-chip-grid">
            {situationOptions.map(([value, label]) => (
              <button className={`student-onboarding-option ${dailyContext === value ? 'selected' : ''}`} key={value} onClick={() => setDailyContext(value)} type="button" disabled={isLoading}>
                <strong>{label}</strong>
                <span aria-hidden="true">{dailyContext === value ? '✓' : ''}</span>
              </button>
            ))}
          </div>
        </label>

        <label className="student-onboarding-label">
          Sprache
          <div className="student-chip-grid">
            {languageOptions.map(([value, label]) => (
              <button className={`student-onboarding-option ${languageStyle === value ? 'selected' : ''}`} key={value} onClick={() => setLanguageStyle(value)} type="button" disabled={isLoading}>
                <strong>{label}</strong>
                <span aria-hidden="true">{languageStyle === value ? '✓' : ''}</span>
              </button>
            ))}
          </div>
        </label>

        <label className="student-onboarding-label">
          Kommunikationsstil
          <div className="student-chip-grid">
            {communicationOptions.map(([value, label]) => (
              <button className={`student-onboarding-option ${communicationStyle === value ? 'selected' : ''}`} key={value} onClick={() => setCommunicationStyle(value)} type="button" disabled={isLoading}>
                <strong>{label}</strong>
                <span aria-hidden="true">{communicationStyle === value ? '✓' : ''}</span>
              </button>
            ))}
          </div>
        </label>

        <label className="student-onboarding-label">
          Design
          <div className="student-chip-grid">
            {designOptions.map(([value, label]) => (
              <button className={`student-onboarding-option ${theme === value ? 'selected' : ''}`} key={value} onClick={() => setTheme(value)} type="button" disabled={isLoading}>
                <strong>{label}</strong>
                <span aria-hidden="true">{theme === value ? '✓' : ''}</span>
              </button>
            ))}
          </div>
        </label>

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
            placeholder="Mindestens 8 Zeichen"
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

        <label className="login-field password-field">
          <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="5" y="10" width="14" height="10" rx="2.5" />
            <path d="M8 10V7.7a4 4 0 0 1 8 0V10" />
          </svg>
          <span>Passwort wiederholen</span>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Passwort wiederholen"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            disabled={isLoading}
            required
          />
          <PasswordVisibilityButton
            visible={showPassword}
            onClick={() => setShowPassword((current) => !current)}
          />
        </label>

        <label className="auth-privacy-check">
          <input
            checked={acceptedPrivacy}
            disabled={isLoading}
            onChange={(event) => setAcceptedPrivacy(event.target.checked)}
            type="checkbox"
          />
          <span>
            Ich akzeptiere die Datenschutzbestimmungen.
            <button type="button" onClick={() => onNavigate('privacy')} disabled={isLoading}>
              Anzeigen
            </button>
          </span>
        </label>

        {error && <div style={{ color: '#e74c3c', fontSize: '14px', marginBottom: '10px' }}>{error}</div>}
        {success && <div style={{ color: '#27ae60', fontSize: '14px', marginBottom: '10px' }}>{success}</div>}
        <button className="login-submit" type="submit" disabled={isLoading}>
          {isLoading ? 'Wird registriert...' : t.start.register}
        </button>
      </form>
      <p className="register-copy">
        Bereits ein Konto? <button type="button" onClick={() => onNavigate('login')} disabled={isLoading}>{t.start.login}</button>
      </p>
    </section>
  )
}

export default Registrieren
