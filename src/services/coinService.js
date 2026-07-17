import { supabase } from '../lib/supabase'

export const FLOW_COIN_REWARDS = {
  dailyCheckInCompleted: 10,
  routineCompleted: 15,
  dailyGoalReached: 25,
  sevenDayStreakReached: 50,
  flowtreeLevelReached: 100,
}

const MISSING_MIGRATION_CODES = new Set(['PGRST204', 'PGRST205', '42P01', '42703'])

function normalizeProfile(profile) {
  return {
    growth_points: Number(profile?.growth_points) || 0,
    flowcoins: Number(profile?.flowcoins) || 0,
    current_level: profile?.current_level ?? 'seed',
    planted_trees: Number(profile?.planted_trees) || 0,
    total_redeemed_flowcoins: Number(profile?.total_redeemed_flowcoins) || 0,
  }
}

function logCoinError(error, operation, context = {}) {
  console.error(`Supabase FlowCoins ${operation} fehlgeschlagen:`, {
    error,
    code: error?.code,
    message: error?.message,
    details: error?.details,
    hint: error?.hint,
    context,
  })

  if (
    MISSING_MIGRATION_CODES.has(error?.code)
    || error?.message?.includes('flowcoins')
    || error?.message?.includes('growth_points')
    || error?.message?.includes('current_level')
    || error?.message?.includes('planted_trees')
    || error?.message?.includes('total_redeemed_flowcoins')
    || error?.message?.includes('flow_coin_events')
    || error?.message?.includes('flow_tree_redemptions')
  ) {
    console.error(
      'FlowCoins benötigen die Supabase-Migration supabase/flow_coins.sql. Führe diese Datei im Supabase SQL Editor aus.',
      { code: error?.code, message: error?.message },
    )
  }
}

async function getAuthenticatedUser() {
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user?.id) {
    const authError = error || new Error('Kein angemeldeter Nutzer für FlowCoins gefunden.')
    console.error('Supabase-Authentifizierung für FlowCoins fehlgeschlagen:', authError)
    throw authError
  }

  return data.user
}

async function getOwnCoinProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('growth_points, flowcoins, current_level, planted_trees, total_redeemed_flowcoins')
    .eq('id', userId)
    .single()

  if (error) {
    logCoinError(error, 'profile select', { authenticatedUserId: userId })
    throw error
  }

  return normalizeProfile(data)
}

async function updateOwnCoinProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select('growth_points, flowcoins, current_level, planted_trees, total_redeemed_flowcoins')
    .single()

  if (error) {
    logCoinError(error, 'profile update', { authenticatedUserId: userId, updates })
    throw error
  }

  return normalizeProfile(data)
}

export async function getFlowCoinProfile() {
  const user = await getAuthenticatedUser()
  return getOwnCoinProfile(user.id)
}

export async function getFlowtreeGrowthPoints() {
  const { data, error } = await supabase.rpc('get_flowtree_growth_points')
  if (error) {
    logCoinError(error, 'growth point total', {})
    throw error
  }
  return Math.max(Number(data) || 0, 0)
}

export async function syncFlowtreeProgress({ growthPoints = 0, currentLevel = 'seed' } = {}) {
  const user = await getAuthenticatedUser()
  return updateOwnCoinProfile(user.id, {
    growth_points: Math.max(Number(growthPoints) || 0, 0),
    current_level: currentLevel,
    updated_at: new Date().toISOString(),
  })
}

export async function awardFlowCoinEvents(events = []) {
  const user = await getAuthenticatedUser()
  const uniqueEvents = [...new Map(
    events
      .filter((event) => event?.eventKey && Number(event.coins) > 0)
      .map((event) => [event.eventKey, event]),
  ).values()]

  if (uniqueEvents.length === 0) {
    return { profile: await getOwnCoinProfile(user.id), awardedCoins: 0, awardedEvents: [] }
  }

  const awardedEvents = []

  for (const event of uniqueEvents) {
    const payload = {
      user_id: user.id,
      event_key: event.eventKey,
      event_type: event.type,
      source_id: event.sourceId ?? null,
      coins: Number(event.coins),
    }

    const { data, error } = await supabase
      .from('flow_coin_events')
      .insert(payload)
      .select('event_key, coins')
      .single()

    if (error?.code === '23505') continue

    if (error) {
      logCoinError(error, 'event insert', { authenticatedUserId: user.id, payload })
      throw error
    }

    if (data) awardedEvents.push(data)
  }

  const awardedCoins = awardedEvents.reduce((sum, event) => sum + Number(event.coins || 0), 0)
  const currentProfile = await getOwnCoinProfile(user.id)

  if (awardedCoins <= 0) {
    return { profile: currentProfile, awardedCoins: 0, awardedEvents }
  }

  const profile = await updateOwnCoinProfile(user.id, {
    flowcoins: currentProfile.flowcoins + awardedCoins,
    updated_at: new Date().toISOString(),
  })

  return { profile, awardedCoins, awardedEvents }
}

export async function redeemSupportedTree({ cost = 1000 } = {}) {
  const user = await getAuthenticatedUser()
  const currentProfile = await getOwnCoinProfile(user.id)

  if (currentProfile.flowcoins < cost) {
    return {
      success: false,
      reason: 'not_enough_coins',
      profile: currentProfile,
    }
  }

  const profile = await updateOwnCoinProfile(user.id, {
    flowcoins: currentProfile.flowcoins - cost,
    planted_trees: currentProfile.planted_trees + 1,
    total_redeemed_flowcoins: currentProfile.total_redeemed_flowcoins + cost,
    updated_at: new Date().toISOString(),
  })

  const { error: redemptionError } = await supabase
    .from('flow_tree_redemptions')
    .insert({
      user_id: user.id,
      coins_redeemed: cost,
    })

  if (redemptionError) {
    logCoinError(redemptionError, 'tree redemption insert', { authenticatedUserId: user.id, cost })
    throw redemptionError
  }

  return {
    success: true,
    profile,
    message: 'Baum erfolgreich unterstützt!',
  }
}
