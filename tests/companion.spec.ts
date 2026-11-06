import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { companionSvg, POSE_COUNT } from '@/components/brand/companion/art'
import {
  COMPANIONS,
  companionFor,
  companionLine,
  POSES_PER_COMPANION,
} from '@/components/brand/companion/companions'
import PrintableItem from '@/features/preview/PrintableItem.vue'
import { COMPANION_MM, letterHeightMm } from '@/features/preview/printFit'
import type { GeneratedItem } from '@/domain/models'

describe('letter companions', () => {
  it('has eight different poses for each of the three characters', () => {
    expect(POSE_COUNT).toBe(POSES_PER_COMPANION)
    for (const { id } of COMPANIONS) {
      const drawings = Array.from({ length: POSE_COUNT }, (_, pose) => companionSvg(id, pose))
      expect(new Set(drawings).size).toBe(POSE_COUNT)
      for (const svg of drawings) expect(svg).toMatch(/^<svg viewBox="0 0 200 250"[\s\S]*<\/svg>$/)
    }
  })

  it('wraps a pose number around instead of failing', () => {
    expect(companionSvg('janes', POSE_COUNT + 2)).toBe(companionSvg('janes', 2))
    expect(companionSvg('janes', -1)).toBe(companionSvg('janes', POSE_COUNT - 1))
  })

  it('gives a letter always the same pose, and eight letters in a row eight different ones', () => {
    expect(companionFor('creation-1', 3)).toEqual(companionFor('creation-1', 3))
    const poses = Array.from(
      { length: POSE_COUNT },
      (_, index) => companionFor('creation-1', index).pose,
    )
    expect(new Set(poses).size).toBe(POSE_COUNT)
  })

  it('writes an exclamation for every pose, with the child name when there is one', () => {
    for (const { id } of COMPANIONS) {
      for (let pose = 0; pose < POSE_COUNT; pose += 1) {
        for (const line of [0, 1, 2, 3, 4]) {
          const named = companionLine(id, pose, line, 'Mia')
          expect(named.length).toBeGreaterThan(5)
          expect(named).not.toContain('{nimi}')
          const anonymous = companionLine(id, pose, line)
          expect(anonymous).not.toContain('{nimi}')
          expect(anonymous.length).toBeGreaterThan(5)
        }
      }
    }
    expect(companionLine('pakapikk', 1, 0, 'Mia')).toBe('Mia, sulle on kiri!')
  })

  it('never says the same line twice in 24 letters, with or without a child name', () => {
    for (const { id } of COMPANIONS) {
      for (const name of ['Mia', undefined]) {
        const said = Array.from({ length: 24 }, (_, index) => {
          const { pose, line } = companionFor('creation-1', index)
          return companionLine(id, pose, line, name)
        })
        expect(new Set(said).size).toBe(24)
      }
    }
  })

  it('reserves room under the signature, so that a letter with a companion still fits its sheet', () => {
    const letter = {
      label: '',
      heading: 'Tere!',
      body: 'Sõna '.repeat(40).trim(),
      signature: 'Sinu Tipp-Topp',
    }
    const without = letterHeightMm(letter, 12, { sheet: 'page' })
    expect(letterHeightMm(letter, 12, { sheet: 'page', companion: true })).toBeCloseTo(
      without + COMPANION_MM,
    )
  })

  it('draws the character and its line under the letter, and nothing without one', () => {
    const item: GeneratedItem = {
      id: 'i1',
      kind: 'letter',
      label: '1. detsember',
      heading: 'Kallis Mia!',
      body: 'Tere!',
      signature: 'Päkapikk',
      variant: 0,
      edited: false,
    }
    const { container, rerender } = render(PrintableItem, {
      props: { item, companion: { id: 'janes', pose: 0, line: 'Tere, Mia!' } },
    })
    expect(screen.getByText('Tere, Mia!')).toBeInTheDocument()
    expect(container.querySelector('.paper__companion svg')).not.toBeNull()
    return rerender({ item, companion: null }).then(() => {
      expect(container.querySelector('.paper__companion')).toBeNull()
    })
  })
})

describe('no kisses in the letters', () => {
  it('has no "musi" in any text the helpers write or sign with', () => {
    const sources = import.meta.glob(
      ['/src/data/**/*.ts', '/src/domain/**/*.ts', '/src/components/brand/companion/*.ts'],
      {
        query: '?raw',
        import: 'default',
        eager: true,
      },
    ) as Record<string, string>
    const offenders = Object.entries(sources)
      .filter(([, text]) => /\bmusi(?!c)/i.test(text.replace(/Rasmusi|Ehmusi/g, '')))
      .map(([path]) => path)
    expect(offenders).toEqual([])
  })
})
