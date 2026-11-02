import type { ChildProfile, GeneratedItem } from '../../domain/models'
import { interestTexts } from '../../data/topics'

/** Why a sample letter could not be written, as the server says it. */
export type SampleError = 'too_many' | 'daily_limit' | 'busy' | 'failed'

export class SampleLetterError extends Error {
  constructor(readonly reason: SampleError) {
    super(reason)
  }
}

export const SAMPLE_ERROR_TEXTS: Record<SampleError, string> = {
  too_many: 'Proovikirju on sellest seadmest täna juba palju tehtud. Proovi homme uuesti.',
  daily_limit: 'Tänased proovikirjad said otsa. Proovi homme uuesti.',
  busy: 'Päkapikk on praegu väga hõivatud. Proovi mõne minuti pärast uuesti.',
  failed: 'Kirja kirjutamine ei õnnestunud. Proovi uuesti.',
}

/**
 * Asks the server for one AI-written letter for 1 December. Only the first name, age,
 * reading level and interests leave the browser; nothing is saved on the server.
 */
export async function requestSampleLetter(child: ChildProfile): Promise<GeneratedItem> {
  let response: Response
  try {
    response = await fetch('/api/proovikiri', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: child.name,
        age: child.age,
        readingLevel: child.readingLevel,
        interests: interestTexts(child).slice(0, 6),
      }),
    })
  } catch {
    throw new SampleLetterError('failed')
  }
  const data: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const reason = (data as { error?: string } | null)?.error
    throw new SampleLetterError(reason && reason in SAMPLE_ERROR_TEXTS ? (reason as SampleError) : 'failed')
  }
  const letter = data as { heading?: unknown; body?: unknown; signature?: unknown } | null
  if (typeof letter?.heading !== 'string' || typeof letter.body !== 'string') throw new SampleLetterError('failed')
  return {
    id: `ai-sample-${child.id}`,
    kind: 'letter',
    label: '1. detsember · AI',
    heading: letter.heading,
    body: letter.body,
    signature: typeof letter.signature === 'string' ? letter.signature : undefined,
    variant: 0,
    edited: false,
  }
}
