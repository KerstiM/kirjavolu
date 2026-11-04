// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import {
  handlePassStory,
  handleStoryFix,
  pageFixPrompt,
  parsePageFixInput,
  parseStoryInput,
  readStory,
  storyPrompt,
  type FixPage,
  type WriteStory,
} from './passStory'
import type { GenerationStore, LettersEnv } from './passLetters'
import type { SeasonPass } from './seasonPass'

const CODE = 'KV-7KQM-3FXA'
const VALID = { code: CODE, generationsLeft: 10, fixesLeft: 30, validUntil: '2027-01-31T21:59:59.000Z' }
const MIA = { name: 'Mia', age: 4, readingLevel: 'read-aloud', interests: ['hobused'], family: ['vend Markus', 'kass Miisu'] }
const MARKUS = { name: 'Markus', age: 7, readingLevel: 'beginner', interests: ['dinosaurused'] }
const STORY = { genre: 'fairytale', theme: 'courage', tone: 'magical', length: 'medium', extraCharacters: ['vanaema'], occasion: 'Jõulud', notes: '' }
const BODY = { code: CODE, children: [MIA], story: STORY }

function setup(pass: SeasonPass = VALID) {
  const row = { ...pass }
  const store: GenerationStore = {
    async spend(_code, now, allowance) {
      const field = allowance === 'generations' ? 'generationsLeft' : 'fixesLeft'
      if (new Date(row.validUntil) <= now) return 'expired'
      if (row[field] <= 0) return 'used_up'
      row[field]--
      return { ...row }
    },
    async refund(_code, allowance) {
      row[allowance === 'generations' ? 'generationsLeft' : 'fixesLeft']++
      return { ...row }
    },
  }
  const usage = new Map<string, string>()
  const env = {
    ANTHROPIC_API_KEY: 'test-key',
    PASS_LIMIT: { limit: async () => ({ success: true }) },
    USAGE: { get: async (key: string) => usage.get(key) ?? null, put: async (key: string, value: string) => void usage.set(key, value) },
  } as unknown as LettersEnv
  const write = vi.fn<WriteStory>(async () => ({ title: 'Mia ja täheratsu', pages: ['Üks.', 'Kaks.', 'Kolm.', 'Neli.', 'Viis.'] }))
  const fix = vi.fn<FixPage>(async () => 'Uus lehekülg.')
  return { env, row, write, fix, deps: { store, write, fix, now: () => new Date('2026-11-20T10:00:00Z') } }
}

const post = (path: string, body: unknown) =>
  new Request(`https://kirjavolu.ee/api/joulupass/${path}`, {
    method: 'POST',
    headers: { Origin: 'https://kirjavolu.ee', 'CF-Connecting-IP': '1.2.3.4' },
    body: JSON.stringify(body),
  })

describe('POST /api/joulupass/lugu', () => {
  it('writes the story and takes one generation', async () => {
    const { env, row, write, deps } = setup()
    const response = await handlePassStory(post('lugu', BODY), env, deps)
    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({ story: { title: 'Mia ja täheratsu' }, pass: { generationsLeft: 9, fixesLeft: 30 } })
    expect(row.generationsLeft).toBe(9)
    expect(write.mock.calls[0]?.[0]).toMatchObject({ genre: 'fairytale', length: 'medium', extraCharacters: ['vanaema'] })
  })

  it('gives the generation back when the AI fails, and refuses a used-up pass', async () => {
    const { env, row, write, deps } = setup()
    write.mockRejectedValueOnce(new Error('boom'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect((await handlePassStory(post('lugu', BODY), env, deps)).status).toBe(502)
    expect(row.generationsLeft).toBe(10)

    const empty = setup({ ...VALID, generationsLeft: 0 })
    expect((await handlePassStory(post('lugu', BODY), empty.env, empty.deps)).status).toBe(409)
    expect(empty.write).not.toHaveBeenCalled()
  })

  it('refuses unknown choices and missing children', () => {
    expect(parseStoryInput({ ...BODY, story: { ...STORY, genre: 'horror' } })).toBeNull()
    expect(parseStoryInput({ ...BODY, story: { ...STORY, length: 'epic' } })).toBeNull()
    expect(parseStoryInput({ ...BODY, children: [] })).toBeNull()
    expect(parseStoryInput({ ...BODY, children: [{ ...MIA, age: 40 }] })).toBeNull()
  })

  it('writes for the least practised reader and hands everything over as data in tags', () => {
    const prompt = storyPrompt(parseStoryInput({ ...BODY, children: [MIA, MARKUS] })!)
    expect(prompt).toContain('<laps>\nNimi: Mia\nVanus: 4\nHuvid ja lemmikud: hobused\n')
    expect(prompt).toContain('Pere ja lemmikloomad: vend Markus; kass Miisu')
    expect(prompt).toContain('Žanr: muinasjutt\nToon: maagiline\nÕpetlik teema: julgus')
    expect(prompt).toContain('Leheküljed: täpselt 5. Iga lehekülje pikkus: 50–80 sõna')
  })

  it('accepts only a title and exactly the pages asked for', () => {
    const pages = (n: number) => Array.from({ length: n }, () => ({ body: 'Tujuda tuli.' }))
    expect(readStory(JSON.stringify({ title: 'Lugu', pages: pages(5) }), 5).pages[0]).toBe('Tuduja tuli.')
    expect(() => readStory(JSON.stringify({ title: 'Lugu', pages: pages(4) }), 5)).toThrow()
    expect(() => readStory(JSON.stringify({ title: '', pages: pages(5) }), 5)).toThrow()
  })
})

const FIX = { ...BODY, title: 'Mia ja täheratsu', page: 2, text: 'Kaks.', before: 'Üks.', after: 'Kolm.', wish: 'lisa vanaema' }

describe('POST /api/joulupass/lugu/parandus', () => {
  it('rewrites one page and takes one fix, not a generation', async () => {
    const { env, row, fix, deps } = setup()
    const response = await handleStoryFix(post('lugu/parandus', FIX), env, deps)
    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({ body: 'Uus lehekülg.', pass: { generationsLeft: 10, fixesLeft: 29 } })
    expect(row.fixesLeft).toBe(29)
    expect(fix.mock.calls[0]?.[0]).toMatchObject({ page: 2, wish: 'lisa vanaema', before: 'Üks.' })
  })

  it('needs a wish, a page number and the text', () => {
    expect(parsePageFixInput({ ...FIX, wish: '' })).toBeNull()
    expect(parsePageFixInput({ ...FIX, page: 0 })).toBeNull()
    expect(parsePageFixInput({ ...FIX, text: ' ' })).toBeNull()
  })

  it('hands the page, its neighbours and the wish to the model inside tags', () => {
    const prompt = pageFixPrompt(parsePageFixInput(FIX)!)
    expect(prompt).toContain('<lehekülg number="2">\nKaks.\n</lehekülg>')
    expect(prompt).toContain('<eelmine>\nÜks.\n</eelmine>')
    expect(prompt).toContain('<soov>\nlisa vanaema\n</soov>')
  })
})
