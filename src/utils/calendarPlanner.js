export function getEventsForDate(events, dateKey) {
  return events
    .filter((event) => event.date === dateKey || (event.repeat === 'daily' && event.date <= dateKey))
    .sort((firstEvent, secondEvent) => firstEvent.time.localeCompare(secondEvent.time))
}

export function isCalendarEventDone(event, dateKey) {
  return event.repeat === 'daily' ? event.doneDates?.includes(dateKey) === true : event.done === true
}

export function toggleCalendarEventDone(events, eventId, dateKey) {
  return events.map((event) => {
    if (event.id !== eventId) {
      return event
    }

    if (event.repeat !== 'daily') {
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
