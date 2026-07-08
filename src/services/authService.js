import { supabase } from '../lib/supabase'
import {
  getHeightError,
  getProfileAgeError,
  getWeightError,
  parseHeightCm,
  parseProfileAge,
  parseWeightKg,
} from '../utils/profileValidation'

function normalizeOptionalMeasurement(value, parser, getError) {
  if (value === '' || value === null || value === undefined) return null
  const parsedValue = parser(value)
  if (parsedValue === null) throw new Error(getError(value))
  return parsedValue
}

function validateProfileMeasurementUpdates(updates = {}) {
  const validatedUpdates = { ...updates }

  if (Object.prototype.hasOwnProperty.call(updates, 'age')) {
    const age = parseProfileAge(updates.age)
    if (age === null) throw new Error(getProfileAgeError(updates.age))
    validatedUpdates.age = age
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'height_cm')) {
    const height = parseHeightCm(updates.height_cm)
    if (height === null) throw new Error(getHeightError(updates.height_cm))
    validatedUpdates.height_cm = height
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'weight_kg')) {
    if (updates.weight_kg === '' || updates.weight_kg === null || updates.weight_kg === undefined) {
      validatedUpdates.weight_kg = null
      return validatedUpdates
    }
    const weight = parseWeightKg(updates.weight_kg)
    if (weight === null) throw new Error(getWeightError(updates.weight_kg))
    validatedUpdates.weight_kg = weight
  }

  return validatedUpdates
}

export function normalizeOnboardingProfile(onboardingData = {}) {
  return {
    gender: onboardingData.gender || null,
    age: normalizeOptionalMeasurement(onboardingData.age, parseProfileAge, getProfileAgeError),
    height_cm: normalizeOptionalMeasurement(onboardingData.height_cm, parseHeightCm, getHeightError),
    weight_kg: normalizeOptionalMeasurement(onboardingData.weight_kg, parseWeightKg, getWeightError),
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

    let { data, error } = await supabase
      .from('profiles')
      .upsert(profile, { onConflict: 'id' })
      .select()
      .single()

    // Bis die neuen Spalten migriert wurden, bleibt das bestehende Onboarding nutzbar.
    if (error?.code === 'PGRST204') {
      const personalDetails = {
        gender: profile.gender,
        age: profile.age,
        height_cm: profile.height_cm,
        weight_kg: profile.weight_kg,
      }
      await supabase.auth.updateUser({
        data: { ...user.user_metadata, ...personalDetails },
      })
      const compatibleProfile = { ...profile }
      delete compatibleProfile.gender
      delete compatibleProfile.age
      delete compatibleProfile.height_cm
      delete compatibleProfile.weight_kg
      const fallback = await supabase
        .from('profiles')
        .upsert(compatibleProfile, { onConflict: 'id' })
        .select()
        .single()
      data = fallback.data
      error = fallback.error
      if (!error) data = { ...data, ...personalDetails }
    }

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
    const validatedUpdates = validateProfileMeasurementUpdates(updates)
    const { data, error } = await supabase
      .from('profiles')
      .update(validatedUpdates)
      .eq('id', userId)
      .select()

    if (error?.code === 'PGRST204') {
      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (authError || authData.user?.id !== userId) throw authError || error

      const authUpdate = await supabase.auth.updateUser({
        data: { ...authData.user.user_metadata, ...validatedUpdates },
      })
      if (authUpdate.error) throw authUpdate.error
      return { success: true, profile: validatedUpdates }
    }

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
