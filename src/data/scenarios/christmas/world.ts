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
    more: {
      older: () => [
        'Täna tegi ta seda. Kolmeteistkümnes katse oli nagu raamatus: neli kabjaplaksu katusel, natuke lund ja siis vaikus. Välk vaatas alla, kas keegi nägi. Mina nägin. Plaksutasin aknast nii kõvasti, et kass Nurr kukkus diivanilt. Nüüd tahab Välk harjutada maandumist korstnale. Seda ma talle veel ei soovita.',
      ],
      young: () => [
        'Täna hommikul seisid nad õues kahekesi: Välk ja sarvedega lumememm. Välk tõi talle vabanduseks uue porgandi. Siis harjutas Välk veel natuke ja maandus seekord ilusti katusele. Ainult natuke lund kukkus. Ja see kukkus otse minu kraesse. Brr!',
      ],
    },
    variants: {
      older: () => [
        'Põhjapõder Välk on noor ja tal on suur unistus: maanduda töökoja katusele sama pehmelt nagu lumehelves. Teooria on tal suurepärane. Eile õhtul harjutas ta kaksteist korda.',
        'Esimesed üksteist korda maandus ta hanges. Kaheteistkümnendal korral tabas ta katust – täpselt korstna kõrval – ja libises koos poole katuse lumega otse minu ukse ette.',
        'Kui ukse avasin, seisis seal lumest põhjapõder: välja paistsid ainult sarved ja väga uhke nägu. Minu arvates oli see edu. Välk arvab, et homme proovib ta silmad lahti.',
      ],
      young: () => [
        'Oi-oi! Ma ehitasin eile terve päeva lumememme. Tal oli porgandnina, kaks nööpi ja minu vana müts.',
        'Õhtul harjutas põhjapõder Välk katusele maandumist. Ta libises katuselt alla – otse mu lumememme peale ukse ees! Põmm!',
        'Välk ronis välja, aga lumememme pähe jäid kaks oksa nagu sarved. Porgandi sõi Välk ära. Nad said sõpradeks.',
      ],
      toddler: () => [
        'Põhjapõder Välk hüppas lumme: põmm! Ainult sarved paistsid. Välk raputas end: sahh-sahh! Jälle terve! Raputa sina ka end!',
      ],
    },
    readAloud: () => [
      'Põhjapõder Välk õpib lendama. Täna harjutas ta katusele maandumist. Ta jooksis, hüppas ja tõusis õhku – vuhh!',
      'Aga maandumine ei läinud hästi. Välk kukkus otse suurde lumehange: põmm! Hangest paistsid välja ainult tema sarved.',
      'Siis ronis ta välja ja raputas end: sahh-sahh-sahh! Lumi lendas mulle näkku ja me naersime mõlemad. Raputa sina ka!',
    ],
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
    more: {
      older: () => [
        'Täna hommikul oli trepp jälle puhas. Selleks kulus neli päkapikku, kaks ämbrit ja kass Nurr, kes lakkus ära kõik, mis meie harjade eest ära jõudis. Köögi uksel ripub nüüd uus silt: „Suur katel ainult koos vanema päkapikuga.“ Vanem päkapikk olen mina. Homme keedame koos.',
      ],
      young: (c) => [
        `Täna pesime treppi. Mina pesin, ${c.cast.older} pesi ja kass Nurr lakkus. Nurr oli kõige kiirem. Nüüd ripub köögiuksel silt: „Suurt katelt tohib kasutada ainult koos vanema päkapikuga!“ Homme keedame koos: ${c.cast.older} ja mina. Ta lubas, et mina saan putru segada.`,
      ],
    },
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
    more: {
      older: (c) => [
        `Täna õhtul lähen uuesti katusele, seekord ilma tekita, et mitte magama jääda. ${c.cast.young} lubas tulla kahe tassi kakaoga. Virmalisi ei pruugi tulla, aga see ei olegi kõige tähtsam. Ma ei mäleta, millal ma viimati lihtsalt taevast vaatasin koos kellegagi, kes ei kiirusta.`,
      ],
      young: (c) => [
        `Täna õhtul läheme katusele mõlemad. Mina võtan kaks tassi kakaod. ${c.cast.older} jätab teki seekord maha, et mitte magama jääda. Ma ütlesin talle, et kui ta jälle magama jääb, äratan ta kohe, kui taevas roheliseks läheb. Kass Nurr tuleb ka. Tema on meie äratuskell.`,
      ],
    },
    variants: {
      older: (c) => [
        'Päkapikkudel on igal talvel võistlus: kes näeb esimesena virmalisi. Võitja saab terve aasta istuda ahju kõrval kõige pehmemal pingil.',
        'Eile õhtul olin kindel, et see aasta on minu oma. Võtsin teki, termose ja prillid ning istusin katusele ootama.',
        `Ärkasin selle peale, et kass Nurr istus mu näo peal ja kogu taevas oli roheline ja lilla. Kaua see kestis, ma ei tea. ${c.cast.young} ütleb, et terve öö. Pingil istub nüüd tema – ja hoiab mulle kõrval kohta.`,
      ],
      young: (c) => [
        'Kas sa tead, mis on virmalised? Need on rohelised ja lillad tuled öösel taevas. Eile ma nägin neid!',
        `Kõige naljakam oli see, et ${c.cast.older} istus terve õhtu katusel ja ootas neid. Aga ta jäi magama! Kass Nurr pidi ta üles äratama.`,
        'Kes näeb virmalisi esimesena, saab päkapikkude võistlusel auhinnaks kõige pehmema pingi. Selle sain mina! Aga ma hoian sõbrale ka kohta.',
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
    more: {
      older: (c) => [
        `Täna hommikul leidsin Nurri jälle kingikottide juurest. Seekord istus ta karbi kõrval ja vaatas mind väga tähtsalt, nagu ootaks oma paberit ja paela. Siis tegi ${c.cast.young} talle ahju juurde oma karbi, vana tekiga, ja mina kirjutasin sildi: „Mitte saata“. Nurr magab seal juba kolm tundi.`,
      ],
      young: (c) => [
        `Pärast seda tegin Nurrile oma karbi. Sees on pehme tekk ja peal silt, mille kirjutas ${c.cast.older}: „Mitte saata“. Nurrile see meeldis. Ta magas seal terve öö ja nurrus nii kõvasti, et karp värises. Hommikul käis ta kõiki pakke nuusutamas. Vist kontrollis, et kuskil poleks veel mõnda kassi.`,
      ],
    },
    variants: {
      older: (c) => [
        'Töökoja kass Nurr oli eile terve päeva kadunud. Otsisime teda laudade alt, kappidest ja isegi Jõuluvana saapast.',
        `Õhtul, kui pakkisime kingikotte, märkas ${c.cast.young}, et üks pakk nurrub. Pakk oli väga ilusti pakitud: punane paber, kuldne pael ja silt ühe väikese tüdruku nimega.`,
        'Nurr oli pugenud karpi magama ja keegi oli ta hoolikalt kinni pakkinud. Ta ei olnud üldse pahane. Kui midagi, siis pettunud, et ta jõuluööl kingina reisile ei saanud.',
      ],
      young: () => [
        'Arva ära, mis eile juhtus! Kass Nurr oli kadunud. Me otsisime ja otsisime.',
        'Siis kuulsin, et üks kingipakk teeb: nurr-nurr-nurr. Pakid ju ei nurru! Tegin paela lahti – ja seal ta oligi!',
        'Nurr oli karbis magama jäänud ja keegi oli ta kogemata ära pakkinud. Peaaegu oleks ta jõulukingina ühe lapse juurde sõitnud.',
      ],
      toddler: () => [
        'Kiisu Nurr oli kadunud! Otsisime, otsisime … Kingikotis! Seal ta magas: nurr-nurr. Paitame kiisut: silita-silita.',
      ],
    },
    readAloud: () => [
      'Töökoja kiisu Nurr oli kadunud. Me hüüdsime: „Nurr! Nurr!“ Aga keegi ei tulnud.',
      'Siis kuulsin, et üks kingipakk teeb häält: nurr-nurr-nurr. Kingipakk, mis nurrub? Ma tegin paela lahti ja piilusin sisse.',
      'Seal magas Nurr, kerra tõmmatud nagu soe sall. Välja ta tulla ei tahtnudki. Silitame kiisut: silita, silita … nurr.',
    ],
  },
  {
    id: 'gingerbread-house',
    title: 'Piparkoogimaja katus',
    occasions: ['christmas'],
    role: 'standalone',
    world: true,
    tags: ['kitchen', 'reindeer', 'building'],
    tones: ['humorous'],
    more: {
      older: (c) => [
        `Täna parandasime nurga ära. Uue nurga tegi ${c.cast.young} ja sinna sai ka väike rõdu, millel istub suhkrust põhjapõder. Välk vaatas seda kaua. Siis läks ta tallist välja ja tuli tagasi ühe porgandiga, mille pani maja ette. Ma võtan seda vabandusena.`,
      ],
      young: (c) => [
        `Täna tegime uue nurga ja sinna sai väike rõdu. Rõdul istub suhkrust põhjapõder. Välk vaatas seda kaua ja tõi siis maja ette porgandi. Vabanduseks, muidugi. ${c.cast.older} ütles, et nüüd on meil maailma esimene piparkoogimaja koos porgandiga.`,
      ],
    },
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
        'Piparkoogimaja katus kukkus: pauh! Panime selle uuesti peale. Nüüd püsib! Mmm, kui hästi lõhnab. Nuusuta: nuuh-nuuh!',
      ],
    },
    readAloud: () => [
      'Me ehitasime piparkoogimaja. Seinad on piparkoogist, aknad suhkrust ja uks šokolaadist.',
      'Katus tahtis muudkui maha libiseda. Panime glasuuri ja hoidsime kinni: üks, kaks, kolm … ja katus jäi paigale!',
      'Hommikul oli majal üks nurk ära näritud. Põhjapõder Välk vaatas lakke ja tema ninaots oli valge. Nuusuta – kas teie kodus lõhnab ka piparkookide järele?',
    ],
  },
  {
    id: 'tiny-in-mitten',
    title: 'Pisike päkapikk kindas',
    occasions: ['christmas'],
    role: 'standalone',
    world: true,
    tags: ['tiny', 'cozy'],
    tones: ['heartwarming', 'humorous'],
    more: {
      older: (c) => [
        `Hommikul ärkas ${c.cast.tiny} ega saanud alguses aru, kus ta on. Ta ronis kindast välja, haigutas ja küsis, miks kõik teda vaatavad. Nüüd on tal oma kinnas, mille sisse õmblesin väikese padja. See ripub ahju kõrval naela otsas, sildiga: „Kinni, magab.“`,
      ],
      young: (c) => [
        `Hommikul ronis ${c.cast.tiny} kindast välja ja haigutas nii suurelt, et kõik naersid. Tema ei saanud aru, miks. Nüüd on tal oma kinnas, mis ripub ahju kõrval ja mille sees on pisike padi. Kui kinnas norskab, räägime sosinal.`,
      ],
    },
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
        'Ma pugesin kinda sisse magama. Norr-norr! Keegi ei leidnud mind. Siis pistsin pöidla välja: kuku! Kus on sinu pöial? Siin!',
      ],
    },
    readAloud: () => [
      'Eile õhtul olin ma väga väsinud. Otsisin sooja kohta, kus magada.',
      'Ahju juures kuivas üks suur villane kinnas. Ma pugesin selle sisse, otse pöidla kohale. Seal oli soe ja pehme ja ma jäin kohe magama: norr-norr.',
      'Teised päkapikud otsisid mind terve õhtu! Lõpuks kuulsid nad mu norskamist. Kus on sinu pöial? Peida see pihku ja otsime!',
    ],
  },
  {
    id: 'santa-sledding',
    title: 'Jõuluvana laenab kelku',
    occasions: ['christmas'],
    role: 'standalone',
    world: true,
    tags: ['santa', 'snow', 'sled'],
    tones: ['humorous', 'adventurous'],
    more: {
      older: () => [
        'Täna hommikul istus Jõuluvana jälle laua taga ja kirjutas kirju, nagu poleks midagi juhtunud. Aga tema saabaste ümber oli väike lumelomp ja põsed olid veel punased. Kui talle teed tõin, pilgutas ta mulle silma. Väike kelk seisab nüüd kuuri ukse kõrval. Keegi on selle sinna valmis pannud.',
      ],
      young: () => [
        'Täna hommikul oli minu kelk kuuri ukse juures tagasi. Selle peal oli väike kiri: „Aitäh laenamast! Jõuluvana.“ Ja kelgunööri külge oli seotud punane lehv. Nüüd on minu kelk kõige pidulikum kelk terves töökojas.',
      ],
    },
    variants: {
      older: () => [
        'Jõuluvanal on detsembris väga vähe vaba aega, aga eile kadus ta pärast lõunat kuhugi ära. Töökoda läks ärevaks: kirjad ootavad, kelk ootab, põhjapõdrad ootavad.',
        'Leidsin ta tagumiselt nõlvalt. Ta oli laenanud kelgu, mis on talle umbes kolm korda liiga väike, ja sõitis mäest alla nii, et habe lehvis üle õla.',
        'Mina ei öelnud midagi. Tema ei öelnud ka midagi. Siis ulatas ta mulle kelgunööri ja ütles: „Ainult üks kord.“ Me sõitsime üksteist korda.',
      ],
      young: (c) => [
        'Mu kelk oli eile kadunud! Ma otsisin seda kuuri tagant ja lume alt.',
        'Siis nägin: Jõuluvana sõitis minu kelguga mäest alla! Tema on nii suur ja kelk nii väike, et paistsid ainult habe ja saapad.',
        `Ta ütles, et laenas seda ainult üheks korraks. Aga siis tuli ${c.cast.older} ka ja nad sõitsid üksteist korda. Järgmine kord tahan mina ka kelguga sõita!`,
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
    more: {
      older: () => [
        'Täna hommikul läksin puuriida taha vaatama. Jänesed olid lume sisse kaevanud käigud ja ühes otsas oli midagi väikese tagatoa sarnast. Viis poega magasid seal reas nagu soojad kartulid. Ema vaatas mind ja liigutas kõrvu. Viisin neile kapsalehti. Sel talvel on meil seitse uut naabrit.',
      ],
      young: () => [
        'Täna hommikul nägin, et kõige väiksem jänesepoeg on julge. Ta tuli minu juurde ja nuusutas mu saabast. Siis sõi ta kapsalehe otse mu käest. Panin talle nimeks Hopsti. Teistele ma veel nime ei pannud, sest nad hüppavad nii kiiresti, et ma ei tea, kes on kes.',
      ],
    },
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
        'Väljas tuiskas: huuu! Kopp-kopp! Jänkud tulid sooja! Nad jäid meile külla. Teeme jänkukõrvad: käed pea peale!',
      ],
    },
    readAloud: () => [
      'Eile õhtul tuli tuisk. Tuul puhus: huuu-huuu! Aknast ei paistnud midagi, ainult valge.',
      'Siis koputas keegi uksele: kopp-kopp-kopp. Tegin ukse lahti ja seal olid jänkud – ema, isa ja pisikesed jänkupojad, kõik lumised.',
      'Me lasime nad sooja. Nad sõid porgandeid ja magasid ahju ääres. Hommikul hüppasid nad õue: hopp, hopp, hopp! Kuidas jänku kõrvad liiguvad? Näita kätega!',
    ],
  },
  {
    id: 'ski-race',
    title: 'Suusavõistlus',
    occasions: ['christmas'],
    role: 'standalone',
    world: true,
    tags: ['sport', 'snow'],
    tones: ['humorous', 'adventurous'],
    more: {
      older: () => [
        'Täna hommikul tegin oma ilusast teest kaardi ja panin selle töökoja seinale. Kaardil on oja, vana kuusk ja kitsas org ning nende juures on kirjas, mida sealt näeb. Kolm noort päkapikku küsisid juba, kas võivad järgmisel aastal minuga koos sõita. Võivad. Aga kakao tuleb võtta termosega.',
      ],
      young: (c) => [
        `Täna hommikul läksin ka ise seda ilusat teed vaatama. Seal on külmunud oja, mis klõbiseb, ja vana kuusk, mille all on nii vaikne, et kuuled oma südant. Nüüd tean, et ${c.cast.older} rääkis tõtt: see tee on ilus. Järgmisel aastal sõidame koos. Mina kiiresti, tema aeglaselt, ja kohtume kakao juures.`,
      ],
    },
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
