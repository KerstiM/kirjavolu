// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import {
  fixPrompt,
  handleLetterFix,
  handlePassLetters,
  parseFixInput,
  parseSeriesInput,
  readSeries,
  seriesPrompt,
  SERIES_LENGTH,
  type FixLetter,
  type GenerationStore,
  type LettersEnv,
  type WriteSeries,
} from './passLetters'
import type { SeasonPass } from './seasonPass'

const CODE = 'KV-7KQM-3FXA'
const NOW = new Date('2026-11-20T10:00:00Z')
const JASPER = { name: 'Jasper', age: 6, readingLevel: 'independent', interests: ['mõistatused'] }
const LETTER = { heading: 'Kallis Jasper!', body: 'Tere!\n\nMina olen päkapikk.', signature: 'Sinu päkapikk Tuduja' }
const SERIES = Array.from({ length: SERIES_LENGTH }, () => LETTER)

const VALID = { code: CODE, generationsLeft: 10, fixesLeft: 30, validUntil: '2027-01-31T21:59:59.000Z' }
const FIELD = { generations: 'generationsLeft', fixes: 'fixesLeft' } as const

/** Behaves like the UPDATE … WHERE <column> > 0 AND valid_until > now in D1. */
function memoryStore(pass: SeasonPass | null) {
  const rows = new Map(pass ? [[pass.code, { ...pass }]] : [])
  const store: GenerationStore = {
    async spend(code, now, allowance) {
      const row = rows.get(code)
      if (!row) return 'not_found'
      if (new Date(row.validUntil) <= now) return 'expired'
      if (row[FIELD[allowance]] <= 0) return 'used_up'
      row[FIELD[allowance]]--
      return { ...row }
    },
    async refund(code, allowance) {
      const row = rows.get(code)
      if (!row) return null
      row[FIELD[allowance]]++
      return { ...row }
    },
  }
  return { store, rows }
}

function setup(pass: SeasonPass | null = VALID, options: { burstOk?: boolean; seriesPerDay?: string } = {}) {
  const usage = new Map<string, string>()
  const env = {
    ANTHROPIC_API_KEY: 'test-key',
    PASS_LIMIT: { limit: async () => ({ success: options.burstOk ?? true }) },
    USAGE: {
      get: async (key: string) => usage.get(key) ?? null,
      put: async (key: string, value: string) => void usage.set(key, value),
    },
    PASS_SERIES_DAILY_LIMIT: options.seriesPerDay,
  } as unknown as LettersEnv
  const { store, rows } = memoryStore(pass)
  const write = vi.fn<WriteSeries>(async () => SERIES)
  const fix = vi.fn<FixLetter>(async () => ({ ...LETTER, body: 'Uus tekst.' }))
  return { env, rows, write, fix, usage, deps: { store, write, fix, now: () => NOW } }
}

