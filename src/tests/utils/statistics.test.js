import { describe, expect, it, vi } from 'vitest'
import { calculateFlowtreeStats } from '../../utils/flowtreeStats'
import {
  calculateChallengePoints,
  calculateGrowthPoints,
  getFlowTree,
  getLevel,
} from '../../utils/progressLevels'

describe('statistics helpers', () => {
  it('calculates challenge and growth points from completed routines and check-ins', () => {
    const routines = [{ progress: 100, done: true }, { done: true }, { progress: 40 }]
    const checkIns = [{ id: 1 }, { id: 2 }]

    expect(calculateChallengePoints(routines)).toBe(24)
    expect(calculateGrowthPoints({ routines, checkIns })).toBe(34)
  })

  it('calculates level and flow tree progress', () => {
    expect(getLevel(500).current).toBe('Silber')
    expect(getFlowTree(850, 'oak')).toMatchObject({ stage: 'Eiche', count: 1 })
  })

  it('summarizes flowtree stats for the current week', () => {
    vi.setSystemTime(new Date('2026-07-02T12:00:00.000Z'))

    const stats = calculateFlowtreeStats({
      routines: [{ progress: 100, done: true, updated_at: '2026-07-02T08:00:00.000Z' }],
      checkIns: [{ created_at: '2026-07-01T08:00:00.000Z' }],
    })

    expect(stats.completedRoutines).toBe(1)
    expect(stats.checkIns).toBe(1)
    expect(stats.activeDays).toHaveLength(2)
    expect(stats.weekProgress).toBeGreaterThan(0)

    vi.useRealTimers()
  })
})
