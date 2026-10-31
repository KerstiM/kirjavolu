import type {
  ContentTypeId,
  GeneratedItem,
  Occasion,
  ParentInstruction,
  RequestFor,
} from '../models'
import { getOccasion } from '../occasions/occasions'
import { createRng, hashSeed, type Rng } from '../text/random'
import type { Line, LineContext } from '../../data/templates/types'
import { buildAudience, type Audience } from './audience'

export type DraftItem = Omit<GeneratedItem, 'id' | 'variant' | 'edited'>

export interface TypeResult {
  title: string
  subtitle: string
  items: DraftItem[]
  instructions: ParentInstruction[]
}

/**
 * Picks texts for one item. Each item has its own RNG (seed + index + variant),
 * so a single item can be regenerated without reshuffling the structure, while a
 * shared "used" registry keeps texts unique across the whole set.
 */
export interface ItemPicker {
  rng: Rng
  pick<T>(pool: readonly T[], key: string): T
  /** Picks up to `count` distinct entries. */
  pickMany<T>(pool: readonly T[], key: string, count: number): T[]
  /** Picks from the first pool that still has unused entries. */
  pickTiered<T>(pools: readonly (readonly T[])[], key: string): T
  /** True while the pool still has entries not used in this set. */
  hasFresh<T>(pool: readonly T[], key: string): boolean
}

export interface GenContext<K extends ContentTypeId> {
  request: RequestFor<K>
  audience: Audience
  occasion: Occasion
  /** RNG for structural decisions (order of locations, puzzle kinds). Not affected by variants. */
  structure: Rng
  item(index: number): ItemPicker
  line(line: Line): string
  lineContext: LineContext
}

export function createContext<K extends ContentTypeId>(
  request: RequestFor<K>,
  variants: readonly number[],
  sender: string,
): GenContext<K> {
  const occasion = getOccasion(request.occasionId)
  const audience = buildAudience(request.children)
  const used = new Map<string, Set<unknown>>()
  // Last pick per key, so an exhausted pool never repeats the previous item right away.
  const last = new Map<string, unknown>()

  const usedFor = (key: string): Set<unknown> => {
    let set = used.get(key)
    if (!set) {
      set = new Set()
      used.set(key, set)
    }
    return set
  }

  const item = (index: number): ItemPicker => {
    const rng = createRng(hashSeed(request.seed, index, variants[index] ?? 0))
    const pick = <T>(pool: readonly T[], key: string): T => {
      const taken = usedFor(key)
      let fresh = pool.filter((entry) => !taken.has(entry))
      if (fresh.length === 0) {
        // Pool exhausted: start a new round so entries repeat evenly, never back to back.
        for (const entry of pool) taken.delete(entry)
        fresh = pool.filter((entry) => entry !== last.get(key))
      }
      const chosen = rng.pick(fresh.length > 0 ? fresh : pool)
      taken.add(chosen)
      last.set(key, chosen)
      return chosen
    }
    return {
      rng,
      pick,
      pickMany<T>(pool: readonly T[], key: string, count: number): T[] {
        const result: T[] = []
        const limit = Math.min(count, pool.length)
        while (result.length < limit) {
          const remaining = pool.filter((entry) => !result.includes(entry))
          const taken = usedFor(key)
          const fresh = remaining.filter((entry) => !taken.has(entry))
          const chosen = rng.pick(fresh.length > 0 ? fresh : remaining)
          taken.add(chosen)
          result.push(chosen)
        }
        return result
      },
      pickTiered<T>(pools: readonly (readonly T[])[], key: string): T {
        const taken = usedFor(key)
        const tier = pools.find((pool) => pool.some((entry) => !taken.has(entry)))
        return pick(tier ?? pools.flat(), key)
      },
      hasFresh<T>(pool: readonly T[], key: string): boolean {
        const taken = usedFor(key)
        return pool.some((entry) => !taken.has(entry))
      },
    }
  }

  const lineContext: LineContext = { v: audience.v, sender, vocab: occasion.vocabulary }

  return {
    request,
    audience,
    occasion,
    structure: createRng(hashSeed(request.seed, 'structure')),
    item,
    line: (line) => line(lineContext),
    lineContext,
  }
}

export function paragraphs(...parts: (string | undefined | false)[]): string {
  return parts.filter((part): part is string => Boolean(part && part.trim())).join('\n\n')
}

export function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1)
}

export function notesInstruction(notes: string): ParentInstruction | undefined {
  const trimmed = notes.trim()
  if (!trimmed) return undefined
  return {
    title: 'Sinu lisamärkused',
    steps: [
      `Märkisid: „${trimmed}“.`,
      'Mallimootor ei tõlgenda vaba teksti automaatselt. Lisa see detail eelvaates sobivasse kohta – iga teksti saab muuta.',
    ],
  }
}
