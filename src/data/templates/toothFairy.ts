import type { TopicId } from '../topics'
import type { Line } from './types'

/**
 * Whole tooth-fairy letters. Each story has one event told from beginning to end (the fairy
 * arrives, something in the tooth castle needs the tooth, how it ended) and one task that
 * grows out of that event. A child's topic is the reason for the event, never a separate
 * paragraph: the fairy does not say that she "heard" what the child likes.
 */
export interface ToothStory {
  id: string
  paragraphs: Line[]
  /** The one thing to do, a part of the same story. */
  task: Line
}

export const TOOTH_STORIES: ToothStory[] = [
  {
    id: 'lighthouse',
    paragraphs: [
      ({ v }) =>
        `Täna öösel jõudsin ${v('sinu', 'teie')} aknale just siis, kui kuu tõusis. Padja alt leidsin piimahamba, mis oli nii puhas, et see helendas pimedas.`,
      () =>
        'Meie hammaste lossi tuletorn oli sel õhtul kustunud ja ükski haldjas ei leidnud pimedas koju. Panin hamba tuletorni laternasse. Tuli süttis kohe ja kõik haldjad jõudsid koju.',
      ({ v }) =>
        `Nii sai ${v('sinu', 'teie')} hamba valgusest terve loss valgeks. Jätsin padja alla läikiva mündi tänutäheks.`,
    ],
    task: ({ v }) =>
      `Hambahaldja ülesanne: ${v('vaata', 'vaadake')} täna õhtul aknast välja ja ${v('leia', 'leidke')} üks tuluke, mis aitab kellelgi koju jõuda.`,
  },
  {
    id: 'stairs',
    paragraphs: [
      ({ v }) =>
        `Täna öösel lendasin pilvede tagant üle kolme katuse ja ühe ööliblika ${v('sinu', 'teie')} akna juurde. Padja all ootas väike valge piimahammas.`,
      () =>
        'Meie lossi trepist oli üks aste puudu ja haldjad pidid viimaselt kolmandale hüppama. Panin hamba lünka ja see sobis täpselt!',
      () =>
        'Nüüd pääsevad kõik jälle kõige ülemisele korrusele. Hommikul lugesin üle: astmeid on sada ja üks neist on sinu hammas.',
    ],
    task: ({ v }) =>
      `Hambahaldja ülesanne: ${v('loe', 'lugege')} kokku, mitu astet on ${v('sinu', 'teie')} kodu trepil. Meie lossis on neid sada!`,
  },
  {
    id: 'glass-cabinet',
    paragraphs: [
      ({ v }) =>
        `Täna öösel leidsin ${v('sinu', 'teie')} padja alt piimahamba ja jätsin selle asemele läikiva mündi.`,
      () =>
        'Hammaste lossis saab iga hammas oma väikese klaaskapi, kus on sinine uks ja hõbedane käepide. Kirjutasin kapi sildile nime ja panin hamba kõige ülemisele riiulile, kus säravad kõige ilusamad hambad.',
      ({ v }) =>
        `Uus hammas kasvab ${v('sulle', 'teile')} aja jooksul, nii et hambaaugu pärast ei maksa muretseda. See on märk, et ${v('kasvad', 'kasvate')} suureks.`,
    ],
    task: ({ v }) =>
      `Hambahaldja ülesanne: ${v('naerata', 'naeratage')} peeglisse ja ${v('vaata', 'vaadake')}, kui naljakas hambaauk on.`,
  },
  {
    id: 'wind',
    paragraphs: [
      ({ v }) =>
        `Täna öösel puhus tugev tuul ja see viis mu mütsi peaaegu ${v('sinu', 'teie')} aknast mööda. Sain selle viimasel hetkel kätte ja libisesin sisse.`,
      () =>
        'Piimahammas oli padja all nii korralikult hoitud, et leidsin selle kohe. Kotti panemisel hakkas tuul uuesti puhuma, aga seekord hoidsin hamba kahe käega kinni.',
      ({ v }) =>
        `Koju jõudsin täiesti sassis juustega, aga hammas oli terve. Jätsin ${v('sulle', 'teile')} padja alla läikiva mündi, mis ei lenda ära.`,
    ],
    task: ({ v }) =>
      `Hambahaldja ülesanne: ${v('puhu', 'puhuge')} väike paberitükk üle laua teisele poolele.`,
  },
  {
    id: 'owl',
    paragraphs: [
      ({ v }) =>
        `Täna öösel istus ${v('sinu', 'teie')} akna taga puuoksal öökull. Ta vaatas mind suurte silmadega, kui ma padja alt piimahamba võtsin.`,
      () =>
        'Öökull ütles: huu! Ma arvan, et ta tahtis teada, kuhu ma hamba viin. Lubasin talle, et lossis saab ta hamba kohe esimesena üle vaadata.',
      () =>
        'Koju jõudes vaatas öökull hamba hoolikalt läbi ja ütles taas: huu! See tähendas, et hammas on väga ilus.',
    ],
    task: ({ v }) =>
      `Hambahaldja ülesanne: ${v('proovi', 'proovige')} täna õhtul öökulli häält järele teha: huu-huu!`,
  },
]

