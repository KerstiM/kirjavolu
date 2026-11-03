/**
 * The creation that waits to be written once the Jõulupass payment is through: set before
 * the checkout opens, read and cleared on the letters page Stripe sends the buyer back to.
 */
const PENDING_KEY = 'kirjavolu.ud2.pending'

export function markPending(creationId: string): void {
  try {
    localStorage.setItem(PENDING_KEY, creationId)
  } catch {
    // Without storage the letters are written with one more click after paying.
  }
}

/** True once, for the creation that was waiting. */
export function takePending(creationId: string): boolean {
  try {
    if (localStorage.getItem(PENDING_KEY) !== creationId) return false
    localStorage.removeItem(PENDING_KEY)
    return true
  } catch {
    return false
  }
}
