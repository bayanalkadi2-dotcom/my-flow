import { useEffect, useMemo, useState } from 'react'
import { useAuth } from './context/authContextValue'
import { getRoutines, bulkCreateRoutines } from './services/routineService'
import { getProfile, getUserSettings } from './services/authService'
import Navbar from './commponents/Navbar'
import { habits, languageStyles } from './data/appData'
import { getAppTranslations, translateHabit, translateUnit } from './i18n'
import DashboardHome from './pages/DashboardHome'
import DailyCheckIn from './commponents/checkin/DailyCheckIn'
import Einloggen from './pages/Einloggen'
import PasswortÄndern from './pages/Passwortändern'
import Profil from './pages/Profil'
import Registrieren from './pages/Registrieren'
import Routinen from './pages/Routinen'
import Sprachstil from './pages/Sprachstil'
import Startseite from './pages/Startseite'
import Statistik from './pages/Statistik'
import Freunde from './pages/Freunde'
import Willkommen from './pages/Willkommen'
import flowCharacter from './assets/flow-character-wall-final.jpg'
import './App.css'

const authScreens = ['start', 'login', 'register', 'resetPassword', 'languageStyle', 'welcomeCharacter']

function prepareRoutineData(routine) {
  const detail = routine.detail || `${routine.current ?? 0} / ${routine.target ?? 1} ${routine.unit || 'Mal'}`
  const progress = routine.progress ?? (Math.round((Number(routine.current ?? 0) / Number(routine.target ?? 1)) * 100))
  const done = routine.done ?? progress >= 100

  return {
    ...routine,
    detail,
    progress,
    done,
    status: done ? 'Erledigt' : Number(routine.current ?? 0) > 0 ? 'Aktiv' : 'Offen',
  }
}

function LoadingScreen() {
  return (
    <main className="app">
      <section className="screen" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid rgba(123, 97, 255, 0.2)',
          borderTop: '4px solid #7b61ff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: '#5f5b7c', fontSize: '16px' }}>Lädt...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </section>
    </main>
  )
}

