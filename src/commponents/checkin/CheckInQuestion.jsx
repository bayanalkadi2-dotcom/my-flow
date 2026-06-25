function CheckInQuestion({ question, selectedValue, onSelect }) {
  return (
    <section className="checkin-question-card" aria-labelledby={`checkin-question-${question.id}`}>
      <p className="eyebrow">{question.label}</p>
      <h1 id={`checkin-question-${question.id}`}>{question.question}</h1>
      <div className="checkin-options" role="listbox" aria-label={question.question}>
        {question.options.map((option) => (
          <button
            className={`checkin-option ${selectedValue === option.value ? 'selected' : ''}`}
            key={option.value}
            onClick={() => onSelect(question.id, option.value)}
            type="button"
          >
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

export default CheckInQuestion
