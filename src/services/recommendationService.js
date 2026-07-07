import { wellbeingTasks } from '../data/wellbeingTasks.js'

const lowValues = new Set(['none', 'very_low', 'low'])
const highStressValues = new Set(['high', 'very_high'])
const highTirednessValues = new Set(['high', 'exhausted'])
const shortAndSafeTaskIds = new Set([
  'two-minute-breathing',
  'reaction-pause',
  'short-recovery-break',
  'choose-mini-task',
  'reduce-stimulation',
])
const complexReflectionTaskIds = new Set(['thought-dump', 'write-down-trigger', 'start-most-important-task'])
const activeTaskIds = new Set(['active-task', 'short-walk'])

function numericTime(value) {
  return Number(value) || 0
}

function allowedMinutes(value) {
  const minutes = numericTime(value)
  if (!minutes) return 10
  if (minutes <= 2) return 3
  if (minutes <= 5) return 5
  if (minutes <= 10) return 10
  return 20
}

function energyRank(value) {
  const ranks = {
    none: 0,
    very_low: 0,
    low: 1,
    medium: 2,
    high: 3,
    very_high: 4,
  }

  return ranks[value] ?? 2
}

function taskEnergyRank(value) {
  const ranks = { very_low: 0, low: 1, medium: 2, high: 3 }
  return ranks[value] ?? 1
}

function firstAnswerValue(value) {
  return Array.isArray(value) ? value[0] : value
}

function answerValues(value) {
  if (Array.isArray(value)) return value
  return value ? String(value).split(',').filter(Boolean) : []
}

function getMood(answers) {
  return firstAnswerValue(answers.mood_tags)
}

function getMoods(answers) {
  return answerValues(answers.mood_tags ?? answers.mood)
}

function addScore(scoreMap, taskId, points) {
  scoreMap.set(taskId, (scoreMap.get(taskId) || 0) + points)
}

