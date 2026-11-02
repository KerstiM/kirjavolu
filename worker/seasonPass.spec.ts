// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import Stripe from 'stripe'
import {
  handlePassLookup,
  handlePurchase,
  handleStripeWebhook,
  newCode,
  normalizeCode,
  validUntil,
  type PassEnv,
  type PassStore,
  type SeasonPass,
} from './seasonPass'

const WEBHOOK_SECRET = 'whsec_test_secret'
const CODE = 'KV-7KQM-3FXA'

function memoryStore() {
  const bySession = new Map<string, SeasonPass>()
  const store: PassStore = {
    async activate(sessionId, code, until) {
      if (!bySession.has(sessionId)) bySession.set(sessionId, { code, generationsLeft: 10, fixesLeft: 30, validUntil: until })
      return bySession.get(sessionId) ?? null
    },
    async find(code) {
      return [...bySession.values()].find((pass) => pass.code === code) ?? null
    },
  }
  return { store, bySession }
}

function setup(options: { burstOk?: boolean } = {}) {
  const env = {
    STRIPE_SECRET_KEY: 'rk_test_x',
    STRIPE_WEBHOOK_SECRET: WEBHOOK_SECRET,
    STRIPE_PUBLISHABLE_KEY: 'pk_test_x',
    STRIPE_PRICE_ID: 'price_x',
    PASS_LIMIT: { limit: async () => ({ success: options.burstOk ?? true }) },
  } as unknown as PassEnv
  const stripe = new Stripe('rk_test_x')
  const { store, bySession } = memoryStore()
  return { env, stripe, store, bySession, deps: { stripe, store } }
}

const session = (fields: Partial<Stripe.Checkout.Session> = {}) =>
  ({
    id: 'cs_test_a1b2c3d4e5f6',
    object: 'checkout.session',
    created: Date.UTC(2026, 10, 20) / 1000,
    status: 'complete',
    payment_status: 'paid',
    metadata: { kirjavolu: 'joulupass', joulupass_code: CODE },
    ...fields,
  }) as Stripe.Checkout.Session

const ownPage = { Origin: 'https://kirjavolu.ee', 'CF-Connecting-IP': '1.2.3.4' }

describe('codes', () => {
  it('makes codes like KV-XXXX-XXXX without look-alike letters', () => {
    for (let i = 0; i < 50; i++) expect(newCode()).toMatch(/^KV-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/)
  })

  it('reads a code however it was typed', () => {
    expect(normalizeCode(' kv-7kqm-3fxa ')).toBe(CODE)
    expect(normalizeCode('7KQM 3FXA')).toBe(CODE)
    expect(normalizeCode('KV7KQM3FXA')).toBe(CODE)
    expect(normalizeCode('KV-7KQM-3FX')).toBeNull()
    expect(normalizeCode('KV-0KQM-3FXA')).toBeNull()
    expect(normalizeCode(42)).toBeNull()
  })

  it('is valid until the end of the next 31 January in Estonia', () => {
    expect(validUntil(new Date('2026-11-20T10:00:00Z'))).toBe('2027-01-31T21:59:59.000Z')
    expect(validUntil(new Date('2027-01-10T10:00:00Z'))).toBe('2027-01-31T21:59:59.000Z')
    // Late on 31 December in UTC is already New Year's Day in Tallinn.
    expect(validUntil(new Date('2026-12-31T23:30:00Z'))).toBe('2027-01-31T21:59:59.000Z')
  })
})

