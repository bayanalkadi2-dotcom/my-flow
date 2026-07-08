import { describe, expect, it } from 'vitest'
import {
  getHeightError,
  getProfileAgeError,
  getWeightError,
  parseHeightCm,
  parseProfileAge,
  parseWeightKg,
} from '../../utils/profileValidation'

describe('profile validation', () => {
  it('validates realistic age values', () => {
    expect(parseProfileAge('10')).toBeNull()
    expect(parseProfileAge('15')).toBeNull()
    expect(parseProfileAge('16')).toBe(16)
    expect(parseProfileAge('25')).toBe(25)
    expect(parseProfileAge('120')).toBe(120)
    expect(parseProfileAge('121')).toBeNull()
    expect(parseProfileAge('')).toBeNull()
    expect(getProfileAgeError('15')).toContain('mindestens 16')
  })

  it('validates weight values and accepts decimal comma', () => {
    expect(parseWeightKg('0')).toBeNull()
    expect(parseWeightKg('20')).toBeNull()
    expect(parseWeightKg('25')).toBe(25)
    expect(parseWeightKg('62,5')).toBe(62.5)
    expect(parseWeightKg('350')).toBe(350)
    expect(parseWeightKg('351')).toBeNull()
    expect(parseWeightKg('abc')).toBeNull()
    expect(getWeightError('20')).toContain('25 und 350')
  })

  it('validates height values and accepts decimal values', () => {
    expect(parseHeightCm('0')).toBeNull()
    expect(parseHeightCm('99')).toBeNull()
    expect(parseHeightCm('100')).toBe(100)
    expect(parseHeightCm('175')).toBe(175)
    expect(parseHeightCm('175.5')).toBe(175.5)
    expect(parseHeightCm('250')).toBe(250)
    expect(parseHeightCm('251')).toBeNull()
    expect(parseHeightCm('abc')).toBeNull()
    expect(getHeightError('99')).toContain('100 und 250')
  })
})
