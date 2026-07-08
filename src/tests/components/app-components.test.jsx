import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import DailyCheckIn from '../../commponents/checkin/DailyCheckIn'
import Navbar from '../../commponents/Navbar'
import DashboardHome from '../../pages/DashboardHome'
import Einloggen from '../../pages/Einloggen'
import Kalender from '../../pages/Kalender'
import Profil from '../../pages/Profil'
import Registrieren from '../../pages/Registrieren'
import Routinen from '../../pages/Routinen'
import StudentOnboarding from '../../pages/StudentOnboarding'
import { defaultProfileMock, renderWithDefaults, t } from '../test-utils'

const mocks = vi.hoisted(() => ({
  signin: vi.fn(),
  signup: vi.fn(),
  signout: vi.fn(),
  useAuth: vi.fn(),
  useCheckins: vi.fn(),
  useProfile: vi.fn(),
  saveDailyCheckIn: vi.fn(),
  getDailyCheckIns: vi.fn(),
  sendAiChatMessage: vi.fn(),
}))

vi.mock('../../context/authContextValue', () => ({
  useAuth: mocks.useAuth,
}))

vi.mock('../../context/profileContextValue', () => ({
  useProfile: mocks.useProfile,
}))

vi.mock('../../context/checkinContextValue', () => ({
  useCheckins: mocks.useCheckins,
}))

vi.mock('../../services/checkInService', () => ({
  getDailyCheckIns: mocks.getDailyCheckIns,
  saveDailyCheckIn: mocks.saveDailyCheckIn,
}))

vi.mock('../../services/aiChatService', () => ({
  CHATBOT_UNAVAILABLE_MESSAGE: 'Der Chatbot ist gerade nicht erreichbar.',
  sendAiChatMessage: mocks.sendAiChatMessage,
}))

function renderLogin(props = {}) {
  return renderWithDefaults(<Einloggen onNavigate={vi.fn()} t={t} {...props} />)
}

function renderProfile(props = {}) {
  return renderWithDefaults(
    <Profil
      accountProfile={{ age: '22', goals: 'Fokus', dailyRoutine: 'Lernen', interests: 'Musik' }}
      appTheme="Hell"
      communicationStyle="casual"
      habits={[{ id: 1, progress: 100 }]}
      languageStyle="german"
      profileName="Mira"
      t={t}
      tone={{ label: 'Deutsch' }}
      onAccountProfileChange={vi.fn()}
      onAppThemeChange={vi.fn()}
      onCommunicationStyleChange={vi.fn()}
      onNavigate={vi.fn()}
      onProfileNameChange={vi.fn()}
      onSelectStyle={vi.fn()}
      {...props}
    />,
  )
}

