import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from './context/authContextValue'
import { useProfile } from './context/profileContextValue'
import { useCheckins } from './context/checkinContextValue'
import { getRoutines, updateRoutine } from './services/routineService'
import { getUserSettings, saveOnboardingProfile } from './services/authService'
import Navbar from './commponents/Navbar'
import { languageStyles } from './data/appData'
import { getAppTranslations, translateHabit, translateUnit } from './i18n'
import { loadCalendarNotes, saveCalendarNotes } from './utils/calendarNotes'
import { getLocalDateKey } from './utils/checkins'
import { calculateRoutineProgress, getRoutineCredits, getRoutineProgress } from './utils/routineProgress'
import DashboardHome from './pages/DashboardHome'
import DailyCheckIn from './commponents/checkin/DailyCheckIn'
import Datenschutz from './pages/Datenschutz'
import Einloggen from './pages/Einloggen'
import PasswordReset from './pages/Passwortändern'
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

const passwordResetPath = '/passwort-zuruecksetzen'
const initialPasswordResetUrl = window.location.pathname.replace(/\/$/, '') === passwordResetPath
const initialRecoveryParameters = new URLSearchParams(window.location.search).has('code')
  || new URLSearchParams(window.location.search).has('token_hash')
  || new URLSearchParams(window.location.search).get('type') === 'recovery'
  || new URLSearchParams(window.location.hash.slice(1)).get('type') === 'recovery'
const authScreens = ['start', 'login', 'register', 'resetPassword', 'passwordRecovery', 'languageStyle', 'welcomeCharacter', 'quickStartSetup']
const persistentScreens = new Set(['dashboard', 'calendar', 'habits', 'progress', 'profile', 'profileSettings', 'freunde'])

function getThemeStorageKey(userId) {
  return userId ? `myflow-theme-${userId}` : 'myflow-theme-guest'
}

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

const defaultGuestSetup = {
  completed: false,
  display_name: 'Gast',
  gender: '',
  age: '',
  height_cm: '',
  weight_kg: '',
  activity_level: '',
  daily_context: '',
  language_style: 'german',
  communication_style: 'casual',
  theme: 'Hell',
}

function loadGuestSetup() {
  try {
    return { ...defaultGuestSetup, ...JSON.parse(localStorage.getItem('myflow-guest-setup') || '{}') }
  } catch {
    return defaultGuestSetup
  }
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
  const progress = getRoutineProgress(routine)
  const done = routine.done ?? progress >= 100

  return {
    ...routine,
    detail,
    progress,
    done,
    status: done ? 'Erledigt' : Number(routine.current ?? 0) > 0 ? 'Aktiv' : 'Offen',
  }
}

function getRoutineActivityDateKey(routine) {
  const value = routine?.progress_date ?? routine?.completed_at ?? routine?.updated_at
  if (!value) return ''

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value
  }

  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? '' : getLocalDateKey(date)
}

function shouldResetRoutineForToday(routine, todayKey = getLocalDateKey()) {
  const hasProgress = routine?.done === true
    || Number(routine?.current ?? 0) > 0
    || Number(routine?.progress ?? 0) > 0

  if (!hasProgress) return false

  const activityDateKey = getRoutineActivityDateKey(routine)
  return !activityDateKey || activityDateKey < todayKey
}

