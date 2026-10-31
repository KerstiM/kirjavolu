/**
 * Geometry of the puzzle poster: letter cards laid out along a snake-shaped path
 * (first column down, second up, third down …) over a picture that spans several
 * A4 sheets. Cutting the sheets along the card borders gives one piece per day;
 * putting all pieces back together rebuilds the picture and the path.
 */

/** Printable area of an A4 sheet with 14 mm margins, in millimetres. */
export const PAGE_WIDTH_MM = 182
export const PAGE_HEIGHT_MM = 269
/** Height of the poster part of a sheet; the rest is the assembly label. */
export const POSTER_HEIGHT_MM = 262

const COLUMNS_PER_PAGE = 2
const MAX_ROWS_PER_PAGE = 4

export interface PosterLayout {
  count: number
  /** Columns of the whole poster. */
  cols: number
  /** Cards per column along the path. */
  rows: number
  rowsPerPage: number
  pageCols: number
  pageRows: number
  pages: number
  cellWidthMm: number
  cellHeightMm: number
}

export interface PosterCell {
  col: number
  row: number
}

export interface PosterPage {
  index: number
  pageCol: number
  pageRow: number
}

export function computePoster(count: number): PosterLayout {
  const n = Math.max(1, Math.floor(count))
  const cols = n > 12 ? 4 : 2
  const rows = Math.ceil(n / cols)
  const pageRows = Math.ceil(rows / MAX_ROWS_PER_PAGE)
  const rowsPerPage = Math.ceil(rows / pageRows)
  const pageCols = cols / COLUMNS_PER_PAGE
  return {
    count: n,
    cols,
    rows,
    rowsPerPage,
    pageCols,
    pageRows,
    pages: pageCols * pageRows,
    cellWidthMm: PAGE_WIDTH_MM / COLUMNS_PER_PAGE,
    cellHeightMm: POSTER_HEIGHT_MM / rowsPerPage,
  }
}

/** Cell of item `index` on the snake path. */
export function cellOf(index: number, layout: PosterLayout): PosterCell {
  const col = Math.floor(index / layout.rows)
  const step = index % layout.rows
  return { col, row: col % 2 === 0 ? step : layout.rows - 1 - step }
}

/** Item shown in a cell, or null for an empty cell at the end of the path. */
export function itemAt(cell: PosterCell, layout: PosterLayout): number | null {
  if (cell.row >= layout.rows) return null
  const step = cell.col % 2 === 0 ? cell.row : layout.rows - 1 - cell.row
  const index = cell.col * layout.rows + step
  return index < layout.count ? index : null
}

/** Sheets in reading order: top-left, top-right, bottom-left, bottom-right. */
export function posterPages(layout: PosterLayout): PosterPage[] {
  const pages: PosterPage[] = []
  for (let pageRow = 0; pageRow < layout.pageRows; pageRow++) {
    for (let pageCol = 0; pageCol < layout.pageCols; pageCol++) {
      pages.push({ index: pages.length, pageCol, pageRow })
    }
  }
  return pages
}

/** Cells drawn on one sheet. */
export function cellsOnPage(page: PosterPage, layout: PosterLayout): PosterCell[] {
  const cells: PosterCell[] = []
  for (let r = 0; r < layout.rowsPerPage; r++) {
    for (let c = 0; c < COLUMNS_PER_PAGE; c++) {
      cells.push({ col: page.pageCol * COLUMNS_PER_PAGE + c, row: page.pageRow * layout.rowsPerPage + r })
    }
  }
  return cells
}

/** Where the sheet goes in the finished poster, e.g. "pildi ülemine pool, vasak". */
export function pagePosition(page: PosterPage, layout: PosterLayout): string {
  const vertical =
    layout.pageRows === 1
      ? ''
      : layout.pageRows === 2
        ? page.pageRow === 0
          ? 'pildi ülemine pool'
          : 'pildi alumine pool'
        : `pildi ${page.pageRow + 1}. rida`
  const horizontal = layout.pageCols === 1 ? '' : page.pageCol === 0 ? 'vasak' : 'parem'
  return [vertical, horizontal].filter(Boolean).join(', ') || 'terve pilt'
}

/** Centre of a cell in poster millimetres. */
export function cellCenterMm(cell: PosterCell, layout: PosterLayout): { x: number; y: number } {
  return {
    x: (cell.col + 0.5) * layout.cellWidthMm,
    y: (cell.row + 0.5) * layout.cellHeightMm,
  }
}

/** Track through all card centres in day order, plus a station between each pair of days. */
export function pathGeometry(layout: PosterLayout): {
  points: { x: number; y: number }[]
  stations: { x: number; y: number }[]
} {
  const points = Array.from({ length: layout.count }, (_, i) => cellCenterMm(cellOf(i, layout), layout))
  const stations = points.slice(1).map((point, i) => {
    const prev = points[i] as { x: number; y: number }
    return { x: (prev.x + point.x) / 2, y: (prev.y + point.y) / 2 }
  })
  return { points, stations }
}
