/** Names used in the oldest child's secret helper missions. */
export interface HelperContext {
  /** Younger siblings in allative: "Jasperile ja Britale". */
  siblingsAllative: string
  /** Younger siblings in comitative: "Jasperi ja Britaga". */
  siblingsComitative: string
  /** Younger siblings in nominative: "Jasper ja Brita". */
  siblings: string
  /** One younger sibling (genitive), for single missions: "Jasperi". */
  siblingGenitive: string
  sibling: string
  /** "päkapikkude" at Christmas, otherwise e.g. "jänkude". */
  helpersOf: string
  year: number
}

export interface HelperMission {
  id: string
  text: (c: HelperContext) => string
  prep?: (c: HelperContext) => string
}

/**
 * Secret helper arc for the oldest child: an invitation, the helpers' rule,
 * a few secret missions for the younger siblings and an official title at the end.
 */
export const HELPER_INVITE = (c: HelperContext) =>
  `Mul on sulle üks tähtis küsimus. ${c.helpersOf.charAt(0).toUpperCase()}${c.helpersOf.slice(1)} kõige vanemad teavad, et sinu peale saab loota. Kas sa oleksid sel aastal meie salajane abiline? Kui jah, kirjuta homseks sussi juurde üks sõna: JAH.`

export const HELPER_RULE = (c: HelperContext) =>
  `Suurepärane – ma teadsin, et võin sinu peale loota! Abiliste esimene reegel on salajasus: keegi ei tohi teada, et sa meid aitad, eriti mitte ${c.siblings}. Teine reegel: abiline teeb head ka siis, kui keegi ei vaata.`

export const HELPER_MISSIONS: HelperMission[] = [
  {
    id: 'slippers',
    text: (c) =>
      `Salamissioon: vaata täna õhtul salaja, et ${c.siblingGenitive} suss oleks aknalaual. Kui ei ole, aita tal see sinna panna – aga nii, et ta ei arva, miks sa küsid.`,
  },
  {
    id: 'cheer-up',
    text: (c) =>
      `Salamissioon: kui ${c.sibling} on täna kurb või pahur, aja ta naerma. Abilised teavad, et naer on parem kui ükski komm.`,
  },
  {
    id: 'drawing',
    text: (c) =>
      `Salamissioon: joonista täna väike pilt ja peida see õhtul salaja ${c.siblingGenitive} sussi juurde. Kui ta küsib, kust see tuli, ütle lihtsalt: „Ehk päkapikud?“`,
    prep: () => 'paber ja värvipliiatsid',
  },
  {
    id: 'helping-hands',
    text: (c) =>
      `Salamissioon: aita täna ${c.siblingsComitative} mänguasjad ära koristada – ilma et keegi sul seda paluks. Päkapikud märkavad kõike.`,
  },
  {
    id: 'kind-words',
    text: (c) =>
      `Salamissioon: ütle täna ${c.siblingsAllative} midagi head – näiteks mille poolest nad on toredad. Abilise sõnad on võlusõnad.`,
  },
]

export const HELPER_TITLE = (c: HelperContext) =>
  `Selle kirjaga nimetan su ametlikult ${c.helpersOf} abiliseks ${c.year}. Abilise kohustus kestab terve aasta: tee head ka siis, kui keegi ei vaata, ja aita nooremaid, kui nad seda vajavad.`
