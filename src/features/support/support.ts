/**
 * "Toeta autorit": the letters stay free; whoever wants to can pay 3,99 € in Stripe's
 * embedded checkout. Paying unlocks nothing, so this device only remembers that it has
 * supported, to say thank you instead of asking again.
 */

/** Whether the support box is shown. Set to false to take it away; nothing else depends on it. */
export const SUPPORT_ENABLED = true

export const SUPPORT_PRICE = '3,99 €'
export const SUPPORT_ENDPOINT = '/api/toetus'
/** The query Stripe brings the supporter back with (?toetus=cs_…), see worker/support.ts. */
export const SUPPORT_QUERY = 'toetus'
const SUPPORTED_KEY = 'kirjavolu.toetus'

export function hasSupported(): boolean {
  try {
    return localStorage.getItem(SUPPORTED_KEY) === '1'
  } catch {
    return false
  }
}

function rememberSupported(): void {
  try {
    localStorage.setItem(SUPPORTED_KEY, '1')
  } catch {
    // Private windows may refuse; the thanks is still on screen.
  }
}

export type SupportStatus = 'open' | 'processing' | 'expired' | 'paid' | 'failed'

/** After Stripe sends the supporter back: did the payment go through. */
export async function supportStatus(sessionId: string): Promise<SupportStatus> {
  try {
    const response = await fetch(`${SUPPORT_ENDPOINT}?session_id=${encodeURIComponent(sessionId)}`)
    const data = (await response.json().catch(() => null)) as { status?: string } | null
    const status = response.ok ? data?.status : undefined
    if (status === 'paid') rememberSupported()
    return status === 'open' || status === 'processing' || status === 'expired' || status === 'paid' ? status : 'failed'
  } catch {
    return 'failed'
  }
}
