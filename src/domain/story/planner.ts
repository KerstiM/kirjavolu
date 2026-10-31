import type { ChildProfile, ElfPersona, RequestFor } from '../models'
import { addDays, joinList, nameCase, namesInCase } from '../text/estonian'
import { createRng, hashSeed } from '../text/random'
import { adjustBand, ageBand } from '../generators/audience'
import { familyExtras } from '../generators/familyEvents'
import { familyPlan, pairContext, personasFor, type PairedDay } from '../generators/linkedLetters'
import { HELPER_INVITE, HELPER_MISSIONS, type HelperContext } from '../../data/templates/helper'
import { STAND_IN_CAST } from './characters'
import { profileHooks } from './hooks'
import { effectiveHooks } from './sample'
import { scenarioIn, type ScenarioLibrary } from './library'
import type { Band, Cast, HookId, Scenario } from './types'

/**
 * Stage A of generation: the whole collection is planned before any text is
 * written – which letter each child gets on each day, which story stage it tells,
 * which personal detail it uses, whether it has an activity, and which shared
 * events siblings hear about. Rendering (render.ts) only turns this plan into text.
 */

/** Tunable personalization budget; see docs/scenario-engine.md. */
export const PERSONALIZATION = {
  /** Share of letters that may carry a personal detail. */
  share: 0.35,
  /** At least this many days between two uses of the same detail. */
  minGap: 5,
  /** At most this many uses of one detail per 24 letters (scaled for shorter series). */
  perHookPer24: 2,
}

/** Days between optional activities by letter length; "short" letters get none. */
const ACTIVITY_GAP: Record<'medium' | 'long', number> = { medium: 3, long: 2 }

export interface PlannedChild {
  child: ChildProfile
  band: Band
  helper: string
  title: string
  origin: string
  hooks: Set<HookId>
  cast: Cast
}

export type DayContent =
  | { kind: 'scenario'; scenarioId: string; stageId?: string; activity: boolean }
  | { kind: 'event' | 'challenge' | 'pair' | 'secret'; text: string }

export interface PlannedDay {
  index: number
  date?: string
  childId: string
  content: DayContent
  personalizationIds: HookId[]
  /** Extra paragraphs from the family plan on frame days (e.g. an event on the first day). */
  addenda: string[]
  /** Postscript lines: Sunday sweet, the house rule, yesterday's answer. */
  postscripts: string[]
  prep: string[]
  answer?: string
  /** Facts this child has been told before this letter. */
  known: string[]
  variant: number
}

/** One canonical record per shared-world event: when it happened and who hears about it. */
export interface WorldEventRecord {
  scenarioId: string
  index: number
  childIds: string[]
}

export interface SecretHelperPlan {
  childId: string
  inviteIndex: number
  missionIndexes: number[]
  context: HelperContext
}

export interface CollectionPlan {
  occasionId: string
  count: number
  startDate: string
  connected: boolean
  linked: boolean
  children: PlannedChild[]
  /** Child-major order: all days of the first child, then the second … */
  days: PlannedDay[]
  worldEvents: WorldEventRecord[]
  /** World fact → day index on which it happened. */
  facts: Map<string, number>
  pairs: PairedDay[]
  secret?: SecretHelperPlan
}

type Slots = Map<string, (PlannedDay | undefined)[]>

