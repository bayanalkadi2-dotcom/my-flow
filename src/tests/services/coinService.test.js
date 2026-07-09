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

const {
  awardFlowCoinEvents,
  getFlowCoinProfile,
  redeemSupportedTree,
  syncFlowtreeProgress,
} = await import('../../services/coinService')

function mockProfileSelect(profile) {
  const single = vi.fn().mockResolvedValue({ data: profile, error: null })
  const eq = vi.fn(() => ({ single }))
  const select = vi.fn(() => ({ eq }))
  return { eq, select, single }
}

function mockProfileUpdate(profile) {
  const single = vi.fn().mockResolvedValue({ data: profile, error: null })
  const select = vi.fn(() => ({ single }))
  const eq = vi.fn(() => ({ select }))
  const update = vi.fn(() => ({ eq }))
  return { eq, select, single, update }
}

function mockEventInsert(result) {
  const single = vi.fn().mockResolvedValue(result)
  const select = vi.fn(() => ({ single }))
  const insert = vi.fn(() => ({ select }))
  return { insert, select, single }
}

function mockPlainInsert(result) {
  const insert = vi.fn().mockResolvedValue(result)
  return { insert }
}

describe('coinService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
  })

  it('loads FlowCoins from the authenticated profile', async () => {
    const profileSelect = mockProfileSelect({
      growth_points: 120,
      flowcoins: 250,
      current_level: 'seedling',
      planted_trees: 1,
      total_redeemed_flowcoins: 1000,
    })
    mocks.from.mockReturnValue(profileSelect)

    await expect(getFlowCoinProfile()).resolves.toEqual({
      growth_points: 120,
      flowcoins: 250,
      current_level: 'seedling',
      planted_trees: 1,
      total_redeemed_flowcoins: 1000,
    })
    expect(mocks.from).toHaveBeenCalledWith('profiles')
    expect(profileSelect.eq).toHaveBeenCalledWith('id', 'user-1')
  })

  it('adds coins only for newly inserted reward events', async () => {
    const eventInsert = mockEventInsert({ data: { event_key: 'daily_checkin_completed:checkin-1', coins: 10 }, error: null })
    const profileSelect = mockProfileSelect({ flowcoins: 10, planted_trees: 0 })
    const profileUpdate = mockProfileUpdate({ flowcoins: 20, planted_trees: 0 })

    mocks.from
      .mockReturnValueOnce(eventInsert)
      .mockReturnValueOnce(profileSelect)
      .mockReturnValueOnce(profileUpdate)

    await expect(awardFlowCoinEvents([{
      eventKey: 'daily_checkin_completed:checkin-1',
      type: 'daily_checkin_completed',
      sourceId: 'checkin-1',
      coins: 10,
    }])).resolves.toMatchObject({
      awardedCoins: 10,
      profile: { flowcoins: 20, planted_trees: 0 },
    })

    expect(mocks.from).toHaveBeenNthCalledWith(1, 'flow_coin_events')
    expect(eventInsert.insert).toHaveBeenCalledWith({
      user_id: 'user-1',
      event_key: 'daily_checkin_completed:checkin-1',
      event_type: 'daily_checkin_completed',
      source_id: 'checkin-1',
      coins: 10,
    })
    expect(profileUpdate.update.mock.calls[0][0]).toMatchObject({ flowcoins: 20 })
  })

  it('ignores duplicate reward events without adding coins again', async () => {
    const duplicateInsert = mockEventInsert({ data: null, error: { code: '23505', message: 'duplicate key' } })
    const profileSelect = mockProfileSelect({ flowcoins: 20, planted_trees: 0 })

    mocks.from
      .mockReturnValueOnce(duplicateInsert)
      .mockReturnValueOnce(profileSelect)

    await expect(awardFlowCoinEvents([{
      eventKey: 'daily_checkin_completed:checkin-1',
      type: 'daily_checkin_completed',
      coins: 10,
    }])).resolves.toMatchObject({
      awardedCoins: 0,
      profile: { flowcoins: 20, planted_trees: 0 },
    })
  })

  it('redeems 1000 FlowCoins for one supported tree', async () => {
    const profileSelect = mockProfileSelect({ flowcoins: 1200, planted_trees: 2, total_redeemed_flowcoins: 2000 })
    const profileUpdate = mockProfileUpdate({ flowcoins: 200, planted_trees: 3, total_redeemed_flowcoins: 3000 })
    const redemptionInsert = mockPlainInsert({ error: null })
    mocks.from
      .mockReturnValueOnce(profileSelect)
      .mockReturnValueOnce(profileUpdate)
      .mockReturnValueOnce(redemptionInsert)

    await expect(redeemSupportedTree()).resolves.toMatchObject({
      success: true,
      profile: { flowcoins: 200, planted_trees: 3, total_redeemed_flowcoins: 3000 },
    })

    expect(profileUpdate.update.mock.calls[0][0]).toMatchObject({
      flowcoins: 200,
      planted_trees: 3,
      total_redeemed_flowcoins: 3000,
    })
    expect(redemptionInsert.insert).toHaveBeenCalledWith({
      user_id: 'user-1',
      coins_redeemed: 1000,
    })
  })

  it('syncs growth points and current FlowTree level separately from FlowCoins', async () => {
    const profileUpdate = mockProfileUpdate({
      growth_points: 320,
      flowcoins: 80,
      current_level: 'plant',
      planted_trees: 0,
    })
    mocks.from.mockReturnValue(profileUpdate)

    await expect(syncFlowtreeProgress({
      growthPoints: 320,
      currentLevel: 'plant',
    })).resolves.toMatchObject({
      growth_points: 320,
      flowcoins: 80,
      current_level: 'plant',
    })

    expect(profileUpdate.update.mock.calls[0][0]).toMatchObject({
      growth_points: 320,
      current_level: 'plant',
    })
  })
})
