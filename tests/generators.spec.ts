import { describe, expect, it } from 'vitest'
import { runTemplates, templateGenerator, GenerationError } from '@/domain/generators/templateGenerator'
import { ageBand, adjustBand } from '@/domain/generators/audience'
import { beatIndexFor } from '@/domain/generators/letterGenerator'
import { decodeNumbers, isAnagram, shiftText, ESTONIAN_ALPHABET } from '@/domain/generators/puzzleTools'
import { CONTENT_TYPES } from '@/domain/contentTypes'
import { OCCASIONS } from '@/domain/occasions/occasions'
import { HUNT_LOCATIONS } from '@/data/templates/locations'
import type { ContentTypeId } from '@/domain/models'
import { BRITA, JASPER, makeRequest, RUBEN } from './helpers'

describe('age bands', () => {
  it('maps demo children to sensible bands', () => {
    expect(ageBand(RUBEN)).toBe('older')
    expect(ageBand(JASPER)).toBe('young')
    expect(ageBand(BRITA)).toBe('toddler')
  })

  it('difficulty shifts readers but never toddlers', () => {
    expect(adjustBand('young', 'harder')).toBe('older')
    expect(adjustBand('older', 'easier')).toBe('young')
    expect(adjustBand('toddler', 'harder')).toBe('toddler')
  })
})

