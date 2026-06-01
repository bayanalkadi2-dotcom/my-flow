import { useState } from 'react'
import logo from '../assets/Icon Gruppe H.png'

const languageOptions = [
  { id: 'german', label: 'Deutsch' },
  { id: 'english', label: 'English' },
  { id: 'turkish', label: 'Türkçe' },
]

const genderOptions = [
  { id: 'male', label: 'Männlich', name: 'Student' },
  { id: 'female', label: 'Weiblich', name: 'Studentin' },
  { id: 'none', label: 'Keine Angabe', name: 'Student' },
]

const designOptions = ['Hell', 'Dunkel']

const paymentPlans = [
  { id: 'free', label: 'Kostenlos', price: '0 EUR' },
  { id: 'plus', label: 'Plus Tools', price: '4,99 EUR' },
  { id: 'pro', label: 'Pro Tools', price: '9,99 EUR' },
]

const billingCycles = ['Monatlich', 'Jährlich']

const paymentMethods = ['PayPal', 'Klarna', 'Kreditkarte', 'SEPA', 'Apple Pay', 'Google Pay']

const paidTools = ['KI-Coach', 'Erweiterte Statistik', 'Premium-Routinen']

function getBmiCategory(bmi) {
  if (bmi < 18.5) {
    return 'Untergewicht'
  }

  if (bmi < 25) {
    return 'Normalgewicht'
  }

  if (bmi < 30) {
    return 'Übergewicht'
  }

  return 'Starkes Übergewicht'
}

function getHealthRecommendation(bmi, weight) {
  const waterLiters = Math.max(1.5, Math.round(weight * 35) / 1000).toFixed(1)

  if (bmi < 18.5) {
    return { water: waterLiters, steps: '7.000', note: 'ruhig steigern' }
  }

  if (bmi < 25) {
    return { water: waterLiters, steps: '8.000', note: 'guter Durchschnitt' }
  }

  if (bmi < 30) {
    return { water: waterLiters, steps: '9.000', note: 'aktiv bleiben' }
  }

  return { water: waterLiters, steps: '7.500', note: 'sanft anfangen' }
}

