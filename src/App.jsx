import { useEffect, useMemo, useState } from 'react'
import { useAuth } from './context/authContextValue'
import { useProfile } from './context/profileContextValue'
import { useCheckins } from './context/checkinContextValue'
import { getRoutines, bulkCreateRoutines } from './services/routineService'
import { getUserSettings, saveOnboardingProfile } from './services/authService'
import Navbar from './commponents/Navbar'
import { habits, languageStyles } from './data/appData'
import { getAppTranslations, translateHabit, translateUnit } from './i18n'
import { loadCalendarNotes, saveCalendarNotes } from './utils/calendarNotes'
import DashboardHome from './pages/DashboardHome'
import DailyCheckIn from './commponents/checkin/DailyCheckIn'
import Einloggen from './pages/Einloggen'
import PasswortÄndern from './pages/Passwortändern'
import Kalender from './pages/Kalender'
import Profil from './pages/Profil'
import Registrieren from './pages/Registrieren'
import Routinen from './pages/Routinen'
import Sprachstil from './pages/Sprachstil'
import Startseite from './pages/Startseite'
import Statistik from './pages/Statistik'
import Freunde from './pages/Freunde'
import Willkommen from './pages/Willkommen'
import Onboarding from './pages/Onboarding'
import StudentOnboarding from './pages/StudentOnboarding'
import flowCharacter from './assets/flow-character-wall-final.jpg'
import './App.css'

const authScreens = ['start', 'login', 'register', 'resetPassword', 'languageStyle', 'welcomeCharacter']
const persistentScreens = new Set(['dashboard', 'calendar', 'habits', 'progress', 'profile', 'profileSettings', 'freunde'])

function loadLastScreen(userId) {
  if (!userId) return 'dashboard'
  const savedScreen = localStorage.getItem(`myflow-last-screen-${userId}`)
  return persistentScreens.has(savedScreen) ? savedScreen : 'dashboard'
}
const removedRoutineTitles = new Set([
  'tagebuch',
  'lesen',
  'sport',
  'gesund essen',
  'supplement eingenommen',
  'magnesium/zink eingenommen',
  'tagesplanung',
  'fokuszeit',
  'freunde kontaktieren',
  'familie kontaktieren',
  'soziale aktivität',
])

const defaultAccountProfile = {
  age: '',
  goals: '',
  dailyRoutine: '',
  interests: '',
}

function loadAccountProfile() {
  try {
    return { ...defaultAccountProfile, ...JSON.parse(localStorage.getItem('myflow-account-profile') || '{}') }
  } catch {
    return defaultAccountProfile
  }
}

