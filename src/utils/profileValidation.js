export const MIN_PROFILE_AGE = 10
export const MAX_PROFILE_AGE = 120

export function parseProfileAge(value) {
  if (value === '' || value === null || value === undefined) return null

  const age = Number(value)
  return Number.isInteger(age) && age >= MIN_PROFILE_AGE && age <= MAX_PROFILE_AGE
    ? age
    : null
}

export function getProfileAgeError(value) {
  if (value === '' || value === null || value === undefined) {
    return 'Bitte gib dein Alter an.'
  }

  return parseProfileAge(value) === null
    ? `Bitte gib ein ganzzahliges Alter zwischen ${MIN_PROFILE_AGE} und ${MAX_PROFILE_AGE} Jahren ein.`
    : ''
}
