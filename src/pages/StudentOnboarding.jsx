import { useState } from 'react'
import { getProfileAgeError, MAX_PROFILE_AGE, MIN_PROFILE_AGE } from '../utils/profileValidation'

const statusOptions = [
  { value: 'school', label: 'Schüler:in' },
  { value: 'university', label: 'Student:in' },
  { value: 'training', label: 'Auszubildende:r' },
  { value: 'other', label: 'Sonstiges' },
]

const ageGroups = [
  ['under_16', 'Unter 16'],
  ['16_18', '16-18'],
  ['19_24', '19-24'],
  ['25_34', '25-34'],
  ['35_plus', '35 oder älter'],
  ['prefer_not_to_say', 'Keine Angabe'],
]

const genderOptions = [
  ['female', 'Weiblich'],
  ['male', 'Männlich'],
  ['diverse', 'Divers'],
]

const activityOptions = [
  ['low', 'Wenig aktiv'],
  ['medium', 'Normal aktiv'],
  ['high', 'Sehr aktiv'],
]

const languageOptions = [
  ['german', 'Deutsch'],
  ['english', 'English'],
  ['turkish', 'Türkçe'],
  ['arabic', 'العربية'],
]

const communicationOptions = [
  ['casual', 'Locker'],
  ['formal', 'Formal'],
]

const designOptions = [
  ['Hell', 'Hell'],
  ['Dunkel', 'Dunkel'],
]

const educationOptions = {
  school: {
    question: 'Welche Schulstufe passt am besten?',
    field: 'education_level',
    options: [
      ['lower_school', 'Unterstufe'],
      ['middle_school', 'Mittelstufe'],
      ['upper_school', 'Oberstufe'],
      ['vocational_school', 'Berufsschule'],
      ['other', 'Andere'],
    ],
  },
  university: {
    question: 'Wo studierst du aktuell?',
    field: 'education_level',
    options: [
      ['university', 'Universität'],
      ['university_of_applied_sciences', 'Fachhochschule'],
      ['dual_university', 'Duale Hochschule'],
      ['remote_study', 'Fernstudium'],
      ['other', 'Andere'],
    ],
  },
  training: {
    question: 'Welche Ausbildungsform passt am besten?',
    field: 'education_level',
    options: [
      ['company_training', 'Betriebliche Ausbildung'],
      ['school_training', 'Schulische Ausbildung'],
      ['dual_study', 'Duales Studium'],
      ['other', 'Andere'],
    ],
  },
  other: {
    question: 'Wie sieht dein Alltag hauptsächlich aus?',
    field: 'daily_context',
    options: [
      ['school', 'Schule'],
      ['study', 'Studium'],
      ['training', 'Ausbildung'],
      ['work', 'Arbeit'],
      ['transition', 'Übergangsphase'],
      ['other', 'Andere'],
    ],
  },
}

const challengeOptions = [
  ['exam_stress', 'Prüfungsstress'],
  ['concentration', 'Konzentrationsprobleme'],
  ['missing_learning_routine', 'fehlende Lernroutine'],
  ['low_motivation', 'wenig Motivation'],
  ['too_little_recovery', 'zu wenig Erholung'],
  ['difficult_day_structure', 'schwierige Tagesstruktur'],
  ['sleep_problems', 'Schlafprobleme'],
  ['mental_exhaustion', 'mentale Erschöpfung'],
  ['physical_tiredness', 'körperliche Müdigkeit'],
  ['too_many_tasks', 'zu viele Aufgaben gleichzeitig'],
  ['study_life_balance', 'Balance zwischen Lernen und Freizeit'],
  ['other', 'Sonstiges'],
]

const goalOptions = [
  ['better_day_structure', 'bessere Tagesstruktur'],
  ['build_learning_routine', 'Lernroutine aufbauen'],
  ['reduce_stress', 'Stress reduzieren'],
  ['more_breaks', 'mehr Pausen machen'],
  ['improve_sleep', 'Schlaf verbessern'],
  ['increase_focus', 'Fokus steigern'],
  ['strengthen_motivation', 'Motivation stärken'],
  ['healthy_habits', 'gesunde Gewohnheiten aufbauen'],
  ['show_progress', 'Fortschritt sichtbar machen'],
  ['regular_checkins', 'regelmäßige Check-ins'],
]

