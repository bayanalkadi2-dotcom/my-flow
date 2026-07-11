export function getEventsForDate(events, dateKey) {
  return events
    .filter((event) => doesEventOccurOnDate(event, dateKey))
    .sort((firstEvent, secondEvent) => firstEvent.time.localeCompare(secondEvent.time))
}

export function doesEventOccurOnDate(event, dateKey) {
  if (event.date === dateKey) return true
  if (!event.repeat || event.repeat === 'once' || event.date > dateKey) return false

  const startDate = new Date(`${event.date}T12:00:00`)
  const currentDate = new Date(`${dateKey}T12:00:00`)
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(currentDate.getTime())) return false

  if (event.repeat === 'daily') return true
  if (event.repeat === 'weekly') return startDate.getDay() === currentDate.getDay()
  if (event.repeat === 'monthly') return startDate.getDate() === currentDate.getDate()

  return false
}

export function isCalendarEventDone(event, dateKey) {
  return event.repeat && event.repeat !== 'once' ? event.doneDates?.includes(dateKey) === true : event.done === true
}

export function toggleCalendarEventDone(events, eventId, dateKey) {
  return events.map((event) => {
    if (event.id !== eventId) {
      return event
    }

    if (!event.repeat || event.repeat === 'once') {
      return { ...event, done: !event.done }
    }

    const doneDates = event.doneDates || []
    const nextDoneDates = doneDates.includes(dateKey)
      ? doneDates.filter((date) => date !== dateKey)
      : [...doneDates, dateKey]

    return { ...event, doneDates: nextDoneDates }
  })
}

export function updateCalendarNote(notes, dateKey, value) {
  const nextNotes = { ...notes, [dateKey]: value }
  const text = typeof value === 'string' ? value : value?.text ?? ''
  const images = Array.isArray(value?.images) ? value.images : []

  if (!text.trim() && images.length === 0) {
    delete nextNotes[dateKey]
  }

  return nextNotes
}