/** A story the topic gives its reason to; found for the child's topics in this order. */
export const TOPIC_TOOTH_STORIES: Partial<Record<TopicId, ToothStory>> = {
  lego: {
    id: 'lego-stairs',
    paragraphs: [
      ({ v }) =>
        `Täna öösel leidsin ${v('sinu', 'teie')} padja alt piimahamba ja jätsin asemele läikiva mündi.`,
      () =>
        'Meie hammaste lossi trepp oli pooleli: kõige ülemised astmed puudusid ja haldjad ei saanud torni. Ehitasin puuduvad astmed klotsidest ja viimasele astmele panin hamba.',
      () =>
        'Trepp püsib kindlalt ja kõik haldjad pääsevad jälle torni. Ühe punase klotsi jätsin üle, et see sobiks millalgi mõnele teisele lossile.',
    ],
    task: ({ v }) =>
      `Hambahaldja ülesanne: ${v('ehita', 'ehitage')} klotsidest väike trepp ja ${v('pane', 'pange')} selle tippu midagi pisikest.`,
  },
  drawing: {
    id: 'drawing-door',
    paragraphs: [
      ({ v }) =>
        `Täna öösel leidsin ${v('sinu', 'teie')} padja alt piimahamba ja jätsin asemele läikiva mündi.`,
      () =>
        'Hammaste lossi värav oli kogu aeg hall ja haldjad ei leidnud seda pimedas üles. Võtsin hamba pulbrit ja segasin selle värviga: värav sai õhtuse sinise ja kuldse tähtede mustriga.',
      () =>
        'Nüüd paistab värav pimedas eemalt kätte ja haldjad leiavad koju. Ma ei teadnud, et hamba pulbriga saab nii hästi värvida!',
    ],
    task: ({ v }) =>
      `Hambahaldja ülesanne: ${v('joonista', 'joonistage')} hammaste lossile uus värav, mida pimedas kaugelt näha oleks.`,
  },
  music: {
    id: 'music-bell',
    paragraphs: [
      ({ v }) =>
        `Täna öösel leidsin ${v('sinu', 'teie')} padja alt piimahamba ja jätsin asemele läikiva mündi.`,
      () =>
        'Meie lossi uksekell oli vaikseks jäänud ja haldjad ei kuulnud, kui keegi koputas. Panin hamba kella sisse kolisema ja see hakkas helisema: ding-dong!',
      () =>
        'Nüüd kuuleb kogu loss, kui keegi tuleb. Ja kell kõlab nii ilusti, et haldjad tulevad iga tund seda kuulama.',
    ],
    task: ({ v }) =>
      `Hambahaldja ülesanne: ${v('mõtle', 'mõelge')} välja uksekella helin ja ${v('laula', 'laulge')} see ette.`,
  },
  space: {
    id: 'space-star',
    paragraphs: [
      ({ v }) =>
        `Täna öösel lendasin tähtede alt ${v('sinu', 'teie')} aknale. Padja alt leidsin piimahamba ja jätsin asemele läikiva mündi.`,
      () =>
        'Hammaste lossi tähekaardil oli üks tühi koht, kuhu üks tähtedest oli ära kadunud. Panin hamba kaardile ja see hakkas sinna tähena helendama.',
      ({ v }) =>
        `Nüüd on tähekaart täielik. Kui ${v('vaatad', 'vaatate')} õhtul taevasse, ${v('otsi', 'otsige')} üles üks eriti pehme valge sära: see on ${v('sinu', 'teie')} oma.`,
    ],
    task: ({ v }) =>
      `Hambahaldja ülesanne: ${v('vaata', 'vaadake')} õhtul taevasse ja ${v('leia', 'leidke')} üks täht, mis on teistest eredam.`,
  },
  baking: {
    id: 'baking-oven',
    paragraphs: [
      ({ v }) =>
        `Täna öösel leidsin ${v('sinu', 'teie')} padja alt piimahamba ja jätsin asemele läikiva mündi.`,
      () =>
        'Meie lossi köögis kippusid küpsised pealt kõrbema ja seest toored jääma. Haldjakokk pani hamba ahju kõrvale: kui hammas hakkas helendama, oli ahi õige kuumusega. Täna öösel oli see just paras.',
      () =>
        'Esimest korda tulid küpsised kullakarva välja. Kõik haldjad sõid kuni lossi tornini ja kiitsid.',
    ],
    task: ({ v }) =>
      `Hambahaldja ülesanne: ${v('küpseta', 'küpsetage')} koos kellegagi midagi väikest ja ${v('loe', 'lugege')} kokku, mitu tükki tuleb.`,
  },
  vehicles: {
    id: 'vehicles-tooth-cart',
    paragraphs: [
      ({ v }) =>
        `Täna öösel leidsin ${v('sinu', 'teie')} padja alt piimahamba ja jätsin asemele läikiva mündi.`,
      () =>
        'Meie hammaste lossil on väike veok, millega vedame hambaid riiulini. Täna öösel jäi see keset teed seisma, sest üks ratas oli lahti. Panin hamba rattatelje otsa tõkiseks, et ratas enam maha ei libiseks.',
      () =>
        'Veok sõidab jälle. Hammas hoiab ratast nii tugevalt, et see ei hakka kunagi enam lahti tulema.',
    ],
    task: ({ v }) =>
      `Hambahaldja ülesanne: ${v('joonista', 'joonistage')} veok, mis suudaks viia hambaid üle pilvede.`,
  },
  robots: {
    id: 'robots-sorter',
    paragraphs: [
      ({ v }) =>
        `Täna öösel leidsin ${v('sinu', 'teie')} padja alt piimahamba ja jätsin asemele läikiva mündi.`,
      () =>
        'Meie hammaste lossis on väike robot, kes sorteerib hambaid riiulitele. Täna öösel jäi ta seisma ja piiksus: piip-piip! Selgus, et ta oli oma mõõdupulga ära kaotanud. Hammas on täpselt õige suurusega, nii et panin selle robotile uueks mõõdupulgaks.',
      () =>
        'Nüüd töötab robot jälle ja iga hammas jõuab õigele riiulile.',
    ],
    task: ({ v }) =>
      `Hambahaldja ülesanne: ${v('mõtle', 'mõelge')} välja robotile nimi ja ${v('joonista', 'joonistage')} talle käsi, mis hoiab hammast.`,
  },
  dinosaurs: {
    id: 'dinosaurs-footprint',
    paragraphs: [
      ({ v }) =>
        `Täna öösel leidsin ${v('sinu', 'teie')} padja alt piimahamba ja jätsin asemele läikiva mündi.`,
      () =>
        'Hommikul leidsime lossi aiast suure jalajälje, mis nägi välja nagu dinosauruse oma. Panin hamba võrdluseks jälje sisse: hammas oli jäljest tuhat korda väiksem, nii et dinosaur oli tõesti väga suur.',
      () =>
        'Nüüd on jälg meie aia uhkus ja iga haldjas käib seda vaatamas.',
    ],
    task: ({ v }) =>
      `Hambahaldja ülesanne: ${v('joonista', 'joonistage')} dinosauruse jalajälg ja ${v('pane', 'pange')} oma jalg selle kõrvale, kas mahub.`,
  },
  books: {
    id: 'books-bookmark',
    paragraphs: [
      ({ v }) =>
        `Täna öösel leidsin ${v('sinu', 'teie')} padja alt piimahamba ja jätsin asemele läikiva mündi.`,
      () =>
        'Hammaste lossi raamatukogus kadus lugejatel pidevalt lehekülg ära. Panin hamba järjehoidjaks: see on väike, sile ja ei kuku kunagi raamatust välja.',
      () =>
        'Nüüd leiab iga haldjas oma kohta üles ja lugu saab õhtul edasi minna.',
    ],
    task: ({ v }) =>
      `Hambahaldja ülesanne: ${v('tee', 'tehke')} endale oma järjehoidja ja ${v('pane', 'pange')} see lemmikraamatusse.`,
  },
  science: {
    id: 'science-magnifier',
    paragraphs: [
      ({ v }) =>
        `Täna öösel leidsin ${v('sinu', 'teie')} padja alt piimahamba ja jätsin asemele läikiva mündi.`,
      () =>
        'Hammaste lossi laboris tahtsime teada, miks hambad nii valged on. Vaatasime hammast läbi suure suurendusklaasi ja leidsime pisikesed jooned, nagu pisikesed teed.',
      () =>
        'Nüüd teame: hammas on kaetud kõige kõvema kihiga, mis meil üldse on. Kirjutasime selle lossi teadusraamatusse.',
    ],
    task: ({ v }) =>
      `Hambahaldja ülesanne: ${v('vaata', 'vaadake')} täna mõnda väikest asja suurendusklaasiga ja ${v('leia', 'leidke')} sealt midagi, mida silmaga ei märka.`,
  },
  pirates: {
    id: 'pirates-treasure',
    paragraphs: [
      ({ v }) =>
        `Täna öösel leidsin ${v('sinu', 'teie')} padja alt piimahamba ja jätsin asemele läikiva mündi.`,
      () =>
        'Hammaste lossi aardekirstu võti oli kadunud ja ükski haldjas ei saanud kirstu lahti. Panin hamba lukuauku ja see keerles täpselt õigesti: klõps!',
      () =>
        'Kirst läks lahti ja sees olid kõik läikivad mündid, mida kogume järgmisteks hammasteks.',
    ],
    task: ({ v }) =>
      `Hambahaldja ülesanne: ${v('peida', 'peitke')} kodus üks läikiv asi ja ${v('joonista', 'joonistage')} sellele aardekaart.`,
  },
}

/** Order in which a child's topics are tried for the topic story. */
export const TOPIC_STORY_ORDER = Object.keys(TOPIC_TOOTH_STORIES) as TopicId[]

/** A small card for the youngest: a sound, a movement, one thing to look at. */
export const TOOTH_TODDLER: Line[] = [
  ({ v }) =>
    `Öösel tulin ${v('sinu', 'teie')} aknale: tipu-tipu! Piimahammas oli padja all. Võtsin hamba ja panin asemele münti. Münt teeb: kling! Kas sina oskad teha: kling?`,
  () =>
    'Lendasin pilve peale: uh-uh-uh! Hammas oli mu kotis nii väike ja valge. Panin hamba lossi kappi. Kapp teeb: klõps! Kas sina oskad teha: klõps?',
  ({ v }) =>
    `Tuul puhus: fuuu! Aga piimahammas jäi ${v('sinu', 'teie')} padja alla. Võtsin selle ja panin asemele münti. Münt kolises: kolks-kolks! Kas sina oskad kolistada?`,
]
