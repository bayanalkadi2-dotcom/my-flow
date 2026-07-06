import { useMemo, useState } from 'react'
import { useCheckins } from '../context/checkinContextValue'
import { getLocalDateKey } from '../utils/checkins'
import uploadIcon from '../assets/diary-upload-icon.jpeg'
import {
  getEventsForDate,
  isCalendarEventDone,
  toggleCalendarEventDone,
  updateCalendarNote,
} from '../utils/calendarPlanner'

const storageKey = 'myflow-calendar-events'
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

const monthTones = ['violet', 'rose', 'sky', 'mint', 'amber', 'coral']

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
      key: getLocalDateKey(day),
      dayNumber: day.getDate(),
    }
  })
}

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1, 12)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const leadingDays = (firstDay.getDay() + 6) % 7
  const days = []

  for (let index = 0; index < leadingDays; index += 1) {
    days.push(null)
  }

  for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber += 1) {
    const date = new Date(year, month, dayNumber, 12)
    days.push({
      date,
      key: getLocalDateKey(date),
      dayNumber,
    })
  }

  return days
}

function getCalendarMonths(today) {
  const startYear = today.getFullYear() - 1
  const endYear = Math.max(2030, today.getFullYear() + 4)
  const months = []

  for (let year = startYear; year <= endYear; year += 1) {
    for (let month = 0; month < 12; month += 1) {
      months.push({ year, month, id: `${year}-${month}` })
    }
  }

  return months
}

function getDayEntry(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return {
      text: value.text || '',
      images: Array.isArray(value.images) ? value.images.slice(0, 3) : [],
    }
  }

  return {
    text: typeof value === 'string' ? value : '',
    images: [],
  }
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

