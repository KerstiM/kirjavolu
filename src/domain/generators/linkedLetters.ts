import type { ChildProfile, ElfPersona, OccasionId, ParentInstruction, RequestFor } from '../models'
import { getOccasion } from '../occasions/occasions'
import { addDays, formatDayMonth, joinList, nameCase, namesInCase } from '../text/estonian'
import { createRng, hashSeed } from '../text/random'
import { PAIR_TEMPLATES, type PairContext, type PairTemplate } from '../../data/templates/pairs'
import { suggestPersonas } from '../../data/templates/personas'
import { ageBand } from './audience'
import type { DraftItem, TypeResult, UsedRegistry } from './context'
import { busyOn, familyExtras } from './familyEvents'
import {
  HELPER_GOSSIP,
  TODDLER_HELPER_GOSSIP,
  TODDLER_SIBLING_LINES,
  type SiblingNames,
} from '../../data/templates/gossip'
import {
  HELPER_INVITE,
  HELPER_MISSIONS,
  HELPER_RULE,
  HELPER_TITLE,
  type HelperContext,
} from '../../data/templates/helper'
import { generateLetters, letterInstructions, type LinkedExtras } from './letterGenerator'

export interface PairedDay {
  index: number
  giverId: string
  receiverId: string
  template: PairTemplate
}

const PAIR_LABELS: Record<string, string> = {
  read: 'ettelugemine',
  teach: 'õpetamine',
  play: 'koos mängimine',
  drawing: 'joonistus kingiks',
  'secret-letter': 'salajane kiri päkapiku nimel',
  slipper: 'sussi abiline',
  kindness: 'salajane heategu',
}

const isToddler = (child: ChildProfile) => ageBand(child) === 'toddler'

/** Days with a paired task: roughly every fifth day, never the first or the last one. */
export function pairedDayIndexes(count: number): number[] {
  if (count < 5) return []
  const step = Math.max(3, Math.round(count / 5))
  const days: number[] = []
  for (let i = step - 1; i < count - 1; i += step) days.push(i)
  return days
}

/** Older readers do something for younger siblings, never the other way round. */
export function siblingPairs(
  children: ChildProfile[],
): { giver: ChildProfile; receiver: ChildProfile }[] {
  const pairs: { giver: ChildProfile; receiver: ChildProfile }[] = []
  for (const giver of children) {
    if (isToddler(giver) || giver.age < 5) continue
    for (const receiver of children) {
      if (receiver.id !== giver.id && receiver.age < giver.age) pairs.push({ giver, receiver })
    }
  }
  return pairs
}

function fits(template: PairTemplate, receiver: ChildProfile, occasion: OccasionId): boolean {
  if (template.occasions && !template.occasions.includes(occasion)) return false
  return isToddler(receiver) ? !!template.receiverToddler : !!template.receiverReader
}

/**
 * Family plan made before any letter is written: which day links which siblings
 * with which task. Both letters of a paired day come from the same plan row,
 * so they always match.
 */
export function familyPlan(request: RequestFor<'letter'>): PairedDay[] {
  const pairs = siblingPairs(request.children)
  if (pairs.length === 0) return []
  const rng = createRng(hashSeed(request.seed, 'family-plan'))
  const templates = rng.shuffle(PAIR_TEMPLATES)
  const usedTemplates = new Set<string>()
  // Paired days step aside when the giver or the receiver has a family event, so one letter never carries two plans.
  const taken = new Set<number>()
  const last = request.options.count - 1
  return pairedDayIndexes(request.options.count).flatMap((planned, k) => {
    const pair = pairs[k % pairs.length]
    if (!pair) return []
    const ids = [pair.giver.id, pair.receiver.id]
    let index = planned
    while ((busyOn(request, index, ids) || taken.has(index)) && index < last - 1) index++
    if (busyOn(request, index, ids) || taken.has(index)) return []
    taken.add(index)
    const candidates = templates.filter((t) => fits(t, pair.receiver, request.occasionId))
    const template = candidates.find((t) => !usedTemplates.has(t.id)) ?? candidates[0]
    if (!template) return []
    usedTemplates.add(template.id)
    return [{ index, giverId: pair.giver.id, receiverId: pair.receiver.id, template }]
  })
}

export function personasFor(request: RequestFor<'letter'>): Record<string, ElfPersona> {
  const suggested = suggestPersonas(request.children, request.occasionId, isToddler)
  const chosen = request.options.personas ?? {}
  const result: Record<string, ElfPersona> = {}
  for (const child of request.children) {
    const own = chosen[child.id]
    const fallback = suggested[child.id] as ElfPersona
    result[child.id] = {
      name: own?.name.trim() || fallback.name,
      title: own?.title.trim() || fallback.title,
      origin: own?.origin.trim() || fallback.origin,
    }
  }
  return result
}

