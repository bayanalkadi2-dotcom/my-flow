import logo from '../assets/Icon Gruppe H.png'

const languageIds = ['german', 'english', 'turkish']

function Sprachstil({ languageStyle, tone, onSelectStyle, onNavigate, t }) {
  return (
    <section className="screen compact-screen style-screen">
      <button className="back-button" onClick={() => onNavigate('login')} aria-label={t.common.back}>
        &larr;
      </button>
      <img src={logo} alt="MyFlow Logo" className="small-logo" />
      <p className="eyebrow">{t.language.eyebrow}</p>
      <h1>{t.language.title}</h1>
      <p className="style-intro">{t.language.intro}</p>
      <div className="language-style-options">
        {languageIds.map((id) => {
          const option = t.language.options[id]

          return (
            <button
              className={`language-style-card ${languageStyle === id ? 'selected' : ''}`}
              onClick={() => onSelectStyle(id)}
              key={id}
            >
              <span className="style-check">{languageStyle === id ? '✓' : ''}</span>
              <strong>{option.title}</strong>
              <p>{option.example}</p>
              <small>{option.description}</small>
            </button>
          )
        })}
      </div>
      <button className="style-continue" onClick={() => onNavigate('dashboard')}>
        {t.language.continue.replace('{language}', tone.label)}
      </button>
    </section>
  )
}

export default Sprachstil
