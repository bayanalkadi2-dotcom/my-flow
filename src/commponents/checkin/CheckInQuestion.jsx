function CheckInQuestion({ question, selectedValue, onSelect }) {
  const selectedValues = question.multiple
    ? (Array.isArray(selectedValue) ? selectedValue : [])
    : [selectedValue]

  return (
    <section className="checkin-question-card" aria-labelledby={`checkin-question-${question.id}`}>
      <p className="eyebrow">{question.label}</p>
      <h1 id={`checkin-question-${question.id}`}>{question.question}</h1>
      <div
        className="checkin-options"
        role="listbox"
        aria-label={question.question}
        aria-multiselectable={question.multiple || undefined}
      >
        {question.options.map((option) => (
          <button
            aria-selected={selectedValues.includes(option.value)}
            className={`checkin-option ${selectedValues.includes(option.value) ? 'selected' : ''}`}
            key={option.value}
            onClick={() => onSelect(question.id, option.value, question.multiple)}
            role="option"
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
