const icons = {
  dashboard: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9.5Z" />
    </svg>
  ),
  habits: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 7h12" />
      <path d="M8 12h12" />
      <path d="M8 17h12" />
      <path d="m3.5 7 1.2 1.2L7 5.8" />
      <path d="m3.5 12 1.2 1.2L7 10.8" />
      <path d="m3.5 17 1.2 1.2L7 15.8" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3v3" />
      <path d="M17 3v3" />
      <path d="M4 9h16" />
      <path d="M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
      <path d="M8 13h2" />
      <path d="M14 13h2" />
      <path d="M8 17h2" />
    </svg>
  ),
  progress: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 19V9" />
      <path d="M12 19V5" />
      <path d="M19 19v-7" />
      <path d="M3 19h18" />
    </svg>
  ),
  freunde: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M17 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path d="M3.5 20c.6-4 2.6-6 5.5-6s4.9 2 5.5 6" />
      <path d="M14.5 15c2.7.2 4.5 1.9 5 5" />
    </svg>
  ),
  ai: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3.5 13.4 8l4.1 1.5-4.1 1.5L12 15.5 10.6 11 6.5 9.5 10.6 8 12 3.5Z" />
      <path d="M18 14.5 18.8 17l2.2.8-2.2.8L18 21l-.8-2.4-2.2-.8 2.2-.8.8-2.5Z" />
      <path d="M5.5 13.5 6.2 16l2.3.8-2.3.8-.7 2.4-.7-2.4-2.3-.8 2.3-.8.7-2.5Z" />
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M4.5 21c.8-4.3 3.5-6.5 7.5-6.5s6.7 2.2 7.5 6.5" />
    </svg>
  ),
}

function Navbar({ activeScreen, items, onNavigate }) {
  return (
    <nav className="bottom-nav">
      {items.map((item) => (
        <button
          className={activeScreen === item.id ? 'bottom-item active' : 'bottom-item'}
          key={item.id}
          onClick={() => onNavigate(item.id)}
        >
          <span className="bottom-icon">{icons[item.id]}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

export default Navbar