function introduction(
  child: ChildProfile,
  others: ChildProfile[],
  personas: Record<string, ElfPersona>,
  occasion: OccasionId,
): string {
  const me = personas[child.id] as ElfPersona
  if (isToddler(child)) {
    const big = others.map((o) => o.name)
    return `Tere, väike ${child.name}! Mina olen ${me.name} – ${me.origin}. ${joinList(big)} ${big.length > 1 ? 'saavad' : 'saab'} ka kirju!`
  }
  const when = occasion === 'christmas' ? 'Sel detsembril' : 'Samal ajal'
  const visits = others.map((o) => {
    const helper = personas[o.id] as ElfPersona
    return `${nameCase(o, 'genitive')} juures ${helper.name} ${helper.title}`
  })
  return `Tere! Mina olen ${me.name} ${me.title} – ${me.origin}. ${when} käib ${joinList(visits)}. Me oleme kõik head sõbrad ja räägime üksteisele kõigest.`
}

function finale(
  personas: Record<string, ElfPersona>,
  children: ChildProfile[],
  occasion: OccasionId,
): string {
  const names = joinList(children.map((c) => (personas[c.id] as ElfPersona).name))
  return occasion === 'christmas'
    ? `Täna lõpetavad kõik päkapikud – ${names} – oma töö ja lähevad koos töökotta tagasi. Ma räägin Jõuluvanale, kui hästi te kõik üksteist hoidsite.`
    : `Täna lõpetame kõik koos – ${names}. Ma räägin kõigile, kui hästi te kõik üksteist hoidsite.`
}

/**
 * Everyday remarks about the siblings' helpers, about every fourth day – on days
 * without a paired task, family event, challenge or secret mission.
 */
export function planGossip(
  request: RequestFor<'letter'>,
  child: ChildProfile,
  offset: number,
  personas: Record<string, ElfPersona>,
  plan: PairedDay[],
  helperArc: HelperArc | null,
  usedTexts: Set<string>,
): Map<number, string> {
  const { count } = request.options
  const others = request.children.filter((other) => other.id !== child.id)
  const result = new Map<number, string>()
  if (count < 7 || others.length === 0) return result
  const taken = (index: number) =>
    plan.some((d) => d.index === index && (d.giverId === child.id || d.receiverId === child.id)) ||
    !!helperArc?.days.has(index) ||
    busyOn(request, index, [child.id])
  // Takes the first not-yet-used variant, so neither the child nor the siblings read the same story twice.
  const fresh = (candidates: string[]) =>
    candidates.find((text) => !usedTexts.has(text) && !usedTexts.has(templateKey(text)))
  const siblings: SiblingNames = {
    names: joinList(others.map((o) => o.name)),
    allative: namesInCase(others, 'allative'),
    withYou: joinList([...others.map((o) => o.name), 'sina']),
    plural: others.length > 1,
  }
  let k = 0
  for (let index = 1; index < count - 1; index++) {
    if ((index + offset) % 4 !== 2 || taken(index)) continue
    let text: string | undefined
    if (isToddler(child)) {
      text = fresh(rotate(TODDLER_SIBLING_LINES, k + offset).map((line) => line(siblings)))
    } else {
      const sibling = others[k % others.length] as ChildProfile
      const ctx = {
        helper: (personas[sibling.id] as ElfPersona).name,
        child: sibling.name,
        childGenitive: nameCase(sibling, 'genitive'),
        childElative: nameCase(sibling, 'elative'),
        childAllative: nameCase(sibling, 'allative'),
      }
      const pool = isToddler(sibling) ? TODDLER_HELPER_GOSSIP : HELPER_GOSSIP
      text = fresh(rotate(pool, k + offset).map((template) => template(ctx)))
    }
    if (text) {
      usedTexts.add(text)
      // Same template with another name would read as a copy when siblings compare letters.
      usedTexts.add(templateKey(text))
      result.set(index, text)
    }
    k++
  }
  return result
}

function rotate<T>(items: readonly T[], by: number): T[] {
  const n = items.length
  return items.map((_, i) => items[(i + by) % n] as T)
}

/** Rough template identity: the first three words. */
function templateKey(text: string): string {
  return `key:${text.split(' ').slice(0, 3).join(' ')}`
}

interface HelperArc {
  context: HelperContext
  days: Map<number, { text: string; prep?: string; reply?: boolean }>
}

