import { getLocalDateKey } from './checkins.js'

function getScheduledDateKey(routine) {
  const value = routine?.scheduled_date ?? routine?.due_date ?? routine?.date
  if (!value) return ''

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value
  }

  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? '' : getLocalDateKey(date)
}

export function getTodayRoutines(routines = [], today = new Date()) {
  const todayKey = getLocalDateKey(today)

  return routines.filter((routine) => {
    if (!routine || routine.deleted_at) return false

    const scheduledDateKey = getScheduledDateKey(routine)
    if (!scheduledDateKey) return true

    return routine.repeat === 'daily'
      ? scheduledDateKey <= todayKey
      : scheduledDateKey === todayKey
  })
}

export function calculateDailyRoutineProgress(routines = [], today = new Date()) {
  const todayRoutines = getTodayRoutines(routines, today)
  const completed = todayRoutines.filter((routine) => routine.done === true).length
  const total = todayRoutines.length

  return {
    routines: todayRoutines,
    completed,
    open: total - completed,
    total,
    percent: total > 0 ? Math.round((completed / total) * 100) : 0,
  }
}