const emptyAnswers = {
  gender: '',
  display_name: '',
  age: '',
  height_cm: '',
  weight_kg: '',
  activity_level: '',
  student_status: '',
  age_group: '',
  education_level: '',
  daily_context: '',
  main_challenges: [],
  support_goals: [],
  language_style: 'german',
  communication_style: 'casual',
  theme: 'Hell',
  onboarding_completed: true,
}

function toggleListValue(list, value) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

function OptionCard({ active, children, onClick, type = 'button' }) {
  return (
    <button className={`student-onboarding-option ${active ? 'selected' : ''}`} onClick={onClick} type={type}>
      {children}
      <span aria-hidden="true">{active ? '✓' : ''}</span>
    </button>
  )
}

function StudentOnboarding({ includePreferences = false, initialAnswers = {}, mode = 'register', onBack, onComplete, saving = false }) {
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [answers, setAnswers] = useState({ ...emptyAnswers, ...initialAnswers })
  const education = educationOptions[answers.student_status] ?? educationOptions.school
  const steps = mode === 'quickStart'
    ? ['name', 'personal', 'activity', 'situation', 'preferences']
    : includePreferences
    ? ['status', 'education', 'challenges', 'goals']
    : ['personal', 'status', 'education']
  const currentStep = steps[step]
  const progress = Math.round(((step + 1) / steps.length) * 100)
  const secondaryAudience = false

  function update(key, value) {
    setError('')
    setAnswers((current) => ({ ...current, [key]: value }))
  }

  function validate() {
    if (currentStep === 'personal') {
      const ageError = getProfileAgeError(answers.age)
      if (ageError) return ageError
    }
    if (currentStep === 'name' && !answers.display_name.trim()) return 'Bitte gib deinen Namen ein.'
    if (currentStep === 'personal' && !answers.gender) return 'Bitte wähle dein Geschlecht aus.'
    if (currentStep === 'personal' && (!answers.height_cm || Number(answers.height_cm) <= 0)) return 'Bitte gib deine Größe an.'
    if (currentStep === 'personal' && answers.weight_kg && Number(answers.weight_kg) <= 0) return 'Bitte gib ein gültiges Gewicht an.'
    if (currentStep === 'activity' && !answers.activity_level) return 'Bitte wähle deine Aktivität aus.'
    if (currentStep === 'situation' && !answers.daily_context) return 'Bitte wähle deine Situation aus.'
    if (currentStep === 'status' && !answers.student_status) return 'Bitte wähle eine Option aus.'
    if (currentStep === 'challenges' && answers.main_challenges.length === 0) return 'Bitte wähle mindestens eine Option aus.'
    if (currentStep === 'goals' && answers.support_goals.length === 0) return 'Bitte wähle mindestens ein Unterstützungsziel aus.'
    if (currentStep === 'education' && !answers.age_group) return 'Bitte wähle deine Altersgruppe aus.'
    if (currentStep === 'education' && !answers[education.field]) return 'Bitte wähle eine passende Bildungsangabe aus.'
    return ''
  }

  function goBack() {
    if (step === 0) {
      onBack?.()
      return
    }

    setStep((current) => Math.max(current - 1, 0))
    setError('')
  }

  async function goNext() {
    const validation = validate()
    if (validation) {
      setError(validation)
      return
    }

    if (step === steps.length - 1) {
      try {
        await onComplete?.({ ...answers, onboarding_completed: true })
      } catch (err) {
        setError(err.message || 'Deine Angaben konnten nicht gespeichert werden. Bitte versuche es erneut.')
      }
      return
    }

    setStep((current) => Math.min(current + 1, steps.length - 1))
    setError('')
  }

  return (
    <section className="screen student-onboarding-screen">
      <button className="login-back" onClick={goBack} aria-label="Zurück" type="button">&larr;</button>
      <div className="student-onboarding-progress" aria-label={`Schritt ${step + 1} von ${steps.length}`}>
        <span style={{ width: `${progress}%` }} />
      </div>

      {currentStep === 'intro' && (
        <div className="student-onboarding-panel">
          <p className="eyebrow">MYFLOW FÜR SCHULE & STUDIUM</p>
          <h1>MyFlow begleitet dich durch deinen Schul- oder Studienalltag.</h1>
          <p>Die App ist für Schüler:innen und Studierende entwickelt, die Stress reduzieren, ihren Alltag strukturieren und gesunde Routinen aufbauen möchten.</p>
          <div className="student-benefit-list">
            {[
              'Lern- und Prüfungsstress besser einordnen',
              'Tagesroutinen übersichtlich organisieren',
              'Erholung und Konzentration bewusster planen',
              'persönliche Check-ins und passende Aufgaben erhalten',
            ].map((benefit) => <span key={benefit}>{benefit}</span>)}
          </div>
        </div>
      )}

      {currentStep === 'status' && (
        <div className="student-onboarding-panel">
          <p className="eyebrow">AKTUELLE SITUATION</p>
          <h1>Was beschreibt dich aktuell am besten?</h1>
          <div className="student-onboarding-grid status-options-grid">
            {statusOptions.map((option) => (
              <OptionCard active={answers.student_status === option.value} key={option.value} onClick={() => update('student_status', option.value)}>
                <strong>{option.label}</strong>
              </OptionCard>
            ))}
          </div>
          {secondaryAudience && <p className="student-onboarding-note">MyFlow ist aktuell besonders auf Schule und Studium ausgerichtet. Einige Inhalte passen möglicherweise nicht vollständig zu deiner Situation.</p>}
        </div>
      )}

      {currentStep === 'name' && (
        <div className="student-onboarding-panel">
          <p className="eyebrow">DEIN START</p>
          <h1>Wie dürfen wir dich nennen?</h1>
          <label className="student-onboarding-label">
            Name
            <input
              onChange={(event) => update('display_name', event.target.value)}
              placeholder="Dein Name"
              type="text"
              value={answers.display_name ?? ''}
            />
          </label>
        </div>
      )}

      {currentStep === 'personal' && (
        <div className="student-onboarding-panel">
          <p className="eyebrow">DEIN PROFIL</p>
          <h1>Erzähl uns kurz etwas über dich.</h1>
          <label className="student-onboarding-label">
            Geschlecht
            <div className="student-chip-grid">
              {genderOptions.map(([value, label]) => (
                <OptionCard active={answers.gender === value} key={value} onClick={() => update('gender', value)}>
                  <strong>{label}</strong>
                </OptionCard>
              ))}
            </div>
          </label>
          <label className="student-onboarding-label">
            Alter in Jahren
            <input
              inputMode="numeric"
              min={MIN_PROFILE_AGE}
              max={MAX_PROFILE_AGE}
              onChange={(event) => update('age', event.target.value)}
              placeholder="z. B. 21"
              step="1"
              type="number"
              value={answers.age ?? ''}
            />
          </label>
          <label className="student-onboarding-label">
            Größe in cm
            <input
              inputMode="numeric"
              min="1"
              onChange={(event) => update('height_cm', event.target.value)}
              placeholder="z. B. 175"
              type="number"
              value={answers.height_cm ?? ''}
            />
          </label>
          <label className="student-onboarding-label">
            Gewicht in kg (optional)
            <input
              inputMode="decimal"
              min="1"
              onChange={(event) => update('weight_kg', event.target.value)}
              placeholder="z. B. 70"
              step="0.1"
              type="number"
              value={answers.weight_kg ?? ''}
            />
          </label>
          {!answers.weight_kg && (
            <p className="student-onboarding-note">
              Ohne Gewichtsangabe sind manche Funktionen der App nicht verfügbar.
            </p>
          )}
        </div>
      )}

      {currentStep === 'education' && (
        <div className="student-onboarding-panel">
          <p className="eyebrow">BILDUNGSWEG</p>
          <h1>Welche Angaben passen zu dir?</h1>
          <label className="student-onboarding-label">
            Altersgruppe
            <div className="student-chip-grid">
              {ageGroups.map(([value, label]) => (
                <OptionCard active={answers.age_group === value} key={value} onClick={() => update('age_group', value)}>
                  <strong>{label}</strong>
                </OptionCard>
              ))}
            </div>
          </label>
          <label className="student-onboarding-label">
            {education.question}
            <div className="student-chip-grid">
              {education.options.map(([value, label]) => (
                <OptionCard active={answers[education.field] === value} key={value} onClick={() => update(education.field, value)}>
                  <strong>{label}</strong>
                </OptionCard>
              ))}
            </div>
          </label>
        </div>
      )}

      {currentStep === 'activity' && (
        <div className="student-onboarding-panel">
          <p className="eyebrow">AKTIVITÄT</p>
          <h1>Wie aktiv bist du meistens?</h1>
          <div className="student-chip-grid">
            {activityOptions.map(([value, label]) => (
              <OptionCard active={answers.activity_level === value} key={value} onClick={() => update('activity_level', value)}>
                <strong>{label}</strong>
              </OptionCard>
            ))}
          </div>
        </div>
      )}

      {currentStep === 'situation' && (
        <div className="student-onboarding-panel">
          <p className="eyebrow">SITUATION</p>
          <h1>Was beschreibt deinen Alltag am besten?</h1>
          <div className="student-chip-grid">
            {educationOptions.other.options.map(([value, label]) => (
              <OptionCard active={answers.daily_context === value} key={value} onClick={() => update('daily_context', value)}>
                <strong>{label}</strong>
              </OptionCard>
            ))}
          </div>
        </div>
      )}

      {currentStep === 'preferences' && (
        <div className="student-onboarding-panel">
          <p className="eyebrow">APP EINSTELLEN</p>
          <h1>Wie soll MyFlow sich anfühlen?</h1>
          <label className="student-onboarding-label">
            Sprache
            <div className="student-chip-grid">
              {languageOptions.map(([value, label]) => (
                <OptionCard active={answers.language_style === value} key={value} onClick={() => update('language_style', value)}>
                  <strong>{label}</strong>
                </OptionCard>
              ))}
            </div>
          </label>
          <label className="student-onboarding-label">
            Kommunikationsstil
            <div className="student-chip-grid">
              {communicationOptions.map(([value, label]) => (
                <OptionCard active={answers.communication_style === value} key={value} onClick={() => update('communication_style', value)}>
                  <strong>{label}</strong>
                </OptionCard>
              ))}
            </div>
          </label>
          <label className="student-onboarding-label">
            Design
            <div className="student-chip-grid">
              {designOptions.map(([value, label]) => (
                <OptionCard active={answers.theme === value} key={value} onClick={() => update('theme', value)}>
                  <strong>{label}</strong>
                </OptionCard>
              ))}
            </div>
          </label>
        </div>
      )}

      {currentStep === 'challenges' && (
        <div className="student-onboarding-panel">
          <p className="eyebrow">BELASTUNGEN</p>
          <h1>Was beschäftigt dich aktuell am meisten?</h1>
          <div className="student-chip-grid">
            {challengeOptions.map(([value, label]) => (
              <OptionCard active={answers.main_challenges.includes(value)} key={value} onClick={() => update('main_challenges', toggleListValue(answers.main_challenges, value))}>
                <strong>{label}</strong>
              </OptionCard>
            ))}
          </div>
        </div>
      )}

      {currentStep === 'goals' && (
        <div className="student-onboarding-panel">
          <p className="eyebrow">UNTERSTÜTZUNG</p>
          <h1>Wobei soll MyFlow dich besonders unterstützen?</h1>
          <div className="student-chip-grid">
            {goalOptions.map(([value, label]) => (
              <OptionCard active={answers.support_goals.includes(value)} key={value} onClick={() => update('support_goals', toggleListValue(answers.support_goals, value))}>
                <strong>{label}</strong>
              </OptionCard>
            ))}
          </div>
        </div>
      )}

      {error && <p className="student-onboarding-error">{error}</p>}

      <div className="student-onboarding-actions">
        <button className="secondary-button" onClick={goBack} type="button" disabled={saving}>Zurück</button>
        <button onClick={goNext} type="button" disabled={saving}>
          {saving ? 'Wird gespeichert...' : step === steps.length - 1 ? (mode === 'profile' ? 'Speichern und weiter' : 'Zur Registrierung') : 'Weiter'}
        </button>
      </div>
    </section>
  )
}

export default StudentOnboarding
