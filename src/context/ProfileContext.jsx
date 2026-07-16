import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getPersonalizedTexts,
  getProfileSituation,
  getRoutineSuggestions,
  getUserPersonalization,
} from '../config/userPersonalization'
import { getProfile } from '../services/authService'
import { readCachedProfile, writeCachedProfile } from '../utils/profileCache'
import { useAuth } from './authContextValue'
import { ProfileContext } from './profileContextValue'

function mergePersonalDetails(profile, user) {
  if (!profile) return profile
  const metadata = user?.user_metadata ?? {}
  const cached = readCachedProfile(user?.id) ?? {}
  const firstValue = (...values) => values.find((value) => value !== null && value !== undefined && value !== '')
  const firstList = (...values) => values.find((value) => Array.isArray(value) && value.length > 0) ?? []
  return {
    ...profile,
    gender: profile.gender ?? metadata.gender ?? null,
    age: profile.age ?? metadata.age ?? null,
    height_cm: profile.height_cm ?? metadata.height_cm ?? null,
    weight_kg: profile.weight_kg ?? metadata.weight_kg ?? null,
    student_status: firstValue(profile.student_status, metadata.student_status, cached.student_status) ?? null,
    age_group: firstValue(profile.age_group, metadata.age_group, cached.age_group) ?? null,
    education_level: firstValue(profile.education_level, metadata.education_level, cached.education_level) ?? null,
    daily_context: firstValue(profile.daily_context, metadata.daily_context, cached.daily_context) ?? null,
    main_challenges: firstList(profile.main_challenges, metadata.main_challenges, cached.main_challenges),
    support_goals: firstList(profile.support_goals, metadata.support_goals, cached.support_goals),
    onboarding_completed: profile.onboarding_completed || metadata.onboarding_completed || cached.onboarding_completed || false,
  }
}

export function ProfileProvider({ children }) {
  const { isAuthenticated, user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true

    async function loadCurrentProfile() {
      if (!isAuthenticated || !user) {
        queueMicrotask(() => {
          if (!isActive) return
          setProfile(null)
          setError(null)
          setIsLoading(false)
        })
        return
      }

      setIsLoading(true)
      setError(null)
      const result = await getProfile(user.id)

      if (!isActive) return
      if (result.success) {
        const mergedProfile = mergePersonalDetails(result.profile ?? null, user)
        setProfile(mergedProfile)
        writeCachedProfile(user.id, mergedProfile)
      } else {
        setProfile(null)
        setError(result.error || 'Das Profil konnte nicht geladen werden.')
      }
      setIsLoading(false)
    }

    loadCurrentProfile()
    return () => {
      isActive = false
    }
  }, [isAuthenticated, user])

  const refreshProfile = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setProfile(null)
      return null
    }

    setIsLoading(true)
    setError(null)
    const result = await getProfile(user.id)
    setIsLoading(false)

    if (!result.success) {
      setError(result.error || 'Das Profil konnte nicht geladen werden.')
      return null
    }

    const nextProfile = mergePersonalDetails(result.profile ?? null, user)
    setProfile(nextProfile)
    writeCachedProfile(user.id, nextProfile)
    return nextProfile
  }, [isAuthenticated, user])

  const personalization = useMemo(() => getUserPersonalization(profile), [profile])
  const personalizedTexts = useMemo(() => getPersonalizedTexts(profile), [profile])
  const routineSuggestions = useMemo(() => getRoutineSuggestions(profile), [profile])
  const profileSituation = useMemo(() => getProfileSituation(profile), [profile])
  const value = useMemo(() => ({
    profile,
    setProfile,
    isLoading,
    error,
    refreshProfile,
    personalization,
    personalizedTexts,
    routineSuggestions,
    profileSituation,
  }), [error, isLoading, personalization, personalizedTexts, profile, profileSituation, refreshProfile, routineSuggestions])

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  )
}
