import { useMemo, useState } from 'react'

const storageKey = 'myflow-calendar-events'
const noteStorageKey = 'myflow-calendar-notes'
const weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const monthNames = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
]

const eventTypes = [
  { id: 'morning', label: 'Morgenroutine', icon: '☀', tone: 'yellow' },
  { id: 'sport', label: 'Sport', icon: '🏋', tone: 'pink' },
  { id: 'water', label: 'Wasser trinken', icon: '💧', tone: 'blue' },
  { id: 'study', label: 'Lernen', icon: '📖', tone: 'yellow' },
  { id: 'gratitude', label: 'Dankbarkeit', icon: '♡', tone: 'pink' },
]

const emptyDraft = {
  time: '08:00',
  title: '',
  type: 'morning',
  repeat: 'once',
}

function loadEvents() {
  try {
    const storedEvents = JSON.parse(localStorage.getItem(storageKey) || '[]')
    return Array.isArray(storedEvents) ? storedEvents : []
  } catch {
    return []
  }
}

function saveEvents(events) {
  localStorage.setItem(storageKey, JSON.stringify(events))
}

function loadNotes() {
  try {
    const storedNotes = JSON.parse(localStorage.getItem(noteStorageKey) || '{}')
    return storedNotes && typeof storedNotes === 'object' ? storedNotes : {}
  } catch {
    return {}
  }
}

function saveNotes(notes) {
  localStorage.setItem(noteStorageKey, JSON.stringify(notes))
}

function getDateKey(date) {
  return date.toISOString().slice(0, 10)
}

function getStartOfWeek(date) {
  const start = new Date(date)
  const day = start.getDay() || 7
  start.setDate(start.getDate() - day + 1)
  start.setHours(12, 0, 0, 0)
  return start
}

function getWeekDays(date) {
  const start = getStartOfWeek(date)
  return weekdays.map((weekday, index) => {
    const day = new Date(start)
    day.setDate(start.getDate() + index)
    return {
      weekday,
      date: day,
      key: getDateKey(day),
      dayNumber: day.getDate(),
    }
  })
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3v3" />
      <path d="M17 3v3" />
      <path d="M4 9h16" />
      <path d="M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  )
}

