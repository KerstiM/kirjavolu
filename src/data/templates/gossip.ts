/** Names for a remark about a sibling's helper: "Tipp-Topp" visiting "Jasper". */
export interface GossipContext {
  helper: string
  child: string
  childGenitive: string
  childElative: string
  childAllative: string
}

/**
 * Little everyday stories about the siblings' helpers, so the elves feel like one
 * family – as in "Tipp-Topp eksis peaaegu kappi ära". They are about the helpers'
 * own mishaps, never about which child was better, and always about yesterday:
 * the letter is read in the morning.
 */
export const HELPER_GOSSIP: ((c: GossipContext) => string)[] = [
  (c) =>
    `Eile öösel eksis ${c.helper} peaaegu kappi ära, sest ei leidnud ${c.childGenitive} sussi üles. Lõpuks aitasin tal selle leida.`,
  (c) =>
    `${c.helper} proovis eile ${c.childGenitive} sussi sisse mahtuda ja jäi sinna peaaegu kinni! Pidin teda mütsipidi välja tõmbama.`,
  (c) =>
    `Meil oli eile öösel päkapikkude koosolek. ${c.helper} jäi keset koosolekut magama ja norskas nii valjult, et kuuseokkad värisesid.`,
  (c) =>
    `${c.helper} lasi eile töökojas liugu otse jahukotti ja oli pärast valge nagu lumememm. Kõik päkapikud naersid pisarateni.`,
  (c) =>
    `${c.helper} küsis minult nõu: mis võiks ${c.childAllative} kõige rohkem rõõmu teha? Ütlesin, et küsin sinult – sa tunned teda ju kõige paremini. Kirjuta mulle oma mõte!`,
  (c) =>
    `Täna hommikul leidsin oma mütsist ${c.helper} jäetud sedeli: „Ütle ka minu poolt tere!“ Päkapikud saadavad niimoodi salajasi sõnumeid.`,
  (c) =>
    `${c.helper} harjutab salaja üht trikki, millega tahab ${c.childAllative} muljet avaldada. Ära talle ütle, et ma sellest rääkisin!`,
  (c) =>
    `${c.helper} ja mina jõime eile töökojas kuuma kakaod. ${c.helper} kallas pool tassi oma mütsi peale – nüüd lõhnab müts terve päeva šokolaadi järele.`,
]

/** When the sibling is a toddler: the tiniest helper. */
export const TODDLER_HELPER_GOSSIP: ((c: GossipContext) => string)[] = [
  (c) =>
    `${c.helper} on nii pisike, et magab ${c.childGenitive} sussis. Täna öösel norskas ta nii valjult, et kõik päkapikud naersid.`,
  (c) =>
    `${c.helper} õpetas eile ${c.childAllative} uue häälitsuse. Küsi, kas ${c.child} oskab seda ka sulle näidata!`,
  (c) =>
    `${c.helper} on nii väike, et ta ei ulatu veel töökoja laua peale. Eile tõstsime ta kordamööda üles, et ta saaks ka piparkooke kaunistada.`,
  (c) =>
    `${c.helper} rääkis, et ${c.child} kasvab nii kiiresti, et varsti on ta suurem kui kõik päkapikud kokku!`,
  (c) => `${c.helper} küsis, kas sa saaksid täna ${c.childAllative} ühe naeratuse kinkida. Pisikesed armastavad seda kõige rohkem.`,
]

export interface SiblingNames {
  /** "Ruben ja Jasper" */
  names: string
  /** "Rubenile ja Jasperile" */
  allative: string
  /** "Ruben, Jasper ja sina" */
  withYou: string
  plural: boolean
}

/** Lines on toddler cards about the big siblings. */
export const TODDLER_SIBLING_LINES: ((s: SiblingNames) => string)[] = [
  (s) => `Anna täna ${s.allative} kalli!`,
  (s) => `Kus on ${s.names}? Lehvita ${s.plural ? 'neile' : 'talle'}: tšau-tšau!`,
  (s) => `${s.names} ${s.plural ? 'saavad' : 'saab'} ka päkapikukirju. Näita ${s.plural ? 'neile' : 'talle'} oma kirja!`,
  (s) => `Mängi täna koos: ${s.withYou}. Kui lõbus!`,
  (s) => `Täna teeb ${s.names} sulle ühe naljaka näo. Tee sina ka!`,
  (s) => `Kes on sinu kõige suuremad sõbrad? ${s.names}! Plaksutame neile: plaks-plaks!`,
]
