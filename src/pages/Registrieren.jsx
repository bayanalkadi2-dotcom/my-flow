import { useEffect, useState } from 'react'
import { useAuth } from '../context/authContextValue'
import PasswordVisibilityButton from '../commponents/PasswordVisibilityButton'
import AuthDesignPicker from '../commponents/AuthDesignPicker'

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

function Registrieren({ appColor = 'Lila', appTheme = 'Hell', draft = {}, languageStyle = 'german', onAppDesignChange = () => {}, onDraftChange = () => {}, onLanguageChange = () => {}, onNavigate, t }) {
  const { signup } = useAuth()
  const [email, setEmail] = useState(draft.email ?? '')
  const [password, setPassword] = useState(draft.password ?? '')
  const [passwordConfirm, setPasswordConfirm] = useState(draft.passwordConfirm ?? '')
  const [displayName, setDisplayName] = useState(draft.displayName ?? '')
  const [communicationStyle, setCommunicationStyle] = useState(draft.communicationStyle ?? '')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(draft.acceptedPrivacy ?? false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const activeLanguage = t?.nav?.profile === 'الملف الشخصي'
    ? 'arabic'
    : t?.nav?.profile === 'Profile'
      ? 'english'
      : t?.common?.back === 'Geri'
        ? 'turkish'
        : languageStyle
  useEffect(() => {
    onDraftChange({ acceptedPrivacy, communicationStyle, displayName, email, password, passwordConfirm })
  }, [acceptedPrivacy, communicationStyle, displayName, email, onDraftChange, password, passwordConfirm])
  const copy = {
    german: { name: 'Name', namePlaceholder: 'Dein Name', language: 'Sprache', communication: 'Kommunikationsstil', styles: ['Locker', 'Formal'], repeat: 'Passwort wiederholen', passwordPlaceholder: 'Mindestens 8 Zeichen', privacy: 'Ich akzeptiere die Datenschutzbestimmungen.', show: 'Anzeigen', loading: 'Wird registriert...', account: 'Bereits ein Konto?' },
    english: { name: 'Name', namePlaceholder: 'Your name', language: 'Language', communication: 'Communication style', styles: ['Casual', 'Formal'], repeat: 'Repeat password', passwordPlaceholder: 'At least 8 characters', privacy: 'I accept the privacy policy.', show: 'View', loading: 'Signing up...', account: 'Already have an account?' },
    turkish: { name: 'Ad', namePlaceholder: 'Adın', language: 'Dil', communication: 'İletişim tarzı', styles: ['Samimi', 'Resmî'], repeat: 'Şifreyi tekrar et', passwordPlaceholder: 'En az 8 karakter', privacy: 'Gizlilik politikasını kabul ediyorum.', show: 'Göster', loading: 'Kayıt yapılıyor...', account: 'Zaten hesabın var mı?' },
    arabic: { name: 'الاسم', namePlaceholder: 'اسمك', language: 'اللغة', communication: 'أسلوب التواصل', styles: ['ودي', 'رسمي'], repeat: 'تكرار كلمة المرور', passwordPlaceholder: 'على الأقل 8 أحرف', privacy: 'أوافق على سياسة الخصوصية.', show: 'عرض', loading: 'جاري إنشاء الحساب...', account: 'لديك حساب بالفعل؟' },
  }[activeLanguage]

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

    if (!communicationStyle) {
      setError('Bitte wähle Sprache, Kommunikationsstil und Design aus.')
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
        language_style: activeLanguage,
        communication_style: communicationStyle,
        theme: appTheme,
        color_theme: appColor,
        onboarding_completed: true,
      })
      setSuccess('Registrierung erfolgreich! Bitte überprüfen Sie Ihre E-Mail.')
      setEmail('')
      setPassword('')
      setPasswordConfirm('')
      setDisplayName('')
      setCommunicationStyle('')
      setAcceptedPrivacy(false)
      onDraftChange({})
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
          <span>{copy.name}</span>
          <input
            type="text"
            placeholder={copy.namePlaceholder}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={isLoading}
            required
          />
        </label>

        <label className="student-onboarding-label">
          {copy.language}
          <div className="student-chip-grid">
            {languageOptions.map(([value, label]) => (
              <button className={`student-onboarding-option ${activeLanguage === value ? 'selected' : ''}`} key={value} onClick={() => onLanguageChange(value)} type="button" disabled={isLoading}>
                <strong>{label}</strong>
                <span aria-hidden="true">{activeLanguage === value ? '✓' : ''}</span>
              </button>
            ))}
          </div>
        </label>

        <label className="student-onboarding-label">
          {copy.communication}
          <div className="student-chip-grid">
            {communicationOptions.map(([value], index) => (
              <button className={`student-onboarding-option ${communicationStyle === value ? 'selected' : ''}`} key={value} onClick={() => setCommunicationStyle(value)} type="button" disabled={isLoading}>
                <strong>{copy.styles[index]}</strong>
                <span aria-hidden="true">{communicationStyle === value ? '✓' : ''}</span>
              </button>
            ))}
          </div>
        </label>

        <div className="register-design-section">
          <AuthDesignPicker color={appColor} mode={appTheme} onChange={onAppDesignChange} t={t} />
        </div>

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
            placeholder={copy.passwordPlaceholder}
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
          <span>{copy.repeat}</span>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder={copy.repeat}
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
            {copy.privacy}
            <button type="button" onClick={() => onNavigate('privacy')} disabled={isLoading}>
              {copy.show}
            </button>
          </span>
        </label>

        {error && <div style={{ color: '#e74c3c', fontSize: '14px', marginBottom: '10px' }}>{error}</div>}
        {success && <div style={{ color: '#27ae60', fontSize: '14px', marginBottom: '10px' }}>{success}</div>}
        <button className="login-submit" type="submit" disabled={isLoading}>
          {isLoading ? copy.loading : t.start.register}
        </button>
      </form>
      <p className="register-copy">
        {copy.account} <button type="button" onClick={() => onNavigate('login')} disabled={isLoading}>{t.start.login}</button>
      </p>
    </section>
  )
}

export default Registrieren
