import type { AgeBand, ChildProfile, ParentInstruction, RequestFor } from '../models'
import { getOccasion } from '../occasions/occasions'
import { nameCase } from '../text/estonian'
import type { Say } from '../../data/templates/interests'
import { findLocation, HUNT_LOCATIONS, type HuntLocation } from '../../data/templates/locations'
import { adjustBand, ageBand } from './audience'
import { createContext, notesInstruction, paragraphs, type DraftItem, type TypeResult } from './context'
import { alphabetKey, encodeNumbers, reverseWord } from './puzzleTools'

/** A hiding place: either a known location with written clues or a parent-provided custom one. */
export interface HidingPlace {
  name: string
  known?: HuntLocation
}

const MIN_CLUES = 3
const MAX_CLUES = 12

export function resolveHidingPlaces(
  requested: string[],
  setting: 'indoor' | 'outdoor',
  count: number,
  shuffle: <T>(items: readonly T[]) => T[],
): HidingPlace[] {
  const places: HidingPlace[] = []
  const seen = new Set<string>()
  for (const raw of requested) {
    const name = raw.trim()
    if (!name) continue
    const known = findLocation(name)
    const key = known?.id ?? name.toLocaleLowerCase('et-EE')
    if (seen.has(key)) continue
    seen.add(key)
    places.push(known ? { name: known.name, known } : { name })
  }
  const defaults = shuffle(HUNT_LOCATIONS.filter((location) => location.setting === setting))
  for (const location of defaults) {
    if (places.length >= count) break
    if (seen.has(location.id)) continue
    seen.add(location.id)
    places.push({ name: location.name, known: location })
  }
  return shuffle(places).slice(0, count)
}

function clueFor(place: HidingPlace, band: AgeBand, v: Say, pick: <T>(pool: readonly T[]) => T): string {
  const known = place.known
  if (band === 'toddler') {
    return `Täiskasvanu loeb: „Kus on ${known ? known.toddler : place.name}? Lähme otsima!“`
  }
  if (known) {
    const clue = pick(band === 'older' ? known.older : known.young)(v)
    const word = known.name.split(' ')[0] ?? known.name
    const singleWord = !known.name.includes(' ')
    return band === 'older' && singleWord
      ? `${clue}\n\nKontrollsõna on kirjutatud tagurpidi: ${reverseWord(word)}`
      : clue
  }
  const letters = place.name.replace(/\s+/g, '')
  if (band === 'older') {
    return `Lahenda numbrikood ja ${v('leiad', 'leiate')} järgmise peidukoha: ${encodeNumbers(place.name)}\n\nVõti: ${alphabetKey()}`
  }
  const blanks = place.name
    .split(/\s+/)
    .map((word) => Array.from(word, () => '_').join(' '))
    .join('   ')
  return `Järgmine peidukoht algab tähega „${letters.charAt(0).toLocaleUpperCase('et-EE')}“ ja selles on ${letters.length} tähte:\n\n${blanks}`
}

const TRANSITIONS: ((v: Say) => string)[] = [
  (v) => `Tubli! ${v('Leidsid', 'Leidsite')} vihje üles. Järgmine mõistatus:`,
  () => 'Hästi tehtud! Nüüd edasi:',
  (v) => `Õige! ${v('Oled', 'Olete')} aardele juba lähemal.`,
  (v) => `Suurepärane! ${v('Nuputa', 'Nuputage')} edasi:`,
  () => 'Jälg on soe! Uus vihje:',
  (v) => `Bravo! ${v('Sinu', 'Teie')} detektiivisilm töötab hästi.`,
  () => 'Väga nutikas! Järgmine peidukoht:',
  (v) => `Nii see läheb! ${v('Vaata', 'Vaadake')} hoolikalt:`,
]

interface Chain {
  child?: ChildProfile
  places: HidingPlace[]
}

