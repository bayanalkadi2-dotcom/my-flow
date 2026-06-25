import assert from 'node:assert/strict'
import { buildDailyCheckInPayload } from './checkInPayload.js'
import { recommendTasks } from './recommendationService.js'

const baseAnswers = {
  general_mood: 'neutral',
  stress_level: 'medium',
  tiredness_level: 'medium',
  physical_energy: 'medium',
  mental_energy: 'medium',
  concentration_level: 'medium',
  mood_tags: 'balanced',
  available_time: '10',
  support_goal: 'relaxation',
}

function test(name, fn) {
  try {
    fn()
    console.log(`ok - ${name}`)
  } catch (err) {
    console.error(`not ok - ${name}`)
    throw err
  }
}

function ids(result) {
  return result.map((entry) => entry.task.id)
}

test('high stress and low mental energy recommends a short calming task', () => {
  const result = recommendTasks({
    ...baseAnswers,
    stress_level: 'very_high',
    mental_energy: 'low',
    physical_energy: 'low',
    mood_tags: 'tense',
    available_time: '5',
  })

  assert.equal(result[0].task.id, 'two-minute-breathing')
  assert.ok(result.length <= 2)
})

test('exhausted users do not receive intensive movement', () => {
  const result = recommendTasks({
    ...baseAnswers,
    tiredness_level: 'exhausted',
    physical_energy: 'very_low',
    mental_energy: 'low',
    support_goal: 'sleep_preparation',
  })

  assert.equal(result[0].task.id, 'short-recovery-break')
  assert.ok(!ids(result).includes('active-task'))
})

test('high stress with good physical energy can suggest movement relief', () => {
  const result = recommendTasks({
    ...baseAnswers,
    stress_level: 'high',
    tiredness_level: 'low',
    physical_energy: 'high',
    mental_energy: 'medium',
    mood_tags: 'tense',
  })

  assert.ok(['short-walk', 'release-tension', 'two-minute-breathing'].includes(result[0].task.id))
})

test('sad mood receives a small positive action first', () => {
  const result = recommendTasks({
    ...baseAnswers,
    mental_energy: 'low',
    physical_energy: 'low',
    mood_tags: 'sad',
    support_goal: 'motivation',
  })

  assert.equal(result[0].task.id, 'small-positive-action')
})

test('irritated mood receives a reaction pause', () => {
  const result = recommendTasks({
    ...baseAnswers,
    stress_level: 'high',
    mood_tags: 'irritated',
    available_time: '5',
  })

  assert.equal(result[0].task.id, 'reaction-pause')
})

test('low concentration prefers simple focus support', () => {
  const result = recommendTasks({
    ...baseAnswers,
    concentration_level: 'low',
    mental_energy: 'low',
    support_goal: 'focus',
  })

  assert.ok(['simplify-workspace', 'choose-mini-task'].includes(result[0].task.id))
})

test('motivated high energy can receive an active task', () => {
  const result = recommendTasks({
    ...baseAnswers,
    stress_level: 'low',
    tiredness_level: 'low',
    physical_energy: 'very_high',
    mental_energy: 'very_high',
    mood_tags: 'motivated',
    support_goal: 'movement',
    available_time: '15',
  })

  assert.equal(result[0].task.id, 'active-task')
})

test('sleep preparation recommends screen-free or wrap-up tasks', () => {
  const result = recommendTasks({
    ...baseAnswers,
    tiredness_level: 'high',
    support_goal: 'sleep_preparation',
  })

  assert.ok(['screen-free-break', 'daily-wrap-up', 'short-recovery-break'].includes(result[0].task.id))
})

test('two minute time window only returns very short tasks', () => {
  const result = recommendTasks({
    ...baseAnswers,
    stress_level: 'high',
    mental_energy: 'low',
    physical_energy: 'low',
    available_time: '2',
  })

  assert.ok(result.every((entry) => entry.task.durationMinutes <= 3))
})

test('no exact match still returns a safe fallback', () => {
  const result = recommendTasks({
    ...baseAnswers,
    stress_level: 'none',
    tiredness_level: 'exhausted',
    physical_energy: 'very_low',
    mental_energy: 'none',
    concentration_level: 'none',
    mood_tags: 'balanced',
    support_goal: 'movement',
    available_time: '5',
  })

  assert.ok(result.length > 0)
  assert.ok(!ids(result).includes('active-task'))
})

test('user without login is rejected before saving', () => {
  const result = buildDailyCheckInPayload('', baseAnswers, recommendTasks(baseAnswers))

  assert.equal(result.success, false)
  assert.equal(result.error, 'Du bist nicht angemeldet. Bitte melde dich erneut an.')
})

test('check-in payload uses the Supabase column names from the schema', () => {
  const result = buildDailyCheckInPayload('user-1', baseAnswers, recommendTasks(baseAnswers))

  assert.equal(result.success, true)
  assert.equal(result.payload.mood, 'balanced')
  assert.equal(result.payload.available_time_minutes, 10)
  assert.ok(Array.isArray(result.payload.recommended_task_ids))
})
