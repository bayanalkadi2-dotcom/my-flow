import { useEffect, useMemo, useState } from 'react'
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

function prepareHabit(habit) {
  const current = Number(habit.current ?? 0)
  const target = Number(habit.target ?? 1)
  const unit = habit.unit ?? 'Mal'
  const progress = Math.min(Math.round((current / target) * 100), 100)

  return {
    ...habit,
    current,
    target,
    unit,
    progress,
    detail: `${current} / ${target} ${unit}`,
    incrementLabel: habit.incrementLabel ?? `1 ${unit} geschafft`,
    status: habit.done || progress >= 100 ? 'Erledigt' : current > 0 ? 'Aktiv' : 'Offen',
  }
}

function loadSavedRoutines() {
  try {
    const savedRoutines = localStorage.getItem('myflow-routines')
    return savedRoutines ? JSON.parse(savedRoutines) : habits
  } catch {
    return habits
  }
}

function App() {
  const [screen, setScreen] = useState('start')
  const [languageStyle, setLanguageStyle] = useState('casual')
  const [routineItems, setRoutineItems] = useState(loadSavedRoutines)
  const tone = languageStyles[languageStyle]
  const preparedHabits = useMemo(
    () => routineItems.map((habit) => prepareHabit(habit)),
    [routineItems],
  )

  useEffect(() => {
    localStorage.setItem('myflow-routines', JSON.stringify(routineItems))
  }, [routineItems])

  function updateHabit(id, changes) {
    setRoutineItems((currentHabits) =>
      currentHabits.map((habit) =>
        habit.id === id ? { ...habit, ...changes } : habit,
      ),
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

  function decrementHabit(id) {
    setRoutineItems((currentHabits) =>
      currentHabits.map((habit) => {
        if (habit.id !== id) {
          return habit
        }

        const current = Number(habit.current ?? 0)
        const nextCurrent = Math.max(current - 1, 0)

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

    updateHabit(selectedHabit.id, {
      done: nextDone,
      current: nextDone ? selectedHabit.target : selectedHabit.current,
    })
  }

  function addHabit(newHabit) {
    setRoutineItems((currentHabits) => [
      ...currentHabits,
      {
        id: Date.now(),
        icon: '◎',
        current: 0,
        done: false,
        points: 10,
        incrementLabel: `1 ${newHabit.unit} geschafft`,
        ...newHabit,
      },
    ])
  }

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
        return (
          <DashboardHome
            habits={preparedHabits}
            tone={tone}
            onIncrement={incrementHabit}
            onDecrement={decrementHabit}
            onToggleDone={toggleHabitDone}
          />
        )
      case 'habits':
        return (
          <Routinen
            habits={preparedHabits}
            onAddHabit={addHabit}
            onIncrement={incrementHabit}
            onDecrement={decrementHabit}
            onToggleDone={toggleHabitDone}
          />
        )
      case 'progress':
        return <Statistik />
      case 'profile':
        return <Profil tone={tone} onNavigate={setScreen} />
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
