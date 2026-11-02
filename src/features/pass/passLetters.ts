import type { ChildProfile, GeneratedContent, GeneratedItem, GenerationRequest } from '../../domain/models'
import { DEFAULT_GENERAL, defaultOptions } from '../../domain/defaults'
import { addDays, formatDate } from '../../domain/text/estonian'
import { foodTexts, interestTexts } from '../../data/topics'
import { createId } from '../../utils/id'
import { getOccasion } from '../../domain/occasions/occasions'
import { clone } from '../../utils/clone'
import { savePass, type SeasonPass } from './seasonPass'

/**
 * The AI series of the Jõulupass: 24 letters for one child, written by the server for the
 * code (one series = one generation). The letters become an ordinary creation, so they are
 * kept, edited and printed like any other; only the template engine leaves them alone.
 */
export const AI_SERIES_GENERATOR = 'ai-joulupass'
const GENERATOR_LABEL = 'Kirjad kirjutas tehisaru (Anthropic Claude) sinu Jõulupassi koodiga'

export type LettersError = 'too_many' | 'not_found' | 'expired' | 'used_up' | 'daily_limit' | 'busy' | 'invalid' | 'failed'

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
  daily_limit: 'Päkapikud on täna väga palju kirjutanud. Proovi homme uuesti. Loomiskord jäi alles.',
  busy: 'Päkapikk on praegu väga hõivatud. Proovi mõne minuti pärast uuesti. Loomiskord jäi alles.',
  invalid: 'Lapse andmetes on midagi puudu. Kontrolli nime, vanust ja lugemisoskust.',
  failed: 'Kirjade kirjutamine ei õnnestunud. Loomiskord jäi alles, proovi uuesti.',
}

/** The same reasons when one letter is rewritten: then it is a fix that stays, not a generation. */
export const FIX_ERROR_TEXTS: Record<LettersError, string> = {
  ...LETTERS_ERROR_TEXTS,
  used_up: 'Selle Jõulupassi AI-parandused on otsas. Kirja saad ikka ise muuta.',
  daily_limit: 'Päkapikud on täna väga palju kirjutanud. Proovi homme uuesti. Parandus jäi alles.',
  busy: 'Päkapikk on praegu väga hõivatud. Proovi mõne minuti pärast uuesti. Parandus jäi alles.',
  failed: 'Kirja ümberkirjutamine ei õnnestunud. Parandus jäi alles, proovi uuesti.',
}

/** The same reasons when a whole story is written. */
export const STORY_ERROR_TEXTS: Record<LettersError, string> = {
  ...LETTERS_ERROR_TEXTS,
  not_found: 'Seda Jõulupassi koodi ei leitud. Sisesta kood lehel „Jõulupass“ uuesti.',
  invalid: 'Loo valikutes on midagi puudu. Kontrolli lapsi ja loo valikuid.',
  failed: 'Loo kirjutamine ei õnnestunud. Loomiskord jäi alles, proovi uuesti.',
}

/** This December's plans per child, typed on the Jõulupass page; kept in this browser only. */
const DECEMBER_KEY = 'kirjavolu.joulupass.detsember'

export function readDecember(childId: string): string {
  try {
    return (JSON.parse(localStorage.getItem(DECEMBER_KEY) ?? '{}') as Record<string, string>)[childId] ?? ''
  } catch {
    return ''
  }
}

export function writeDecember(childId: string, text: string): void {
  try {
    const all = JSON.parse(localStorage.getItem(DECEMBER_KEY) ?? '{}') as Record<string, string>
    localStorage.setItem(DECEMBER_KEY, JSON.stringify({ ...all, [childId]: text }))
  } catch {
    // Private windows may refuse; the text is still in the form.
  }
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

async function post(url: string, body: unknown): Promise<Record<string, unknown>> {
  let response: Response
  try {
    response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  } catch {
    throw new LettersRequestError('failed')
  }
  const data: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const reason = (data as { error?: string } | null)?.error
    throw new LettersRequestError(reason && reason in LETTERS_ERROR_TEXTS ? (reason as LettersError) : 'failed')
  }
  const pass = (data as { pass?: SeasonPass } | null)?.pass
  if (typeof pass?.generationsLeft !== 'number') throw new LettersRequestError('failed')
  savePass(pass)
  return data as Record<string, unknown>
}