function buildPriorityMap(answers, options = {}) {
  const scoreMap = new Map()
  const mood = getMood(answers)
  const physicalEnergy = energyRank(answers.physical_energy)
  const mentalEnergy = energyRank(answers.mental_energy)

  if (highStressValues.has(answers.stress_level)) {
    addScore(scoreMap, 'two-minute-breathing', 12)
    addScore(scoreMap, 'five-four-three-two-one', 9)
    addScore(scoreMap, 'simple-muscle-relaxation', 8)
    addScore(scoreMap, 'reaction-pause', 7)
    addScore(scoreMap, 'thought-dump', mentalEnergy >= 2 ? 6 : -8)
  }

  if (highTirednessValues.has(answers.tiredness_level)) {
    addScore(scoreMap, 'short-recovery-break', 12)
    addScore(scoreMap, 'water-and-fresh-air', 7)
    addScore(scoreMap, 'screen-free-break', 7)
    addScore(scoreMap, 'active-task', -20)
    addScore(scoreMap, 'short-walk', -12)
  }

  if (lowValues.has(answers.mental_energy)) {
    addScore(scoreMap, 'choose-mini-task', 9)
    addScore(scoreMap, 'reduce-stimulation', 8)
    addScore(scoreMap, 'short-recovery-break', 7)
    addScore(scoreMap, 'small-positive-action', 6)
    complexReflectionTaskIds.forEach((taskId) => addScore(scoreMap, taskId, -12))
  }

  if (highStressValues.has(answers.stress_level) && physicalEnergy >= 3 && !highTirednessValues.has(answers.tiredness_level)) {
    addScore(scoreMap, 'short-walk', 10)
    addScore(scoreMap, 'release-tension', 9)
    addScore(scoreMap, 'active-task', 2)
  }

  if (mood === 'tense' || mood === 'overwhelmed') {
    addScore(scoreMap, 'five-four-three-two-one', 10)
    addScore(scoreMap, 'two-minute-breathing', 9)
    addScore(scoreMap, 'reduce-stimulation', 7)
    addScore(scoreMap, 'simple-muscle-relaxation', 7)
  }

  if (mood === 'sad') {
    addScore(scoreMap, 'small-positive-action', 12)
    addScore(scoreMap, 'contact-trusted-person', 8)
    if (physicalEnergy >= 2) addScore(scoreMap, 'short-walk', 6)
  }

  if (mood === 'irritated') {
    addScore(scoreMap, 'reaction-pause', 12)
    addScore(scoreMap, 'write-down-trigger', mentalEnergy >= 2 ? 8 : -8)
    addScore(scoreMap, 'reduce-stimulation', 8)
    addScore(scoreMap, 'release-tension', 6)
  }

  if (answers.concentration_level === 'none' || answers.concentration_level === 'low') {
    addScore(scoreMap, 'five-minute-focus', mentalEnergy >= 2 ? 9 : -8)
    addScore(scoreMap, 'simplify-workspace', 9)
    addScore(scoreMap, 'choose-mini-task', 8)
  }

  if (mood === 'motivated' && physicalEnergy >= 3 && mentalEnergy >= 3) {
    addScore(scoreMap, 'active-task', 14)
    addScore(scoreMap, 'start-most-important-task', 10)
  }

  const supportGoal = firstAnswerValue(answers.support_goal)

  if (supportGoal === 'sleep_preparation') {
    addScore(scoreMap, 'screen-free-break', 13)
    addScore(scoreMap, 'daily-wrap-up', 10)
    addScore(scoreMap, 'simple-muscle-relaxation', 8)
  }

  const studentStatus = options.studentStatus ?? 'other'
  const contextStressor = firstAnswerValue(answers.context_stressor)

  if (studentStatus === 'school' && contextStressor === 'exams') {
    addScore(scoreMap, 'choose-mini-task', 9)
    addScore(scoreMap, 'five-minute-focus', mentalEnergy >= 2 ? 7 : -5)
  }

  if (studentStatus === 'university' && contextStressor === 'assignments') {
    addScore(scoreMap, 'choose-mini-task', 9)
    addScore(scoreMap, 'start-most-important-task', mentalEnergy >= 2 ? 7 : -8)
  }

  if (studentStatus === 'training' && (contextStressor === 'little_recovery' || lowValues.has(answers.mental_energy))) {
    addScore(scoreMap, 'short-recovery-break', 8)
    addScore(scoreMap, 'screen-free-break', 4)
  }

  if (contextStressor === 'self_organization' || contextStressor === 'tasks') {
    addScore(scoreMap, 'choose-mini-task', 5)
    addScore(scoreMap, 'start-most-important-task', mentalEnergy >= 2 ? 3 : -5)
  }

  return scoreMap
}

function isTaskSafeForAnswers(task, answers) {
  if (allowedMinutes(answers.available_time) < task.durationMinutes) return false
  if (taskEnergyRank(task.requiredMentalEnergy) > energyRank(answers.mental_energy)) return false
  if (taskEnergyRank(task.requiredPhysicalEnergy) > energyRank(answers.physical_energy)) return false
  if (answers.tiredness_level === 'exhausted' && activeTaskIds.has(task.id)) return false
  if (answers.physical_energy === 'very_low' && activeTaskIds.has(task.id)) return false
  if ((answers.mental_energy === 'none' || answers.mental_energy === 'very_low') && complexReflectionTaskIds.has(task.id)) {
    return false
  }
  if (highStressValues.has(answers.stress_level) && getMood(answers) === 'irritated' && task.category === 'productivity') {
    return false
  }
  const learningTask = ['learning', 'exam_stress', 'productivity', 'self_organization'].includes(task.category)
  const movementTask = task.category === 'movement'
  if (learningTask && (answers.tiredness_level === 'exhausted' || energyRank(answers.mental_energy) === 0)) return false
  if (learningTask && answers.stress_level === 'very_high' && task.durationMinutes > 5) return false
  if (movementTask && (answers.tiredness_level === 'exhausted' || energyRank(answers.physical_energy) <= 1)) return false
  if (movementTask && answers.stress_level === 'very_high' && task.requiredPhysicalEnergy !== 'low') return false
  return true
}

export function getRecommendationExplanation() {
  return 'Passend zu deinem heutigen Check-in.'
}