export function generateTreasureHunt(
  request: RequestFor<'treasure-hunt'>,
  variants: readonly number[],
): TypeResult {
  const { options, general } = request
  const sender = getOccasion(request.occasionId).vocabulary.sender
  const ctx = createContext(request, variants, sender)
  const { audience, occasion } = ctx
  const prize = options.prize.trim() || occasion.vocabulary.prize
  const count = Math.min(Math.max(options.clueCount, MIN_CLUES), MAX_CLUES)
  const separate = audience.plural && !options.cooperative

  const chains: Chain[] = separate
    ? audience.children.map((child) => ({
        child,
        places: resolveHidingPlaces(options.locations, options.setting, count, ctx.structure.shuffle),
      }))
    : [{ places: resolveHidingPlaces(options.locations, options.setting, count, ctx.structure.shuffle) }]

  const items: DraftItem[] = []
  for (const chain of chains) {
    const v: Say = chain.child ? (s) => s : audience.v
    chain.places.forEach((place, k) => {
      const index = items.length
      const p = ctx.item(index)
      const turnChild = chain.child ?? (audience.plural ? audience.children[k % audience.children.length] : audience.children[0])
      const band = turnChild ? adjustBand(ageBand(turnChild), general.difficulty) : audience.band
      const clue = clueFor(place, band, v, (pool) => p.pick(pool, `clue-${place.name}`))
      const isFirst = k === 0
      const isLast = k === chain.places.length - 1
      const intro = isFirst
        ? paragraphs(
            p.pick(occasion.vocabulary.moods, 'hunt-mood'),
            `${sender} on peitnud ${v('sinu', 'teie')} jaoks üllatuse. Selle leidmiseks ${v('pead', 'peate')} lahendama ${chain.places.length} vihjet. Esimene vihje on siin:`,
          )
        : p.pick(TRANSITIONS, 'transition')(v)
      const outro = isLast
        ? `See on viimane vihje! Kui ${v('leiad', 'leiate')} selle koha, ootab seal aare.`
        : undefined
      const turn =
        !chain.child && audience.plural && turnChild && band !== 'toddler'
          ? `${turnChild.name} loeb selle vihje ette.`
          : undefined
      const previous = chain.places[k - 1]
      items.push({
        kind: 'clue',
        label: `Vihje ${k + 1}/${chain.places.length}${chain.child ? ` · ${chain.child.name}` : ''}`,
        heading: isFirst ? 'Aardejaht algab!' : isLast ? 'Viimane vihje' : `Vihje nr ${k + 1}`,
        body: paragraphs(intro, turn, clue, outro),
        forChild: chain.child?.name ?? (audience.plural ? turnChild?.name : undefined),
        answer: place.name,
        parentNote: previous ? `Peida see kaart: ${previous.name}` : 'Anna see kaart lapsele kätte.',
      })
    })
  }

  return {
    title: separate ? 'Aardejahid' : options.cooperative && audience.plural ? 'Ühine aardejaht' : 'Aardejaht',
    subtitle: `${occasion.name} · ${audience.names} · ${options.setting === 'indoor' ? 'toas' : 'õues'}`,
    items,
    instructions: huntInstructions(request, chains, prize),
  }
}

function huntInstructions(request: RequestFor<'treasure-hunt'>, chains: Chain[], prize: string): ParentInstruction[] {
  const result: ParentInstruction[] = chains.map((chain) => ({
    title: chain.child ? `Peitmise plaan: ${chain.child.name}` : 'Peitmise plaan',
    steps: [
      'Vihje 1: anna lapsele kätte.',
      ...chain.places.slice(0, -1).map((place, k) => `Vihje ${k + 2}: peida kohta „${place.name}“.`),
      `Aare (${prize}): peida kohta „${chain.places[chain.places.length - 1]?.name ?? ''}“.`,
    ],
  }))
  const tips = [
    'Prindi kaardid, lõika need lahti ja peida enne mängu algust. Kontrolli, et iga kaart viiks õigesse kohta.',
    'Kui laps jääb kinni, anna vihjeks üks sõna või näita suunda – eesmärk on rõõm, mitte võistlus.',
  ]
  if (request.options.setting === 'outdoor') {
    tips.push('Õues vali peidukohad, mis on nähtavad ja ohutud. Vihmase ilmaga pane kaardid kilekotti.')
  }
  const toddlers = request.children.filter((child) => ageBand(child) === 'toddler')
  if (toddlers.length > 0) {
    tips.push(
      `${toddlers.map((child) => nameCase(child, 'genitive')).join(' ja ')} vihjed loeb ette täiskasvanu. Lase lapsel näidata suunda ja aaret ise avada.`,
    )
  }
  if (request.options.cooperative && request.children.length > 1) {
    tips.push('Lapsed loevad vihjeid kordamööda. Vanem laps võib nooremat aidata, kuid ei ütle vastust ette.')
  }
  result.push({ title: 'Nipid', steps: tips })
  const notes = notesInstruction(request.general.notes)
  if (notes) result.push(notes)
  return result
}
