import { useCallback, useEffect, useMemo, useState } from 'react'
import { getDailyCheckIns } from '../services/checkInService'
import { useAuth } from './authContextValue'
import { CheckinContext } from './checkinContextValue'
import { findCheckin, getLocalDateKey } from '../utils/checkins'

const storageKey = 'myflow-checkins'

function loadStoredCheckins() {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function normalizeDatabaseCheckin(checkin) {
  const createdAt = checkin.created_at || checkin.updated_at || new Date().toISOString()
  return {
    id: checkin.id,
    routineId: 'daily-check-in',
    habitId: 'daily-check-in',
    title: 'Tages-Check-in',
    date: getLocalDateKey(createdAt),
    checked: true,
    time: new Date(createdAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
    createdAt,
    source: 'supabase',
  }
}

function checkinKey(checkin) {
  return `${String(checkin.routineId ?? checkin.habitId)}:${checkin.date}`
}

export function CheckinProvider({ children }) {
  const { user } = useAuth()
  const [checkins, setCheckins] = useState(loadStoredCheckins)

  // Routine-Check-ins werden sofort und dauerhaft lokal gesichert.
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(checkins))
  }, [checkins])

  // Vorhandene Supabase-Tages-Check-ins fließen in dieselbe zentrale Liste ein.
  useEffect(() => {
    if (!user?.id) return

    let cancelled = false
    getDailyCheckIns(user.id).then((result) => {
      if (cancelled || !result.success) return

      setCheckins((current) => {
        const merged = new Map(current.map((checkin) => [checkinKey(checkin), checkin]))
        result.checkIns.map(normalizeDatabaseCheckin).forEach((checkin) => {
          merged.set(checkinKey(checkin), checkin)
        })
        return [...merged.values()]
      })
    })

    return () => {
      cancelled = true
    }
  }, [user?.id])

  const hasCheckin = useCallback((routineId, date = getLocalDateKey()) => (
    Boolean(findCheckin(checkins, routineId, date))
  ), [checkins])

  const addCheckin = useCallback((input) => {
    const routineId = input.routineId ?? input.habitId
    const date = input.date || getLocalDateKey()
    const existing = findCheckin(checkins, routineId, date)

    if (existing) return { created: false, checkin: existing }

    const createdAt = input.createdAt || new Date().toISOString()
    const checkin = {
      id: input.id || crypto.randomUUID(),
      routineId,
      habitId: routineId,
      title: input.title || input.name || 'Routine',
      date,
      checked: true,
      time: input.time || new Date(createdAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
      createdAt,
      source: input.source || 'local',
    }

    // Auch bei sehr schnellen Doppelklicks prüft der State-Updater noch einmal atomar.
    setCheckins((current) => (
      findCheckin(current, routineId, date) ? current : [...current, checkin]
    ))
    return { created: true, checkin }
  }, [checkins])

  const value = useMemo(() => ({ checkins, addCheckin, hasCheckin }), [checkins, addCheckin, hasCheckin])

  return <CheckinContext.Provider value={value}>{children}</CheckinContext.Provider>
}