describe('every content type × occasion combination', () => {
  const types = CONTENT_TYPES.map((t) => t.id) as ContentTypeId[]
  for (const type of types) {
    for (const occasion of OCCASIONS) {
      it(`${type} / ${occasion.id} produces non-empty items`, () => {
        const result = runTemplates(makeRequest(type, { occasionId: occasion.id, children: [RUBEN, JASPER, BRITA] }))
        expect(result.items.length).toBeGreaterThan(0)
        for (const item of result.items) {
          expect(item.body.trim().length).toBeGreaterThan(10)
          expect(item.body).not.toMatch(/undefined|NaN|\[object/)
        }
      })
    }
  }
})

describe('determinism', () => {
  it('same seed gives the same content, different seed differs', () => {
    const a = runTemplates(makeRequest('letter', { seed: 1, options: { count: 3 } }))
    const b = runTemplates(makeRequest('letter', { seed: 1, options: { count: 3 } }))
    const c = runTemplates(makeRequest('letter', { seed: 2, options: { count: 3 } }))
    expect(a.items).toEqual(b.items)
    expect(a.items.map((i) => i.body)).not.toEqual(c.items.map((i) => i.body))
  })
})

describe('letters', () => {
  it('24 Christmas letters are all different', () => {
    const result = runTemplates(makeRequest('letter', { occasionId: 'christmas', children: [RUBEN, JASPER] }))
    const bodies = result.items.map((i) => i.body)
    expect(bodies).toHaveLength(24)
    expect(new Set(bodies).size).toBe(24)
    expect(result.items[0]?.label).toMatch(/detsember/)
  })

  it('connected series always ends with the finale', () => {
    expect(beatIndexFor(0, 24, 12)).toBe(0)
    expect(beatIndexFor(23, 24, 12)).toBe(11)
    const result = runTemplates(makeRequest('letter', { occasionId: 'christmas', options: { count: 7, connected: true } }))
    expect(result.items.at(-1)?.body).toContain('Võlutäht on jälle minuga')
  })

  it('uses profile details and singular address for one child', () => {
    const result = runTemplates(makeRequest('letter', { children: [JASPER], general: { length: 'long' } }))
    const text = result.items.map((i) => i.body).join(' ')
    expect(result.items[0]?.heading).toBe('Kallis Jasper!')
    expect(text).toMatch(/riisiputru|Miki Hiire|mõistatuste/)
  })

  it('addresses siblings together and gives each a task', () => {
    const result = runTemplates(makeRequest('letter', { children: [RUBEN, JASPER, BRITA] }))
    const item = result.items[0]!
    expect(item.heading).toBe('Kallid Ruben, Jasper ja Brita!')
    expect(item.body).toContain('Ruben, sinu ülesanne on')
    expect(item.body).toContain('Brita, sinu ülesanne on')
  })

  it('uses simple language for a toddler', () => {
    const result = runTemplates(makeRequest('letter', { children: [BRITA], options: { count: 3 } }))
    expect(result.items.some((i) => /Täiskasvanu abiga/.test(i.body))).toBe(true)
    expect(result.instructions.some((ins) => ins.steps.some((s) => s.includes('Brita jaoks loe kiri ette')))).toBe(true)
  })

  it('occasion changes the content', () => {
    const easter = runTemplates(makeRequest('letter', { occasionId: 'easter' }))
    const tooth = runTemplates(makeRequest('letter', { occasionId: 'lost-tooth' }))
    expect(easter.items[0]?.signature).toContain('Lihavõttejänes')
    expect(tooth.instructions[0]?.steps.join(' ')).toContain('padja alla')
  })
})

describe('treasure hunts', () => {
  it('forms a consistent hiding chain ending at the prize', () => {
    const result = runTemplates(makeRequest('treasure-hunt', { options: { clueCount: 6 } }))
    expect(result.items).toHaveLength(6)
    const places = result.items.map((i) => i.answer)
    expect(new Set(places).size).toBe(6)
    expect(result.items[0]?.parentNote).toBe('Anna see kaart lapsele kätte.')
    result.items.slice(1).forEach((item, k) => {
      expect(item.parentNote).toBe(`Peida see kaart: ${places[k]}`)
    })
    expect(result.instructions[0]?.steps.at(-1)).toContain(`„${places.at(-1)}“`)
  })

  it('clues do not reveal the location name to readers', () => {
    const result = runTemplates(makeRequest('treasure-hunt', { children: [JASPER], options: { clueCount: 8 } }))
    for (const item of result.items) {
      const known = HUNT_LOCATIONS.find((l) => l.name === item.answer)
      if (known) expect(item.body.toLowerCase()).not.toContain(known.name.split(' ')[0]!.toLowerCase())
    }
  })

  it('uses parent-provided locations and supplements with defaults', () => {
    const result = runTemplates(
      makeRequest('treasure-hunt', { options: { clueCount: 4, locations: ['diivan', 'vanaema tool'] } }),
    )
    const answers = result.items.map((i) => i.answer)
    expect(answers).toContain('diivan')
    expect(answers).toContain('vanaema tool')
    expect(answers).toHaveLength(4)
  })

  it('custom location for an older child is a decodable number code', () => {
    const result = runTemplates(makeRequest('treasure-hunt', { options: { clueCount: 3, locations: ['garaaž', 'kelder', 'pööning'] } }))
    const item = result.items.find((i) => i.answer === 'kelder')!
    const code = /peidukoha: ([\d\-/ ]+)/.exec(item.body)?.[1]?.trim()
    expect(code && decodeNumbers(code)).toBe('KELDER')
  })

  it('cooperative hunt alternates turns between siblings', () => {
    const result = runTemplates(makeRequest('treasure-hunt', { children: [RUBEN, JASPER], options: { clueCount: 4 } }))
    expect(result.items.map((i) => i.forChild)).toEqual(['Ruben', 'Jasper', 'Ruben', 'Jasper'])
  })

  it('separate hunts give each child a full chain', () => {
    const result = runTemplates(
      makeRequest('treasure-hunt', { children: [RUBEN, JASPER], options: { clueCount: 3, cooperative: false } }),
    )
    expect(result.items.filter((i) => i.forChild === 'Ruben')).toHaveLength(3)
    expect(result.items.filter((i) => i.forChild === 'Jasper')).toHaveLength(3)
    expect(result.instructions.filter((i) => i.title.startsWith('Peitmise plaan'))).toHaveLength(2)
  })

  it('toddler clues are read aloud by an adult', () => {
    const result = runTemplates(makeRequest('treasure-hunt', { children: [BRITA] }))
    expect(result.items.every((i) => i.body.includes('Täiskasvanu loeb'))).toBe(true)
  })
})

describe('puzzles', () => {
  const kinds = ['cipher', 'riddle', 'anagram', 'math', 'sequence'] as const

  it.each(kinds)('%s puzzles always include an answer', (kind) => {
    for (const child of [RUBEN, JASPER]) {
      const result = runTemplates(makeRequest('puzzle', { children: [child], options: { kind, challengeCount: 6 } }))
      expect(result.items.every((i) => i.answer && i.answer.length > 0)).toBe(true)
    }
  })

  it('math answers are correct', () => {
    for (let seed = 1; seed < 30; seed++) {
      for (const child of [RUBEN, JASPER]) {
        const result = runTemplates(makeRequest('puzzle', { seed, children: [child], options: { kind: 'math', challengeCount: 4 } }))
        for (const item of result.items) {
          const body = item.body
          let m: RegExpExecArray | null
          if ((m = /sai (\d+) \S+\. Siis sai ta veel (\d+)/.exec(body))) expect(item.answer).toBe(String(+m[1]! + +m[2]!))
          else if ((m = /Korvis oli (\d+) \S+\. (\d+)/.exec(body))) expect(item.answer).toBe(String(+m[1]! - +m[2]!))
          else if ((m = /läheb (\d+) \S+\. Kotte on (\d+)\. Lisaks on laual veel (\d+)/.exec(body)))
            expect(item.answer).toBe(String(+m[1]! * +m[2]! + +m[3]!))
          else if ((m = /(\d+) sõpra jagavad (\d+)/.exec(body))) expect(item.answer).toBe(String(+m[2]! / +m[1]!))
          else expect(item.answer).toContain('54')
        }
      }
    }
  })

  it('older ciphers decode to the answer', () => {
    for (let seed = 1; seed < 20; seed++) {
      const result = runTemplates(makeRequest('puzzle', { seed, options: { kind: 'cipher', challengeCount: 3 } }))
      for (const item of result.items) {
        const shift = Number(/nihkunud (\d) koha/.exec(item.body)?.[1])
        const paragraphs = item.body.split('\n\n')
        const coded = paragraphs[paragraphs.findIndex((p) => p.startsWith('Iga täht')) + 1]!
        expect(shiftText(coded, -shift)).toBe(item.answer)
      }
    }
  })

  it('anagrams use exactly the letters of the answer', () => {
    const result = runTemplates(makeRequest('puzzle', { children: [JASPER], options: { kind: 'anagram', challengeCount: 5 } }))
    for (const item of result.items) {
      const scrambled = item.body.split('\n\n').find((p) => /^[A-ZÕÄÖÜŠŽ]+$/.test(p))!
      expect(isAnagram(item.answer!, scrambled)).toBe(true)
    }
  })

  it('number sequences continue correctly', () => {
    for (let seed = 1; seed < 30; seed++) {
      const result = runTemplates(makeRequest('puzzle', { seed, options: { kind: 'sequence', challengeCount: 3 } }))
      for (const item of result.items) {
        const nums = /\n\n([\d, ]+), \?/.exec(item.body)![1]!.split(', ').map(Number)
        const d1 = nums[1]! - nums[0]!
        const d2 = nums[2]! - nums[1]!
        const answer = Number(item.answer)
        if (nums[1] === nums[0]! * 2 && nums[2] === nums[1]! * 2) expect(answer).toBe(nums.at(-1)! * 2)
        else if (d1 === d2) expect(answer).toBe(nums.at(-1)! + d1)
        else expect(answer).toBe(nums.at(-1)! + d1)
      }
    }
  })

  it('secret code is encoded in the final card', () => {
    const result = runTemplates(makeRequest('puzzle', { children: [JASPER], options: { secretCode: 'Vaata diivani alla' } }))
    const last = result.items.at(-1)!
    expect(last.answer).toBe('VAATA DIIVANI ALLA')
    const code = last.body.split('\n\n')[1]!
    expect(decodeNumbers(code)).toBe('VAATA DIIVANI ALLA')
  })

  it('rubik fans get a cube puzzle', () => {
    const result = runTemplates(makeRequest('puzzle', { options: { kind: 'math', challengeCount: 2 } }))
    expect(result.items[0]?.answer).toContain('54')
  })

  it('cipher alphabet covers Estonian letters', () => {
    expect(ESTONIAN_ALPHABET).toContain('Õ')
    expect(ESTONIAN_ALPHABET).toContain('Ü')
  })
})

describe('stories, calendars, certificates', () => {
  it('story length controls page count and uses interests', () => {
    const short = runTemplates(makeRequest('story', { general: { length: 'short' } }))
    const long = runTemplates(makeRequest('story', { general: { length: 'long' } }))
    expect(short.items).toHaveLength(3)
    expect(long.items).toHaveLength(7)
    expect(long.items.map((i) => i.body).join(' ')).toMatch(/kuubik/)
  })

  it('toddler story is short and simple', () => {
    const result = runTemplates(makeRequest('story', { children: [BRITA], general: { length: 'medium' } }))
    expect(result.items[0]?.body).toContain('Brita on 1-aastane')
  })

  it('calendar fills every day without repeats', () => {
    const result = runTemplates(makeRequest('calendar', { occasionId: 'summer', children: [RUBEN, JASPER] }))
    expect(result.items).toHaveLength(30)
    expect(new Set(result.items.map((i) => i.heading)).size).toBe(30)
  })

  it('advent calendar is labelled with December dates and includes Christmas activities', () => {
    const result = runTemplates(makeRequest('calendar', { occasionId: 'christmas' }))
    expect(result.title).toBe('Advendikalender')
    expect(result.items[23]?.label).toBe('24. detsember')
    expect(result.items.some((i) => /Piparkoogi|Jõulu|lumehelbed/i.test(i.heading))).toBe(true)
  })

  it('certificates are made per child', () => {
    const result = runTemplates(makeRequest('certificate', { children: [RUBEN, JASPER] }))
    expect(result.items.map((i) => i.forChild)).toEqual(['Ruben', 'Jasper'])
  })
})

describe('TemplateGenerator', () => {
  it('rejects invalid requests with Estonian messages', async () => {
    await expect(templateGenerator.generate(makeRequest('story', { children: [] }))).rejects.toBeInstanceOf(GenerationError)
  })

  it('regenerates one item and keeps the others', async () => {
    const content = await templateGenerator.generate(makeRequest('letter', { options: { count: 3 } }))
    const next = await templateGenerator.regenerateItem(content, 1)
    expect(next.id).toBe(content.items[1]!.id)
    expect(next.body).not.toBe(content.items[1]!.body)
    expect(next.variant).toBeGreaterThan(0)
    expect(content.items.map((i) => i.body)).not.toContain(next.body)
  })

  it('regenerating a treasure-hunt clue keeps its hiding place', async () => {
    const content = await templateGenerator.generate(makeRequest('treasure-hunt', { children: [JASPER] }))
    const next = await templateGenerator.regenerateItem(content, 2)
    expect(next.answer).toBe(content.items[2]!.answer)
  })

  it('does not claim to be AI', () => {
    expect(templateGenerator.label).toContain('ilma tehisintellektita')
  })
})
