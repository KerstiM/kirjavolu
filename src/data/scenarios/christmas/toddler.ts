import type { Scenario } from '../../../domain/story/types'

/**
 * Letters from the tiniest elf, read aloud by an adult. A child of 1–2 gets the card:
 * one little thing, a sound, a movement, something to look at together. A child of
 * about 3 gets the same episode as a little story (`long`): what happened, how it
 * turned out and something to do together at the end.
 */

const card = (
  id: string,
  title: string,
  tags: string[],
  text: Scenario['variants']['toddler'],
  long: Scenario['readAloud'],
  extra: Partial<Scenario> = {},
): Scenario => ({
  id,
  title,
  occasions: ['christmas'],
  role: 'standalone',
  tags,
  variants: { toddler: text },
  readAloud: long,
  ...extra,
})

export const TODDLER_SCENARIOS: Scenario[] = [
  card(
    'peekaboo-hat',
    'Müts silmadel',
    ['hide'],
    (c) => [
      `Mul on punane müts. Müts vajus silmadele. Kus on ${c.helper}? Ei ole! … Kuku – siin ma olen!`,
    ],
    (c) => [
      'Mul on uus punane müts. See on natuke liiga suur, sest Jõuluvana kudus selle algul endale.',
      `Täna hommikul vajus müts mulle silmadele ja kõik läks pimedaks. Kus on kuusk? Kus on aken? Kus on ${c.helper}? Ei kuskil!`,
      'Siis lükkasin mütsi üles – kuku! Kuusk oli alles ja mina ka. Pane sina ka käed silmadele … ja kuku!',
    ],
  ),
  card(
    'sleigh-bells',
    'Kellukesed',
    ['bells', 'sounds'],
    () => ['Kelgul on kellukesed. Kellukesed teevad: kõlin-kõlin! Raputa käsi ka: kõlin-kõlin!'],
    () => [
      'Jõuluvana kelgul on kaksteist kuldset kellukest. Kui kelk sõidab, teevad nad: kõlin-kõlin-kõlin.',
      'Täna pidin kellukesi puhastama. Ma hõõrusin, kuni nad läikisid nagu päike. Aga kui ma köhatasin, vastasid kõik korraga: kõlin!',
      'Põhjapõdrad arvasid, et on aeg sõitma minna, ja jooksid ukse taha. Raputa käsi – kas sinu kellukesed kõlisevad ka?',
    ],
  ),
  card(
    'snow-crunch',
    'Krõbe lumi',
    ['snow', 'move'],
    () => ['Lumi on valge. Lumi teeb krõps-krõps. Teeme koos: krõps, krõps, krõps!'],
    () => [
      'Öösel sadas palju lund. Hommikul oli õu valge ja pehme nagu suur tekk.',
      'Ma astusin uksest välja ja lumi ütles: krõps! Astusin veel – krõps, krõps! Siis jooksin ja lumi laulis terve laulu: krõps-krõps-krõps-krõps.',
      'Põhjapõder Välk tuli ka. Tema jalad on suured ja tema lumi teeb KRÕPS. Kuidas sinu jalad astuvad? Tasa või valjult?',
    ],
  ),
  card(
    'mandarin',
    'Mandariin',
    ['smell', 'food'],
    () => [
      'Mul on mandariin. Mandariin on oranž ja ümmargune. Nuusuta: mmm! Mandariin on nagu väike päike.',
    ],
    () => [
      'Jõuluvana andis mulle mandariini. See on minust peaaegu sama suur! Ma veeretasin selle oma tuppa: veere, veere.',
      'Siis koorisin ma seda. Koor tuli maha ja terve tuba hakkas lõhnama. Nuusuta ka: mmmm!',
      'Sees olid väikesed viilud nagu päikese kiired. Ühe viilu andsin põhjapõder Välgule. Tema sõi selle koos koorega ära!',
    ],
  ),
  card(
    'tree-lights',
    'Kuusetuled',
    ['lights', 'count'],
    () => ['Kuusel põlevad tuled. Loeme koos kuusetulesid! Üks, kaks, kolm…'],
    () => [
      'Töökoja kuusel on palju tulesid: punased, kollased ja sinised. Õhtul panin ma need põlema.',
      'Siis tahtsin tulesid üle lugeda: üks, kaks, kolm … Ma ronisin oksalt oksale, aga ühel oksal oli nii soe, et jäin magama.',
      'Hommikul äratas mind üks punane tuluke. Loeme koos: mitu tuld teie kodus põleb?',
    ],
  ),
  card(
    'two-mittens',
    'Kaks kinnast',
    ['clothes', 'clap'],
    () => ['Mul on kaks kinnast. Üks kinnas, teine kinnas. Kus on sinu käed? Siin! Plaks-plaks!'],
    () => [
      'Mul on kaks väikest punast kinnast. Üks on paremas käes ja teine vasakus. Nii see peabki olema.',
      'Aga täna oli üks kinnas kadunud! Otsisin kapist ja voodi alt. Lõpuks leidsin selle kass Nurri juurest – Nurr oli võtnud selle endale padjaks.',
      'Nüüd on mul jälle kaks kinnast ja ma saan plaksutada. Kus on sinu käed? Plaksutame koos: plaks-plaks-plaks!',
    ],
  ),
  card(
    'footprints',
    'Jäljed lumel',
    ['snow', 'animals'],
    () => ['Lumel on jäljed. Kelle jäljed need on? Jänku jäljed! Jänku teeb: hopp-hopp.'],
    () => [
      'Hommikul nägin lumel jälgi. Kaks pikka ja kaks ümmargust, ikka ja jälle, hüpates edasi.',
      'Ma läksin jälgedega kaasa: mööda aeda, ümber kuuse ja kuuri taha. Ja kes seal istus? Valge jänku! Ta liigutas nina ja pikki kõrvu.',
      'Jänku ehmus ja hüppas minema: hopp-hopp-hopp. Kuidas jänku kõrvad liiguvad? Näita kätega!',
    ],
  ),
  card(
    'owl-night',
    'Öökull',
    ['night', 'animals', 'sounds'],
    () => ['Öösel on pime. Puu otsas istub öökull. Öökull ütleb: huu-huu! Kas sina oskad ka nii?'],
    () => [
      'Öösel ei tulnud mulle uni. Väljas oli pime ja vaikne. Siis kuulsin: huu-huu!',
      'Vaatasin aknast välja. Kuuse otsas istus öökull Huugo. Tal on suured ümmargused silmad ja ta näeb pimedas kõike.',
      '„Öökullid on öösel ärkvel ja päkapikud magavad,“ ütles Huugo ja laulis mulle unelaulu: huu-huu, huu-huu. Ja ma jäingi magama.',
    ],
  ),
  card(
    'squirrel',
    'Orav',
    ['animals', 'food'],
    () => ['Orav hüppab oksal. Hüpp! Oraval on pähkel. Krõbin-krõbin. Orav sööb.'],
    () => [
      'Õues elab üks väga kiire orav. Tal on kohev saba ja ta hüppab oksalt oksale: hüpp, hüpp!',
      'Täna peitis orav pähkli lume alla. Siis teise pähkli. Siis kolmanda. Aga kui ta tahtis neid üles leida, ei mäletanud ta enam, kuhu need pani!',
      'Mina aitasin otsida. Leidsime kaks. Kolmas on ikka veel kuskil lume all – võib-olla kasvab sellest kevadel puu.',
    ],
  ),
  card(
    'teddy-hug',
    'Kaisukaru',
    ['cozy'],
    () => ['Ma kallistasin kaisukaru. Kaisukaru on pehme ja soe. Kallista sina ka oma kaisulooma!'],
    () => [
      'Minu voodis elab väike kaisukaru. Ta on pruun, tal on üks nööpsilm ja üks lapitud kõrv.',
      'Täna oli kaisukaru kurb, sest ta oli terve päeva üksi. Ma võtsin ta sülle ja kallistasin tugevalt-tugevalt. Kohe läks ta soojaks ja pehmeks.',
      'Õhtul magasime koos. Kas sinul on ka kaisuloom? Anna talle täna üks suur kalli.',
    ],
  ),
  card(
    'so-big',
    'Nii suur!',
    ['move'],
    (c) => [
      `Kui suur on ${c.name}? Nii suur! Sirutame käed üles – kõrgele, kõrgele!`,
    ],
    (c) => [
      'Mina olen väga väike päkapikk. Ma mahun sussi sisse ja tassi sisse. Kui ma teistega räägin, pean tooli peale ronima.',
      `Aga ${c.name} on minust palju suurem! Kui me kõrvuti seisaksime, ulataksin sulle vaevalt põlveni.`,
      'Sirutame käed: kõrgele, kõrgele, veel kõrgemale! Ja nüüd teeme end pisikeseks nagu mina – kägarasse!',
    ],
    // One "how big you are" letter is enough: it and siblings-big exclude each other.
    { establishes: ['size-told'], until: 'size-told' },
  ),
  card(
    'peppa-puddle',
    'Peppa ja lombid',
    ['peppa', 'snow', 'move'],
    () => [
      'Põrsas Peppa armastab lompe. Plärts! Talvel on lombid jääs, siis kukub Peppa hoopis lumme: pläts! Plaksutame koos: pläts!',
    ],
    () => [
      'Kas sa tead, kes armastab lompe? Põrsas Peppa! Tema hüppab lombis nii, et vesi pritsib: plärts!',
      'Ma tahtsin ka lombis hüpata. Aga talvel on lombid jääs. Ma hüppasin – ja libisesin: vuhh! – otse lumehange.',
      'Lumi pritsis ka! Pläts! See oli peaaegu sama lõbus kui lomp. Teeme koos: üks, kaks, kolm – pläts! – ja plaksutame käsi.',
    ],
    { hooks: ['peppa'], onlyWithHook: true },
  ),
  card(
    'peppa-sounds',
    'Kes ütleb röh-röh?',
    ['peppa', 'animals', 'sounds'],
    () => [
      'Kes ütleb: röh-röh? Põrsas, nagu Peppa! Kes ütleb: mjäu? Kiisu! Kes ütleb: mõmm? Karu!',
    ],
    () => [
      'Täna mängisime laudas äraarvamismängu. Ma panin silmad kinni ja kuulasin.',
      'Keegi ütles: mää! See oli lammas. Keegi ütles: muu! See oli lehm. Ja siis ütles keegi: röh-röh!',
      '„Põrsas Peppa?“ küsisin ma. Aga ei – see oli põhjapõder Välk, kes oli õppinud põrsast mängima. Kes ütleb mjäu? Mängi sina ka!',
    ],
    { hooks: ['peppa'], onlyWithHook: true },
  ),
  card(
    'snowman',
    'Lumememm',
    ['snow', 'building'],
    () => ['Me tegime lumememme. Suur pall, väike pall ja porgandnina. Lumememm naeratab!'],
    () => [
      'Me tegime täna lumememme. Kõigepealt veeretasime suure palli – nii suure, et ma ei näinud üle selle.',
      'Siis tegime keskmise palli ja väikese palli. Väikese palli tõstis üles põhjapõder Välk, sest mina ei ulatunud.',
      'Lumememm sai söest silmad ja porgandist nina ning naeratas. Aga porgandi sõi Välk õhtul ära – nüüd on lumememmel käbinina.',
    ],
  ),
  card(
    'heart-cookie',
    'Südamega piparkook',
    ['kitchen', 'food'],
    () => ['Ma küpsetasin piparkoogi. Piparkook on südame kujuga. Süda on sulle! Mõnus-mõnus.'],
    () => [
      'Täna küpsetasin piparkooke. Ma segasin taina, rullisin selle lapikuks ja võtsin kõige ilusama vormi – südame.',
      'Ahjus kasvas piparkook natuke suuremaks ja läks pruuniks. Terve köök lõhnas: mmm, kaneel ja mesi!',
      'Ühele südamele tegin valge glasuuriga triibud. Seda tehes mõtlesin sinu peale. Kas sina ka küpsetad sel nädalal piparkooke?',
    ],
  ),
  card(
    'sledding',
    'Kelgusõit',
    ['sled', 'move'],
    () => ['Kelk sõidab mäest alla: vuhh! Hoia kinni! Ja jälle üles: tõmba-tõmba.'],
    () => [
      'Mul on väike punane kelk. Täna vedasin selle mäe otsa: tõmba-tõmba-tõmba. Mägi oli kõrge ja ma olin väsinud.',
      'Siis istusin kelgule ja – vuhh! – sõitsin alla nii kiiresti, et tutt lehvis. Kelk sõitis otse lumehange ja jäi seisma.',
      'Ma ronisin välja, lumi kõrvades ja ninal. Ja siis? Jälle üles! Hoia kinni – vuhh!',
    ],
  ),
  card(
    'bubbles',
    'Mullid',
    ['bath'],
    () => ['Ma käisin vannis. Mullid! Puhu mulli: puhh! Mull lendab ära.'],
    () => [
      'Õhtul käisin vannis. Päkapiku vann on üks suur teetass. Ma panin vette vahtu ja vaht kasvas ja kasvas.',
      'Siis puhusin mulle: puhh! Üks mull lendas lakke. Teine lendas kass Nurrile ninale – plõks! Nurr aevastas ja jooksis minema.',
      'Mullid olid ümmargused ja sätendasid. Puhu sina ka: puhh! Kuhu sinu mull lendab?',
    ],
  ),
  card(
    'goodnight-moon',
    'Head ööd, kuu',
    ['night', 'sky'],
    () => ['Õhtul paistab kuu. Kuu on ümmargune ja kollane. Lehvita kuule: head ööd, kuu!'],
    () => [
      'Täna õhtul oli taevas kuu. Ta oli suur, ümmargune ja kollane nagu pannkook.',
      'Ma istusin aknalauale ja vaatasin teda. Kuu vaatas mind ka. Ta paistis lumele ja lumi hakkas sätendama.',
      'Siis ütlesin: „Head ööd, kuu! Head ööd, lumi! Head ööd, kuusk!“ Ütleme koos head ööd kõigele, mis sinu toas on.',
    ],
  ),
  card(
    'pot-drum',
    'Potitrumm',
    ['music', 'sounds'],
    () => ['Mul on pott ja lusikas. Bumm-bumm! Kas sina oskad ka trummi lüüa? Bumm-bumm-bumm!'],
    (c) => [
      'Köögis on palju potte. Täna võtsin ma ühe poti ja puulusika ja lõin: bumm!',
      'Siis võtsin väikese poti: tinn! Ja kaane: kõmm! Ja tühja purgi: tikk-tikk! Varsti mängis terve köök.',
      `${c.cast.young} pani käed kõrvadele, aga jalg tal ikka tammus kaasa. Bumm-bumm-tinn! Mis sinu kodus kõlab nagu trumm?`,
    ],
  ),
  card(
    'frost-flowers',
    'Jäälilled',
    ['weather'],
    () => [
      'Aknal on jäälilled. Need on valged ja sätendavad. Puhu aknale: hhhh! Nüüd on aken udune.',
    ],
    () => [
      'Täna hommikul olid aknal jäälilled. Need olid valged ja sätendavad, nagu keegi oleks öösel klaasile joonistanud.',
      'Ma vaatasin lähemalt. Üks lill oli nagu sulg, teine nagu kuusk ja kolmas nagu väike täht.',
      'Siis puhusin aknale: hhhh! Klaas läks uduseks ja ma tegin sõrmega naerunäo. Teeme koos? Ring, kaks silma ja suur naeratus.',
    ],
  ),
  card(
    'reindeer-nose',
    'Välgu nina',
    ['reindeer'],
    () => [
      'Põhjapõder Välk sööb samblikku. Matsu-matsu. Välgul on suur nina. Näita, kus on sinu nina!',
    ],
    () => [
      'Põhjapõder Välk on minu sõber. Tal on suured sarved, pikad jalad ja väga suur nina.',
      'Täna andsin talle samblikku. Välk sõi: matsu-matsu-matsu. Siis nuusutas ta mind oma suure ninaga – nuuh! – ja mu müts lendas peast.',
      'Ma naersin ja panin mütsi tagasi. Näita, kus on sinu nina! Ja kus on sinu kõrvad?',
    ],
  ),
  card(
    'siblings-big',
    'Suured õed-vennad',
    ['siblings'],
    (c) => [`${c.siblings} on suured. Ja ${c.name}? ${c.name} on ka juba suur! Nii suur!`],
    (c) => [
      `${c.siblings} ${c.siblingCount > 1 ? 'on juba suured lapsed' : 'on juba suur laps'}. Aga tead mis? ${c.name} kasvab ka iga päevaga.`,
      'Mina olen nii pisike, et kui ma kellegi kõrval seisan, ulatun talle umbes varbani. Pean pea kuklasse ajama, et näha, kus nina on.',
      `Mõõdame: sirutame käed üles – nii suur! Varsti ulatub ${c.name} ise kuuse otsa tähte panema.`,
    ],
    { needsSiblings: true, establishes: ['size-told'], until: 'size-told' },
  ),
  card(
    'siblings-wave',
    'Lehvita',
    ['siblings'],
    (c) => [`Kus on ${c.siblings}? Lehvitame neile: tšau-tšau!`],
    (c) => [
      'Kui ma täna öösel kirja tõin, magasid kõik. Ma lehvitasin vaikselt igale magajale: tšau-tšau!',
      'Aga keegi ei näinud, sest kõik magasid ja mina olen nii väike. Ronisin aknalauale ja lehvitasin kahe käega. Ikka ei näinud!',
      `Lõpuks lehvitas mulle vastu kuu – või nii mulle tundus. Kui ${c.siblings} täna ${c.siblingCount > 1 ? 'ärkavad' : 'ärkab'}, lehvita ${c.siblingCount > 1 ? 'neile' : 'talle'}: tšau-tšau!`,
    ],
    { needsSiblings: true },
  ),
  card(
    'siblings-face',
    'Naljakas nägu',
    ['siblings'],
    (c) => [`Päkapikud teevad naljaka näo: põsed paisu! Tee sina ka! Kas ${c.siblings} ${c.siblingCount > 1 ? 'teevad' : 'teeb'} ka? Hi-hi-hii.`],
    (c) => [
      `Töökojas oli eile naljakate nägude võistlus. ${c.cast.young} ja ${c.cast.older} said kõige rohkem naeru.`,
      'Üks nägu oli selline: põsed paisu nagu õhupall. Teine nägu: keel väljas ja silmad kõõrdi. Ma naersin nii, et kukkusin sussist välja.',
      `Tee sina ka kõige naljakam nägu! Ja nüüd kõige rõõmsam nägu. Kas ${c.siblings} ${c.siblingCount > 1 ? 'oskavad' : 'oskab'} ka? Hi-hi-hii!`,
    ],
    { needsSiblings: true },
  ),
  card(
    'siblings-hide',
    'Peitus',
    ['siblings', 'hide'],
    (c) => [`Mängime peitust! Käed silmadele: üks, kaks, kolm … kuku! Kas ${c.siblings} ${c.siblingCount > 1 ? 'mängivad' : 'mängib'} ka?`],
    (c) => [
      'Eile mängisime töökojas peitust. Ma peitsin end ühe sussi sisse ja lugesin: üks, kaks, kolm.',
      `Siis tulid ${c.cast.young} ja ${c.cast.older} ja otsisid: kapist, laua alt ja kardina tagant. Aga sussi sisse keegi ei vaadanud!`,
      `Lõpuks ma aevastasin: atšihh! Ja mind leiti. Mängige täna ka peitust – sina ja ${c.siblings}. Kes peidab, kes otsib?`,
    ],
    { needsSiblings: true },
  ),
]
