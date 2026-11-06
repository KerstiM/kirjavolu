import type { GeneratedItem } from '../../domain/models'

/**
 * Print size of a letter's text, so that a letter fits its sheet at 100% print scale, and
 * whether it fits at all.
 *
 * The browser lays the page out for print only after the print dialog opens, so the text
 * cannot be measured beforehand; instead the lines are estimated from the print geometry
 * below (PrintableItem's and PreviewPage's print styles, A4 inside the 14mm @page margins).
 * The estimate errs on the long side. A letter that does not fit even at `MIN_PT` makes the
 * half page unavailable (PreviewPage); should a text still run longer, the sheet grows and
 * moves to the next page rather than cutting the text.
 */
export type FitSheet = 'half' | 'page' | 'cards'

const MM_PER_PT = 25.4 / 72
/**
 * Paper in print (mm), see `.sheet--*` in PreviewPage: half and whole pages are 182 mm wide;
 * four cards on a sheet are two columns of 88 mm (6 mm gap) and two rows of 118 mm. Every
 * sheet's height stays within the ~251 mm Safari prints on an A4 page.
 */
export const SHEET_HEIGHT_MM: Record<FitSheet, number> = { half: 120, page: 245, cards: 118 }
const SHEET_WIDTH_MM: Record<FitSheet, number> = { half: 182, page: 182, cards: 88 }
/**
 * Text size range per sheet. Pages may go down to 10 pt, which still reads well; the cards'
 * 11 pt is not made smaller – a letter too long for a card goes on a half or whole page.
 */
const PT_RANGE: Record<FitSheet, { max: number; min: number }> = {
  half: { max: 12, min: 10 },
  page: { max: 12, min: 10 },
  cards: { max: 11, min: 11 },
}
/** Paper padding in print: 9mm top, 8mm bottom, 10mm sides. */
const PAD_V = 17
const PAD_H = 20
/** The white panel over a background picture: 1.1rem × 1.25rem padding. */
const BACKDROP_V = 9.4
const BACKDROP_H = 10.6
/** Lora's average character width in em, with Estonian text; capitals are wider. */
const CHAR_EM = 0.47
const CHAR_EM_UPPER = 0.6
const LINE = 1.55
/** Room left for other browsers' line breaks (Safari wraps a little differently). */
const SAFETY_MM = 4
const SIGNATURE_LINE = 1.6

export const MAX_PT = 12
export const MIN_PT = 10
const STEP_PT = 0.5

type Letter = Pick<GeneratedItem, 'label' | 'heading' | 'body' | 'signature'>

export interface FitOptions {
  sheet: FitSheet
  uppercase?: boolean
  /** A background picture or pattern puts the text on a padded panel. */
  backdrop?: boolean
  /** Smaller text (14 px): pages start from `SMALLER_PT` instead of their usual largest size. */
  smaller?: boolean
}
/** 14 px. */
export const SMALLER_PT = 10.5

function lines(text: string, widthMm: number, pt: number, charEm: number): number {
  const perLine = Math.floor(widthMm / (pt * MM_PER_PT * charEm))
  // Word wrapping leaves the end of a line empty: count whole words, not characters.
  let count = 1
  let used = 0
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const length = word.length + (used > 0 ? 1 : 0)
    if (used + length > perLine && used > 0) {
      count += 1
      used = word.length
    } else used += length
  }
  return count
}

/** Estimated height (mm) of the letter's content at body size `pt`. */
export function letterHeightMm(item: Letter, pt: number, options: FitOptions): number {
  const width = SHEET_WIDTH_MM[options.sheet] - PAD_H - (options.backdrop ? BACKDROP_H : 0)
  const charEm = options.uppercase ? CHAR_EM_UPPER : CHAR_EM
  let height = PAD_V + (options.backdrop ? BACKDROP_V : 0)
  if (item.label) height += 8.5 * 1.6 * MM_PER_PT + 1.5
  // The heading is 1.5× the body text (18pt at 12pt), on one line.
  if (item.heading) height += pt * 1.5 * 1.2 * MM_PER_PT + 3.8
  for (const paragraph of item.body.split(/\n{2,}/).filter((p) => p.trim())) {
    const rows = paragraph.split('\n').reduce((sum, row) => sum + lines(row, width, pt, charEm), 0)
    height += (rows * LINE + 0.75) * pt * MM_PER_PT
  }
  if (item.signature) {
    // The signature's top margin takes the place of the last paragraph's bottom margin.
    const rows = item.signature.split('\n').reduce((sum, row) => sum + lines(row, width, pt, charEm), 0)
    height += 3.2 - 0.75 * pt * MM_PER_PT + rows * SIGNATURE_LINE * pt * MM_PER_PT
  }
  return height
}

/** The largest body size (pt) at which the letter fits its sheet; the sheet's smallest if none does. */
export function printTextPt(item: Letter, options: FitOptions): number {
  const { min } = PT_RANGE[options.sheet]
  const max = options.smaller && options.sheet !== 'cards' ? Math.min(PT_RANGE[options.sheet].max, SMALLER_PT) : PT_RANGE[options.sheet].max
  const room = SHEET_HEIGHT_MM[options.sheet] - SAFETY_MM
  for (let pt = max; pt > min; pt -= STEP_PT) if (letterHeightMm(item, pt, options) <= room) return pt
  return min
}

/** Whether the letter fits its sheet at the sheet's smallest print size. */
export function fitsSheet(item: Letter, options: FitOptions): boolean {
  return letterHeightMm(item, PT_RANGE[options.sheet].min, options) <= SHEET_HEIGHT_MM[options.sheet] - SAFETY_MM
}

/**
 * How much of the body fits the sheet at its smallest print size: the characters up to the
 * last whole word that still fits, the body's length when all of it fits. What follows is
 * the part to shorten (shown red in the editor).
 */
export function fittingChars(item: Letter, options: FitOptions): number {
  if (fitsSheet(item, options)) return item.body.length
  const ends = [...item.body.matchAll(/\S+/g)].map((match) => match.index + match[0].length)
  let low = 0
  let high = ends.length
  // The longest run of whole words that fits; fitting only gets harder as words are added.
  while (low < high) {
    const mid = Math.ceil((low + high) / 2)
    if (fitsSheet({ ...item, body: item.body.slice(0, ends[mid - 1]) }, options)) low = mid
    else high = mid - 1
  }
  return low === 0 ? 0 : (ends[low - 1] as number)
}
