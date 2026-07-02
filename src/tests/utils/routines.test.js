import { describe, expect, it } from 'vitest'
import {
  getEventsForDate,
  isCalendarEventDone,
  toggleCalendarEventDone,
  updateCalendarNote,
} from '../../utils/calendarPlanner'

describe('routine and planner helpers', () => {
  it('shows daily and one-time routines for the selected date', () => {
    const events = [
      { id: 'water', date: '2026-07-01', time: '12:00', repeat: 'daily', doneDates: [] },
      { id: 'study', date: '2026-07-02', time: '14:00', repeat: 'once', done: false },
    ]

    expect(getEventsForDate(events, '2026-07-02').map((event) => event.id)).toEqual(['water', 'study'])
  })

  it('toggles daily routine completion per day', () => {
    const [routine] = toggleCalendarEventDone([
      { id: 'water', date: '2026-07-01', repeat: 'daily', doneDates: [] },
    ], 'water', '2026-07-02')

    expect(isCalendarEventDone(routine, '2026-07-01')).toBe(false)
    expect(isCalendarEventDone(routine, '2026-07-02')).toBe(true)
  })

  it('removes empty planner notes', () => {
    expect(updateCalendarNote({ '2026-07-02': 'Lernen' }, '2026-07-02', '   ')).toEqual({})
  })
})