/**
 * Secret helper arc for the oldest reader at Christmas: an invitation, the
 * helpers' rule the next day and a few secret missions for the younger ones.
 * Uses only days that are free of paired tasks and family events.
 */
export function planHelperArc(
  request: RequestFor<'letter'>,
  plan: PairedDay[],
  oldest: ChildProfile | undefined,
): HelperArc | null {
  const { count } = request.options
  if (request.occasionId !== 'christmas' || count < 7 || !oldest) return null
  const younger = request.children.filter((child) => child.age < oldest.age)
  if (younger.length === 0) return null
  const busy = (index: number) =>
    plan.some(
      (d) => d.index === index && (d.giverId === oldest.id || d.receiverId === oldest.id),
    ) || busyOn(request, index, [oldest.id])
  const context: HelperContext = {
    siblingsAllative: namesInCase(younger, 'allative'),
    siblingsComitative: namesInCase(younger, 'comitative'),
    siblings: joinList(younger.map((child) => child.name)),
    siblingGenitive: nameCase(younger[0] as ChildProfile, 'genitive'),
    sibling: (younger[0] as ChildProfile).name,
    helpersOf: 'päkapikkude',
    year: Number(request.options.startDate.slice(0, 4)) || new Date().getFullYear(),
  }
  const days = new Map<number, { text: string; prep?: string; reply?: boolean }>()
  // Invitation and rule on two consecutive free days near the start.
  let invite = 1
  while ((busy(invite) || busy(invite + 1)) && invite < count - 3) invite++
  if (busy(invite) || busy(invite + 1)) return null
  days.set(invite, { text: HELPER_INVITE(context) })
  days.set(invite + 1, { text: HELPER_RULE(context), reply: true })
  const targets = count >= 12 ? [6, 11, 16] : [4]
  const missions = HELPER_MISSIONS.filter((m) => younger.length > 1 || m.id !== 'helping-hands')
  targets.forEach((target, k) => {
    let day = Math.max(target, invite + 2)
    while ((busy(day) || days.has(day)) && day < count - 2) day++
    const mission = missions[k % missions.length]
    if (!mission || busy(day) || days.has(day) || day >= count - 1) return
    // Rotate through the younger siblings so each gets some attention.
    const sibling = younger[k % younger.length] as ChildProfile
    const ctx = {
      ...context,
      sibling: sibling.name,
      siblingGenitive: nameCase(sibling, 'genitive'),
    }
    days.set(day, { text: mission.text(ctx), prep: mission.prep?.(ctx) })
  })
  return { context, days }
}

function pairContext(
  giver: ChildProfile,
  receiver: ChildProfile,
  personas: Record<string, ElfPersona>,
): PairContext {
  return {
    giver: giver.name,
    giverGenitive: nameCase(giver, 'genitive'),
    receiver: receiver.name,
    receiverGenitive: nameCase(receiver, 'genitive'),
    receiverAllative: nameCase(receiver, 'allative'),
    receiverComitative: nameCase(receiver, 'comitative'),
    receiverHelper: (personas[receiver.id] as ElfPersona).name,
  }
}

