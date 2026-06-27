import floweringTreeImage from '../assets/flowtree/flowering-tree.svg'
import plantImage from '../assets/flowtree/plant.svg'
import seedImage from '../assets/flowtree/seed.svg'
import seedlingImage from '../assets/flowtree/seedling.svg'
import treeImage from '../assets/flowtree/tree.svg'

export const flowtreeLevels = [
  {
    id: 'seed',
    name: 'Samen',
    level: 1,
    minPoints: 0,
    maxPoints: 99,
    image: seedImage,
  },
  {
    id: 'seedling',
    name: 'Keimling',
    level: 2,
    minPoints: 100,
    maxPoints: 299,
    image: seedlingImage,
  },
  {
    id: 'plant',
    name: 'Pflanze',
    level: 3,
    minPoints: 300,
    maxPoints: 699,
    image: plantImage,
  },
  {
    id: 'tree',
    name: 'Baum',
    level: 4,
    minPoints: 700,
    maxPoints: 1199,
    image: treeImage,
  },
  {
    id: 'flowering-tree',
    name: 'Blühender Flowtree',
    level: 5,
    minPoints: 1200,
    maxPoints: Infinity,
    image: floweringTreeImage,
  },
]

export function getFlowtreeLevel(points = 0) {
  const safePoints = Math.max(Number(points) || 0, 0)
  return flowtreeLevels.find((level) => safePoints >= level.minPoints && safePoints <= level.maxPoints) ?? flowtreeLevels[0]
}

export function getFlowtreeProgress(points = 0) {
  const safePoints = Math.max(Number(points) || 0, 0)
  const currentLevel = getFlowtreeLevel(safePoints)
  const nextLevel = flowtreeLevels.find((level) => level.minPoints > safePoints) ?? null

  if (!nextLevel) {
    return {
      currentLevel,
      nextLevel: null,
      progressPercent: 100,
      pointsToNextLevel: 0,
      nextLevelPoints: null,
    }
  }

  const levelRange = Math.max(nextLevel.minPoints - currentLevel.minPoints, 1)
  const progressPercent = Math.min(Math.max(Math.round(((safePoints - currentLevel.minPoints) / levelRange) * 100), 0), 100)

  return {
    currentLevel,
    nextLevel,
    progressPercent,
    pointsToNextLevel: Math.max(nextLevel.minPoints - safePoints, 0),
    nextLevelPoints: nextLevel.minPoints,
  }
}
