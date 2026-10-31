import type { OccasionId } from '../../domain/models'
import type { Say } from './interests'
import { RIDDLES } from './riddles'

/**
 * Question today, answer tomorrow: today's letter asks, tomorrow's letter
 * starts with the answer – so it feels as if the helper really read the reply.
 */
export interface QuestionThread {
  id: string
  level: 'young' | 'older' | 'any'
  ask: (v: Say) => string
  answerNext: (v: Say) => string
  /** Solution shown on the parent sheet. */
  answer: string
  /** What the parent should prepare, e.g. "kaks jääkuubikut ja sool". */
  prep?: string
}

export const EXPERIMENTS: QuestionThread[] = [
  {
    id: 'ice-salt',
    level: 'any',
    ask: (v) =>
      `Teaduskatse: ${v('palu', 'paluge')} täiskasvanult kaks jääkuubikut. Puista ühele natuke soola, teisele mitte. Kumb sulab kiiremini? ${v('Kirjuta', 'Kirjutage')} oma tulemus sussi juurde.`,
    answerNext: () =>
      `Eilse katse vastus: soolaga jää sulab kiiremini! Just seepärast puistatakse talvel teedele soola.`,
    answer: 'Soolaga jääkuubik sulab kiiremini.',
    prep: 'kaks jääkuubikut ja natuke soola',
  },
  {
    id: 'mandarin',
    level: 'any',
    ask: (v) =>
      `Teaduskatse: ${v('pane', 'pange')} terve mandariin veenõusse. Kas see hõljub või vajub põhja? Siis ${v('koori', 'koorige')} teine mandariin ja ${v('proovi', 'proovige')} uuesti. Mis juhtus?`,
    answerNext: () =>
      `Eilse katse saladus: koorega mandariin hõljub, sest koores on pisikesed õhumullid – nagu päästevest. Kooritud mandariin vajub põhja.`,
    answer: 'Koorega mandariin hõljub, kooritud vajub põhja.',
    prep: 'kaks mandariini ja kauss vett',
  },
  {
    id: 'ice-float',
    level: 'young',
    ask: (v) =>
      `Teaduskatse: ${v('pane', 'pange')} jääkuubik klaasi vette. Kas see vajub põhja või jääb pinnale? ${v('Joonista', 'Joonistage')} mulle, mida ${v('nägid', 'nägite')}.`,
    answerNext: () => `Eilse katse vastus: jää jääb vee peale, sest see on veest kergem. Seepärast külmuvad järved pealt, mitte põhjast.`,
    answer: 'Jääkuubik hõljub vee peal.',
    prep: 'jääkuubik ja klaas vett',
  },
  {
    id: 'raisins',
    level: 'older',
    ask: (v) =>
      `Teaduskatse: ${v('viska', 'visake')} klaasi mullivette paar rosinat ja ${v('vaata', 'vaadake')} hoolega. Mis rosinatega juhtub?`,
    answerNext: () =>
      `Eilse katse saladus: mullid kleepuvad rosinate külge ja tõstavad need üles. Pinnal mullid lõhkevad ja rosin vajub jälle alla – nagu tantsiks.`,
    answer: 'Rosinad „tantsivad“: tõusevad mullidega üles ja vajuvad tagasi.',
    prep: 'klaas mullivett ja paar rosinat',
  },
]

export const QUESTIONS: QuestionThread[] = [
  {
    id: 'steps',
    level: 'any',
    ask: (v) => `Küsimus: mitu sammu on ${v('sinu', 'teie')} toast kööki? ${v('Loe', 'Lugege')} järele ja ${v('kirjuta', 'kirjutage')} vastus mulle.`,
    answerNext: () => `Aitäh vastuse eest! Päkapiku sammudega oleks see vähemalt kolm korda rohkem – meil on ju väga lühikesed jalad.`,
    answer: 'Õiget vastust pole – iga vastus on hea.',
  },
  {
    id: 'favourite-moment',
    level: 'any',
    ask: (v) => `Küsimus: mis oli ${v('sinu', 'teie')} tänase päeva kõige parem hetk? ${v('Kirjuta', 'Kirjutage')} või ${v('joonista', 'joonistage')} see mulle.`,
    answerNext: () => `Lugesin su vastust ja naeratasin terve hommiku. Head hetked on nagu pisikesed tähed – mida rohkem neid märkad, seda heledam on.`,
    answer: 'Õiget vastust pole – iga vastus on hea.',
  },
]

/** Riddles turned into threads: ask today, reveal the answer tomorrow. */
export function riddleThreads(occasion: OccasionId): QuestionThread[] {
  return RIDDLES.filter((riddle) => !riddle.occasions || riddle.occasions.includes(occasion)).map((riddle, i) => ({
    id: `riddle-${i}`,
    level: riddle.level,
    ask: (v) =>
      `Mõistatus: ${riddle.question} ${v('Kirjuta', 'Kirjutage')} vastus paberile ja ${v('pane', 'pange')} see sussi juurde – homme ütlen, kas ${v('arvasid', 'arvasite')} õigesti.`,
    answerNext: (v) =>
      `Eilse mõistatuse vastus oli: ${riddle.answer}. Kas ${v('arvasid', 'arvasite')} õigesti? Päkapikud vaidlesid selle üle pool ööd!`,
    answer: riddle.answer,
  }))
}
