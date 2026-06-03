import { useState } from 'react'
import PasswordVisibilityButton from '../commponents/PasswordVisibilityButton'

const paymentPlans = [
  { id: 'free', label: 'Kostenlos', prices: { monthly: '0 EUR', yearly: '0 EUR' } },
  { id: 'plus', label: 'Plus Tools', prices: { monthly: '4,99 EUR', yearly: '59,88 EUR' } },
  { id: 'pro', label: 'Pro Tools', prices: { monthly: '9,99 EUR', yearly: '119,88 EUR' } },
]

const paymentMethods = ['PayPal', 'Klarna', 'Kreditkarte', 'SEPA', 'Apple Pay', 'Google Pay']

const billingCycles = [
  { id: 'monthly', label: 'Monatlich', priceLabel: 'monatlich' },
  { id: 'yearly', label: 'Jaehrlich', priceLabel: 'jaehrlich' },
]

function Registrieren({ onNavigate }) {
  const [showPassword, setShowPassword] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [username, setUsername] = useState('')
  const [accountEmail, setAccountEmail] = useState('')
  const [reminders, setReminders] = useState(true)
  const [newsletter, setNewsletter] = useState(false)
  const [twoFactor, setTwoFactor] = useState(false)
  const [paymentPlan, setPaymentPlan] = useState('free')
  const [paymentMethod, setPaymentMethod] = useState('PayPal')
  const [billingCycle, setBillingCycle] = useState('monthly')
  const selectedPlan = paymentPlans.find((plan) => plan.id === paymentPlan)
  const selectedCycle = billingCycles.find((cycle) => cycle.id === billingCycle)
  const selectedPrice = selectedPlan.prices[billingCycle]

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
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
          <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.2a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.2a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3 1.6 1.6 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.2a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8 1.6 1.6 0 0 0 1.5 1h.2a2 2 0 0 1 0 4h-.2a1.6 1.6 0 0 0-1.5 1Z" />
        </svg>
      </button>
      <header className="login-header">
        <h1>Konto erstellen</h1>
        <p>Erstelle dein Konto, um MyFlow vollständig zu nutzen.</p>
      </header>
      {showSettings && (
        <section className="register-settings-panel" aria-label="App-Einstellungen">
          <div className="register-settings-header">
            <div>
              <strong>Einstellungen</strong>
              <p>Account, Sicherheit und Bezahlung</p>
            </div>
            <button type="button" onClick={() => setShowSettings(false)} aria-label="Einstellungen schließen">
              x
            </button>
          </div>

          <div className="settings-group">
            <span className="settings-group-title">Account</span>
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
          </div>

          <div className="settings-group">
            <span className="settings-group-title">Sicherheit</span>
            <label>
              Neues Passwort
              <input type="password" placeholder="Neues Passwort" />
            </label>
            <div className="settings-toggle-row">
              <span>2-Faktor-Schutz</span>
              <button
                className={`settings-toggle ${twoFactor ? 'active' : ''}`}
                onClick={() => setTwoFactor((current) => !current)}
                type="button"
              >
                {twoFactor ? 'Aktiv' : 'Aus'}
              </button>
            </div>
          </div>

          <div className="settings-group">
            <span className="settings-group-title">Benachrichtigungen</span>
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
            <div className="settings-toggle-row">
              <span>Newsletter</span>
              <button
                className={`settings-toggle ${newsletter ? 'active' : ''}`}
                onClick={() => setNewsletter((current) => !current)}
                type="button"
              >
                {newsletter ? 'Aktiv' : 'Aus'}
              </button>
            </div>
          </div>

          <div className="settings-group payment-settings">
            <div className="payment-settings-title">
              <strong>Bezahlung</strong>
              <span>{selectedPlan.label} / {selectedPrice}</span>
            </div>
            <div className="payment-method-grid">
              {billingCycles.map((cycle) => (
                <button
                  className={`payment-method ${billingCycle === cycle.id ? 'selected' : ''}`}
                  key={cycle.id}
                  onClick={() => setBillingCycle(cycle.id)}
                  type="button"
                >
                  {cycle.label}
                </button>
              ))}
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
                  <strong>{plan.prices[billingCycle]}</strong>
                  <small>{selectedCycle.priceLabel}</small>
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
