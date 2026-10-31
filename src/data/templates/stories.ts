import type { EducationalTheme, OccasionId, StoryGenre, Tone } from '../../domain/models'
import type { Say } from './interests'

export interface StoryContext {
  /** Hero names in nominative: "Ruben ja Jasper". */
  heroes: string
  heroesAllative: string
  /** Third-person number: v('läks', 'läksid'). */
  v: Say
  they: string
  mood: string
  missing: string
  missingGenitive: string
}

export type StoryLine = (c: StoryContext) => string

/**
 * openings, problems and resolutions are parallel arrays: index i of each forms one
 * coherent plot, so they must be picked with the same index.
 */
export interface GenreTemplate {
  label: string
  /** Title object joined after hero names: "Ruben, Jasper ja kuldne võti". */
  titleThing: StoryLine
  openings: StoryLine[]
  problems: StoryLine[]
  obstacles: StoryLine[]
  resolutions: StoryLine[]
}

export const GENRE_LABELS: Record<StoryGenre, string> = {
  fairytale: 'Muinasjutt',
  adventure: 'Seiklus',
  detective: 'Detektiivilugu',
  space: 'Kosmoselugu',
  animals: 'Loomalugu',
  funny: 'Naljalugu',
}

export const GENRES: Record<StoryGenre, GenreTemplate> = {
  fairytale: {
    label: 'Muinasjutt',
    titleThing: () => 'kuldne võti',
    openings: [
      (c) =>
        `Ühel hommikul, kui päike alles sirutas oma esimesi kiiri, ${c.v('leidis', 'leidsid')} ${c.heroes} aiast väikese kuldse võtme. ${c.mood}`,
      (c) =>
        `${c.v('Elas', 'Elasid')} kord ${c.heroes}. ${c.v('Tema', 'Nende')} kodu lähedal kasvas vana tamm, mille tüves oli pisike uks. ${c.mood}`,
    ],
    problems: [
      () =>
        'Kuldne võti kuulus Unemaa kuningannale. Tema lossi väravad olid lukku jäänud ja kogu Unemaa jäi liiga vara magama.',
      () =>
        'Pisikese ukse tagant kostis nuttu. Seal elas haldjas Lumi, kelle võlukepp oli murdunud. „Ilma selleta ei saa ma täna öösel tähti süüdata,“ nuuksus ta.',
    ],
    obstacles: [
      () =>
        'Tee viis läbi Sosinametsa, kus puud esitasid igale möödujale mõistatusi. Edasi pääses ainult see, kes vastust teadis.',
      (c) =>
        `Siis ${c.v('jõudis', 'jõudsid')} ${c.they} jõe äärde, kus sild oli kadunud. Vesi vulises kiiresti ja sügavalt.`,
      () =>
        'Lossi ees seisis pahur kivitroll. „Siit ei pääse keegi, kes mind naerma ei aja,“ porises ta.',
    ],
    resolutions: [
      (c) =>
        `Lõpuks avanes lossi suur uks. Kuninganna naeratas ja kinkis ${c.heroesAllative} tähe, mis helendab öösiti voodi kohal. „Aitäh, ${c.heroes}!“ ütles ta.`,
      () =>
        'Võlukepp oli jälle terve. Haldjas Lumi keerutas seda õhus ja taevasse süttisid tuhanded tähed, üks säravam kui teine.',
    ],
  },
  adventure: {
    label: 'Seiklus',
    titleThing: () => 'saladuslik kaart',
    openings: [
      (c) =>
        `Vihmasel pärastlõunal ${c.v('ronis', 'ronisid')} ${c.heroes} pööningule. Vana kirstu põhjast ${c.v('leidis', 'leidsid')} ${c.they} kollaseks tõmbunud kaardi. ${c.mood}`,
      (c) =>
        `${c.heroes} ${c.v('oli', 'olid')} just hommikusöögi lõpetanud, kui aknale koputas tuvi. Tema jala külge oli seotud pisike rull – kaart! ${c.mood}`,
    ],
    problems: [
      () =>
        'Kaardil oli rist ja kiri: „Siin peitub aare, mida ei saa osta ühegi raha eest.“ Aga tee ristini oli täis takistusi.',
      () =>
        'Kaardi nurgas oli kiri: „Aare tuleb leida enne päikeseloojangut, muidu kaob kaart igaveseks.“',
    ],
    obstacles: [
      () => 'Esimene takistus oli kõrge kivimüür, millel polnud ühtegi ust – ainult kummalised märgid.',
      () => 'Siis jõuti tihedasse metsa, kus kõik rajad tundusid ühesugused.',
      () => 'Mäe jalamil ootas lukus värav, mille lukul oli võtmeaugu asemel hoopis mõistatus.',
    ],
    resolutions: [
      (c) =>
        `Rist kaardil viis vana tamme alla. Seal oli kirst ja selle sees... pilt, kus ${c.heroes} ${c.v('naeratas', 'naeratasid')} koos oma perega. All oli kiri: „Kõige suurem aare on see, mis sul juba olemas on.“`,
      () =>
        'Aare oli vana kast, täis vanaaegseid münte, kaarte ja kirju teistelt seiklejatelt. Kõige peal oli tühi leht – järgmise seikluse jaoks.',
    ],
  },
  detective: {
    label: 'Detektiivilugu',
    titleThing: (c) => `kadunud ${c.missingGenitive} juhtum`,
    openings: [
      (c) =>
        `${c.heroes} ${c.v('ärkas', 'ärkasid')} selle peale, et keegi hüüdis: „Appi! Kadunud on ${c.missing}!“ ${c.mood}`,
      (c) =>
        `Kõik oli valmis, kuni avastati, et kadunud on ${c.missing}. „See on juhtum just ${c.v('minu', 'meie')} jaoks,“ ${c.v('ütles', 'ütlesid')} ${c.heroes}.`,
    ],
    problems: [
      () => 'Laual oli ainult natuke puru ja aknalaual imelikud väikesed jäljed. Kes võis siin käia?',
      () => 'Uks oli lukus ja aken kinni. Kuidas sai keegi sisse pääseda nii, et keegi midagi ei märganud?',
    ],
    obstacles: [
      () => 'Esimene vihje: pisikesed jäljed viisid köögist esikusse ja kadusid vaiba alla.',
      () => 'Teine vihje: diivanipatjade vahelt leiti pisike hall karv ja üks rosin.',
      () => 'Kolmas vihje: keegi oli kirjutanud aknaklaasile auruga salapärase tähe.',
    ],
    resolutions: [
      () =>
        'Jäljed viisid lõpuks kapi taha. Seal istus väike siil ja tema kõrval oli kadunud asi – terve ja puutumata! Siil oli lihtsalt üksik ja tahtis pidu kaasa teha. Nüüd sai ta endale uued sõbrad.',
      () =>
        'Selgus, et süüdlane oli naabri pisike kutsikas, kes oli kõik oma pessa tassinud. Kõik leiti üles ja kutsikas sai pai – ning oma isikliku kausi.',
    ],
  },
  space: {
    label: 'Kosmoselugu',
    titleThing: () => 'kustunud tähed',
    openings: [
      (c) =>
        `Ühel õhtul ${c.v('ehitas', 'ehitasid')} ${c.heroes} papist raketi. Kui viimane kleeplindijupp oli paigas, hakkas rakett äkki värisema ja sumisema. ${c.mood}`,
      (c) =>
        `Kui ${c.heroes} ${c.v('vaatas', 'vaatasid')} õhtul aknast tähti, kukkus aknalauale pisike helendav kivi. See piiksus: „Appi, appi!“ ${c.mood}`,
    ],
    problems: [
      () =>
        'Kauge planeedi Plõks tähed olid kustunud ja seal elavad olendid ei leidnud enam teed koju. Ainult keegi Maalt võis aidata.',
      () =>
        'Tähtede jõujaam planeedil Plõks oli seiskunud ja iga minutiga läks taevas tumedamaks.',
    ],
    obstacles: [
      () => 'Esmalt tuli lennata läbi meteoriidivihma, kus kivid lendasid igas suunas.',
      () => 'Planeedil Plõks oli raskusjõud nii väike, et iga samm viis kõrgele õhku.',
      () => 'Tähtede jõujaama uks oli lukus ja sellel vilkus kood, mida keegi polnud aastaid lahendanud.',
    ],
    resolutions: [
      (c) =>
        `Tähed süttisid üksteise järel. Planeedi elanikud kilkasid rõõmust ja kinkisid ${c.heroesAllative} mälestuseks pisikese helendava kivi.`,
      () =>
        'Jõujaam hakkas taas sumisema ja taevas lõi särama. Kodu poole lennates lehvitasid kõik tähed tänutäheks.',
    ],
  },
  animals: {
    label: 'Loomalugu',
    titleThing: () => 'metsaloomade sild',
    openings: [
      (c) =>
        `Ühel hommikul ${c.v('läks', 'läksid')} ${c.heroes} metsa jalutama. Järsku kostis põõsast väikest piiksumist. ${c.mood}`,
      (c) =>
        `Kui ${c.heroes} ${c.v('istus', 'istusid')} aia all pingil, maandus ${c.v('tema', 'nende')} kõrvale nutika näoga harakas. ${c.mood}`,
    ],
    problems: [
      () =>
        'Põõsas istus jänesepoeg. „Oja peal olev sild on katki,“ ütles ta. „Loomad ei pääse teisele kaldale ja täna õhtul on seal suur metsapidu!“',
      () =>
        '„Metsaloomad vajavad abi,“ prääksus harakas. „Torm murdis silla ja nüüd on pooled loomad oja ühel ja pooled teisel kaldal.“',
    ],
    obstacles: [
      () => 'Kõigepealt oli vaja leida tugevaid oksi. Kobras teadis küll, kus neid on, kuid ta oli tee unustanud.',
      () => 'Siis tuli oksad üle oja viia, kuid vool oli tugev ja oksad tahtsid minema ujuda.',
      () => 'Viimaks oli vaja kõik oksad kokku siduda, kuid keegi polnud kunagi sõlmi teinud.',
    ],
    resolutions: [
      () =>
        'Uus sild oli valmis! Loomad marssisid üle oja ja metsapidu algas. Orav tänas kõiki ja ütles: „Kui oleme koos, saab iga oja ületatud.“',
      () =>
        'Sild pidas! Esimesena tipsis üle siil, siis rebane ja lõpuks karu, kes astus väga ettevaatlikult. Kogu mets plaksutas.',
    ],
  },
  funny: {
    label: 'Naljalugu',
    titleThing: () => 'tagurpidi päev',
    openings: [
      (c) =>
        `Kui ${c.heroes} ühel hommikul ${c.v('ärkas', 'ärkasid')}, oli kõik tagurpidi: lambid olid põrandal, vaip laes ja kass haukus nagu koer! ${c.mood}`,
      (c) =>
        `Sel hommikul ${c.v('avastas', 'avastasid')} ${c.heroes}, et kõik kodused asjad oskavad rääkida. Hambahari laulis ja tool kurtis seljavalu. ${c.mood}`,
    ],
    problems: [
      () => 'Kõige hullem oli see, et kell käis tagurpidi. Kui keegi asja ei paranda, jõuab päev tagasi eilsesse!',
      () => 'Kõik asjad olid tülli läinud ja keegi ei tahtnud oma tööd teha. Isegi lusikad keeldusid suppi tõstmast!',
    ],
    obstacles: [
      () => 'Kõigepealt tuli kinni püüda lendav sokk, kes oli otsustanud, et ta on lind.',
      () => 'Siis ilmus kööki pahur pannkook, kes keeldus taldrikule jäämast.',
      () => 'Viimaks tuli veenda kangekaelset vihmavarju, et vihm sajab alla, mitte üles.',
    ],
    resolutions: [
      () =>
        'Kui viimane asi oli paigas, tegi kell „tiks“ ja hakkas jälle õiges suunas käima. Kass ütles „mjäu“ ja kõik naersid nii, et kõhud valutasid.',
      () =>
        'Lõpuks leppisid kõik asjad ära ja lubasid teineteist aidata. Lusikad tõstsid suppi, tool ei kurtnud ja hambahari laulis ainult hommikuti.',
    ],
  },
}

