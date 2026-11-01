import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/vue'
import {
  cellOf,
  cellsOnPage,
  computePoster,
  itemAt,
  pagePosition,
  pathGeometry,
  posterPages,
} from '@/domain/posterLayout'
import { formatDayMonth, weekdayName } from '@/domain/text/estonian'
import { defaultLayoutFor, runTemplates } from '@/domain/generators/templateGenerator'
import PosterBoard from '@/features/preview/poster/PosterBoard.vue'
import PosterGuide from '@/features/preview/poster/PosterGuide.vue'
import type { GeneratedItem } from '@/domain/models'
import { BRITA, JASPER, makeRequest, RUBEN } from './helpers'

describe('poster geometry', () => {
  it('24 letters: 4 columns × 6 rows over 2 × 2 sheets', () => {
    expect(computePoster(24)).toMatchObject({ cols: 4, rows: 6, rowsPerPage: 3, pageCols: 2, pageRows: 2, pages: 4 })
  })

  it('larger cards for long texts: two rows per sheet, more sheets', () => {
    expect(computePoster(24, { large: true })).toMatchObject({ cols: 4, rows: 6, rowsPerPage: 2, pageRows: 3, pages: 6 })
    expect(computePoster(7, { large: true })).toMatchObject({ rowsPerPage: 2, pages: 2 })
    expect(computePoster(24, { large: true }).cellHeightMm).toBeGreaterThan(computePoster(24).cellHeightMm)
  })

  it('follows a snake path: down, up, down, up', () => {
    const layout = computePoster(24)
    expect(cellOf(0, layout)).toEqual({ col: 0, row: 0 })
    expect(cellOf(5, layout)).toEqual({ col: 0, row: 5 })
    expect(cellOf(6, layout)).toEqual({ col: 1, row: 5 })
    expect(cellOf(11, layout)).toEqual({ col: 1, row: 0 })
    expect(cellOf(12, layout)).toEqual({ col: 2, row: 0 })
    expect(cellOf(23, layout)).toEqual({ col: 3, row: 0 })
  })

  it('first sheet holds days 1–3 on the left and 12, 11, 10 on the right', () => {
    const layout = computePoster(24)
    const [first] = posterPages(layout)
    const days = cellsOnPage(first!, layout).map((cell) => (itemAt(cell, layout) ?? -1) + 1)
    expect(days).toEqual([1, 12, 2, 11, 3, 10])
    expect(pagePosition(first!, layout)).toBe('pildi ülemine pool, vasak')
  })

  it('every item appears exactly once across the sheets', () => {
    for (const n of [3, 7, 12, 13, 24, 30]) {
      const layout = computePoster(n)
      const seen = posterPages(layout)
        .flatMap((page) => cellsOnPage(page, layout))
        .map((cell) => itemAt(cell, layout))
        .filter((index): index is number => index !== null)
      expect(seen.sort((a, b) => a - b)).toEqual(Array.from({ length: n }, (_, i) => i))
    }
  })

  it('consecutive days are neighbours, so the track never jumps', () => {
    const layout = computePoster(24)
    for (let i = 1; i < 24; i++) {
      const a = cellOf(i - 1, layout)
      const b = cellOf(i, layout)
      expect(Math.abs(a.col - b.col) + Math.abs(a.row - b.row)).toBe(1)
    }
    expect(pathGeometry(layout).stations).toHaveLength(23)
  })

  it('small series fit on one sheet', () => {
    expect(computePoster(7)).toMatchObject({ cols: 2, pages: 1, rowsPerPage: 4 })
  })
})

