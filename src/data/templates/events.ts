import type { EventKind } from '../../domain/models'
import type { Say } from './interests'

export interface EventContext {
  v: Say
  /** Parent's detail, e.g. "vanaema juurde Valka"; may be empty. */
  title: string
  /** Name of the helper writing the letter. */
  helper: string
  /** Siblings taking part, allative: "Jasperile ja Britale"; empty when alone. */
  othersAllative: string
}

export type EventText = (c: EventContext) => string

export interface EventTemplate {
  label: string
  /** Placeholder for the detail field, showing the expected word form. */
  placeholder: string
  older: EventText
  young: EventText
  toddler: EventText
}

/**
 * One paragraph per event and age band. It replaces the day's task, so the
 * letter of that day is about the family's real plans.
 */
export const EVENT_TEMPLATES: Record<EventKind, EventTemplate> = {
  forest: {
    label: 'Metsaretk',
    placeholder: 'nt Kõrvemaale (kuhu?)',
    older: (c) =>
      `Kuulsin, et ${c.v('teie pere läheb', 'te lähete')} täna metsa${c.title ? ` – ${c.title}` : ''}. Mets on päkapikkude suvekodu, seal on palju vaadata. ${c.v('Sinu', 'Teie')} ülesanne on olla jäljedetektiiv: ${c.v('otsi', 'otsige')} loomajälgi ja ${c.v('proovi', 'proovige')} ära arvata, kelle omad need on – jänes, rebane, orav või põder?${c.othersAllative ? ` Näita jälgi ka ${c.othersAllative}.` : ''}`,
    young: (c) =>
      `Kas ${c.v('teadsid', 'teadsite')}, et päkapikud elavad suviti metsas? Kui te täna metsa lähete, ${c.v('vaata', 'vaadake')} hoolega ringi. ${c.v('Too', 'Tooge')} mulle metsast üks käbi ja ${c.v('pane', 'pange')} see sussi kõrvale – mul on tarvis just ühte käbi, et oma tuba kaunistada.`,
    toddler: () => `Täna lähme metsa! Puud on suured ja kõrged. Kuula: kes seal laulab? Tsiu-tsiu!`,
  },
  ski: {
    label: 'Suusatamine',
    placeholder: 'nt Otepääle (kuhu?)',
    older: (c) =>
      `Kuulsin, et ${c.v('teie pere läheb', 'te lähete')} täna suusatama${c.title ? ` – ${c.title}` : ''}. Viimati, kui mina suusatasin, jäin mäe all hange kinni nii, et ainult müts paistis välja.${c.othersAllative ? ` Kui lähete, ${c.v('aita', 'aidake')} ${c.othersAllative} suusad alla panna ja ${c.v('näita', 'näidake')}, kuidas mäest üles käiakse.` : ''}`,
    young: (c) =>
      `Täna on suusapäev! Kui ${c.v('sõidad', 'sõidate')} mäest alla, ${c.v('hõiska', 'hõisake')} kõvasti „${c.helper}!“ – ma kuulen seda kindlasti.`,
    toddler: () => `Täna läheme lume peale. Lumi teeb krõps-krõps! Vuhh – mäest alla!`,
  },
  visit: {
    label: 'Külaskäik',
    placeholder: 'nt vanaema juurde Valka (kuhu?)',
    older: (c) =>
      `Kuulsin, et täna sõidate külla${c.title ? ` – ${c.title}` : ''}. Ma tulen salaja kaasa: ronin ${c.v('sinu', 'teie')} kingikotti! Kui olete kohal, ${c.v('küsi', 'küsige')} vanematelt inimestelt, millised olid jõulud siis, kui nemad olid ${c.v('sinuvanused', 'teievanused')}, ja ${c.v('kirjuta', 'kirjutage')} üks huvitav detail üles.`,
    young: (c) =>
      `Kuulsin, et täna lähete külla${c.title ? ` – ${c.title}` : ''}. Ma tulen salaja kaasa: ronin ${c.v('sinu', 'teie')} taskusse! ${c.v('Näita', 'Näidake')} seal kellelegi, mida ${c.v('sa oskad', 'te oskate')}, ja ${c.v('räägi', 'rääkige')} mulle õhtul, kuidas läks.`,
    toddler: () => `Täna läheme külla. Kopp-kopp! Kes seal on? Ütle kõigile tere!`,
  },
  performance: {
    label: 'Esinemine',
    placeholder: 'nt ettelugemispäev (mis?)',
    older: (c) =>
      `Täna on ${c.v('sul', 'teil')} ${c.title || 'esinemine'}. Kas ${c.v('tead', 'teate')}, mis on päris julgus? See ei ole see, kui üldse ei karda. Julgus on see, kui natuke kõhe on, aga sa teed ikka. Päkapikud hoiavad pöialt!`,
    young: (c) =>
      `Täna on ${c.v('sul', 'teil')} ${c.title || 'esinemine'}! Kui natuke kõhe on, ${c.v('hinga', 'hingake')} sügavalt sisse ja ${c.v('mõtle', 'mõelge')}: ${c.helper} hoiab pöialt. ${c.v('Sa saad', 'Te saate')} hakkama!`,
    toddler: () => `Täna on suur päev! Plaksutame koos: plaks-plaks-plaks!`,
  },
  hobby: {
    label: 'Trenn või ring',
    placeholder: 'nt judotrenn (mis?)',
    older: (c) =>
      `Täna on ${c.v('sul', 'teil')} ${c.title || 'trenn'}. Kas ${c.v('näitaksid', 'näitaksite')} õhtul mulle ühe asja, mida seal õppisid${c.v('', 'te')}? Päkapikud õpivad hea meelega juurde.`,
    young: (c) =>
      `Täna on ${c.v('sul', 'teil')} ${c.title || 'trenn'}! Päkapikud proovisid ka, aga kukkusid kõik ühte kuhja. ${c.v('Näita', 'Näidake')} mulle õhtul, kuidas õigesti tehakse!`,
    toddler: (c) => `Täna on ${c.title || 'trenn'}! Hopp-hopp, kui tubli!`,
  },
  baking: {
    label: 'Piparkoogipäev',
    placeholder: 'nt vanaemaga (kellega?)',
    older: (c) =>
      `Täna on teie kodus piparkoogipäev${c.title ? ` – ${c.title}` : ''}! Mul on ${c.v('sulle', 'teile')} eriülesanne: ${c.v('tee', 'tehke')} üks piparkook täiesti oma leiutatud kujuga ja ${c.v('kaunista', 'kaunistage')} see glasuuriga. Ma tahan näha, mis välja tuleb!`,
    young: (c) =>
      `Täna küpsetate piparkooke! ${c.v('Tee', 'Tehke')} üks piparkook ka mulle – võib-olla päkapiku kujuline? ${c.v('Jäta', 'Jätke')} see õhtul sussi juurde.`,
    toddler: () => `Täna küpsetame piparkooke. Mmm, kui hästi lõhnab! Nuusuta!`,
  },
  party: {
    label: 'Pidu või sünnipäev',
    placeholder: 'nt vanaema sünnipäev (mis?)',
    older: (c) =>
      `Täna on ${c.title || 'pidu'}! ${c.v('Mõtle', 'Mõelge')} välja üks hea soov ja ${c.v('ütle', 'öelge')} see peol valjult välja. Päkapikud teavad, et head soovid täituvad kõige sagedamini.`,
    young: (c) =>
      `Täna on ${c.title || 'pidu'}! ${c.v('Tantsi', 'Tantsige')} peol vähemalt ühe tantsu ka minu eest – mina tantsin samal ajal töökojas.`,
    toddler: () => `Täna on pidu! Tantsime koos: keerutame ja hüppame!`,
  },
  custom: {
    label: 'Muu sündmus',
    placeholder: 'nt esimene lumi (mis?)',
    older: (c) => `Täna on eriline päev: ${c.title || 'midagi toredat ootab ees'}. Ma mõtlen ${c.v('sinule', 'teile')} ja hoian pöialt!`,
    young: (c) => `Täna on eriline päev: ${c.title || 'midagi toredat ootab ees'}! Ma mõtlen ${c.v('sinule', 'teile')}.`,
    toddler: (c) => `Täna on eriline päev${c.title ? `: ${c.title}` : ''}!`,
  },
}

/** Sunday rule texts: sweets only on Sundays, like the elves' own rule. */
export const SUNDAY_RULE = {
  intro: (v: Say) =>
    `Päkapikkude reegel: maiustusi toome ainult pühapäeviti. Teistel päevadel on ${v('sinu', 'teie')} sussis midagi muud toredat.`,
  sunday: (v: Say) => `Täna on pühapäev, nii et ${v('sussis', 'sussides')} on üks komm.`,
  toddlerSunday: () => `Täna on pühapäev ja sussis on väike üllatus!`,
}
