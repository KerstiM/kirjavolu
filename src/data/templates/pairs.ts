import type { OccasionId } from '../../domain/models'

/** Names for one paired day. Names stay in the nominative, so no guessed case form is needed. */
export interface PairContext {
  giver: string
  receiver: string
  /** The younger one gets the toddler texts: a game with sounds and pointing, no reading. */
  receiverLittle: boolean
  /** Name of the receiver's own helper, e.g. "Pisi-Pätsi". */
  receiverHelper: string
}

/**
 * Paired days: both siblings' letters on the same day invite them to do one thing together,
 * from the same template, so the two letters always match. Neither letter promises anything
 * for the other child ("Õde joonistab sulle pildi"), nor makes the older one the elves'
 * helper; if nothing comes of it, no later letter depends on it.
 */
export interface PairTemplate {
  id: string
  /** In the older child's letter. */
  giver: (c: PairContext) => string
  /** Younger child who reads, or is read to, the reader texts. Omit when it suits toddlers only. */
  receiverReader?: (c: PairContext) => string
  /** Toddler: read aloud by an adult; pointing, a sound or a movement with the adult. */
  receiverToddler?: (c: PairContext) => string
  occasions?: OccasionId[]
  /** What the parent prepares, e.g. a picture book. */
  prep?: (c: PairContext) => string
}

export const PAIR_TEMPLATES: PairTemplate[] = [
  {
    id: 'read',
    giver: (c) =>
      c.receiverLittle
        ? `Sina ja ${c.receiver} võite täna koos ühe pildiraamatu läbi vaadata: sina räägid, mis pildil toimub, ja ${c.receiver} näitab näpuga.`
        : `Mul on teile ettepanek: sina ja ${c.receiver} võite täna koos ühe raamatu läbi vaadata ja arutada, kes pildil kõige naljakam on.`,
    receiverReader: (c) =>
      `Mul on teile ettepanek: sina ja ${c.giver} võite täna koos ühe raamatu läbi vaadata ja arutada, kes pildil kõige naljakam on.`,
    receiverToddler: (c) => `Sina ja ${c.giver} võite täna koos pilte vaadata. Näita näpuga!`,
    prep: () => 'pildiraamat, mida koos vaadata',
  },
  {
    id: 'play',
    giver: (c) =>
      c.receiverLittle
        ? `Sina ja ${c.receiver} võite täna kukkumängu mängida: nägu käte taha ja siis – kukku! Pisikesed naeravad selle peale alati.`
        : `Päkapikud mängivad talvel kõige meelsamini mängu „Kes ma olen?“: üks näitab ilma sõnadeta mõnda looma ja teine arvab. Sina ja ${c.receiver} võite seda täna proovida.`,
    receiverReader: (c) =>
      `Päkapikud mängivad talvel kõige meelsamini mängu „Kes ma olen?“: üks näitab ilma sõnadeta mõnda looma ja teine arvab. Sina ja ${c.giver} võite seda täna proovida.`,
    receiverToddler: (c) => `Sina ja ${c.giver} võite täna kukkumängu mängida: kukku!`,
  },
  {
    id: 'drawing',
    giver: (c) =>
      c.receiverLittle
        ? `Sina ja ${c.receiver} võite täna koos ühe pildi teha: sina joonistad ja ${c.receiver} kritseldab kaasa.`
        : `Sina ja ${c.receiver} võite täna koos ühe pildi joonistada: üks joonistab päkapiku, teine tema maja.`,
    receiverReader: (c) =>
      `Sina ja ${c.giver} võite täna koos ühe pildi joonistada: üks joonistab päkapiku, teine tema maja.`,
    receiverToddler: (c) => `Sina ja ${c.giver} võite täna koos ühe pildi teha.`,
    prep: () => 'paber ja värvipliiatsid',
  },
  {
    id: 'dance',
    giver: (c) =>
      c.receiverLittle
        ? `Sina ja ${c.receiver} võite täna päkapikutantsu proovida: kõiguge ja plaksutage. Pisem võib tantsida kellegi süles.`
        : `Töökojas tantsitakse õhtuti päkapikutantsu: kükk, keerutus ja kolm plaksu. Sina ja ${c.receiver} võite selle täna koos järele proovida.`,
    receiverReader: (c) =>
      `Töökojas tantsitakse õhtuti päkapikutantsu: kükk, keerutus ja kolm plaksu. Sina ja ${c.giver} võite selle täna koos järele proovida.`,
    receiverToddler: (c) => `Sina ja ${c.giver} võite täna koos tantsida: plaks-plaks!`,
  },
]