describe('dates and default layout', () => {
  it('knows Estonian weekdays', () => {
    expect(weekdayName('2026-12-01')).toBe('teisipäev')
    expect(weekdayName('2026-12-24')).toBe('neljapäev')
    expect(formatDayMonth('2026-12-24')).toBe('24. detsember')
  })

  it('daily letters carry their date', () => {
    const items = runTemplates(makeRequest('letter', { occasionId: 'christmas', options: { startDate: '2026-12-01' } })).items
    expect(items[0]?.date).toBe('2026-12-01')
    expect(items[23]?.date).toBe('2026-12-24')
  })

  it('long letter series default to the poster, toddler series to simple cards', () => {
    expect(defaultLayoutFor(makeRequest('letter', { occasionId: 'christmas', children: [RUBEN] }))).toBe('poster')
    expect(defaultLayoutFor(makeRequest('letter', { occasionId: 'christmas', children: [BRITA] }))).toBe('mini')
    expect(defaultLayoutFor(makeRequest('letter', { options: { count: 1 } }))).toBe('page')
  })
})

describe('poster components', () => {
  const items = runTemplates(makeRequest('letter', { occasionId: 'christmas', children: [JASPER], options: { startDate: '2026-12-01' } }))
    .items.map((item, i) => ({ ...item, id: `i${i}`, variant: 0, edited: false })) as GeneratedItem[]

  it('renders four labelled sheets with all 24 cards, dates and weekdays', () => {
    render(PosterBoard, {
      props: { items, occasionId: 'christmas', title: 'Jasper · 24 maagilist kirja', imageUrl: null, pattern: null, uppercase: true },
    })
    expect(document.querySelectorAll('.sheet')).toHaveLength(4)
    expect(document.querySelectorAll('.card')).toHaveLength(24)
    expect(screen.getByText('Jasper · 24 maagilist kirja, leht 3/4: pildi alumine pool, vasak')).toBeInTheDocument()
    expect(screen.getByText('1. detsember')).toBeInTheDocument()
    expect(screen.getAllByText('teisipäev').length).toBeGreaterThan(0)
  })

  it('draws no picture and no path unless the parent picks the poster picture', () => {
    const props = { items, occasionId: 'christmas' as const, title: 'x', imageUrl: null, pattern: null, uppercase: false }
    const { unmount } = render(PosterBoard, { props })
    expect(document.querySelectorAll('.sheet__layer polyline')).toHaveLength(0)
    unmount()
    render(PosterBoard, { props: { ...props, art: true } })
    expect(document.querySelectorAll('.sheet__layer polyline').length).toBeGreaterThan(0)
  })

  it('uses the uploaded picture across the whole poster', () => {
    render(PosterBoard, {
      props: { items, occasionId: 'christmas', title: 'x', imageUrl: 'data:image/png;base64,x', pattern: null, uppercase: false },
    })
    const slices = [...document.querySelectorAll<HTMLImageElement>('.sheet__image')]
    expect(slices).toHaveLength(4)
    expect(slices[3]!.style.left).toBe('-100%')
    expect(slices[3]!.style.top).toBe('-100%')
    expect(slices[3]!.style.width).toBe('200%')
  })

  it('guide shows where every day goes', () => {
    render(PosterGuide, { props: { count: 24, labels: items.map((_, i) => `${i + 1}. dets`) } })
    expect(screen.getByText('Pusleplakati kokkupanek')).toBeInTheDocument()
    expect(document.querySelectorAll('.map td')).toHaveLength(24)
  })
})

describe('compact daily series', () => {
  it('drops filler openings so the cards get to the point', async () => {
    const { OPENINGS } = await import('@/data/templates/letters')
    const v = (s: string) => s
    const fillers = Object.values(OPENINGS)
      .flat()
      .map((line) => line({ v, sender: 'Päkapikk Tuduja', vocab: { words: [], moods: [], greeting: '', sender: '', senderHome: '', prize: '' } }))
    const items = runTemplates(makeRequest('letter', { occasionId: 'christmas' })).items
    for (const item of items.slice(1)) expect(fillers).not.toContain(item.body.split('\n\n')[0])
  })

  it('daily letters are whole stories of a few paragraphs, not a list of fragments', () => {
    const items = runTemplates(makeRequest('letter', { occasionId: 'christmas' })).items
    for (const item of items) expect(item.body.split('\n\n').length).toBeLessThanOrEqual(5)
    expect(items.filter((item) => item.body.split('\n\n').length >= 3).length).toBeGreaterThanOrEqual(12)
  })
})
