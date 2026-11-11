import { describe, expect, it } from 'vitest'
import { DEFAULT_GENERAL, defaultDecoration, defaultOptions } from '@/domain/defaults'
import { languageFor, textLevel, usesSmallCards } from '@/domain/generators/audience'
import { templateGenerator } from '@/domain/generators/templateGenerator'
import type { ChildProfile, GenerationRequest, LetterOptions, OccasionId } from '@/domain/models'
import { PAARU } from './helpers'

const TODDLER: ChildProfile = { ...PAARU, id: 'mia', name: 'Mia', age: 2, readingLevel: 'read-aloud' }

function newLetters(occasionId: OccasionId, options: Partial<LetterOptions> = {}): GenerationRequest {
  return {
    contentType: 'letter',
    children: [TODDLER],
    occasionId,
    general: { ...DEFAULT_GENERAL },
    seed: 1234,
    options: { ...defaultOptions(occasionId).letter, startDate: '2026-12-01', ...options },
  }
}

describe('defaults of a new creation', () => {
  it('writes rich letters for every age, a two-year-old too', () => {
    const options = defaultOptions('christmas').letter
    expect(options.defaultLanguage).toBe('rich')
    expect(languageFor(TODDLER, options)).toBe('rich')
    // A toddler's rich text is the younger readers' letters, read aloud – not the one-line cards.
    expect(textLevel(TODDLER, 'rich')).toEqual({ band: 'young', readAloud: false })
    expect(usesSmallCards(TODDLER, newLetters('christmas'))).toBe(false)
  })

  it('keeps "Lihtne" a choice, and older creations their language by age', () => {
    expect(languageFor(TODDLER, { ...defaultOptions('christmas').letter, language: { mia: 'simple' } })).toBe('simple')
    // Saved before the default: no `defaultLanguage`, so the letters read as they did.
    expect(languageFor(TODDLER, {})).toBe('simple')
    expect(languageFor(PAARU, {})).toBe('simple')
  })

  it('makes a toddler’s first Christmas letters longer than the simple ones', async () => {
    const rich = await templateGenerator.generate(newLetters('christmas'))
    const simple = await templateGenerator.generate(newLetters('christmas', { language: { mia: 'simple' } }))
    const length = (items: { body: string }[]) => items.reduce((sum, item) => sum + item.body.length, 0)
    expect(length(rich.items)).toBeGreaterThan(length(simple.items) * 1.5)
  })

  it('dresses new Christmas letters: the elf under them and an ink-saving frame of stars', async () => {
    const content = await templateGenerator.generate(newLetters('christmas'))
    expect(content.decoration).toEqual({
      pattern: 'stars',
      inkSaver: true,
      image: null,
      imageAsBackground: false,
      imageOpacity: 0.25,
      puzzle: false,
      companion: 'pakapikk',
    })
  })

  it('leaves other creations plain', async () => {
    expect((await templateGenerator.generate(newLetters('birthday'))).decoration).toBeUndefined()
    expect(defaultDecoration({ contentType: 'calendar', occasionId: 'christmas' })).toBeUndefined()
  })
})
