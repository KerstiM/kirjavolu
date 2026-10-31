import type { ParentInstruction, RequestFor } from '../models'
import { addDays, formatDate } from '../text/estonian'
import {
  ARC_BEATS,
  ARC_CONTINUE,
  CLOSINGS,
  FIRST_LETTER_INTRO,
  GENERIC_CORES,
  GENERIC_MISSIONS,
  MISSIONS,
  OCCASION_CORES,
  OPENINGS,
  SIBLING_TASKS,
  CHRISTMAS_EVE,
  OCCASION_PURPOSE,
  SERIES_CLOSINGS,
  TODDLER_CLOSINGS,
  TODDLER_CORES,
  TODDLER_MISSIONS,
  TODDLER_OCCASION,
  TODDLER_OPENINGS,
} from '../../data/templates/letters'
import type { Line } from '../../data/templates/types'
import { ageBand } from './audience'
import { familyExtras, familyInstructions, type FamilyDayExtras } from './familyEvents'
import {
  createContext,
  lowerFirst,
  type UsedRegistry,
  notesInstruction,
  paragraphs,
  type DraftItem,
  type ItemPicker,
  type TypeResult,
} from './context'
import { audienceLines } from './personal'

/**
 * Maps letter index to an arc beat. The finale is only in the last letter and the
 * "star found" beat only in the one before it, so no filler letter can come after
 * the star has been found.
 */
export function beatIndexFor(index: number, count: number, beats: number): number {
  if (count <= 1 || index === count - 1) return beats - 1
  if (count >= 3 && index === count - 2) return beats - 2
  const head = count >= 3 ? count - 2 : count - 1
  return head <= 1 ? 0 : Math.round((index * (beats - 3)) / (head - 1))
}

const USAGE_TIPS: Partial<Record<string, string>> = {
  christmas:
    'Eesti kombe järgi toovad päkapikud oma kirjad ja pisikesed üllatused öösel aknalauale pandud sussi sisse.',
  'lost-tooth': 'Pane kiri öösel padja alla hamba asemele.',
  easter: 'Peida kiri koos värvilise munaga kohta, kust laps selle hommikul leiab.',
  birthday: 'Pane kiri sünnipäevahommikul hommikusöögilauale või kingituse juurde.',
  'school-start':
    'Libista kiri koolikotti või pinalisse – see on tore üllatus esimesel koolipäeval.',
}

/** Day-specific additions from the family plan of a linked series. */
export interface LinkedExtras extends FamilyDayExtras {
  /** Replaces the first letter's introduction (mentions the siblings' helpers). */
  opening?: string
  /** Replaces the day's task: a paired task with a sibling. */
  task?: string
  /** Added to the last letter: all helpers finish together. */
  finale?: string
}

export interface LinkedSeries {
  sender: string
  extras: (index: number) => LinkedExtras
  /** Shared with the siblings' series so their texts do not repeat each other. */
  used: UsedRegistry
}

