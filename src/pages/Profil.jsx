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
]

const designOptions = ['Hell', 'Dunkel']

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
  const [activeEditor, setActiveEditor] = useState(null)
  const [name, setName] = useState('Student')
  const [gender, setGender] = useState('male')
  const [reminders, setReminders] = useState(true)
  const [design, setDesign] = useState('Hell')
  const [weight, setWeight] = useState(70)
  const [height, setHeight] = useState(175)
  const selectedGender = genderOptions.find((option) => option.id === gender)
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
    <section className="screen compact-screen">
      <img src={logo} alt="MyFlow Logo" className="small-logo" />
      <p className="eyebrow">Einstellungen</p>
      <h1>Profil</h1>
      <div className="profile-picture-card">
        <div className="profile-picture" aria-label="Profilbild">
          {profileInitial}
        </div>
        <div>
          <strong>{name}</strong>
          <p>Profilbild</p>
        </div>
        <button className="profile-picture-button" type="button" onClick={() => toggleEditor('picture')}>
          Ändern
        </button>
      </div>
      {activeEditor === 'picture' && (
        <div className="profile-edit-panel">
          <p>Aktuell wird der erste Buchstabe deines Namens als Profilbild angezeigt.</p>
        </div>
      )}
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
      </div>
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