describe('authentication pages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.useAuth.mockReturnValue({
      signin: mocks.signin,
      signup: mocks.signup,
      signout: mocks.signout,
      error: '',
    })
    mocks.useProfile.mockReturnValue(defaultProfileMock)
    mocks.useCheckins.mockReturnValue({ checkins: [], addCheckin: vi.fn() })
  })

  it('renders login texts, inputs and buttons', () => {
    renderLogin()

    expect(screen.getByRole('heading', { name: t.auth.loginTitle })).toBeInTheDocument()
    expect(screen.getByLabelText(t.auth.email)).toBeInTheDocument()
    expect(screen.getByLabelText(t.auth.password)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: t.start.login })).toBeInTheDocument()
  })

  it('validates empty login fields', () => {
    const { container } = renderLogin()

    fireEvent.submit(container.querySelector('form'))

    expect(screen.getByText('Bitte gib deine E-Mail-Adresse ein.')).toBeInTheDocument()
    expect(mocks.signin).not.toHaveBeenCalled()
  })

  it('shows friendly login errors for invalid data', async () => {
    mocks.signin.mockRejectedValueOnce(new Error('Invalid login credentials'))
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText(t.auth.email), 'wrong@example.com')
    await user.type(screen.getByLabelText(t.auth.password), 'secret123')
    await user.click(screen.getByRole('button', { name: t.start.login }))

    expect(await screen.findByText('E-Mail oder Passwort ist falsch.')).toBeInTheDocument()
  })

  it('submits successful login and toggles password visibility', async () => {
    mocks.signin.mockResolvedValueOnce({})
    const user = userEvent.setup()
    renderLogin()

    const passwordInput = screen.getByLabelText(t.auth.password)
    expect(passwordInput).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: 'Passwort anzeigen' }))
    expect(passwordInput).toHaveAttribute('type', 'text')

    await user.type(screen.getByLabelText(t.auth.email), 'mira@example.com')
    await user.type(passwordInput, 'secret123')
    await user.click(screen.getByRole('button', { name: t.start.login }))

    await waitFor(() => expect(mocks.signin).toHaveBeenCalledWith('mira@example.com', 'secret123'))
    expect(await screen.findByText('Änderungen übernommen.')).toBeInTheDocument()
  })

  it('validates registration fields and submits a successful registration', async () => {
    mocks.signup.mockResolvedValueOnce({})
    renderWithDefaults(<Registrieren onNavigate={vi.fn()} t={t} />)

    const form = document.querySelector('form')
    fireEvent.submit(form)
    expect(screen.getByText('Bitte gib einen Namen ein.')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Mira' } })
    const emailInput = screen.getByLabelText(t.auth.email)
    fireEvent.change(emailInput, { target: { value: 'keine-email' } })
    fireEvent.change(screen.getByLabelText(t.auth.password), { target: { value: 'secret123' } })
    fireEvent.change(screen.getByLabelText('Passwort wiederholen'), { target: { value: 'secret123' } })
    fireEvent.click(screen.getByRole('button', { name: t.start.register }))
    expect(emailInput.validity.valid).toBe(false)
    expect(mocks.signup).not.toHaveBeenCalled()

    fireEvent.change(emailInput, { target: { value: 'mira@example.com' } })
    expect(screen.queryByText('Geschlecht')).not.toBeInTheDocument()
    expect(screen.queryByText('Aktivität')).not.toBeInTheDocument()
    expect(screen.queryByText('Situation')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Alter')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Gewicht')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Größe')).not.toBeInTheDocument()
    expect(screen.getByText('Deutsch').closest('button')).not.toHaveClass('selected')
    expect(screen.getByText('Locker').closest('button')).not.toHaveClass('selected')
    expect(screen.getByText('Hell').closest('button')).not.toHaveClass('selected')
    fireEvent.click(screen.getByText('Deutsch').closest('button'))
    fireEvent.click(screen.getByText('Locker').closest('button'))
    fireEvent.click(screen.getByText('Hell').closest('button'))
    fireEvent.change(screen.getByLabelText(t.auth.password), { target: { value: '123' } })
    fireEvent.change(screen.getByLabelText('Passwort wiederholen'), { target: { value: '456' } })
    fireEvent.submit(form)
    expect(screen.getByText(/stimmen nicht/)).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText(t.auth.password), { target: { value: '123' } })
    fireEvent.change(screen.getByLabelText('Passwort wiederholen'), { target: { value: '123' } })
    fireEvent.submit(form)
    expect(screen.getByText(/mindestens 8 Zeichen/)).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText(t.auth.password), { target: { value: 'secret123' } })
    fireEvent.change(screen.getByLabelText('Passwort wiederholen'), { target: { value: 'secret123' } })
    fireEvent.submit(form)
    expect(screen.getByText('Bitte akzeptiere die Datenschutzbestimmungen.')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText(/Ich akzeptiere/))
    fireEvent.submit(form)

    await waitFor(() => expect(mocks.signup).toHaveBeenCalled())
    expect(await screen.findByText(/Registrierung erfolgreich/)).toBeInTheDocument()
  })
})

