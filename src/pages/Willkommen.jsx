import flowCharacter from '../assets/flow-character-wall-final.jpg'

function Willkommen({ onNavigate, profileName, t }) {
  const name = profileName || 'Nina'
  const welcome = t.welcomeCharacter ?? {
    eyebrow: 'MyFlow begleitet dich',
    title: `Willkommen, ${name}!`,
    text: 'Ich bin dein kleiner Flow-Begleiter. Lass uns deinen Tag ruhig und motiviert starten.',
    button: 'Weiter',
  }

  return (
    <section className="screen character-welcome-screen">
      <div className="character-welcome-card">
        <p className="eyebrow">{welcome.eyebrow}</p>
        <div className="flow-character" aria-hidden="true">
          <img className="flow-character-image" src={flowCharacter} alt="" />
        </div>
        <div className="character-speech">
          <h1>{welcome.title.replace('{name}', name)}</h1>
          <p>{welcome.text}</p>
        </div>
        <button className="primary-cta character-continue" type="button" onClick={() => onNavigate('dashboard')}>
          <span className="button-orb start-orb" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="img">
              <path d="M8 5.5v13l10-6.5-10-6.5Z" />
            </svg>
          </span>
          <span>{welcome.button}</span>
          <span className="button-orb arrow-orb" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="img">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </button>
      </div>
    </section>
  )
}

export default Willkommen