export function planCollection(
  request: RequestFor<'letter'>,
  library: ScenarioLibrary,
  variants: readonly number[] = [],
): CollectionPlan {
  const { options, children, seed } = request
  const count = options.count
  const last = count - 1
  const linked = children.length > 1
  const connected = options.connected && count > 1
  const personas: Record<string, ElfPersona> = linked
    ? personasFor(request)
    : Object.fromEntries(
        children.map((child) => [
          child.id,
          { name: options.sender.trim() || 'Päkapikk', title: '', origin: '' },
        ]),
      )
  const planned = children.map((child) =>
    plannedChild(child, children, personas, request.general.difficulty),
  )
  const dateOf = (index: number) =>
    options.startDate ? addDays(options.startDate, index) : undefined
  const variantOf = (c: number, index: number) => variants[c * count + index] ?? 0
  const scenario = (id: string) => scenarioIn(library, id)

  const slots: Slots = new Map(
    planned.map((p) => [p.child.id, Array.from({ length: count }, () => undefined)]),
  )
  const facts = new Map<string, number>()
  const worldEvents: WorldEventRecord[] = []
  const usedBy = new Map<string, Set<string>>(planned.map((p) => [p.child.id, new Set()]))
  const familyUsed = new Set<string>()

  const hookUses = new Map<string, number[]>()
  const maxPerHook = Math.max(1, Math.round((PERSONALIZATION.perHookPer24 * count) / 24))
  const personalCount = new Map<string, number>()
  const canPersonalize = (p: PlannedChild, s: Scenario, index: number): HookId[] =>
    effectiveHooks(s, p.band).filter((hook) => {
      if (!p.hooks.has(hook)) return false
      const uses = hookUses.get(`${p.child.id}:${hook}`) ?? []
      return (
        uses.length < maxPerHook && uses.every((u) => Math.abs(index - u) >= PERSONALIZATION.minGap)
      )
    })
  const markPersonal = (p: PlannedChild, index: number, hooks: HookId[]) => {
    if (hooks.length === 0) return
    for (const hook of hooks) {
      const key = `${p.child.id}:${hook}`
      hookUses.set(key, [...(hookUses.get(key) ?? []), index])
    }
    personalCount.set(p.child.id, (personalCount.get(p.child.id) ?? 0) + 1)
  }
  const day = (p: PlannedChild, index: number, content: DayContent): PlannedDay => ({
    index,
    date: dateOf(index),
    childId: p.child.id,
    content,
    personalizationIds: [],
    addenda: [],
    postscripts: [],
    prep: [],
    known: [],
    variant: variantOf(planned.indexOf(p), index),
  })
  const slotOf = (p: PlannedChild) => slots.get(p.child.id) as (PlannedDay | undefined)[]
  const free = (p: PlannedChild, index: number) => index > 0 && index < last && !slotOf(p)[index]
  const recomputeFacts = () => {
    facts.clear()
    for (const p of planned) {
      for (const d of slotOf(p))
        if (d?.content.kind === 'scenario') establish(scenario(d.content.scenarioId), d.index)
    }
  }
  const establish = (s: Scenario, index: number) => {
    for (const fact of s.establishes ?? []) {
      const at = facts.get(fact)
      if (at === undefined || index < at) facts.set(fact, index)
    }
  }
  const assign = (p: PlannedChild, index: number, s: Scenario, stageId?: string) => {
    const entry = day(p, index, { kind: 'scenario', scenarioId: s.id, stageId, activity: false })
    entry.personalizationIds = canPersonalize(p, s, index)
    markPersonal(p, index, entry.personalizationIds)
    slotOf(p)[index] = entry
    usedBy.get(p.child.id)?.add(s.id)
    familyUsed.add(s.id)
    establish(s, index)
  }

  // 1. Frame: introduction, farewell and Christmas Eve when it falls inside the series.
  const eveIndex = Array.from({ length: count }, (_, i) => dateOf(i)).findIndex((d) =>
    d?.endsWith('-12-24'),
  )
  for (const p of planned) {
    assign(p, 0, scenario('introduction'))
    if (count > 1) assign(p, last, scenario('farewell'))
    if (eveIndex > 0 && eveIndex < last) assign(p, eveIndex, scenario('christmas-eve'))
  }

  // 2. Real family plans: events and challenges take the whole letter of that day.
  const extrasOf = new Map(
    planned.map((p) => [p.child.id, familyExtras(request, [p.child], p.helper)]),
  )
  for (const p of planned) {
    const extras = extrasOf.get(p.child.id) as ReturnType<typeof familyExtras>
    for (let index = 0; index < count; index++) {
      const extra = extras(index)
      const text = extra.challenge ?? extra.event
      const kind = extra.challenge ? 'challenge' : 'event'
      const existing = slotOf(p)[index]
      if (text && existing) {
        // First and last letters keep their frame; the family's plan is added after it.
        existing.addenda.push(text)
        existing.prep.push(...(extra.prep ?? []))
      } else if (text) {
        const entry = day(p, index, { kind, text })
        entry.prep.push(...(extra.prep ?? []))
        slotOf(p)[index] = entry
      }
    }
  }

  // 3. Paired sibling days (older reader does something for a younger sibling).
  const pairs = linked ? familyPlan(request) : []
  const byId = new Map(planned.map((p) => [p.child.id, p]))
  for (const pair of pairs) {
    const giver = byId.get(pair.giverId) as PlannedChild
    const receiver = byId.get(pair.receiverId) as PlannedChild
    if (slotOf(giver)[pair.index] || slotOf(receiver)[pair.index]) continue
    const ctx = pairContext(giver.child, receiver.child, personas)
    const receiverText =
      receiver.band === 'toddler'
        ? pair.template.receiverToddler?.(ctx)
        : pair.template.receiverReader?.(ctx)
    const giverDay = day(giver, pair.index, { kind: 'pair', text: pair.template.giver(ctx) })
    const prep = pair.template.prep?.(ctx)
    if (prep) giverDay.prep.push(prep)
    slotOf(giver)[pair.index] = giverDay
    if (receiverText)
      slotOf(receiver)[pair.index] = day(receiver, pair.index, { kind: 'pair', text: receiverText })
  }

  // 4. Secret helper: the oldest reader helps the elves with the younger ones, in secret.
  // A short series has no room for a second storyline next to the main one.
  const secret =
    linked && count >= 12 ? planSecretHelper(request, planned, slotOf, free, day, pairs) : undefined

  // 5. The story arc, stage by stage. Shared stages happen on one day for everybody.
  if (connected) {
    const arc = library.arcs.find((candidate) => candidate.occasions.includes(request.occasionId))
    const stages = (arc?.stages ?? []).filter((stage) => count >= 12 || stage.required)
    const lastStage = new Map<string, number>()
    for (const [k, stage] of stages.entries()) {
      const s = scenario(stage.scenarioId)
      const tellers = oneTellerPerBand(planned.filter((p) => s.variants[p.band]))
      if (tellers.length === 0) continue
      // A short series keeps only the required stages, spread evenly between the first and last letter.
      const at = count >= 12 ? stage.at : k / Math.max(1, stages.length - 1)
      const target = Math.min(Math.max(1, 1 + Math.round(at * (last - 2))), last - 1)
      const after = (p: PlannedChild) => (lastStage.get(p.child.id) ?? 0) + 1
      const placeAll = (index: number) => {
        for (const p of tellers) {
          assign(p, index, s, stage.id)
          lastStage.set(p.child.id, index)
        }
        if (tellers.length > 1 || s.world)
          worldEvents.push({ scenarioId: s.id, index, childIds: tellers.map((p) => p.child.id) })
      }
      if (stage.shared) {
        const earliest = Math.max(...tellers.map(after))
        const fits = (index: number) => index >= earliest && tellers.every((p) => free(p, index))
        const index = searchFrom(target, last, fits)
        if (index !== undefined) {
          placeAll(index)
          continue
        }
      }
      for (const p of tellers) {
        const index = searchFrom(
          Math.max(target, after(p)),
          last,
          (i) => i >= after(p) && free(p, i),
        )
        if (index === undefined) continue
        assign(p, index, s, stage.id)
        lastStage.set(p.child.id, index)
      }
    }
    // A child whose days were too full to reach the end of the story does not start it.
    const endings = new Set(
      stages
        .filter((stage) => ['climax', 'resolution'].includes(scenario(stage.scenarioId).role))
        .map((stage) => stage.id),
    )
    for (const p of planned) {
      const told = slotOf(p).filter((d) => d?.content.kind === 'scenario' && d.content.stageId)
      if (told.some((d) => d?.content.kind === 'scenario' && endings.has(d.content.stageId ?? '')))
        continue
      for (const d of told) {
        if (!d || d.content.kind !== 'scenario') continue
        slotOf(p)[d.index] = undefined
        usedBy.get(p.child.id)?.delete(d.content.scenarioId)
        for (const event of worldEvents)
          event.childIds = event.childIds.filter((id) => id !== p.child.id)
      }
    }
    recomputeFacts()
  }

  // 6. Standalone episodes on every remaining day, chosen day by day for the whole family.
  const standalone = library.scenarios.filter((s) => s.role === 'standalone')
  const essentialNear = (p: PlannedChild, index: number) =>
    [index - 2, index - 1, index + 1, index + 2].some((i) => {
      const entry = slotOf(p)[i]
      return (
        entry?.content.kind === 'scenario' &&
        !!scenario(entry.content.scenarioId).activities?.[p.band]?.essential
      )
    })

  for (let index = 1; index < last; index++) {
    for (const p of planned) {
      if (!free(p, index)) continue
      const c = planned.indexOf(p)
      const rng = createRng(hashSeed(seed, 'plan', p.child.id, index, variantOf(c, index)))
      const recent = [index - 1, index - 2].map((i) => slotOf(p)[i])
      const recentTags = recent.map((d) =>
        d?.content.kind === 'scenario' ? scenario(d.content.scenarioId).tags : [],
      )
      const wantsPersonal =
        (personalCount.get(p.child.id) ?? 0) < Math.ceil(PERSONALIZATION.share * (index + 1))
      const candidates = standalone
        .filter((s) => eligible(s, p, index))
        .map((s) => ({ s, score: score(s, p, index) + rng.next() }))
        .sort((a, b) => b.score - a.score)
      if (candidates.length === 0) continue
      const choice = candidates[variantOf(c, index) % candidates.length]?.s as Scenario
      assign(p, index, choice)
      if (choice.world) {
        // Everybody else who is free today hears the same event from their own helper.
        const tellers = oneTellerPerBand([
          p,
          ...planned.filter(
            (o) =>
              o !== p &&
              free(o, index) &&
              choice.variants[o.band] &&
              !usedBy.get(o.child.id)?.has(choice.id),
          ),
        ])
        for (const o of tellers.slice(1)) assign(o, index, choice)
        worldEvents.push({ scenarioId: choice.id, index, childIds: tellers.map((t) => t.child.id) })
      }

      function eligible(s: Scenario, child: PlannedChild, i: number): boolean {
        if (!s.variants[child.band] || !s.occasions.includes(request.occasionId)) return false
        if (usedBy.get(child.child.id)?.has(s.id)) return false
        if (s.world && worldEvents.some((event) => event.scenarioId === s.id)) return false
        if (s.needsSiblings && children.length < 2) return false
        if (s.earliest !== undefined && i < s.earliest) return false
        if ((s.requires ?? []).some((fact) => !((facts.get(fact) ?? Infinity) < i))) return false
        if (s.until !== undefined && (facts.get(s.until) ?? Infinity) < i) return false
        if (s.onlyWithHook && canPersonalize(child, s, i).length === 0) return false
        return true
      }

      function score(s: Scenario, child: PlannedChild, i: number): number {
        let value = 0
        if (wantsPersonal && canPersonalize(child, s, i).length > 0) value += 1.5
        if (s.tones?.includes(request.general.tone)) value += 0.5
        // A toddler's cards about the big brothers and sisters are the ones they love most.
        if (s.needsSiblings) value += 0.3
        // Shared-world events are worth more when siblings can hear them on the same day.
        if (s.world)
          value +=
            0.5 * planned.filter((o) => o !== child && free(o, i) && s.variants[o.band]).length
        const [yesterday = [], dayBefore = []] = recentTags
        value -= 0.8 * s.tags.filter((tag) => yesterday.includes(tag)).length
        value -= 0.4 * s.tags.filter((tag) => dayBefore.includes(tag)).length
        if (s.activities?.[child.band]?.essential && essentialNear(child, i)) value -= 1
        // Siblings comparing letters should find different stories; reuse only when nothing else is left.
        if (!s.world && familyUsed.has(s.id)) value -= 5
        return value
      }
    }
  }

  // 7. Activities and postscripts, in order of the days.
  for (const p of planned) {
    const extras = extrasOf.get(p.child.id) as ReturnType<typeof familyExtras>
    const known = new Set<string>()
    let lastActivity = -Infinity
    slotOf(p).forEach((entry, index) => {
      if (!entry) return
      entry.known = [...known]
      const extra = extras(index)
      if (extra.ruleIntro) entry.postscripts.push(extra.ruleIntro)
      if (extra.sunday) {
        entry.postscripts.push(extra.sunday)
        entry.prep.push('komm sussi')
      }
      if (entry.content.kind !== 'scenario') return
      const s = scenario(entry.content.scenarioId)
      const activity = s.activities?.[p.band]
      const length = request.general.length
      const room = length !== 'short' && index - lastActivity >= ACTIVITY_GAP[length]
      if (activity && (activity.essential || room) && !(activity.reveal && index === last)) {
        entry.content.activity = true
        lastActivity = index
        if (activity.answer) entry.answer = activity.answer
        if (activity.prep) entry.prep.push(activity.prep)
      }
      for (const fact of s.establishes ?? []) known.add(fact)
    })
  }

  return {
    occasionId: request.occasionId,
    count,
    startDate: options.startDate,
    connected,
    linked,
    children: planned,
    days: planned.flatMap((p) => slotOf(p).filter((d): d is PlannedDay => !!d)),
    worldEvents,
    facts,
    pairs,
    secret,
  }
}

