import { useState } from 'react'

function Ersteinrichtung({ onComplete, onNavigate, t }) {
  const [name, setName] = useState('')
  const [gender, setGender] = useState('none')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    onComplete({
      name: name.trim(),
      gender,
      weight,
      height,
    })
  }

  return (
    <section className="screen login-screen auth-detail-screen">
      <button className="login-back" onClick={() => onNavigate('start')} aria-label={t.common.back}>
        &larr;
      </button>
      <header className="login-header">
        <h1>Erstmal loslegen</h1>
        <p>Trage kurz deine Grunddaten ein. Daraus berechnet MyFlow spaeter BMI, Wasser und passende Empfehlungen.</p>
      </header>
      <form className="login-form" onSubmit={handleSubmit}>
        <label className="login-field">
          <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5.5 19.5c.7-4 3.1-6 6.5-6s5.8 2 6.5 6" />
          </svg>
          <span>{t.profile.name}</span>
          <input
            type="text"
            placeholder="Dein Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>
        <label className="login-field">
          <span>{t.profile.gender}</span>
          <select value={gender} onChange={(event) => setGender(event.target.value)} required>
            <option value="none">Keine Angabe</option>
            <option value="female">Weiblich</option>
            <option value="male">Maennlich</option>
          </select>
        </label>
        <label className="login-field">
          <span>{t.profile.weight}</span>
          <input
            min="30"
            max="250"
            type="number"
            placeholder="z. B. 70 kg"
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
            required
          />
        </label>
        <label className="login-field">
          <span>{t.profile.height}</span>
          <input
            min="120"
            max="230"
            type="number"
            placeholder="z. B. 175 cm"
            value={height}
            onChange={(event) => setHeight(event.target.value)}
            required
          />
        </label>
        <button className="login-submit register-submit" type="submit">
          Weiter
        </button>
      </form>
    </section>
  )
}

export default Ersteinrichtung
