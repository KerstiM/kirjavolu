import type { ContentTypeId, OccasionId, PrintableLayout } from '../domain/models'

/**
 * Privacy-friendly usage counts (Umami, no cookies). Only the events below can be
 * sent, and their fields are closed lists or numbers – a child's name, age or
 * interests have no place to go. Without a website id (development, tests) nothing
 * is loaded or sent.
 */
export interface AnalyticsEvents {
  /** The wizard opened; type and occasion are known when a home page card was used. */
  wizard_start: { type: ContentTypeId | 'none'; occasion: OccasionId | 'none' }
  child_added: { from: 'wizard' | 'profiles' }
  /** A creation was opened in the preview. */
  preview_shown: { type: ContentTypeId; occasion: OccasionId; items: number; children: number }
  print_clicked: { type: ContentTypeId; layout: PrintableLayout; mode: 'all' | 'child' | 'parent' }
  /** "Vaata näidet" on the home page. */
  sample_shown: Record<string, never>
  // Step 3 (Jõulupass) will send these.
  paywall_shown: { type: ContentTypeId; items: number }
  purchase: { product: 'season-pass' }
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
