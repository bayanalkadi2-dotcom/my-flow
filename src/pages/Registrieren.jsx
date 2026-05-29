import { useState } from 'react'
import PasswordVisibilityButton from '../commponents/PasswordVisibilityButton'

const paymentPlans = [
  { id: 'free', label: 'Kostenlos', price: '0 €' },
  { id: 'plus', label: 'Plus Tools', price: '4,99 €' },
  { id: 'pro', label: 'Pro Tools', price: '9,99 €' },
]

const paymentMethods = ['PayPal', 'Klarna', 'Kreditkarte', 'SEPA', 'Apple Pay', 'Google Pay']

function Registrieren({ onNavigate }) {
  const [showPassword, setShowPassword] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [username, setUsername] = useState('')
  const [accountEmail, setAccountEmail] = useState('')
  const [reminders, setReminders] = useState(true)
  const [paymentPlan, setPaymentPlan] = useState('free')
  const [paymentMethod, setPaymentMethod] = useState('PayPal')
  const selectedPlan = paymentPlans.find((plan) => plan.id === paymentPlan)

  return (
    <section className="screen login-screen auth-detail-screen">
      <button className="login-back" onClick={() => onNavigate('start')} aria-label="Zurück">
        ←
      </button>
      <button
        className="settings-gear-button"
        onClick={() => setShowSettings((current) => !current)}
        type="button"
        aria-label="App-Einstellungen öffnen"
      >
        ⚙
      </button>
      <header className="login-header">
        <h1>Konto erstellen</h1>
        <p>Erstelle dein Konto, um MyFlow vollständig zu nutzen.</p>
      </header>
      {showSettings && (
        <section className="register-settings-panel" aria-label="App-Einstellungen">
          <div className="register-settings-header">
            <strong>App-Einstellungen</strong>
            <button type="button" onClick={() => setShowSettings(false)} aria-label="Einstellungen schließen">
              ×
            </button>
          </div>
          <label>
            Benutzername ändern
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Neuer Benutzername"
            />
          </label>
          <label>
            E-Mail ändern
            <input
              type="email"
              value={accountEmail}
              onChange={(event) => setAccountEmail(event.target.value)}
              placeholder="name@beispiel.de"
            />
          </label>
          <label>
            Neues Passwort
            <input type="password" placeholder="Neues Passwort" />
          </label>
          <div className="settings-toggle-row">
            <span>Erinnerungen</span>
            <button
              className={`settings-toggle ${reminders ? 'active' : ''}`}
              onClick={() => setReminders((current) => !current)}
              type="button"
            >
              {reminders ? 'Aktiv' : 'Aus'}
            </button>
          </div>
          <div className="payment-settings">
            <div className="payment-settings-title">
              <strong>Bezahlung</strong>
              <span>{selectedPlan.label} · {selectedPlan.price}</span>
            </div>
            <div className="payment-plan-grid">
              {paymentPlans.map((plan) => (
                <button
                  className={`payment-option ${paymentPlan === plan.id ? 'selected' : ''}`}
                  key={plan.id}
                  onClick={() => setPaymentPlan(plan.id)}
                  type="button"
                >
                  <span>{plan.label}</span>
                  <strong>{plan.price}</strong>
                </button>
              ))}
            </div>
            <p>Kostenpflichtige Tools werden erst nach Auswahl eines Plans freigeschaltet.</p>
            <div className="payment-method-grid">
              {paymentMethods.map((method) => (
                <button
                  className={`payment-method ${paymentMethod === method ? 'selected' : ''}`}
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  type="button"
                >
                  {method}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}
      <form className="login-form" onSubmit={(event) => event.preventDefault()}>
        <label className="login-field">
          <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5.5 19.5c.7-4 3.1-6 6.5-6s5.8 2 6.5 6" />
          </svg>
          <span>Benutzername</span>
          <input
            type="text"
            placeholder="Dein Benutzername"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </label>
        <label className="login-field">
          <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3.5" y="5.5" width="17" height="13" rx="3" />
            <path d="m5 7 7 5.4L19 7" />
          </svg>
          <span>E-Mail</span>
          <input
            type="email"
            placeholder="name@beispiel.de"
            value={accountEmail}
            onChange={(event) => setAccountEmail(event.target.value)}
            required
          />
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
