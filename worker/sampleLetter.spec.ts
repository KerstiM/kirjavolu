// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import { handleSampleLetter, parseInput, userPrompt, type SampleEnv, type WriteLetter } from './sampleLetter'

const JASPER = { name: 'Jasper', age: 6, readingLevel: 'independent', interests: ['mõistatused', 'koomiksid'] }
const LETTER = { heading: 'Kallis Jasper!', body: 'Tere!\n\nMina olen päkapikk.', signature: 'Sinu päkapikk Tuduja' }

function makeEnv(options: { burstOk?: boolean; daily?: string } = {}) {
  const store = new Map<string, string>()
  const env = {
    ANTHROPIC_API_KEY: 'test-key',
    USAGE: {
      get: async (key: string) => store.get(key) ?? null,
      put: async (key: string, value: string) => void store.set(key, value),
    },
    SAMPLE_LIMIT: { limit: async () => ({ success: options.burstOk ?? true }) },
    AI_DAILY_LIMIT: options.daily,
  } as unknown as SampleEnv
  return { env, store }
}

const post = (body: unknown, headers: Record<string, string> = {}) =>
  new Request('https://kirjavolu.ee/api/proovikiri', {
    method: 'POST',
    headers: { Origin: 'https://kirjavolu.ee', 'CF-Connecting-IP': '1.2.3.4', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })

describe('parseInput', () => {
  it('keeps only what the letter needs, trimmed to size', () => {
    const input = parseInput({ ...JASPER, name: '  Jasper  ', interests: ['a'.repeat(99), '', 1, 'b', 'c', 'd', 'e', 'f', 'g'], secret: 'x' })
    expect(input).toEqual({ name: 'Jasper', age: 6, readingLevel: 'independent', interests: ['a'.repeat(40), 'b', 'c', 'd', 'e', 'f'] })
  })

  it('refuses a request without a name, a sensible age or a reading level', () => {
    expect(parseInput({ ...JASPER, name: ' ' })).toBeNull()
    expect(parseInput({ ...JASPER, age: 40 })).toBeNull()
    expect(parseInput({ ...JASPER, readingLevel: 'fast' })).toBeNull()
    expect(parseInput('Jasper')).toBeNull()
  })

  it('hands the child to the model as data inside a tag', () => {
    const prompt = userPrompt(parseInput(JASPER)!)
    expect(prompt).toContain('<laps>\nNimi: Jasper\nVanus: 6\nHuvid: mõistatused; koomiksid\n</laps>')
  })
})

describe('POST /api/proovikiri', () => {
  it('returns the letter written for the child', async () => {
    const write = vi.fn<WriteLetter>(async () => LETTER)
    const response = await handleSampleLetter(post(JASPER), makeEnv().env, write)
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual(LETTER)
    expect(write).toHaveBeenCalledWith({ name: 'Jasper', age: 6, readingLevel: 'independent', interests: ['mõistatused', 'koomiksid'] }, 'test-key')
  })

  it('answers only POST requests from our own pages', async () => {
    const write = vi.fn<WriteLetter>(async () => LETTER)
    const { env } = makeEnv()
    expect((await handleSampleLetter(new Request('https://kirjavolu.ee/api/proovikiri'), env, write)).status).toBe(405)
    expect((await handleSampleLetter(post(JASPER, { Origin: 'https://evil.example' }), env, write)).status).toBe(403)
    expect((await handleSampleLetter(post(JASPER, { Origin: 'https://kirjavolu.ee.evil.example' }), env, write)).status).toBe(403)
    expect((await handleSampleLetter(post(JASPER, { Origin: 'http://localhost:5173' }), env, write)).status).toBe(200)
    expect(write).toHaveBeenCalledTimes(1)
  })

  it('accepts its own page over http and on www', async () => {
    const write = vi.fn<WriteLetter>(async () => LETTER)
    const { env } = makeEnv()
    const from = (url: string, origin: string) =>
      new Request(url, { method: 'POST', headers: { Origin: origin, 'CF-Connecting-IP': '1.2.3.4' }, body: JSON.stringify(JASPER) })
    expect((await handleSampleLetter(from('http://www.kirjavolu.ee/api/proovikiri', 'http://www.kirjavolu.ee'), env, write)).status).toBe(200)
    expect((await handleSampleLetter(from('https://www.kirjavolu.ee/api/proovikiri', 'https://www.kirjavolu.ee'), env, write)).status).toBe(200)
    expect((await handleSampleLetter(from('https://www.kirjavolu.ee/api/proovikiri', 'https://kerstim.github.io'), env, write)).status).toBe(403)
  })

  it('refuses broken or oversized requests before calling the model', async () => {
    const write = vi.fn<WriteLetter>(async () => LETTER)
    const { env } = makeEnv()
    expect((await handleSampleLetter(post('{nope'), env, write)).status).toBe(400)
    expect((await handleSampleLetter(post({ ...JASPER, age: 'six' }), env, write)).status).toBe(400)
    expect((await handleSampleLetter(post({ ...JASPER, filler: 'x'.repeat(5000) }), env, write)).status).toBe(413)
    expect(write).not.toHaveBeenCalled()
  })

  it('stops a burst from one address', async () => {
    const write = vi.fn<WriteLetter>(async () => LETTER)
    const response = await handleSampleLetter(post(JASPER), makeEnv({ burstOk: false }).env, write)
    expect(response.status).toBe(429)
    expect(write).not.toHaveBeenCalled()
  })

  it('allows five letters a day for one address', async () => {
    const write = vi.fn<WriteLetter>(async () => LETTER)
    const { env } = makeEnv()
    const statuses = []
    for (let i = 0; i < 6; i++) statuses.push((await handleSampleLetter(post(JASPER), env, write)).status)
    expect(statuses).toEqual([200, 200, 200, 200, 200, 429])
    expect((await handleSampleLetter(post(JASPER, { 'CF-Connecting-IP': '5.6.7.8' }), env, write)).status).toBe(200)
  })

  it('stops everyone once the daily cap is reached', async () => {
    const write = vi.fn<WriteLetter>(async () => LETTER)
    const { env } = makeEnv({ daily: '2' })
    const status = async (ip: string) => (await handleSampleLetter(post(JASPER, { 'CF-Connecting-IP': ip }), env, write)).status
    expect([await status('1.1.1.1'), await status('2.2.2.2'), await status('3.3.3.3')]).toEqual([200, 200, 503])
    expect(write).toHaveBeenCalledTimes(2)
  })

  it('says the letter failed without leaking the reason', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const response = await handleSampleLetter(post(JASPER), makeEnv().env, async () => {
      throw new Error('stop_reason refusal')
    })
    expect(response.status).toBe(502)
    expect(await response.json()).toEqual({ error: 'failed' })
  })
})
