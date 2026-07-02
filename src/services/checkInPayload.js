export function buildDailyCheckInPayload(userId, answers, recommendations) {
  if (!userId) {
    return { success: false, error: 'Du bist nicht angemeldet. Bitte melde dich erneut an.' }
  }

  return {
    success: true,
    payload: {
      user_id: userId,
      general_mood: answers.general_mood ?? null,
      stress_level: answers.stress_level ?? null,
      tiredness_level: answers.tiredness_level ?? null,
      physical_energy: answers.physical_energy ?? null,
      mental_energy: answers.mental_energy ?? null,
      concentration_level: answers.concentration_level ?? null,
      context_stressor: Array.isArray(answers.context_stressor)
        ? answers.context_stressor.join(',') || null
        : answers.context_stressor ?? null,
      mood: Array.isArray(answers.mood_tags) ? answers.mood_tags.join(',') || null : answers.mood_tags ?? null,
      available_time_minutes: Number(answers.available_time) || null,
      support_goal: Array.isArray(answers.support_goal)
        ? answers.support_goal.join(',') || null
        : answers.support_goal ?? null,
      recommended_task_ids: recommendations?.map((recommendation) => recommendation.task?.id ?? recommendation.id) ?? [],
      updated_at: new Date().toISOString(),
    },
  }
}
