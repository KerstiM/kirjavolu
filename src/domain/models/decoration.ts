export type PatternId = 'stars' | 'snow' | 'eggs' | 'confetti' | 'hearts' | 'leaves' | 'moons' | 'dots'

/** Metadata of an uploaded picture; the pixels live in IndexedDB under `id`. */
export interface StoredImageRef {
  id: string
  width: number
  height: number
}

/** Visual decoration of printable items. Purely presentational: never affects the texts. */
export interface Decoration {
  pattern: PatternId | null
  /** Draw the pattern only as a frame to save ink. */
  inkSaver: boolean
  image: StoredImageRef | null
  imageAsBackground: boolean
  /** Background picture opacity, 0.1–0.6. */
  imageOpacity: number
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
