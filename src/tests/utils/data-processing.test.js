import { describe, expect, it } from 'vitest'
import { evaluateGroundingAnswer } from '../../data/groundingExercise'
import { buildDailyCheckInPayload } from '../../services/checkInPayload'
import { buildCheckInSummary, recommendTasks } from '../../services/recommendationService'

const answers = {
  general_mood: 'neutral',
  stress_level: 'high',
  tiredness_level: 'medium',
  physical_energy: 'medium',
  mental_energy: 'low',
  concentration_level: 'low',
  context_stressor: 'exams',
  mood_tags: 'tense',
  available_time: '5',
  support_goal: 'focus',
}

describe('data processing helpers', () => {
  it('builds a Supabase-ready daily check-in payload', () => {
    const recommendations = recommendTasks(answers)
    const result = buildDailyCheckInPayload('user-1', answers, recommendations)

    expect(result.success).toBe(true)
    expect(result.payload).toMatchObject({
      user_id: 'user-1',
      available_time_minutes: 5,
      mood: 'tense',
    })
    expect(result.payload.recommended_task_ids.length).toBeGreaterThan(0)
  })

  it('rejects missing users before saving check-ins', () => {
    expect(buildDailyCheckInPayload('', answers, [])).toMatchObject({
      success: false,
      error: 'Du bist nicht angemeldet. Bitte melde dich erneut an.',
    })
  })

  it('normalizes a check-in summary for display', () => {
    expect(buildCheckInSummary(answers)).toMatchObject({
      mood: 'tense',
      available_time_minutes: 5,
      support_goal: 'focus',
    })
  })

  it('evaluates grounding exercise answers', () => {
    expect(evaluateGroundingAnswer('Fenster, Tisch, Lampe, Pflanze und Tuer', 5)).toMatchObject({
      isEnough: true,
      count: 5,
    })
  })
})
