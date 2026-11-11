// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import Stripe from 'stripe'
import { handleSupport, type SupportEnv } from './support'

function setup(options: { burstOk?: boolean } = {}) {
  const env = {
    STRIPE_SECRET_KEY: 'rk_test_x',
    STRIPE_PUBLISHABLE_KEY: 'pk_test_x',
    PASS_LIMIT: { limit: async () => ({ success: options.burstOk ?? true }) },
  } as unknown as SupportEnv
  const stripe = new Stripe('rk_test_x')
  return { env, stripe, deps: { stripe } }
}

const ownPage = { Origin: 'https://kirjavolu.ee', 'CF-Connecting-IP': '1.2.3.4' }
const post = (returnTo?: string, headers: Record<string, string> = ownPage) =>
  new Request('https://kirjavolu.ee/api/toetus', { method: 'POST', headers, body: JSON.stringify({ returnTo }) })
const get = (sessionId: string) => new Request(`https://kirjavolu.ee/api/toetus?session_id=${sessionId}`, { headers: ownPage })

const session = (fields: Partial<Stripe.Checkout.Session> = {}) =>
  ({
    id: 'cs_test_a1b2c3d4e5f6',
    object: 'checkout.session',
    status: 'complete',
    payment_status: 'paid',
    metadata: { kirjavolu: 'toetus' },
    ...fields,
  }) as Stripe.Response<Stripe.Checkout.Session>

describe('support checkout', () => {
  it('starts an embedded checkout of 3,99 € with no product needed in Stripe', async () => {
    const { env, stripe, deps } = setup()
    const create = vi
      .spyOn(stripe.checkout.sessions, 'create')
      .mockResolvedValue({ client_secret: 'cs_secret' } as Stripe.Response<Stripe.Checkout.Session>)
    const response = await handleSupport(post('/looming/abc-123'), env, deps)
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ clientSecret: 'cs_secret', publishableKey: 'pk_test_x' })
    expect(create.mock.calls[0]![0]).toMatchObject({
      ui_mode: 'embedded_page',
      mode: 'payment',
      line_items: [{ price_data: { currency: 'eur', unit_amount: 399 }, quantity: 1 }],
      return_url: 'https://kirjavolu.ee/looming/abc-123?toetus={CHECKOUT_SESSION_ID}',
      metadata: { kirjavolu: 'toetus' },
    })
  })

  it('returns only to a preview page, else home', async () => {
    const { env, stripe, deps } = setup()
    const create = vi
      .spyOn(stripe.checkout.sessions, 'create')
      .mockResolvedValue({ client_secret: 'cs_secret' } as Stripe.Response<Stripe.Checkout.Session>)
    const backTo = async (returnTo?: string) => {
      await handleSupport(post(returnTo), env, deps)
      return create.mock.calls.at(-1)![0]!.return_url
    }
    expect(await backTo('/uus-disain/looming/abc')).toBe('https://kirjavolu.ee/uus-disain/looming/abc?toetus={CHECKOUT_SESSION_ID}')
    for (const other of [undefined, '//evil.example/looming/a', '/looming/a/b', '/joulupass']) {
      expect(await backTo(other)).toBe('https://kirjavolu.ee/?toetus={CHECKOUT_SESSION_ID}')
    }
  })

  it('answers only our own pages, a few times a minute', async () => {
    const { env, stripe, deps } = setup()
    const create = vi.spyOn(stripe.checkout.sessions, 'create')
    expect((await handleSupport(post(undefined, { Origin: 'https://evil.example' }), env, deps)).status).toBe(403)
    const limited = setup({ burstOk: false })
    expect((await handleSupport(post(), limited.env, limited.deps)).status).toBe(429)
    expect((await handleSupport(new Request('https://kirjavolu.ee/api/toetus', { method: 'PUT' }), env, deps)).status).toBe(405)
    expect(create).not.toHaveBeenCalled()
  })

  it('says so when Stripe fails', async () => {
    const { env, stripe, deps } = setup()
    vi.spyOn(stripe.checkout.sessions, 'create').mockRejectedValue(new Error('down'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect((await handleSupport(post(), env, deps)).status).toBe(502)
  })
})

describe('support return page', () => {
  it('says whether Stripe has the payment', async () => {
    const { env, stripe, deps } = setup()
    const retrieve = vi.spyOn(stripe.checkout.sessions, 'retrieve')
    const statusOf = async (fields: Partial<Stripe.Checkout.Session>) => {
      retrieve.mockResolvedValueOnce(session(fields))
      return ((await (await handleSupport(get('cs_test_a1b2c3d4e5f6'), env, deps)).json()) as { status: string }).status
    }
    expect(await statusOf({})).toBe('paid')
    expect(await statusOf({ payment_status: 'unpaid' })).toBe('processing')
    expect(await statusOf({ status: 'open', payment_status: 'unpaid' })).toBe('open')
    expect(await statusOf({ status: 'expired', payment_status: 'unpaid' })).toBe('expired')
  })

  it('refuses sessions that are not ours or not sessions at all', async () => {
    const { env, stripe, deps } = setup()
    const retrieve = vi.spyOn(stripe.checkout.sessions, 'retrieve').mockResolvedValue(session({ metadata: { kirjavolu: 'joulupass' } }))
    expect((await handleSupport(get('cs_test_a1b2c3d4e5f6'), env, deps)).status).toBe(404)
    expect((await handleSupport(get('nonsense'), env, deps)).status).toBe(400)
    expect(retrieve).toHaveBeenCalledTimes(1)
  })
})
