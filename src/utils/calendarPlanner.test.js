import assert from 'node:assert/strict'
import {
  getEventsForDate,
  isCalendarEventDone,
  toggleCalendarEventDone,
  updateCalendarNote,
} from './calendarPlanner.js'

function test(name, fn) {
  try {
    fn()
    console.log(`ok - ${name}`)
  } catch (err) {
    console.error(`not ok - ${name}`)
    throw err
  }
}

const events = [
  {
    id: 'water',
    date: '2026-07-01',
    time: '12:00',
    title: 'Wasser trinken',
    repeat: 'daily',
    doneDates: ['2026-07-01'],
  },
  {
    id: 'study',
    date: '2026-07-02',
    time: '14:00',
    title: 'Lernen',
    repeat: 'once',
    done: false,
  },
]

test('daily events appear on following days and normal events stay on their date', () => {
  const result = getEventsForDate(events, '2026-07-02')

  assert.deepEqual(result.map((event) => event.id), ['water', 'study'])
})

test('daily events are checked per selected day only', () => {
  const toggled = toggleCalendarEventDone(events, 'water', '2026-07-02')
  const waterEvent = toggled.find((event) => event.id === 'water')

  assert.equal(isCalendarEventDone(waterEvent, '2026-07-01'), true)
  assert.equal(isCalendarEventDone(waterEvent, '2026-07-02'), true)
})

test('empty day notes are removed', () => {
  const result = updateCalendarNote({ '2026-07-02': 'Pausen einplanen' }, '2026-07-02', '   ')

  assert.deepEqual(result, {})
})
