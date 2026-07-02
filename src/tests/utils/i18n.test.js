import { describe, expect, it } from 'vitest'
import {
  getAppTranslations,
  translateCategory,
  translateHabit,
  translateHabitTitle,
  translateUnit,
} from '../../i18n'

describe('translation helpers', () => {
  it('translates habit titles, units and categories', () => {
    expect(translateHabitTitle('Wasser trinken', 'english')).toBe('Drink water')
    expect(translateUnit('Minuten', 'english')).toBe('minutes')
    expect(translateCategory('Produktivität', 'english')).toBe('Productivity')
  })

  it('falls back to original text for unknown translations', () => {
    expect(translateHabitTitle('Unbekannt', 'english')).toBe('Unbekannt')
  })

  it('builds display values for habits', () => {
    const habit = translateHabit({
      title: 'Wasser trinken',
      unit: 'Minuten',
      current: 2,
      target: 5,
    }, 'english')

    expect(habit.displayTitle).toBe('Drink water')
    expect(habit.displayDetail).toBe('2 / 5 minutes')
  })

  it('returns language and tone specific app translations', () => {
    const appTranslations = getAppTranslations('german', 'formal')

    expect(appTranslations.start.start).toBe('Starten')
    expect(appTranslations.auth.loginTitle).toMatch(/Willkommen/)
  })
})
