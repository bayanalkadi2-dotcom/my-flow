const legacyNoteStorageKey = 'myflow-calendar-notes'

function parseNotes(value) {
  try {
    const notes = JSON.parse(value || '{}')
    return notes && typeof notes === 'object' && !Array.isArray(notes) ? notes : {}
  } catch {
    return {}
  }
}

function getNoteStorageKey(userId) {
  return `${legacyNoteStorageKey}-${userId}`
}

export function loadCalendarNotes(userId) {
  if (!userId) return {}

  const storageKey = getNoteStorageKey(userId)
  const storedNotes = localStorage.getItem(storageKey)
  if (storedNotes !== null) return parseNotes(storedNotes)

  // Übernimmt einmalig bereits gespeicherte Notizen in den Benutzer-Speicher.
  const legacyNotes = localStorage.getItem(legacyNoteStorageKey)
  if (legacyNotes !== null) {
    const notes = parseNotes(legacyNotes)
    localStorage.setItem(storageKey, JSON.stringify(notes))
    localStorage.removeItem(legacyNoteStorageKey)
    return notes
  }

  return {}
}

export function saveCalendarNotes(userId, notes) {
  if (!userId) return
  localStorage.setItem(getNoteStorageKey(userId), JSON.stringify(notes))
}
