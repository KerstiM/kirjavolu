import type { GeneratedItem } from '../../domain/models'

/**
 * Letters the parent edited by hand, carried over into letters written again with new
 * choices: an edited letter takes the place of the new letter in the same spot (the same
 * child's n-th letter), keeping only the new label and date. Edits that have no such spot
 * any more – fewer letters, another child – are `lost`, so the parent can be asked first.
 */
export function carryEdits(
  previous: GeneratedItem[],
  next: GeneratedItem[],
): { items: GeneratedItem[]; kept: number; lost: GeneratedItem[] } {
  const spot = (items: GeneratedItem[]) => {
    const seen = new Map<string, number>()
    return items.map((item) => {
      const n = seen.get(item.childId ?? '') ?? 0
      seen.set(item.childId ?? '', n + 1)
      return `${item.childId ?? ''}#${n}`
    })
  }
  const edited = new Map<string, GeneratedItem>()
  spot(previous).forEach((key, k) => {
    const item = previous[k] as GeneratedItem
    if (item.edited) edited.set(key, item)
  })
  let kept = 0
  const items = spot(next).map((key, k) => {
    const fresh = next[k] as GeneratedItem
    const own = edited.get(key)
    if (!own) return fresh
    edited.delete(key)
    kept++
    return { ...own, id: fresh.id, label: fresh.label, date: fresh.date, childId: fresh.childId, forChild: fresh.forChild }
  })
  return { items, kept, lost: [...edited.values()] }
}
