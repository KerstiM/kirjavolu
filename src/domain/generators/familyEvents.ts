import type { ChildProfile, FamilyEvent, ParentInstruction, RequestFor } from '../models'
import { EVENT_TEMPLATES, SUNDAY_RULE } from '../../data/templates/events'
import type { Say } from '../../data/templates/interests'
import { addDays, formatDayMonth, joinList, namesInCase, weekdayName } from '../text/estonian'
import { ageBand } from './audience'

/** Day index of an event within the series, or null when it falls outside it. */
export function eventIndex(event: FamilyEvent, startDate: string, count: number): number | null {
  if (!startDate || !/^\d{4}-\d{2}-\d{2}$/.test(event.date)) return null
  const start = Date.parse(`${startDate}T00:00:00Z`)
  const day = Date.parse(`${event.date}T00:00:00Z`)
  const index = Math.round((day - start) / 86_400_000)
  return index >= 0 && index < count ? index : null
}

export function takesPart(event: FamilyEvent, childId: string): boolean {
  return event.participants.length === 0 || event.participants.includes(childId)
}

/** True when one of the children has a family event on that day. */
export function busyOn(request: RequestFor<'letter'>, index: number, childIds: string[]): boolean {
  const { events = [], startDate, count } = request.options
  return events.some(
    (event) =>
      eventIndex(event, startDate, count) === index && childIds.some((id) => takesPart(event, id)),
  )
}

export interface FamilyDayExtras {
  /** Things the parent prepares for this letter (shown on the parent sheet). */
  prep?: string[]
  event?: string
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
    if (sundaySweets && startDate) {
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
