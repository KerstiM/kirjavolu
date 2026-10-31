import { describe, expect, it } from 'vitest'
import { runTemplates } from '@/domain/generators/templateGenerator'
import { SERIES_CLOSINGS } from '@/data/templates/letters'
import type { Tone } from '@/domain/models'
import { BRITA, JASPER, makeRequest, RUBEN } from './helpers'

const seriesTexts = (tone: Tone, plural: boolean) =>
  SERIES_CLOSINGS[tone].map((line) =>
    line({ v: (s, p) => (plural ? p : s), sender: '', vocab: { words: [], moods: [], greeting: '', sender: '', senderHome: '', prize: '' } }),
  )

describe('letter template quality', () => {
  const tones: Tone[] = ['humorous', 'magical', 'adventurous', 'heartwarming']

  it.each(tones)('a single %s letter never promises a next letter', (tone) => {
    for (let seed = 1; seed < 15; seed++) {
      const [item] = runTemplates(makeRequest('letter', { seed, general: { tone }, options: { count: 1 } })).items
      for (const text of seriesTexts(tone, false)) expect(item!.body).not.toContain(text)
    }
  })

  it('the last letter of a series never promises a next letter', () => {
    for (const tone of tones) {
      const items = runTemplates(makeRequest('letter', { general: { tone }, options: { count: 7 } })).items
      for (const text of seriesTexts(tone, false)) expect(items.at(-1)!.body).not.toContain(text)
    }
  })

  it('consecutive letters never share the opening or closing', () => {
    for (const seed of [1, 7, 42]) {
      const items = runTemplates(makeRequest('letter', { seed, occasionId: 'christmas', children: [RUBEN, JASPER, BRITA] })).items
      for (let i = 1; i < items.length; i++) {
        const prev = items[i - 1]!.body.split('\n\n')
        const cur = items[i]!.body.split('\n\n')
        expect(cur[0]).not.toBe(prev[0])
        expect(cur.at(-1)).not.toBe(prev.at(-1))
      }
    }
  })

  it('the 24th December letter is a Christmas Eve letter', () => {
    const items = runTemplates(makeRequest('letter', { occasionId: 'christmas', options: { startDate: '2026-12-01' } })).items
    expect(items[23]!.body).toContain('Täna on jõululaupäev!')
    expect(items.filter((i) => i.body.includes('jõululaupäev'))).toHaveLength(1)
  })

  it('occasion letters say why they are written', () => {
    const tooth = runTemplates(makeRequest('letter', { occasionId: 'lost-tooth', children: [JASPER] })).items[0]!.body
    expect(tooth).toMatch(/piimahamba|piimahammas/)
    const school = runTemplates(makeRequest('letter', { occasionId: 'school-start' })).items[0]!.body
    expect(school).toMatch(/kooliaasta|tarkusepäev/)
  })

  it('toddler letters use the occasion and simple closings', () => {
    const items = runTemplates(makeRequest('letter', { occasionId: 'easter', children: [BRITA], options: { count: 3 } })).items
    expect(items.some((i) => /muna|jänku|tibu/.test(i.body))).toBe(true)
    expect(items.every((i) => !i.body.includes('sulega, mis helendab'))).toBe(true)
  })

  it('a 24-letter series keeps personal lines from dominating', () => {
    const items = runTemplates(makeRequest('letter', { occasionId: 'christmas', children: [JASPER] })).items
    const counts = new Map<string, number>()
    for (const item of items) for (const p of item.body.split('\n\n')) counts.set(p, (counts.get(p) ?? 0) + 1)
    const repeated = [...counts.entries()].filter(([p, n]) => n > 3 && !p.startsWith('Tere! Mina olen'))
    expect(repeated).toEqual([])
  })
})

describe('story template quality', () => {
  it('companions help during the adventure, not only on page 1', () => {
    const items = runTemplates(
      makeRequest('story', { options: { genre: 'animals', extraCharacters: ['kaisukaru Mõmmi'] }, general: { length: 'medium' } }),
    ).items
    expect(items.slice(1).some((i) => i.body.includes('kaisukaru Mõmmi'))).toBe(true)
  })

  it('every paragraph starts with a capital letter or a quote', () => {
    for (const genre of ['fairytale', 'adventure', 'detective', 'space', 'animals', 'funny'] as const) {
      const items = runTemplates(
        makeRequest('story', { children: [RUBEN, JASPER], options: { genre, extraCharacters: ['kass Miisu'] }, general: { length: 'long' } }),
      ).items
      for (const p of items.flatMap((i) => i.body.split('\n\n'))) expect(p).toMatch(/^[„A-ZÕÄÖÜŠŽ]/)
    }
  })

  it('story moods are in the past tense', () => {
    const text = runTemplates(makeRequest('story', { occasionId: 'christmas' })).items[0]!.body
    expect(text).not.toMatch(/sajab vaikselt|lõhnab piparkookide/)
  })

  it('interest remarks appear at most twice per story', () => {
    const text = runTemplates(makeRequest('story', { general: { length: 'long' } })).items.map((i) => i.body).join(' ')
    const remarks = ['õige järjekord', 'leida võti', 'Miki Hiire koomiksis']
    expect(remarks.filter((r) => text.includes(r)).length).toBeLessThanOrEqual(2)
  })
})

describe('puzzle and hunt template quality', () => {
  it('shared hunts address the children in plural', () => {
    for (let seed = 1; seed < 20; seed++) {
      for (const setting of ['indoor', 'outdoor'] as const) {
        const items = runTemplates(
          makeRequest('treasure-hunt', { seed, children: [RUBEN, JASPER], options: { setting, clueCount: 8 } }),
        ).items
        for (const item of items) expect(item.body).not.toMatch(/\b(Otsi|Vaata|Piilu|Kaeva|Kontrolli) /)
      }
    }
  })

  it('ciphers never contain letters outside the cipher alphabet', () => {
    for (let seed = 1; seed < 40; seed++) {
      const items = runTemplates(makeRequest('puzzle', { seed, occasionId: 'halloween', options: { kind: 'cipher' } })).items
      for (const item of items) expect(item.answer).not.toContain('W')
    }
  })
})