/** One series per child, coordinated through the family plan and the shared helpers. */
export function generateLinkedLetters(
  request: RequestFor<'letter'>,
  variants: readonly number[],
): TypeResult {
  const { options, children } = request
  const count = options.count
  const occasion = getOccasion(request.occasionId)
  const personas = personasFor(request)
  const plan = familyPlan(request)
  const byId = new Map(children.map((child) => [child.id, child]))
  // Shared registry: sisters and brothers compare letters, so cores and tasks should differ.
  const used: UsedRegistry = new Map()
  const storyteller = [...children]
    .filter((child) => !isToddler(child))
    .sort((a, b) => b.age - a.age)[0]
  const helperArc = planHelperArc(request, plan, storyteller)
  const usedGossip = new Set<string>()
  const items: DraftItem[] = []

  children.forEach((child, c) => {
    const others = children.filter((other) => other.id !== child.id)
    const family = familyExtras(request, [child], (personas[child.id] as ElfPersona).name)
    const gossipPlan = planGossip(
      request,
      child,
      c,
      personas,
      plan,
      child.id === storyteller?.id ? helperArc : null,
      usedGossip,
    )
    const extras = (index: number): LinkedExtras => {
      const extra: LinkedExtras = { ...family(index) }
      if (index === 0) extra.opening = introduction(child, others, personas, occasion.id)
      if (index === count - 1 && count > 1 && !isToddler(child)) {
        extra.finale = finale(personas, children, occasion.id)
        if (helperArc && child.id === storyteller?.id)
          extra.finale += ` ${HELPER_TITLE(helperArc.context)}`
      }
      const gossip = gossipPlan.get(index)
      if (gossip && !extra.challenge && !extra.event) extra.gossip = gossip
      const helperDay = child.id === storyteller?.id ? helperArc?.days.get(index) : undefined
      if (helperDay?.reply) {
        extra.reply = helperDay.text
      } else if (helperDay) {
        extra.task = helperDay.text
        if (helperDay.prep) extra.prep = [...(extra.prep ?? []), helperDay.prep]
      }
      const day = plan.find(
        (d) => d.index === index && (d.giverId === child.id || d.receiverId === child.id),
      )
      if (day) {
        const giver = byId.get(day.giverId) as ChildProfile
        const receiver = byId.get(day.receiverId) as ChildProfile
        const ctx = pairContext(giver, receiver, personas)
        extra.task =
          day.giverId === child.id
            ? day.template.giver(ctx)
            : isToddler(child)
              ? day.template.receiverToddler?.(ctx)
              : day.template.receiverReader?.(ctx)
        const prep = day.giverId === child.id ? day.template.prep?.(ctx) : undefined
        if (prep) extra.prep = [...(extra.prep ?? []), prep]
      }
      return extra
    }
    // Only the oldest child follows the serial story; siblings would otherwise read the same plot.
    const childRequest: RequestFor<'letter'> = {
      ...request,
      children: [child],
      seed: hashSeed(request.seed, child.id) % 2147483647,
      options: { ...options, connected: options.connected && child.id === storyteller?.id },
    }
    const series = generateLetters(childRequest, variants.slice(c * count, (c + 1) * count), {
      sender: (personas[child.id] as ElfPersona).name,
      extras,
      used,
    })
    items.push(
      ...series.items.map((item) => ({ ...item, childId: child.id, forChild: child.name })),
    )
  })

  return {
    title: count > 1 ? `${count} kirja igale lapsele` : 'Kirjad igale lapsele',
    subtitle: `${occasion.name} · ${joinList(children.map((c) => c.name))} · seotud sarjad`,
    items,
    instructions: linkedInstructions(request, personas, plan, helperArc, storyteller),
  }
}

function linkedInstructions(
  request: RequestFor<'letter'>,
  personas: Record<string, ElfPersona>,
  plan: PairedDay[],
  helperArc: HelperArc | null,
  oldest: ChildProfile | undefined,
): ParentInstruction[] {
  const { options, children } = request
  const byId = new Map(children.map((child) => [child.id, child]))
  const dayLabel = (index: number) =>
    options.startDate ? formatDayMonth(addDays(options.startDate, index)) : `${index + 1}. kiri`
  const helpers: ParentInstruction = {
    title: request.occasionId === 'christmas' ? 'Pere päkapikud' : 'Pere abilised',
    steps: children.map((child) => {
      const p = personas[child.id] as ElfPersona
      return `${child.name}: ${p.name} ${p.title} – ${p.origin}.`
    }),
  }
  const linkedDays: ParentInstruction = {
    title: 'Seotud päevad',
    steps: [
      '1. kirjas tutvustab iga abiline ka õdede-vendade abilisi, viimases kirjas lõpetavad kõik koos.',
      ...plan.map((day) => {
        const giver = byId.get(day.giverId)?.name ?? ''
        const receiver = byId.get(day.receiverId)?.name ?? ''
        return `${dayLabel(day.index)}: ${giver} → ${receiver} (${PAIR_LABELS[day.template.id] ?? day.template.id}). Mõlema kiri teab sellest.`
      }),
    ],
  }
  const general = letterInstructions(request, options.connected && options.count > 1)
  const helperDays = helperArc ? [...helperArc.days.keys()].sort((a, b) => a - b) : []
  const secret: ParentInstruction[] =
    helperArc && oldest
      ? [
          {
            title: `${oldest.name} on salajane abiline`,
            steps: [
              `${dayLabel(helperDays[0] ?? 1)}: ${oldest.name} saab kutse olla päkapikkude salajane abiline ja vastab sussi juurde „JAH“. Järgmisel päeval tuleb abiliste reegel.`,
              `Salamissioonid: ${helperDays.slice(2).map(dayLabel).join(', ') || '–'}. Nooremad ei tea neist midagi.`,
              'Viimases kirjas nimetatakse ta ametlikult päkapikkude abiliseks.',
            ],
          },
        ]
      : []
  return [
    helpers,
    ...(plan.length > 0 || options.count > 1 ? [linkedDays] : []),
    ...secret,
    ...general,
  ]
}
