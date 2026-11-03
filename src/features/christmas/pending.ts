/**
 * Small notes this browser keeps for the Christmas letters, so nothing paid for is lost to a
 * page load: which creation waits to be written once the Jõulupass payment is through, and
 * which one was being written (with the series left before), in case the page was closed.
 */
// The key the earlier /ud2 journey used, so a purchase started there still finishes here.
const PENDING_KEY = 'kirjavolu.ud2.pending'
const WRITING_KEY = 'kirjavolu.joulukirjad.kirjutab'

/**
 * Set before the checkout opens; read and cleared on the page Stripe sends the buyer back to.
 * For a family's letters it also says whose personal letters were asked for.
 */
export function markPending(creationId: string, childId?: string): void {
  try {
    localStorage.setItem(PENDING_KEY, childId ? JSON.stringify({ id: creationId, child: childId }) : creationId)
  } catch {
    // Without storage the letters are written with one more click after paying.
  }
}

/** Once, for the creation that was waiting: the child asked for, if one was named; else null. */
export function takePending(creationId: string): { child?: string } | null {
  try {
    const stored = localStorage.getItem(PENDING_KEY)
    if (stored === null) return null
    // A plain id (one child, or a purchase started before families could be chosen) or { id, child }.
    let note: { id?: unknown; child?: unknown } = { id: stored }
    if (stored.startsWith('{')) note = JSON.parse(stored) as typeof note
    if (note.id !== creationId) return null
    localStorage.removeItem(PENDING_KEY)
    return typeof note.child === 'string' ? { child: note.child } : {}
  } catch {
    return null
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
