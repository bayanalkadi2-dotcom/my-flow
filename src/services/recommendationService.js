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

function getMood(answers) {
  return Array.isArray(answers.mood_tags) ? answers.mood_tags[0] : answers.mood_tags
}

function addScore(scoreMap, taskId, points) {
  scoreMap.set(taskId, (scoreMap.get(taskId) || 0) + points)
}

function buildPriorityMap(answers) {
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

  if (answers.support_goal === 'sleep_preparation') {
    addScore(scoreMap, 'screen-free-break', 13)
    addScore(scoreMap, 'daily-wrap-up', 10)
    addScore(scoreMap, 'simple-muscle-relaxation', 8)
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
  return true
}

export function getRecommendationExplanation(answers, task) {
  const reasons = []
  const mood = getMood(answers)

  if (highStressValues.has(answers.stress_level)) {
    reasons.push('du heute viel Stress angegeben hast')
  }

  if (highTirednessValues.has(answers.tiredness_level)) {
    reasons.push('du müde oder erschöpft bist')
  }

  if (lowValues.has(answers.mental_energy)) {
    reasons.push('deine mentale Energie niedrig ist')
  }

  if (mood && task.suitableMoods?.includes(mood)) {
    reasons.push(`deine Stimmung "${mood}" dazu passt`)
  }

  if (answers.support_goal && task.supportGoals.includes(answers.support_goal)) {
    reasons.push('sie zu deiner gewünschten Unterstützung passt')
  }

  if (answers.available_time) {
    reasons.push(`sie in dein Zeitfenster von ${allowedMinutes(answers.available_time)} Minuten passt`)
  }

  const baseReason = reasons.length
    ? `Diese Aufgabe wurde gewählt, weil ${reasons.join(', ')}.`
    : 'Diese Aufgabe passt am besten zu deinen heutigen Angaben.'

  return `${baseReason} ${task.reasonTemplate}`
}

export function recommendTasks(answers, tasks = wellbeingTasks, options = {}) {
  const maxResults = options.maxResults ?? 2
  const availableMinutes = allowedMinutes(answers.available_time)
  const mood = getMood(answers)
  const priorityMap = buildPriorityMap(answers)

  const eligibleTasks = tasks.filter((task) => isTaskSafeForAnswers(task, answers))

  const scoredTasks = eligibleTasks
    .map((task) => {
      let score = 0

      score += priorityMap.get(task.id) || 0
      if (task.supportGoals.includes(answers.support_goal)) score += 4
      if (task.suitableStressLevels.includes(answers.stress_level)) score += 3
      if (task.suitableTirednessLevels.includes(answers.tiredness_level)) score += 3
      if (mood && task.suitableMoods?.includes(mood)) score += 4
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
    mood: getMood(answers),
    available_time_minutes: allowedMinutes(answers.available_time),
    support_goal: answers.support_goal,
  }
}
