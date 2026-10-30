/** Small deterministic pseudo-random generator (mulberry32). */
export interface Rng {
  next(): number
  int(maxExclusive: number): number
  pick<T>(items: readonly T[]): T
  shuffle<T>(items: readonly T[]): T[]
}

export function hashSeed(...parts: (string | number)[]): number {
  let hash = 2166136261
  for (const char of parts.join('|')) {
    hash ^= char.codePointAt(0) ?? 0
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function createRng(seed: number): Rng {
  let state = seed >>> 0 || 1
  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const int = (maxExclusive: number): number => Math.floor(next() * maxExclusive)
  return {
    next,
    int,
    pick<T>(items: readonly T[]): T {
      if (items.length === 0) throw new Error('Cannot pick from an empty list')
      return items[int(items.length)] as T
    },
    shuffle<T>(items: readonly T[]): T[] {
      const copy = [...items]
      for (let i = copy.length - 1; i > 0; i--) {
        const j = int(i + 1)
        const tmp = copy[i] as T
        copy[i] = copy[j] as T
        copy[j] = tmp
      }
      return copy
    },
  }
}

/**
 * Picks items from a pool without repeating until the pool is exhausted.
 * Used to keep texts unique within one generated set.
 */
export class UniquePicker<T> {
  private remaining: T[]

  constructor(
    private readonly pool: readonly T[],
    private readonly rng: Rng,
  ) {
    this.remaining = rng.shuffle(pool)
  }

  next(avoid?: (item: T) => boolean): T {
    if (this.remaining.length === 0) this.remaining = this.rng.shuffle(this.pool)
    const index = avoid ? this.remaining.findIndex((item) => !avoid(item)) : 0
    const [item] = this.remaining.splice(index >= 0 ? index : 0, 1)
    return item as T
  }
}
