import { inject, type InjectionKey } from 'vue'
import type { OccasionId } from '../../domain/models'

/**
 * Which look the wizard shows: the current one at /loo, or the new design at
 * /uus-disain/loo while it is being tried out next to the current one.
 */
export type Design = 'current' | 'new'
export const DESIGN_KEY: InjectionKey<Design> = Symbol('design')
export function useDesign(): Design {
  return inject(DESIGN_KEY, 'current')
}

/** The new-design test views live under this path, next to the current pages. */
export const NEW_DESIGN_ROOT = '/uus-disain'
/** The same page in the given design, so links keep a visitor in the look they are trying out. */
export function designPath(design: Design, path: string): string {
  if (design === 'current') return path
  return path === '/' ? NEW_DESIGN_ROOT : `${NEW_DESIGN_ROOT}${path}`
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