export function generateLetters(
  request: RequestFor<'letter'>,
  variants: readonly number[],
  linked?: LinkedSeries,
): TypeResult {
  const { options, general } = request
  const sender = linked?.sender ?? (options.sender.trim() || 'Salapärane Sõber')
  const ctx = createContext(request, variants, sender, linked?.used)
  const { audience, occasion } = ctx
  const toddlerOnly = audience.band === 'toddler'
  const connected = options.connected && options.count > 1
  const personal = audienceLines(audience)
  const occasionCores = OCCASION_CORES[occasion.id] ?? []
  const uniqueHooks = [...new Map(audience.hooks.map(({ hook }) => [hook.id, hook])).values()]
  const hookMissions: Line[] = uniqueHooks.map(
    (hook) =>
      ({ v }) =>
        `Tänane ülesanne: ${lowerFirst(hook.mission(v))}`,
  )
  const occasionMissions = MISSIONS[occasion.id] ?? []
  // Rotating the tier order mixes occasion, interest and general tasks across a series.
  const missionTiers = [
    [occasionMissions, hookMissions, GENERIC_MISSIONS],
    [hookMissions, GENERIC_MISSIONS, occasionMissions],
    [GENERIC_MISSIONS, occasionMissions, hookMissions],
  ]
  const purposePool = OCCASION_PURPOSE[occasion.id]
  // Daily series are printed as small cards: no filler opening or mood sentences there.
  const compact = options.count >= 7 && general.length !== 'long'
  // Toddler cards hold one tiny thing per day: a little scene (even days) or something to do together (odd days).
  const toddlerCard = toddlerOnly && compact
  const showPersonal = general.length !== 'short'
  const showMission = general.length !== 'short' || options.count > 1

  // In a linked series the family plan supplies these; otherwise they come from the options directly.
  const family = familyExtras(request, audience.children, sender)
  const items: DraftItem[] = []
  let previousBeat = -1

  for (let i = 0; i < options.count; i++) {
    const p = ctx.item(i)
    const isLast = i === options.count - 1
    const isoDate = options.startDate ? addDays(options.startDate, i) : ''
    const extra: LinkedExtras = linked ? linked.extras(i) : family(i)
    // A paired sibling task or a real family event replaces the day's ordinary task.
    const dayTask = extra.task ?? extra.event
    const opening =
      i === 0
        ? (extra.opening ?? `Tere! ${ctx.line(p.pick(FIRST_LETTER_INTRO, 'intro'))}`)
        : compact
          ? undefined
          : ctx.line(p.pick(toddlerOnly ? TODDLER_OPENINGS : OPENINGS[general.tone], 'opening'))
    const purpose =
      // A linked introduction already says why the helper came.
      i === 0 && purposePool && !toddlerOnly && !extra.opening
        ? ctx.line(p.pick(purposePool, 'purpose'))
        : undefined
    const christmasEve =
      occasion.id === 'christmas' &&
      !toddlerOnly &&
      (isoDate.endsWith('-12-24') || (!isoDate && options.count === 24 && isLast))
        ? ctx.line(CHRISTMAS_EVE)
        : undefined

    let core: string
    if (compact && isLast && !connected && !toddlerOnly && (christmasEve || extra.finale)) {
      // A farewell card: Christmas Eve and the shared goodbye are enough.
      core = ''
    } else if (toddlerCard && (i === 0 || i % 2 === 1)) {
      // Introduction or activity day: no scene is drawn, so the scene pool is not used up.
      core = ''
    } else if (toddlerOnly) {
      core = ctx.line(p.pickTiered([TODDLER_OCCASION[occasion.id] ?? [], TODDLER_CORES], 'core'))
    } else if (connected) {
      const beat = beatIndexFor(i, options.count, ARC_BEATS.length)
      const beatLine = ARC_BEATS[beat]
      if (beat !== previousBeat && beatLine) {
        core = ctx.line(beatLine)
      } else {
        const filler = ctx.line(p.pick(ARC_CONTINUE, 'arc-continue'))
        core = `${filler} ${ctx.line(pickCore(p, occasionCores))}`
      }
      previousBeat = beat
    } else {
      core = ctx.line(pickCore(p, occasionCores))
    }

    const mood =
      !toddlerOnly && !compact && ((i === 0 && !purpose) || general.length === 'long')
        ? p.pick(occasion.vocabulary.moods, 'mood')
        : undefined
    // In long series, personal lines appear while fresh ones remain, then only now and then.
    const personalLine =
      showPersonal &&
      personal.length > 0 &&
      // The first and last cards of a daily series carry the introduction and the farewell.
      !(compact && (i === 0 || isLast)) &&
      // Days with a paired task, a family event or the Sunday note need the room on the card.
      !(compact && (dayTask || extra.sunday)) &&
      (p.hasFresh(personal, 'personal') || i % 3 === 0)
        ? p.pick(personal, 'personal')
        : undefined
    const mission = dayTask
      ? dayTask
      : showMission &&
          !(toddlerCard && i % 2 === 0) &&
          // In a daily series the first card introduces and the last says goodbye: no task there.
          !(compact && !toddlerOnly && (i === 0 || isLast))
        ? toddlerOnly
          ? p.pick(TODDLER_MISSIONS, 'mission')
          : ctx.line(
              p.pickTiered(missionTiers[i % missionTiers.length] ?? [GENERIC_MISSIONS], 'mission'),
            )
        : undefined
    const siblingTasks =
      audience.plural && general.length !== 'short' && (options.count <= 7 || i % 3 === 0)
        ? audience.children
            .map((child) => {
              const task = p.pick(SIBLING_TASKS[ageBand(child)], `sibling-${child.id}`)
              return `${child.name}, sinu ülesanne on ${task}.`
            })
            .join('\n')
        : undefined
    const extraPersonal =
      general.length === 'long' && p.hasFresh(personal, 'personal')
        ? p.pick(personal, 'personal')
        : undefined
    const closingPool = toddlerOnly
      ? TODDLER_CLOSINGS
      : options.count > 1 && !isLast
        ? [...CLOSINGS[general.tone], ...SERIES_CLOSINGS[general.tone]]
        : CLOSINGS[general.tone]
    // Daily cards end with the signature only, like handwritten notes; the last one still says goodbye.
    const closing = compact && !isLast ? undefined : ctx.line(p.pick(closingPool, 'closing'))
    const signOff = p.pick(
      [
        'Soojade soovidega',
        'Kallistustega',
        'Parimate soovidega',
        audience.v('Sinu sõber', 'Teie sõber'),
      ],
      'signoff',
    )

    const date = isoDate ? formatDate(isoDate) : ''
    const toddlerIntro =
      extra.opening ??
      (occasion.id === 'christmas'
        ? `Tere, ${audience.v('väike', 'väikesed')} ${audience.names}! Mina olen ${sender}. Ma olen nii väike, et mahun ${audience.v('sinu', 'teie')} sussi sisse.`
        : `Tere, ${audience.v('väike', 'väikesed')} ${audience.names}! Mina olen ${sender}. Ma tulin ${audience.v('sulle', 'teile')} külla!`)
    // The last card is a warm wish for the big day, like "Häid jõule, väike Brita!".
    const toddlerFinale = `${occasion.vocabulary.greeting}, ${audience.v('väike', 'väikesed')} ${audience.names}! ${sender} kallistab ${audience.v('sind', 'teid')}. Musi-musi!`
    const toddlerBody = toddlerCard
      ? i === 0
        ? toddlerIntro
        : isLast
          ? toddlerFinale
          : dayTask
            ? dayTask
            : i % 2 === 0
              ? core
              : mission
      : undefined
    // On a plain Sunday the Sunday surprise is the whole toddler card; otherwise it is added at the end.
    const plainToddlerDay = toddlerCard && i !== 0 && !isLast && !dayTask
    const toddlerCardBody =
      toddlerBody && extra.sunday
        ? plainToddlerDay
          ? extra.sunday
          : `${toddlerBody} ${extra.sunday}`
        : toddlerBody
    items.push({
      kind: 'letter',
      label: date || (options.count > 1 ? `${i + 1}. kiri` : occasion.name),
      date: isoDate || undefined,
      heading: audience.greeting,
      body:
        toddlerCardBody ??
        paragraphs(
          opening,
          christmasEve,
          purpose,
          extra.ruleIntro,
          mood,
          core,
          personalLine,
          extraPersonal,
          mission,
          siblingTasks,
          extra.sunday,
          extra.finale,
          closing,
        ),
      signature: `${signOff}\n${sender}`,
    })
  }

  return {
    title: options.count > 1 ? `${options.count} maagilist kirja` : 'Maagiline kiri',
    subtitle: `${occasion.name} · ${audience.names} · saatja ${sender}`,
    items,
    instructions: letterInstructions(request, connected),
  }
}

