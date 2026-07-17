import { describe, expect, it } from 'vitest'
import {
  canDisplayRoutineForGender,
  filterRoutinesForGender,
} from '../../utils/routineVisibility'

const periodRoutine = { title: 'Periode', type: 'period' }
const waterRoutine = { title: 'Wasser trinken' }

describe('routine visibility by saved gender', () => {
  it('shows the period routine for the stored female value', () => {
    expect(canDisplayRoutineForGender(periodRoutine, 'female')).toBe(true)
  })

  it.each(['male', 'diverse', 'none', null, undefined])(
    'hides the period routine for %s',
    (gender) => {
      expect(canDisplayRoutineForGender(periodRoutine, gender)).toBe(false)
    },
  )

  it('does not change other physical-health routines', () => {
    expect(canDisplayRoutineForGender(waterRoutine, undefined)).toBe(true)
  })

  it('reacts to a change from female to another value without deleting data', () => {
    const routines = [periodRoutine, waterRoutine]

    expect(filterRoutinesForGender(routines, 'female')).toContain(periodRoutine)
    expect(filterRoutinesForGender(routines, 'male')).not.toContain(periodRoutine)
    expect(routines).toContain(periodRoutine)
  })

  it('shows the same stored period routine again after changing to female', () => {
    const routines = [periodRoutine, waterRoutine]

    expect(filterRoutinesForGender(routines, 'diverse')).not.toContain(periodRoutine)
    expect(filterRoutinesForGender(routines, 'female')).toContain(periodRoutine)
  })
})
