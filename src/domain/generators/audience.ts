import type { AgeBand, ChildProfile, Difficulty, ReadingLevel } from '../models'
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
export function usesSmallCards(child: Pick<ChildProfile, 'age' | 'readingLevel'>): boolean {
  return ageBand(child) === 'toddler' && !listensToLongerStories(child)
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
