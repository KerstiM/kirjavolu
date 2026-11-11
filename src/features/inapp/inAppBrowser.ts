/**
 * Instagram, Facebook, Messenger and TikTok open links in their own browser. It cannot
 * print or save a PDF (window.print does nothing there), and its storage is its own, so
 * letters made there do not show up later in Safari or Chrome.
 */
const IN_APP = /Instagram|FBAN|FBAV|FB_IAB|FBIOS|Messenger|musical_ly|TikTok|BytedanceWebview/i

export function isInAppBrowser(userAgent: string = currentUserAgent()): boolean {
  return IN_APP.test(userAgent)
}

function currentUserAgent(): string {
  return typeof navigator === 'undefined' ? '' : navigator.userAgent
}
