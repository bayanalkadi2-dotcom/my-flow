import { createContext, useContext } from 'react'

export const ProfileContext = createContext(null)

export function useProfile() {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfile muss innerhalb eines ProfileProvider verwendet werden')
  }
  return context
}

