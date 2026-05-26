function PasswordVisibilityButton({ visible, onClick }) {
  return (
    <button
      className="visibility-button"
      type="button"
      onClick={onClick}
      aria-label={visible ? 'Passwort verbergen' : 'Passwort anzeigen'}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M2.8 12s3.3-6 9.2-6 9.2 6 9.2 6-3.3 6-9.2 6-9.2-6-9.2-6Z" />
        <circle cx="12" cy="12" r="2.7" />
      </svg>
    </button>
  )
}

export default PasswordVisibilityButton
