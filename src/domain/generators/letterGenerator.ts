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
  TODDLER_CHRISTMAS,
  TODDLER_CORES,
  TODDLER_MISSIONS,
} from '../../data/templates/letters'
import type { Line } from '../../data/templates/types'
import { ageBand } from './audience'
import {
  createContext,
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
  const hookMissions: Line[] = uniqueHooks.map((hook) => ({ v }) => hook.mission(v))
  const missions = [...(MISSIONS[occasion.id] ?? []), ...hookMissions, ...GENERIC_MISSIONS]
  const showPersonal = general.length !== 'short'
  const showMission = general.length !== 'short' || options.count > 1

  const items: DraftItem[] = []
  let previousBeat = -1

  for (let i = 0; i < options.count; i++) {
    const p = ctx.item(i)
    const opening =
      i === 0
        ? `Tere! ${ctx.line(p.pick(FIRST_LETTER_INTRO, 'intro'))}`
        : ctx.line(p.pick(OPENINGS[general.tone], 'opening'))

    let core: string
    if (toddlerOnly) {
      const pool = occasion.id === 'christmas' ? [...TODDLER_CHRISTMAS, ...TODDLER_CORES] : TODDLER_CORES
      core = ctx.line(p.pick(pool, 'core'))
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
      (i === 0 || general.length === 'long') && !toddlerOnly
        ? p.pick(occasion.vocabulary.moods, 'mood')
        : undefined
    const personalLine = showPersonal && personal.length > 0 ? p.pick(personal, 'personal') : undefined
    const mission = showMission
      ? toddlerOnly
        ? p.pick(TODDLER_MISSIONS, 'mission')
        : ctx.line(p.pick(missions, 'mission'))
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
      general.length === 'long' && personal.length > 1 ? p.pick(personal, 'personal') : undefined
    const closing = ctx.line(p.pick(CLOSINGS[toddlerOnly ? 'heartwarming' : general.tone], 'closing'))
    const signOff = p.pick(
      ['Soojade soovidega', 'Kallistustega', 'Parimate soovidega', audience.v('Sinu sõber', 'Teie sõber')],
      'signoff',
    )

    const date = options.startDate ? formatDate(addDays(options.startDate, i)) : ''
    items.push({
      kind: 'letter',
      label: date || (options.count > 1 ? `${i + 1}. kiri` : occasion.name),
      heading: audience.greeting,
      body: paragraphs(opening, mood, core, personalLine, extraPersonal, mission, siblingTasks, closing),
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
