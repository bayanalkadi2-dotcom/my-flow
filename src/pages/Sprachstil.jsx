import logo from '../assets/Icon Gruppe H.png'

function Sprachstil({ languageStyle, tone, onSelectStyle, onNavigate }) {
  return (
    <section className="screen compact-screen style-screen">
      <button className="back-button" onClick={() => onNavigate('login')}>←</button>
      <img src={logo} alt="MyFlow Logo" className="small-logo" />
      <p className="eyebrow">Personalisierung</p>
      <h1>Wie soll MyFlow mit dir sprechen?</h1>
      <p className="style-intro">
        Du kannst später in deinem Profil jederzeit zwischen den Sprachstilen wechseln.
      </p>
      <div className="language-style-options">
        <button
          className={`language-style-card ${languageStyle === 'casual' ? 'selected' : ''}`}
          onClick={() => onSelectStyle('casual')}
        >
          <span className="style-check">{languageStyle === 'casual' ? '✓' : ''}</span>
          <strong>Locker und nahbar</strong>
          <p>„Hey! Lust, heute deine Ziele gemeinsam anzugehen?“</p>
          <small>Persönlich, motivierend und weniger förmlich</small>
        </button>
        <button
          className={`language-style-card ${languageStyle === 'formal' ? 'selected' : ''}`}
          onClick={() => onSelectStyle('formal')}
        >
          <span className="style-check">{languageStyle === 'formal' ? '✓' : ''}</span>
          <strong>Normal und förmlich</strong>
          <p>„Willkommen. Ihre Tagesziele stehen bereit.“</p>
          <small>Sachlich, klar und wie in klassischen Apps</small>
        </button>
      </div>
      <button className="style-continue" onClick={() => onNavigate('dashboard')}>
        Mit „{tone.label}“ fortfahren
      </button>
    </section>
  )
}

export default Sprachstil
