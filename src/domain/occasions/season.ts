import type { Occasion, OccasionId } from '../models'

/** Months (0 = January) when an occasion is "in season" and worth highlighting. */
const SEASON_MONTHS: Partial<Record<OccasionId, number[]>> = {
  christmas: [10, 11],
  easter: [2, 3],
  halloween: [9],
  'mardi-kadri': [10],
  vastlapaev: [1, 2],
  valentines: [1],
  'school-start': [7, 8],
  summer: [5, 6, 7],
}

export function isInSeason(id: OccasionId, date = new Date()): boolean {
  return SEASON_MONTHS[id]?.includes(date.getMonth()) ?? false
}

/** In-season occasions first, year-round ones last, otherwise original order. */
export function sortBySeason(occasions: Occasion[], date = new Date()): Occasion[] {
  const rank = (occasion: Occasion) =>
    isInSeason(occasion.id, date) ? 0 : SEASON_MONTHS[occasion.id] ? 1 : 2
  return [...occasions].sort((a, b) => rank(a) - rank(b))
}
