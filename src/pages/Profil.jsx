import logo from '../assets/Icon Gruppe H.png'

function Profil({ tone, onNavigate }) {
  return (
    <section className="screen compact-screen">
      <img src={logo} alt="MyFlow Logo" className="small-logo" />
      <p className="eyebrow">Einstellungen</p>
      <h1>Profil</h1>
      <div className="settings-list">
        <div><span>Name</span><strong>Studentin</strong></div>
        <div><span>Erinnerungen</span><strong>Aktiv</strong></div>
        <div><span>Sprachstil</span><strong>{tone.label}</strong></div>
        <div><span>Design</span><strong>Hell</strong></div>
      </div>
      <button className="secondary-button profile-style-button" onClick={() => onNavigate('languageStyle')}>
        Sprachstil ändern
      </button>
      <button onClick={() => onNavigate('start')}>Abmelden</button>
    </section>
  )
}

export default Profil
