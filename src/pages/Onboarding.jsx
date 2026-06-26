import { useEffect, useState } from 'react'

const onboardingSlides = [
  {
    title: 'Willkommen bei MyFlow',
    text: 'Baue gesunde Gewohnheiten auf und finde deinen persönlichen Flow.',
    illustration: 'dashboard',
  },
  {
    title: 'Persönliche Routinen',
    text: 'Erstelle individuelle Ziele für Wasser, Schlaf, Sport und weitere Gewohnheiten.',
    illustration: 'routines',
  },
  {
    title: 'Fortschritte verfolgen',
    text: 'Sieh deine Statistiken und erkenne deine Erfolge Tag für Tag.',
    illustration: 'progress',
  },
  {
    title: 'Erinnerungen',
    text: 'Bleibe motiviert und erhalte hilfreiche Erinnerungen.',
    illustration: 'reminders',
  },
  {
    title: 'Freunde & Motivation',
    text: 'Teile deine Fortschritte und motiviere dich gemeinsam mit Freunden.',
    illustration: 'friends',
  },
  {
    title: 'Starte deinen Flow',
    text: 'Erstelle deine erste Routine und beginne noch heute.',
    illustration: 'start',
  },
]

function OnboardingIllustration({ type }) {
  if (type === 'routines') {
    return (
      <svg className="onboarding-line-art" viewBox="0 0 260 220" role="img" aria-label="Checkliste und Kalender">
        <rect className="art-glass" x="42" y="34" width="132" height="152" rx="28" />
        <rect className="art-fill-soft" x="84" y="18" width="132" height="132" rx="30" />
        <path className="art-line" d="M76 76h68M76 112h68M76 148h44" />
        <path className="art-line art-line-accent" d="m52 76 10 10 18-24M52 112l10 10 18-24M52 148l10 10 18-24" />
        <path className="art-line" d="M124 52h70M144 78h30M144 104h40" />
      </svg>
    )
  }

  if (type === 'progress') {
    return (
      <svg className="onboarding-line-art" viewBox="0 0 260 220" role="img" aria-label="Statistiken und Fortschritt">
        <rect className="art-glass" x="34" y="34" width="192" height="152" rx="32" />
        <path className="art-line" d="M66 154V96M112 154V66M158 154v-42M204 154V84" />
        <path className="art-line art-line-accent" d="M62 138c30-34 54-38 80-18 24 18 42 10 64-28" />
        <path className="art-fill-line" d="M64 176h132" />
        <circle className="art-dot" cx="158" cy="112" r="8" />
      </svg>
    )
  }

  if (type === 'reminders') {
    return (
      <svg className="onboarding-line-art" viewBox="0 0 260 220" role="img" aria-label="Erinnerungen und Timer">
        <rect className="art-fill-soft" x="50" y="42" width="160" height="108" rx="30" />
        <rect className="art-glass" x="36" y="72" width="188" height="106" rx="30" />
        <path className="art-line" d="M74 112h82M74 140h54" />
        <circle className="art-line" cx="184" cy="126" r="24" />
        <path className="art-line art-line-accent" d="M184 112v16l12 8" />
        <path className="art-fill-line" d="M94 42h72" />
      </svg>
    )
  }

  if (type === 'friends') {
    return (
      <svg className="onboarding-line-art" viewBox="0 0 260 220" role="img" aria-label="Community und Aktivitätsfeed">
        <rect className="art-glass" x="36" y="42" width="188" height="136" rx="32" />
        <circle className="art-fill-soft" cx="92" cy="94" r="28" />
        <circle className="art-fill-soft" cx="156" cy="86" r="22" />
        <path className="art-line art-line-accent" d="M62 146c8-24 24-36 48-36s40 12 48 36" />
        <path className="art-line" d="M138 132c8-16 22-24 42-24 18 0 32 8 40 24" />
        <path className="art-fill-line" d="M70 166h88M174 166h24" />
      </svg>
    )
  }

  if (type === 'start') {
    return (
      <svg className="onboarding-line-art" viewBox="0 0 260 220" role="img" aria-label="Ziele und Startbildschirm">
        <rect className="art-glass" x="58" y="24" width="144" height="172" rx="34" />
        <path className="art-line art-line-accent" d="M96 88h68M96 118h48M96 148h72" />
        <circle className="art-dot" cx="78" cy="88" r="7" />
        <circle className="art-dot" cx="78" cy="118" r="7" />
        <circle className="art-dot" cx="78" cy="148" r="7" />
        <path className="art-line" d="M108 56h44" />
        <path className="art-fill-line" d="M92 176h76" />
      </svg>
    )
  }

  return (
    <svg className="onboarding-line-art" viewBox="0 0 260 220" role="img" aria-label="Modernes Dashboard">
      <rect className="art-fill-soft" x="48" y="32" width="164" height="140" rx="34" />
      <rect className="art-glass" x="32" y="58" width="112" height="120" rx="30" />
      <rect className="art-glass" x="154" y="48" width="74" height="58" rx="22" />
      <rect className="art-glass" x="154" y="118" width="74" height="58" rx="22" />
      <path className="art-line art-line-accent" d="M60 126c18-34 34-40 52-18 10 12 20 16 34 4" />
      <path className="art-fill-line" d="M62 88h52M62 154h36M172 78h30M172 148h24" />
    </svg>
  )
}

