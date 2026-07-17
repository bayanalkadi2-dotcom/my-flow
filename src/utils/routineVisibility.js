const FEMALE_GENDER = 'female'

export function isPeriodRoutine(routine) {
  if (!routine) return false

  return (
    routine.type === 'period' ||
    String(routine.title ?? '').trim().toLowerCase() === 'periode'
  )
}

export function canDisplayRoutineForGender(routine, gender) {
  return !isPeriodRoutine(routine) || gender === FEMALE_GENDER
}

export function filterRoutinesForGender(routines = [], gender) {
  return routines.filter((routine) => canDisplayRoutineForGender(routine, gender))
}
