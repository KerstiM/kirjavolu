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
import {
  createContext,
  lowerFirst,
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
  'school-start': 'Libista kiri koolikotti või pinalisse – see on tore üllatus esimesel koolipäeval.',
}

export function generateLetters(request: RequestFor<'letter'>, variants: readonly number[]): TypeResult {
  const { options, general } = request
  const sender = options.sender.trim() || 'Salapärane Sõber'
  const ctx = createContext(request, variants, sender)
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
  const showPersonal = general.length !== 'short'
  const showMission = general.length !== 'short' || options.count > 1

  const items: DraftItem[] = []
  let previousBeat = -1

  for (let i = 0; i < options.count; i++) {
    const p = ctx.item(i)
    const isLast = i === options.count - 1
    const isoDate = options.startDate ? addDays(options.startDate, i) : ''
    const opening =
      i === 0
        ? `Tere! ${ctx.line(p.pick(FIRST_LETTER_INTRO, 'intro'))}`
        : compact
          ? undefined
          : ctx.line(p.pick(toddlerOnly ? TODDLER_OPENINGS : OPENINGS[general.tone], 'opening'))
    const purpose = i === 0 && purposePool && !toddlerOnly ? ctx.line(p.pick(purposePool, 'purpose')) : undefined
    const christmasEve =
      occasion.id === 'christmas' &&
      !toddlerOnly &&
      (isoDate.endsWith('-12-24') || (!isoDate && options.count === 24 && isLast))
        ? ctx.line(CHRISTMAS_EVE)
        : undefined

    let core: string
    if (toddlerOnly) {
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
      // The first card of a daily series already carries the introduction.
      !(compact && i === 0) &&
      (p.hasFresh(personal, 'personal') || i % 3 === 0)
        ? p.pick(personal, 'personal')
        : undefined
    const mission = showMission
      ? toddlerOnly
        ? p.pick(TODDLER_MISSIONS, 'mission')
        : ctx.line(p.pickTiered(missionTiers[i % missionTiers.length] ?? [GENERIC_MISSIONS], 'mission'))
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
      general.length === 'long' && p.hasFresh(personal, 'personal') ? p.pick(personal, 'personal') : undefined
    const closingPool = toddlerOnly
      ? TODDLER_CLOSINGS
      : options.count > 1 && !isLast
        ? [...CLOSINGS[general.tone], ...SERIES_CLOSINGS[general.tone]]
        : CLOSINGS[general.tone]
    const closing = ctx.line(p.pick(closingPool, 'closing'))
    const signOff = p.pick(
      ['Soojade soovidega', 'Kallistustega', 'Parimate soovidega', audience.v('Sinu sõber', 'Teie sõber')],
      'signoff',
    )

    const date = isoDate ? formatDate(isoDate) : ''
    items.push({
      kind: 'letter',
      label: date || (options.count > 1 ? `${i + 1}. kiri` : occasion.name),
      date: isoDate || undefined,
      heading: audience.greeting,
      body: paragraphs(opening, christmasEve, purpose, mood, core, personalLine, extraPersonal, mission, siblingTasks, closing),
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

function letterInstructions(request: RequestFor<'letter'>, connected: boolean): ParentInstruction[] {
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
  const result: ParentInstruction[] = [{ title: 'Kuidas kirju kasutada', steps }]
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
