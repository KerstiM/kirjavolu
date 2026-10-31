import { describe, expect, it } from 'vitest'
import { validateChildProfile, validateGenerationRequest } from '@/domain/validation'
import { emptyChildDraft } from '@/features/children/childrenStore'
import { makeRequest, RUBEN } from './helpers'

describe('validateChildProfile', () => {
  it('accepts a complete draft', () => {
    expect(validateChildProfile({ ...emptyChildDraft(), name: 'Mari-Liis', age: 7 })).toEqual({})
  })

  it('requires a name', () => {
    expect(validateChildProfile({ ...emptyChildDraft(), name: '   ' }).name).toBe('Palun sisesta lapse nimi.')
  })

  it('rejects digits and symbols in names', () => {
    expect(validateChildProfile({ ...emptyChildDraft(), name: 'R2D2' }).name).toBeDefined()
  })

  it('accepts Estonian letters', () => {
    expect(validateChildProfile({ ...emptyChildDraft(), name: 'Õie Ülle' }).name).toBeUndefined()
  })

  it.each([-1, 18, 2.5, Number.NaN])('rejects age %s', (age) => {
    expect(validateChildProfile({ ...emptyChildDraft(), name: 'Mia', age }).age).toBeDefined()
  })
})

describe('validateGenerationRequest', () => {
  it('accepts a valid request', () => {
    expect(validateGenerationRequest(makeRequest('letter'))).toEqual([])
  })

  it('requires at least one child', () => {
    expect(validateGenerationRequest(makeRequest('story', { children: [] }))).toContain('Vali vähemalt üks laps.')
  })

  it('rejects unsupported letter counts', () => {
    const request = makeRequest('letter', { options: { count: 5 as 1 } })
    expect(validateGenerationRequest(request)).toContain('Kirjade arv peab olema 1, 3, 7 või 24.')
  })

  it('checks treasure hunt clue range', () => {
    expect(validateGenerationRequest(makeRequest('treasure-hunt', { options: { clueCount: 2 } }))).toHaveLength(1)
    expect(validateGenerationRequest(makeRequest('treasure-hunt', { options: { clueCount: 13 } }))).toHaveLength(1)
  })

  it('flags invalid child profiles inside the request', () => {
    const errors = validateGenerationRequest(makeRequest('puzzle', { children: [{ ...RUBEN, age: 40 }] }))
    expect(errors[0]).toContain('Ruben')
  })
})
