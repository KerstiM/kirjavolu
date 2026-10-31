import type { OccasionId, PatternId } from './models'

export const PATTERN_LABELS: Record<PatternId, string> = {
  stars: 'Tähed',
  snow: 'Lumehelbed',
  eggs: 'Munad',
  confetti: 'Konfetid',
  hearts: 'Südamed',
  leaves: 'Lehed',
  moons: 'Kuud',
  dots: 'Täpid',
}

const SUGGESTED: Record<OccasionId, PatternId[]> = {
  christmas: ['snow', 'stars'],
  easter: ['eggs', 'dots'],
  birthday: ['confetti', 'stars'],
  halloween: ['moons', 'stars'],
  'mardi-kadri': ['moons', 'dots'],
  vastlapaev: ['snow', 'dots'],
  valentines: ['hearts', 'dots'],
  'school-start': ['dots', 'stars'],
  summer: ['leaves', 'dots'],
  'lost-tooth': ['stars', 'moons'],
  everyday: ['stars', 'leaves'],
}

/** All patterns, the ones that suit the occasion first. */
export function patternsFor(occasion: OccasionId): PatternId[] {
  const suggested = SUGGESTED[occasion]
  const rest = (Object.keys(PATTERN_LABELS) as PatternId[]).filter((id) => !suggested.includes(id))
  return [...suggested, ...rest]
}

export function isSuggestedPattern(occasion: OccasionId, pattern: PatternId): boolean {
  return SUGGESTED[occasion].includes(pattern)
}
