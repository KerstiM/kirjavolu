import type { Scenario } from '../../../domain/story/types'

/**
 * Events of the shared world. Each is told on one day only, to every child who
 * hears it, by the child's own helper – so siblings comparing letters find the
 * same event from different sides, never the same letter twice.
 */
export const WORLD_SCENARIOS: Scenario[] = [
  {
    id: 'reindeer-landing',
    title: 'Välk harjutab maandumist',
    occasions: ['christmas'],
    role: 'standalone',
    world: true,
    tags: ['reindeer', 'snow'],
    tones: ['humorous'],
    variants: {
      older: () => [
        'Põhjapõder Välk on noor ja tal on suur unistus: maanduda töökoja katusele sama pehmelt nagu lumehelves. Teooria on tal suurepärane. Eile õhtul harjutas ta kaksteist korda.',
        'Esimesed üksteist korda maandus ta hanges. Kaheteistkümnendal korral tabas ta katust – täpselt korstna kõrval – ja libises koos poole katuse lumega otse minu ukse ette.',
        'Kui ukse avasin, seisis seal lumest põhjapõder: välja paistsid ainult sarved ja väga uhke nägu. Minu arvates oli see edu. Välk arvab, et homme proovib ta silmad lahti.',
      ],
      young: () => [
        'Oi-oi! Ma ehitasin eile terve päeva lumememme. Tal oli porgandnina, kaks nööpi ja minu vana müts.',
        'Õhtul harjutas põhjapõder Välk katusele maandumist. Ta libises katuselt alla – ja maandus otse minu lumememme peale! Põmm!',
        'Nüüd seisab õues lumememm, kellel on sarved. Porgandi sõi Välk ära. Ma arvan, et nad said sõpradeks.',
      ],
      toddler: () => [
        'Põhjapõder Välk hüppas lumme. Põmm! Ainult sarved paistavad. Välk raputab end: sahh-sahh-sahh! Kas sina oskad ka end raputada?',
      ],
    },
  },
  {
    id: 'porridge-flood',
    title: 'Puder läheb trepist alla',
    occasions: ['christmas'],
    role: 'standalone',
    world: true,
    hooks: ['porridge'],
    tags: ['kitchen', 'porridge'],
    tones: ['humorous'],
    variants: {
      older: (c) => [
        `Töökoja köögis juhtus eile midagi, millest räägitakse veel aastaid. ${c.cast.young} otsustas keeta kogu töökojale hommikuputru – ühe korraga, kõige suuremas katlas.`,
        'Kella kuue paiku kuulsin trepilt kummalist mulksumist. Puder oli katlast välja roninud ja liikus rahulikult trepist alla, nagu oleks tal kuhugi minna.',
        `Peatasime ta alles saali uksel. Jõuluvana sõi kaks kaussi otse trepiastmelt ja ütles, et nii head putru pole ta ammu saanud. ${c.cast.young} on nüüd väga uhke ja natuke kleepuv.`,
      ],
      young: (c) => [
        c.uses('porridge')
          ? 'Ma tahtsin eile kõigile päkapikkudele üllatust teha ja keetsin riisiputru. Sina tead ju ka, et see on pudrudest kõige parem!'
          : 'Ma tahtsin eile kõigile päkapikkudele üllatust teha ja keetsin putru – kõige suuremas katlas!',
        'Ma segasin ja segasin. Aga puder kasvas ja kasvas. Mulks! Mulks! Lõpuks ronis ta üle ääre ja läks trepist alla.',
        'Jõuluvana sõi kaks kaussi otse trepi pealt ja ütles: „Parim puder!“ Minu põsed läksid punaseks. Ja kleepuvaks.',
      ],
    },
  },
  {
    id: 'northern-lights',
    title: 'Virmaliste võistlus',
    occasions: ['christmas'],
    role: 'standalone',
    world: true,
    tags: ['sky', 'night'],
    tones: ['magical', 'heartwarming'],
    variants: {
      older: (c) => [
        'Päkapikkudel on igal talvel võistlus: kes näeb esimesena virmalisi. Võitja saab terve aasta istuda ahju kõrval kõige pehmemal pingil.',
        'Eile õhtul olin kindel, et see aasta on minu oma. Võtsin teki, termose ja prillid ning istusin katusele ootama.',
        `Ärkasin selle peale, et kass Nurr istus mu näo peal ja kogu taevas oli roheline ja lilla. Kaua see kestis, ma ei tea. ${c.cast.young} ütleb, et terve öö. Pingil istub nüüd tema – ja hoiab mulle kõrval kohta.`,
      ],
      young: (c) => [
        'Kas sa tead, mis on virmalised? Need on rohelised ja lillad tuled, mis tantsivad öösel taevas. Eile ma nägin neid!',
        `Kõige naljakam oli see, et ${c.cast.older} istus terve õhtu katusel ja ootas neid. Aga ta jäi magama! Kass Nurr pidi ta üles äratama.`,
        'Mina võitsin virmaliste võistluse ja sain kõige pehmema pingi. Aga ma hoian sellel ka talle kohta. Ta on ju minu sõber.',
      ],
    },
  },
  {
    id: 'cat-in-sack',
    title: 'Nurrub pakk',
    occasions: ['christmas'],
    role: 'standalone',
    world: true,
    tags: ['cat', 'gifts'],
    tones: ['humorous'],
    variants: {
      older: (c) => [
        'Töökoja kass Nurr oli eile terve päeva kadunud. Otsisime teda laudade alt, kappidest ja isegi Jõuluvana saapast.',
        `Õhtul, kui pakkisime kingikotte, märkas ${c.cast.young}, et üks pakk nurrub. Pakk oli väga ilusti pakitud: punane paber, kuldne pael ja silt „Lapimaale“.`,
        'Nurr oli pugenud karpi magama ja keegi oli ta hoolikalt kinni pakkinud. Ta ei olnud üldse pahane. Kui midagi, siis pettunud, et reis ära jäi.',
      ],
      young: () => [
        'Arva ära, mis eile juhtus! Kass Nurr oli kadunud. Me otsisime ja otsisime.',
        'Siis kuulsin, et üks kingipakk teeb: nurr-nurr-nurr. Pakid ju ei nurru! Tegin paela lahti – ja seal ta oligi!',
        'Nurr oli karbis magama jäänud ja keegi oli ta kogemata ära pakkinud. Peaaegu oleks ta Lapimaale sõitnud.',
      ],
      toddler: () => [
        'Kus on kiisu? Kingikotis! Kiisu teeb: nurr-nurr. Kiisu magab. Paitame kiisut: silita-silita.',
      ],
    },
  },
  {
    id: 'gingerbread-house',
    title: 'Piparkoogimaja katus',
    occasions: ['christmas'],
    role: 'standalone',
    world: true,
    tags: ['kitchen', 'reindeer', 'building'],
    tones: ['humorous'],
    variants: {
      older: (c) => [
        'Teeme sel aastal piparkoogidest töökoja mudeli. Seinad on valmis, aknad on suhkrust ja korstnast tuleb vatist suitsu. Probleem on katus.',
        `Katus libiseb maha. Proovisime kuus korda. Mina arvutasin nurgad välja, ${c.cast.young} keetis paksema glasuuri, ja seitsmendal korral jäi katus paigale.`,
        'Täna hommikul oli maja ühel nurgal suur ümmargune auk. Põhjapõder Välk vaatas lakke ja tegi näo, nagu poleks ta elus piparkooki näinud. Tal oli glasuur ninal.',
      ],
      young: () => [
        'Ma keetsin eile kõige paksema glasuuri, mida maailm on näinud. Lusikas jäi sinna püsti!',
        'Sellega kleepisime piparkoogimaja katuse kinni. Varem see muudkui libises maha. Nüüd hoiab!',
        'Aga täna hommikul oli majal üks nurk puudu. Ja põhjapõder Välk vaatas lakke. Tal oli glasuur nina peal. Hmm… kes küll?',
      ],
      toddler: () => [
        'Piparkoogimaja! Seinad, aken ja katus. Mmm, kui hästi lõhnab. Nuusuta: nuuh-nuuh!',
      ],
    },
  },
  {
    id: 'tiny-in-mitten',
    title: 'Pisike päkapikk kindas',
    occasions: ['christmas'],
    role: 'standalone',
    world: true,
    tags: ['tiny', 'cozy'],
    tones: ['heartwarming', 'humorous'],
    variants: {
      older: (c) => [
        `Eile õhtul hõikasid kõik töökojas ühte nime: „${c.cast.tiny}! ${c.cast.tiny}!“ Ta on meist kõige pisem ja kaob vahel ära lihtsalt seepärast, et teda on nii vähe.`,
        'Otsisime riiulitelt, tööpinkide alt ja pudrupotist. Siis kuulsin ahju juurest õrna norskamist.',
        `Ahju ääres kuivas minu vana kinnas. Selle sees, pöidla kohal, magas ${c.cast.tiny} – soe, rahul ja natuke villane. Me ei äratanud teda. Teist kinnast kuivatan nüüd mujal.`,
      ],
      young: (c) => [
        `Eile õhtul kadus ${c.cast.tiny} ära! Ta on nii pisike, et teda on raske leida.`,
        'Me otsisime igalt poolt. Mina vaatasin isegi pudrupotti. Siis kuulsime: norr… norr…',
        'Ta magas ahju ääres kuivava kinda sees! Täpselt pöidla kohal. Nii armas, et keegi ei raatsinud teda äratada.',
      ],
      toddler: () => [
        'Ma pugesin kinda sisse magama. Soe ja pehme! Norr-norr. Kus on sinu pöial? Siin!',
      ],
    },
  },
  {
    id: 'santa-sledding',
    title: 'Jõuluvana laenab kelku',
    occasions: ['christmas'],
    role: 'standalone',
    world: true,
    tags: ['santa', 'snow', 'sled'],
    tones: ['humorous', 'adventurous'],
    variants: {
      older: () => [
        'Jõuluvanal on detsembris väga vähe vaba aega, aga eile kadus ta pärast lõunat kuhugi ära. Töökoda läks ärevaks: kirjad ootavad, kelk ootab, põhjapõdrad ootavad.',
        'Leidsin ta tagumiselt nõlvalt. Ta oli laenanud kelgu, mis on talle umbes kolm korda liiga väike, ja sõitis mäest alla nii, et habe lehvis üle õla.',
        'Mina ei öelnud midagi. Tema ei öelnud ka midagi. Siis ulatas ta mulle kelgunööri ja ütles: „Ainult üks kord.“ Me sõitsime üksteist korda.',
      ],
      young: (c) => [
        'Mu kelk oli eile kadunud! Ma otsisin seda kuuri tagant ja lume alt.',
        'Siis nägin: Jõuluvana sõitis minu kelguga mäest alla! Tema on nii suur ja kelk nii väike, et paistsid ainult habe ja saapad.',
        `Ta ütles, et laenas seda ainult üheks korraks. Aga siis tuli ${c.cast.older} ka ja nad sõitsid üksteist korda. Järgmine kord lähen mina ka järjekorda.`,
      ],
    },
  },
  {
    id: 'blizzard-hares',
    title: 'Jänesed tuisu eest',
    occasions: ['christmas'],
    role: 'standalone',
    world: true,
    tags: ['animals', 'weather'],
    tones: ['heartwarming'],
    variants: {
      older: () => [
        'Eile õhtul tuli tuisk, mille sarnast ma ei mäleta. Aknad olid valged, korsten ulgus ja põhjapõdrad pugesid laudas üksteise vastu.',
        'Keset ööd koputas keegi töökoja uksele. Ukse taga istus jänesepere – ema, isa ja viis poega –, kõik lumest valged. Lasime nad sisse.',
        'Hommikuks olid nad ära söönud kõik porgandid, mis pidid saama lumememmede ninadeks. Lumememmed jäävad sel aastal ninata. Jänesed jäävad talveks puuriida taha elama.',
      ],
      young: () => [
        'Eile oli nii tugev tuisk, et aknast ei paistnud midagi. Huuuu! tegi tuul.',
        'Öösel koputas keegi uksele: kopp-kopp. Ukse taga olid seitse lumist jänest! Lasime nad sooja.',
        'Nad sõid ära kõik lumememmede porgandid. Nüüd elavad nad puuriida taga ja ma viin neile igal hommikul kapsalehti.',
      ],
      toddler: () => [
        'Väljas tuiskab: huuu! Kopp-kopp! Kes tuli? Jänkud tulid! Jänku hüppab: hopp-hopp. Kas sina oskad hüpata nagu jänku?',
      ],
    },
  },
  {
    id: 'ski-race',
    title: 'Suusavõistlus',
    occasions: ['christmas'],
    role: 'standalone',
    world: true,
    tags: ['sport', 'snow'],
    tones: ['humorous', 'adventurous'],
    variants: {
      older: (c) => [
        'Eile oli päkapikkude iga-aastane suusavõistlus ümber Jõuluvana kuusiku. Mina pole kunagi võitnud ega kavatse ka sel aastal sellega alustada.',
        'Valin alati kõige ilusama tee: üle külmunud oja, vana kuuse alt ja läbi kitsa oru, kus lumi sädeleb. See on küll pikem, aga see-eest vaiksem.',
        `Jõudsin finišisse viimasena, kui teised juba kakaod jõid. ${c.cast.young} oli mulle tassi alles hoidnud. Kakao oli küll jahtunud, aga ma ei öelnud talle seda.`,
      ],
      young: (c) => [
        'Eile oli suur suusavõistlus! Mina sõitsin nii kiiresti, et müts lendas peast. Teiseks tulin!',
        'Esimesena jõudis finišisse põhjapõder Välk, kuigi ta ei olnudki võistleja – ta jooksis lihtsalt kogemata rajale.',
        `${c.cast.older} tuli viimasena. Ta ütles, et valis ilusama tee. Mina hoidsin talle kakaotassi alles.`,
      ],
    },
  },
]
