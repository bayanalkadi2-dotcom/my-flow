import { useEffect, useMemo, useState } from 'react'
import Navbar from './commponents/Navbar'
import { habits, languageStyles } from './data/appData'
import { getAppTranslations, translateHabit, translateUnit } from './i18n'
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

function defaultRoutineId(index) {
  return `default-routine-${index + 1}`
}

function getRoutineValues(habit, index) {
  if (habit.current !== undefined && habit.target !== undefined) {
    return {
      current: Number(habit.current) || 0,
      target: Number(habit.target) || 1,
      unit: habit.unit || 'Mal',
    }
  }

  const detailMatch = habit.detail?.match(/([\d.,]+)\s*\/\s*([\d.,]+)\s*(.*)/)

  if (detailMatch) {
    return {
      current: Number(detailMatch[1].replace(',', '.')) || 0,
      target: Number(detailMatch[2].replace(',', '.')) || 1,
      unit: detailMatch[3].trim() || 'Mal',
    }
  }

  return {
    current: Math.round((habit.progress ?? 0) / 10),
    target: 10,
    unit: 'Mal',
    id: index + 1,
  }
}

function prepareRoutine(habit, index) {
  const type = habit.type ??
    (habit.title === 'Stimmung tracken' ? 'mood' : habit.title === 'Periode' ? 'period' : undefined)
  const values = getRoutineValues(habit, index)

  if (habit.title === 'Wasser trinken' && values.target >= 8) {
    values.current = Math.min(Math.ceil(values.current / 2), 4)
    values.target = 4
    values.unit = 'Glaeser (500 ml)'
  }

  const progress = Math.min(Math.round((values.current / values.target) * 100), 100)
  const done = Boolean(habit.done) || progress >= 100
  const current = done ? values.target : values.current
  const normalizedProgress = done ? 100 : progress
  const period = habit.period ?? {}
  const periodSummary = [
    period.cycleLength ? `${period.cycleLength} Tage` : '',
    period.flowStrength ? `Stärke: ${period.flowStrength}/5` : '',
    period.painLevel ? `Schmerz: ${period.painLevel}/5` : '',
    period.phaseWellbeing ? `Wohlbefinden: ${period.phaseWellbeing}` : '',
  ].filter(Boolean).join(' · ')
  const detail = type === 'mood' && habit.mood
    ? `Heute: ${habit.mood}`
    : type === 'period'
      ? periodSummary || 'Zyklusdaten eintragen'
      : `${current} / ${values.target} ${values.unit}`

  return {
    ...habit,
    id: habit.id ?? index + 1,
    type,
    current,
    target: values.target,
    unit: values.unit,
    done,
    progress: normalizedProgress,
    detail,
    incrementLabel: habit.incrementLabel ?? `1 ${values.unit} geschafft`,
    status: done ? 'Erledigt' : values.current > 0 ? 'Aktiv' : 'Offen',
  }
}

function loadRoutines() {
  const deletedRoutineTitles = loadDeletedRoutineTitles()
  const defaultRoutines = habits.map((habit, index) =>
    prepareRoutine({ ...habit, id: habit.id ?? defaultRoutineId(index) }, index),
  )

  try {
    const savedRoutines = localStorage.getItem('myflow-routines')
    if (!savedRoutines) {
      return defaultRoutines
    }

    const parsedRoutines = JSON.parse(savedRoutines)
    const savedTitles = new Set(
      parsedRoutines.map((habit) => habit.title?.toLowerCase()),
    )
    const missingDefaultRoutines = defaultRoutines.filter(
      (habit) =>
        !savedTitles.has(habit.title.toLowerCase()) &&
        !deletedRoutineTitles.has(habit.title.toLowerCase()),
    )

    return [...parsedRoutines, ...missingDefaultRoutines].map((habit, index) =>
      prepareRoutine(habit, index),
    )
  } catch {
    return defaultRoutines
  }
}

function loadDeletedRoutineTitles() {
  try {
    return new Set(JSON.parse(localStorage.getItem('myflow-deleted-routines') ?? '[]'))
  } catch {
    return new Set()
  }
}

