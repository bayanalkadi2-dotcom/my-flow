export const levelSteps = [
  { name: 'Starter', min: 0 },
  { name: 'Bronze', min: 250 },
  { name: 'Silber', min: 500 },
  { name: 'Gold', min: 800 },
  { name: 'Flow Pro', min: 1200 },
]

export const treeOptions = [
  { id: 'oak', label: 'Eiche', symbol: '🌳' },
  { id: 'pine', label: 'Tanne', symbol: '🌲' },
  { id: 'flower', label: 'Blüte', symbol: '🌸' },
]

function getRoutineProgress(routine) {
  if (routine.done) return 100
  return Math.min(Math.max(Math.round(Number(routine.progress) || 0), 0), 100)
}

export function calculateChallengePoints(routines = []) {
  return routines.reduce((sum, routine) => sum + (getRoutineProgress(routine) >= 100 ? 10 : 0), 0)
}

export function calculateGrowthPoints({ routines = [], checkIns = [] } = {}) {
  const completedRoutinePoints = routines.filter((routine) => getRoutineProgress(routine) >= 100).length * 10
  const checkInPoints = checkIns.length * 5
  const allDoneBonus = routines.length > 0 && routines.every((routine) => getRoutineProgress(routine) >= 100) ? 10 : 0

  return completedRoutinePoints + checkInPoints + allDoneBonus
}

export function getFlowTree(score, treeType = 'oak') {
  const selectedTree = treeOptions.find((tree) => tree.id === treeType) ?? treeOptions[0]

  if (score < 100) {
    return { stage: 'Blatt', symbol: '🍃', progress: Math.round(score), next: 'Spross ab 100 Punkten', count: 1 }
  }

  if (score < 250) {
    return { stage: 'Spross', symbol: '🌱', progress: Math.round(((score - 100) / 150) * 100), next: 'Pflanze ab 250 Punkten', count: 1 }
  }

  if (score < 500) {
    return { stage: 'Pflanze', symbol: '🪴', progress: Math.round(((score - 250) / 250) * 100), next: 'Blume ab 500 Punkten', count: 1 }
  }

  if (score < 800) {
    return { stage: 'Blume', symbol: '🌸', progress: Math.round(((score - 500) / 300) * 100), next: 'Baum ab 800 Punkten', count: 1 }
  }

  if (score < 1200) {
    return { stage: selectedTree.label, symbol: selectedTree.symbol, progress: Math.round(((score - 800) / 400) * 100), next: 'zweiter Baum ab 1200 Punkten', count: 1 }
  }

  return { stage: 'Flow-Wald', symbol: selectedTree.symbol, progress: 100, next: 'Maximale Stufe erreicht', count: Math.min(3, Math.floor(score / 600)) }
}

export function getLevel(score) {
  const currentLevel = [...levelSteps].reverse().find((level) => score >= level.min)
  const nextLevel = levelSteps.find((level) => level.min > score)
  const currentMin = currentLevel?.min ?? 0
  const nextMin = nextLevel?.min ?? currentMin
  const progress = nextLevel
    ? Math.round(((score - currentMin) / (nextMin - currentMin)) * 100)
    : 100

  return {
    current: currentLevel?.name ?? 'Starter',
    currentMin,
    next: nextLevel?.name ?? 'Max Level',
    nextMin,
    progress,
  }
}
