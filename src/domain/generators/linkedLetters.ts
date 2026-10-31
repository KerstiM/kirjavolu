import type { ChildProfile, ElfPersona, OccasionId, ParentInstruction, RequestFor } from '../models'
import { getOccasion } from '../occasions/occasions'
import { addDays, formatDayMonth, joinList, nameCase } from '../text/estonian'
import { createRng, hashSeed } from '../text/random'
import { PAIR_TEMPLATES, type PairContext, type PairTemplate } from '../../data/templates/pairs'
import { suggestPersonas } from '../../data/templates/personas'
import { ageBand } from './audience'
import type { DraftItem, TypeResult, UsedRegistry } from './context'
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
  return pairedDayIndexes(request.options.count).flatMap((index, k) => {
    const pair = pairs[k % pairs.length]
    if (!pair) return []
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
  const items: DraftItem[] = []

  children.forEach((child, c) => {
    const others = children.filter((other) => other.id !== child.id)
    const extras = (index: number): LinkedExtras => {
      const extra: LinkedExtras = {}
      if (index === 0) extra.opening = introduction(child, others, personas, occasion.id)
      if (index === count - 1 && count > 1 && !isToddler(child))
        extra.finale = finale(personas, children, occasion.id)
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
    instructions: linkedInstructions(request, personas, plan),
  }
}

function linkedInstructions(
  request: RequestFor<'letter'>,
  personas: Record<string, ElfPersona>,
  plan: PairedDay[],
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
  return [helpers, ...(plan.length > 0 || options.count > 1 ? [linkedDays] : []), ...general]
}
