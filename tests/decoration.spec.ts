import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { computeGrid, piecePosition, pieceSizeCm } from '@/domain/puzzleGrid'
import { fitWithin } from '@/utils/imageStore'
import { patternsFor, PATTERN_LABELS } from '@/domain/patterns'
import PrintableItem from '@/features/preview/PrintableItem.vue'
import PuzzlePiece from '@/features/preview/decoration/PuzzlePiece.vue'
import AssemblyGuide from '@/features/preview/decoration/AssemblyGuide.vue'
import { EMPTY_DECORATION, sheetBackground, type GeneratedItem } from '@/domain/models'

describe('puzzle grid', () => {
  it('24 advent letters on a landscape photo form a full 6 × 4 grid', () => {
    expect(computeGrid(24, 4 / 3)).toMatchObject({ rows: 4, cols: 6, cells: 24 })
  })

  it('always has room for every item and never wastes more than a quarter', () => {
    for (const n of [1, 2, 3, 5, 7, 11, 13, 24, 30]) {
      for (const aspect of [0.75, 1, 4 / 3, 16 / 9]) {
        const grid = computeGrid(n, aspect)
        expect(grid.cells).toBeGreaterThanOrEqual(n)
        expect(grid.cells - n).toBeLessThanOrEqual(Math.ceil(n * 0.25))
        expect(grid.rows * grid.cols).toBe(grid.cells)
      }
    }
  })

  it('handles a single item and invalid aspect ratios', () => {
    expect(computeGrid(1, 1.5).cells).toBe(1)
    expect(computeGrid(4, Number.NaN).cells).toBeGreaterThanOrEqual(4)
  })

  it('numbers pieces left to right, top to bottom', () => {
    const grid = computeGrid(24, 4 / 3)
    expect(piecePosition(0, grid)).toEqual({ row: 0, col: 0 })
    expect(piecePosition(6, grid)).toEqual({ row: 1, col: 0 })
    expect(piecePosition(23, grid)).toEqual({ row: 3, col: 5 })
  })

  it('piece size fits the requested square and keeps the aspect ratio', () => {
    const grid = computeGrid(24, 4 / 3)
    const size = pieceSizeCm(grid, 8)
    expect(Math.max(size.width, size.height)).toBeCloseTo(8)
    expect(size.width / size.height).toBeCloseTo(grid.pieceAspect)
  })
})

describe('image scaling', () => {
  it('downscales large photos and never upscales small ones', () => {
    expect(fitWithin(4000, 3000)).toEqual({ width: 2000, height: 1500 })
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 })
  })
})

describe('patterns', () => {
  it('lists every pattern once, the suggested ones first', () => {
    const list = patternsFor('christmas')
    expect(list.slice(0, 2)).toEqual(['snow', 'stars'])
    expect(new Set(list).size).toBe(Object.keys(PATTERN_LABELS).length)
  })
})

describe('decorated printable items', () => {
  const item: GeneratedItem = {
    id: 'a',
    kind: 'letter',
    label: '1. kiri',
    heading: 'Kallis Ruben!',
    body: 'Tekst.',
    variant: 0,
    edited: false,
  }

  it('draws a pattern background and a soft panel for the text', () => {
    const { container } = render(PrintableItem, { props: { item, pattern: 'snow', inkSaver: false } })
    expect(container.querySelector('svg.pattern')).not.toBeNull()
    expect(container.querySelector('.paper')!.classList.contains('has-backdrop')).toBe(true)
  })

  it('ink-saver mode draws only a frame', () => {
    const { container } = render(PrintableItem, { props: { item, pattern: 'snow', inkSaver: true } })
    expect(container.querySelector('svg.pattern rect[fill="none"]')).not.toBeNull()
    expect(container.querySelector('.paper')!.classList.contains('has-frame')).toBe(true)
  })

  it('shows a numbered puzzle piece cut from the right place', () => {
    const grid = computeGrid(24, 4 / 3)
    render(PuzzlePiece, { props: { imageUrl: 'data:image/png;base64,x', grid, index: 7, maxCm: 8 } })
    expect(screen.getByText(/Puslekild 8\/24/)).toBeInTheDocument()
    const img = document.querySelector('.piece__img') as HTMLImageElement
    expect(img.style.left).toBe('-100%')
    expect(img.style.top).toBe('-100%')
    expect(img.style.width).toBe('600%')
  })

  it('assembly guide offers the extra pieces that are not in any item', () => {
    const grid = computeGrid(7, 1)
    render(AssemblyGuide, { props: { imageUrl: 'data:image/png;base64,x', grid, itemCount: 7 } })
    expect(screen.getByText('Pusle kokkupanek')).toBeInTheDocument()
    const extras = grid.cells - 7
    expect(document.querySelectorAll('.piece')).toHaveLength(extras)
  })
})

describe('sheet background per child', () => {
  const image = { id: 'shared', width: 800, height: 600 }
  const own = { id: 'mia', width: 800, height: 600 }
  const shared = { ...EMPTY_DECORATION, image, imageAsBackground: true }

  it('follows the shared background unless the child has a choice of their own', () => {
    expect(sheetBackground(shared, 'jasper').image).toBe(image)
    expect(sheetBackground({ ...EMPTY_DECORATION, pattern: 'stars' }, 'jasper').pattern).toBe('stars')
  })

  it('gives a child their own picture or no background at all', () => {
    const decoration = {
      ...shared,
      childDecorations: {
        mia: { background: 'image' as const, image: own },
        brita: { background: 'none' as const, image: null },
      },
    }
    expect(sheetBackground(decoration, 'mia').image).toBe(own)
    expect(sheetBackground(decoration, 'brita')).toEqual({ image: null, pattern: null, posterArt: false })
    expect(sheetBackground(decoration, 'jasper').image).toBe(image)
  })

  it('falls back to the shared background while an own picture is not uploaded yet', () => {
    const decoration = { ...shared, childDecorations: { mia: { background: 'image' as const, image: null } } }
    expect(sheetBackground(decoration, 'mia').image).toBe(image)
  })
})
