import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import DailyCheckIn from '../../commponents/checkin/DailyCheckIn'
import Navbar from '../../commponents/Navbar'
import DashboardHome from '../../pages/DashboardHome'
import Einloggen from '../../pages/Einloggen'
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
  useProfile: vi.fn(),
  saveDailyCheckIn: vi.fn(),
}))

vi.mock('../../context/authContextValue', () => ({
  useAuth: mocks.useAuth,
}))

vi.mock('../../context/profileContextValue', () => ({
  useProfile: mocks.useProfile,
}))

vi.mock('../../services/checkInService', () => ({
  saveDailyCheckIn: mocks.saveDailyCheckIn,
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

    expect(screen.getByText(/Bitte f/)).toBeInTheDocument()
    expect(mocks.signin).not.toHaveBeenCalled()
  })

  it('shows Supabase login errors for invalid data', async () => {
    mocks.signin.mockRejectedValueOnce(new Error('Ungueltige Daten'))
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText(t.auth.email), 'wrong@example.com')
    await user.type(screen.getByLabelText(t.auth.password), 'secret123')
    await user.click(screen.getByRole('button', { name: t.start.login }))

    expect(await screen.findByText('Ungueltige Daten')).toBeInTheDocument()
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
    expect(await screen.findByText('Anmeldung erfolgreich!')).toBeInTheDocument()
  })

  it('validates registration fields and submits a successful registration', async () => {
    mocks.signup.mockResolvedValueOnce({})
    const user = userEvent.setup()
    renderWithDefaults(<Registrieren onNavigate={vi.fn()} t={t} />)

    await user.click(screen.getByRole('button', { name: /Student/ }))
    await user.click(screen.getByRole('button', { name: 'Weiter' }))
    await user.click(screen.getByRole('button', { name: '19-24' }))
    await user.click(screen.getByText('Universität').closest('button'))
    await user.click(screen.getByRole('button', { name: 'Zur Registrierung' }))

    const form = document.querySelector('form')
    fireEvent.submit(form)
    expect(screen.getByText(/Bitte f/)).toBeInTheDocument()

    const emailInput = screen.getByLabelText(t.auth.email)
    await user.type(emailInput, 'keine-email')
    await user.type(screen.getByLabelText(t.auth.password), 'secret123')
    await user.type(screen.getByLabelText('Passwort wiederholen'), 'secret123')
    await user.click(screen.getByRole('button', { name: t.start.register }))
    expect(emailInput.validity.valid).toBe(false)
    expect(mocks.signup).not.toHaveBeenCalled()

    await user.clear(emailInput)
    await user.clear(screen.getByLabelText(t.auth.password))
    await user.clear(screen.getByLabelText('Passwort wiederholen'))
    await user.type(emailInput, 'mira@example.com')
    await user.type(screen.getByLabelText(t.auth.password), '123')
    await user.type(screen.getByLabelText('Passwort wiederholen'), '456')
    fireEvent.submit(form)
    expect(screen.getByText(/stimmen nicht/)).toBeInTheDocument()

    await user.clear(screen.getByLabelText(t.auth.password))
    await user.clear(screen.getByLabelText('Passwort wiederholen'))
    await user.type(screen.getByLabelText(t.auth.password), '123')
    await user.type(screen.getByLabelText('Passwort wiederholen'), '123')
    fireEvent.submit(form)
    expect(screen.getByText(/mindestens 6 Zeichen/)).toBeInTheDocument()

    await user.clear(screen.getByLabelText(t.auth.password))
    await user.clear(screen.getByLabelText('Passwort wiederholen'))
    await user.type(screen.getByLabelText(t.auth.password), 'secret123')
    await user.type(screen.getByLabelText('Passwort wiederholen'), 'secret123')
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
  })

  it('renders DashboardHome and navigates to profile settings', async () => {
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
    expect(onNavigate).toHaveBeenCalledWith('profileSettings')
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

describe('DailyCheckIn and routines interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.useProfile.mockReturnValue(defaultProfileMock)
    mocks.saveDailyCheckIn.mockResolvedValue({ id: 'checkin-1' })
  })

  it('saves a complete daily check-in', async () => {
    const user = userEvent.setup()
    renderWithDefaults(<DailyCheckIn onNavigate={vi.fn()} user={{ id: 'user-1' }} />)

    await user.click(screen.getByRole('button', { name: 'Check-in starten' }))

    while (!screen.queryByRole('button', { name: 'Auswerten' })) {
      const options = within(screen.getByRole('listbox')).getAllByRole('button')
      await user.click(options[0])
      await user.click(screen.getByRole('button', { name: 'Weiter' }))
    }

    await user.click(within(screen.getByRole('listbox')).getAllByRole('button')[0])
    await user.click(screen.getByRole('button', { name: 'Auswerten' }))

    expect(await screen.findByText('Dein Tages-Check-in ist fertig')).toBeInTheDocument()
    await waitFor(() => expect(mocks.saveDailyCheckIn).toHaveBeenCalled())
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
