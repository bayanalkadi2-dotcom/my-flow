import { useState } from 'react'
import Navbar from './commponents/Navbar'
import { habits, languageStyles, navItems } from './data/appData'
import DashboardHome from './pages/DashboardHome'
import Einloggen from './pages/Einloggen'
import PasswortAendern from './pages/Passwortändern'
import Profil from './pages/Profil'
import Registrieren from './pages/Registrieren'
import Routinen from './pages/Routinen'
import Sprachstil from './pages/Sprachstil'
import Startseite from './pages/Startseite'
import Statistik from './pages/Statistik'
import Freunde from './pages/Freunde'
import './App.css'

const authScreens = ['start', 'login', 'register', 'resetPassword', 'languageStyle']

function App() {
  const [screen, setScreen] = useState('start')
  const [languageStyle, setLanguageStyle] = useState('german')
  const tone = languageStyles[languageStyle]

  function renderScreen() {
    switch (screen) {
      case 'login':
        return <Einloggen onNavigate={setScreen} />
      case 'register':
        return <Registrieren onNavigate={setScreen} />
      case 'resetPassword':
        return <PasswortAendern onNavigate={setScreen} />
      case 'languageStyle':
        return (
          <Sprachstil
            languageStyle={languageStyle}
            tone={tone}
            onSelectStyle={setLanguageStyle}
            onNavigate={setScreen}
          />
        )
      case 'dashboard':
        return <DashboardHome habits={habits} tone={tone} />
      case 'habits':
        return <Routinen habits={habits} />
      case 'progress':
        return <Statistik />
      case 'profile':
        return (
          <Profil
            languageStyle={languageStyle}
            tone={tone}
            onNavigate={setScreen}
            onSelectStyle={setLanguageStyle}
          />
        )
      case 'freunde':
        return <Freunde />

default:
  return <Startseite onNavigate={setScreen} />
    }
  }

  return (
    <main className="app">
      {renderScreen()}

      {!authScreens.includes(screen) && (
        <Navbar activeScreen={screen} items={navItems} onNavigate={setScreen} />
      )}
    </main>
  )
}

export default App
