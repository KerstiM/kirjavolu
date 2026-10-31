import type { ChallengeKind } from '../../domain/models'

export interface ChallengeContext {
  /** The child doing the challenge. */
  name: string
  /** "kuni 13. detsembrini". */
  until: string
  /** Parent's wording for a custom challenge, e.g. "magan oma voodis". */
  title: string
}

export interface ChallengeTemplate {
  label: string
  /** First day: invitation to the child. */
  start: (c: ChallengeContext) => string
  /** Last day: praise and a small reward. */
  end: (c: ChallengeContext) => string
  /** Same first day, to an older sibling: a secret request to support. */
  support: (c: ChallengeContext) => string
  /** Prepared for the last day. */
  endPrep: string
}

/**
 * Personal challenges in the spirit of the "tugevate hammaste nädalavahetus":
 * the child is invited, an older sibling helps in secret, and the end is celebrated.
 */
export const CHALLENGES: Record<ChallengeKind, ChallengeTemplate> = {
  'no-sweets': {
    label: 'Kommideta päevad',
    start: (c) =>
      `Päkapikud peavad igal detsembril „tugevate hammaste päevi“: ${c.until} ei sööda ühtegi kommi. Kas sa julged meiega kaasa teha? Kui jah, joonista igal õhtul sussi juurde üks täheke. Lõpus saad selle eest midagi erilist!`,
    end: (c) =>
      `Hurraa, ${c.name}! Tugevate hammaste päevad on läbi ja sa said hakkama! Kõik päkapikud plaksutasid töökojas käsi. Täna on sussis selle eest väike üllatus.`,
    support: (c) =>
      `Salajane palve: täna alustab ${c.name} kommideta päevi. Kui ta hakkab kommi ihaldama, mängi temaga midagi või paku talle mandariini. Kui tahad, võid ise ka kaasa teha!`,
    endPrep: 'väike üllatus kommideta päevade eest (nt kleeps või komm)',
  },
  tidy: {
    label: 'Korra hoidmine',
    start: (c) =>
      `Mul on sulle väljakutse: ${c.until} hoiame koos korda. Igal õhtul pane mänguasjad oma kohale ja joonista sussi juurde üks täheke. Lõpus ootab midagi erilist!`,
    end: () => `Kõik õhtud korras – sa oled tõeline korrameister! Täna on sussis selle eest väike üllatus.`,
    support: (c) =>
      `Salajane palve: ${c.name} hoiab ${c.until} oma tuba korras. Kui näed, et tal on palju koristada, aita natuke – aga nii, et keegi ei märka.`,
    endPrep: 'väike üllatus korra hoidmise eest',
  },
  custom: {
    label: 'Oma väljakutse',
    start: (c) =>
      `Sul on väljakutse: ${c.title || 'proovida midagi uut'}. Iga päev, kui see õnnestub, joonista sussi juurde üks täheke. Ma usun sinusse!`,
    end: (c) => `Väljakutse „${c.title || 'proovida midagi uut'}“ on läbi – ma olen sinu üle nii uhke! Täna on sussis selle eest väike üllatus.`,
    support: (c) =>
      `Salajane palve: ${c.name} teeb ${c.until} väljakutset „${c.title || 'proovida midagi uut'}“. Julgusta teda – päkapikud teevad sama!`,
    endPrep: 'väike üllatus väljakutse eest',
  },
}
