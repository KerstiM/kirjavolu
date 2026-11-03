import Stripe from 'stripe'
import { allowedOrigin, fail } from './http'

/**
 * Jõulupass: one payment of 9,90 € in Stripe's Embedded Checkout gives a code such as
 * KV-7KQM-3FXA with 10 AI generations until 31 January. There are no accounts: the code is
 * the pass. It is made when the checkout starts and travels in the payment's metadata and
 * description, so the buyer and we can always find it in Stripe, but it counts only once
 * Stripe confirms the payment, by the signed webhook or by the return page asking Stripe.
 * Both store it the same way, once per Checkout Session.
 */
export interface PassEnv {
  /** season_passes, see migrations/. */
  DB: D1Database
  /** A restricted key (rk_…) that may write Checkout Sessions; a secret set in the dashboard. */
  STRIPE_SECRET_KEY: string
  /** The webhook endpoint's signing secret (whsec_…); a secret set in the dashboard. */
  STRIPE_WEBHOOK_SECRET: string
  /** pk_…, public; it goes to the browser for Stripe.js (wrangler.jsonc). */
  STRIPE_PUBLISHABLE_KEY: string
  /** The 9,90 € price of the product "Jõulupass" (wrangler.jsonc). */
  STRIPE_PRICE_ID: string
  /** A burst limit per address for buying and checking codes. */
  PASS_LIMIT: RateLimit
}

export const PASS_GENERATIONS = 10
/** AI rewrites of single letters per pass (the column's default, migrations/0002). */
export const PASS_FIXES = 30
/** Where Stripe sends the buyer back after paying; the page asks /api/joulupass/ost for the code. */
export const RETURN_PATH = '/uus-disain/joulupass'
/**
 * Pages a checkout may return to instead: the Christmas letters page (/joulukirjad/<id>, and
 * /ud2/kirjad/<id> where it was first tried out) and the pass page at its main path.
 */
const RETURN_TO = /^(\/joulukirjad\/[A-Za-z0-9-]{1,64}|\/ud2\/kirjad\/[A-Za-z0-9-]{1,64}|\/joulupass)$/

/** Where Stripe sends the buyer back: the page that asked, if it is one we know, else the pass page. */
export async function returnPath(request: Request): Promise<string> {
  const body: unknown = await request.json().catch(() => null)
  const asked = (body as { returnTo?: unknown } | null)?.returnTo
  return typeof asked === 'string' && RETURN_TO.test(asked) ? asked : RETURN_PATH
}
const INTEGRATION = 'kirjavolu-joulupass-qhzvtmwr'
const MAX_BODY_BYTES = 1000
const MAX_EVENT_BYTES = 64 * 1024

export interface SeasonPass {
  code: string
  generationsLeft: number
  /** Single letters the AI may still rewrite on request. */
  fixesLeft: number
  /** ISO time, the end of 31 January in Estonia. */
  validUntil: string
}

// No 0/O or 1/I, so a code read off a receipt is typed in right.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function newCode(): string {
  const chars = [...crypto.getRandomValues(new Uint8Array(8))].map((byte) => ALPHABET[byte % ALPHABET.length])
  return `KV-${chars.slice(0, 4).join('')}-${chars.slice(4).join('')}`
}

/** The code as stored, from whatever was typed (lower case, spaces, with or without "KV-"), or null. */
export function normalizeCode(input: unknown): string | null {
  if (typeof input !== 'string') return null
  let raw = input.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (raw.length === 10 && raw.startsWith('KV')) raw = raw.slice(2)
  if (raw.length !== 8 || [...raw].some((char) => !ALPHABET.includes(char))) return null
  return `KV-${raw.slice(0, 4)}-${raw.slice(4)}`
}

/** The end of the 31 January that follows the purchase, in Estonian winter time (UTC+2). */
export function validUntil(purchased: Date): string {
  const local = new Date(purchased.getTime() + 2 * 60 * 60 * 1000)
  const year = local.getUTCMonth() === 0 ? local.getUTCFullYear() : local.getUTCFullYear() + 1
  return new Date(Date.UTC(year, 0, 31, 21, 59, 59)).toISOString()
}

export interface PassStore {
  /** Saves the pass of a paid session; a second call for the same session changes nothing. */
  activate(sessionId: string, code: string, validUntil: string): Promise<SeasonPass | null>
  find(code: string): Promise<SeasonPass | null>
}

export interface PassRow {
  code: string
  generations_left: number
  fixes_left: number
  valid_until: string
}
export const fromRow = (row: PassRow | null): SeasonPass | null =>
  row && { code: row.code, generationsLeft: row.generations_left, fixesLeft: row.fixes_left, validUntil: row.valid_until }

export function d1Store(db: D1Database): PassStore {
  return {
    async activate(sessionId, code, until) {
      await db
        .prepare(
          `INSERT INTO season_passes (code, checkout_session_id, generations_left, valid_until, created_at)
           VALUES (?1, ?2, ?3, ?4, ?5) ON CONFLICT DO NOTHING`,
        )
        .bind(code, sessionId, PASS_GENERATIONS, until, new Date().toISOString())
        .run()
      const row = await db
        .prepare('SELECT code, generations_left, fixes_left, valid_until FROM season_passes WHERE checkout_session_id = ?1')
        .bind(sessionId)
        .first<PassRow>()
      return fromRow(row)
    },
    async find(code) {
      const row = await db
        .prepare('SELECT code, generations_left, fixes_left, valid_until FROM season_passes WHERE code = ?1')
        .bind(code)
        .first<PassRow>()
      return fromRow(row)
    },
  }
}