export const GENERIC_SOLVES: ((name: string) => string)[] = [
  (n) => `${n} mõtles hetke ja ütles siis: „Ma tean! Proovime teistmoodi.“ Ja see töötaski.`,
  (n) => `${n} ei andnud alla. Kolmandal katsel õnnestus!`,
  (n) => `${n} märkas pisiasja, mida keegi teine polnud tähele pannud – ja just see oli lahendus.`,
  (n) => `${n} hingas sügavalt sisse, kogus julguse ja astus esimesena edasi.`,
  (n) => `${n} pakkus välja nutika plaani ja kõik aitasid kaasa.`,
]

export const THEME_LINES: Record<Exclude<EducationalTheme, 'none'>, StoryLine> = {
  friendship: (c) =>
    `Sel päeval ${c.v('mõistis', 'mõistsid')} ${c.heroes}, et koos on mured poole väiksemad ja rõõmud kaks korda suuremad.`,
  courage: (c) =>
    `${c.heroes} ${c.v('sai', 'said')} aru, et julgus ei tähenda kartmatust. Julge on see, kes teeb õige asja ka siis, kui natuke kardab.`,
  sharing: () =>
    'Kõige rohkem rõõmu tekkis siis, kui kõik jagasid seda, mis neil oli. Jagatud rõõm kasvab alati suuremaks.',
  nature: () => 'Kõik lubasid hoida metsa, jõgesid ja loomi, sest loodus on meie kõigi kodu.',
  honesty: () =>
    'Kõige tähtsam oli see, et keegi ei valetanud – isegi siis, kui tõtt rääkida oli raske. Ausus teeb sõpruse tugevaks.',
  patience: () =>
    'Kõik ei õnnestunud kohe, aga kannatlikkus viis lõpuks sihile. Iga väike samm oli tähtis.',
}

