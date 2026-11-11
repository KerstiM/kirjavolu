import Stripe from 'stripe'
import { allowedOrigin, fail } from './http'
import type { PassEnv } from './seasonPass'

/**
 * "Toeta autorit": the letters are free to print and download; whoever wants to can pay
 * 3,99 € in the same embedded checkout as the Jõulupass. Paying unlocks nothing, so there is
 * no code, no webhook and nothing stored: the return page only asks Stripe whether it went
 * through, to say thank you. The amount is set here, so no product is needed in Stripe.
 */
export type SupportEnv = Pick<PassEnv, 'STRIPE_SECRET_KEY' | 'STRIPE_PUBLISHABLE_KEY' | 'PASS_LIMIT'>

export const SUPPORT_CENTS = 399
const MAX_BODY_BYTES = 1000
/** The preview page the support was given from, in either design; else the home page. */
const RETURN_TO = /^(\/uus-disain)?\/looming\/[A-Za-z0-9-]{1,64}$/

export interface SupportDeps {
  stripe: Stripe
}
const defaultDeps = (env: SupportEnv): SupportDeps => ({
  stripe: new Stripe(env.STRIPE_SECRET_KEY, { httpClient: Stripe.createFetchHttpClient() }),
})

const limited = async (request: Request, env: SupportEnv) =>
  !(await env.PASS_LIMIT.limit({ key: request.headers.get('CF-Connecting-IP') ?? 'unknown' })).success

/**
 * POST /api/toetus starts a checkout and gives the browser what Stripe.js needs.
 * GET /api/toetus?session_id=… is the return page asking whether the payment went through.
 */
export async function handleSupport(request: Request, env: SupportEnv, deps = defaultDeps(env)): Promise<Response> {
  if (request.method === 'POST') {
    const origin = request.headers.get('Origin')
    if (!allowedOrigin(origin, request.url)) return fail(403, 'forbidden')
    if (await limited(request, env)) return fail(429, 'too_many')
    if (Number(request.headers.get('Content-Length') ?? 0) > MAX_BODY_BYTES) return fail(413, 'too_large')
    const body: unknown = await request.json().catch(() => null)
    const asked = (body as { returnTo?: unknown } | null)?.returnTo
    const back = typeof asked === 'string' && RETURN_TO.test(asked) ? asked : '/'
    const metadata = { kirjavolu: 'toetus' }
    try {
      const session = await deps.stripe.checkout.sessions.create({
        ui_mode: 'embedded_page',
        mode: 'payment',
        line_items: [
          {
            price_data: { currency: 'eur', unit_amount: SUPPORT_CENTS, product_data: { name: 'Kirjavõlu: toeta autorit' } },
            quantity: 1,
          },
        ],
        locale: 'et',
        return_url: `${origin}${back}?toetus={CHECKOUT_SESSION_ID}`,
        metadata,
        payment_intent_data: { description: 'Kirjavõlu: toeta autorit', metadata },
      })
      return Response.json({ clientSecret: session.client_secret, publishableKey: env.STRIPE_PUBLISHABLE_KEY })
    } catch (error) {
      console.error('support checkout failed', error)
      return fail(502, 'failed')
    }
  }

  if (request.method === 'GET') {
    const sessionId = new URL(request.url).searchParams.get('session_id') ?? ''
    if (!/^cs_(test|live)_[A-Za-z0-9]{10,200}$/.test(sessionId)) return fail(400, 'invalid')
    if (await limited(request, env)) return fail(429, 'too_many')
    let session: Stripe.Checkout.Session
    try {
      session = await deps.stripe.checkout.sessions.retrieve(sessionId)
    } catch (error) {
      console.error('support session lookup failed', error)
      return fail(404, 'not_found')
    }
    if (session.metadata?.kirjavolu !== 'toetus') return fail(404, 'not_found')
    if (session.status === 'open') return Response.json({ status: 'open' })
    if (session.status === 'expired') return Response.json({ status: 'expired' })
    return Response.json({ status: session.payment_status === 'unpaid' ? 'processing' : 'paid' })
  }

  return fail(405, 'method_not_allowed')
}
