import { inject, type InjectionKey } from 'vue'
import type { OccasionId } from '../../domain/models'

/**
 * Which look a page shows. The new design (cream post-office paper, the envelope mascot) is
 * the main one at the root paths since the two journeys were joined; "current" is the old
 * look, kept only until the new version is accepted (see docs/route-migration.md).
 */
export type Design = 'current' | 'new'
export const DESIGN_KEY: InjectionKey<Design> = Symbol('design')
export function useDesign(): Design {
  return inject(DESIGN_KEY, 'new')
}

/** The earlier test views. Their pages still answer, but every link now leads to the main paths. */
export const NEW_DESIGN_ROOT = '/uus-disain'
/** The short Christmas journey's test path; /joulukirjad is its main version. */
export const SHORT_JOURNEY_ROOT = '/ud2'
/** The Christmas letters: who for, the 24 free letters at once, and the personal ones beside them. */
export const CHRISTMAS_ROOT = '/joulukirjad'

/** The same page in the given design. Both live at the main paths now, so the path is kept. */
export function designPath(_design: Design, path: string): string {
  return path
}

/** Each occasion has its own stamp colour. */
export const STAMP_COLORS: Record<OccasionId, string> = {
  christmas: '#c43b30',
  easter: '#7fa387',
  birthday: '#7c6bb8',
  halloween: '#e0782f',
  'mardi-kadri': '#8d5a97',
  vastlapaev: '#4f86b5',
  valentines: '#d9577a',
  'school-start': '#3d7a6a',
  summer: '#e8a33d',
  'lost-tooth': '#5aa4b8',
  everyday: '#6b5aa8',
}
export const STAMP_TILTS = [-3, 2, -1, 3, -2, 1.5]

export interface PostcardLook {
  /** Airmail edge colours. */
  edge: [string, string]
  tint: string
  ink: string
  /** A slight tilt, so the cards look tossed on a table. */
  tilt: number
}
export const POSTCARD_LOOKS: PostcardLook[] = [
  { edge: ['#e8836b', '#7c6bb8'], tint: 'var(--coral-soft)', ink: 'var(--coral-ink)', tilt: -1.2 },
  { edge: ['#7fa387', '#f2c46d'], tint: 'var(--sage-soft)', ink: 'var(--sage-ink)', tilt: 0.8 },
  { edge: ['#7c6bb8', '#e8836b'], tint: 'var(--lavender-soft)', ink: 'var(--lavender-ink)', tilt: -0.6 },
  { edge: ['#f2c46d', '#7c6bb8'], tint: 'var(--gold-soft)', ink: '#8a6417', tilt: 1 },
  { edge: ['#e8836b', '#7fa387'], tint: 'var(--coral-soft)', ink: 'var(--coral-ink)', tilt: -0.9 },
  { edge: ['#7c6bb8', '#f2c46d'], tint: 'var(--lavender-soft)', ink: 'var(--lavender-ink)', tilt: 0.6 },
]
export function postcardLook(index: number): PostcardLook {
  return POSTCARD_LOOKS[index % POSTCARD_LOOKS.length]!
}
