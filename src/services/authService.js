import { supabase } from '../lib/supabase'

export function normalizeOnboardingProfile(onboardingData = {}) {
  return {
    student_status: onboardingData.student_status ?? null,
    age_group: onboardingData.age_group ?? null,
    education_level: onboardingData.education_level ?? null,
    daily_context: onboardingData.daily_context ?? null,
    main_challenges: Array.isArray(onboardingData.main_challenges) ? onboardingData.main_challenges : [],
    support_goals: Array.isArray(onboardingData.support_goals) ? onboardingData.support_goals : [],
    onboarding_completed: Boolean(onboardingData.onboarding_completed ?? true),
  }
}

export async function createProfile(userId, email, displayName) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          email,
          display_name: displayName,
        },
      ])
      .select()

    if (error) throw error
    return { success: true, profile: data?.[0] }
  } catch (err) {
    console.error('Fehler beim Erstellen des Profils:', err)
    return { success: false, error: err.message }
  }
}

export async function upsertProfile(userId, email, displayName, onboardingData = {}) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          email,
          display_name: displayName,
          ...normalizeOnboardingProfile(onboardingData),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      )
      .select()
      .single()

    if (error) throw error
    return { success: true, profile: data }
  } catch (err) {
    console.error('Fehler beim Speichern des Profils:', err)
    return { success: false, error: err.message }
  }
}

export async function saveOnboardingProfile(onboardingData = {}, displayName = null) {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      throw new Error('Du bist nicht angemeldet.', { cause: userError })
    }

    const profile = {
      id: user.id,
      email: user.email,
      ...normalizeOnboardingProfile({
        ...onboardingData,
        onboarding_completed: true,
      }),
      updated_at: new Date().toISOString(),
    }

    if (displayName) profile.display_name = displayName

    const { data, error } = await supabase
      .from('profiles')
      .upsert(profile, { onConflict: 'id' })
      .select()
      .single()

    if (error) throw error
    return { success: true, profile: data }
  } catch (err) {
    console.error('Onboarding konnte nicht gespeichert werden:', err.cause ?? err)
    return { success: false, error: err }
  }
}

export async function getProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return { success: true, profile: data }
  } catch (err) {
    console.error('Fehler beim Abrufen des Profils:', err)
    return { success: false, error: err.message }
  }
}

export async function updateProfile(userId, updates) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()

    if (error) throw error
    return { success: true, profile: data?.[0] }
  } catch (err) {
    console.error('Fehler beim Aktualisieren des Profils:', err)
    return { success: false, error: err.message }
  }
}

export async function getUserSettings(userId) {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return { success: true, settings: data }
  } catch (err) {
    console.error('Fehler beim Abrufen der Einstellungen:', err)
    return { success: false, error: err.message }
  }
}

export async function updateUserSettings(userId, settings) {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .update(settings)
      .eq('user_id', userId)
      .select()

    if (error) throw error
    return { success: true, settings: data?.[0] }
  } catch (err) {
    console.error('Fehler beim Aktualisieren der Einstellungen:', err)
    return { success: false, error: err.message }
  }
}

export async function createUserSettings(userId, settings = {}) {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .insert([
        {
          user_id: userId,
          ...settings,
        },
      ])
      .select()

    if (error) throw error
    return { success: true, settings: data?.[0] }
  } catch (err) {
    console.error('Fehler beim Erstellen der Einstellungen:', err)
    return { success: false, error: err.message }
  }
}
