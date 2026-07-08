export const MIN_PROFILE_AGE = 16
export const MAX_PROFILE_AGE = 120
export const MIN_WEIGHT_KG = 25
export const MAX_WEIGHT_KG = 350
export const MIN_HEIGHT_CM = 100
export const MAX_HEIGHT_CM = 250

function parseDecimal(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value !== 'string') return null

  const normalized = value.trim().replace(',', '.')
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) return null

  const number = Number(normalized)
  return Number.isFinite(number) ? number : null
}

export function parseProfileAge(value) {
  const age = parseDecimal(value)
  return Number.isInteger(age) && age >= MIN_PROFILE_AGE && age <= MAX_PROFILE_AGE ? age : null
}

export function getProfileAgeError(value) {
  const age = parseDecimal(value)
  if (age !== null && Number.isInteger(age) && age < MIN_PROFILE_AGE) {
    return 'Du musst mindestens 16 Jahre alt sein, um die App nutzen zu können.'
  }
  if (parseProfileAge(value) === null) return 'Bitte gib ein gültiges Alter ein.'
  return ''
}

export function parseWeightKg(value) {
  const weight = parseDecimal(value)
  return weight !== null && weight >= MIN_WEIGHT_KG && weight <= MAX_WEIGHT_KG ? weight : null
}

export function getWeightError(value) {
  return parseWeightKg(value) === null
    ? 'Bitte gib ein gültiges Gewicht zwischen 25 und 350 kg ein.'
    : ''
}

export function parseHeightCm(value) {
  const height = parseDecimal(value)
  return height !== null && height >= MIN_HEIGHT_CM && height <= MAX_HEIGHT_CM ? height : null
}

export function getHeightError(value) {
  return parseHeightCm(value) === null
    ? 'Bitte gib eine gültige Körpergröße zwischen 100 und 250 cm ein.'
    : ''
}

export function getPersonalMeasurementErrors({ age, height_cm: height, weight_kg: weight }) {
  return {
    age: getProfileAgeError(age),
    height: getHeightError(height),
    weight: getWeightError(weight),
  }
}