function App() {
  const [screen, setScreen] = useState('start')
  const [languageStyle, setLanguageStyle] = useState(() => localStorage.getItem('myflow-language') || 'german')
  const [communicationStyle, setCommunicationStyle] = useState(() => localStorage.getItem('myflow-communication-style') || 'casual')
  const [profileName, setProfileName] = useState('Nina')
  const [appTheme, setAppTheme] = useState('Hell')
  const [routineItems, setRoutineItems] = useState(loadRoutines)
  const [deletedRoutineTitles, setDeletedRoutineTitles] = useState(loadDeletedRoutineTitles)
  const tone = languageStyles[languageStyle]
  const t = getAppTranslations(languageStyle, communicationStyle)
  const preparedHabits = useMemo(
    () => routineItems.map((habit, index) => translateHabit(prepareRoutine(habit, index), languageStyle)),
    [languageStyle, routineItems],
  )

  useEffect(() => {
    localStorage.setItem('myflow-language', languageStyle)
  }, [languageStyle])

  useEffect(() => {
    localStorage.setItem('myflow-communication-style', communicationStyle)
  }, [communicationStyle])

  useEffect(() => {
    localStorage.setItem('myflow-routines', JSON.stringify(preparedHabits))
  }, [preparedHabits])

  useEffect(() => {
    localStorage.setItem(
      'myflow-deleted-routines',
      JSON.stringify([...deletedRoutineTitles]),
    )
  }, [deletedRoutineTitles])

  function addHabit(newHabit) {
    setDeletedRoutineTitles((currentTitles) => {
      const nextTitles = new Set(currentTitles)
      nextTitles.delete(newHabit.title.toLowerCase())
      return nextTitles
    })

    setRoutineItems((currentHabits) => [
      ...currentHabits,
      {
        id: Date.now(),
        title: newHabit.title,
        icon: newHabit.icon,
        category: newHabit.category,
        type: newHabit.type,
        period: newHabit.type === 'period' ? {} : undefined,
        current: 0,
        target: newHabit.target,
        unit: newHabit.unit,
        incrementLabel: newHabit.incrementLabel,
        done: false,
      },
    ])
  }

  function removeHabit(selectedHabit) {
    setDeletedRoutineTitles((currentTitles) => {
      const nextTitles = new Set(currentTitles)
      nextTitles.add(selectedHabit.title.toLowerCase())
      return nextTitles
    })

    setRoutineItems((currentHabits) =>
      currentHabits.filter((habit) => habit.id !== selectedHabit.id),
    )
  }

  function incrementHabit(id) {
    setRoutineItems((currentHabits) =>
      currentHabits.map((habit) => {
        if (habit.id !== id) {
          return habit
        }

        const current = Number(habit.current ?? 0)
        const target = Number(habit.target ?? 1)
        const nextCurrent = Math.min(current + 1, target)

        return {
          ...habit,
          current: nextCurrent,
          done: nextCurrent >= target,
        }
      }),
    )
  }

  function selectLanguage(nextLanguage) {
    setLanguageStyle(nextLanguage)
  }

  function setHabitMood(id, mood) {
    setRoutineItems((currentHabits) =>
      currentHabits.map((habit) =>
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
  }

  function updateHabitPeriod(id, changes) {
    setRoutineItems((currentHabits) =>
      currentHabits.map((habit) =>
        habit.id === id
          ? {
              ...habit,
              period: {
                ...(habit.period ?? {}),
                ...changes,
              },
              current: Number(habit.target ?? 1),
              done: true,
            }
          : habit,
      ),
    )
  }

  function decrementHabit(id) {
    setRoutineItems((currentHabits) =>
      currentHabits.map((habit) => {
        if (habit.id !== id) {
          return habit
        }

        const nextCurrent = Math.max(Number(habit.current ?? 0) - 1, 0)

        return {
          ...habit,
          current: nextCurrent,
          done: false,
        }
      }),
    )
  }

  function toggleHabitDone(selectedHabit) {
    const nextDone = !selectedHabit.done

    setRoutineItems((currentHabits) =>
      currentHabits.map((habit) =>
        habit.id === selectedHabit.id
          ? {
              ...habit,
              done: nextDone,
              current: nextDone ? selectedHabit.target : selectedHabit.current,
            }
          : habit,
      ),
    )
  }

  function renderScreen() {
    switch (screen) {
      case 'login':
        return <Einloggen onNavigate={setScreen} t={t} />
      case 'register':
        return <Registrieren onNavigate={setScreen} t={t} />
      case 'resetPassword':
        return <PasswortAendern onNavigate={setScreen} t={t} />
      case 'languageStyle':
        return (
          <Sprachstil
            communicationStyle={communicationStyle}
            languageStyle={languageStyle}
            tone={tone}
            onSelectCommunicationStyle={setCommunicationStyle}
            onSelectStyle={selectLanguage}
            onNavigate={setScreen}
            t={t}
          />
        )
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
      case 'progress':
        return <Statistik habits={preparedHabits} languageStyle={languageStyle} t={t} />
      case 'profile':
        return (
          <Profil
            appTheme={appTheme}
            languageStyle={languageStyle}
            communicationStyle={communicationStyle}
            profileName={profileName}
            tone={tone}
            t={t}
            onAppThemeChange={setAppTheme}
            onNavigate={setScreen}
            onProfileNameChange={setProfileName}
            onCommunicationStyleChange={setCommunicationStyle}
            onSelectStyle={selectLanguage}
          />
        )
      case 'freunde':
        return <Freunde habits={preparedHabits} t={t} />

default:
  return <Startseite onNavigate={setScreen} t={t} />
    }
  }

  return (
    <main className={`app ${appTheme === 'Dunkel' ? 'theme-dark' : 'theme-light'}`}>
      {renderScreen()}

      {!authScreens.includes(screen) && (
        <Navbar activeScreen={screen} items={Object.entries(t.nav).map(([id, label]) => ({ id, label }))} onNavigate={setScreen} />
      )}
    </main>
  )
}

export default App
