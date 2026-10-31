import type { Scenario, StoryArc } from '../../../domain/story/types'
import { reverseWords } from '../../../domain/generators/puzzleTools'

/**
 * „Kadunud täht“ – the Christmas mystery. The workshop star disappears; the old elf
 * investigates (feather, owl, wrong suspect, old book), the young elf finds his own
 * clues (silver dust, the cookie trap) and the tiniest elf sees a little silver bird.
 * Shared stages are told to every child on the same day. Nothing in the story
 * depends on what the child did in real life.
 */

const BIRD = 'TÄHELIND'
const BIRD_CODE = reverseWords(BIRD)

export const STAR_ARC_SCENARIOS: Scenario[] = [
  {
    id: 'star-lost',
    title: 'Täht on kadunud',
    occasions: ['christmas'],
    role: 'introduction',
    tags: ['star', 'mystery'],
    establishes: ['star-lost'],
    variants: {
      older: () => [
        'Kirjutan täna lühidalt, sest töökojas on ärevus. Kuuse tipust on kadunud täht.',
        'See pole tavaline ehe. Jõuluööl näitab see täht Jõuluvana kelgule teed läbi tuisu ja pilvede. Ilma temata on kelk nagu laev ilma tuletornita.',
        'Eile õhtul oli ta veel paigal – nägin teda, kui tuled kustutasin. Täna hommikul oli kuuse tipp tühi. Uks oli lukus, aken kinni. Ma ei tea veel, mida sellest arvata. Aga ma kavatsen välja uurida.',
      ],
      young: () => [
        'Kujuta ette: meie töökoja kuuse otsast on täht kadunud!',
        'Eile õhtul oli ta veel seal, ma olen kindel. Ta särab nii, et isegi minu tuppa paistab valgust. Aga täna hommikul oli kuuse tipp tühi.',
        'Ilma täheta ei leia Jõuluvana jõuluööl teed. Kõik päkapikud otsivad. Mina otsisin ka – isegi pudrupotist. Seal teda ei olnud.',
      ],
      toddler: () => [
        'Oi! Kuusel oli täht. Nüüd ei ole! Kus on täht? Laua all? Ei ole. Kapis? Ei ole. Otsime!',
      ],
    },
  },
  {
    id: 'star-feather',
    title: 'Hõbedane sulg',
    occasions: ['christmas'],
    role: 'discovery',
    tags: ['star', 'mystery'],
    requires: ['star-lost'],
    until: 'star-found',
    establishes: ['feather-found'],
    variants: {
      older: () => [
        'Mul on esimene vihje. Kuuse alt, täpselt sealt, kuhu täht oleks kukkunud, kui ta oleks kukkunud, leidsin sule.',
        'See ei ole tavaline sulg. Ta on hõbedane, minu nimetissõrme pikkune ja pimedas helendab natuke – nagu oleks ta kunagi palju valgust näinud ja meenutaks seda nüüd.',
        'Ükski meie lind nii ei helenda. Panin sule klaaspurki ja purgi oma lauale. Täna öösel vaatan teda. Võib-olla räägib ta mulle midagi.',
      ],
    },
  },
  {
    id: 'star-dust',
    title: 'Hõbedane tolm aknalaual',
    occasions: ['christmas'],
    role: 'discovery',
    tags: ['star', 'mystery', 'kitchen'],
    requires: ['star-lost'],
    until: 'star-found',
    establishes: ['silver-dust'],
    variants: {
      young: (c) => [
        'Ma leidsin vihje! Päris vihje!',
        'Täna hommikul vaatasin köögiaknast välja ja aknalaual oli hõbedane tolm. Mitte jahu – jahu ma tunnen. See tolm sädeles, kui ma selle peale hingasin.',
        `${c.cast.older} ütles, et see on väga tähtis, ja korjas tolmu pintsliga purki. Ma tunnen end nüüd nagu päris detektiiv.`,
      ],
    },
  },
  {
    id: 'star-owl',
    title: 'Öökull Huugo nägi midagi',
    occasions: ['christmas'],
    role: 'development',
    tags: ['star', 'mystery', 'birds', 'night'],
    requires: ['feather-found'],
    until: 'star-found',
    establishes: ['owl-saw'],
    variants: {
      older: (c) => [
        'Käisin eile õhtul vana öökulli Huugo juures. Ta elab töökoja taga kuuse otsas ja näeb öösel rohkem kui meie kõik kokku.',
        c.happened('silver-dust')
          ? `Võtsin kaasa sule ja purgitäie hõbedast tolmu, mille ${c.cast.young} köögiaknalt leidis. Huugo vaatas neid kaua ja ütles, et see pole ühegi talvelinnu sulg.`
          : 'Võtsin sule kaasa. Huugo vaatas seda kaua ja ütles, et see pole ühegi talvelinnu sulg.',
        'Aga sel ööl, kui täht kadus, nägi ta väikest valgust, mis lendas madalalt üle lumevälja mäe poole. „Ta lendas nagu lind,“ ütles Huugo, „aga linnud ei helenda.“ Ma mõtlen selle üle.',
      ],
    },
  },
  {
    id: 'star-magpie',
    title: 'Vale kahtlusalune',
    occasions: ['christmas'],
    role: 'complication',
    tags: ['star', 'mystery', 'birds'],
    requires: ['star-lost'],
    until: 'star-found',
    establishes: ['magpie-innocent'],
    variants: {
      older: (c) => [
        'Pean tunnistama ühte viga. Töökojas otsustati eile, et tähe võttis harakas Helmi – harakad armastavad ju läikivaid asju. Ka mina noogutasin.',
        `Läksime kogu seltskonnaga Helmi pesa juurde. Pesas olid kolm teelusikat, üks võti, Jõuluvana sõrmkübar ja vispel, mida ${c.cast.young} oli juba nädal aega otsinud. Tähte ei olnud.`,
        `Helmi oli väga solvunud. Palusime vabandust ja ${c.cast.young} küpsetas talle vabanduseks koogi. Helmi sõi koogi ära ja jättis lusikad endale. Õiglane.`,
      ],
      young: () => [
        'Kõik arvasid, et tähe võttis harakas Helmi. Harakad korjavad ju läikivaid asju!',
        'Me läksime tema pesa juurde. Ja mis seal oli? Lusikad, üks võti… ja minu vispel, mida ma juba nädal aega otsisin! Aga tähte ei olnud.',
        'Helmi oli meie peale pahane. Ma küpsetasin talle vabanduseks koogi. Ta sõi selle ära ja andis mulle mu vispli tagasi. Lusikad jättis endale.',
      ],
    },
  },
  {
    id: 'star-book',
    title: 'Vana linnuraamat',
    occasions: ['christmas'],
    role: 'development',
    hooks: ['codes'],
    tags: ['star', 'mystery', 'puzzle', 'books'],
    requires: ['feather-found'],
    until: 'star-found',
    establishes: ['starbird-known'],
    variants: {
      older: (c) => [
        'Eile otsisin töökoja raamatukogust vanu linnuraamatuid. Kõige alumisel riiulil oli üks, mille kaaned olid tolmust hallid. Selles oli pilt väikesest hõbedasest linnust ja selle all üks sõna, tagurpidi kirjutatud – nii hoidsid vanad meistrid saladusi:',
        BIRD_CODE,
        c.uses('codes')
          ? 'Sinusugusele salakoodide lahendajale on see ilmselt kerge. Mina lugesin seda kolm korda valesti.'
          : 'Mina lugesin seda kolm korda valesti.',
      ],
    },
    activities: {
      older: {
        essential: true,
        text: () => 'Kui tahad, loe linnu nimi välja – homme kirjutan, mida raamat temast rääkis.',
        answer: `${BIRD} (sõna on tagurpidi kirjutatud)`,
        reveal: () =>
          'Raamatu sõna oli TÄHELIND. Raamat kirjutab, et tähelinnud korjavad talvel kokku valgust, mis on kuhugi kaotsi läinud – ja et inimesed näevad neid väga harva.',
        check: () => reverseWords(BIRD_CODE) === BIRD,
      },
    },
  },
  {
    id: 'star-bird-seen',
    title: 'Väike hõbedane lind',
    occasions: ['christmas'],
    role: 'development',
    tags: ['star', 'birds', 'sounds'],
    requires: ['star-lost'],
    until: 'star-found',
    variants: {
      toddler: () => [
        'Ma nägin väikest linnukest. Linnuke on hõbedane ja sätendab. Linnuke laulab: piiu-piiu! Kas sina oskad ka nii laulda?',
      ],
    },
  },
  {
    id: 'star-trap',
    title: 'Küpsised mäe peal',
    occasions: ['christmas'],
    role: 'development',
    tags: ['star', 'mystery', 'kitchen', 'birds'],
    requires: ['star-lost'],
    until: 'star-found',
    establishes: ['bird-seen'],
    variants: {
      young: (c) => [
        'Mul oli eile suurepärane plaan. Kes korjab öösel läikivaid asju, see armastab ehk ka küpsiseid?',
        'Küpsetasin tähekujulised küpsised ja panin need õhtul mäe peale. Hommikul olid küpsised kadunud! Lumel olid pisikesed linnujäljed ja kaks hõbedast sulge.',
        `${c.cast.older} vaatas sulgi ja ütles, et nüüd teame, kuhu minna. Mäe taga on vana kuusk. Varsti läheme vaatama!`,
      ],
    },
  },
  {
    id: 'star-found',
    title: 'Täht on leitud',
    occasions: ['christmas'],
    role: 'climax',
    tags: ['star', 'mystery', 'birds'],
    requires: ['star-lost'],
    establishes: ['star-found'],
    variants: {
      older: (c) => [
        c.knows('starbird-known')
          ? 'Me leidsime tähe. Ja tähelind on päriselt olemas.'
          : 'Me leidsime tähe. Selle võttis väike hõbedane lind, keda vanad raamatud kutsuvad tähelinnuks.',
        `${c.knows('owl-saw') ? 'Mäe taga, sinna, kuhu Huugo valgust lendamas nägi, kasvab vana kuusk.' : 'Mäe taga kasvab vana kuusk.'} Kõige kõrgemal oksal on pesa ja pesas kolm linnupoega. Nende keskel helendas meie täht nagu öölamp.`,
        'Ema-lind ei tahtnud kellelegi halba. Talveööd on siin pikad ja pimedad ning pojad kartsid. Ta võttis kõige ilusama valguse, mida nägi. Keegi meist ei suutnud tema peale pahane olla.',
      ],
      young: () => [
        'Me leidsime tähe!',
        'Ta oli mäe taga vana kuuse otsas linnupesas. Pesas olid kolm pisikest linnupoega ja täht helendas nende keskel nagu öölamp.',
        'Ema-lind oli tähe sinna viinud, sest pojad kartsid pimedat. Me ei saanud tema peale üldse pahane olla. Pojad olid nii armsad!',
      ],
      toddler: () => [
        'Täht on leitud! Täht oli linnupesas. Pesas magavad linnupojad. Ssss… vaikselt! Täht teeb sära-sära.',
      ],
    },
  },
  {
    id: 'star-return',
    title: 'Latern linnupesale',
    occasions: ['christmas'],
    role: 'resolution',
    tags: ['star', 'mechanism', 'birds'],
    requires: ['star-found'],
    establishes: ['star-back'],
    variants: {
      older: (c) => [
        'Tähe lugu on lahendatud – ja minu meelest päris hästi. Täht tuleb jõuluööks tagasi kuuse tippu, sest ilma temata Jõuluvana teed ei leia.',
        `Aga linnupojad ei pea enam pimedas olema. Ehitasin neile laterna: vana moosipurk, vasktraadist sang ja sees üks pisike tähekild, mille täht ise ära andis. ${c.cast.young} värvis purgile lumehelbed.`,
        'Täna hommikul riputasime laterna pesa kõrvale. Täht on jälle kuuse otsas ja särab natuke eredamalt kui enne. Või mulle ainult tundub nii.',
      ],
      young: (c) => [
        'Täht on tagasi kuuse otsas! Ta särab jälle nii, et minu tuppagi paistab.',
        `Aga linnupojad said endale päris oma laterna. ${c.cast.older} ehitas selle moosipurgist ja mina värvisin sellele lumehelbed. Kõige ilusam latern maailmas!`,
        'Nüüd on kõigil valge: kuusel, kelgul ja linnupesal. Ja minul on mälestuseks üks hõbedane sulg.',
      ],
    },
  },
]

export const STAR_ARC: StoryArc = {
  id: 'lost-star',
  title: 'Kadunud täht',
  occasions: ['christmas'],
  resolves: 'star-back',
  stages: [
    { id: 'lost', scenarioId: 'star-lost', at: 0.09, required: true, shared: true },
    { id: 'feather', scenarioId: 'star-feather', at: 0.2, required: true },
    { id: 'dust', scenarioId: 'star-dust', at: 0.28, required: true },
    { id: 'owl', scenarioId: 'star-owl', at: 0.37 },
    { id: 'magpie', scenarioId: 'star-magpie', at: 0.48, shared: true },
    { id: 'bird', scenarioId: 'star-bird-seen', at: 0.55 },
    { id: 'book', scenarioId: 'star-book', at: 0.62 },
    { id: 'trap', scenarioId: 'star-trap', at: 0.7 },
    { id: 'found', scenarioId: 'star-found', at: 0.86, required: true, shared: true },
    { id: 'return', scenarioId: 'star-return', at: 0.93, required: true },
  ],
}