function isRemovedRoutine(routine) {
  const title = String(routine?.title ?? '').trim().toLowerCase()
  return removedRoutineTitles.has(title) || removedRoutineTitles.has(title.replaceAll('ä', 'Ã¤'))
}

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
  const { profile, setProfile, isLoading: profileLoading } = useProfile()
  const { addCheckin } = useCheckins()
  const [screen, setScreen] = useState('dashboard')
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => localStorage.getItem('hasSeenOnboarding') === 'true')
  const [languageStyle, setLanguageStyle] = useState('german')
  const [communicationStyle, setCommunicationStyle] = useState('casual')
  const [profileName, setProfileName] = useState('Gast')
  const [appTheme, setAppTheme] = useState('Hell')
  const [routineItems, setRoutineItems] = useState([])
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [routinesLoaded, setRoutinesLoaded] = useState(false)
  const [accountProfile, setAccountProfile] = useState(loadAccountProfile)
  const [calendarNotes, setCalendarNotes] = useState({})
  const [isSavingOnboarding, setIsSavingOnboarding] = useState(false)
  const needsStudentOnboarding = isAuthenticated
    && !profileLoading
    && profile?.onboarding_completed !== true
  const resolvedProfileName = profile?.display_name || profileName

  // Load user settings and routines from Supabase
  useEffect(() => {
    if (!isAuthenticated || !user) {
      queueMicrotask(() => {
        setLanguageStyle('german')
        setCommunicationStyle('casual')
        setProfileName('Gast')
        setAppTheme('Hell')
        setRoutineItems([])
        setCalendarNotes({})
        setProfile(null)
        setAccountProfile(loadAccountProfile())
        setScreen('start')
        setRoutinesLoaded(true)
      })
      return
    }

    async function loadUserData() {
      setIsLoadingData(true)
      try {
        setCalendarNotes(loadCalendarNotes(user.id))
        // Load settings
        const settingsRes = await getUserSettings(user.id)
        if (settingsRes.success && settingsRes.settings) {
          setLanguageStyle(settingsRes.settings.language_style || 'german')
          setCommunicationStyle(settingsRes.settings.communication_style || 'casual')
          setAppTheme(settingsRes.settings.theme || 'Hell')
        }

        // Load routines
        const routinesRes = await getRoutines(user.id)
        if (routinesRes.success) {
          if (routinesRes.routines.length === 0) {
            // If no routines exist, create default ones
            const defaultRoutines = habits
              .filter((habit) => !isRemovedRoutine(habit))
              .map((habit) => ({
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
              setRoutineItems(createRes.routines.filter((routine) => !isRemovedRoutine(routine)).map(prepareRoutineData))
            }
          } else {
            setRoutineItems(routinesRes.routines.filter((routine) => !isRemovedRoutine(routine)).map(prepareRoutineData))
          }
        }
        setScreen(loadLastScreen(user.id))
      } catch (err) {
        console.error('Fehler beim Laden der Benutzerdaten:', err)
        setScreen(loadLastScreen(user.id))
      } finally {
        setIsLoadingData(false)
        setRoutinesLoaded(true)
      }
    }

    loadUserData()
  }, [isAuthenticated, user])

  useEffect(() => {
    if (isAuthenticated && user?.id && persistentScreens.has(screen)) {
      localStorage.setItem(`myflow-last-screen-${user.id}`, screen)
    }
  }, [isAuthenticated, screen, user?.id])

  const tone = languageStyles[languageStyle]
  const t = getAppTranslations(languageStyle, communicationStyle)
  const preparedHabits = useMemo(
    () => routineItems.map((habit) => translateHabit(prepareRoutineData(habit), languageStyle)),
    [languageStyle, routineItems],
  )

  function handleCalendarNotesChange(nextNotes) {
    setCalendarNotes(nextNotes)
    if (isAuthenticated && user?.id) {
      saveCalendarNotes(user.id, nextNotes)
    }
  }

  function addHabit(newHabit) {
    if (isRemovedRoutine(newHabit)) {
      return
    }

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
    const currentHabit = routineItems.find((habit) => habit.id === id)
    if (currentHabit) {
      const nextValue = Math.min(Number(currentHabit.current ?? 0) + 1, Number(currentHabit.target ?? 1))
      if (nextValue >= Number(currentHabit.target ?? 1) && !currentHabit.done) {
        addCheckin({ routineId: currentHabit.id, title: currentHabit.title })
      }
    }

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
    if (nextDone) {
      addCheckin({ routineId: selectedHabit.id, title: selectedHabit.title })
    }
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
    if (currentHabit) {
      addCheckin({ routineId: currentHabit.id, title: currentHabit.title })
    }

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
    if (currentHabit) {
      addCheckin({ routineId: currentHabit.id, title: currentHabit.title })
    }

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
    setProfile((current) => current ? { ...current, display_name: name } : current)

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

  function handleAccountProfileChange(nextAccountProfile) {
    setAccountProfile(nextAccountProfile)
    localStorage.setItem('myflow-account-profile', JSON.stringify(nextAccountProfile))
  }

  async function handleStudentOnboardingComplete(answers) {
    const returnToProfile = screen === 'profileOnboarding'
    setIsSavingOnboarding(true)
    try {
      const result = await saveOnboardingProfile(answers, resolvedProfileName || 'Gast')

      if (!result.success) {
        const isSignedOut = result.error?.message === 'Du bist nicht angemeldet.'
        throw new Error(
          isSignedOut
            ? 'Du bist nicht angemeldet.'
            : 'Deine Angaben konnten nicht gespeichert werden. Bitte versuche es erneut.',
          { cause: result.error },
        )
      }

      setProfile(result.profile)
      setScreen(returnToProfile ? 'profile' : 'dashboard')
    } catch (err) {
      console.error('Onboarding konnte nicht gespeichert werden:', err.cause ?? err)
      throw err
    } finally {
      setIsSavingOnboarding(false)
    }
  }

  function handleOnboardingFinish() {
    localStorage.setItem('hasSeenOnboarding', 'true')
    setHasSeenOnboarding(true)
    setScreen(isAuthenticated ? 'dashboard' : 'start')
  }

  if (!hasSeenOnboarding) {
    return (
      <main className={`app onboarding-app ${appTheme === 'Dunkel' ? 'theme-dark' : 'theme-light'} ${languageStyle === 'arabic' ? 'rtl' : ''}`} dir={languageStyle === 'arabic' ? 'rtl' : 'ltr'}>
        <Onboarding onFinish={handleOnboardingFinish} />
      </main>
    )
  }

  // Show loading screen while checking auth, after the introductory pages.
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
              profileName={resolvedProfileName}
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
  if (!routinesLoaded || isLoadingData || profileLoading) {
    return <LoadingScreen />
  }

  if (needsStudentOnboarding || screen === 'profileOnboarding') {
    return (
      <main className={`app ${appTheme === 'Dunkel' ? 'theme-dark' : 'theme-light'} ${languageStyle === 'arabic' ? 'rtl' : ''}`} dir={languageStyle === 'arabic' ? 'rtl' : 'ltr'}>
        <StudentOnboarding
          initialAnswers={profile ?? {}}
          includePreferences={screen === 'profileOnboarding'}
          mode="profile"
          onBack={() => needsStudentOnboarding ? setScreen('dashboard') : setScreen('profileSettings')}
          onComplete={handleStudentOnboardingComplete}
          saving={isSavingOnboarding}
        />
      </main>
    )
  }

  function renderScreen() {
    switch (screen) {
      case 'dashboard':
        return (
          <DashboardHome
            accountProfile={accountProfile}
            calendarNotes={calendarNotes}
            habits={preparedHabits}
            communicationStyle={communicationStyle}
            languageStyle={languageStyle}
            profileName={resolvedProfileName}
            tone={tone}
            t={t}
            onNavigate={setScreen}
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
      case 'calendar':
        return <Kalender notes={calendarNotes} onNotesChange={handleCalendarNotesChange} />
      case 'progress':
        return <Statistik habits={preparedHabits} languageStyle={languageStyle} onNavigate={setScreen} t={t} />
      case 'freunde':
        return <Freunde habits={preparedHabits} t={t} />
      case 'welcomeCharacter':
        return <Willkommen onNavigate={setScreen} profileName={resolvedProfileName} t={t} />
      case 'profile':
        return (
          <Profil
            accountProfile={accountProfile}
            appTheme={appTheme}
            habits={preparedHabits}
            languageStyle={languageStyle}
            communicationStyle={communicationStyle}
            profileName={resolvedProfileName}
            tone={tone}
            t={t}
            onAccountProfileChange={handleAccountProfileChange}
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
            accountProfile={accountProfile}
            appTheme={appTheme}
            habits={preparedHabits}
            languageStyle={languageStyle}
            communicationStyle={communicationStyle}
            profileName={resolvedProfileName}
            settingsPage
            tone={tone}
            t={t}
            onAccountProfileChange={handleAccountProfileChange}
            onAppThemeChange={handleAppThemeChange}
            onNavigate={setScreen}
            onProfileNameChange={handleProfileNameChange}
            onCommunicationStyleChange={handleCommunicationStyleChange}
            onSelectStyle={selectLanguage}
          />
        )
      case 'profileOnboarding':
        return (
          <StudentOnboarding
            initialAnswers={profile ?? {}}
            includePreferences
            mode="profile"
            onBack={() => setScreen('profileSettings')}
            onComplete={handleStudentOnboardingComplete}
            saving={isSavingOnboarding}
          />
        )
      default:
        return (
          <DashboardHome
            accountProfile={accountProfile}
            calendarNotes={calendarNotes}
            habits={preparedHabits}
            communicationStyle={communicationStyle}
            languageStyle={languageStyle}
            profileName={resolvedProfileName}
            tone={tone}
            t={t}
            onNavigate={setScreen}
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
      {!authScreens.includes(screen) && screen !== 'profileSettings' && screen !== 'checkin' && screen !== 'calendar' && (
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
        <Navbar
          activeScreen={screen}
          items={['dashboard', 'calendar', 'habits', 'progress', 'profile'].map((id) => ({ id, label: t.nav[id] }))}
          onNavigate={setScreen}
        />
      )}
    </main>
  )
}

export default App
