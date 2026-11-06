import type { Band, ScenarioContext } from '../../../domain/story/types'
import type { Scenario } from '../../../domain/story/types'

/**
 * The frame of the world, kept the same in every letter: the helper lives and works in
 * Jõuluvana's workshop far in the north, writes in the evening and brings the letter to the
 * child's slipper at night (reindeer Välk carries them), back in the workshop by morning.
 * So the stories happen in the workshop, and no helper ever moves in with the child.
 */

export const FRAME_SCENARIOS: Scenario[] = [
  {
    id: 'introduction',
    title: 'Tutvustus',
    occasions: ['christmas'],
    role: 'introduction',
    tags: ['frame'],
    more: {
      older: () => [
        'Enne kui alustame, pean sind ühest asjast hoiatama. Töökojas juhtub detsembris rohkem kui kogu ülejäänud aasta jooksul. Kelgud vajavad õlitamist, kirjad sorteerimist ja põhjapõder Välk pidevat valvamist. Mina olen siin selleks, et sulle kõigest ausalt kirjutada. Isegi siis, kui Välk palub mul midagi mitte rääkida.',
      ],
      young: () => [
        'Mul on seljakotis kõik vajalik: lusikas, villased sokid ja väike taskulamp, et öösel sinu sussi üles leida. Põhjapõder Välk toob mind igal ööl sinu akna taha ja ootab, kuni kirja sussi sisse panen. Siis lendame tagasi töökotta, enne kui keegi ärkab. Homme kirjutan, mis töökojas uut on.',
      ],
    },
    variants: {
      older: (c) => [
        introLine(c.helper, c.frame.title, c.frame.origin, c.frame.siblingLine),
        'Igal õhtul, kui töökojas tuled kustuvad, kirjutan sulle ja öösel toon kirja sinu sussi sisse. Mõnikord on mul uudiseid töökojast, mõnikord mõni mõistatus ja mõnikord ainult see, et põhjapõder Välk sõi jälle mu kindad ära.',
      ],
      young: (c) => [
        introLine(c.helper, c.frame.title, c.frame.origin, c.frame.siblingLine),
        'Ma kirjutan otse töökoja köögist – kui kiri lõhnab kaneeli järele, siis ongi nii. Igal õhtul kirjutan sulle, mis meil juhtus. Meil juhtub palju!',
      ],
      toddler: (c) => [
        c.siblings
          ? `Tere, väike ${c.name}! Mina olen ${c.helper}. ${c.siblings} ${c.siblingCount > 1 ? 'saavad' : 'saab'} ka kirju!`
          : `Tere, väike ${c.name}! Mina olen ${c.helper}. Ma olen nii väike, et mahun sinu sussi sisse.`,
      ],
    },
    readAloud: (c) => [
      `Tere, ${c.name}! Mina olen ${c.helper}${c.frame.origin ? ` – ${c.frame.origin}` : ', Jõuluvana töökoja kõige pisem päkapikk. Ma olen nii väike, et mahun sinu sussi sisse'}.`,
      c.siblings &&
        `${c.siblings} ${c.siblingCount > 1 ? 'saavad' : 'saab'} ka kirju oma päkapikkudelt. Me oleme kõik head sõbrad.`,
      'Ma elan kaugel põhjas, kus on palju lund ja põhjapõtru. Igal õhtul kirjutan sulle töökojas kirja ja öösel toon selle sinu sussi sisse. Hommikul saad kuulda, mis minuga juhtus. Kalli-kalli!',
    ],
  },
  {
    id: 'christmas-eve',
    title: 'Jõululaupäev',
    occasions: ['christmas'],
    role: 'resolution',
    tags: ['frame'],
    more: {
      older: () => [
        'Täna õhtul vaatan aknast, kuidas kelk taevasse tõuseb. Igal aastal tundub mulle, et see on kogu aasta kõige vaiksem hetk: kõik töö on tehtud ja jääb üle ainult oodata. Kui sina täna õhtul taevasse vaatad ja näed kuskil väikest valgust liikumas, võib-olla oleme see meie. Lehvita igaks juhuks.',
      ],
      young: () => [
        'Täna hommikul aitasin viimaseid kingipakke kelgule tõsta. Üks pakk oli nii suur, et ma ei näinud selle tagant midagi ja kõndisin otse põhjapõder Välgu otsa. Välk ei pahandanud. Ta lakkus mu mütsi märjaks. Õhtul vaatan aknast, kuidas kelk õhku tõuseb. Kas sina vaatad ka?',
      ],
    },
    variants: {
      older: (c) => [
        `Täna on jõululaupäev! Töökoda on vaikseks jäänud ja kingid on kelgul.${c.knows('star-back') ? ' Täht särab kuuse tipus ja Jõuluvana leiab täna öösel tee.' : ''}`,
        'Mina jään täna öösel töökotta valvama, et keegi kingipakkide vahele magama ei jääks. Seda juhtub igal aastal ja tavaliselt on see Välk.',
      ],
      young: (c) => [
        `Täna on jõululaupäev! Kingid on kelgul ja põhjapõdrad on kellad kaela saanud.${c.knows('star-back') ? ' Täht särab kuuse otsas!' : ''}`,
        'Mina jään täna töökotta ja silitan põhjapõtru, et nad enne lendu rahulikud oleksid. Kõige rohkem tahan näha, kuidas kelk õhku tõuseb!',
      ],
      toddler: (c) => [`Täna on jõululaupäev! Kuusel on tuled. Häid jõule, väike ${c.name}!`],
    },
    readAloud: (c) => [
      `Täna on jõululaupäev! Kuusel põlevad tuled ja kingid ootavad kelgul.${c.knows('star-back') ? ' Täht on jälle kuuse tipus ja särab.' : ''}`,
      'Põhjapõdrad said kaela kuldsed kellukesed. Jõuluvana pani selga oma kõige punasema kasuka ja kammis habeme siledaks.',
      `Täna öösel sõidab kelk üle taeva. Kuula hästi: võib-olla kuuled kellukesi. Häid jõule, ${c.name}!`,
    ],
  },
  {
    id: 'farewell',
    title: 'Hüvastijätt',
    occasions: ['christmas'],
    role: 'farewell',
    tags: ['frame'],
    variants: {
      older: (c) => [
        eveLine(c.frame.eve, c.knows('star-back')),
        goingHome(c.frame.allHelpers),
        `Mulle meeldis igal õhtul sulle kirjutada. Panin sulepea karpi ja otsisin kaua oma prille – need olid mul ninal. Häid jõule, ${c.name}!`,
      ],
      young: (c) => [
        eveLine(c.frame.eve, c.knows('star-back')),
        goingHome(c.frame.allHelpers),
        `Ma pesin viimase pudrupoti puhtaks ja panin mütsi pähe. Ma hakkan sind igatsema! Häid jõule, ${c.name}!`,
      ],
      toddler: (c) => [`Häid jõule, väike ${c.name}! ${c.helper} kallistab sind. Kalli-kalli!`],
    },
    readAloud: (c) => [
      `${c.frame.eve ? 'Täna on jõululaupäev!' : 'See on minu viimane kiri.'}${c.knows('star-back') ? ' Täht särab jälle kuuse tipus.' : ''} Panin oma pisikese mütsi pähe ja Välk ootab juba akna all.`,
      c.frame.allHelpers
        ? 'Täna toovad kõik päkapikud oma viimase kirja ja lendavad siis koos tagasi töökotta, kus jõulud ootavad.'
        : 'Kui kiri on sussis, lendame Välguga tagasi töökotta, kus jõulud ootavad.',
      `Mulle meeldis sulle kirjutada. Jätan sulle ühe suure kalli ja hästi palju sooje mõtteid. Häid jõule, ${c.name}!`,
    ],
  },
]

