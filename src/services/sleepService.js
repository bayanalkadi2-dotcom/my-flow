import { supabase } from '../lib/supabase'

async function getAuthenticatedUser() {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.error('Supabase-Authentifizierung für Schlafdaten fehlgeschlagen:', error)
    throw error
  }
  if (!user?.id) {
    const authError = new Error('Kein authentifizierter Supabase-Benutzer mit user.id vorhanden.')
    console.error('Schlafdaten können ohne user.id nicht gespeichert werden:', authError)
    throw authError
  }

  return user
}

function logSleepDataError(error, operation, context = {}) {
  console.error(`Supabase sleep_entries ${operation} fehlgeschlagen:`, {
    error,
    code: error?.code,
    message: error?.message,
    details: error?.details,
    hint: error?.hint,
    ...context,
  })

  const tableIsMissing = error?.code === '42P01'
    || error?.code === 'PGRST205'
    || error?.message?.includes("public.sleep_entries")

  if (tableIsMissing) {
    console.error(
      'Die Supabase-Tabelle public.sleep_entries fehlt oder ist noch nicht im Schema-Cache. Führe supabase/sleep_entries.sql im Supabase SQL Editor aus.',
      error,
    )
  }
}

export async function getSleepEntries() {
  const user = await getAuthenticatedUser()
  const { data, error } = await supabase
    .from('sleep_entries')
    .select('id, sleep_date, bedtime, wake_time, duration_minutes, created_at, updated_at')
    .eq('user_id', user.id)
    .order('sleep_date', { ascending: true })

  if (error) {
    logSleepDataError(error, 'select', { authenticatedUserId: user.id })
    throw error
  }
  return data ?? []
}

export async function saveSleepEntry({ sleepDate, bedtime, wakeTime, durationMinutes }) {
  const user = await getAuthenticatedUser()
  const payload = {
    user_id: user.id,
    sleep_date: sleepDate,
    bedtime,
    wake_time: wakeTime,
    duration_minutes: durationMinutes,
  }
  const { data, error } = await supabase
    .from('sleep_entries')
    .upsert(payload, { onConflict: 'user_id,sleep_date' })
    .select('id, sleep_date, bedtime, wake_time, duration_minutes, created_at, updated_at')
    .single()

  if (error) {
    logSleepDataError(error, 'upsert', {
      authenticatedUserId: user.id,
      payload,
    })
    throw error
  }
  return data
}
