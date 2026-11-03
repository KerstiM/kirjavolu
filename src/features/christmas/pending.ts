/**
 * Small notes this browser keeps for the Christmas letters, so nothing paid for is lost to a
 * page load: which creation waits to be written once the Jõulupass payment is through, and
 * which one was being written (with the series left before), in case the page was closed.
 */
// The key the earlier /ud2 journey used, so a purchase started there still finishes here.
const PENDING_KEY = 'kirjavolu.ud2.pending'
const WRITING_KEY = 'kirjavolu.joulukirjad.kirjutab'

/** Set before the checkout opens; read and cleared on the page Stripe sends the buyer back to. */
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

/** The letters of this creation are being written; `left` is the series count before. */
export function startWriting(creationId: string, left: number): void {
  try {
    localStorage.setItem(WRITING_KEY, JSON.stringify({ id: creationId, left }))
  } catch {
    // Without storage an interrupted series is simply not noticed after a reload.
  }
}

export function finishWriting(): void {
  try {
    localStorage.removeItem(WRITING_KEY)
  } catch {
    // Nothing to clear.
  }
}

/** The series count before writing, if this creation's letters were cut off by a page load; once. */
export function takeWriting(creationId: string): number | null {
  try {
    const note = JSON.parse(localStorage.getItem(WRITING_KEY) ?? 'null') as { id?: unknown; left?: unknown } | null
    if (note?.id !== creationId || typeof note.left !== 'number') return null
    localStorage.removeItem(WRITING_KEY)
    return note.left
  } catch {
    return null
  }
}
