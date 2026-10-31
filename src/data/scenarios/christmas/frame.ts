import type { Scenario } from '../../../domain/story/types'

/** First and last letters of a series, plus Christmas Eve when it is not the last letter. */
export const FRAME_SCENARIOS: Scenario[] = [
  {
    id: 'introduction',
    title: 'Tutvustus',
    occasions: ['christmas'],
    role: 'introduction',
    tags: ['frame'],
    variants: {
      older: (c) => [
        introLine(c.helper, c.frame.title, c.frame.origin, c.frame.siblingHelpers),
        'Igal hommikul leiad siit kirja. Mõnikord on mul uudiseid töökojast, mõnikord mõni mõistatus ja mõnikord ainult see, et põhjapõder Välk sõi jälle mu kindad ära.',
      ],
      young: (c) => [
        introLine(c.helper, c.frame.title, c.frame.origin, c.frame.siblingHelpers),
        'Ma tulin otse töökoja köögist – kui kiri lõhnab kaneeli järele, siis ongi nii. Igal hommikul kirjutan sulle, mis meil juhtus. Meil juhtub palju!',
      ],
      toddler: (c) => [
        c.siblings
          ? `Tere, väike ${c.name}! Mina olen ${c.helper}${c.frame.origin ? ` – ${c.frame.origin}` : ''}. ${c.siblings} ${c.siblingCount > 1 ? 'saavad' : 'saab'} ka kirju!`
          : `Tere, väike ${c.name}! Mina olen ${c.helper}. Ma olen nii väike, et mahun sinu sussi sisse.`,
      ],
    },
    readAloud: (c) => [
      `Tere, ${c.name}! Mina olen ${c.helper}${c.frame.origin ? ` – ${c.frame.origin}` : ', Jõuluvana töökoja kõige pisem päkapikk. Ma olen nii väike, et mahun sinu sussi sisse'}.`,
      c.siblings &&
        `${c.siblings} ${c.siblingCount > 1 ? 'saavad' : 'saab'} ka kirju oma päkapikkudelt. Me oleme kõik head sõbrad.`,
      'Ma tulin pikalt teelt põhjast, kus on palju lund ja põhjapõtru. Nüüd elan ma sinu juures jõuludeni ja igal hommikul räägin, mis minuga juhtus. Musi!',
    ],
  },
  {
    id: 'christmas-eve',
    title: 'Jõululaupäev',
    occasions: ['christmas'],
    role: 'resolution',
    tags: ['frame'],
    variants: {
      older: (c) => [
        `Täna on jõululaupäev! Töökoda on vaikseks jäänud ja kingid on kelgul.${c.knows('star-back') ? ' Täht särab kuuse tipus ja Jõuluvana leiab täna öösel tee.' : ''}`,
        'Mina jään sinu juurde veel mõneks päevaks – keegi peab ju vaatama, et jõulurahu ka pärast jõule kestaks.',
      ],
      young: (c) => [
        `Täna on jõululaupäev! Kingid on kelgul ja põhjapõdrad on kellad kaela saanud.${c.knows('star-back') ? ' Täht särab kuuse otsas!' : ''}`,
        'Ma jään sinu juurde veel natukeseks. Jõulude ajal on päkapikkudel ka puhkus.',
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
        `Mul oli sinu juures hea. Pakkisin tööriistad kotti ja otsisin kaua oma prille – need olid mul ninal. Häid jõule, ${c.name}!`,
      ],
      young: (c) => [
        eveLine(c.frame.eve, c.knows('star-back')),
        goingHome(c.frame.allHelpers),
        `Ma pesin viimase pudrupoti puhtaks ja panin mütsi pähe. Ma hakkan sind igatsema! Häid jõule, ${c.name}!`,
      ],
      toddler: (c) => [`Häid jõule, väike ${c.name}! ${c.helper} kallistab sind. Musi-musi!`],
    },
    readAloud: (c) => [
      `${c.frame.eve ? 'Täna on jõululaupäev!' : 'See on minu viimane kiri.'} Panin oma pisikese mütsi pähe ja paki selga.`,
      c.frame.allHelpers
        ? 'Täna lähevad kõik päkapikud koos tagasi põhja, Jõuluvana töökotta.'
        : 'Nüüd lähen ma tagasi põhja, Jõuluvana töökotta.',
      `Mul oli sinu juures väga hea. Jätan sulle ühe suure kalli ja hästi palju musisid. Häid jõule, ${c.name}!`,
    ],
  },
]

function introLine(helper: string, title: string, origin: string, siblingHelpers: string): string {
  const who = `Tere! Mina olen ${helper}${title ? ` ${title}` : ''}${origin ? ` – ${origin}` : ''}.`
  return siblingHelpers
    ? `${who} Sel detsembril käib ${siblingHelpers}. Me oleme kõik head sõbrad ja räägime üksteisele kõigest.`
    : `${who} Tulin põhjast, Jõuluvana töökojast, ja jään sinu juurde jõuludeni.`
}

function eveLine(eve: boolean, starBack: boolean): string {
  const opening = eve
    ? 'Täna on jõululaupäev! Töökoda on vaikseks jäänud ja kingid on kelgul.'
    : 'See on minu viimane kiri. Töökojas pakitakse viimaseid kinke.'
  return starBack ? `${opening} Täht särab jälle kuuse tipus.` : opening
}

function goingHome(allHelpers: string): string {
  return allHelpers
    ? `Täna lõpetavad kõik päkapikud – ${allHelpers} – oma töö ja lähevad koos põhja tagasi.`
    : 'Minu töö siin on tehtud ja täna õhtul lähen põhja tagasi.'
}
