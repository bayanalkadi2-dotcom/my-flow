import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  rpc: vi.fn(),
}))

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: mocks.from,
    rpc: mocks.rpc,
  },
}))

const { createRoutine, deleteRoutine, getRoutines, setRoutineCompletion } = await import('../../services/routineService')

describe('routineService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads active routines for a user', async () => {
    const routines = [{ id: 'routine-1', title: 'Wasser' }]
    const order = vi.fn().mockResolvedValue({ data: routines, error: null })
    const is = vi.fn(() => ({ order }))
    const eq = vi.fn(() => ({ is }))
    const select = vi.fn(() => ({ eq }))
    mocks.from.mockReturnValue({ select })

    await expect(getRoutines('user-1')).resolves.toEqual({ success: true, routines })
    expect(mocks.from).toHaveBeenCalledWith('routines')
    expect(eq).toHaveBeenCalledWith('user_id', 'user-1')
    expect(is).toHaveBeenCalledWith('deleted_at', null)
  })

  it('creates a routine without real database access', async () => {
    const routine = { id: 'routine-1', user_id: 'user-1', title: 'Lernen' }
    const select = vi.fn().mockResolvedValue({ data: [routine], error: null })
    const insert = vi.fn(() => ({ select }))
    mocks.from.mockReturnValue({ insert })

    await expect(createRoutine('user-1', { title: 'Lernen' })).resolves.toEqual({
      success: true,
      routine,
    })
    expect(insert).toHaveBeenCalledWith([{ user_id: 'user-1', title: 'Lernen' }])
  })

  it('soft deletes only routines owned by the user', async () => {
    const single = vi.fn().mockResolvedValue({ data: { user_id: 'user-1' }, error: null })
    const firstEq = vi.fn(() => ({ single }))
    const select = vi.fn(() => ({ eq: firstEq }))
    const secondEq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn(() => ({ eq: secondEq }))
    mocks.from.mockReturnValue({ select, update })

    await expect(deleteRoutine('routine-1', 'user-1')).resolves.toEqual({ success: true })
    expect(update).toHaveBeenCalledWith({ deleted_at: expect.any(String) })
    expect(secondEq).toHaveBeenCalledWith('id', 'routine-1')
  })

  it('uses the atomic completion RPC with a local calendar date and ten points', async () => {
    mocks.rpc.mockResolvedValue({ data: { completed: true, growth_points: 10 }, error: null })

    await expect(setRoutineCompletion('routine-1', '2026-07-17', true, 10)).resolves.toEqual({
      completed: true,
      growth_points: 10,
    })
    expect(mocks.rpc).toHaveBeenCalledWith('set_routine_completion', {
      p_routine_id: 'routine-1',
      p_progress_date: '2026-07-17',
      p_completed: true,
      p_points: 10,
      p_period: null,
    })
  })

  it('uses the same atomic RPC to remove completion and its points', async () => {
    mocks.rpc.mockResolvedValue({ data: { completed: false, growth_points: 0 }, error: null })
    await expect(setRoutineCompletion('routine-1', '2026-07-17', false, 10)).resolves.toMatchObject({
      completed: false,
      growth_points: 0,
    })
  })
})
