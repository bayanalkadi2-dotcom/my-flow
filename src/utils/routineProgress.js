export const FULL_ROUTINE_CREDITS = 10

function clampPercent(value) {
  return Math.min(Math.max(Math.round(Number(value) || 0), 0), 100)
}

export function calculateRoutineProgress(current, target) {
  const numericCurrent = Number(current)
  const numericTarget = Number(target)

  if (!Number.isFinite(numericCurrent) || !Number.isFinite(numericTarget) || numericTarget <= 0) {
    return 0
  }

  return clampPercent((numericCurrent / numericTarget) * 100)
}

export function getRoutineProgress(routine = {}) {
  if (routine.done === true) return 100

  const savedProgress = clampPercent(routine.progress)
  const current = Number(routine.current)
  const target = Number(routine.target)

  if (Number.isFinite(current) && Number.isFinite(target) && target > 0) {
    // A saved partial status is used for routines without countable activities.
    if (current <= 0 && savedProgress > 0) return savedProgress
    return calculateRoutineProgress(current, target)
  }

  // A stale 100% field without the completed flag must not count as completed work.
  if (savedProgress >= 100) return 0
  return savedProgress
}

export function isRoutineCompleted(routine = {}) {
  return routine.done === true && getRoutineProgress(routine) >= 100
}

export function getRoutineCredits(routine = {}, fullCredits = FULL_ROUTINE_CREDITS) {
  return Math.round((Math.max(Number(fullCredits) || 0, 0) * getRoutineProgress(routine)) / 100)
}