export interface PassDeps {
  stripe: Stripe
  store: PassStore
}

const defaultDeps = (env: PassEnv): PassDeps => ({
  stripe: new Stripe(env.STRIPE_SECRET_KEY, { httpClient: Stripe.createFetchHttpClient() }),
  store: d1Store(env.DB),
})

/** Stores the pass when the session is ours and paid (a card is paid at once; some methods later). */
async function fulfil(session: Stripe.Checkout.Session, store: PassStore): Promise<SeasonPass | null> {
  const code = normalizeCode(session.metadata?.joulupass_code)
  if (session.metadata?.kirjavolu !== 'joulupass' || !code) return null
  if (session.status !== 'complete' || session.payment_status === 'unpaid') return null
  return store.activate(session.id, code, validUntil(new Date(session.created * 1000)))
}

const limited = async (request: Request, env: PassEnv) =>
  !(await env.PASS_LIMIT.limit({ key: request.headers.get('CF-Connecting-IP') ?? 'unknown' })).success

/**
 * POST /api/joulupass/ost starts a checkout and gives the browser what Stripe.js needs.
 * GET /api/joulupass/ost?session_id=… is the return page asking how the payment went;
 * once Stripe says it is paid, the answer carries the code.
 */
export async function handlePurchase(request: Request, env: PassEnv, deps = defaultDeps(env)): Promise<Response> {
  if (request.method === 'POST') {
    const origin = request.headers.get('Origin')
    if (!allowedOrigin(origin, request.url)) return fail(403, 'forbidden')
    if (await limited(request, env)) return fail(429, 'too_many')
    if (Number(request.headers.get('Content-Length') ?? 0) > MAX_BODY_BYTES) return fail(413, 'too_large')
    const back = await returnPath(request)
    const code = newCode()
    const metadata = { kirjavolu: 'joulupass', joulupass_code: code }
    try {
      const session = await deps.stripe.checkout.sessions.create({
        ui_mode: 'embedded_page',
        mode: 'payment',
        line_items: [{ price: env.STRIPE_PRICE_ID, quantity: 1 }],
        locale: 'et',
        return_url: `${origin}${back}?session_id={CHECKOUT_SESSION_ID}`,
        metadata,
        payment_intent_data: { description: `Kirjavõlu Jõulupass ${code}`, metadata },
        integration_identifier: INTEGRATION,
      })
      return Response.json({ clientSecret: session.client_secret, publishableKey: env.STRIPE_PUBLISHABLE_KEY })
    } catch (error) {
      console.error('checkout session failed', error)
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
      console.error('checkout session lookup failed', error)
      return fail(404, 'not_found')
    }
    if (session.metadata?.kirjavolu !== 'joulupass') return fail(404, 'not_found')
    if (session.status === 'open') return Response.json({ status: 'open' })
    if (session.status === 'expired') return Response.json({ status: 'expired' })
    const pass = await fulfil(session, deps.store)
    return Response.json(pass ? { status: 'paid', pass } : { status: 'processing' })
  }

  return fail(405, 'method_not_allowed')
}

/** POST /api/joulupass/kood { code }: "Mul on Jõulupass" on another device. */
export async function handlePassLookup(request: Request, env: PassEnv, deps = defaultDeps(env)): Promise<Response> {
  if (request.method !== 'POST') return fail(405, 'method_not_allowed')
  if (!allowedOrigin(request.headers.get('Origin'), request.url)) return fail(403, 'forbidden')
  if (Number(request.headers.get('Content-Length') ?? 0) > MAX_BODY_BYTES) return fail(413, 'too_large')
  if (await limited(request, env)) return fail(429, 'too_many')
  const body: unknown = await request.json().catch(() => null)
  const code = normalizeCode((body as { code?: unknown } | null)?.code)
  if (!code) return fail(400, 'invalid')
  const pass = await deps.store.find(code)
  return pass ? Response.json({ pass }) : fail(404, 'not_found')
}

/**
 * POST /api/stripe/webhook: Stripe tells us a checkout was paid. Nothing is believed before
 * the signature checks out against STRIPE_WEBHOOK_SECRET.
 */
export async function handleStripeWebhook(request: Request, env: PassEnv, deps = defaultDeps(env)): Promise<Response> {
  if (request.method !== 'POST') return fail(405, 'method_not_allowed')
  const signature = request.headers.get('Stripe-Signature')
  if (!signature) return fail(400, 'no_signature')
  if (!env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not set')
    return fail(500, 'not_configured')
  }
  const payload = await request.text()
  if (payload.length > MAX_EVENT_BYTES) return fail(413, 'too_large')
  let event: Stripe.Event
  try {
    event = await deps.stripe.webhooks.constructEventAsync(payload, signature, env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return fail(400, 'bad_signature')
  }

  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object
    const pass = await fulfil(session, deps.store)
    if (session.metadata?.kirjavolu === 'joulupass' && !pass && session.payment_status !== 'unpaid') {
      // A paid session that could not be stored: let Stripe retry later.
      console.error('season pass not stored', session.id)
      return fail(500, 'not_stored')
    }
  } else if (event.type === 'checkout.session.async_payment_failed') {
    console.warn('season pass payment failed', event.data.object.id)
  }
  return Response.json({ received: true })
}
