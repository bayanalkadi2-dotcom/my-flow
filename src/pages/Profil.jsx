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

const levelSteps = [
  { name: 'Starter', min: 0 },
  { name: 'Bronze', min: 250 },
  { name: 'Silber', min: 500 },
  { name: 'Gold', min: 800 },
  { name: 'Flow Pro', min: 1200 },
]

const treeOptions = [
  { id: 'oak', label: 'Eiche', symbol: '🌳' },
  { id: 'pine', label: 'Tanne', symbol: '🌲' },
  { id: 'flower', label: 'Blüte', symbol: '🌸' },
]

function getFlowTree(score, treeType = 'oak') {
  const selectedTree = treeOptions.find((tree) => tree.id === treeType) ?? treeOptions[0]

  if (score < 100) {
    return { stage: 'Blatt', symbol: '🍃', progress: Math.round(score), next: 'Spross ab 100 Punkten', count: 1 }
  }

  if (score < 250) {
    return { stage: 'Spross', symbol: '🌱', progress: Math.round(((score - 100) / 150) * 100), next: 'Pflanze ab 250 Punkten', count: 1 }
  }

  if (score < 500) {
    return { stage: 'Pflanze', symbol: '🪴', progress: Math.round(((score - 250) / 250) * 100), next: 'Blume ab 500 Punkten', count: 1 }
  }

  if (score < 800) {
    return { stage: 'Blume', symbol: '🌸', progress: Math.round(((score - 500) / 300) * 100), next: 'Baum ab 800 Punkten', count: 1 }
  }

  if (score < 1200) {
    return { stage: selectedTree.label, symbol: selectedTree.symbol, progress: Math.round(((score - 800) / 400) * 100), next: 'zweiter Baum ab 1200 Punkten', count: 1 }
  }

  return { stage: 'Flow-Wald', symbol: selectedTree.symbol, progress: 100, next: 'Maximale Stufe erreicht', count: Math.min(3, Math.floor(score / 600)) }
}

function getLevel(score) {
  const currentLevel = [...levelSteps].reverse().find((level) => score >= level.min)
  const nextLevel = levelSteps.find((level) => level.min > score)
  const currentMin = currentLevel?.min ?? 0
  const nextMin = nextLevel?.min ?? currentMin
  const progress = nextLevel
    ? Math.round(((score - currentMin) / (nextMin - currentMin)) * 100)
    : 100

  return {
    current: currentLevel?.name ?? 'Starter',
    next: nextLevel?.name ?? 'Max Level',
    nextMin,
    progress,
  }
}

function getPaymentInstruction(method) {
  switch (method) {
    case 'PayPal':
      return 'Du wirst mit deinem PayPal-Konto verbunden.'
    case 'Klarna':
      return 'Klarna prüft deine Zahlung und bestätigt den Kauf.'
    case 'Kreditkarte':
      return 'Gib deine Kartendaten ein, um die Zahlung zu bestätigen.'
    case 'SEPA':
      return 'Gib deine IBAN ein, damit das Abo per Lastschrift bezahlt wird.'
    case 'Apple Pay':
      return 'Bestätige die Zahlung mit Apple Pay.'
    case 'Google Pay':
      return 'Bestätige die Zahlung mit Google Pay.'
    default:
      return 'Wähle eine Zahlungsart aus.'
  }
}

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

