import { getFlowtreeProgress } from '../data/flowtreeLevels'
import { calculateGrowthPoints } from './progressLevels'

const dayLabels = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

function getRoutineProgress(routine) {
  if (routine.done) return 100
  return Math.min(Math.max(Math.round(Number(routine.progress) || 0), 0), 100)
}

function toDateKey(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(date, amount) {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + amount)
  return copy
}

function getStartOfWeek(date) {
  const copy = new Date(date)
  const day = copy.getDay() || 7
  copy.setHours(0, 0, 0, 0)
  copy.setDate(copy.getDate() - day + 1)
  return copy
}

function getActivityDates(routines, checkIns) {
  const dates = new Set()

  checkIns.forEach((checkIn) => {
    const dateKey = toDateKey(checkIn.created_at)
    if (dateKey) dates.add(dateKey)
  })

  routines.forEach((routine) => {
    if (getRoutineProgress(routine) < 100) return
    const dateKey = toDateKey(routine.updated_at || routine.created_at)
    if (dateKey) dates.add(dateKey)
  })

  return dates
}

function getCurrentStreak(activityDates) {
  if (activityDates.size === 0) return 0

  let streak = 0
  let cursor = new Date()

  while (activityDates.has(toDateKey(cursor))) {
    streak += 1
    cursor = addDays(cursor, -1)
  }

  return streak
}

function getWeekOverview(activityDates) {
  const start = getStartOfWeek(new Date())

  return dayLabels.map((label, index) => {
    const date = addDays(start, index)
    const dateKey = toDateKey(date)

    return {
      label,
      dateKey,
      active: activityDates.has(dateKey),
    }
  })
}

export function calculateFlowtreeStats({ routines = [], checkIns = [] } = {}) {
  const completedRoutines = routines.filter((routine) => getRoutineProgress(routine) >= 100).length
  const routineProgressTotal = routines.reduce((sum, routine) => sum + getRoutineProgress(routine), 0)
  const dailyGoalProgress = routines.length > 0 ? Math.round(routineProgressTotal / routines.length) : 0
  const activityDates = getActivityDates(routines, checkIns)
  const week = getWeekOverview(activityDates)
  const activeDays = week.filter((day) => day.active)
  const growthPoints = calculateGrowthPoints({ routines, checkIns })
  const flowtree = getFlowtreeProgress(growthPoints)

  return {
    growthPoints,
    checkIns: checkIns.length,
    completedRoutines,
    dailyGoalProgress,
    dailyGoalTotal: routines.length,
    dailyGoalCompleted: completedRoutines,
    streak: getCurrentStreak(activityDates),
    activeDays,
    week,
    weekProgress: Math.round((activeDays.length / week.length) * 100),
    flowtree,
  }
}
