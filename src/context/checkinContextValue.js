import { createContext, useContext } from 'react'

export const CheckinContext = createContext(null)

export function useCheckins() {
  const context = useContext(CheckinContext)
  if (!context) {
    throw new Error('useCheckins muss innerhalb eines CheckinProvider verwendet werden')
  }
  return context
}
