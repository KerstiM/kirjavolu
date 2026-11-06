/** The characters that can sit under a long letter. */
export type CompanionId = 'pakapikk' | 'umbrik' | 'janes'
export type PatternId = 'stars' | 'snow' | 'eggs' | 'confetti' | 'hearts' | 'leaves' | 'moons' | 'dots'

/** Metadata of an uploaded picture; the pixels live in IndexedDB under `id`. */
export interface StoredImageRef {
  id: string
  width: number
  height: number
}

/** Body text of letters on half and whole pages: normal is 16 px (12 pt), smaller 14 px (10.5 pt). */
export type TextSize = 'normal' | 'smaller'

/** Visual decoration of printable items. Purely presentational: never affects the texts. */
export interface Decoration {
  pattern: PatternId | null
  /** Draw the pattern only as a frame to save ink. */
  inkSaver: boolean
  image: StoredImageRef | null
  imageAsBackground: boolean
  /** Background picture opacity, 0.1–0.6. */
  imageOpacity: number
  /** Picture strength behind poster and toddler cards, 0.1–1; unset = full. */
  cardImageOpacity?: number
  /** Split the picture into numbered pieces, one per item. */
  puzzle: boolean
  /** Print card texts in capital letters for beginning readers; unset = decide by age. */
  uppercase?: boolean
  /** The drawn landscape behind the puzzle poster. Off unless the parent picks it. */
  posterArt?: boolean
  /**
   * What to do when card texts are too long: bigger poster cards (more sheets) or
   * smaller letters. Unset = normal.
   */
  cardFit?: CardFit
  /** Text size of letters on pages (all children without their own); unset = normal. */
  textSize?: TextSize
  /**
   * The character drawn under long letters, bottom right, with a short exclamation. Its pose
   * follows from the letter, not from a choice; unset = none.
   */
  companion?: CompanionId | null
  /** Per child (by id): an own picture, or no background, on that child's sheets. */
  childDecorations?: Record<string, ChildDecoration>
}

/**
 * `shared` follows the common background; the others give one child their own: none, a
 * picture, a pattern or the drawn poster landscape.
 */
export type ChildBackground = 'shared' | 'none' | 'image' | 'pattern' | 'poster-art'

export interface ChildDecoration {
  background: ChildBackground
  image: StoredImageRef | null
  pattern?: PatternId | null
  /** This child's own text size; unset = follows the shared one. */
  textSize?: TextSize
}

/** What is behind one child's sheets: at most one of picture, pattern or drawn landscape. */
export interface SheetBackground {
  image: StoredImageRef | null
  pattern: PatternId | null
  posterArt: boolean
}

export function sheetBackground(decoration: Decoration, childId?: string): SheetBackground {
  const own = childId ? decoration.childDecorations?.[childId] : undefined
  if (own?.background === 'none') return { image: null, pattern: null, posterArt: false }
  if (own?.background === 'image' && own.image) return { image: own.image, pattern: null, posterArt: false }
  if (own?.background === 'pattern' && own.pattern) return { image: null, pattern: own.pattern, posterArt: false }
  if (own?.background === 'poster-art') return { image: null, pattern: null, posterArt: true }
  return {
    image: decoration.imageAsBackground ? decoration.image : null,
    pattern: decoration.pattern,
    posterArt: !!decoration.posterArt,
  }
}

export type CardFit = 'normal' | 'larger' | 'smaller'

export const EMPTY_DECORATION: Decoration = {
  pattern: null,
  inkSaver: false,
  image: null,
  imageAsBackground: false,
  imageOpacity: 0.25,
  puzzle: false,
}
