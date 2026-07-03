import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { AuthContext } from './authContextValue'
import { upsertProfile } from '../services/authService'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    function applySession(nextSession) {
      if (!isMounted) return
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
    }

    // Login, Logout und automatisch erneuerte Tokens direkt übernehmen.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      applySession(nextSession)
      if (isMounted) setIsLoading(false)
    })

    async function restoreSession() {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError
        applySession(data.session)
      } catch (err) {
        if (!isMounted) return
        console.error('Fehler beim Laden der Session:', err)
        setError(err.message)
        applySession(null)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    restoreSession()

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [])

  const signup = async (email, password, displayName, onboardingData = null) => {
    setError(null)
    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            display_name: displayName,
            onboarding: onboardingData,
          },
        },
      })

      if (signupError) throw signupError

      if (data.user && data.session) {
        const profileResult = await upsertProfile(data.user.id, email, displayName, onboardingData ?? {})
        if (!profileResult.success) {
          console.error('Profil konnte nach Registrierung nicht gespeichert werden:', profileResult.error)
        }
      }

      return { user: data.user, session: data.session }
    } catch (err) {
      const message = err.message || 'Registrierung fehlgeschlagen'
      setError(message)
      throw new Error(message, { cause: err })
    }
  }

  const signin = async (email, password) => {
    setError(null)
    try {
      const { data, error: signinError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signinError) throw signinError

      return { user: data.user, session: data.session }
    } catch (err) {
      const message = err.message || 'Anmeldung fehlgeschlagen'
      setError(message)
      throw new Error(message, { cause: err })
    }
  }

  const signout = async () => {
    setError(null)
    try {
      const { error: signoutError } = await supabase.auth.signOut()
      if (signoutError) throw signoutError
      setSession(null)
      setUser(null)
    } catch (err) {
      const message = err.message || 'Abmeldung fehlgeschlagen'
      setError(message)
      throw new Error(message, { cause: err })
    }
  }

  const value = {
    user,
    session,
    isLoading,
    error,
    signup,
    signin,
    signout,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