function Onboarding({ onFinish }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [animationKey, setAnimationKey] = useState(0)
  const slide = onboardingSlides[currentSlide]
  const isFirstSlide = currentSlide === 0
  const isLastSlide = currentSlide === onboardingSlides.length - 1

  useEffect(() => {
    setAnimationKey((current) => current + 1)
  }, [currentSlide])

  function finishOnboarding() {
    localStorage.setItem('hasSeenOnboarding', 'true')
    onFinish()
  }

  function goToPreviousSlide() {
    setCurrentSlide((current) => Math.max(current - 1, 0))
  }

  function goToNextSlide() {
    if (isLastSlide) {
      finishOnboarding()
      return
    }

    setCurrentSlide((current) => Math.min(current + 1, onboardingSlides.length - 1))
  }

  return (
    <section className="onboarding-screen" aria-labelledby="onboarding-title">
      <button className="onboarding-skip-button" type="button" onClick={finishOnboarding}>
        Überspringen
      </button>

      <div className="onboarding-visual" key={`visual-${animationKey}`}>
        <div className="onboarding-panel onboarding-panel-back" />
        <div className="onboarding-panel onboarding-panel-mid" />
        <div className="onboarding-flow-card">
          <OnboardingIllustration type={slide.illustration} />
        </div>
      </div>

      <div className="onboarding-copy" key={`copy-${animationKey}`}>
        <p className="onboarding-step">
          {currentSlide + 1} von {onboardingSlides.length}
        </p>
        <h1 id="onboarding-title">{slide.title}</h1>
        <p>{slide.text}</p>
      </div>

      <div className="onboarding-footer">
        <div className="onboarding-dots" aria-label={`Slide ${currentSlide + 1} von ${onboardingSlides.length}`}>
          {onboardingSlides.map((item, index) => (
            <button
              aria-label={`Zu Slide ${index + 1} wechseln`}
              aria-current={index === currentSlide ? 'step' : undefined}
              className={index === currentSlide ? 'onboarding-dot active' : 'onboarding-dot'}
              key={item.title}
              onClick={() => setCurrentSlide(index)}
              type="button"
            />
          ))}
        </div>

        <div className="onboarding-actions">
          <button
            className="onboarding-back-button"
            disabled={isFirstSlide}
            onClick={goToPreviousSlide}
            type="button"
          >
            Zurück
          </button>
          <button className="onboarding-next-button" onClick={goToNextSlide} type="button">
            {isLastSlide ? 'Los geht’s' : 'Weiter'}
          </button>
        </div>
      </div>
    </section>
  )
}

export default Onboarding