function App() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()
  const [screen, setScreen] = useState('dashboard')
  const [languageStyle, setLanguageStyle] = useState('german')
  const [communicationStyle, setCommunicationStyle] = useState('casual')
  const [profileName, setProfileName] = useState('Gast')
  const [appTheme, setAppTheme] = useState('Hell')
  const [routineItems, setRoutineItems] = useState([])
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [routinesLoaded, setRoutinesLoaded] = useState(false)

  // Load user settings and routines from Supabase
  useEffect(() => {
    if (!isAuthenticated || !user) {
      queueMicrotask(() => {
        setLanguageStyle('german')
        setCommunicationStyle('casual')
        setProfileName('Gast')
        setAppTheme('Hell')
        setRoutineItems([])
        setScreen('start')
        setRoutinesLoaded(true)
      })
      return
    }

    async function loadUserData() {
      setIsLoadingData(true)
      try {
        // Load settings
        const settingsRes = await getUserSettings(user.id)
        if (settingsRes.success && settingsRes.settings) {
          setLanguageStyle(settingsRes.settings.language_style || 'german')
          setCommunicationStyle(settingsRes.settings.communication_style || 'casual')
          setAppTheme(settingsRes.settings.theme || 'Hell')
        }

        // Load profile
        const profileRes = await getProfile(user.id)
        if (profileRes.success && profileRes.profile) {
          setProfileName(profileRes.profile.display_name || 'Gast')
        }

        // Load routines
        const routinesRes = await getRoutines(user.id)
        if (routinesRes.success) {
          if (routinesRes.routines.length === 0) {
            // If no routines exist, create default ones
            const defaultRoutines = habits.map((habit) => ({
              title: habit.title,
              detail: habit.detail,
              progress: habit.progress || 0,
              category: habit.category,
              current: 0,
              target: 1,
              unit: habit.unit || 'Mal',
              done: false,
              type: habit.type,
            }))

            const createRes = await bulkCreateRoutines(user.id, defaultRoutines)
            if (createRes.success) {
              setRoutineItems(createRes.routines.map(prepareRoutineData))
            }
          } else {
            setRoutineItems(routinesRes.routines.map(prepareRoutineData))
          }
        }
        setScreen('dashboard')
      } catch (err) {
        console.error('Fehler beim Laden der Benutzerdaten:', err)
        setScreen('dashboard')
      } finally {
        setIsLoadingData(false)
        setRoutinesLoaded(true)
      }
    }

    loadUserData()
  }, [isAuthenticated, user])

  const tone = languageStyles[languageStyle]
  const t = getAppTranslations(languageStyle, communicationStyle)
  const preparedHabits = useMemo(
    () => routineItems.map((habit) => translateHabit(prepareRoutineData(habit), languageStyle)),
    [languageStyle, routineItems],
  )

  function addHabit(newHabit) {
    const habitData = {
      title: newHabit.title,
      category: newHabit.category,
      type: newHabit.type,
      current: 0,
      target: newHabit.target || 1,
      unit: newHabit.unit || 'Mal',
      done: false,
      period: newHabit.type === 'period' ? {} : undefined,
    }

    const newItem = { ...habitData, id: Date.now() }
    setRoutineItems((current) => [...current, newItem])

    // If authenticated, save to Supabase
    if (isAuthenticated && user) {
      (async () => {
        const { createRoutine } = await import('./services/routineService')
        createRoutine(user.id, habitData).catch((err) => {
          console.error('Fehler beim Speichern der Routine:', err)
        })
      })()
    }
  }

  function removeHabit(selectedHabit) {
    setRoutineItems((current) => current.filter((habit) => habit.id !== selectedHabit.id))

    // If authenticated, delete from Supabase
    if (isAuthenticated && user && selectedHabit.id) {
      (async () => {
        const { deleteRoutine } = await import('./services/routineService')
        deleteRoutine(selectedHabit.id, user.id).catch((err) => {
          console.error('Fehler beim Löschen der Routine:', err)
        })
      })()
    }
  }

  function incrementHabit(id) {
    setRoutineItems((current) =>
      current.map((habit) => {
        if (habit.id !== id) return habit

        const nextCurrent = Math.min(Number(habit.current ?? 0) + 1, Number(habit.target ?? 1))
        const updated = { ...habit, current: nextCurrent, done: nextCurrent >= Number(habit.target ?? 1) }

        // If authenticated, save to Supabase
        if (isAuthenticated && user) {
          (async () => {
            const { updateRoutine } = await import('./services/routineService')
            updateRoutine(id, user.id, { current: nextCurrent, done: updated.done }).catch((err) => {
              console.error('Fehler beim Aktualisieren der Routine:', err)
            })
          })()
        }

        return updated
      }),
    )
  }

  function decrementHabit(id) {
    setRoutineItems((current) =>
      current.map((habit) => {
        if (habit.id !== id) return habit

        const nextCurrent = Math.max(Number(habit.current ?? 0) - 1, 0)
        const updated = { ...habit, current: nextCurrent, done: false }

        // If authenticated, save to Supabase
        if (isAuthenticated && user) {
          (async () => {
            const { updateRoutine } = await import('./services/routineService')
            updateRoutine(id, user.id, { current: nextCurrent, done: false }).catch((err) => {
              console.error('Fehler beim Aktualisieren der Routine:', err)
            })
          })()
        }

        return updated
      }),
    )
  }

  function toggleHabitDone(selectedHabit) {
    const nextDone = !selectedHabit.done
    const nextCurrent = nextDone ? selectedHabit.target : selectedHabit.current
    setRoutineItems((current) =>
      current.map((habit) =>
        habit.id === selectedHabit.id
          ? { ...habit, done: nextDone, current: nextCurrent }
          : habit,
      ),
    )

    // If authenticated, save to Supabase
    if (isAuthenticated && user) {
      (async () => {
        const { updateRoutine } = await import('./services/routineService')
        updateRoutine(selectedHabit.id, user.id, { current: nextCurrent, done: nextDone }).catch((err) => {
          console.error('Fehler beim Aktualisieren der Routine:', err)
        })
      })()
    }
  }

  function setHabitMood(id, mood) {
    const currentHabit = routineItems.find((habit) => habit.id === id)
    const nextCurrent = Number(currentHabit?.target ?? 1)

    setRoutineItems((current) =>
      current.map((habit) =>
        habit.id === id
          ? {
              ...habit,
              mood,
              current: Number(habit.target ?? 1),
              done: true,
            }
          : habit,
      ),
    )

    // If authenticated, save to Supabase
    if (isAuthenticated && user) {
      (async () => {
        const { updateRoutine } = await import('./services/routineService')
        updateRoutine(id, user.id, { current: nextCurrent, mood, done: true }).catch((err) => {
          console.error('Fehler beim Aktualisieren der Routine:', err)
        })
      })()
    }
  }

  function updateHabitPeriod(id, changes) {
    const currentHabit = routineItems.find(h => h.id === id)
    const updatedPeriod = { ...(currentHabit?.period ?? {}), ...changes }

    setRoutineItems((current) =>
      current.map((habit) =>
        habit.id === id
          ? {
              ...habit,
              period: updatedPeriod,
              current: Number(habit.target ?? 1),
              done: true,
            }
          : habit,
      ),
    )

    // If authenticated, save to Supabase
    if (isAuthenticated && user) {
      (async () => {
        const { updateRoutine } = await import('./services/routineService')
        updateRoutine(id, user.id, { period: updatedPeriod, done: true }).catch((err) => {
          console.error('Fehler beim Aktualisieren der Routine:', err)
        })
      })()
    }
  }

  function selectLanguage(nextLanguage) {
    setLanguageStyle(nextLanguage)

    // If authenticated, save to Supabase
    if (isAuthenticated && user) {
      (async () => {
        const { updateUserSettings } = await import('./services/authService')
        updateUserSettings(user.id, { language_style: nextLanguage }).catch((err) => {
          console.error('Fehler beim Aktualisieren der Einstellungen:', err)
        })
      })()
    }
  }

  function handleAppThemeChange(theme) {
    setAppTheme(theme)

    // If authenticated, save to Supabase
    if (isAuthenticated && user) {
      (async () => {
        const { updateUserSettings } = await import('./services/authService')
        updateUserSettings(user.id, { theme }).catch((err) => {
          console.error('Fehler beim Aktualisieren der Einstellungen:', err)
        })
      })()
    }
  }

  function handleProfileNameChange(name) {
    setProfileName(name)

    // If authenticated, save to Supabase
    if (isAuthenticated && user) {
      (async () => {
        const { updateProfile } = await import('./services/authService')
        updateProfile(user.id, { display_name: name }).catch((err) => {
          console.error('Fehler beim Aktualisieren des Profils:', err)
        })
      })()
    }
  }

  function handleCommunicationStyleChange(style) {
    setCommunicationStyle(style)

    // If authenticated, save to Supabase
    if (isAuthenticated && user) {
      (async () => {
        const { updateUserSettings } = await import('./services/authService')
        updateUserSettings(user.id, { communication_style: style }).catch((err) => {
          console.error('Fehler beim Aktualisieren der Einstellungen:', err)
        })
      })()
    }
  }

  // Show loading screen while checking auth
  if (authLoading) {
    return <LoadingScreen />
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    const renderAuthScreen = () => {
      switch (screen) {
        case 'login':
          return <Einloggen onNavigate={setScreen} t={t} />
        case 'register':
          return <Registrieren onNavigate={setScreen} t={t} />
        case 'resetPassword':
          return <PasswortÄndern onNavigate={setScreen} t={t} />
        case 'languageStyle':
          return (
            <Sprachstil
              communicationStyle={communicationStyle}
              languageStyle={languageStyle}
              tone={tone}
              onSelectCommunicationStyle={handleCommunicationStyleChange}
              onSelectStyle={selectLanguage}
              onNavigate={setScreen}
              t={t}
            />
          )
        case 'welcomeCharacter':
          return (
            <Willkommen
              onNavigate={(nextScreen) => setScreen(nextScreen === 'dashboard' ? 'login' : nextScreen)}
              profileName={profileName}
              t={t}
            />
          )
        default:
          return <Startseite onNavigate={setScreen} t={t} />
      }
    }

    return (
      <main className={`app ${appTheme === 'Dunkel' ? 'theme-dark' : 'theme-light'} ${languageStyle === 'arabic' ? 'rtl' : ''}`} dir={languageStyle === 'arabic' ? 'rtl' : 'ltr'}>
        {renderAuthScreen()}
      </main>
    )
  }

  // Wait for routines to load
  if (!routinesLoaded || isLoadingData) {
    return <LoadingScreen />
  }

  function renderScreen() {
    switch (screen) {
      case 'dashboard':
        return (
          <DashboardHome
            habits={preparedHabits}
            communicationStyle={communicationStyle}
            languageStyle={languageStyle}
            profileName={profileName}
            tone={tone}
            t={t}
            onIncrement={incrementHabit}
            onDecrement={decrementHabit}
            onSetMood={setHabitMood}
            onUpdatePeriod={updateHabitPeriod}
            onRemove={removeHabit}
            onToggleDone={toggleHabitDone}
          />
        )
      case 'habits':
        return (
          <Routinen
            habits={preparedHabits}
            languageStyle={languageStyle}
            t={t}
            translateUnit={(unit) => translateUnit(unit, languageStyle)}
            onAddHabit={addHabit}
            onIncrement={incrementHabit}
            onDecrement={decrementHabit}
            onSetMood={setHabitMood}
            onUpdatePeriod={updateHabitPeriod}
            onRemove={removeHabit}
            onToggleDone={toggleHabitDone}
          />
        )
      case 'checkin':
        return <DailyCheckIn onNavigate={setScreen} user={user} />
      case 'progress':
        return <Statistik habits={preparedHabits} languageStyle={languageStyle} onNavigate={setScreen} t={t} />
      case 'freunde':
        return <Freunde habits={preparedHabits} t={t} />
      case 'welcomeCharacter':
        return <Willkommen onNavigate={setScreen} profileName={profileName} t={t} />
      case 'profile':
        return (
          <Profil
            appTheme={appTheme}
            languageStyle={languageStyle}
            communicationStyle={communicationStyle}
            profileName={profileName}
            tone={tone}
            t={t}
            onAppThemeChange={handleAppThemeChange}
            onNavigate={setScreen}
            onProfileNameChange={handleProfileNameChange}
            onCommunicationStyleChange={handleCommunicationStyleChange}
            onSelectStyle={selectLanguage}
          />
        )
      case 'profileSettings':
        return (
          <Profil
            appTheme={appTheme}
            languageStyle={languageStyle}
            communicationStyle={communicationStyle}
            profileName={profileName}
            settingsPage
            tone={tone}
            t={t}
            onAppThemeChange={handleAppThemeChange}
            onNavigate={setScreen}
            onProfileNameChange={handleProfileNameChange}
            onCommunicationStyleChange={handleCommunicationStyleChange}
            onSelectStyle={selectLanguage}
          />
        )
      default:
        return (
          <DashboardHome
            habits={preparedHabits}
            communicationStyle={communicationStyle}
            languageStyle={languageStyle}
            profileName={profileName}
            tone={tone}
            t={t}
            onIncrement={incrementHabit}
            onDecrement={decrementHabit}
            onSetMood={setHabitMood}
            onUpdatePeriod={updateHabitPeriod}
            onRemove={removeHabit}
            onToggleDone={toggleHabitDone}
          />
        )
    }
  }

  return (
    <main className={`app ${appTheme === 'Dunkel' ? 'theme-dark' : 'theme-light'} ${languageStyle === 'arabic' ? 'rtl' : ''}`} dir={languageStyle === 'arabic' ? 'rtl' : 'ltr'}>
      {renderScreen()}
      {!authScreens.includes(screen) && screen !== 'profileSettings' && screen !== 'checkin' && (
        <button
          className="floating-checkin-button"
          onClick={() => setScreen('checkin')}
          type="button"
          aria-label="Tages-Check-in oeffnen"
        >
          <img src={flowCharacter} alt="" />
          <span>Check-in</span>
        </button>
      )}
      {!authScreens.includes(screen) && screen !== 'profileSettings' && (
        <Navbar activeScreen={screen} items={Object.entries(t.nav).map(([id, label]) => ({ id, label }))} onNavigate={setScreen} />
      )}
    </main>
  )
}

export default App
