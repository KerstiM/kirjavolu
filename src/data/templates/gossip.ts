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
 * family that talks about each other – as in "Tipp-Topp eksis peaaegu kappi ära".
 */
export const HELPER_GOSSIP: ((c: GossipContext) => string)[] = [
  (c) =>
    `Eile öösel eksis ${c.helper} peaaegu kappi ära, sest ta ei leidnud ${c.childGenitive} sussi üles. Lõpuks aitasin tal selle leida.`,
  (c) =>
    `${c.helper} rääkis mulle, et ${c.child} oli täna eriti tubli. Ta oli nii uhke, et tema müts tõusis peast õhku!`,
  (c) =>
    `Meil oli eile öösel päkapikkude koosolek. ${c.helper} rääkis ${c.childElative} nii palju toredat, et koosolek venis hommikuni.`,
  (c) =>
    `Kas tead, mida ${c.helper} täna tegi? Ta proovis ${c.childGenitive} sussi sisse mahtuda ja jäi sinna peaaegu kinni!`,
  (c) => `${c.helper} saatis sulle tervitusi. Ta ütles, et ${c.child} on talle juba palju õpetanud.`,
  (c) =>
    `${c.helper} küsis minult nõu: mis võiks ${c.childAllative} kõige rohkem rõõmu teha? Ütlesin, et küsin sinult – sa tunned teda ju kõige paremini.`,
  (c) =>
    `${c.helper} ja mina jõime eile öösel töökojas kuuma kakaod. Ta rääkis, et ${c.child} naerab nii nakkavalt, et isegi põhjapõdrad hakkavad muigama.`,
  (c) =>
    `Täna hommikul leidsin oma mütsist ${c.helper} jäetud sedeli: „Ütle tervitusi! ${c.child} saadab ka.“ Päkapikud saadavad niimoodi salajasi sõnumeid.`,
  (c) =>
    `${c.helper} harjutab salaja üht trikki, millega ta tahab ${c.childAllative} muljet avaldada. Ära talle ütle, et ma sellest rääkisin!`,
]

/** When the sibling is a toddler: the tiniest helper. */
export const TODDLER_HELPER_GOSSIP: ((c: GossipContext) => string)[] = [
  (c) =>
    `${c.helper} on nii pisike, et magab ${c.childGenitive} sussis. Täna öösel norskas ta nii valjult, et kõik päkapikud naersid.`,
  (c) =>
    `${c.helper} õpetas ${c.childAllative} täna uue häälitsuse. Küsi, kas ${c.child} oskab seda ka sulle näidata!`,
  (c) =>
    `${c.helper} on nii väike, et ta ei ulatu veel töökoja laua peale. Täna tõstsime ta kordamööda üles, et ta saaks ka piparkooke kaunistada.`,
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
