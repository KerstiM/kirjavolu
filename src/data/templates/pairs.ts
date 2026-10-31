import type { OccasionId } from '../../domain/models'

/** Names and helpers for one paired day: an older child does something for a younger one. */
export interface PairContext {
  giver: string
  giverGenitive: string
  receiver: string
  receiverGenitive: string
  receiverAllative: string
  receiverComitative: string
  /** Name of the receiver's own helper, e.g. "Pisi-Pätsi". */
  receiverHelper: string
}

/**
 * Paired task templates. Both letters on the same day are written from the same
 * template, so they always match: "loe Britale ette" ↔ "Täna loeb Jasper sulle".
 * Letters are read in the morning, so anything the giver leaves by a slipper
 * is found by the receiver the next morning, never the same day.
 */
export interface PairTemplate {
  id: string
  giver: (c: PairContext) => string
  /** Receiver who reads on their own. Omit when the task only suits toddlers. */
  receiverReader?: (c: PairContext) => string
  /** Toddler receiver: short, read aloud by an adult. Omit when unsuitable. */
  receiverToddler?: (c: PairContext) => string
  occasions?: OccasionId[]
  /** What the parent prepares for the giver, e.g. a book to read aloud. */
  prep?: (c: PairContext) => string
}

export const PAIR_TEMPLATES: PairTemplate[] = [
  {
    id: 'read',
    giver: (c) =>
      `Täna on sul tähtis ülesanne: loe ${c.receiverAllative} ette üks raamat või vaadake koos pilte. ${c.receiverHelper} istub sel ajal riiuli peal ja kuulab ka.`,
    receiverReader: (c) => `Täna loeb ${c.giver} sulle ühe loo ette. ${c.receiverHelper} tuleb ka kuulama!`,
    receiverToddler: (c) => `Täna loeb ${c.giver} sulle raamatut. ${c.receiverHelper} kuulab ka. Kuula hästi!`,
    prep: (c) => `raamat, mida ${c.receiverAllative} ette lugeda`,
  },
  {
    id: 'teach',
    giver: (c) =>
      `Päkapikud on kuulnud, et sa oskad hästi õpetada. Õpeta täna ${c.receiverAllative} üks uus sõna, salm või mäng.`,
    receiverReader: (c) => `${c.giver} õpetab sulle täna ühe uue mängu. Ole tähelepanelik õpilane!`,
    receiverToddler: (c) => `${c.giver} õpetab sulle täna midagi uut. Proovi järele teha!`,
  },
  {
    id: 'play',
    giver: (c) =>
      `Tee täna ${c.receiverComitative} midagi toredat: mängige koos või ajage teineteist naerma. ${c.receiverHelper} rääkis mulle, et ${c.receiver} ootab seda väga.`,
    receiverReader: (c) => `Täna on ${c.giverGenitive} kord sinuga mängida. Vali sina, mida te mängite!`,
    receiverToddler: (c) => `${c.giver} mängib täna sinuga. ${c.receiverHelper} vaatab ka!`,
  },
  {
    id: 'drawing',
    giver: (c) =>
      `Joonista täna ${c.receiverAllative} pilt ja anna see talle üle. Päkapikud armastavad kingitusi, mis on tehtud oma kätega.`,
    receiverReader: (c) => `${c.giver} teeb sulle täna ühe üllatuse. Ära piilu enne õhtut!`,
    receiverToddler: (c) => `${c.giver} joonistab sulle täna pildi. Mis seal peal on? Näita näpuga!`,
    prep: () => 'paber ja värvipliiatsid',
  },
  {
    id: 'secret-letter',
    giver: (c) =>
      `${c.receiverHelper} on homme nii hõivatud, et ei jõua ${c.receiverAllative} kirja kirjutada. Kirjuta sina täna õhtul üks lühike kiri ja allkirjasta see „${c.receiverHelper}“. Enne magamaminekut pane see salaja ${c.receiverGenitive} sussi juurde, et ${c.receiver} leiaks selle homme hommikul – keegi ei tohi sind näha!`,
    receiverReader: () => `Homme on töökojas nii palju tegemist, et ma ei pruugi jõuda pikalt kirjutada. Aga vaata homme hommikul hoolega oma sussi juurde – võib-olla on seal üks kiri kelleltki teiselt?`,
    occasions: ['christmas'],
    prep: () => 'paber ja pliiats salajase kirja jaoks (laps paneb selle õhtul sussi juurde)',
  },
  {
    id: 'slipper',
    giver: (c) =>
      `Täna on abilise ülesanne: vaata õhtul, et ka ${c.receiverGenitive} suss oleks aknalaual. ${c.receiverHelper} ei taha seda kuidagi maha magada!`,
    receiverReader: (c) => `Kuulsin, et ${c.giver} aitab täna päkapikke. Kui ta küsib su sussi kohta, siis tea – see on salajane missioon.`,
    receiverToddler: (c) => `${c.giver} aitab täna su sussi aknale panna. Aitäh, ${c.giver}!`,
    occasions: ['christmas'],
  },
  {
    id: 'kindness',
    giver: (c) =>
      `Täna on heategude päev. Tee ${c.receiverAllative} üks salajane heategu: korista tema mänguasjad ära või jäta talle üllatus. Ära ütle, et see olid sina!`,
    receiverReader: () => `Täna võib sinuga juhtuda midagi toredat. Vaata hoolikalt ringi – keegi teeb sulle salaja head.`,
    receiverToddler: (c) => `Täna teeb keegi sulle midagi head. Kas see oli ${c.giver}? Kalli talle!`,
  },
]
