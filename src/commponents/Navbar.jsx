function Navbar({ activeScreen, items, onNavigate }) {
  return (
    <nav className="bottom-nav">
      {items.map((item) => (
        <button
          className={activeScreen === item.id ? 'bottom-item active' : 'bottom-item'}
          key={item.id}
          onClick={() => onNavigate(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  )
}

export default Navbar
