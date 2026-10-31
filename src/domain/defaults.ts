import type { ContentOptionsMap, GeneralOptions, OccasionId, StoryGenre } from './models'
import type { MaterialId } from '../data/templates/activities'
import { getOccasion } from './occasions/occasions'
import { todayIso } from './text/estonian'

export const DEFAULT_GENERAL: GeneralOptions = {
  tone: 'magical',
  length: 'medium',
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
  return {
    letter: {
      sender: occasion.vocabulary.sender,
      startDate: upcomingDate(occasionId),
      count: christmas ? 24 : 1,
      connected: christmas,
      mode: 'linked',
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
