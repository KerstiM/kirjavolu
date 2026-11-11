/**
 * Jõulupass in the browser: buying it in Stripe's embedded checkout, the code the server
 * gives after payment, and checking a code typed in on another device. The code is also
 * kept in localStorage, so this device remembers it; the server has the real count.
 */
export interface SeasonPass {
  code: string
  generationsLeft: number
  /** Single AI letters that may still be rewritten; missing in passes saved before this feature. */
  fixesLeft?: number
  /** ISO time, the end of 31 January. */
  validUntil: string
}

export const PASS_PRICE = '9,90 €'
/** The pass page: the code, what is left, and typing a code in on another device. */
export const PASS_PAGE = '/joulupass'
export const PASS_KEY = 'kirjavolu.joulupass'

export type PassError = 'too_many' | 'not_found' | 'invalid' | 'failed'
export class PassRequestError extends Error {
  constructor(readonly reason: PassError) {
    super(reason)
  }
}

export const PASS_ERROR_TEXTS: Record<PassError, string> = {
  too_many: 'Liiga palju katseid järjest. Oota üks minut ja proovi uuesti.',
  not_found: 'Sellist koodi ei leitud. Kontrolli, kas kõik tähed ja numbrid on õiged.',
  invalid: 'Kood on kujul KV-XXXX-XXXX. Kontrolli, kas see on õigesti kirjutatud.',
  failed: 'Midagi läks valesti. Proovi uuesti.',
}

function isPass(value: unknown): value is SeasonPass {
  const pass = value as Partial<SeasonPass> | null
  return typeof pass?.code === 'string' && typeof pass.generationsLeft === 'number' && typeof pass.validUntil === 'string'
}

export function loadPass(): SeasonPass | null {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(PASS_KEY) ?? 'null')
    return isPass(stored) ? stored : null
  } catch {
    return null
  }
}

/** Sent on window whenever this device's pass changes, so the menu can show what is left. */
export const PASS_CHANGED = 'kirjavolu:joulupass'

export function savePass(pass: SeasonPass): void {
  try {
    localStorage.setItem(PASS_KEY, JSON.stringify(pass))
  } catch {
    // Private windows may refuse; the code is still on screen and in Stripe.
  }
  window.dispatchEvent(new Event(PASS_CHANGED))
}

export function isActive(pass: SeasonPass, now = new Date()): boolean {
  return pass.generationsLeft > 0 && new Date(pass.validUntil) > now
}

export const formatValidUntil = (pass: SeasonPass) =>
  new Date(pass.validUntil).toLocaleDateString('et-EE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Tallinn' })

async function call(input: string, init?: RequestInit): Promise<unknown> {
  let response: Response
  try {
    response = await fetch(input, init)
  } catch {
    throw new PassRequestError('failed')
  }
  const data: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const reason = (data as { error?: string } | null)?.error
    throw new PassRequestError(reason && reason in PASS_ERROR_TEXTS ? (reason as PassError) : 'failed')
  }
  return data
}

/** "Mul on Jõulupass": the server's answer for a typed code, remembered on this device. */
export async function checkPass(code: string): Promise<SeasonPass> {
  const data = await call('/api/joulupass/kood', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })
  const pass = (data as { pass?: unknown } | null)?.pass
  if (!isPass(pass)) throw new PassRequestError('failed')
  savePass(pass)
  return pass
}

export type PurchaseStatus = { status: 'open' | 'processing' | 'expired' } | { status: 'paid'; pass: SeasonPass }

/** After Stripe sends the buyer back: has the payment gone through, and what is the code. */
export async function purchaseStatus(sessionId: string): Promise<PurchaseStatus> {
  const data = (await call(`/api/joulupass/ost?session_id=${encodeURIComponent(sessionId)}`)) as PurchaseStatus | null
  if (data?.status === 'paid') {
    if (!isPass(data.pass)) throw new PassRequestError('failed')
    savePass(data.pass)
  }
  if (!data || !['open', 'processing', 'expired', 'paid'].includes(data.status)) throw new PassRequestError('failed')
  return data
}

// Stripe.js must come from js.stripe.com itself (PCI), so it is loaded on demand, not bundled.
const STRIPE_JS = 'https://js.stripe.com/endive/stripe.js'
export interface EmbeddedCheckout {
  mount(element: HTMLElement): void
  destroy(): void
}
interface StripeJs {
  createEmbeddedCheckoutPage(options: { fetchClientSecret: () => Promise<string> }): Promise<EmbeddedCheckout>
}
declare global {
  interface Window {
    Stripe?: (publishableKey: string) => StripeJs
  }
}

let stripeJs: Promise<NonNullable<Window['Stripe']>> | null = null
function loadStripeJs(): Promise<NonNullable<Window['Stripe']>> {
  stripeJs ??= new Promise((resolve, reject) => {
    if (window.Stripe) return resolve(window.Stripe)
    const script = document.createElement('script')
    script.src = STRIPE_JS
    script.onload = () => (window.Stripe ? resolve(window.Stripe) : reject(new Error('no Stripe')))
    script.onerror = () => {
      stripeJs = null
      reject(new Error('Stripe.js did not load'))
    }
    document.head.append(script)
  })
  return stripeJs
}

/** Starts loading Stripe.js before anyone asks to pay, so the payment form opens sooner. */
export function preloadStripeJs(): void {
  loadStripeJs().catch(() => {
    // Tried again when the button is pressed.
  })
}

/**
 * Starts a checkout on the server and shows Stripe's payment form inside the given element.
 * `returnTo` is the page Stripe sends the buyer back to (the server allows only its own).
 * `endpoint` is what is being paid for: the pass, or "Toeta autorit" (/api/toetus).
 */
export async function openCheckout(element: HTMLElement, returnTo?: string, endpoint = '/api/joulupass/ost'): Promise<EmbeddedCheckout> {
  const init: RequestInit = returnTo
    ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ returnTo }) }
    : { method: 'POST' }
  const data = (await call(endpoint, init)) as { clientSecret?: unknown; publishableKey?: unknown } | null
  const clientSecret = data?.clientSecret
  const publishableKey = data?.publishableKey
  if (typeof clientSecret !== 'string' || typeof publishableKey !== 'string') throw new PassRequestError('failed')
  let Stripe: NonNullable<Window['Stripe']>
  try {
    Stripe = await loadStripeJs()
  } catch {
    throw new PassRequestError('failed')
  }
  const checkout = await Stripe(publishableKey).createEmbeddedCheckoutPage({ fetchClientSecret: async () => clientSecret })
  checkout.mount(element)
  return checkout
}
