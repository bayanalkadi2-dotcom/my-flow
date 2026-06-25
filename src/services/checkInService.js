import { supabase } from '../lib/supabase'
import { buildDailyCheckInPayload } from './checkInPayload'

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

  const { data, error } = await supabase
    .from('daily_checkins')
    .insert(payload)
    .select()
    .single()

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
    const { data, error } = await supabase
      .from('daily_checkins')
      .insert(payloadResult.payload)
      .select()
      .single()

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
