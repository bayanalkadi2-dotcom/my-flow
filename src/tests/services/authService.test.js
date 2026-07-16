import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  getUser: vi.fn(),
  updateUser: vi.fn(),
}))

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: mocks.from,
    auth: {
      getUser: mocks.getUser,
      updateUser: mocks.updateUser,
    },
  },
}))

const {
  createProfile,
  createUserSettings,
  getProfile,
  getUserSettings,
  normalizeOnboardingProfile,
  saveOnboardingProfile,
  updateProfile,
  updateUserSettings,
  upsertProfile,
} = await import('../../services/authService')

function mockInsertSelect(result) {
  const select = vi.fn().mockResolvedValue(result)
  const insert = vi.fn(() => ({ select }))
  mocks.from.mockReturnValue({ insert })
  return { insert, select }
}

function mockUpsertSingle(result) {
  const single = vi.fn().mockResolvedValue(result)
  const select = vi.fn(() => ({ single }))
  const upsert = vi.fn(() => ({ select }))
  mocks.from.mockReturnValue({ upsert })
  return { upsert, select, single }
}

function mockSelectSingle(result) {
  const single = vi.fn().mockResolvedValue(result)
  const eq = vi.fn(() => ({ single }))
  const select = vi.fn(() => ({ eq }))
  mocks.from.mockReturnValue({ select })
  return { select, eq, single }
}

function mockUpdateSelect(result) {
  const select = vi.fn().mockResolvedValue(result)
  const eq = vi.fn(() => ({ select }))
  const update = vi.fn(() => ({ eq }))
  mocks.from.mockReturnValue({ update })
  return { update, eq, select }
}

describe('authService Supabase access', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.updateUser.mockResolvedValue({ data: {}, error: null })
  })

  it('normalizes onboarding data safely', () => {
    expect(normalizeOnboardingProfile({
      student_status: 'university',
      main_challenges: 'stress',
      support_goals: ['focus'],
    })).toEqual({
      gender: null,
      age: null,
      height_cm: null,
      weight_kg: null,
      student_status: 'university',
      age_group: null,
      education_level: null,
      daily_context: null,
      main_challenges: [],
      support_goals: ['focus'],
      onboarding_completed: true,
    })
  })

  it('createProfile inserts a profile without real database access', async () => {
    const profile = { id: 'user-1', email: 'test@example.com', display_name: 'Test' }
    const { insert } = mockInsertSelect({ data: [profile], error: null })

    await expect(createProfile('user-1', 'test@example.com', 'Test')).resolves.toEqual({
      success: true,
      profile,
    })
    expect(mocks.from).toHaveBeenCalledWith('profiles')
    expect(insert).toHaveBeenCalledWith([profile])
  })

  it('upsertProfile stores onboarding data', async () => {
    const profile = { id: 'user-1', onboarding_completed: true }
    const { upsert } = mockUpsertSingle({ data: profile, error: null })

    await expect(upsertProfile('user-1', 'test@example.com', 'Test', {
      student_status: 'school',
      age_group: '16_18',
      age: '21',
    })).resolves.toEqual({ success: true, profile })
    expect(upsert.mock.calls[0][0]).toMatchObject({
      id: 'user-1',
      student_status: 'school',
      age_group: '16_18',
      age: 21,
    })
  })

  it('rejects non-integer or unrealistic profile ages', () => {
    expect(() => normalizeOnboardingProfile({ age: '20.5' })).toThrow('gültiges Alter')
    expect(() => normalizeOnboardingProfile({ age: '-1' })).toThrow('gültiges Alter')
    expect(() => normalizeOnboardingProfile({ age: '121' })).toThrow('gültiges Alter')
  })

  it('saveOnboardingProfile uses the authenticated user', async () => {
    const profile = { id: 'user-1', display_name: 'Flow' }
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-1', email: 'flow@example.com' } }, error: null })
    const { upsert } = mockUpsertSingle({ data: profile, error: null })

    const result = await saveOnboardingProfile({ student_status: 'training' }, 'Flow')
    expect(result).toEqual({
      success: true,
      profile: expect.objectContaining({
        ...profile,
        student_status: 'training',
        onboarding_completed: true,
      }),
    })
    expect(upsert.mock.calls[0][0]).toMatchObject({
      id: 'user-1',
      email: 'flow@example.com',
      student_status: 'training',
      display_name: 'Flow',
      onboarding_completed: true,
    })
  })

  it('getProfile reads a profile by id', async () => {
    const profile = { id: 'user-1' }
    const { eq } = mockSelectSingle({ data: profile, error: null })

    await expect(getProfile('user-1')).resolves.toEqual({ success: true, profile })
    expect(eq).toHaveBeenCalledWith('id', 'user-1')
  })

  it('updateProfile updates profile rows by id', async () => {
    const profile = { id: 'user-1', display_name: 'Neu' }
    const { update, eq } = mockUpdateSelect({ data: [profile], error: null })

    await expect(updateProfile('user-1', { display_name: 'Neu' })).resolves.toEqual({
      success: true,
      profile,
    })
    expect(update).toHaveBeenCalledWith({ display_name: 'Neu' })
    expect(eq).toHaveBeenCalledWith('id', 'user-1')
  })

  it('getUserSettings reads settings by user id', async () => {
    const settings = { user_id: 'user-1', theme: 'dark' }
    const { eq } = mockSelectSingle({ data: settings, error: null })

    await expect(getUserSettings('user-1')).resolves.toEqual({ success: true, settings })
    expect(mocks.from).toHaveBeenCalledWith('user_settings')
    expect(eq).toHaveBeenCalledWith('user_id', 'user-1')
  })

  it('updateUserSettings updates settings by user id', async () => {
    const settings = { user_id: 'user-1', theme: 'dark' }
    const { update, eq } = mockUpdateSelect({ data: [settings], error: null })

    await expect(updateUserSettings('user-1', { theme: 'dark' })).resolves.toEqual({
      success: true,
      settings,
    })
    expect(update).toHaveBeenCalledWith({ theme: 'dark' })
    expect(eq).toHaveBeenCalledWith('user_id', 'user-1')
  })

  it('createUserSettings inserts settings for a user', async () => {
    const settings = { user_id: 'user-1', theme: 'light' }
    const { insert } = mockInsertSelect({ data: [settings], error: null })

    await expect(createUserSettings('user-1', { theme: 'light' })).resolves.toEqual({
      success: true,
      settings,
    })
    expect(insert).toHaveBeenCalledWith([{ user_id: 'user-1', theme: 'light' }])
  })
})