export const THEME_QUESTIONS: Record<Exclude<EducationalTheme, 'none'>, string> = {
  friendship: 'Kes on sinu hea sõber ja mis teeb temast hea sõbra?',
  courage: 'Millal sa oled olnud julge, kuigi natuke kartsid?',
  sharing: 'Mida sulle meeldib teistega jagada?',
  nature: 'Mida saame meie teha, et loodust hoida?',
  honesty: 'Miks on oluline tõtt rääkida ka siis, kui see on raske?',
  patience: 'Mida oled õppinud, kuigi alguses ei tulnud see välja?',
}

export const THEME_LABELS: Record<EducationalTheme, string> = {
  none: 'Ilma teemata',
  friendship: 'Sõprus',
  courage: 'Julgus',
  sharing: 'Jagamine',
  nature: 'Looduse hoidmine',
  honesty: 'Ausus',
  patience: 'Kannatlikkus',
}

export const ENDINGS: Record<Tone, StoryLine[]> = {
  heartwarming: [
    (c) =>
      `Õhtul, kui ${c.heroes} ${c.v('lamas', 'lamasid')} soojas voodis, ${c.v('mõtles', 'mõtlesid')} ${c.they} kõigele, mis oli juhtunud. Silmad vajusid vaikselt kinni ja unenägudes jätkus seiklus. Head ööd!`,
  ],
  magical: [
    (c) =>
      `Kui taevas süttisid tähed, vilksatas aknal pisike valgus – nagu oleks keegi lehvitanud. ${c.heroes} ${c.v('naeratas', 'naeratasid')} ja ${c.v('jäi', 'jäid')} magusasti magama.`,
  ],
  humorous: [
    (c) =>
      `Ja kui keegi küsib, miks ${c.heroes} täna nii väsinud on, siis vastus on lihtne: kangelaseks olemine on päris kurnav töö! Head ööd!`,
  ],
  adventurous: [
    (c) =>
      `${c.heroes} ${c.v('teadis', 'teadsid')}, et see polnud viimane seiklus. Uus kaart, võti või mõistatus ootab juba kuskil järgmist korda.`,
  ],
}