function Kalender({ notes = {}, onNotesChange }) {
  const { checkins } = useCheckins()
  const today = useMemo(() => {
    const currentDate = new Date()
    currentDate.setHours(12, 0, 0, 0)
    return currentDate
  }, [])
  const [selectedDate, setSelectedDate] = useState(today)
  const [events, setEvents] = useState(loadEvents)
  const [showForm, setShowForm] = useState(false)
  const [showMonthOverview, setShowMonthOverview] = useState(false)
  const [draft, setDraft] = useState(emptyDraft)
  const selectedKey = getLocalDateKey(selectedDate)
  const weekDays = getWeekDays(selectedDate)
  const calendarMonths = useMemo(() => getCalendarMonths(today), [today])
  const selectedEvents = getEventsForDate(events, selectedKey)
  const selectedCheckins = checkins.filter((checkin) => checkin.date === selectedKey && checkin.checked)
  const selectedEntry = getDayEntry(notes[selectedKey])
  const selectedNote = selectedEntry.text
  const selectedImages = selectedEntry.images

  function updateEvents(nextEvents) {
    setEvents(nextEvents)
    saveEvents(nextEvents)
  }

  function changeWeek(direction) {
    setSelectedDate((currentDate) => {
      const nextDate = new Date(currentDate)
      nextDate.setDate(nextDate.getDate() + (direction * 7))
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
    updateEvents(toggleCalendarEventDone(events, eventId, selectedKey))
  }

  function updateNote(value) {
    const nextNotes = updateCalendarNote(notes, selectedKey, { ...selectedEntry, text: value })
    onNotesChange?.(nextNotes)
  }

  function updateImages(images) {
    const nextNotes = updateCalendarNote(notes, selectedKey, { ...selectedEntry, images })
    onNotesChange?.(nextNotes)
  }

  function addImages(files) {
    const remainingSlots = 3 - selectedImages.length
    const selectedFiles = Array.from(files).filter((file) => file.type.startsWith('image/')).slice(0, remainingSlots)

    Promise.all(selectedFiles.map((file) => new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
      reader.onerror = () => resolve('')
      reader.readAsDataURL(file)
    }))).then((images) => {
      updateImages([...selectedImages, ...images.filter(Boolean)].slice(0, 3))
    })
  }

  function removeImage(index) {
    updateImages(selectedImages.filter((_, imageIndex) => imageIndex !== index))
  }

  function isEventDone(event) {
    return isCalendarEventDone(event, selectedKey)
  }

  function selectMonthDay(date) {
    setSelectedDate(date)
    setShowMonthOverview(false)
  }

  return (
    <section className="screen calendar-screen">
      <header className="calendar-header">
        <button className="calendar-icon-button" type="button" aria-label="Menü">
          <MenuIcon />
        </button>
        <h1>Tagesbuch</h1>
        <button className="calendar-icon-button" type="button" aria-label="Monatsübersicht öffnen" onClick={() => setShowMonthOverview(true)}>
          <CalendarIcon />
        </button>
      </header>

      {showMonthOverview && (
        <section className="calendar-month-overview" aria-label="Monatsübersicht">
          <div className="calendar-month-overview-header">
            <div>
              <span>Monatsübersicht</span>
              <h2>Alle Monate</h2>
            </div>
            <button type="button" onClick={() => setShowMonthOverview(false)} aria-label="Monatsübersicht schließen">×</button>
          </div>
          <div className="calendar-month-list">
            {calendarMonths.map(({ year, month, id }) => (
              <article className={`calendar-full-month ${monthTones[month % monthTones.length]}`} key={id}>
                <h3>{monthNames[month]} {year}</h3>
                <div className="calendar-full-month-weekdays" aria-hidden="true">
                  {weekdays.map((weekday) => <span key={weekday}>{weekday}</span>)}
                </div>
                <div className="calendar-full-month-grid">
                  {getMonthDays(year, month).map((day, index) => {
                    if (!day) {
                      return <span className="calendar-month-spacer" key={`empty-${id}-${index}`} />
                    }

                    const isSelected = day.key === selectedKey
                    const isToday = day.key === getLocalDateKey(today)
                    const hasEvents = events.some((event) => event.date === day.key || (event.repeat === 'daily' && event.date <= day.key))
                      || checkins.some((checkin) => checkin.date === day.key && checkin.checked)

                    return (
                      <button
                        className={`${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                        key={day.key}
                        onClick={() => selectMonthDay(day.date)}
                        type="button"
                      >
                        {day.dayNumber}
                        {hasEvents && <i aria-hidden="true" />}
                      </button>
                    )
                  })}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="calendar-month-card">
        <button type="button" onClick={() => changeWeek(-1)} aria-label="Vorherige Woche">
          ‹
        </button>
        <strong>{monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}</strong>
        <button type="button" onClick={() => changeWeek(1)} aria-label="Nächste Woche">
          ›
        </button>
      </section>

      <section className="calendar-week-card" aria-label="Wochenübersicht">
        {weekDays.map((day) => {
          const isToday = day.key === getLocalDateKey(today)
          const isSelected = day.key === selectedKey
          const hasEvents = events.some((event) => event.date === day.key || (event.repeat === 'daily' && event.date <= day.key))
            || checkins.some((checkin) => checkin.date === day.key && checkin.checked)

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
          <span>Tägliche Aufgaben</span>
          <small>{selectedEvents.length + selectedCheckins.length} offen</small>
        </div>
        <div className="diary-task-strip">
          {selectedEvents.slice(0, 3).map((event) => (
            <button className={`diary-task-pill ${isEventDone(event) ? 'done' : ''}`} key={event.id} type="button" onClick={() => toggleEvent(event.id)}>
              <span>{event.icon}</span>
              <strong>{event.title}</strong>
            </button>
          ))}
          {selectedEvents.length === 0 && selectedCheckins.length === 0 && (
            <button className="diary-task-empty" type="button" onClick={() => setShowForm(true)}>
              <span>+</span>
              <strong>Aufgabe hinzufügen</strong>
            </button>
          )}
        </div>

        <div className="calendar-section-title">
          <span>Notiz zum Tag</span>
          <small>{selectedNote.trim() || selectedImages.length ? 'Gespeichert' : 'Optional'}</small>
        </div>
        <textarea
          value={selectedNote}
          onChange={(event) => updateNote(event.target.value)}
          placeholder="z. B. Heute auf genug Pausen achten..."
        />
        <div className="diary-images-header">
          <span>Bilder zum Tag</span>
          <small>{selectedImages.length}/3</small>
        </div>
        <div className="diary-image-grid">
          {selectedImages.map((image, index) => (
            <figure className="diary-image-card" key={`${image.slice(0, 24)}-${index}`}>
              <img src={image} alt={`Tagesbild ${index + 1}`} />
              <button type="button" onClick={() => removeImage(index)} aria-label={`Bild ${index + 1} entfernen`}>×</button>
            </figure>
          ))}
          {selectedImages.length < 3 && (
            <label className="diary-image-add">
              <input
                accept="image/*"
                multiple
                type="file"
                onChange={(event) => {
                  addImages(event.target.files || [])
                  event.target.value = ''
                }}
              />
              <img src={uploadIcon} alt="" />
            </label>
          )}
        </div>
      </section>

      <section className="calendar-timeline-card">
        <div className="calendar-section-title">
          <span>Heute geplant</span>
          <small>{selectedEvents.length + selectedCheckins.length} Einträge</small>
        </div>
        <div className="calendar-timeline">
          {selectedEvents.length > 0 || selectedCheckins.length > 0 ? (
            <>
            {selectedEvents.map((event) => (
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
            ))}
            {selectedCheckins.map((checkin) => (
              <article className="calendar-event-card blue done" key={`checkin-${checkin.id}`}>
                <time>{checkin.time || '--:--'}</time>
                <span className="calendar-event-icon">✓</span>
                <div>
                  <strong>{checkin.title}</strong>
                  <small>Eingecheckt</small>
                </div>
                <span className="calendar-check-button" aria-label={`${checkin.title} eingecheckt`}>✓</span>
              </article>
            ))}
            </>
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
