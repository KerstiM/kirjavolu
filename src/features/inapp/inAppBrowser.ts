/**
 * Instagram, Facebook, Messenger and TikTok open links in their own browser. It cannot
 * print or save a PDF (window.print does nothing there), and its storage is its own, so
 * letters made there do not show up later in Safari or Chrome.
 */
const IN_APP = /Instagram|FBAN|FBAV|FB_IAB|FBIOS|Messenger|musical_ly|TikTok|BytedanceWebview/i

export type InAppPlatform = 'ios' | 'android' | 'other'

export function isInAppBrowser(userAgent: string = currentUserAgent()): boolean {
  return IN_APP.test(userAgent)
}

export function platformOf(userAgent: string = currentUserAgent()): InAppPlatform {
  if (/Android/i.test(userAgent)) return 'android'
  if (/iPhone|iPad|iPod/i.test(userAgent)) return 'ios'
  return 'other'
}

/**
 * A link that leaves the app for the phone's own browser: Chrome through an Android intent.
 * iPhones have no reliable one, so there the menu steps have to do.
 */
export function externalBrowserUrl(href: string, platform: InAppPlatform): string | null {
  if (platform !== 'android') return null
  const url = new URL(href)
  return `intent://${url.host}${url.pathname}${url.search}${url.hash}#Intent;scheme=https;package=com.android.chrome;end`
}

function currentUserAgent(): string {
  return typeof navigator === 'undefined' ? '' : navigator.userAgent
}
