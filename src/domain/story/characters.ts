import type { Band, Cast } from './types'

/**
 * Narrator voices. A child's helper speaks in the voice of the child's age band:
 * the scenario library has one explicitly written text per band, so the voice is
 * part of the writing, not a filter applied afterwards.
 */
export interface Voice {
  band: Band
  label: string
  /** Who this helper is; shown in docs and used when writing new scenarios. */
  personality: string
  /** Sign-offs above the helper's name. Picked per letter, never twice in a row. */
  signOffs: string[]
}

export const VOICES: Record<Band, Voice> = {
  older: {
    band: 'older',
    label: 'Vana mõtlik päkapikk (nt Kõpsu-Mõpsu Kuubikuvõlur)',
    personality:
      'Töökoja vanim. Armastab mehhanisme ja mõistatusi, on veidi hajameelne, huumor on kuiv ja vaikne. Kirjutab pikemalt ja räägib lapsega kui võrdsega.',
    signOffs: [
      'Sinu',
      'Töökoja nurgast',
      'Mõtlikult',
      'Sinu vana sõber',
      'Nuputades',
      'Tervitustega põhjast',
    ],
  },
  young: {
    band: 'young',
    label: 'Noor elav päkapikk (nt Tipp-Topp Riisiterake)',
    personality:
      'Uudishimulik ja energiline, armastab kokkamist ja katseid, satub kahjututesse sekeldustesse. Lühikesed laused, soe ja mänguline huumor.',
    signOffs: [
      'Sinu',
      'Kiirelt-kiirelt',
      'Jahusena',
      'Hüpates',
      'Sinu sõber',
      'Tervitustega köögist',
    ],
  },
  toddler: {
    band: 'toddler',
    label: 'Kõige pisem päkapikk (nt Pisi-Pätsi Roosaninake)',
    personality:
      'Pisike, hell ja mänguline. Tunneb rõõmu igapäevastest avastustest, kasutab häälitsusi ja kordusi. Kirjad on lühikesed ja mõeldud ette lugemiseks.',
    signOffs: ['Kalli-kalli', 'Musi', 'Sinu pisike sõber', 'Kallistusega'],
  },
}

/** Workshop elves who stand in for siblings' helpers when the child has no such sibling. */
export const STAND_IN_CAST: Cast = {
  older: 'Kribu-Krabu',
  young: 'Nupsik',
  tiny: 'Tillu',
}
