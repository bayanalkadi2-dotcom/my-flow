const PROFILE_CACHE_PREFIX = 'myflow-profile-'

export function readCachedProfile(userId) {
  if (!userId || typeof localStorage === 'undefined') return null
  try {
    return JSON.parse(localStorage.getItem(`${PROFILE_CACHE_PREFIX}${userId}`))
  } catch {
    return null
  }
}

export function writeCachedProfile(userId, profile) {
  if (!userId || !profile || typeof localStorage === 'undefined') return
  try {
    const current = readCachedProfile(userId) ?? {}
    localStorage.setItem(`${PROFILE_CACHE_PREFIX}${userId}`, JSON.stringify({ ...current, ...profile }))
  } catch {
    // The server profile remains the source of truth if storage is unavailable.
  }
}