export function getDailyActivityGuidance(answers) {
  const exhausted = answers.tiredness_level === 'exhausted'
  const veryStressed = answers.stress_level === 'very_high'
  const lowPhysical = energyRank(answers.physical_energy) <= 1
  const lowMental = energyRank(answers.mental_energy) <= 1
  const lowConcentration = ['none', 'low'].includes(answers.concentration_level)

  const movement = exhausted || lowPhysical
    ? { level: 'pause', text: 'Sport heute nicht priorisieren. Erholung oder sehr sanfte Bewegung passt besser.' }
    : veryStressed
      ? { level: 'light', text: 'Wenn Bewegung guttut, heute nur kurz und ohne Leistungsdruck.' }
      : { level: 'go', text: 'Leichte bis normale Bewegung passt zu deiner heutigen Energie.' }

  const learning = exhausted || lowMental
    ? { level: 'pause', text: 'Keinen längeren Lernblock priorisieren. Wenn nötig, nur einen sehr kleinen Schritt.' }
    : veryStressed || lowConcentration
      ? { level: 'light', text: 'Lernen heute kurz halten: ein Thema, ein Timer und ein klares Mini-Ziel.' }
      : { level: 'go', text: 'Ein klar begrenzter Lernblock passt zu deiner heutigen mentalen Energie.' }

  return { movement, learning }
}

export function recommendTasks(answers, tasks = wellbeingTasks, options = {}) {
  const maxResults = options.maxResults ?? 4
  const availableMinutes = allowedMinutes(answers.available_time)
  const moods = getMoods(answers)
  const supportGoals = answerValues(answers.support_goal)
  const contextStressors = answerValues(answers.context_stressor)
  const excludedTaskIds = new Set(options.excludeTaskIds ?? [])
  const priorityMap = buildPriorityMap(answers, options)

  const eligibleTasks = tasks.filter((task) => isTaskSafeForAnswers(task, answers))

  const scoredTasks = eligibleTasks
    .map((task) => {
      let score = 0

      score += priorityMap.get(task.id) || 0
      if (supportGoals.some((goal) => task.supportGoals.includes(goal))) score += 5
      if (task.suitableStressLevels.includes(answers.stress_level)) score += 3
      if (task.suitableTirednessLevels.includes(answers.tiredness_level)) score += 3
      if (moods.some((mood) => task.suitableMoods?.includes(mood))) score += 4
      if (contextStressors.some((context) => task.contextTags?.includes(context))) score += 8
      if (excludedTaskIds.has(task.id)) score -= 20
      if (task.durationMinutes <= availableMinutes) score += 2
      if (task.durationMinutes <= 5) score += 1
      if (highStressValues.has(answers.stress_level) && task.category.includes('relaxation')) score += 2
      if (highTirednessValues.has(answers.tiredness_level) && task.requiredPhysicalEnergy === 'very_low') score += 2
      if (answers.concentration_level === 'none' || answers.concentration_level === 'low') {
        score += task.instructions.length <= 2 ? 1 : -1
      }

      return {
        task,
        score,
        reason: getRecommendationExplanation(answers, task),
      }
    })
    .sort((first, second) => second.score - first.score || first.task.durationMinutes - second.task.durationMinutes)

  const result = scoredTasks.slice(0, maxResults)

  if (result.length > 0) return result

  return tasks
    .filter((task) => shortAndSafeTaskIds.has(task.id))
    .filter((task) => isTaskSafeForAnswers(task, answers))
    .sort((first, second) => first.durationMinutes - second.durationMinutes)
    .slice(0, maxResults)
    .map((task) => ({
      task,
      score: 0,
      reason: getRecommendationExplanation(answers, task),
    }))
}

export function buildCheckInSummary(answers) {
  return {
    general_mood: answers.general_mood,
    stress_level: answers.stress_level,
    tiredness_level: answers.tiredness_level,
    physical_energy: answers.physical_energy,
    mental_energy: answers.mental_energy,
    concentration_level: answers.concentration_level,
    context_stressor: firstAnswerValue(answers.context_stressor),
    mood: getMood(answers),
    available_time_minutes: allowedMinutes(answers.available_time),
    support_goal: firstAnswerValue(answers.support_goal),
  }
}
