/** Our own page asks: the same host the request went to (kirjavolu.ee or www, http or https). */
export function allowedOrigin(origin: string | null, requestUrl: string): boolean {
  if (!origin) return false
  // Local development (vite or wrangler dev).
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true
  try {
    return new URL(origin).host === new URL(requestUrl).host
  } catch {
    return false
  }
}

export const fail = (status: number, error: string) => Response.json({ error }, { status })
