export function getLocalDateKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function findCheckin(checkins, routineId, date = getLocalDateKey()) {
  return checkins.find((checkin) => (
    String(checkin.routineId ?? checkin.habitId) === String(routineId)
    && checkin.date === date
    && checkin.checked === true
  ))
}
