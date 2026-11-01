/**
 * Kirjavõlu on Cloudflare: the built app (dist/) is served as static assets and
 * everything under /api/ is answered here. Later steps add accounts, sync and the
 * season pass behind the same address, so the browser never talks to another domain.
 */
export interface Env {
  ASSETS: Fetcher
}

const API_VERSION = 1

export async function handleApi(request: Request): Promise<Response> {
  const { pathname } = new URL(request.url)
  if (pathname === '/api/health') {
    if (request.method !== 'GET') return Response.json({ error: 'method_not_allowed' }, { status: 405 })
    return Response.json({ ok: true, service: 'kirjavolu', version: API_VERSION })
  }
  return Response.json({ error: 'not_found' }, { status: 404 })
}

export default {
  async fetch(request, env): Promise<Response> {
    const { pathname } = new URL(request.url)
    if (pathname === '/api' || pathname.startsWith('/api/')) return handleApi(request)
    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<Env>
