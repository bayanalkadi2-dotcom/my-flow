import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Routinen from '../../pages/Routinen'
import { defaultProfileMock, renderWithDefaults, t } from '../test-utils'

const mocks = vi.hoisted(() => ({
  useProfile: vi.fn(),
}))

vi.mock('../../context/profileContextValue', () => ({
  useProfile: mocks.useProfile,
}))

const routineProps = {
  habits: [],
  languageStyle: 'german',
  onAddHabit: vi.fn(),
  onIncrement: vi.fn(),
  onDecrement: vi.fn(),
  onResetProgress: vi.fn(),
  onSaveDailyEntry: vi.fn(),
  onSetMood: vi.fn(),
  onSetPartial: vi.fn(),
  onUpdatePeriod: vi.fn(),
  onRemove: vi.fn(),
  onToggleDone: vi.fn(),
  t,
  translateUnit: (unit) => unit,
}

describe('period routine display', () => {
  beforeEach(() => {
    mocks.useProfile.mockReturnValue(defaultProfileMock)
  })

  it('updates immediately when the saved gender changes in either direction', () => {
    const { rerender } = renderWithDefaults(
      <Routinen {...routineProps} gender="female" />,
    )

    fireEvent.click(screen.getByRole('button', { name: t.routines.add }))
    fireEvent.click(screen.getByRole('button', { name: /Körperliche Gesundheit/i }))
    expect(screen.getByRole('button', { name: /Periode/i })).toBeInTheDocument()

    rerender(<Routinen {...routineProps} gender="male" />)
    expect(screen.queryByRole('button', { name: /Periode/i })).not.toBeInTheDocument()

    rerender(<Routinen {...routineProps} gender="female" />)
    expect(screen.getByRole('button', { name: /Periode/i })).toBeInTheDocument()
  })
})
