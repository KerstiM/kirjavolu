// @vitest-environment node
import { describe, expect, it } from 'vitest'
import worker, { type Env } from './index'

const env = {
  ASSETS: { fetch: async (request: Request) => new Response(`asset ${new URL(request.url).pathname}`) },
} as unknown as Env

const call = (path: string, init?: RequestInit) =>
  worker.fetch(new Request(`https://kirjavolu.ee${path}`, init) as Parameters<typeof worker.fetch>[0], env)

describe('worker', () => {
  it('answers the health check', async () => {
    const response = await call('/api/health')
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true, service: 'kirjavolu', version: 1 })
  })

  it('refuses other methods and unknown API paths', async () => {
    expect((await call('/api/health', { method: 'POST' })).status).toBe(405)
    expect((await call('/api/nothing')).status).toBe(404)
  })

  it('leaves everything else to the app', async () => {
    expect(await (await call('/looming/abc')).text()).toBe('asset /looming/abc')
    expect(await (await call('/apiks')).text()).toBe('asset /apiks')
  })
})
