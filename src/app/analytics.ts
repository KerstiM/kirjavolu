import type { ContentTypeId, OccasionId, PrintableLayout } from '../domain/models'
import type { LettersError } from '../features/pass/passLetters'

/**
 * Privacy-friendly usage counts (Umami, no cookies). Only the events below can be
 * sent, and their fields are closed lists or numbers – a child's name, age or
 * interests have no place to go. Without a website id (development, tests) nothing
 * is loaded or sent.
 */
export interface AnalyticsEvents {
  /** The wizard opened; type and occasion are known when a home page card was used. */
  wizard_start: { type: ContentTypeId | 'none'; occasion: OccasionId | 'none' }
  child_added: { from: 'wizard' | 'profiles' | 'pass' }
  /** A creation was opened in the preview. */
  preview_shown: { type: ContentTypeId; occasion: OccasionId; items: number; children: number }
  print_clicked: { type: ContentTypeId; layout: PrintableLayout; mode: 'all' | 'child' | 'parent' }
  /** "Vaata näidet" on the home page. */
  sample_shown: Record<string, never>
  /** The Christmas letters page opened (/joulukirjad). */
  christmas_start: Record<string, never>
  /** Free template letters were made in the Christmas journey. */
  free_generated: { type: ContentTypeId; occasion: OccasionId; items: number }
  /** The offer to make them more personal was shown beside free letters. */
  paywall_shown: { type: ContentTypeId; items: number }
  /** "Osta Jõulupass" was pressed (the consent box ticked). */
  premium_selected: { product: 'season-pass' }
  /** Stripe's payment form is open on the page. */
  checkout_started: { product: 'season-pass' }
  /** The server confirmed the payment with Stripe. */
  purchase: { product: 'season-pass' }
  /** "Toeta autorit" opened Stripe's payment form beside free letters. */
  support_started: Record<string, never>
  /** Stripe says the 3,99 € support went through. */
  support_paid: Record<string, never>
  premium_generated: { type: ContentTypeId; items: number }
  /** Why writing failed: the server's reason (a closed list), never the child's data. */
  premium_failed: { reason: LettersError }
}

export type AnalyticsEventName = keyof AnalyticsEvents

interface Umami {
  track: (name: string, data?: Record<string, string | number>) => void
}

const SCRIPT_URL = 'https://cloud.umami.is/script.js'

let enabled = false
// Events sent before the script has loaded wait here.
let queue: [string, Record<string, string | number>][] = []

function umami(): Umami | undefined {
  return (window as unknown as { umami?: Umami }).umami
}

function flush(): void {
  const client = umami()
  if (!client) return
  for (const [name, data] of queue) client.track(name, data)
  queue = []
}

/**
 * Loads the Umami script once. `domains` keeps local development and previews out
 * of the numbers; visitors with "Do Not Track" on are not counted.
 */
export function setupAnalytics(websiteId: string | undefined, domains?: string, doc: Document = document): void {
  if (!websiteId || enabled) return
  enabled = true
  const script = doc.createElement('script')
  script.defer = true
  script.src = SCRIPT_URL
  script.dataset.websiteId = websiteId
  script.dataset.doNotTrack = 'true'
  if (domains) script.dataset.domains = domains
  script.addEventListener('load', flush)
  doc.head.appendChild(script)
}

export function track<K extends AnalyticsEventName>(name: K, data: AnalyticsEvents[K]): void {
  if (!enabled) return
  queue.push([name, { ...data }])
  flush()
}

/** Tests only: forget the loaded script and anything waiting. */
export function resetAnalytics(): void {
  enabled = false
  queue = []
}