function resetRoutineForNewDay(routine) {
  return {
    ...routine,
    current: 0,
    progress: 0,
    done: false,
    status: 'Offen',
    detail: `0 / ${routine.target ?? 1} ${routine.unit || 'Mal'}`,
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
  const { user, isLoading: authLoading, isAuthenticated, isPasswordRecovery, signout } = useAuth()
  const { profile, setProfile, isLoading: profileLoading } = useProfile()
  const { addCheckin, removeCheckin } = useCheckins()
  const [screen, setScreen] = useState(() => initialPasswordResetUrl ? 'passwordRecovery' : 'dashboard')
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
  const [guestSetup, setGuestSetup] = useState(loadGuestSetup)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const accountMenuRef = useRef(null)
  const currentDayRef = useRef(getLocalDateKey())
  const resolvedProfileName = profile?.display_name || profileName

  function saveRoutinePointsBeforeReset(routine, fallbackDateKey = currentDayRef.current) {
    const progressPoints = getRoutineCredits(routine)
    if (progressPoints <= 0) return

    const date = getRoutineActivityDateKey(routine) || fallbackDateKey
    const completionBonus = routine.done === true ? 5 : 0
    addCheckin({
      routineId: routine.id,
      title: routine.title,
      date,
      points: progressPoints + completionBonus,
      source: 'routine-history',
    })
  }

  // Load user settings and routines from Supabase
  useEffect(() => {
    if (!isAuthenticated || !user) {
      queueMicrotask(() => {
        setLanguageStyle('german')
        setCommunicationStyle('casual')
        setProfileName('Gast')
        setAppTheme('Hell')
        setRoutineItems([])
        setCalendarNotes(loadCalendarNotes('guest'))
        setProfile(null)
        setAccountProfile(loadAccountProfile())
        const savedGuestSetup = loadGuestSetup()
        const savedGuestTheme = localStorage.getItem(getThemeStorageKey(null))
        setGuestSetup(savedGuestSetup)
        setLanguageStyle(savedGuestSetup.language_style || 'german')
        setCommunicationStyle(savedGuestSetup.communication_style || 'casual')
        setProfileName(savedGuestSetup.display_name || 'Gast')
        setAppTheme(savedGuestTheme || savedGuestSetup.theme || 'Hell')
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
        const savedTheme = localStorage.getItem(getThemeStorageKey(user.id))
        if (settingsRes.success && settingsRes.settings) {
          setLanguageStyle(settingsRes.settings.language_style || 'german')
          setCommunicationStyle(settingsRes.settings.communication_style || 'casual')
          setAppTheme(savedTheme || settingsRes.settings.theme || 'Hell')
        } else {
          setAppTheme(savedTheme || 'Hell')
        }

        // Load routines
        const routinesRes = await getRoutines(user.id)
        if (routinesRes.success) {
          const todayKey = getLocalDateKey()
          const visibleRoutines = routinesRes.routines.filter((routine) => !isRemovedRoutine(routine))
          const resetRoutines = visibleRoutines.filter((routine) => shouldResetRoutineForToday(routine, todayKey))
          resetRoutines.forEach((routine) => saveRoutinePointsBeforeReset(routine, getRoutineActivityDateKey(routine) || todayKey))
          setRoutineItems(visibleRoutines.map((routine) => (
            prepareRoutineData(shouldResetRoutineForToday(routine, todayKey) ? resetRoutineForNewDay(routine) : routine)
          )))

          resetRoutines.forEach((routine) => {
            updateRoutine(routine.id, user.id, { current: 0, progress: 0, done: false }).catch((err) => {
              console.error('Routine konnte nicht automatisch für den neuen Tag zurückgesetzt werden:', err)
            })
          })
        }
        if (!initialPasswordResetUrl) setScreen(loadLastScreen(user.id))
      } catch (err) {
        console.error('Fehler beim Laden der Benutzerdaten:', err)
        if (!initialPasswordResetUrl) setScreen(loadLastScreen(user.id))
      } finally {
        setIsLoadingData(false)
        setRoutinesLoaded(true)
      }
    }

    loadUserData()
  }, [isAuthenticated, setProfile, user])

  useEffect(() => {
    if (isAuthenticated && user?.id && persistentScreens.has(screen)) {
      localStorage.setItem(`myflow-last-screen-${user.id}`, screen)
    }
  }, [isAuthenticated, screen, user?.id])

  useEffect(() => {
    const resetRoutinesIfDayChanged = () => {
      const todayKey = getLocalDateKey()
      if (todayKey === currentDayRef.current) return

      const previousDayKey = currentDayRef.current
      currentDayRef.current = todayKey
      setRoutineItems((current) => {
        const routinesToReset = current.filter((routine) => shouldResetRoutineForToday(routine, todayKey))
        if (routinesToReset.length === 0) return current

        if (isAuthenticated && user) {
          routinesToReset.forEach((routine) => {
            saveRoutinePointsBeforeReset(routine, previousDayKey)
            updateRoutine(routine.id, user.id, { current: 0, progress: 0, done: false }).catch((err) => {
              console.error('Routine konnte nach Mitternacht nicht automatisch zurückgesetzt werden:', err)
            })
          })
        }

        return current.map((routine) => (
          shouldResetRoutineForToday(routine, todayKey)
            ? prepareRoutineData(resetRoutineForNewDay(routine))
            : routine
        ))
      })
    }

    resetRoutinesIfDayChanged()
    const intervalId = window.setInterval(resetRoutinesIfDayChanged, 60 * 1000)

    return () => window.clearInterval(intervalId)
  }, [isAuthenticated, user])

  useEffect(() => {
    function closeAccountMenu(event) {
      if (!accountMenuRef.current?.contains(event.target)) {
        setIsAccountMenuOpen(false)
      }
    }

    if (isAccountMenuOpen) {
      document.addEventListener('pointerdown', closeAccountMenu)
    }

    return () => document.removeEventListener('pointerdown', closeAccountMenu)
  }, [isAccountMenuOpen])

  const tone = languageStyles[languageStyle]
  const t = getAppTranslations(languageStyle, communicationStyle)
  const profileInitial = (resolvedProfileName || 'Gast').trim().charAt(0).toUpperCase() || 'G'
  const profileImage = localStorage.getItem('myflow-profile-image') || ''
  const preparedHabits = useMemo(
    () => routineItems.map((habit) => translateHabit(prepareRoutineData(habit), languageStyle)),
    [languageStyle, routineItems],
  )

  function handleCalendarNotesChange(nextNotes) {
    setCalendarNotes(nextNotes)
    if (isAuthenticated && user?.id) {
      saveCalendarNotes(user.id, nextNotes)
    } else {
      saveCalendarNotes('guest', nextNotes)
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
      progress: 0,
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
        const progress = calculateRoutineProgress(nextCurrent, habit.target)
        const updated = { ...habit, current: nextCurrent, progress, done: progress >= 100 }

        // If authenticated, save to Supabase
        if (isAuthenticated && user) {
          (async () => {
            const { updateRoutine } = await import('./services/routineService')
            updateRoutine(id, user.id, { current: nextCurrent, progress, done: updated.done }).catch((err) => {
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
        const progress = calculateRoutineProgress(nextCurrent, habit.target)
        const updated = { ...habit, current: nextCurrent, progress, done: false }

        if (habit.done || Number(habit.progress ?? 0) >= 100) {
          removeCheckin(habit.id)
        }

        // If authenticated, save to Supabase
        if (isAuthenticated && user) {
          (async () => {
            const { updateRoutine } = await import('./services/routineService')
            updateRoutine(id, user.id, { current: nextCurrent, progress, done: false }).catch((err) => {
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
    const nextProgress = nextDone ? 100 : getRoutineProgress({ ...selectedHabit, done: false, current: nextCurrent })
    if (nextDone) {
      addCheckin({ routineId: selectedHabit.id, title: selectedHabit.title })
    } else {
      removeCheckin(selectedHabit.id)
    }
    setRoutineItems((current) =>
      current.map((habit) =>
        habit.id === selectedHabit.id
          ? { ...habit, done: nextDone, current: nextCurrent, progress: nextProgress }
          : habit,
      ),
    )

    // If authenticated, save to Supabase
    if (isAuthenticated && user) {
      (async () => {
        const { updateRoutine } = await import('./services/routineService')
        updateRoutine(selectedHabit.id, user.id, { current: nextCurrent, progress: nextProgress, done: nextDone }).catch((err) => {
          console.error('Fehler beim Aktualisieren der Routine:', err)
        })
      })()
    }
  }

  function saveHabitDailyEntry(id, date, entry, routineUpdates = {}) {
    const currentHabit = routineItems.find((habit) => habit.id === id)
    if (!currentHabit) return

    const nextPeriod = {
      ...(currentHabit.period ?? {}),
      dailyEntries: {
        ...(currentHabit.period?.dailyEntries ?? {}),
        [date]: entry,
      },
    }
    const updates = { period: nextPeriod, ...routineUpdates }

    if (routineUpdates.done === true && currentHabit.done !== true) {
      addCheckin({ routineId: currentHabit.id, title: currentHabit.title })
    } else if (routineUpdates.done === false) {
      removeCheckin(id)
    }

    setRoutineItems((current) =>
      current.map((habit) =>
        habit.id === id
          ? { ...habit, ...updates }
          : habit,
      ),
    )

    if (isAuthenticated && user) {
      updateRoutine(id, user.id, updates).catch((err) => {
        console.error('Fehler beim Speichern des Routine-Eintrags:', err)
      })
    }
  }

  function setHabitMood(id, moods) {
    const currentHabit = routineItems.find((habit) => habit.id === id)
    if (!currentHabit) return

    const date = getLocalDateKey()
    const currentEntry = currentHabit.period?.dailyEntries?.[date] ?? {}
    const selectedMoods = Array.isArray(moods) ? moods : [moods].filter(Boolean)
    if (selectedMoods.length === 0) {
      removeCheckin(id)
    }
    saveHabitDailyEntry(id, date, { ...currentEntry, moods: selectedMoods }, {
      mood: selectedMoods.join(','),
      current: selectedMoods.length > 0 ? Number(currentHabit.target ?? 1) : 0,
      progress: selectedMoods.length > 0 ? 100 : 0,
      done: selectedMoods.length > 0,
    })
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
              progress: 100,
              done: true,
            }
          : habit,
      ),
    )

    // If authenticated, save to Supabase
    if (isAuthenticated && user) {
      (async () => {
        const { updateRoutine } = await import('./services/routineService')
        updateRoutine(id, user.id, { period: updatedPeriod, current: Number(currentHabit?.target ?? 1), progress: 100, done: true }).catch((err) => {
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
    localStorage.setItem(getThemeStorageKey(user?.id), theme)

    if (!isAuthenticated || !user) {
      setGuestSetup((currentSetup) => {
        const nextSetup = { ...currentSetup, theme }
        localStorage.setItem('myflow-guest-setup', JSON.stringify(nextSetup))
        return nextSetup
      })
      return
    }

    // If authenticated, save to Supabase
    ;(async () => {
      const { createUserSettings, updateUserSettings } = await import('./services/authService')
      const result = await updateUserSettings(user.id, { theme })
      if (!result.success || !result.settings) {
        const createResult = await createUserSettings(user.id, {
          language_style: languageStyle,
          communication_style: communicationStyle,
          theme,
        })
        if (!createResult.success) {
          console.error('Fehler beim Aktualisieren der Einstellungen:', createResult.error || result.error)
        }
      }
    })()
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

  function openAccountScreen(nextScreen) {
    setScreen(nextScreen)
    setIsAccountMenuOpen(false)
  }

  async function handleAccountLogout() {
    setIsAccountMenuOpen(false)
    try {
      await signout?.()
    } finally {
      setScreen('start')
    }
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

  function handleQuickStart() {
    setScreen(guestSetup.completed ? 'dashboard' : 'quickStartSetup')
  }

  async function handleGuestSetupComplete(answers) {
    const nextSetup = {
      ...defaultGuestSetup,
      ...answers,
      completed: true,
      onboarding_completed: true,
    }
    localStorage.setItem('myflow-guest-setup', JSON.stringify(nextSetup))
    localStorage.setItem(getThemeStorageKey(null), nextSetup.theme || 'Hell')
    setGuestSetup(nextSetup)
    setProfileName(nextSetup.display_name || 'Gast')
    setLanguageStyle(nextSetup.language_style || 'german')
    setCommunicationStyle(nextSetup.communication_style || 'casual')
    setAppTheme(nextSetup.theme || 'Hell')
    setScreen('dashboard')
  }

  // Erst die gespeicherte Supabase-Sitzung prüfen, bevor irgendeine Seite weiterleitet.
  if (authLoading) {
    return <LoadingScreen />
  }

  if (screen === 'passwordRecovery' || isPasswordRecovery) {
    return (
      <main className={`app ${appTheme === 'Dunkel' ? 'theme-dark' : 'theme-light'}`}>
        <PasswordReset
          hasRecoveryToken={initialRecoveryParameters || isPasswordRecovery}
          mode="recovery"
          onNavigate={setScreen}
          t={t}
        />
      </main>
    )
  }

  function setHabitPartial(selectedHabit) {
    const updates = { current: 0, progress: 50, done: false }
    setRoutineItems((current) => current.map((habit) => (
      habit.id === selectedHabit.id ? { ...habit, ...updates } : habit
    )))

    if (isAuthenticated && user) {
      updateRoutine(selectedHabit.id, user.id, updates).catch((err) => {
        console.error('Fehler beim Aktualisieren der Routine:', err)
      })
    }
  }

  function resetHabitProgress(selectedHabit) {
    const updates = { current: 0, progress: 0, done: false }
    removeCheckin(selectedHabit.id)
    setRoutineItems((current) => current.map((habit) => (
      habit.id === selectedHabit.id ? { ...habit, ...updates } : habit
    )))

    if (isAuthenticated && user) {
      updateRoutine(selectedHabit.id, user.id, updates).catch((err) => {
        console.error('Fehler beim Aktualisieren der Routine:', err)
      })
    }
  }

  if (!hasSeenOnboarding) {
    return (
      <main className={`app onboarding-app ${appTheme === 'Dunkel' ? 'theme-dark' : 'theme-light'} ${languageStyle === 'arabic' ? 'rtl' : ''}`} dir={languageStyle === 'arabic' ? 'rtl' : 'ltr'}>
        <Onboarding onFinish={handleOnboardingFinish} />
      </main>
    )
  }

  // Show login if not authenticated
  if (!isAuthenticated && (!guestSetup.completed || authScreens.includes(screen))) {
    const renderAuthScreen = () => {
      switch (screen) {
        case 'quickStartSetup':
          return (
            <StudentOnboarding
              initialAnswers={guestSetup}
              mode="quickStart"
              onBack={() => setScreen('start')}
              onComplete={handleGuestSetupComplete}
            />
          )
        case 'login':
          return <Einloggen onNavigate={setScreen} t={t} />
        case 'register':
          return <Registrieren onNavigate={setScreen} t={t} />
        case 'resetPassword':
          return <PasswordReset onNavigate={setScreen} t={t} />
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
          return <Startseite onNavigate={setScreen} onStart={handleQuickStart} t={t} />
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

  if (screen === 'profileOnboarding') {
    return (
      <main className={`app ${appTheme === 'Dunkel' ? 'theme-dark' : 'theme-light'} ${languageStyle === 'arabic' ? 'rtl' : ''}`} dir={languageStyle === 'arabic' ? 'rtl' : 'ltr'}>
        <StudentOnboarding
          initialAnswers={profile ?? {}}
          includePreferences={screen === 'profileOnboarding'}
          mode="profile"
          onBack={() => setScreen('profileSettings')}
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
            onResetProgress={resetHabitProgress}
            onSaveDailyEntry={saveHabitDailyEntry}
            onSetMood={setHabitMood}
            onSetPartial={setHabitPartial}
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
            onResetProgress={resetHabitProgress}
            onSaveDailyEntry={saveHabitDailyEntry}
            onSetMood={setHabitMood}
            onSetPartial={setHabitPartial}
            onUpdatePeriod={updateHabitPeriod}
            onRemove={removeHabit}
            onToggleDone={toggleHabitDone}
          />
        )
      case 'checkin':
        return (
          <DailyCheckIn
            accountProfile={accountProfile}
            calendarNotes={calendarNotes}
            habits={preparedHabits}
            onNavigate={setScreen}
            profileName={resolvedProfileName}
            user={user}
          />
        )
      case 'privacy':
        return <Datenschutz onNavigate={setScreen} />
      case 'calendar':
        return <Kalender notes={calendarNotes} onNotesChange={handleCalendarNotesChange} />
      case 'progress':
        return <Statistik habits={preparedHabits} languageStyle={languageStyle} onNavigate={setScreen} t={t} />
      case 'freunde':
        return <Freunde profileName={resolvedProfileName} user={user} />
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
            onResetProgress={resetHabitProgress}
            onSaveDailyEntry={saveHabitDailyEntry}
            onSetMood={setHabitMood}
            onSetPartial={setHabitPartial}
            onUpdatePeriod={updateHabitPeriod}
            onRemove={removeHabit}
            onToggleDone={toggleHabitDone}
          />
        )
    }
  }

  return (
    <main className={`app app-has-global-profile ${screen === 'profileSettings' ? 'profile-settings-active' : ''} ${appTheme === 'Dunkel' ? 'theme-dark' : 'theme-light'} ${languageStyle === 'arabic' ? 'rtl' : ''}`} dir={languageStyle === 'arabic' ? 'rtl' : 'ltr'}>
      <div className="global-account" ref={accountMenuRef}>
        <button
          className={`global-profile-button ${isAccountMenuOpen ? 'active' : ''}`}
          onClick={() => setIsAccountMenuOpen((open) => !open)}
          type="button"
          aria-expanded={isAccountMenuOpen}
          aria-label="Konto-Menü öffnen"
        >
          <span className="global-profile-avatar">
            {profileImage ? <img src={profileImage} alt="" /> : <img src={flowCharacter} alt="" />}
          </span>
          <span className="global-profile-initial" aria-hidden="true">{profileInitial}</span>
        </button>

        {isAccountMenuOpen && (
          <section className="account-menu" aria-label="Konto-Menü">
            <div className="account-menu-header">
              <span>{profileInitial}</span>
              <div>
                <strong>{resolvedProfileName || 'Gast'}</strong>
                <small>MyFlow Konto</small>
              </div>
            </div>
            <button type="button" onClick={() => openAccountScreen('profile')}>Profil ansehen</button>
            <button type="button" onClick={() => openAccountScreen('profileSettings')}>Einstellungen</button>
            <button type="button" onClick={() => openAccountScreen('profileSettings')}>Sprache</button>
            <button type="button" onClick={() => handleAppThemeChange(appTheme === 'Dunkel' ? 'Hell' : 'Dunkel')}>
              {appTheme === 'Dunkel' ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button className="account-menu-logout" type="button" onClick={handleAccountLogout}>Abmelden</button>
          </section>
        )}
      </div>
      <div className="app-screen-transition" key={screen}>
        {renderScreen()}
      </div>
      {!authScreens.includes(screen) && screen !== 'profileSettings' && screen !== 'privacy' && screen !== 'checkin' && screen !== 'calendar' && (
        <button
          className="floating-checkin-button"
          onClick={() => setScreen('checkin')}
          type="button"
          aria-label="Tages-Check-in oeffnen"
        >
          <img src={flowCharacter} alt="" />
          <span>KI Check-in</span>
        </button>
      )}
      {!authScreens.includes(screen) && screen !== 'profileSettings' && screen !== 'privacy' && (
        <Navbar
          activeScreen={screen}
          items={['dashboard', 'calendar', 'habits', 'progress', 'freunde'].map((id) => ({ id, label: t.nav[id] }))}
          onNavigate={setScreen}
        />
      )}
    </main>
  )
}

export default App