function pickCore(p: ItemPicker, occasionCores: Line[]): Line {
  // Prefer occasion-specific cores, fall back to generic ones when they run out.
  return p.pickTiered([occasionCores, GENERIC_CORES], 'core')
}

export function letterInstructions(
  request: RequestFor<'letter'>,
  connected: boolean,
): ParentInstruction[] {
  const { options, occasionId, children } = request
  const steps = [
    'Prindi kirjad ja voldi iga kiri kaks korda kokku – nii on see nagu päris post.',
    options.startDate
      ? `Kirjad on dateeritud alates kuupäevast ${formatDate(options.startDate)}. Pane igal õhtul välja järgmine kiri.`
      : 'Pane kiri kohta, kust laps selle ise leiab.',
  ]
  const tip = USAGE_TIPS[occasionId]
  if (tip) steps.push(tip)
  const toddlers = children.filter((child) => ageBand(child) === 'toddler')
  if (toddlers.length > 0) {
    steps.push(
      `${toddlers.map((child) => child.name).join(' ja ')} jaoks loe kiri ette ja tehke liigutused koos kaasa.`,
    )
  }
  const result: ParentInstruction[] = [
    { title: 'Kuidas kirju kasutada', steps },
    ...familyInstructions(request),
  ]
  if (connected) {
    result.push({
      title: 'Järjejutu nipid',
      steps: [
        'Kirjad moodustavad ühe loo kadunud võlutähest – hoia kirjade järjekord.',
        'Ühes kirjas palutakse lapsel jätta aknalauale joonistatud täht. Korja see öösel ära, et järgmine kiri oleks usutav.',
        'Viimases kirjas leitakse võlutäht. Soovi korral võid sinna juurde panna väikese helendava tähe või kleepsu.',
      ],
    })
  }
  const notes = notesInstruction(request.general.notes)
  if (notes) result.push(notes)
  return result
}