describe('POST /api/joulupass/ost', () => {
  const post = (headers: Record<string, string> = ownPage) =>
    new Request('https://kirjavolu.ee/api/joulupass/ost', { method: 'POST', headers })

  it('starts an embedded checkout for the pass without tax, with the code in the metadata', async () => {
    const { env, stripe, deps } = setup()
    const create = vi
      .spyOn(stripe.checkout.sessions, 'create')
      .mockResolvedValue({ client_secret: 'cs_secret' } as Stripe.Response<Stripe.Checkout.Session>)
    const response = await handlePurchase(post(), env, deps)
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ clientSecret: 'cs_secret', publishableKey: 'pk_test_x' })

    const params = create.mock.calls[0]![0]!
    expect(params).toMatchObject({
      ui_mode: 'embedded_page',
      mode: 'payment',
      line_items: [{ price: 'price_x', quantity: 1 }],
      return_url: 'https://kirjavolu.ee/uus-disain/joulupass?session_id={CHECKOUT_SESSION_ID}',
    })
    expect(params).not.toHaveProperty('automatic_tax')
    expect(params).not.toHaveProperty('payment_method_types')
    const code = params.metadata!.joulupass_code as string
    expect(normalizeCode(code)).toBe(code)
    expect(params.payment_intent_data).toEqual({
      description: `Kirjavõlu Jõulupass ${code}`,
      metadata: { kirjavolu: 'joulupass', joulupass_code: code },
    })
  })

  it('answers only our own pages, a few times a minute', async () => {
    const { env, stripe, deps } = setup()
    const create = vi.spyOn(stripe.checkout.sessions, 'create')
    expect((await handlePurchase(post({ Origin: 'https://evil.example' }), env, deps)).status).toBe(403)
    expect((await handlePurchase(post({}), env, deps)).status).toBe(403)
    const limited = setup({ burstOk: false })
    expect((await handlePurchase(post(), limited.env, limited.deps)).status).toBe(429)
    expect((await handlePurchase(new Request('https://kirjavolu.ee/api/joulupass/ost', { method: 'PUT' }), env, deps)).status).toBe(405)
    expect(create).not.toHaveBeenCalled()
  })

  it('says so when Stripe fails', async () => {
    const { env, stripe, deps } = setup()
    vi.spyOn(stripe.checkout.sessions, 'create').mockRejectedValue(new Error('down'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect((await handlePurchase(post(), env, deps)).status).toBe(502)
  })
})

describe('GET /api/joulupass/ost?session_id=…', () => {
  const get = (id = 'cs_test_a1b2c3d4e5f6') =>
    handlePurchase.bind(null, new Request(`https://kirjavolu.ee/api/joulupass/ost?session_id=${id}`))

  it('gives the code once Stripe says the session is paid, and stores it once', async () => {
    const { env, stripe, deps, bySession } = setup()
    vi.spyOn(stripe.checkout.sessions, 'retrieve').mockResolvedValue(session() as Stripe.Response<Stripe.Checkout.Session>)
    const response = await get()(env, deps)
    expect(await response.json()).toEqual({
      status: 'paid',
      pass: { code: CODE, generationsLeft: 10, fixesLeft: 30, validUntil: '2027-01-31T21:59:59.000Z' },
    })
    await get()(env, deps)
    expect(bySession.size).toBe(1)
  })

  it('gives no code while the payment is open or still processing', async () => {
    const { env, stripe, deps, bySession } = setup()
    const retrieve = vi.spyOn(stripe.checkout.sessions, 'retrieve')
    retrieve.mockResolvedValueOnce(session({ status: 'open', payment_status: 'unpaid' }) as Stripe.Response<Stripe.Checkout.Session>)
    expect(await (await get()(env, deps)).json()).toEqual({ status: 'open' })
    retrieve.mockResolvedValueOnce(session({ payment_status: 'unpaid' }) as Stripe.Response<Stripe.Checkout.Session>)
    expect(await (await get()(env, deps)).json()).toEqual({ status: 'processing' })
    expect(bySession.size).toBe(0)
  })

  it('refuses sessions that are not ours or not sessions at all', async () => {
    const { env, stripe, deps } = setup()
    const retrieve = vi
      .spyOn(stripe.checkout.sessions, 'retrieve')
      .mockResolvedValue(session({ metadata: {} }) as Stripe.Response<Stripe.Checkout.Session>)
    expect((await get()(env, deps)).status).toBe(404)
    expect((await get('nonsense')(env, deps)).status).toBe(400)
    expect(retrieve).toHaveBeenCalledTimes(1)
  })
})

