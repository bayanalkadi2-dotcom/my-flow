import { describe, expect, it } from 'vitest'
import { calculateDailyRoutineProgress } from '../../utils/dailyRoutineProgress'

describe('daily routine progress', () => {
  const today = new Date(2026, 6, 3, 12)

  it('calculates completed routines instead of averaging stale progress fields', () => {
    const routines = [
      { id: 1, done: true, progress: 0 },
      { id: 2, done: true, progress: 0 },
      { id: 3, done: true, progress: 0 },
      { id: 4, done: false, progress: 100 },
    ]

    expect(calculateDailyRoutineProgress(routines, today)).toMatchObject({
      completed: 3,
      open: 1,
      total: 4,
      percent: 75,
    })
  })

  it('returns zero without dividing by zero', () => {
    expect(calculateDailyRoutineProgress([], today)).toMatchObject({
      completed: 0,
      open: 0,
      total: 0,
      percent: 0,
    })
  })

  it('includes partial routines in the daily percentage without counting them as completed', () => {
    const routines = [
      { id: 1, current: 1, target: 1, progress: 100, done: true },
      { id: 2, current: 1, target: 2, progress: 50, done: false },
    ]

    expect(calculateDailyRoutineProgress(routines, today)).toMatchObject({
      completed: 1,
      open: 1,
      total: 2,
      percent: 75,
    })
  })

  it('uses the local day for dated routines', () => {
    const routines = [
      { id: 1, done: true, date: '2026-07-03' },
      { id: 2, done: true, date: '2026-07-04' },
    ]

    expect(calculateDailyRoutineProgress(routines, today)).toMatchObject({
      completed: 1,
      total: 1,
      percent: 100,
    })
  })
})
