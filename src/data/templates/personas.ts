import type { ChildProfile, ElfPersona, OccasionId } from '../../domain/models'
import { findInterestHooks } from './interests'

/** Playful reduplicated names in the spirit of Estonian elf names. */
export const PERSONA_NAMES = [
  'Kõpsu-Mõpsu',
  'Tipp-Topp',
  'Pisi-Pätsi',
  'Nipsu-Näpsu',
  'Sutsu-Putsu',
  'Tuti-Muti',
  'Siuts-Säuts',
  'Krõbin-Kräbin',
]

/** Title from the child's strongest interest: Rubik's cube → "Kuubikuvõlur". */
const HOOK_TITLES: Record<string, string> = {
  rubik: 'Kuubikuvõlur',
  comics: 'Koomiksimeister',
  lego: 'Klotsimeister',
  ball: 'Pallikunstnik',
  dinosaurs: 'Dinoteadlane',
  space: 'Tähetark',
  art: 'Värvivõlur',
  music: 'Kellukesemängija',
  animals: 'Loomasõber',
  books: 'Raamatutark',
  codes: 'Salakoodimeister',
  water: 'Lainetaja',
  vehicles: 'Rongijuht',
  nature: 'Metsatark',
}

export function suggestTitle(child: ChildProfile, toddler: boolean): string {
  if (child.foods.some((food) => /riisipu/i.test(food))) return 'Riisiterake'
  if (toddler) {
    return [...child.favorites, ...child.interests].some((text) => /peppa|põrsa/i.test(text)) ? 'Roosaninake' : 'Naerunupp'
  }
  const hook = findInterestHooks([...child.interests, ...child.favorites])[0]
  return (hook && HOOK_TITLES[hook.id]) ?? 'Abimeister'
}

/**
 * Origin sentence: the oldest child gets the oldest and wisest helper, the
 * youngest the tiniest one – as in a family of elves.
 */
export function suggestOrigin(rank: 'oldest' | 'middle' | 'youngest-toddler', occasion: OccasionId): string {
  const christmas = occasion === 'christmas'
  if (rank === 'oldest') return christmas ? 'Jõuluvana töökoja kõige vanem päkapikk' : 'kõige vanem ja targem abiline'
  if (rank === 'youngest-toddler') return christmas ? 'kõige pisem päkapikk, kes mahub sussi sisse' : 'kõige pisem abiline'
  return christmas ? 'noor ja rõõmus päkapikk' : 'noor ja rõõmus abiline'
}

export function suggestPersonas(
  children: ChildProfile[],
  occasion: OccasionId,
  isToddler: (child: ChildProfile) => boolean,
): Record<string, ElfPersona> {
  const byAge = [...children].sort((a, b) => b.age - a.age)
  const result: Record<string, ElfPersona> = {}
  byAge.forEach((child, rank) => {
    const toddler = isToddler(child)
    result[child.id] = {
      name: PERSONA_NAMES[rank % PERSONA_NAMES.length] as string,
      title: suggestTitle(child, toddler),
      origin: suggestOrigin(rank === 0 ? 'oldest' : toddler ? 'youngest-toddler' : 'middle', occasion),
    }
  })
  return result
}