describe('POST /api/stripe/webhook', () => {
  async function signed(event: object, secret = WEBHOOK_SECRET) {
    const payload = JSON.stringify(event)
    const header = await Stripe.webhooks.generateTestHeaderStringAsync({ payload, secret })
    return new Request('https://kirjavolu.ee/api/stripe/webhook', {
      method: 'POST',
      headers: { 'Stripe-Signature': header },
      body: payload,
    })
  }
  const event = (type: string, object: object) => ({ id: 'evt_1', object: 'event', type, data: { object } })

  it('stores the pass when a signed event says the checkout was paid', async () => {
    const { env, deps, bySession } = setup()
    const response = await handleStripeWebhook(await signed(event('checkout.session.completed', session())), env, deps)
    expect(response.status).toBe(200)
    expect(bySession.get('cs_test_a1b2c3d4e5f6')).toEqual({
      code: CODE,
      generationsLeft: 10,
      fixesLeft: 30,
      validUntil: '2027-01-31T21:59:59.000Z',
    })
  })

  it('waits for a delayed payment to succeed', async () => {
    const { env, deps, bySession } = setup()
    await handleStripeWebhook(await signed(event('checkout.session.completed', session({ payment_status: 'unpaid' }))), env, deps)
    expect(bySession.size).toBe(0)
    await handleStripeWebhook(await signed(event('checkout.session.async_payment_succeeded', session())), env, deps)
    expect(bySession.size).toBe(1)
  })

  it('believes nothing without a valid signature', async () => {
    const { env, deps, bySession } = setup()
    const paid = event('checkout.session.completed', session())
    expect((await handleStripeWebhook(await signed(paid, 'whsec_someone_else'), env, deps)).status).toBe(400)
    const unsigned = new Request('https://kirjavolu.ee/api/stripe/webhook', { method: 'POST', body: JSON.stringify(paid) })
    expect((await handleStripeWebhook(unsigned, env, deps)).status).toBe(400)
    const forged = await signed(paid)
    const tampered = new Request(forged.url, {
      method: 'POST',
      headers: forged.headers,
      body: JSON.stringify(event('checkout.session.completed', session({ id: 'cs_test_other' }))),
    })
    expect((await handleStripeWebhook(tampered, env, deps)).status).toBe(400)
    expect(bySession.size).toBe(0)
  })

  it('leaves other payments and events alone', async () => {
    const { env, deps, bySession } = setup()
    const other = session({ metadata: { order: '1' } })
    expect((await handleStripeWebhook(await signed(event('checkout.session.completed', other)), env, deps)).status).toBe(200)
    expect((await handleStripeWebhook(await signed(event('customer.created', { id: 'cus_1' })), env, deps)).status).toBe(200)
    expect(bySession.size).toBe(0)
  })
})

describe('POST /api/joulupass/kood', () => {
  const lookup = (code: unknown, headers: Record<string, string> = ownPage) =>
    new Request('https://kirjavolu.ee/api/joulupass/kood', { method: 'POST', headers, body: JSON.stringify({ code }) })

  it('tells how many generations a code has left', async () => {
    const { env, deps, store } = setup()
    await store.activate('cs_test_1', CODE, '2027-01-31T21:59:59.000Z')
    const response = await handlePassLookup(lookup('kv 7kqm 3fxa'), env, deps)
    expect(await response.json()).toEqual({ pass: { code: CODE, generationsLeft: 10, fixesLeft: 30, validUntil: '2027-01-31T21:59:59.000Z' } })
  })

  it('says when a code is unknown or not a code', async () => {
    const { env, deps } = setup()
    expect((await handlePassLookup(lookup('KV-AAAA-BBBB'), env, deps)).status).toBe(404)
    expect((await handlePassLookup(lookup('tere'), env, deps)).status).toBe(400)
  })

  it('answers only our own pages, a few times a minute', async () => {
    const { env, deps } = setup()
    expect((await handlePassLookup(lookup(CODE, { Origin: 'https://evil.example' }), env, deps)).status).toBe(403)
    const limited = setup({ burstOk: false })
    expect((await handlePassLookup(lookup(CODE), limited.env, limited.deps)).status).toBe(429)
  })
})
