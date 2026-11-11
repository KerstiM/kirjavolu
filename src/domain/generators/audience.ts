import type { AgeBand, ChildProfile, Difficulty, GenerationRequest, LanguageLevel, Length, LetterOptions, ReadingLevel } from '../models'
import { joinList, nameCase, namesInCase } from '../text/estonian'
import { findInterestHooks, type InterestHook } from '../../data/templates/interests'
import { interestTexts } from '../../data/topics'

export interface Audience {
  children: ChildProfile[]
  /** True when the text addresses several children ("teie" instead of "sina"). */
  plural: boolean
  /** Band used for shared text: the youngest reader's band. */
  band: AgeBand
  names: string
  greeting: string
  /** Chooses between singular and plural address. */
  v: (singular: string, plural: string) => string
  hooks: { child: ChildProfile; hook: InterestHook }[]
  readers: ChildProfile[]
  toddlers: ChildProfile[]
}

const BAND_ORDER: AgeBand[] = ['toddler', 'young', 'older']

export function ageBand(child: Pick<ChildProfile, 'age' | 'readingLevel'>): AgeBand {
  if (child.age <= 3) return 'toddler'
  if (child.readingLevel === 'read-aloud' && child.age <= 4) return 'toddler'
  if (child.age <= 7) return child.readingLevel === 'advanced' && child.age >= 7 ? 'older' : 'young'
  if (child.readingLevel === 'read-aloud' || child.readingLevel === 'beginner') return 'young'
  return 'older'
}

/** A likely reading ability for an age, so a quick profile needs only the age; the parent can change it. */
export function readingLevelForAge(age: number): ReadingLevel {
  if (age <= 4) return 'read-aloud'
  if (age <= 7) return 'beginner'
  if (age <= 9) return 'independent'
  return 'advanced'
}

/**
 * A toddler of three or more still listens rather than reads, but wants a real little
 * story read aloud – not the one-line cards of a one-year-old.
 */
export function listensToLongerStories(child: Pick<ChildProfile, 'age' | 'readingLevel'>): boolean {
  return ageBand(child) === 'toddler' && child.age >= 3
}

/** Toddlers who get the small one-line cards (12 per page) instead of the poster. */
export function usesSmallCards(child: ChildProfile, request?: GenerationRequest): boolean {
  if (request?.contentType === 'letter') {
    const level = textLevel(child, languageFor(child, request.options, request.general.difficulty), request.general.length)
    return level.band === 'toddler' && !level.readAloud
  }
  return ageBand(child) === 'toddler' && !listensToLongerStories(child)
}

/** The text a letter uses: a band's own text, and for a toddler the card or the read-aloud story. */
export interface TextLevel {
  band: AgeBand
  readAloud: boolean
}

/**
 * The two texts offered to a child, one step apart. Age and reading ability decide where the
 * child stands (`ageBand`), so a 10-year-old's simple letter is the younger readers' text and a
 * 6-year-old's rich one is the older readers'. A toddler's simple text is the little read-aloud
 * story (for the youngest, a one-line card when the letters are shorter); the rich one is the
 * younger readers' letters, read aloud by an adult.
 */
export function languageLevels(
  child: Pick<ChildProfile, 'age' | 'readingLevel'>,
  length: Length = 'long',
): Record<LanguageLevel, TextLevel> {
  const band = ageBand(child)
  if (band === 'toddler') {
    // "Keskmine" from older creations kept the cards too.
    const card = length !== 'long' && !listensToLongerStories(child)
    return { simple: { band: 'toddler', readAloud: !card }, rich: { band: 'young', readAloud: false } }
  }
  return { simple: { band: 'young', readAloud: false }, rich: { band: 'older', readAloud: false } }
}

/** The language suggested by age and reading ability: what the letters were before the choice. */
export function suggestedLanguage(child: Pick<ChildProfile, 'age' | 'readingLevel'>): LanguageLevel {
  return ageBand(child) === 'older' ? 'rich' : 'simple'
}

/**
 * The child's language in a letter request: the parent's choice, else the creation's default
 * (rich since it was added), else what an older creation's "Lihtsam" / "Keerulisem" gave (so
 * its letters read the same), else the suggestion.
 */
export function languageFor(
  child: ChildProfile,
  options: Pick<LetterOptions, 'language' | 'defaultLanguage'>,
  difficulty: Difficulty = 'auto',
): LanguageLevel {
  const chosen = options.language?.[child.id] ?? options.defaultLanguage
  if (chosen) return chosen
  const band = ageBand(child)
  if (difficulty === 'auto' || band === 'toddler') return suggestedLanguage(child)
  return adjustBand(band, difficulty) === 'older' ? 'rich' : 'simple'
}

export function textLevel(
  child: Pick<ChildProfile, 'age' | 'readingLevel'>,
  language: LanguageLevel,
  length: Length = 'long',
): TextLevel {
  return languageLevels(child, length)[language]
}

/** Applies the difficulty setting on top of the age band (never below toddler / above older). */
export function adjustBand(band: AgeBand, difficulty: Difficulty): AgeBand {
  if (band === 'toddler' || difficulty === 'auto') return band
  const index = BAND_ORDER.indexOf(band) + (difficulty === 'harder' ? 1 : -1)
  return BAND_ORDER[Math.min(Math.max(index, 1), 2)] ?? band
}

export function buildAudience(children: ChildProfile[]): Audience {
  const plural = children.length > 1
  const bands = children.map(ageBand)
  const readerBands = bands.filter((band) => band !== 'toddler')
  const band: AgeBand =
    readerBands.length === 0 ? 'toddler' : readerBands.includes('young') ? 'young' : 'older'
  const names = joinList(children.map((child) => nameCase(child, 'nominative')))
  const hooks = children.flatMap((child) =>
    findInterestHooks(interestTexts(child)).map((hook) => ({ child, hook })),
  )
  return {
    children,
    plural,
    band,
    names,
    greeting: plural ? `Kallid ${names}!` : `Kallis ${names}!`,
    v: (singular, pluralForm) => (plural ? pluralForm : singular),
    hooks,
    readers: children.filter((child) => ageBand(child) !== 'toddler'),
    toddlers: children.filter((child) => ageBand(child) === 'toddler'),
  }
}

export function namesAllative(children: ChildProfile[]): string {
  return namesInCase(children, 'allative')
}
