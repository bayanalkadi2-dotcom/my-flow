import assert from 'node:assert/strict'
import { buildDailyCheckInPayload } from './services/checkInPayload.js'
import { recommendTasks } from './services/recommendationService.js'
import {
  getEventsForDate,
  isCalendarEventDone,
  toggleCalendarEventDone,
  updateCalendarNote,
} from './utils/calendarPlanner.js'
import {
  calculateChallengePoints,
  calculateGrowthPoints,
  getFlowTree,
  getLevel,
} from './utils/progressLevels.js'
import { findCheckin, getLocalDateKey } from './utils/checkins.js'

function test(name, fn) {
  try {
    fn()
    console.log(`ok - ${name}`)
  } catch (err) {
    console.error(`not ok - ${name}`)
    throw err
  }
}

test('check-ins use local YYYY-MM-DD dates and reject routine duplicates', () => {
  const date = getLocalDateKey(new Date(2026, 6, 2, 8, 30))
  const checkIns = [{ routineId: 'water', date, checked: true }]

  assert.equal(date, '2026-07-02')
  assert.equal(findCheckin(checkIns, 'water', date), checkIns[0])
  assert.equal(findCheckin(checkIns, 'sleep', date), undefined)
})

const checkInAnswers = {
  general_mood: 'neutral',
  stress_level: 'high',
  tiredness_level: 'medium',
  physical_energy: 'medium',
  mental_energy: 'low',
  concentration_level: 'low',
  mood_tags: 'tense',
  available_time: '5',
  support_goal: 'focus',
}

test('calendar keeps manual and daily planning visible for the selected day', () => {
  const events = [
    { id: 'water', date: '2026-07-01', time: '12:00', title: 'Wasser trinken', repeat: 'daily', doneDates: [] },
    { id: 'study', date: '2026-07-02', time: '14:00', title: 'Lernen', repeat: 'once', done: false },
  ]

  const result = getEventsForDate(events, '2026-07-02')

  assert.deepEqual(result.map((event) => event.id), ['water', 'study'])
})

test('calendar can check a daily habit without marking every day as done', () => {
  const events = [
    { id: 'water', date: '2026-07-01', time: '12:00', title: 'Wasser trinken', repeat: 'daily', doneDates: [] },
  ]

  const result = toggleCalendarEventDone(events, 'water', '2026-07-02')
  const water = result[0]

  assert.equal(isCalendarEventDone(water, '2026-07-01'), false)
  assert.equal(isCalendarEventDone(water, '2026-07-02'), true)
})

test('calendar notes are saved per day and empty notes are removed', () => {
  const saved = updateCalendarNote({}, '2026-07-02', 'Mathe lernen')
  const cleared = updateCalendarNote(saved, '2026-07-02', '   ')

  assert.deepEqual(saved, { '2026-07-02': 'Mathe lernen' })
  assert.deepEqual(cleared, {})
})

test('check-in creates a Supabase-ready payload with recommendations', () => {
  const recommendations = recommendTasks(checkInAnswers)
  const result = buildDailyCheckInPayload('user-1', checkInAnswers, recommendations)

  assert.equal(result.success, true)
  assert.equal(result.payload.user_id, 'user-1')
  assert.equal(result.payload.available_time_minutes, 5)
  assert.ok(result.payload.recommended_task_ids.length > 0)
})

test('recommendations avoid intense activity when energy is very low', () => {
  const result = recommendTasks({
    ...checkInAnswers,
    tiredness_level: 'exhausted',
    physical_energy: 'very_low',
    support_goal: 'movement',
  })

  assert.ok(result.length > 0)
  assert.ok(!result.map((entry) => entry.task.id).includes('active-task'))
})

test('progress points and level grow from completed routines and check-ins', () => {
  const routines = [
    { progress: 100 },
    { done: true },
    { progress: 40 },
  ]
  const checkIns = [{ id: 1 }, { id: 2 }]

  assert.equal(calculateChallengePoints(routines), 20)
  assert.equal(calculateGrowthPoints({ routines, checkIns }), 30)
  assert.equal(getLevel(500).current, 'Silber')
})

test('flow tree reaches tree stage when enough growth points exist', () => {
  const tree = getFlowTree(850, 'oak')

  assert.equal(tree.stage, 'Eiche')
  assert.equal(tree.count, 1)
  assert.ok(tree.progress > 0)
})
