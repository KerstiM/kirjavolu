import type { ChildProfile, GeneratedContent, GenerationRequest } from '../../domain/models'
import { DEFAULT_GENERAL, defaultOptions } from '../../domain/defaults'
import { addDays, formatDate } from '../../domain/text/estonian'
import { foodTexts, interestTexts } from '../../data/topics'
import { createId } from '../../utils/id'
import { clone } from '../../utils/clone'
import { savePass, type SeasonPass } from './seasonPass'

/**
 * The AI series of the Jõulupass: 24 letters for one child, written by the server for the
 * code (one series = one generation). The letters become an ordinary creation, so they are
 * kept, edited and printed like any other; only the template engine leaves them alone.
 */
export const AI_SERIES_GENERATOR = 'ai-joulupass'
const GENERATOR_LABEL = 'Kirjad kirjutas tehisaru (Anthropic Claude) sinu Jõulupassi koodiga'

export type LettersError = 'too_many' | 'not_found' | 'expired' | 'used_up' | 'busy' | 'invalid' | 'failed'

export class LettersRequestError extends Error {
  constructor(readonly reason: LettersError) {
    super(reason)
  }
}

export const LETTERS_ERROR_TEXTS: Record<LettersError, string> = {
  too_many: 'Liiga palju katseid järjest. Oota üks minut ja proovi uuesti.',
  not_found: 'Seda koodi ei leitud. Sisesta kood allpool uuesti.',
  expired: 'See Jõulupass ei kehti enam.',
  used_up: 'Selle Jõulupassi AI-loomised on otsas.',
  busy: 'Päkapikk on praegu väga hõivatud. Proovi mõne minuti pärast uuesti. Loomiskord jäi alles.',
  invalid: 'Lapse andmetes on midagi puudu. Kontrolli nime, vanust ja lugemisoskust.',
  failed: 'Kirjade kirjutamine ei õnnestunud. Loomiskord jäi alles, proovi uuesti.',
}

interface Letter {
  heading: string
  body: string
  signature?: string
}

/** The 24 letters as a creation for this child, dated 1–24 December of this season. */
export function seriesContent(child: ChildProfile, letters: Letter[], now = new Date()): GeneratedContent {
  const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
  const startDate = `${year}-12-01`
  const request: GenerationRequest = {
    contentType: 'letter',
    children: [clone(child)],
    occasionId: 'christmas',
    general: { ...DEFAULT_GENERAL },
    seed: now.getTime() % 2147483647,
    options: { ...defaultOptions('christmas').letter, startDate, count: 24, connected: true },
  }
  return {
    id: createId(),
    title: '24 AI-kirja päkapikult',
    subtitle: `Jõulud · ${child.name} · saatja päkapikk Tuduja`,
    createdAt: now.toISOString(),
    request,
    items: letters.map((letter, i) => {
      const date = addDays(startDate, i)
      return {
        id: createId(),
        kind: 'letter',
        label: formatDate(date),
        date,
        heading: letter.heading,
        body: letter.body,
        signature: letter.signature,
        variant: 0,
        edited: false,
      }
    }),
    instructions: [
      {
        title: 'Kuidas kirju kasutada',
        steps: [
          'Prindi kirjad välja ja lõika need lahti.',
          'Pane igal õhtul järgmise päeva kiri kohta, kust laps selle hommikul leiab, näiteks sussi sisse või akna peale.',
          'Loe kirjad enne läbi. Kui mõni kiri palub midagi teha, valmista see vajaduse korral ette.',
        ],
      },
    ],
    // Long letters: a whole page each, not the poster's small cards.
    layout: 'page',
    generator: { id: AI_SERIES_GENERATOR, label: GENERATOR_LABEL },
  }
}

/**
 * What leaves the browser for the AI: the child's profile as the parent filled it in, without
 * the notes meant only for the parent, and this December's plans.
 */
export function seriesChild(child: ChildProfile, december: string) {
  return {
    name: child.name,
    age: child.age,
    readingLevel: child.readingLevel,
    interests: interestTexts(child).slice(0, 12),
    personality: child.personality,
    family: child.family,
    foods: foodTexts(child),
    achievements: child.achievements,
    details: child.details,
    december,
  }
}

/** Asks the server for the series. The pass it returns has one generation less; it is saved here. */
export async function requestPassLetters(
  code: string,
  child: ChildProfile,
  december = '',
): Promise<{ content: GeneratedContent; pass: SeasonPass }> {
  let response: Response
  try {
    response = await fetch('/api/joulupass/kirjad', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, child: seriesChild(child, december) }),
    })
  } catch {
    throw new LettersRequestError('failed')
  }
  const data: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const reason = (data as { error?: string } | null)?.error
    throw new LettersRequestError(reason && reason in LETTERS_ERROR_TEXTS ? (reason as LettersError) : 'failed')
  }
  const { letters, pass } = (data ?? {}) as { letters?: unknown; pass?: SeasonPass }
  const valid =
    Array.isArray(letters) &&
    letters.length === 24 &&
    letters.every((letter: Partial<Letter>) => typeof letter?.heading === 'string' && typeof letter.body === 'string')
  if (!valid || typeof pass?.generationsLeft !== 'number') throw new LettersRequestError('failed')
  savePass(pass)
  return { content: seriesContent(child, letters as Letter[]), pass }
}