function Profil({ languageStyle, tone, onNavigate, onSelectStyle }) {
  const [showProfileSettings, setShowProfileSettings] = useState(false)
  const [activeEditor, setActiveEditor] = useState(null)
  const [name, setName] = useState('Student')
  const [gender, setGender] = useState('male')
  const [reminders, setReminders] = useState(true)
  const [design, setDesign] = useState('Hell')
  const [weight, setWeight] = useState(70)
  const [height, setHeight] = useState(175)
  const [paymentPlan, setPaymentPlan] = useState('free')
  const [billingCycle, setBillingCycle] = useState('Monatlich')
  const [paymentMethod, setPaymentMethod] = useState('PayPal')
  const selectedGender = genderOptions.find((option) => option.id === gender)
  const selectedPlan = paymentPlans.find((plan) => plan.id === paymentPlan)
  const profileInitial = name.trim().charAt(0).toUpperCase() || 'S'
  const heightInMeters = height / 100
  const bmi = weight > 0 && height > 0 ? weight / (heightInMeters * heightInMeters) : 0
  const bmiLabel = bmi.toFixed(1)
  const bmiCategory = getBmiCategory(bmi)
  const recommendation = getHealthRecommendation(bmi, weight)

  function toggleEditor(editor) {
    setActiveEditor((currentEditor) => (currentEditor === editor ? null : editor))
  }

  return (
    <section className="screen compact-screen profile-screen">
      <img src={logo} alt="MyFlow Logo" className="small-logo" />
      <h1>Profil</h1>
      <button
        className="settings-gear-button"
        onClick={() => setShowProfileSettings((current) => !current)}
        type="button"
        aria-label="Profil-Einstellungen öffnen"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
          <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.2a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.2a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3 1.6 1.6 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.2a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8 1.6 1.6 0 0 0 1.5 1h.2a2 2 0 0 1 0 4h-.2a1.6 1.6 0 0 0-1.5 1Z" />
        </svg>
      </button>
      <div className="profile-picture-card">
        <div className="profile-picture" aria-label="Profilbild">
          {profileInitial}
        </div>
        <div>
          <strong>{name}</strong>
          <p>Profilbild</p>
        </div>
      </div>
      {showProfileSettings && (
        <section className="register-settings-panel profile-settings-panel" aria-label="Profil-Einstellungen">
          <div className="register-settings-header">
            <div>
              <strong>Profil-Einstellungen</strong>
              <p>Persönliche Daten und App-Verhalten</p>
            </div>
            <button type="button" onClick={() => setShowProfileSettings(false)} aria-label="Einstellungen schließen">
              x
            </button>
          </div>
          <div className="profile-edit-panel">
            <p>Dein Profilbild nutzt aktuell automatisch den ersten Buchstaben deines Namens.</p>
          </div>
          <div className="settings-list">
        <div className="profile-setting-row">
          <span>Name</span>
          <strong>{name}</strong>
          <button type="button" onClick={() => toggleEditor('name')}>Ändern</button>
        </div>
        {activeEditor === 'name' && (
          <div className="profile-edit-panel">
            <label>
              Neuer Name
              <input value={name} onChange={(event) => setName(event.target.value)} />
            </label>
          </div>
        )}

        <div className="profile-setting-row">
          <span>Geschlecht</span>
          <strong>{selectedGender.label}</strong>
          <button type="button" onClick={() => toggleEditor('gender')}>Ändern</button>
        </div>
        {activeEditor === 'gender' && (
          <div className="profile-edit-panel option-grid">
            {genderOptions.map((option) => (
              <button
                className={`profile-choice ${gender === option.id ? 'selected' : ''}`}
                key={option.id}
                onClick={() => setGender(option.id)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        <div className="profile-setting-row">
          <span>Gewicht</span>
          <strong>{weight} kg</strong>
          <button type="button" onClick={() => toggleEditor('weight')}>Ändern</button>
        </div>
        {activeEditor === 'weight' && (
          <div className="profile-edit-panel">
            <label>
              Gewicht in kg
              <input
                min="30"
                max="250"
                type="number"
                value={weight}
                onChange={(event) => setWeight(Number(event.target.value))}
              />
            </label>
          </div>
        )}

        <div className="profile-setting-row">
          <span>Größe</span>
          <strong>{height} cm</strong>
          <button type="button" onClick={() => toggleEditor('height')}>Ändern</button>
        </div>
        {activeEditor === 'height' && (
          <div className="profile-edit-panel">
            <label>
              Größe in cm
              <input
                min="120"
                max="230"
                type="number"
                value={height}
                onChange={(event) => setHeight(Number(event.target.value))}
              />
            </label>
          </div>
        )}

        <div className="profile-setting-row">
          <span>Erinnerungen</span>
          <strong>{reminders ? 'Aktiv' : 'Aus'}</strong>
          <button type="button" onClick={() => toggleEditor('reminders')}>Ändern</button>
        </div>
        {activeEditor === 'reminders' && (
          <div className="profile-edit-panel option-grid">
            <button
              className={`profile-choice ${reminders ? 'selected' : ''}`}
              onClick={() => setReminders(true)}
              type="button"
            >
              Aktiv
            </button>
            <button
              className={`profile-choice ${!reminders ? 'selected' : ''}`}
              onClick={() => setReminders(false)}
              type="button"
            >
              Aus
            </button>
          </div>
        )}

        <div className="profile-setting-row">
          <span>Sprache</span>
          <strong>{tone.label}</strong>
          <button type="button" onClick={() => toggleEditor('language')}>Ändern</button>
        </div>
        {activeEditor === 'language' && (
          <div className="profile-edit-panel option-grid">
            {languageOptions.map((option) => (
              <button
                className={`profile-choice ${languageStyle === option.id ? 'selected' : ''}`}
                key={option.id}
                onClick={() => onSelectStyle(option.id)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        <div className="profile-setting-row">
          <span>Design</span>
          <strong>{design}</strong>
          <button type="button" onClick={() => toggleEditor('design')}>Ändern</button>
        </div>
        {activeEditor === 'design' && (
          <div className="profile-edit-panel option-grid">
            {designOptions.map((option) => (
              <button
                className={`profile-choice ${design === option ? 'selected' : ''}`}
                key={option}
                onClick={() => setDesign(option)}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>
        )}
        <div className="profile-setting-row">
          <span>Abo</span>
          <strong>{selectedPlan.label}</strong>
          <button type="button" onClick={() => toggleEditor('payment')}>Ändern</button>
        </div>
        {activeEditor === 'payment' && (
          <div className="settings-group payment-settings">
            <div className="payment-settings-title">
              <strong>Bezahlung</strong>
              <span>{selectedPlan.label} / {selectedPlan.price}</span>
            </div>
            <div className="paid-tools-list">
              {paidTools.map((tool) => (
                <span key={tool}>{tool}</span>
              ))}
            </div>
            <div className="payment-method-grid">
              {billingCycles.map((cycle) => (
                <button
                  className={`payment-method ${billingCycle === cycle ? 'selected' : ''}`}
                  key={cycle}
                  onClick={() => setBillingCycle(cycle)}
                  type="button"
                >
                  {cycle}
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
                  <strong>{plan.price}</strong>
                </button>
              ))}
            </div>
            <p>Plus und Pro schalten die Abo-Tools frei. Bezahlt wird mit der ausgewählten Zahlungsart.</p>
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
        )}
          </div>
        </section>
      )}
      <div className="bmi-card">
        <div>
          <span>BMI</span>
          <strong>{bmiLabel}</strong>
          <p>{bmiCategory}</p>
        </div>
        <div>
          <span>Wasser</span>
          <strong>{recommendation.water} L</strong>
          <p>pro Tag</p>
        </div>
        <div>
          <span>Schritte</span>
          <strong>{recommendation.steps}</strong>
          <p>{recommendation.note}</p>
        </div>
      </div>
      <button onClick={() => onNavigate('start')}>Abmelden</button>
    </section>
  )
}

export default Profil