describe('onboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('validates required fields, navigates and completes onboarding', async () => {
    const onComplete = vi.fn()
    const user = userEvent.setup()
    renderWithDefaults(<StudentOnboarding includePreferences onBack={vi.fn()} onComplete={onComplete} />)

    await user.click(screen.getByRole('button', { name: 'Weiter' }))
    expect(screen.getByText(/Bitte w/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Sch/ }))
    await user.click(screen.getByRole('button', { name: 'Weiter' }))
    expect(screen.getByText('Altersgruppe')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '16-18' }))
    await user.click(screen.getByRole('button', { name: 'Oberstufe' }))
    await user.click(screen.getByRole('button', { name: 'Weiter' }))
    await user.click(screen.getByRole('button', { name: /Pr/ }))
    await user.click(screen.getByRole('button', { name: 'Weiter' }))
    await user.click(screen.getByRole('button', { name: /Fokus/ }))
    await user.click(screen.getByRole('button', { name: 'Zur Registrierung' }))

    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({
      student_status: 'school',
      age_group: '16_18',
      education_level: 'upper_school',
      main_challenges: ['exam_stress'],
      support_goals: ['increase_focus'],
      onboarding_completed: true,
    }))
  })
})

describe('dashboard, navigation and profile components', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.useAuth.mockReturnValue({ signout: mocks.signout, error: '' })
    mocks.useProfile.mockReturnValue(defaultProfileMock)
    mocks.useCheckins.mockReturnValue({ checkins: [], addCheckin: vi.fn(), hasCheckin: vi.fn(() => false) })
  })

  it('renders DashboardHome and navigates to the diary from profile summary', async () => {
    const onNavigate = vi.fn()
    const user = userEvent.setup()
    renderWithDefaults(
      <DashboardHome
        accountProfile={{ goals: 'Fokus, Schlaf', dailyRoutine: 'Lernen' }}
        habits={[{ id: 1, progress: 100, displayTitle: 'Wasser', displayDetail: '4 Glaeser' }]}
        onNavigate={onNavigate}
        profileName="Mira"
        t={t}
      />,
    )

    expect(screen.getByText(/Hey Mira/)).toBeInTheDocument()
    expect(screen.getByText('Ziele und Tagesablauf')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Bearbeiten' }))
    expect(onNavigate).toHaveBeenCalledWith('calendar')
  })

  it('renders Navbar and handles navigation clicks', async () => {
    const onNavigate = vi.fn()
    const user = userEvent.setup()
    renderWithDefaults(<Navbar activeScreen="dashboard" items={[
      { id: 'dashboard', label: 'Home' },
      { id: 'profile', label: 'Profil' },
    ]} onNavigate={onNavigate} />)

    expect(screen.getByRole('button', { name: /Home/ })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Profil/ }))
    expect(onNavigate).toHaveBeenCalledWith('profile')
  })

  it('renders profile, changes language and signs out', async () => {
    mocks.signout.mockResolvedValueOnce()
    const onSelectStyle = vi.fn()
    const user = userEvent.setup()
    const { container } = renderProfile({ settingsPage: true, onSelectStyle })

    expect(screen.getByRole('heading', { name: 'Einstellungen' })).toBeInTheDocument()
    const languageRow = [...container.querySelectorAll('.profile-setting-row')]
      .find((row) => row.textContent.includes(t.profile.language))
    await user.click(within(languageRow).getByRole('button', { name: t.common.change }))
    await user.click(screen.getByRole('button', { name: 'English' }))
    await user.click(screen.getByRole('button', { name: 'OK' }))
    expect(onSelectStyle).toHaveBeenCalledWith('english')

    await user.click(screen.getByRole('button', { name: t.profile.logout }))
    await waitFor(() => expect(mocks.signout).toHaveBeenCalled())
  })
})

