import type {
  ChildChallenge,
  ChildProfile,
  FamilyEvent,
  ParentInstruction,
  RequestFor,
} from '../models'
import { CHALLENGES } from '../../data/templates/challenges'
import { EVENT_TEMPLATES, SUNDAY_RULE } from '../../data/templates/events'
import type { Say } from '../../data/templates/interests'
import {
  addDays,
  formatDayMonth,
  joinList,
  namesInCase,
  untilDate,
  weekdayName,
} from '../text/estonian'
import { ageBand } from './audience'

/** Day index of a date within the series, or null when it falls outside it. */
export function dayIndex(date: string, startDate: string, count: number): number | null {
  if (!startDate || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null
  const index = Math.round(
    (Date.parse(`${date}T00:00:00Z`) - Date.parse(`${startDate}T00:00:00Z`)) / 86_400_000,
  )
  return index >= 0 && index < count ? index : null
}

/** Day index of an event within the series, or null when it falls outside it. */
export function eventIndex(event: FamilyEvent, startDate: string, count: number): number | null {
  return dayIndex(event.date, startDate, count)
}

/** Oldest reader other than the challenger; they are asked to support in secret. */
export function challengeSupporter(
  request: RequestFor<'letter'>,
  challenge: ChildChallenge,
): ChildProfile | undefined {
  return request.children
    .filter(
      (child) => child.id !== challenge.childId && ageBand(child) !== 'toddler' && child.age >= 5,
    )
    .sort((a, b) => b.age - a.age)[0]
}

/**
 * Challenge text for one child on one day: the invitation on the first day,
 * praise on the last day, or – for the supporting sibling – a secret request.
 */
export function challengeFor(
  request: RequestFor<'letter'>,
  childId: string,
  index: number,
): { text: string; prep?: string } | undefined {
  const { challenges = [], startDate, count } = request.options
  for (const challenge of challenges) {
    const child = request.children.find((c) => c.id === challenge.childId)
    if (!child || ageBand(child) === 'toddler') continue
    const start = dayIndex(challenge.start, startDate, count)
    const end = dayIndex(challenge.end, startDate, count)
    const template = CHALLENGES[challenge.kind]
    const ctx = {
      name: child.name,
      until: `kuni ${untilDate(challenge.end)}`,
      title: challenge.title.trim(),
    }
    if (challenge.childId === childId) {
      if (start === index) return { text: template.start(ctx) }
      if (end === index && end !== start) return { text: template.end(ctx), prep: template.endPrep }
    } else if (start === index && challengeSupporter(request, challenge)?.id === childId) {
      return { text: template.support(ctx) }
    }
  }
  return undefined
}

export function takesPart(event: FamilyEvent, childId: string): boolean {
  return event.participants.length === 0 || event.participants.includes(childId)
}

/** True when one of the children has a family event or a challenge day on that day. */
export function busyOn(request: RequestFor<'letter'>, index: number, childIds: string[]): boolean {
  const { events = [], startDate, count } = request.options
  if (childIds.some((id) => challengeFor(request, id, index))) return true
  return events.some(
    (event) =>
      eventIndex(event, startDate, count) === index && childIds.some((id) => takesPart(event, id)),
  )
}

export interface FamilyDayExtras {
  /** Things the parent prepares for this letter (shown on the parent sheet). */
  prep?: string[]
  event?: string
  /** A personal challenge's invitation, praise, or a secret request to support a sibling. */
  challenge?: string
  sunday?: string
  ruleIntro?: string
}

/**
 * Event and house-rule paragraphs for one series. `children` are the readers of
 * that series: one child in a linked series, everybody in a shared letter.
 */
export function familyExtras(
  request: RequestFor<'letter'>,
  children: ChildProfile[],
  helper: string,
): (index: number) => FamilyDayExtras {
  const { events = [], startDate, count, sundaySweets } = request.options
  const plural = children.length > 1
  const v: Say = (s, p) => (plural ? p : s)
  const bands = children.map(ageBand)
  const band = bands.every((b) => b === 'toddler')
    ? 'toddler'
    : bands.includes('young')
      ? 'young'
      : 'older'
  const ids = new Set(children.map((child) => child.id))

  return (index) => {
    const extras: FamilyDayExtras = {}
    const event = events.find(
      (candidate) =>
        eventIndex(candidate, startDate, count) === index &&
        children.some((child) => takesPart(candidate, child.id)),
    )
    if (event) {
      const others = request.children.filter(
        (child) => !ids.has(child.id) && takesPart(event, child.id),
      )
      extras.event = EVENT_TEMPLATES[event.kind][band]({
        v,
        title: event.title.trim(),
        helper,
        othersAllative: others.length > 0 ? namesInCase(others, 'allative') : '',
      })
      const prep = EVENT_TEMPLATES[event.kind].prep
      if (prep) extras.prep = [prep]
    }
    // Challenges speak to one child; a shared letter for several children skips them.
    const challenge =
      children.length === 1 && children[0]
        ? challengeFor(request, children[0].id, index)
        : undefined
    if (challenge) {
      extras.challenge = challenge.text
      if (challenge.prep) extras.prep = [...(extras.prep ?? []), challenge.prep]
    }
    // No Sunday sweet in the middle of the child's own sweets-free days.
    const sweetsFree =
      children.length === 1 &&
      (request.options.challenges ?? []).some((c) => {
        if (c.kind !== 'no-sweets' || c.childId !== children[0]?.id) return false
        const from = dayIndex(c.start, startDate, count)
        const to = dayIndex(c.end, startDate, count)
        return from !== null && to !== null && index >= from && index <= to
      })
    if (sundaySweets && startDate && !sweetsFree) {
      if (index === 0 && band !== 'toddler') extras.ruleIntro = SUNDAY_RULE.intro(v)
      if (weekdayName(addDays(startDate, index)) === 'pühapäev') {
        extras.sunday = band === 'toddler' ? SUNDAY_RULE.toddlerSunday() : SUNDAY_RULE.sunday(v)
      }
    }
    return extras
  }
}

/** Parent-sheet section: which day mentions which event, and when to put sweets in the slipper. */
export function familyInstructions(request: RequestFor<'letter'>): ParentInstruction[] {
  const { events = [], startDate, count, sundaySweets } = request.options
  if (!startDate) return []
  const result: ParentInstruction[] = []
  const placed = events
    .map((event) => ({ event, index: eventIndex(event, startDate, count) }))
    .sort((a, b) => a.event.date.localeCompare(b.event.date))
  if (placed.length > 0) {
    result.push({
      title: 'Pere sündmused kirjades',
      steps: placed.map(({ event, index }) => {
        const who =
          event.participants.length === 0
            ? 'kõik'
            : joinList(
                request.children
                  .filter((child) => event.participants.includes(child.id))
                  .map((c) => c.name),
              )
        const label = `${formatDayMonth(event.date)}: ${EVENT_TEMPLATES[event.kind].label.toLowerCase()}${event.title ? ` (${event.title})` : ''}`
        return index === null
          ? `${label} – jääb kirjade ajavahemikust välja, seda ei mainita.`
          : `${label} – ${who}.`
      }),
    })
  }
  const challenges = (request.options.challenges ?? []).filter((c) =>
    request.children.some((child) => child.id === c.childId),
  )
  if (challenges.length > 0) {
    result.push({
      title: 'Väljakutsed',
      steps: challenges.map((challenge) => {
        const child = request.children.find((c) => c.id === challenge.childId)
        const supporter = challengeSupporter(request, challenge)
        const what =
          challenge.kind === 'custom' && challenge.title
            ? challenge.title
            : CHALLENGES[challenge.kind].label.toLowerCase()
        return `${child?.name}: ${what}, ${formatDayMonth(challenge.start)} – ${formatDayMonth(challenge.end)}.${supporter ? ` ${supporter.name} saab salajase palve teda toetada.` : ''}`
      }),
    })
  }
  if (sundaySweets) {
    const sundays = Array.from({ length: count }, (_, i) => addDays(startDate, i)).filter(
      (date) => weekdayName(date) === 'pühapäev',
    )
    if (sundays.length > 0) {
      result.push({
        title: 'Maiustused pühapäeviti',
        steps: [
          `Pane komm sussi neil päevadel: ${joinList(sundays.map(formatDayMonth))}.`,
          'Teistel päevadel pane sussi midagi muud: mandariin, kleeps, pliiats või pisike meisterdus.',
        ],
      })
    }
  }
  return result
}
