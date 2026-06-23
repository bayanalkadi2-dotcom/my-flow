export function buildDailyCheckInPayload(userId, answers, recommendations) {
  if (!userId) {
    return { success: false, error: 'Nutzer ist nicht angemeldet.' }
  }

  return {
    success: true,
    payload: {
      user_id: userId,
      general_mood: answers.general_mood,
      stress_level: answers.stress_level,
      tiredness_level: answers.tiredness_level,
      physical_energy: answers.physical_energy,
      mental_energy: answers.mental_energy,
      concentration_level: answers.concentration_level,
      mood: Array.isArray(answers.mood_tags) ? answers.mood_tags[0] : answers.mood_tags,
      available_time_minutes: Number(answers.available_time) || 0,
      support_goal: answers.support_goal,
      recommended_task_ids: recommendations.map((recommendation) => recommendation.task.id),
    },
  }
}