describe('DailyCheckIn, diary and routines interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mocks.useProfile.mockReturnValue(defaultProfileMock)
    mocks.useCheckins.mockReturnValue({ checkins: [], addCheckin: vi.fn(), hasCheckin: vi.fn(() => false) })
    mocks.getDailyCheckIns.mockResolvedValue({ success: true, checkIns: [] })
    mocks.saveDailyCheckIn.mockResolvedValue({ id: 'checkin-1' })
  })

  it('saves a complete daily check-in', async () => {
    const user = userEvent.setup()
    renderWithDefaults(<DailyCheckIn onNavigate={vi.fn()} user={{ id: 'user-1' }} />)

    await user.click(screen.getByRole('button', { name: /Check-in starten/ }))

    expect(screen.getByLabelText('MyFlow KI Chat')).toBeInTheDocument()

    for (let step = 0; step < 12 && !screen.queryByRole('button', { name: 'Auswerten' }); step += 1) {
      const options = within(screen.getByRole('listbox')).getAllByRole('option')
      await user.click(options[0])

      const nextButton = screen.queryByRole('button', { name: 'Weiter' })
      if (nextButton) {
        await user.click(nextButton)
      }
    }

    await user.click(within(screen.getByRole('listbox')).getAllByRole('option')[0])
    await user.click(screen.getByRole('button', { name: 'Auswerten' }))

    expect(await screen.findByText('Phase 2')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Frag deinen MyFlow Coach...')).toBeInTheDocument()
    await waitFor(() => expect(mocks.saveDailyCheckIn).toHaveBeenCalled())
  })

  it('continues as a free AI chat after the daily check-in', async () => {
    mocks.sendAiChatMessage.mockResolvedValueOnce('Plane zuerst deine wichtigste Aufgabe und mache danach eine kurze Pause.')
    const user = userEvent.setup()
    renderWithDefaults(<DailyCheckIn onNavigate={vi.fn()} user={{ id: 'user-1' }} />)

    await user.click(screen.getByRole('button', { name: /Check-in starten/ }))

    for (let step = 0; step < 12 && !screen.queryByRole('button', { name: 'Auswerten' }); step += 1) {
      const options = within(screen.getByRole('listbox')).getAllByRole('option')
      await user.click(options[0])

      const nextButton = screen.queryByRole('button', { name: 'Weiter' })
      if (nextButton) await user.click(nextButton)
    }

    await user.click(within(screen.getByRole('listbox')).getAllByRole('option')[0])
    await user.click(screen.getByRole('button', { name: 'Auswerten' }))

    const coachInput = await screen.findByPlaceholderText('Frag deinen MyFlow Coach...')
    await user.type(coachInput, 'Plane meinen Tag')
    await user.click(screen.getByRole('button', { name: 'Senden' }))

    expect(await screen.findByText('Plane zuerst deine wichtigste Aufgabe und mache danach eine kurze Pause.')).toBeInTheDocument()
    expect(mocks.sendAiChatMessage).toHaveBeenCalledWith(expect.objectContaining({
      context: expect.objectContaining({
        checkIn: expect.any(Object),
      }),
    }))
  })

  it('starts directly in the free AI chat and stores the chat in history', async () => {
    mocks.sendAiChatMessage.mockResolvedValueOnce('Ich helfe dir mit einem ruhigen Plan.')
    const user = userEvent.setup()
    renderWithDefaults(<DailyCheckIn onNavigate={vi.fn()} user={{ id: 'user-1' }} />)

    expect(screen.getByText('Freier Chat')).toBeInTheDocument()

    const coachInput = screen.getByPlaceholderText('Frag deinen MyFlow Coach...')
    await user.type(coachInput, 'Hilf mir beim Planen')
    await user.click(screen.getByRole('button', { name: 'Senden' }))

    expect(screen.getByText('Hilf mir beim Planen')).toBeInTheDocument()
    expect(await screen.findByText('Ich helfe dir mit einem ruhigen Plan.')).toBeInTheDocument()

    const storedHistory = JSON.parse(localStorage.getItem('myflow-ai-chat-history-user-1'))
    expect(storedHistory[0].messages).toEqual([
      { role: 'user', text: 'Hilf mir beim Planen' },
      { role: 'assistant', text: 'Ich helfe dir mit einem ruhigen Plan.' },
    ])
  })

  it('shows a friendly message when the AI chat is unavailable', async () => {
    mocks.sendAiChatMessage.mockRejectedValueOnce(new Error('network failed'))
    const user = userEvent.setup()
    renderWithDefaults(<DailyCheckIn onNavigate={vi.fn()} user={{ id: 'user-1' }} />)

    await user.type(screen.getByPlaceholderText('Frag deinen MyFlow Coach...'), 'Bist du da?')
    await user.click(screen.getByRole('button', { name: 'Senden' }))

    expect(await screen.findByText('Der Chatbot ist gerade nicht erreichbar.')).toBeInTheDocument()
  })

  it('opens saved AI chats from the history menu', async () => {
    localStorage.setItem('myflow-ai-chat-history-user-1', JSON.stringify([{
      id: 'chat-old',
      title: 'KI-Chat 08.07., 10:00',
      createdAt: '2026-07-08T08:00:00.000Z',
      answers: {},
      recommendationIds: [],
      messages: [
        { role: 'user', text: 'Plane meinen Tag' },
        { role: 'assistant', text: 'Starte mit einer kleinen Aufgabe.' },
      ],
    }]))
    const user = userEvent.setup()
    renderWithDefaults(<DailyCheckIn onNavigate={vi.fn()} user={{ id: 'user-1' }} />)

    await user.click(screen.getByRole('button', { name: /Verlauf/ }))
    await user.click(screen.getByRole('button', { name: /KI-Chat 08.07., 10:00/ }))

    expect(screen.getByLabelText('Alter MyFlow KI Chat')).toBeInTheDocument()
    expect(screen.getByText('Plane meinen Tag')).toBeInTheDocument()
    expect(screen.getByText('Starte mit einer kleinen Aufgabe.')).toBeInTheDocument()
  })

  it('stores diary notes and adds calendar tasks', async () => {
    const onNotesChange = vi.fn()
    const user = userEvent.setup()
    renderWithDefaults(<Kalender notes={{}} onNotesChange={onNotesChange} />)

    await user.click(screen.getByRole('button', { name: /Notiz zum Tag/ }))
    fireEvent.change(screen.getByPlaceholderText(/Heute auf genug Pausen/), {
      target: { value: 'Heute lernen' },
    })

    const latestNotes = onNotesChange.mock.calls.at(-1)[0]
    expect(Object.values(latestNotes)[0]).toMatchObject({ text: 'Heute lernen' })

    await user.click(screen.getByRole('button', { name: /Aufgabe/ }))
    await user.type(screen.getByPlaceholderText(/Wasser trinken/), 'Mathe lernen')
    await user.click(screen.getByRole('button', { name: /Hinzuf/ }))

    await waitFor(() => expect(screen.getAllByText('Mathe lernen').length).toBeGreaterThan(0))
  })

  it('adds and removes routines', async () => {
    const onAddHabit = vi.fn()
    const onRemove = vi.fn()
    const user = userEvent.setup()
    renderWithDefaults(
      <Routinen
        habits={[{
          id: 'routine-1',
          title: 'Wasser trinken',
          displayTitle: 'Wasser trinken',
          current: 1,
          target: 4,
          unit: 'Glaeser',
          progress: 25,
        }]}
        languageStyle="german"
        onAddHabit={onAddHabit}
        onDecrement={vi.fn()}
        onIncrement={vi.fn()}
        onRemove={onRemove}
        onSetMood={vi.fn()}
        onToggleDone={vi.fn()}
        onUpdatePeriod={vi.fn()}
        t={t}
        translateUnit={(unit) => unit}
      />,
    )

    await user.click(screen.getByRole('button', { name: t.routines.add }))
    await user.type(screen.getByPlaceholderText(t.routines.placeholder), 'Lesen')
    await user.clear(screen.getByLabelText(t.routines.target))
    await user.type(screen.getByLabelText(t.routines.target), '20')
    await user.click(screen.getByRole('button', { name: t.routines.addRoutine }))

    expect(onAddHabit).toHaveBeenCalledWith({ title: 'Lesen', target: 20, unit: 'Gläser (500 ml)' })

    await user.click(screen.getByRole('button', { name: /Wasser trinken entfernen/ }))
    expect(onRemove).toHaveBeenCalledWith(expect.objectContaining({ id: 'routine-1' }))
  })
})
