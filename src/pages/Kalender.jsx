import { useEffect, useMemo, useRef, useState } from 'react'
import { useCheckins } from '../context/checkinContextValue'
import { getLocalDateKey } from '../utils/checkins'
import uploadIcon from '../assets/diary-upload-icon.jpeg'
import uploadIconDark from '../assets/diary-upload-icon-dark.jpg'
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
  'M\u00e4rz',
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
  { id: 'morning', label: 'Morgenroutine', icon: '\u2600', tone: 'yellow' },
  { id: 'sport', label: 'Sport', icon: '\u{1F3CB}', tone: 'pink' },
  { id: 'water', label: 'Wasser trinken', icon: '\u{1F4A7}', tone: 'blue' },
  { id: 'study', label: 'Lernen', icon: '\u{1F4D6}', tone: 'yellow' },
  { id: 'gratitude', label: 'Dankbarkeit', icon: '\u2661', tone: 'pink' },
]

const monthTones = ['violet', 'rose', 'sky', 'mint', 'amber', 'coral']

const emptyDraft = {
  time: '08:00',
  title: '',
  type: 'morning',
  repeat: 'once',
}

const diaryFilters = [
  { id: 'all', label: 'Alle', icon: '*' },
  { id: 'today', label: 'Heute', icon: 'o' },
  { id: 'notes', label: 'Notizen', icon: 'N' },
  { id: 'images', label: 'Bilder', icon: 'B' },
  { id: 'tasks', label: 'Aufgaben', icon: '\u2713' },
]

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

function hasDiaryEntry(value) {
  const entry = getDayEntry(value)
  return entry.text.trim().length > 0 || entry.images.length > 0
}

function hasDiaryNote(value) {
  return getDayEntry(value).text.trim().length > 0
}

function hasDiaryImages(value) {
  return getDayEntry(value).images.length > 0
}

function getDateFromKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day, 12)
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
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [showFilterResults, setShowFilterResults] = useState(false)
  const [showMonthOverview, setShowMonthOverview] = useState(false)
  const [showNoteEditor, setShowNoteEditor] = useState(false)
  const [showImageUploader, setShowImageUploader] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')
  const [draft, setDraft] = useState(emptyDraft)
  const currentMonthRef = useRef(null)
  const noteTextareaRef = useRef(null)
  const selectedKey = getLocalDateKey(selectedDate)
  const weekDays = getWeekDays(selectedDate)
  const calendarMonths = useMemo(() => getCalendarMonths(today), [today])
  const selectedEvents = getEventsForDate(events, selectedKey)
  const selectedCheckins = checkins.filter((checkin) => checkin.date === selectedKey && checkin.checked)
  const selectedEntry = getDayEntry(notes[selectedKey])
  const selectedNote = selectedEntry.text
  const selectedImages = selectedEntry.images
  const shouldShowNoteEditor = showNoteEditor || selectedNote.trim().length > 0
  const shouldShowImageUploader = showImageUploader && selectedImages.length < 3
  const activeFilterLabel = diaryFilters.find((filter) => filter.id === activeFilter)?.label ?? 'Alle'

  const filterResultDays = useMemo(() => {
    const dayKeys = new Set()

    Object.entries(notes).forEach(([dateKey, value]) => {
      if (activeFilter === 'notes' && hasDiaryNote(value)) dayKeys.add(dateKey)
      if (activeFilter === 'images' && hasDiaryImages(value)) dayKeys.add(dateKey)
      if (activeFilter === 'all' && hasDiaryEntry(value)) dayKeys.add(dateKey)
    })

    events.forEach((event) => {
      if (activeFilter === 'tasks' || activeFilter === 'all') {
        dayKeys.add(event.date)
      }
    })

    checkins.forEach((checkin) => {
      if ((activeFilter === 'tasks' || activeFilter === 'all') && checkin.checked) {
        dayKeys.add(checkin.date)
      }
    })

    return Array.from(dayKeys)
      .sort()
      .map((dateKey) => {
        const entry = getDayEntry(notes[dateKey])
        const dayEvents = getEventsForDate(events, dateKey)
        const dayCheckins = checkins.filter((checkin) => checkin.date === dateKey && checkin.checked)

        return {
          key: dateKey,
          date: getDateFromKey(dateKey),
          note: entry.text.trim(),
          imageCount: entry.images.length,
          taskCount: dayEvents.length + dayCheckins.length,
        }
      })
  }, [activeFilter, checkins, events, notes])

  function hasTaskEntry(dateKey) {
    return events.some((event) => event.date === dateKey || (event.repeat === 'daily' && event.date <= dateKey))
      || checkins.some((checkin) => checkin.date === dateKey && checkin.checked)
  }

  function hasFilteredEntry(dateKey) {
    if (activeFilter === 'notes') return hasDiaryNote(notes[dateKey])
    if (activeFilter === 'images') return hasDiaryImages(notes[dateKey])
    if (activeFilter === 'tasks') return hasTaskEntry(dateKey)

    return hasDiaryEntry(notes[dateKey]) || hasTaskEntry(dateKey)
  }

  function selectFilter(filterId) {
    if (filterId === 'today') {
      setSelectedDate(today)
      setShowFilterMenu(false)
      setShowFilterResults(false)
      setShowMonthOverview(false)
      return
    }

    setActiveFilter(filterId)
    setShowFilterMenu(false)
    setShowMonthOverview(false)
    setShowFilterResults(true)
  }

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
      setShowImageUploader(false)
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
    setShowNoteEditor(false)
    setShowImageUploader(false)
    setShowMonthOverview(false)
  }

  function selectResultDay(date) {
    setSelectedDate(date)
    setShowNoteEditor(false)
    setShowImageUploader(false)
    setShowFilterResults(false)
  }

  function openMonthOverview() {
    setShowFilterResults(false)
    setShowMonthOverview(true)
  }

  useEffect(() => {
    if (!showMonthOverview) return

    requestAnimationFrame(() => {
      currentMonthRef.current?.scrollIntoView({ block: 'start' })
    })
  }, [showMonthOverview])

  useEffect(() => {
    setShowNoteEditor(false)
    setShowImageUploader(false)
  }, [selectedKey])

  return (
    <section className="screen calendar-screen">
      <header className="calendar-header">
        <button className="calendar-icon-button" type="button" aria-label="Filter ?ffnen" onClick={() => setShowFilterMenu(true)}>
          <MenuIcon />
        </button>
        <h1>Tagesbuch</h1>
        <button className="calendar-icon-button" type="button" aria-label="Monatsuebersicht oeffnen" onClick={() => setShowMonthOverview(true)}>
          <CalendarIcon />
        </button>
      </header>

      {showFilterMenu && (
        <section className="diary-filter-menu" aria-label="Tagesbuch Filter">
          <div className="diary-filter-backdrop" onClick={() => setShowFilterMenu(false)} />
          <div className="diary-filter-sheet">
            <div className="calendar-section-title">
              <span>Filter ausw?hlen</span>
              <small>Zeige: {activeFilterLabel}</small>
            </div>
            <div className="diary-filter-grid">
              {diaryFilters.map((filter) => (
                <button
                  className={`${activeFilter === filter.id ? 'active' : ''}`}
                  key={filter.id}
                  onClick={() => selectFilter(filter.id)}
                  type="button"
                >
                  <span>{filter.icon}</span>
                  <strong>{filter.label}</strong>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {showFilterResults && (
        <section className="diary-filter-results" aria-label={`${activeFilterLabel} im Tagesbuch`}>
          <div className="diary-filter-results-header">
            <div>
              <span>Gefilterte Tage</span>
              <h2>{activeFilterLabel}</h2>
            </div>
            <button type="button" onClick={() => setShowFilterResults(false)} aria-label="Filter schliessen">?</button>
          </div>
          <div className="diary-filter-results-list">
            {filterResultDays.length > 0 ? (
              filterResultDays.map((day) => (
                <button className="diary-filter-result-card" key={day.key} type="button" onClick={() => selectResultDay(day.date)}>
                  <time>
                    {day.date.getDate()}. {monthNames[day.date.getMonth()]} {day.date.getFullYear()}
                  </time>
                  <span>
                    {day.note || `${day.taskCount} Aufgaben / ${day.imageCount} Bilder`}
                  </span>
                  <small>
                    {day.note && 'Notiz'}
                    {day.note && (day.imageCount > 0 || day.taskCount > 0) && ' ? '}
                    {day.imageCount > 0 && `${day.imageCount} Bild${day.imageCount > 1 ? 'er' : ''}`}
                    {day.imageCount > 0 && day.taskCount > 0 && ' ? '}
                    {day.taskCount > 0 && `${day.taskCount} Aufgabe${day.taskCount > 1 ? 'n' : ''}`}
                  </small>
                </button>
              ))
            ) : (
              <div className="diary-filter-empty">
                <strong>Noch nichts gefunden</strong>
                <p>Speichere zuerst einen passenden Eintrag, dann erscheint er hier als Liste.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {showMonthOverview && (
        <section className="calendar-month-overview" aria-label="Monatsuebersicht">
          <div className="calendar-month-overview-header">
            <div>
              <span>Monatsuebersicht</span>
              <h2>Alle Monate</h2>
            </div>
            <button type="button" onClick={() => setShowMonthOverview(false)} aria-label="Monatsuebersicht schliessen">x</button>
          </div>
          <div className="calendar-month-list">
            {calendarMonths.map(({ year, month, id }) => (
              <article
                className={`calendar-full-month ${monthTones[month % monthTones.length]}`}
                key={id}
                ref={year === today.getFullYear() && month === today.getMonth() ? currentMonthRef : null}
              >
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
                    const hasEvents = hasFilteredEntry(day.key)

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

      <section className="calendar-date-card" aria-label="Wochenuebersicht">
        <div className="calendar-month-card">
        <button type="button" onClick={() => changeWeek(-1)} aria-label="Vorherige Woche">
          ⬹
        </button>
        <strong>{monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}</strong>
        <button type="button" onClick={() => changeWeek(1)} aria-label="N?chste Woche">
          ⬺
        </button>
        </div>

        <div className="calendar-week-card">
        {weekDays.map((day) => {
          const isToday = day.key === getLocalDateKey(today)
          const isSelected = day.key === selectedKey
          const hasEvents = hasFilteredEntry(day.key)

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
        </div>
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
            <span>T?glich wiederholen</span>
          </label>
          <div className="calendar-form-actions">
            <button className="secondary-button" type="button" onClick={() => setShowForm(false)}>Abbrechen</button>
            <button type="submit">Hinzuf?gen</button>
          </div>
        </form>
      )}

      <section className="calendar-note-card">
        <div className="calendar-section-title">
          <span>T?gliche Aufgaben</span>
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
              <strong>Aufgabe hinzuf?gen</strong>
            </button>
          )}
        </div>

        <div className="calendar-section-title">
          <span>Notiz zum Tag</span>
          <small>{selectedNote.trim() || selectedImages.length ? 'Gespeichert' : 'Optional'}</small>
        </div>
        <button
          className="diary-add-row note"
          type="button"
          onClick={() => {
            setShowNoteEditor(true)
            requestAnimationFrame(() => noteTextareaRef.current?.focus())
          }}
        >
          <span>+</span>
          <strong>Notiz zum Tag hinzuf?gen</strong>
        </button>
        {shouldShowNoteEditor && (
          <textarea
            ref={noteTextareaRef}
            value={selectedNote}
            onChange={(event) => updateNote(event.target.value)}
            placeholder="z. B. Heute auf genug Pausen achten..."
          />
        )}
        <div className="diary-images-header">
          <span>Bilder zum Tag</span>
          <small>{selectedImages.length}/3</small>
        </div>
        <div className="diary-image-grid">
          {selectedImages.map((image, index) => (
            <figure className="diary-image-card" key={`${image.slice(0, 24)}-${index}`}>
              <img src={image} alt={`Tagesbild ${index + 1}`} />
              <button type="button" onClick={() => removeImage(index)} aria-label={`Bild ${index + 1} entfernen`}>?</button>
            </figure>
          ))}
          {selectedImages.length < 3 && (
            <button className="diary-add-row images" type="button" onClick={() => setShowImageUploader(true)}>
              <span>+</span>
              <strong>Bilder zum Tag hinzuf?gen</strong>
            </button>
          )}
          {shouldShowImageUploader && (
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
              <img className="diary-upload-light-icon" src={uploadIcon} alt="" />
              <img className="diary-upload-dark-icon" src={uploadIconDark} alt="" />
            </label>
          )}
        </div>
      </section>

      <section className="calendar-timeline-card">
        <div className="calendar-section-title">
          <span>Heute geplant</span>
          <small>{selectedEvents.length + selectedCheckins.length} Eintr?ge</small>
        </div>
        <div className="calendar-timeline">
          {selectedEvents.length > 0 || selectedCheckins.length > 0 ? (
            <>
            {selectedEvents.map((event) => (
              <article className={`calendar-event-card ${event.tone} ${isEventDone(event) ? 'done' : ''}`} key={event.id}>
                <time>{event.time}</time>
                <span className="calendar-event-icon">?</span>
                <div>
                  <strong>{event.title}</strong>
                  <small>{event.repeat === 'daily' ? 'T?glich wiederholt' : 'Manuell hinzugef?gt'}</small>
                </div>
                <button
                  className="calendar-check-button"
                  type="button"
                  onClick={() => toggleEvent(event.id)}
                  aria-label={`${event.title} abhaken`}
                >
                  {isEventDone(event) && '\u2713'}
                </button>
              </article>
            ))}
            {selectedCheckins.map((checkin) => (
              <article className="calendar-event-card blue done" key={`checkin-${checkin.id}`}>
                <time>{checkin.time || '--:--'}</time>
                <span className="calendar-event-icon">?</span>
                <div>
                  <strong>{checkin.title}</strong>
                  <small>Eingecheckt</small>
                </div>
                <span className="calendar-check-button" aria-label={`${checkin.title} eingecheckt`}>?</span>
              </article>
            ))}
            </>
          ) : (
            <div className="calendar-empty-state">
              <strong>Noch nichts geplant</strong>
              <p>F?ge ?ber den Plus-Button Gewohnheiten und Erinnerungen für diesen Tag hinzu.</p>
            </div>
          )}
        </div>
      </section>

      <button className="calendar-fab" type="button" onClick={() => setShowForm(true)} aria-label="Termin hinzuf?gen">
        +
      </button>
    </section>
  )
}

export default Kalender