function plannedChild(
  child: ChildProfile,
  all: ChildProfile[],
  personas: Record<string, ElfPersona>,
  difficulty: RequestFor<'letter'>['general']['difficulty'],
): PlannedChild {
  const band = adjustBand(ageBand(child), difficulty)
  const persona = personas[child.id] as ElfPersona
  const others = all.filter((other) => other.id !== child.id)
  const helperOf = (target: Band) => {
    const sibling = others.find((other) => ageBand(other) === target)
    return sibling ? (personas[sibling.id] as ElfPersona).name : undefined
  }
  return {
    child,
    band,
    helper: persona.name,
    title: persona.title,
    origin: persona.origin,
    hooks: profileHooks(child),
    cast: {
      older: helperOf('older') ?? STAND_IN_CAST.older,
      young: helperOf('young') ?? STAND_IN_CAST.young,
      tiny: helperOf('toddler') ?? STAND_IN_CAST.tiny,
    },
  }
}

/** A scenario's narrator is often its hero, so at most one child per age band tells it. */
function oneTellerPerBand(children: PlannedChild[]): PlannedChild[] {
  const seen = new Set<Band>()
  return children.filter((p) => {
    if (seen.has(p.band)) return false
    seen.add(p.band)
    return true
  })
}

/** First index ≥ start that fits; then backwards from start. */
function searchFrom(
  start: number,
  last: number,
  fits: (index: number) => boolean,
): number | undefined {
  for (let i = start; i < last; i++) if (fits(i)) return i
  for (let i = start - 1; i > 0; i--) if (fits(i)) return i
  return undefined
}