/** Missing item in detective stories: nominative and genitive ("küpsisepurgi juhtum"). */
export const MISSING_THINGS: Record<OccasionId, { nominative: string; genitive: string }> = {
  christmas: { nominative: 'piparkoogimaja', genitive: 'piparkoogimaja' },
  easter: { nominative: 'kuldne muna', genitive: 'kuldse muna' },
  birthday: { nominative: 'sünnipäevatort', genitive: 'sünnipäevatordi' },
  halloween: { nominative: 'kõrvitsalatern', genitive: 'kõrvitsalaterna' },
  'mardi-kadri': { nominative: 'lõngakera', genitive: 'lõngakera' },
  vastlapaev: { nominative: 'vastlakuklite korv', genitive: 'vastlakuklite korvi' },
  valentines: { nominative: 'sõbrapäeva kaartide kast', genitive: 'sõbrapäeva kaartide kasti' },
  'school-start': { nominative: 'uus pinal', genitive: 'uue pinali' },
  summer: { nominative: 'jäätisekast', genitive: 'jäätisekasti' },
  'lost-tooth': { nominative: 'piimahamba karbike', genitive: 'piimahamba karbikese' },
  everyday: { nominative: 'küpsisepurk', genitive: 'küpsisepurgi' },
}

export interface ToddlerGenre {
  trip: string
  meet: (name: string) => string
  action: string
}

export const TODDLER_GENRES: Record<StoryGenre, ToddlerGenre> = {
  fairytale: {
    trip: 'võlumetsa',
    meet: (n) => `Äkki nägi ${n} pisikest haldjat. Haldjas lehvitas tiibu: vurr-vurr!`,
    action: 'lehvitada nagu haldjas',
  },
  adventure: {
    trip: 'aeda avastama',
    meet: () => 'Aias kasvas suur lill. Lillel istus liblikas. Liblikas lendas: lipa-lipa!',
    action: 'lennata nagu liblikas',
  },
  detective: {
    trip: 'kaisukaru otsima',
    meet: () => 'Kus on kaisukaru? Kas laua all? Ei ole! Kas teki all? Jah, seal ta on!',
    action: 'otsida nagu detektiiv',
  },
  space: {
    trip: 'tähti vaatama',
    meet: (n) => `Taevas säras suur kollane kuu. „Tere, kuu!“ ütles ${n}.`,
    action: 'särada nagu täht',
  },
  animals: {
    trip: 'loomadega kohtuma',
    meet: (n) => `Äkki nägi ${n} väikest kutsut. „Auh-auh!“ ütles kutsu.`,
    action: 'haukuda nagu kutsu',
  },
  funny: {
    trip: 'mängima',
    meet: () => 'Äkki tegi kass „mjäu“ ja hüppas otse pesukorvi. Plärts!',
    action: 'hüpata nagu kass',
  },
}
