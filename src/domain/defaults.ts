import { EMPTY_DECORATION, type ContentOptionsMap, type Decoration, type GeneralOptions, type GenerationRequest, type OccasionId, type StoryGenre } from './models'
import type { MaterialId } from '../data/templates/activities'
import { getOccasion } from './occasions/occasions'
import { todayIso } from './text/estonian'
import { christmasLettersUntilEve, MIN_SERIES } from './validation'

export const DEFAULT_GENERAL: GeneralOptions = {
  tone: 'magical',
  // Long by default: a small child is read to, and a short letter is little to read.
  length: 'long',
  difficulty: 'auto',
  notes: '',
}

const ALL_COMMON_MATERIALS: MaterialId[] = ['paper', 'colors', 'scissors', 'glue', 'blankets', 'books', 'kitchen', 'ball', 'nature', 'blocks']

const STORY_GENRE_BY_OCCASION: Partial<Record<OccasionId, StoryGenre>> = {
  birthday: 'detective',
  halloween: 'funny',
  summer: 'adventure',
  'mardi-kadri': 'fairytale',
  easter: 'animals',
}

function upcomingDate(occasion: OccasionId, today = new Date()): string {
  if (occasion === 'christmas' && today.getMonth() !== 11) return `${today.getFullYear()}-12-01`
  return todayIso(today)
}

export function defaultOptions(occasionId: OccasionId): ContentOptionsMap {
  const occasion = getOccasion(occasionId)
  const christmas = occasionId === 'christmas'
  const startDate = upcomingDate(occasionId)
  // One letter a day until Christmas Eve; too few days left for a whole story give one letter.
  const untilEve = christmasLettersUntilEve(startDate)
  return {
    letter: {
      sender: occasion.vocabulary.sender,
      startDate,
      count: christmas ? (untilEve >= MIN_SERIES ? untilEve : 1) : 1,
      connected: christmas,
      mode: 'linked',
      // The first letters are full ones for every age; "Lihtne" stays a choice.
      defaultLanguage: 'rich',
    },
    'treasure-hunt': {
      clueCount: 6,
      setting: occasionId === 'summer' ? 'outdoor' : 'indoor',
      locations: [],
      cooperative: true,
      prize: occasion.vocabulary.prize,
    },
    story: {
      genre: STORY_GENRE_BY_OCCASION[occasionId] ?? 'fairytale',
      extraCharacters: [],
      theme: occasionId === 'valentines' ? 'friendship' : 'none',
    },
    puzzle: {
      kind: 'mixed',
      challengeCount: 5,
      secretCode: '',
    },
    calendar: {
      days: christmas ? 24 : occasionId === 'summer' ? 30 : 7,
      setting: 'both',
      materials: [...ALL_COMMON_MATERIALS],
      minutes: 20,
    },
    certificate: {
      format: occasionId === 'birthday' || occasionId === 'valentines' ? 'greeting' : 'diploma',
      achievement: '',
      style: 'magical',
      message: '',
      issuer: '',
    },
  }
}

/**
 * How a new creation looks at first. Christmas letters come dressed: a frame of stars that saves
 * ink and the elf under each long letter. Everything else starts plain.
 */
export function defaultDecoration(request: Pick<GenerationRequest, 'contentType' | 'occasionId'>): Decoration | undefined {
  if (request.contentType !== 'letter' || request.occasionId !== 'christmas') return undefined
  return { ...EMPTY_DECORATION, pattern: 'stars', inkSaver: true, companion: 'pakapikk' }
}
