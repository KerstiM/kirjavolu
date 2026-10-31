import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/vue'
import { miniPages } from '@/domain/miniLayout'
import { runTemplates } from '@/domain/generators/templateGenerator'
import MiniSheet from '@/features/preview/mini/MiniSheet.vue'
import { ANIMALS, animalFor, colorFor } from '@/features/preview/mini/animals'
import type { GeneratedItem } from '@/domain/models'
import { BRITA, makeRequest } from './helpers'

describe('toddler card layout', () => {
  it('puts 12 cards on a sheet, snaking down the left and up the right column', () => {
    const pages = miniPages(24)
    expect(pages).toHaveLength(2)
    expect(pages[0]!.map((s) => [s.col, s.row])).toEqual([
      [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5],
      [1, 5], [1, 4], [1, 3], [1, 2], [1, 1], [1, 0],
    ])
    expect(pages[1]![0]!.index).toBe(12)
  })

  it('handles a partial last sheet', () => {
    const pages = miniPages(7)
    expect(pages).toHaveLength(1)
    expect(pages[0]).toHaveLength(7)
  })

  it('neighbouring cards get different animals and colours', () => {
    for (let i = 1; i < 24; i++) {
      expect(animalFor(i)).not.toBe(animalFor(i - 1))
      expect(colorFor(i)).not.toBe(colorFor(i - 1))
    }
    expect(new Set(ANIMALS).size).toBe(12)
  })
})

describe('toddler daily letters', () => {
  const items = runTemplates(makeRequest('letter', { occasionId: 'christmas', children: [BRITA], options: { startDate: '2026-12-01' } })).items

  it('hold one small thing per day', () => {
    for (const item of items.slice(1)) expect(item.body.split('\n\n')).toHaveLength(1)
    expect(items[0]!.body).toBe('Tere, väike Brita! Mina olen Päkapikk Tuduja. Ma olen nii väike, et mahun sinu sussi sisse.')
  })

  it('alternate between a little scene and something to do together', () => {
    expect(items[1]!.body).toMatch(/^Täiskasvanu abiga/)
    expect(items[2]!.body).not.toMatch(/^Täiskasvanu abiga/)
  })

  it('stay short, like cards for a one-year-old', () => {
    for (const item of items) expect(item.body.length).toBeLessThan(200)
  })

  it('render as sheets with a number, weekday and animal on every card', () => {
    const generated = items.map((item, i) => ({ ...item, id: `b${i}`, variant: 0, edited: false })) as GeneratedItem[]
    render(MiniSheet, { props: { items: generated, title: 'Brita · 24 maagilist kirja', uppercase: true } })
    expect(document.querySelectorAll('.mini-sheet')).toHaveLength(2)
    expect(document.querySelectorAll('.mini')).toHaveLength(24)
    expect(document.querySelectorAll('.mini__face svg')).toHaveLength(24)
    expect(document.querySelector('.mini__number')!.textContent).toBe('1.')
    expect(document.querySelector('.mini__weekday')!.textContent).toBe('teisipäev')
    expect(document.querySelector('.mini-sheet__label')!.textContent).toBe('Brita · 24 maagilist kirja, leht 1/2')
  })
})

describe('toddler cards do not repeat', () => {
  it('no text appears twice in a 24-card series', () => {
    for (const occasionId of ['christmas', 'easter', 'everyday'] as const) {
      const bodies = runTemplates(makeRequest('letter', { occasionId, children: [BRITA], options: { count: 24 } })).items.map(
        (item) => item.body,
      )
      expect(new Set(bodies).size).toBe(24)
    }
  })
})

describe('toddler finale', () => {
  it('ends the series with a wish for the big day', () => {
    const items = runTemplates(makeRequest('letter', { occasionId: 'christmas', children: [BRITA] })).items
    expect(items[23]!.body).toBe('Häid jõule, väike Brita! Päkapikk Tuduja kallistab sind. Musi-musi!')
  })
})
