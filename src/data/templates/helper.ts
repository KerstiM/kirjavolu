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
  /** Paired sibling task that asks nearly the same; the mission is skipped when that pair is planned. */
  similarPair?: string
  text: (c: HelperContext) => string
  prep?: (c: HelperContext) => string
}

/**
 * Secret helper arc for the oldest child: one invitation that already explains the
 * rules, a few secret missions for the younger siblings and a title at the end.
 * Nothing assumes the child answered or did a mission: saying yes means simply
 * keeping the secret, and every mission is an offer.
 */
export const HELPER_INVITE = (c: HelperContext) =>
  [
    `Mul on sulle küsimus, mida me ei küsi igaühelt. Igal aastal valime ühe salajase abilise – kellegi, kes aitab maja sees asjades, milleks meie käed on liiga pisikesed. Sel aastal mõtlesime sinule.`,
    `Reegleid on kaks. Esiteks: see on saladus – keegi ei tohi teada, eriti mitte ${c.siblings}. Teiseks: head tehakse ka siis, kui keegi ei vaata.`,
    'Kui oled nõus, ei pea sa midagi vastama – hoia lihtsalt saladust. Mõnes järgmises kirjas leiad salamissiooni. Kui sul on tahtmist, teed selle ära; kui ei ole, on ka hästi.',
  ].join('\n\n')

/** In order of preference; the slipper check comes last because a paired task often asks the same. */
export const HELPER_MISSIONS: HelperMission[] = [
  {
    id: 'cheer-up',
    similarPair: 'play',
    text: (c) =>
      `Salamissioon: kui ${c.sibling} on täna pahur või kurb, proovi teda naerma ajada. Abilised teavad, et naer aitab paremini kui ükski komm.`,
  },
  {
    id: 'drawing',
    similarPair: 'drawing',
    text: (c) =>
      `Salamissioon: joonista väike pilt ja peida see õhtul salaja ${c.siblingGenitive} sussi juurde. Kui ta homme küsib, kust see tuli, ütle lihtsalt: „Ehk päkapikud?“`,
    prep: () => 'paber ja värvipliiatsid',
  },
  {
    id: 'helping-hands',
    similarPair: 'kindness',
    text: (c) =>
      `Salamissioon: aita täna ${c.siblingsComitative} mänguasjad ära koristada – enne, kui keegi seda palub.`,
  },
  {
    id: 'kind-words',
    text: (c) =>
      `Salamissioon: ütle täna ${c.siblingsAllative} midagi head – päris ausat ja päris head.`,
  },
  {
    id: 'slippers',
    similarPair: 'slipper',
    text: (c) =>
      `Salamissioon: vaata täna õhtul salaja, kas ${c.siblingGenitive} suss on aknalaual. Kui ei ole, aita tal see sinna panna – nii, et ta ei arva, miks sa küsid.`,
  },
]

export const HELPER_TITLE = (c: HelperContext) =>
  `Selle kirjaga nimetan su ametlikult ${c.helpersOf} abiliseks ${c.year}. Tiitel kehtib terve aasta – kui majas on kunagi vaja salajast abi, tead nüüd, kuidas seda teha.`
