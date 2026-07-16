import { describe, expect, it } from 'vitest'
import { socialProfileName } from '../../services/socialService'

describe('socialProfileName', () => {
  it('uses profiles.display_name as the visible friend name', () => {
    expect(socialProfileName({
      id: '4ea9e7cc-75f5-4dc6-b465-43fd21aa4845',
      display_name: '  Mira Beispiel  ',
    })).toBe('Mira Beispiel')
  })

  it('uses the placeholder only when display_name is really empty', () => {
    expect(socialProfileName({ id: 'friend-1', display_name: null })).toBe('MyFlow-Freund')
    expect(socialProfileName({ id: 'friend-2', display_name: '   ' })).toBe('MyFlow-Freund')
  })

  it('does not disguise a missing profile row as an empty name', () => {
    expect(() => socialProfileName(undefined)).toThrow('Profil dieses Freundes konnte nicht geladen werden')
  })
})
