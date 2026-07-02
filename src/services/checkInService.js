import { supabase } from '../lib/supabase'
import { buildDailyCheckInPayload } from './checkInPayload'

async function insertDailyCheckIn(payload) {
  let result = await supabase
    .from('daily_checkins')
    .insert(payload)
    .select()
    .single()

  // Ältere Supabase-Projekte besitzen context_stressor eventuell noch nicht.
  // Der Check-in bleibt speicherbar, bis die Migration ausgeführt wurde.
  if (result.error?.message?.includes("'context_stressor' column")) {
    const compatiblePayload = { ...payload }
    delete compatiblePayload.context_stressor
    result = await supabase
      .from('daily_checkins')
      .insert(compatiblePayload)
      .select()
      .single()
  }

  return result
}

export async function saveDailyCheckIn(answers, recommendations) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    console.error('Fehler beim Laden des Benutzers:', userError)
    throw new Error(userError.message)
  }

  if (!user) {
    throw new Error('Du bist nicht angemeldet. Bitte melde dich erneut an.')
  }

  console.log('Supabase-Auth-User für Tages-Check-in:', user)

  const payloadResult = buildDailyCheckInPayload(user.id, answers, recommendations)
  if (!payloadResult.success) {
    throw new Error(payloadResult.error)
  }

  const payload = payloadResult.payload
  console.log('Daily-Check-in-Payload:', payload)

  // Pro Nutzer wird höchstens ein Tages-Check-in pro lokalem Kalendertag angelegt.
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const startOfNextDay = new Date(startOfDay)
  startOfNextDay.setDate(startOfNextDay.getDate() + 1)

  const { data: existing, error: existingError } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('user_id', user.id)
    .gte('created_at', startOfDay.toISOString())
    .lt('created_at', startOfNextDay.toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existingError) {
    throw new Error(`Check-in konnte nicht geprüft werden: ${existingError.message}`)
  }

  if (existing) return existing

  const { data, error } = await insertDailyCheckIn(payload)

  if (error) {
    console.error('Supabase-Insert-Fehler:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      payload,
    })

    throw new Error(`Check-in konnte nicht gespeichert werden: ${error.message}`)
  }

  console.log('Check-in gespeichert:', data)
  return data
}

export async function createDailyCheckIn(userId, answers, recommendations) {
  const payloadResult = buildDailyCheckInPayload(userId, answers, recommendations)
  if (!payloadResult.success) return payloadResult

  try {
    const { data, error } = await insertDailyCheckIn(payloadResult.payload)

    if (error) throw error

    return { success: true, checkIn: data }
  } catch (err) {
    console.error('Fehler beim Speichern des Tages-Check-ins:', {
      message: err.message,
      code: err.code,
      details: err.details,
      hint: err.hint,
      payload: payloadResult.payload,
    })
    return { success: false, error: err.message }
  }
}

export async function getDailyCheckIns(userId) {
  if (!userId) {
    return { success: false, error: 'Nutzer ist nicht angemeldet.', checkIns: [] }
  }

  try {
    const { data, error } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, checkIns: data || [] }
  } catch (err) {
    console.error('Fehler beim Laden der Tages-Check-ins:', {
      message: err.message,
      code: err.code,
      details: err.details,
      hint: err.hint,
    })
    return { success: false, error: err.message, checkIns: [] }
  }
}

export async function getUserCheckIns() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    console.error('Fehler beim Laden des Benutzers:', userError)
    throw new Error(userError.message)
  }

  if (!user) {
    throw new Error('Du bist nicht angemeldet.')
  }

  const { data, error } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Fehler beim Laden der Tages-Check-ins:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    })
    throw new Error(error.message)
  }

  return data ?? []
}