function Profil({
  appTheme,
  communicationStyle,
  languageStyle,
  profileName,
  tone,
  t,
  onAppThemeChange,
  onCommunicationStyleChange,
  onNavigate,
  onProfileNameChange,
  onSelectStyle,
}) {
  const [showProfileSettings, setShowProfileSettings] = useState(false)
  const [activeEditor, setActiveEditor] = useState(null)
  const [gender, setGender] = useState('male')
  const [reminders, setReminders] = useState(true)
  const [weight, setWeight] = useState(70)
  const [height, setHeight] = useState(175)
  const [paymentPlan, setPaymentPlan] = useState('free')
  const [billingCycle, setBillingCycle] = useState('Monatlich')
  const [paymentMethod, setPaymentMethod] = useState('PayPal')
  const [paymentStatus, setPaymentStatus] = useState('Nicht gestartet')
  const [cardNumber, setCardNumber] = useState('')
  const [iban, setIban] = useState('')
  const [paymentEmail, setPaymentEmail] = useState('')
  const [treeType, setTreeType] = useState('oak')
  const [draftSettings, setDraftSettings] = useState({
    name: profileName || 'Nina',
    gender,
    weight,
    height,
    reminders,
    communicationStyle,
    languageStyle,
    design: appTheme,
  })
  const selectedGender = genderOptions.find((option) => option.id === gender)
  const selectedPlan = paymentPlans.find((plan) => plan.id === paymentPlan)
  const name = profileName || 'Nina'
  const profileInitial = name.trim().charAt(0).toUpperCase() || 'N'
  const heightInMeters = height / 100
  const bmi = weight > 0 && height > 0 ? weight / (heightInMeters * heightInMeters) : 0
  const bmiLabel = bmi.toFixed(1)
  const bmiCategory = getBmiCategory(bmi)
  const recommendation = getHealthRecommendation(bmi, weight)
  const challengePoints = 650
  const level = getLevel(challengePoints)
  const flowTree = getFlowTree(challengePoints, treeType)
  const treeChoiceUnlocked = challengePoints >= 800

  function openEditor(editor) {
    if (activeEditor === editor) {
      setActiveEditor(null)
      return
    }

    setDraftSettings({
      name,
      gender,
      weight,
      height,
      reminders,
      communicationStyle,
      languageStyle,
      design: appTheme,
    })
    setActiveEditor(editor)
  }

  function updateDraft(key, value) {
    setDraftSettings((currentDraft) => ({
      ...currentDraft,
      [key]: value,
    }))
  }

  function confirmEditor() {
    switch (activeEditor) {
      case 'name':
        onProfileNameChange(draftSettings.name)
        break
      case 'gender':
        setGender(draftSettings.gender)
        break
      case 'weight':
        setWeight(Number(draftSettings.weight) || weight)
        break
      case 'height':
        setHeight(Number(draftSettings.height) || height)
        break
      case 'reminders':
        setReminders(draftSettings.reminders)
        break
      case 'language':
        onSelectStyle(draftSettings.languageStyle)
        break
      case 'communicationStyle':
        onCommunicationStyleChange(draftSettings.communicationStyle)
        break
      case 'design':
        onAppThemeChange(draftSettings.design)
        break
      default:
        break
    }

    setActiveEditor(null)
  }

  function handlePaymentSubmit() {
    if (paymentPlan === 'free') {
      setPaymentStatus('Kostenloser Plan aktiv')
      return
    }

    setPaymentStatus(`${selectedPlan.label} mit ${paymentMethod} aktiviert`)
  }

  return (
    <section className="screen compact-screen profile-screen">
      <img src={logo} alt="MyFlow Logo" className="small-logo" />
      <h1>{t.profile.title}</h1>
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
          <p>{t.profile.picture}</p>
        </div>
      </div>
      {showProfileSettings && (
        <section className="register-settings-panel profile-settings-panel" aria-label="Profil-Einstellungen">
          <div className="register-settings-header">
            <div>
              <strong>{t.profile.settings}</strong>
              <p>{t.profile.settingsText}</p>
            </div>
            <button type="button" onClick={() => setShowProfileSettings(false)} aria-label="Einstellungen schließen">
              x
            </button>
          </div>
          <div className="profile-edit-panel">
            <p>{t.profile.pictureText}</p>
          </div>
          <div className="settings-list">
        <div className="profile-setting-row">
          <span>{t.profile.name}</span>
          <strong>{name}</strong>
          <button type="button" onClick={() => openEditor('name')}>{t.common.change}</button>
        </div>
        {activeEditor === 'name' && (
          <div className="profile-edit-panel">
            <label>
              {t.profile.newName}
              <input value={draftSettings.name} onChange={(event) => updateDraft('name', event.target.value)} />
            </label>
            <button className="profile-confirm-button" type="button" onClick={confirmEditor}>OK</button>
          </div>
        )}

        <div className="profile-setting-row">
          <span>{t.profile.gender}</span>
          <strong>{selectedGender.label}</strong>
          <button type="button" onClick={() => openEditor('gender')}>{t.common.change}</button>
        </div>
        {activeEditor === 'gender' && (
          <div className="profile-edit-panel">
            <div className="option-grid">
              {genderOptions.map((option) => (
                <button
                  className={`profile-choice ${draftSettings.gender === option.id ? 'selected' : ''}`}
                  key={option.id}
                  onClick={() => updateDraft('gender', option.id)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
            <button className="profile-confirm-button" type="button" onClick={confirmEditor}>OK</button>
          </div>
        )}

        <div className="profile-setting-row">
          <span>{t.profile.weight}</span>
          <strong>{weight} kg</strong>
          <button type="button" onClick={() => openEditor('weight')}>{t.common.change}</button>
        </div>
        {activeEditor === 'weight' && (
          <div className="profile-edit-panel">
            <label>
              {t.profile.weight} in kg
              <input
                min="30"
                max="250"
                type="number"
                value={draftSettings.weight}
                onChange={(event) => updateDraft('weight', event.target.value)}
              />
            </label>
            <button className="profile-confirm-button" type="button" onClick={confirmEditor}>OK</button>
          </div>
        )}

        <div className="profile-setting-row">
          <span>{t.profile.height}</span>
          <strong>{height} cm</strong>
          <button type="button" onClick={() => openEditor('height')}>{t.common.change}</button>
        </div>
        {activeEditor === 'height' && (
          <div className="profile-edit-panel">
            <label>
              {t.profile.height} in cm
              <input
                min="120"
                max="230"
                type="number"
                value={draftSettings.height}
                onChange={(event) => updateDraft('height', event.target.value)}
              />
            </label>
            <button className="profile-confirm-button" type="button" onClick={confirmEditor}>OK</button>
          </div>
        )}

        <div className="profile-setting-row">
          <span>{t.profile.reminders}</span>
          <strong>{reminders ? t.common.active : t.common.off}</strong>
          <button type="button" onClick={() => openEditor('reminders')}>{t.common.change}</button>
        </div>
        {activeEditor === 'reminders' && (
          <div className="profile-edit-panel">
            <div className="option-grid">
              <button
                className={`profile-choice ${draftSettings.reminders ? 'selected' : ''}`}
                onClick={() => updateDraft('reminders', true)}
                type="button"
              >
                {t.common.active}
              </button>
              <button
                className={`profile-choice ${!draftSettings.reminders ? 'selected' : ''}`}
                onClick={() => updateDraft('reminders', false)}
                type="button"
              >
                {t.common.off}
              </button>
            </div>
            <button className="profile-confirm-button" type="button" onClick={confirmEditor}>OK</button>
          </div>
        )}

        <div className="profile-setting-row">
          <span>{t.profile.language}</span>
          <strong>{tone.label}</strong>
          <button type="button" onClick={() => openEditor('language')}>{t.common.change}</button>
        </div>
        {activeEditor === 'language' && (
          <div className="profile-edit-panel">
            <div className="option-grid">
              {languageOptions.map((option) => (
                <button
                  className={`profile-choice ${draftSettings.languageStyle === option.id ? 'selected' : ''}`}
                  key={option.id}
                  onClick={() => updateDraft('languageStyle', option.id)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
            <button className="profile-confirm-button" type="button" onClick={confirmEditor}>OK</button>
          </div>
        )}

        <div className="profile-setting-row">
          <span>{t.profile.communicationStyle}</span>
          <strong>{t.language.toneOptions[communicationStyle].title}</strong>
          <button type="button" onClick={() => openEditor('communicationStyle')}>{t.common.change}</button>
        </div>
        {activeEditor === 'communicationStyle' && (
          <div className="profile-edit-panel">
            <div className="option-grid">
              {Object.entries(t.language.toneOptions).map(([id, option]) => (
                <button
                  className={`profile-choice ${draftSettings.communicationStyle === id ? 'selected' : ''}`}
                  key={id}
                  onClick={() => updateDraft('communicationStyle', id)}
                  type="button"
                >
                  {option.title}
                </button>
              ))}
            </div>
            <button className="profile-confirm-button" type="button" onClick={confirmEditor}>OK</button>
          </div>
        )}

        <div className="profile-setting-row">
          <span>{t.profile.design}</span>
          <strong>{appTheme}</strong>
          <button type="button" onClick={() => openEditor('design')}>{t.common.change}</button>
        </div>
        {activeEditor === 'design' && (
          <div className="profile-edit-panel">
            <div className="option-grid">
              {designOptions.map((option) => (
                <button
                  className={`profile-choice ${draftSettings.design === option ? 'selected' : ''}`}
                  key={option}
                  onClick={() => updateDraft('design', option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
            <button className="profile-confirm-button" type="button" onClick={confirmEditor}>OK</button>
          </div>
        )}
        <div className="profile-setting-row">
          <span>{t.profile.subscription}</span>
          <strong>{selectedPlan.label}</strong>
          <button type="button" onClick={() => openEditor('payment')}>{t.common.change}</button>
        </div>
        {activeEditor === 'payment' && (
          <div className="settings-group payment-settings">
            <div className="payment-settings-title">
              <strong>{t.profile.payment}</strong>
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
            <p>{t.profile.paidText}</p>
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
            <div className="payment-checkout">
              <div>
                <span>Zahlung ausführen</span>
                <strong>{paymentStatus}</strong>
                <p>{getPaymentInstruction(paymentMethod)}</p>
              </div>
              {['PayPal', 'Klarna'].includes(paymentMethod) && (
                <label>
                  Zahlungs-E-Mail
                  <input
                    type="email"
                    value={paymentEmail}
                    onChange={(event) => setPaymentEmail(event.target.value)}
                    placeholder="name@beispiel.de"
                  />
                </label>
              )}
              {paymentMethod === 'Kreditkarte' && (
                <label>
                  Kartennummer
                  <input
                    inputMode="numeric"
                    value={cardNumber}
                    onChange={(event) => setCardNumber(event.target.value)}
                    placeholder="1234 5678 9012 3456"
                  />
                </label>
              )}
              {paymentMethod === 'SEPA' && (
                <label>
                  IBAN
                  <input
                    value={iban}
                    onChange={(event) => setIban(event.target.value)}
                    placeholder="DE00 0000 0000 0000 0000 00"
                  />
                </label>
              )}
              {['Apple Pay', 'Google Pay'].includes(paymentMethod) && (
                <p className="wallet-note">Für Wallet-Zahlungen nutzt die App später die Zahlung auf deinem Gerät.</p>
              )}
              <button className="payment-submit" type="button" onClick={handlePaymentSubmit}>
                {paymentPlan === 'free' ? 'Kostenlosen Plan aktivieren' : 'Zahlung bestätigen'}
              </button>
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
          <span>{t.profile.water}</span>
          <strong>{recommendation.water} L</strong>
          <p>{t.profile.perDay}</p>
        </div>
        <div>
          <span>Schritte</span>
          <strong>{recommendation.steps}</strong>
          <p>{recommendation.note}</p>
        </div>
      </div>
      <div className="profile-level-card">
        <div>
          <span>{t.profile.challengeLevel}</span>
          <h2>{level.current}</h2>
          <p>{t.profile.points.replace('{points}', challengePoints)}</p>
        </div>
        <strong>{level.progress}%</strong>
        <div className="profile-level-progress">
          <span style={{ width: `${level.progress}%` }} />
        </div>
        <small>{t.profile.nextLevel.replace('{level}', level.next).replace('{points}', level.nextMin)}</small>
      </div>
      <div className="flow-tree-card">
        <div className="flow-tree-visual" aria-label={`FlowTree Stufe ${flowTree.stage}`}>
          {Array.from({ length: flowTree.count }).map((_, index) => (
            <span key={index}>{flowTree.symbol}</span>
          ))}
        </div>
        <div className="flow-tree-info">
          <span>FlowTree</span>
          <h2>{flowTree.stage}</h2>
          <p>{flowTree.next}</p>
        </div>
        <div className="flow-tree-progress">
          <span style={{ width: `${flowTree.progress}%` }} />
        </div>
        <small>{flowTree.progress}% Wachstum bis zur nächsten Stufe</small>
        <div className="tree-choice-row">
          {treeOptions.map((tree) => (
            <button
              className={treeType === tree.id ? 'selected' : ''}
              disabled={!treeChoiceUnlocked}
              key={tree.id}
              onClick={() => setTreeType(tree.id)}
              type="button"
            >
              <span>{tree.symbol}</span>
              {tree.label}
            </button>
          ))}
        </div>
      </div>
      <button onClick={() => onNavigate('start')}>{t.profile.logout}</button>
    </section>
  )
}

export default Profil
