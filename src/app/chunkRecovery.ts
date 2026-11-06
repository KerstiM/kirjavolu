import type { Router } from 'vue-router'

const RELOAD_KEY = 'kirjavolu.chunk-reload'
/** A second failure within this time means a reload did not help. */
const RELOAD_WINDOW_MS = 60_000

/** True for the error a browser throws when a page's script file is gone (after a release) or cached stale. */
export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '')
  return /dynamically imported module|Importing a module script failed|Loading chunk|Unable to preload CSS/i.test(message)
}

/**
 * A new release replaces the files an open tab still points to, so a page opened from the menu
 * can fail to load. One reload fetches the current files; if it fails again, the parent is told
 * what to do instead of being left with a button that does nothing.
 */
export function recoverFromChunkErrors(
  router: Router,
  reload: (url: string) => void = (url) => window.location.assign(url),
  notify: (message: string) => void = (message) => window.alert(message),
  now: () => number = Date.now,
): void {
  const handle = (target: string) => {
    let last = 0
    try {
      last = Number(sessionStorage.getItem(RELOAD_KEY)) || 0
    } catch {
      // Storage may be blocked; then every failure gets one reload attempt.
    }
    if (now() - last < RELOAD_WINDOW_MS) {
      notify('Lehe laadimine ei õnnestunud. Värskenda brauseri lehte (Ctrl/Cmd + R) või proovi mõne hetke pärast uuesti.')
      return
    }
    try {
      sessionStorage.setItem(RELOAD_KEY, String(now()))
    } catch {
      // See above.
    }
    reload(target)
  }
  router.onError((error, to) => {
    if (isChunkLoadError(error)) handle(to.fullPath)
  })
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault()
    handle(window.location.pathname + window.location.search)
  })
}