const post = (body: unknown, headers: Record<string, string> = {}) =>
  new Request('https://kirjavolu.ee/api/joulupass/kirjad', {
    method: 'POST',
    headers: { Origin: 'https://kirjavolu.ee', 'CF-Connecting-IP': '1.2.3.4', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })

describe('POST /api/joulupass/kirjad', () => {
  it('writes the series and takes exactly one generation', async () => {
    const { env, rows, write, deps } = setup()
    const response = await handlePassLetters(post({ code: 'kv-7kqm-3fxa', child: { ...JASPER, family: 'x' } }), env, deps)
    expect(response.status).toBe(200)
    const data = (await response.json()) as { letters: unknown[]; pass: SeasonPass }
    expect(data.letters).toHaveLength(SERIES_LENGTH)
    expect(data.pass.generationsLeft).toBe(9)
    expect(rows.get(CODE)?.generationsLeft).toBe(9)
    // Only what the letters use goes to the AI; anything else in the request is dropped.
    expect(write).toHaveBeenCalledWith(expect.not.objectContaining({ family: 'x' }), 'test-key')
    expect(write.mock.calls[0]?.[0]).toMatchObject({ name: 'Jasper', age: 6, readingLevel: 'independent', interests: ['mõistatused'] })
  })

  it('refuses an expired code without asking the AI', async () => {
    const { env, write, deps } = setup({ ...VALID, validUntil: '2026-01-31T21:59:59.000Z' })
    const response = await handlePassLetters(post({ code: CODE, child: JASPER }), env, deps)
    expect(response.status).toBe(410)
    expect(await response.json()).toEqual({ error: 'expired' })
    expect(write).not.toHaveBeenCalled()
  })

  it('refuses a code with no generations left', async () => {
    const { env, write, deps } = setup({ ...VALID, generationsLeft: 0 })
    const response = await handlePassLetters(post({ code: CODE, child: JASPER }), env, deps)
    expect(response.status).toBe(409)
    expect(await response.json()).toEqual({ error: 'used_up' })
    expect(write).not.toHaveBeenCalled()
  })

  it('refuses an unknown code', async () => {
    const { env, deps } = setup(null)
    const response = await handlePassLetters(post({ code: CODE, child: JASPER }), env, deps)
    expect(response.status).toBe(404)
  })

  it('gives the generation back when the AI fails', async () => {
    const { env, rows, write, deps } = setup()
    write.mockRejectedValueOnce(new Error('boom'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const response = await handlePassLetters(post({ code: CODE, child: JASPER }), env, deps)
    expect(response.status).toBe(502)
    expect(rows.get(CODE)?.generationsLeft).toBe(10)
  })

  it('spends the last generation only once when two requests race', async () => {
    const { env, rows, deps } = setup({ ...VALID, generationsLeft: 1 })
    const results = await Promise.all([
      handlePassLetters(post({ code: CODE, child: JASPER }), env, deps),
      handlePassLetters(post({ code: CODE, child: JASPER }), env, deps),
    ])
    expect(results.map((r) => r.status).sort()).toEqual([200, 409])
    expect(rows.get(CODE)?.generationsLeft).toBe(0)
  })

  it('guards like the sample letter: method, origin, size, input and burst limit', async () => {
    const { env, write, deps } = setup()
    const get = new Request('https://kirjavolu.ee/api/joulupass/kirjad', { headers: { Origin: 'https://kirjavolu.ee' } })
    expect((await handlePassLetters(get, env, deps)).status).toBe(405)
    expect((await handlePassLetters(post({ code: CODE, child: JASPER }, { Origin: 'https://evil.example' }), env, deps)).status).toBe(403)
    expect((await handlePassLetters(post('x'.repeat(25000)), env, deps)).status).toBe(413)
    expect((await handlePassLetters(post('{nope'), env, deps)).status).toBe(400)
    expect((await handlePassLetters(post({ code: 'nope', child: JASPER }), env, deps)).status).toBe(400)
    expect((await handlePassLetters(post({ code: CODE, child: { ...JASPER, age: 40 } }), env, deps)).status).toBe(400)
    const limited = setup(undefined, { burstOk: false })
    expect((await handlePassLetters(post({ code: CODE, child: JASPER }), limited.env, limited.deps)).status).toBe(429)
    expect(write).not.toHaveBeenCalled()
  })
})

describe('daily cap for everyone together', () => {
  it('stops series for the day before a generation is spent', async () => {
    const { env, rows, write, deps } = setup(VALID, { seriesPerDay: '1' })
    expect((await handlePassLetters(post({ code: CODE, child: JASPER }), env, deps)).status).toBe(200)
    const second = await handlePassLetters(post({ code: CODE, child: JASPER }), env, deps)
    expect(second.status).toBe(503)
    expect(await second.json()).toEqual({ error: 'daily_limit' })
    expect(rows.get(CODE)?.generationsLeft).toBe(9)
    expect(write).toHaveBeenCalledTimes(1)
  })
})

const FIX = {
  code: CODE,
  child: { ...JASPER, december: '6.12 Valka' },
  day: 6,
  letter: { heading: 'Kallis Jasper!', body: 'Täna sõidate Valka.', signature: 'Sinu päkapikk Tuduja' },
  before: 'Eilne kiri.',
  after: 'Homne kiri.',
  wish: 'tee lühemaks',
}

const postFix = (body: unknown) =>
  new Request('https://kirjavolu.ee/api/joulupass/parandus', {
    method: 'POST',
    headers: { Origin: 'https://kirjavolu.ee', 'CF-Connecting-IP': '1.2.3.4' },
    body: JSON.stringify(body),
  })

describe('POST /api/joulupass/parandus', () => {
  it('rewrites one letter and takes one fix, not a generation', async () => {
    const { env, rows, fix, deps } = setup()
    const response = await handleLetterFix(postFix(FIX), env, deps)
    expect(response.status).toBe(200)
    const data = (await response.json()) as { letter: { body: string }; pass: SeasonPass }
    expect(data.letter.body).toBe('Uus tekst.')
    expect(data.pass).toMatchObject({ generationsLeft: 10, fixesLeft: 29 })
    expect(rows.get(CODE)).toMatchObject({ generationsLeft: 10, fixesLeft: 29 })
    expect(fix.mock.calls[0]?.[0]).toMatchObject({ day: 6, wish: 'tee lühemaks', before: 'Eilne kiri.' })
  })

  it('refuses when the fixes are used up, and gives a fix back when the AI fails', async () => {
    const empty = setup({ ...VALID, fixesLeft: 0 })
    const refused = await handleLetterFix(postFix(FIX), empty.env, empty.deps)
    expect(refused.status).toBe(409)
    expect(empty.fix).not.toHaveBeenCalled()

    const { env, rows, fix, deps } = setup()
    fix.mockRejectedValueOnce(new Error('boom'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect((await handleLetterFix(postFix(FIX), env, deps)).status).toBe(502)
    expect(rows.get(CODE)?.fixesLeft).toBe(30)
  })

  it('needs a wish, a December day and the letter', () => {
    expect(parseFixInput({ ...FIX, wish: ' ' })).toBeNull()
    expect(parseFixInput({ ...FIX, day: 25 })).toBeNull()
    expect(parseFixInput({ ...FIX, letter: { heading: 'x', body: '' } })).toBeNull()
  })

  it('hands the letter, its neighbours and the wish to the model inside tags', () => {
    const prompt = fixPrompt(parseFixInput(FIX)!)
    expect(prompt).toContain('<detsember>\n6.12 Valka\n</detsember>')
    expect(prompt).toContain('<eelmine>\nEilne kiri.\n</eelmine>')
    expect(prompt).toContain('<kiri päev="6. detsember">\nKallis Jasper!\n\nTäna sõidate Valka.')
    expect(prompt).toContain('<soov>\ntee lühemaks\n</soov>')
  })
})

describe('series', () => {
  it('keeps the profile and the December plans, trimmed to size, but never the parent notes', () => {
    const input = parseSeriesInput({
      ...JASPER,
      personality: '  uudishimulik ',
      family: ['ema', 'vend Ruben', 'kass Miisu', 7],
      foods: ['pannkoogid'],
      achievements: ['õppis rattaga sõitma'],
      details: 'd'.repeat(900),
      december: '12.12 läheme vanaema juurde Valka',
      parentNotes: 'salajane',
    })
    expect(input).toEqual({
      name: 'Jasper',
      age: 6,
      readingLevel: 'independent',
      interests: ['mõistatused'],
      personality: 'uudishimulik',
      family: ['ema', 'vend Ruben', 'kass Miisu'],
      foods: ['pannkoogid'],
      achievements: ['õppis rattaga sõitma'],
      details: 'd'.repeat(600),
      december: '12.12 läheme vanaema juurde Valka',
      length: 'medium',
    })
  })

  it('makes each letter as long as the parent picked, whatever the child’s reading level', () => {
    const young = { ...JASPER, age: 5, readingLevel: 'beginner' }
    expect(seriesPrompt(parseSeriesInput(young)!)).toContain('Iga kirja pikkus: 120–170 sõna.')
    expect(seriesPrompt(parseSeriesInput({ ...young, length: 'long' })!)).toContain('200–260 sõna (umbes pool A4 lehekülge)')
    expect(seriesPrompt(parseSeriesInput({ ...young, length: 'short' })!)).toContain('Iga kirja pikkus: 60–90 sõna.')
    // Anything else is the default, never an instruction.
    expect(parseSeriesInput({ ...young, length: 'tee 2000 sõna' })?.length).toBe('medium')
    // The reading level only shapes the sentences.
    expect(seriesPrompt(parseSeriesInput(young)!)).toContain('Keel: laps alles õpib lugema ja vanem loeb sageli ette')
  })

  it('keeps letters up to half an A4 page whole', () => {
    const long = 'sõna '.repeat(520).trim()
    const letters = SERIES.map((letter) => ({ ...letter, body: long }))
    expect(readSeries(JSON.stringify({ letters }))[0]?.body).toBe(long)
  })

  it('hands the child and the plans to the model as data inside tags', () => {
    const prompt = seriesPrompt(parseSeriesInput({ ...JASPER, family: ['kass Miisu'], december: '19.12 jõulupidu' })!)
    expect(prompt).toContain('<laps>\nNimi: Jasper\nVanus: 6\nHuvid ja lemmikud: mõistatused\nIseloom: pole teada\nPere ja lemmikloomad: kass Miisu\n')
    expect(prompt).toContain('<detsember>\n19.12 jõulupidu\n</detsember>')
  })

  it('puts back the elf name where the model swapped its letters', () => {
    const letters = SERIES.map((l) => ({ ...l, body: 'Tujudaks kutsutakse mind, sest ma armastan tududa.' }))
    expect(readSeries(JSON.stringify({ letters }))[0]?.body).toBe('Tudujaks kutsutakse mind, sest ma armastan tududa.')
    expect(seriesPrompt(parseSeriesInput(JASPER)!)).not.toContain('Tujuda')
  })

  it('accepts exactly 24 letters with text', () => {
    expect(readSeries(JSON.stringify({ letters: SERIES.map((l) => ({ ...l, signature: '' })) }))[0]?.signature).toBe(
      'Sinu päkapikk Tuduja',
    )
    expect(() => readSeries(JSON.stringify({ letters: SERIES.slice(1) }))).toThrow()
    expect(() => readSeries(JSON.stringify({ letters: [...SERIES.slice(1), { ...LETTER, body: ' ' }] }))).toThrow()
  })
})
