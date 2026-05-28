import logo from '../assets/Icon Gruppe H.png'

const languageOptions = [
  {
    id: 'german',
    title: 'Deutsch',
    example: '„Hey, schön dass du da bist!“',
    description: 'Deutsche Texte und Hinweise in der App',
  },
  {
    id: 'english',
    title: 'English',
    example: '"Hey, good to see you!"',
    description: 'App texts and messages in English',
  },
  {
    id: 'turkish',
    title: 'Türkçe',
    example: '"Merhaba, seni görmek güzel!"',
    description: 'Uygulama metinleri ve bildirimleri Türkçe',
  },
]

function Sprachstil({ languageStyle, tone, onSelectStyle, onNavigate }) {
  return (
    <section className="screen compact-screen style-screen">
      <button className="back-button" onClick={() => onNavigate('login')}>←</button>
      <img src={logo} alt="MyFlow Logo" className="small-logo" />
      <p className="eyebrow">Personalisierung</p>
      <h1>Welche Sprache möchtest du nutzen?</h1>
      <p className="style-intro">
        Du kannst später in deinem Profil jederzeit zwischen den Sprachen wechseln.
      </p>
      <div className="language-style-options">
        {languageOptions.map((option) => (
          <button
            className={`language-style-card ${languageStyle === option.id ? 'selected' : ''}`}
            onClick={() => onSelectStyle(option.id)}
            key={option.id}
          >
            <span className="style-check">{languageStyle === option.id ? '✓' : ''}</span>
            <strong>{option.title}</strong>
            <p>{option.example}</p>
            <small>{option.description}</small>
          </button>
        ))}
      </div>
      <button className="style-continue" onClick={() => onNavigate('dashboard')}>
        Mit {tone.label} fortfahren
      </button>
    </section>
  )
}

export default Sprachstil