const isLetter = (letter: Partial<Letter> | null | undefined): letter is Letter =>
  typeof letter?.heading === 'string' && typeof letter.body === 'string'

/** Asks the server for the series. The pass it returns has one generation less; it is saved here. */
export async function requestPassLetters(
  code: string,
  child: ChildProfile,
  december = '',
): Promise<{ content: GeneratedContent; pass: SeasonPass }> {
  const data = await post('/api/joulupass/kirjad', { code, child: seriesChild(child, december) })
  const letters = data.letters
  if (!Array.isArray(letters) || letters.length !== 24 || !letters.every(isLetter)) throw new LettersRequestError('failed')
  return { content: seriesContent(child, letters), pass: data.pass as SeasonPass }
}

/**
 * "Paranda AI-ga": one letter of the series rewritten as the parent asked. The letters before
 * and after it go along, so the story still fits. Uses one fix of the pass, not a generation.
 */
export async function requestLetterFix(
  code: string,
  child: ChildProfile,
  items: GeneratedItem[],
  index: number,
  wish: string,
): Promise<{ letter: Letter; pass: SeasonPass }> {
  const item = items[index]
  if (!item) throw new LettersRequestError('invalid')
  const data = await post('/api/joulupass/parandus', {
    code,
    child: seriesChild(child, readDecember(child.id)),
    day: index + 1,
    letter: { heading: item.heading, body: item.body, signature: item.signature ?? '' },
    before: items[index - 1]?.body ?? '',
    after: items[index + 1]?.body ?? '',
    wish,
  })
  const letter = data.letter as Partial<Letter> | null
  if (!isLetter(letter)) throw new LettersRequestError('failed')
  return { letter, pass: data.pass as SeasonPass }
}

const STORY_LABEL = 'Loo kirjutas tehisaru (Anthropic Claude) sinu Jõulupassi koodiga'

/** The choices beside the preview, as the story request sends them. */
function storyChoices(content: GeneratedContent) {
  const { request } = content
  if (request.contentType !== 'story') throw new LettersRequestError('invalid')
  return {
    genre: request.options.genre,
    theme: request.options.theme,
    extraCharacters: request.options.extraCharacters,
    tone: request.general.tone,
    length: request.general.length,
    occasion: getOccasion(request.occasionId).name,
    notes: request.general.notes,
  }
}

/**
 * "Kirjuta lugu AI-ga": the story of a creation written again by the AI with the same choices.
 * Uses one generation. The result keeps the creation's request, so it stays a story creation.
 */
export async function requestStory(
  code: string,
  content: GeneratedContent,
  children: ChildProfile[],
): Promise<{ next: GeneratedContent; pass: SeasonPass }> {
  const data = await post('/api/joulupass/lugu', {
    code,
    children: children.map((child) => seriesChild(child, '')),
    story: storyChoices(content),
  })
  const story = data.story as { title?: unknown; pages?: unknown } | null
  const pages = story?.pages
  if (typeof story?.title !== 'string' || !Array.isArray(pages) || !pages.length || !pages.every((page) => typeof page === 'string')) {
    throw new LettersRequestError('failed')
  }
  const title = story.title
  return {
    next: {
      ...content,
      title,
      items: (pages as string[]).map((body, i) => ({
        id: createId(),
        kind: 'story-page',
        label: `Lk ${i + 1}`,
        heading: i === 0 ? title : '',
        body,
        variant: 0,
        edited: false,
      })),
      generator: { id: AI_SERIES_GENERATOR, label: STORY_LABEL },
    },
    pass: data.pass as SeasonPass,
  }
}

/** One page of an AI story rewritten as the parent asked; uses one fix. */
export async function requestStoryPageFix(
  code: string,
  content: GeneratedContent,
  children: ChildProfile[],
  index: number,
  wish: string,
): Promise<{ body: string; pass: SeasonPass }> {
  const { items } = content
  const item = items[index]
  if (!item) throw new LettersRequestError('invalid')
  const data = await post('/api/joulupass/lugu/parandus', {
    code,
    children: children.map((child) => seriesChild(child, '')),
    story: storyChoices(content),
    title: content.title,
    page: index + 1,
    text: item.body,
    before: items[index - 1]?.body ?? '',
    after: items[index + 1]?.body ?? '',
    wish,
  })
  if (typeof data.body !== 'string' || !data.body) throw new LettersRequestError('failed')
  return { body: data.body, pass: data.pass as SeasonPass }
}