function introLine(helper: string, title: string, origin: string, siblingLine: string): string {
  const who = `Tere! Mina olen ${helper}${title ? ` ${title}` : ''}${origin ? ` – ${origin}` : ''}.`
  return siblingLine
    ? `${who} ${siblingLine} Me oleme kõik head sõbrad ja räägime üksteisele kõigest.`
    : `${who} Elan Jõuluvana töökojas kaugel põhjas ja sel detsembril kirjutan sulle.`
}

function eveLine(eve: boolean, starBack: boolean): string {
  const opening = eve
    ? 'Täna on jõululaupäev! Töökoda on vaikseks jäänud ja kingid on kelgul.'
    : 'See on minu viimane kiri sel aastal. Töökojas pakitakse viimaseid kinke.'
  return starBack ? `${opening} Täht särab jälle kuuse tipus.` : opening
}

function goingHome(allHelpers: string): string {
  return allHelpers
    ? `Täna toovad kõik päkapikud – ${allHelpers} – oma viimase kirja ja jäävad siis töökotta jõulutööde juurde.`
    : 'Pärast seda kirja jääb mu kirjakott tühjaks ja ma jään töökotta jõulutööde juurde.'
}

/**
 * A single letter: who writes, one whole episode from the workshop (planned like any other
 * day's story), and a closing. Toddler cards keep it all in one paragraph.
 */
export const SINGLE_LETTER: Record<Band | 'readAloud', { open: (c: ScenarioContext) => string; close: (c: ScenarioContext) => string }> = {
  older: {
    open: (c) =>
      `${greeting(c)} Kirjutan sulle Jõuluvana töökojast kaugel põhjas, sest siin juhtus midagi, mida tahan sulle rääkida.${c.frame.siblingLine ? ` ${c.frame.siblingLine}` : ''}`,
    close: (c) => `Nüüd pean minema – töökojas ootab veel palju tööd. Häid jõulupühi, ${c.name}!`,
  },
  young: {
    open: (c) =>
      `${greeting(c)} Kirjutan sulle otse Jõuluvana töökoja köögist – kui kiri lõhnab kaneeli järele, siis ongi nii. Pean sulle rääkima, mis meil juhtus!${c.frame.siblingLine ? ` ${c.frame.siblingLine}` : ''}`,
    close: (c) => `Nüüd jooksen tagasi kööki, puder hakkab keema. Häid jõule, ${c.name}!`,
  },
  toddler: {
    open: (c) => `Tere, väike ${c.name}! Mina olen ${c.helper}, kõige pisem päkapikk.`,
    close: () => 'Häid jõule!',
  },
  readAloud: {
    open: (c) =>
      `Tere, ${c.name}! Mina olen ${c.helper}, Jõuluvana töökoja kõige pisem päkapikk. Ma tahan sulle rääkida, mis minuga juhtus.`,
    close: (c) => `Häid jõule, ${c.name}! Kalli-kalli!`,
  },
}

function greeting(c: ScenarioContext): string {
  return `Tere! Mina olen ${c.helper}${c.frame.title ? ` ${c.frame.title}` : ''}${c.frame.origin ? ` – ${c.frame.origin}` : ''}.`
}
