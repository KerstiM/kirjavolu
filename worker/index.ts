import { handleSampleLetter, type SampleEnv } from './sampleLetter'
import { handleLetterFix, handlePassLetters, type LettersEnv } from './passLetters'
import { handlePassStory, handleStoryFix } from './passStory'
import { handlePassLookup, handlePurchase, handleStripeWebhook, type PassEnv } from './seasonPass'

/**
 * Kirjavõlu on Cloudflare: the built app (dist/) is served as static assets and
 * everything under /api/ is answered here. Later steps add accounts and sync
 * behind the same address, so the browser never talks to another domain.
 */
export interface Env extends SampleEnv, PassEnv, LettersEnv {
  ASSETS: Fetcher
}

const API_VERSION = 1

export async function handleApi(request: Request, env: Env): Promise<Response> {
  const { pathname } = new URL(request.url)
  if (pathname === '/api/health') {
    if (request.method !== 'GET') return Response.json({ error: 'method_not_allowed' }, { status: 405 })
    return Response.json({ ok: true, service: 'kirjavolu', version: API_VERSION })
  }
  if (pathname === '/api/proovikiri') return handleSampleLetter(request, env)
  if (pathname === '/api/joulupass/ost') return handlePurchase(request, env)
  if (pathname === '/api/joulupass/kood') return handlePassLookup(request, env)
  if (pathname === '/api/joulupass/kirjad') return handlePassLetters(request, env)
  if (pathname === '/api/joulupass/parandus') return handleLetterFix(request, env)
  if (pathname === '/api/joulupass/lugu') return handlePassStory(request, env)
  if (pathname === '/api/joulupass/lugu/parandus') return handleStoryFix(request, env)
  if (pathname === '/api/stripe/webhook') return handleStripeWebhook(request, env)
  return Response.json({ error: 'not_found' }, { status: 404 })
}

export default {
  async fetch(request, env): Promise<Response> {
    const { pathname } = new URL(request.url)
    if (pathname === '/api' || pathname.startsWith('/api/')) return handleApi(request, env)
    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<Env>