function planSecretHelper(
  request: RequestFor<'letter'>,
  planned: PlannedChild[],
  slotOf: (p: PlannedChild) => (PlannedDay | undefined)[],
  free: (p: PlannedChild, index: number) => boolean,
  day: (p: PlannedChild, index: number, content: DayContent) => PlannedDay,
  pairs: PairedDay[],
): SecretHelperPlan | undefined {
  if (request.occasionId !== 'christmas') return undefined
  const oldest = [...planned]
    .filter((p) => p.band !== 'toddler')
    .sort((a, b) => b.child.age - a.child.age)[0]
  if (!oldest) return undefined
  const younger = planned.filter((p) => p.child.age < oldest.child.age).map((p) => p.child)
  if (younger.length === 0) return undefined
  const count = request.options.count
  const context: HelperContext = {
    siblingsAllative: namesInCase(younger, 'allative'),
    siblingsComitative: namesInCase(younger, 'comitative'),
    siblings: joinList(younger.map((child) => child.name)),
    siblingGenitive: nameCase(younger[0] as ChildProfile, 'genitive'),
    sibling: (younger[0] as ChildProfile).name,
    helpersOf: 'päkapikkude',
    year: Number(request.options.startDate.slice(0, 4)) || new Date().getFullYear(),
  }
  const inviteIndex = searchFrom(1, count - 1, (i) => free(oldest, i))
  if (inviteIndex === undefined) return undefined
  slotOf(oldest)[inviteIndex] = day(oldest, inviteIndex, {
    kind: 'secret',
    text: HELPER_INVITE(context),
  })
  const targets = [6, 11, 16]
  // A mission that repeats a paired sibling task of the same series is left out.
  const paired = new Set(pairs.map((pair) => pair.template.id))
  const suitable = HELPER_MISSIONS.filter((m) => younger.length > 1 || m.id !== 'helping-hands')
  const repeats = (m: (typeof suitable)[number]) => !!m.similarPair && paired.has(m.similarPair)
  const missions = [...suitable.filter((m) => !repeats(m)), ...suitable.filter(repeats)]
  const missionIndexes: number[] = []
  targets.forEach((target, k) => {
    const index = searchFrom(
      Math.max(target, inviteIndex + 2),
      count - 1,
      (i) => i > inviteIndex + 1 && free(oldest, i),
    )
    const mission = missions[k % missions.length]
    if (index === undefined || !mission) return
    const sibling = younger[k % younger.length] as ChildProfile
    const ctx = {
      ...context,
      sibling: sibling.name,
      siblingGenitive: nameCase(sibling, 'genitive'),
    }
    const planned = day(oldest, index, { kind: 'secret', text: mission.text(ctx) })
    const prep = mission.prep?.(ctx)
    if (prep) planned.prep.push(prep)
    slotOf(oldest)[index] = planned
    missionIndexes.push(index)
  })
  return { childId: oldest.child.id, inviteIndex, missionIndexes, context }
}
