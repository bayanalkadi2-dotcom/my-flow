import { supabase } from '../lib/supabase'

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
