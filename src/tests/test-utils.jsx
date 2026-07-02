import { render } from '@testing-library/react'
import { translations } from '../i18n'

export const t = translations.german

export const defaultProfileMock = {
  personalization: { status: 'other' },
  personalizedTexts: {
    checkInIntro: 'Wie geht es dir heute?',
    contextLabel: 'Alltag',
    dashboardSubtitle: 'Plane deine Aufgaben und Routinen.',
    homeQuestion: 'Wie laeuft dein Tag?',
    routinesTitle: 'Meine Routinen',
  },
  profile: {},
  profileSituation: {
    userType: 'Student:in',
    educationLevel: 'Universitaet',
    challenges: ['Pruefungsstress'],
    supportGoals: ['Fokus'],
  },
  routineSuggestions: [],
}

export function renderWithDefaults(ui) {
  return render(ui)
}
