import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  getUser: vi.fn(),
}))

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: { getUser: mocks.getUser },
    from: mocks.from,
  },
}))

const { getSleepEntries, saveSleepEntry } = await import('../../services/sleepService')

describe('sleepService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
  })

  it('loads only the authenticated users sleep entries', async () => {
    const entries = [{ id: 'sleep-1', sleep_date: '2026-07-08', duration_minutes: 450 }]
    const order = vi.fn().mockResolvedValue({ data: entries, error: null })
    const eq = vi.fn(() => ({ order }))
    const select = vi.fn(() => ({ eq }))
    mocks.from.mockReturnValue({ select })

    await expect(getSleepEntries()).resolves.toEqual(entries)
    expect(mocks.from).toHaveBeenCalledWith('sleep_entries')
    expect(eq).toHaveBeenCalledWith('user_id', 'user-1')
  })

  it('upserts the calculated sleep duration for the current day', async () => {
    const savedEntry = { id: 'sleep-1', sleep_date: '2026-07-08', duration_minutes: 450 }
    const single = vi.fn().mockResolvedValue({ data: savedEntry, error: null })
    const select = vi.fn(() => ({ single }))
    const upsert = vi.fn(() => ({ select }))
    mocks.from.mockReturnValue({ upsert })

    await expect(saveSleepEntry({
      sleepDate: '2026-07-08',
      bedtime: '23:00',
      wakeTime: '06:30',
      durationMinutes: 450,
    })).resolves.toEqual(savedEntry)

    expect(upsert).toHaveBeenCalledWith({
      user_id: 'user-1',
      sleep_date: '2026-07-08',
      bedtime: '23:00',
      wake_time: '06:30',
      duration_minutes: 450,
    }, { onConflict: 'user_id,sleep_date' })
  })

  it('logs a clear migration hint when the sleep table is missing', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const order = vi.fn().mockResolvedValue({
      data: null,
      error: { code: 'PGRST205', message: "Could not find the table 'public.sleep_entries'" },
    })
    const eq = vi.fn(() => ({ order }))
    const select = vi.fn(() => ({ eq }))
    mocks.from.mockReturnValue({ select })

    await expect(getSleepEntries()).rejects.toMatchObject({
      code: 'PGRST205',
      message: "Could not find the table 'public.sleep_entries'",
    })
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining('supabase/sleep_entries.sql'),
      expect.objectContaining({ code: 'PGRST205' }),
    )
    consoleError.mockRestore()
  })
})
