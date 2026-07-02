export const checkInQuestions = [
  {
    id: 'general_mood',
    label: 'Allgemeines Befinden',
    question: 'Wie fühlst du dich heute?',
    options: [
      { value: 'very_bad', label: 'sehr schlecht', score: 1 },
      { value: 'bad', label: 'schlecht', score: 2 },
      { value: 'neutral', label: 'neutral', score: 3 },
      { value: 'good', label: 'gut', score: 4 },
      { value: 'very_good', label: 'sehr gut', score: 5 },
    ],
  },
  {
    id: 'stress_level',
    label: 'Stress',
    question: 'Hattest du heute viel Stress?',
    options: [
      { value: 'none', label: 'kein Stress', score: 1 },
      { value: 'low', label: 'wenig Stress', score: 2 },
      { value: 'medium', label: 'mittel', score: 3 },
      { value: 'high', label: 'viel Stress', score: 4 },
      { value: 'very_high', label: 'sehr viel Stress', score: 5 },
    ],
  },
  {
    id: 'tiredness_level',
    label: 'Müdigkeit',
    question: 'Wie müde fühlst du dich?',
    options: [
      { value: 'none', label: 'gar nicht müde', score: 1 },
      { value: 'low', label: 'etwas müde', score: 2 },
      { value: 'medium', label: 'mittel', score: 3 },
      { value: 'high', label: 'sehr müde', score: 4 },
      { value: 'exhausted', label: 'erschöpft', score: 5 },
    ],
  },
  {
    id: 'physical_energy',
    label: 'Körperliche Energie',
    question: 'Wie fit fühlst du dich körperlich?',
    options: [
      { value: 'very_low', label: 'sehr schwach', score: 1 },
      { value: 'low', label: 'eher schwach', score: 2 },
      { value: 'medium', label: 'normal', score: 3 },
      { value: 'high', label: 'fit', score: 4 },
      { value: 'very_high', label: 'sehr fit', score: 5 },
    ],
  },
  {
    id: 'mental_energy',
    label: 'Mentale Energie',
    question: 'Wie viel mentale Kraft hast du aktuell?',
    options: [
      { value: 'none', label: 'keine Kraft', score: 1 },
      { value: 'low', label: 'wenig Kraft', score: 2 },
      { value: 'medium', label: 'mittel', score: 3 },
      { value: 'high', label: 'viel Kraft', score: 4 },
      { value: 'very_high', label: 'sehr viel Kraft', score: 5 },
    ],
  },
  {
    id: 'concentration_level',
    label: 'Konzentration',
    question: 'Wie gut kannst du dich gerade konzentrieren?',
    options: [
      { value: 'none', label: 'gar nicht', score: 1 },
      { value: 'low', label: 'schlecht', score: 2 },
      { value: 'medium', label: 'mittel', score: 3 },
      { value: 'high', label: 'gut', score: 4 },
      { value: 'very_high', label: 'sehr gut', score: 5 },
    ],
  },
  {
    id: 'mood_tags',
    multiple: true,
    label: 'Stimmung',
    question: 'Welche Stimmung beschreibt dich heute am besten?',
    options: [
      { value: 'calm', label: 'ruhig' },
      { value: 'tense', label: 'angespannt' },
      { value: 'sad', label: 'traurig' },
      { value: 'irritated', label: 'gereizt' },
      { value: 'motivated', label: 'motiviert' },
      { value: 'overwhelmed', label: 'überfordert' },
      { value: 'balanced', label: 'ausgeglichen' },
    ],
  },
  {
    id: 'available_time',
    label: 'Verfügbare Zeit',
    question: 'Wie viel Zeit möchtest du heute investieren?',
    options: [
      { value: '2', label: '2 Minuten', minutes: 2 },
      { value: '5', label: '5 Minuten', minutes: 5 },
      { value: '10', label: '10 Minuten', minutes: 10 },
      { value: '15', label: '15 Minuten', minutes: 15 },
      { value: '20', label: '20 Minuten oder mehr', minutes: 20 },
    ],
  },
  {
    id: 'support_goal',
    multiple: true,
    label: 'Art der Unterstützung',
    question: 'Was würde dir gerade am meisten helfen?',
    options: [
      { value: 'relaxation', label: 'Entspannung' },
      { value: 'movement', label: 'Bewegung' },
      { value: 'focus', label: 'Fokus' },
      { value: 'motivation', label: 'Motivation' },
      { value: 'emotional_relief', label: 'emotionale Entlastung' },
      { value: 'energy', label: 'Energie' },
      { value: 'sleep_preparation', label: 'Schlafvorbereitung' },
    ],
  },
]

export function getQuestionById(questionId) {
  return checkInQuestions.find((question) => question.id === questionId)
}