function Kalender() {
  const today = useMemo(() => {
    const currentDate = new Date()
    currentDate.setHours(12, 0, 0, 0)
    return currentDate
  }, [])
  const [selectedDate, setSelectedDate] = useState(today)
  const [events, setEvents] = useState(loadEvents)
  const [notes, setNotes] = useState(loadNotes)
  const [showForm, setShowForm] = useState(false)
  const [draft, setDraft] = useState(emptyDraft)
  const selectedKey = getDateKey(selectedDate)
  const weekDays = getWeekDays(selectedDate)
  const selectedEvents = events
    .filter((event) => event.date === selectedKey || (event.repeat === 'daily' && event.date <= selectedKey))
    .sort((firstEvent, secondEvent) => firstEvent.time.localeCompare(secondEvent.time))
  const selectedNote = notes[selectedKey] || ''

  function updateEvents(nextEvents) {
    setEvents(nextEvents)
    saveEvents(nextEvents)
  }

  function changeMonth(direction) {
    setSelectedDate((currentDate) => {
      const nextDate = new Date(currentDate)
      nextDate.setMonth(nextDate.getMonth() + direction)
      return nextDate
    })
  }

  function addEvent(event) {
    event.preventDefault()
    const title = draft.title.trim()

    if (!title) {
      return
    }

    const selectedType = eventTypes.find((type) => type.id === draft.type) ?? eventTypes[0]
    const nextEvent = {
      id: crypto.randomUUID(),
      date: selectedKey,
      time: draft.time,
      title,
      type: selectedType.id,
      icon: selectedType.icon,
      tone: selectedType.tone,
      repeat: draft.repeat,
      done: false,
      doneDates: [],
    }

    updateEvents([...events, nextEvent])
    setDraft(emptyDraft)
    setShowForm(false)
  }

  function toggleEvent(eventId) {
    updateEvents(events.map((event) => (
      event.id === eventId && event.repeat === 'daily'
        ? {
            ...event,
            doneDates: event.doneDates?.includes(selectedKey)
              ? event.doneDates.filter((date) => date !== selectedKey)
              : [...(event.doneDates || []), selectedKey],
          }
        : event.id === eventId
          ? { ...event, done: !event.done }
          : event
    )))
  }

  function updateNote(value) {
    const nextNotes = { ...notes, [selectedKey]: value }

    if (!value.trim()) {
      delete nextNotes[selectedKey]
    }

    setNotes(nextNotes)
    saveNotes(nextNotes)
  }

  function isEventDone(event) {
    return event.repeat === 'daily' ? event.doneDates?.includes(selectedKey) : event.done
  }

  return (
    <section className="screen calendar-screen">
      <header className="calendar-header">
        <button className="calendar-icon-button" type="button" aria-label="Menü">
          <MenuIcon />
        </button>
        <h1>Kalender</h1>
        <button className="calendar-icon-button" type="button" aria-label="Kalender">
          <CalendarIcon />
        </button>
      </header>

      <section className="calendar-month-card">
        <button type="button" onClick={() => changeMonth(-1)} aria-label="Vorheriger Monat">
          ‹
        </button>
        <strong>{monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}</strong>
        <button type="button" onClick={() => changeMonth(1)} aria-label="Nächster Monat">
          ›
        </button>
      </section>

      <section className="calendar-week-card" aria-label="Wochenübersicht">
        {weekDays.map((day) => {
          const isToday = day.key === getDateKey(today)
          const isSelected = day.key === selectedKey
          const hasEvents = events.some((event) => event.date === day.key || (event.repeat === 'daily' && event.date <= day.key))

          return (
            <button
              className={`${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              key={day.key}
              onClick={() => setSelectedDate(day.date)}
              type="button"
            >
              <span>{day.weekday}</span>
              <strong>{day.dayNumber}</strong>
              {hasEvents && <i aria-hidden="true" />}
            </button>
          )
        })}
      </section>

      {showForm && (
        <form className="calendar-add-card" onSubmit={addEvent}>
          <div className="calendar-form-row">
            <label>
              Uhrzeit
              <input
                type="time"
                value={draft.time}
                onChange={(event) => setDraft((current) => ({ ...current, time: event.target.value }))}
              />
            </label>
            <label>
              Art
              <select
                value={draft.type}
                onChange={(event) => {
                  const selectedType = eventTypes.find((type) => type.id === event.target.value)
                  setDraft((current) => ({
                    ...current,
                    type: event.target.value,
                    title: current.title || selectedType?.label || '',
                  }))
                }}
              >
                {eventTypes.map((type) => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Erinnerung oder Gewohnheit
            <input
              value={draft.title}
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              placeholder="z. B. Wasser trinken"
            />
          </label>
          <label className="calendar-repeat-toggle">
            <input
              checked={draft.repeat === 'daily'}
              type="checkbox"
              onChange={(event) => setDraft((current) => ({ ...current, repeat: event.target.checked ? 'daily' : 'once' }))}
            />
            <span>Täglich wiederholen</span>
          </label>
          <div className="calendar-form-actions">
            <button className="secondary-button" type="button" onClick={() => setShowForm(false)}>Abbrechen</button>
            <button type="submit">Hinzufügen</button>
          </div>
        </form>
      )}

      <section className="calendar-note-card">
        <div className="calendar-section-title">
          <span>Notiz zum Tag</span>
          <small>{selectedNote.trim() ? 'Gespeichert' : 'Optional'}</small>
        </div>
        <textarea
          value={selectedNote}
          onChange={(event) => updateNote(event.target.value)}
          placeholder="z. B. Heute auf genug Pausen achten..."
        />
      </section>

      <section className="calendar-timeline-card">
        <div className="calendar-section-title">
          <span>Heute geplant</span>
          <small>{selectedEvents.length} Einträge</small>
        </div>
        <div className="calendar-timeline">
          {selectedEvents.length > 0 ? (
            selectedEvents.map((event) => (
              <article className={`calendar-event-card ${event.tone} ${isEventDone(event) ? 'done' : ''}`} key={event.id}>
                <time>{event.time}</time>
                <span className="calendar-event-icon">{event.icon}</span>
                <div>
                  <strong>{event.title}</strong>
                  <small>{event.repeat === 'daily' ? 'Täglich wiederholt' : 'Manuell hinzugefügt'}</small>
                </div>
                <button
                  className="calendar-check-button"
                  type="button"
                  onClick={() => toggleEvent(event.id)}
                  aria-label={`${event.title} abhaken`}
                >
                  {isEventDone(event) && '✓'}
                </button>
              </article>
            ))
          ) : (
            <div className="calendar-empty-state">
              <strong>Noch nichts geplant</strong>
              <p>Füge über den Plus-Button Gewohnheiten und Erinnerungen für diesen Tag hinzu.</p>
            </div>
          )}
        </div>
      </section>

      <button className="calendar-fab" type="button" onClick={() => setShowForm(true)} aria-label="Termin hinzufügen">
        +
      </button>
    </section>
  )
}

export default Kalender
