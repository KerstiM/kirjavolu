/** Toddler cards: two columns of six on each A4 sheet. */
export const MINI_ROWS = 6
const PER_PAGE = MINI_ROWS * 2

export interface MiniSlot {
  index: number
  col: number
  row: number
}

/**
 * Cards per sheet. Within a sheet the order snakes like on the poster: the left
 * column top to bottom, then the right column bottom to top.
 */
export function miniPages(count: number): MiniSlot[][] {
  const pages: MiniSlot[][] = []
  for (let start = 0; start < count; start += PER_PAGE) {
    const page: MiniSlot[] = []
    for (let k = 0; k < PER_PAGE && start + k < count; k++) {
      const col = k < MINI_ROWS ? 0 : 1
      const row = col === 0 ? k : PER_PAGE - 1 - k
      page.push({ index: start + k, col, row })
    }
    pages.push(page)
  }
  return pages
}
