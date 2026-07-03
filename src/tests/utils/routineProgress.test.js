import { describe, expect, it } from 'vitest'
import {
  calculateRoutineProgress,
  getRoutineCredits,
  getRoutineProgress,
  isRoutineCompleted,
} from '../../utils/routineProgress'

describe('routine progress and credits', () => {
  it.each([
    [0, 4, 0, 0],
    [1, 4, 25, 3],
    [2, 4, 50, 5],
    [3, 4, 75, 8],
    [4, 4, 100, 10],
  ])('calculates %s of %s activities as %s percent and %s credits', (current, target, percent, credits) => {
    const routine = { current, target, progress: percent, done: percent === 100 }
    expect(calculateRoutineProgress(current, target)).toBe(percent)
    expect(getRoutineProgress(routine)).toBe(percent)
    expect(getRoutineCredits(routine)).toBe(credits)
  })

  it('gives a saved partial status without activities 50 percent', () => {
    const routine = { current: 0, target: 1, progress: 50, done: false }
    expect(getRoutineProgress(routine)).toBe(50)
    expect(getRoutineCredits(routine)).toBe(5)
    expect(isRoutineCompleted(routine)).toBe(false)
  })

  it('reduces credits with reduced progress and only completes at 100 percent', () => {
    expect(getRoutineCredits({ current: 3, target: 4, done: false })).toBe(8)
    expect(getRoutineCredits({ current: 1, target: 4, done: false })).toBe(3)
    expect(isRoutineCompleted({ current: 4, target: 4, done: false })).toBe(false)
    expect(isRoutineCompleted({ current: 4, target: 4, done: true })).toBe(true)
  })

  it('derives the same credit balance after reload instead of adding it again', () => {
    const savedRoutine = { current: 2, target: 4, progress: 50, done: false }
    const beforeReload = getRoutineCredits(savedRoutine)
    const afterReload = getRoutineCredits({ ...savedRoutine })

    expect(beforeReload).toBe(5)
    expect(afterReload).toBe(beforeReload)
    expect(getRoutineCredits({ ...savedRoutine, current: 4, progress: 100, done: true })).toBe(10)
  })
})
