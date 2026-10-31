export interface PuzzleGrid {
  rows: number
  cols: number
  /** rows × cols; may exceed the number of items, the rest are "extra" pieces. */
  cells: number
  /** Width / height of one piece. */
  pieceAspect: number
}

/** Pieces close to a postcard shape are easiest to cut and assemble. */
const IDEAL_PIECE_ASPECT = 1.3

/**
 * Chooses a grid for `pieces` items over an image with aspect `imageAspect` (w/h).
 * Prefers grids without leftover cells and with pieces close to a postcard shape.
 */
export function computeGrid(pieces: number, imageAspect: number): PuzzleGrid {
  const n = Math.max(1, Math.floor(pieces))
  const aspect = imageAspect > 0 && Number.isFinite(imageAspect) ? imageAspect : 1
  let best: (PuzzleGrid & { score: number }) | null = null
  for (let rows = 1; rows <= n; rows++) {
    const cols = Math.ceil(n / rows)
    const cells = rows * cols
    const waste = cells - n
    if (waste > Math.ceil(n * 0.25)) continue
    const pieceAspect = (aspect * rows) / cols
    const score = waste * 0.6 + Math.abs(Math.log(pieceAspect / IDEAL_PIECE_ASPECT))
    if (!best || score < best.score) best = { rows, cols, cells, pieceAspect, score }
  }
  const { rows, cols, cells, pieceAspect } = best ?? { rows: 1, cols: n, cells: n, pieceAspect: aspect / n }
  return { rows, cols, cells, pieceAspect }
}

/** Row and column of piece `index` in reading order (left to right, top to bottom). */
export function piecePosition(index: number, grid: PuzzleGrid): { row: number; col: number } {
  return { row: Math.floor(index / grid.cols), col: index % grid.cols }
}

/** Printed piece size in centimetres, fitting a square of `maxCm`. */
export function pieceSizeCm(grid: PuzzleGrid, maxCm: number): { width: number; height: number } {
  return grid.pieceAspect >= 1
    ? { width: maxCm, height: maxCm / grid.pieceAspect }
    : { width: maxCm * grid.pieceAspect, height: maxCm }
}
