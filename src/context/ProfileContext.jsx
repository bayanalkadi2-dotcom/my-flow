import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getPersonalizedTexts,
  getProfileSituation,
  getRoutineSuggestions,
  getUserPersonalization,
} from '../config/userPersonalization'
import { getProfile } from '../services/authService'
import { useAuth } from './authContextValue'
import { ProfileContext } from './profileContextValue'

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
        setProfile(result.profile ?? null)
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

    setProfile(result.profile ?? null)
    return result.profile ?? null
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
