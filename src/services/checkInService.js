import { supabase } from '../lib/supabase'
import { buildDailyCheckInPayload } from './checkInPayload'

export async function createDailyCheckIn(userId, answers, recommendations) {
  const payloadResult = buildDailyCheckInPayload(userId, answers, recommendations)
  if (!payloadResult.success) return payloadResult

  try {
    const { data, error } = await supabase
      .from('daily_checkins')
      .insert([payloadResult.payload])
      .select()
      .single()

    if (error) throw error

    return { success: true, checkIn: data }
  } catch (err) {
    console.error('Fehler beim Speichern des Tages-Check-ins:', err)
    if (err.code === 'PGRST205' || err.message?.includes('daily_checkins')) {
      return {
        success: false,
        error: 'Deine Empfehlung wurde erstellt. Das Speichern ist erst möglich, wenn die Supabase-Tabelle daily_checkins angelegt wurde.',
      }
    }

    return { success: false, error: 'Der Check-in konnte gerade nicht gespeichert werden.' }
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
    console.error('Fehler beim Laden der Tages-Check-ins:', err)
    return { success: false, error: 'Die gespeicherten Check-ins konnten gerade nicht geladen werden.', checkIns: [] }
  }
}
