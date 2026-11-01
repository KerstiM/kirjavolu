import type { ChildProfile } from '../domain/models'

/**
 * Topics a parent picks for a child from a list. Free text cannot be woven into a
 * story without a language model (the words would not decline, and nothing would
 * know what happens around them), so every topic here comes with hand-written
 * story pieces. The scenarios in data/scenarios/…/topics.ts build whole letters
 * around them; hand-written scenarios can also check for a topic (`c.uses('rubik')`).
 */

export type TopicGroupId =
  | 'puzzles'
  | 'science'
  | 'nature'
  | 'sport'
  | 'creative'
  | 'play'
  | 'characters'
  | 'food'

export const TOPIC_GROUPS: { id: TopicGroupId; label: string }[] = [
  { id: 'play', label: 'Mängud ja lood' },
  { id: 'nature', label: 'Loomad ja loodus' },
  { id: 'sport', label: 'Sport ja liikumine' },
  { id: 'creative', label: 'Loovus' },
  { id: 'science', label: 'Ehitamine ja teadus' },
  { id: 'puzzles', label: 'Nuputamine' },
  { id: 'characters', label: 'Multikategelased' },
  { id: 'food', label: 'Lemmiktoidud' },
]

export type TopicId =
  | 'rubik'
  | 'riddles'
  | 'codes'
  | 'chess'
  | 'boardgames'
  | 'lego'
  | 'space'
  | 'science'
  | 'robots'
  | 'dinosaurs'
  | 'animals'
  | 'cats'
  | 'dogs'
  | 'horses'
  | 'nature'
  | 'football'
  | 'swimming'
  | 'cycling'
  | 'skating'
  | 'skiing'
  | 'dance'
  | 'drawing'
  | 'music'
  | 'crafts'
  | 'baking'
  | 'books'
  | 'comics'
  | 'cars'
  | 'trains'
  | 'dolls'
  | 'pirates'
  | 'knights'
  | 'princesses'
  | 'superheroes'
  | 'peppa'
  | 'pawpatrol'
  | 'frozen'
  | 'porridge'
  | 'pancakes'
  | 'icecream'

export interface Topic {
  id: TopicId
  /** Shown on the profile form and in parent-facing summaries. */
  label: string
  group: TopicGroupId
  /** Finds the topic in free-text profile fields (older profiles, "Muud huvid"). */
  match: RegExp
  /** Finds the topic in a written letter, so the validator can report an unplanned mention. */
  mentions: RegExp
  /** The helper tries the child's interest on a free evening: two or three sentences, first person. */
  tryout: string
  /** Reindeer Välk has caught the same interest: two or three sentences. */
  reindeer: string
  /** One-line versions of the same two stories for the smallest children. */
  toddlerTryout: string
  toddlerReindeer: string
}

export const TOPICS: Topic[] = [
  // Nuputamine
  {
    id: 'rubik',
    label: 'Rubiku kuubik',
    group: 'puzzles',
    match: /rubik|kuubik/i,
    mentions: /(?<!jää)kuubik/i,
    tryout:
      'Võtsin kätte Rubiku kuubiku. Keerasin üles, alla ja vasakule ning sain ühe tahu peaaegu valmis. Siis aevastasin ja kuubik kukkus kuuse alla, kõik värvid jälle segamini.',
    reindeer:
      'Ta oli leidnud kusagilt Rubiku kuubiku ja lükkas seda ninaga ühest küljest teisele. Ühe tahu sai ta täiesti punaseks. Sellest ajast kõnnib ta ringi, nina püsti.',
    toddlerTryout: 'Mul on kirju kuubik. Keeran – kõik värvid on segamini! Keeran veel – üks pool on punane!',
    toddlerReindeer: 'Põhjapõder Välk leidis kirju kuubiku. Ta keeras seda ninaga: klõps-klõps! Kas sina oskad keerata?',
  },
  {
    id: 'riddles',
    label: 'Mõistatused',
    group: 'puzzles',
    match: /mõistatus|nuputa|nuputamis/i,
    mentions: /mõistatusesõb|nuputaja/i,
    tryout:
      'Kirjutasin ise ühe mõistatuse: „Mis on valge ja külm ning kaob, kui seda soojas käes hoida?“ Lugesin selle töökojas ette ja kõik päkapikud hüüdsid kohe: „Lumi!“ Järgmine tuleb raskem.',
    reindeer:
      'Ta on hakanud mõistatusi esitama. Eile seisis ta ukse ees ega lasknud mind sisse, enne kui ütlesin, kellel on neli jalga ja suured sarved. Vastus oli muidugi tema ise.',
    toddlerTryout: 'Arva ära: see on valge ja külm ja langeb taevast. Mis see on? Lumi!',
    toddlerReindeer: 'Välk küsis: kellel on suured sarved ja pikad jalad? Ja naeris: mul endal!',
  },
  {
    id: 'codes',
    label: 'Salakoodid',
    group: 'puzzles',
    match: /salakood|kood|šifr|salakiri/i,
    mentions: /salakoodi|koodimeist/i,
    tryout:
      'Kirjutasin Jõuluvanale salakoodis sõnumi: iga tähe asemel number. Jõuluvana nuputas terve õhtu ja küsis lõpuks, kas see on piparkoogi retsept. Ei olnud. See oli „head ööd“.',
    reindeer:
      'Ta koputab sõrgadega vastu laudaust: kolm lühikest ja üks pikk. Arvan, et see on salakood. Ma pole veel aru saanud, mida see tähendab, aga iga kord pärast seda kaob üks porgand.',
    toddlerTryout: 'Ma koputan: kopp-kopp-kopp. See on minu salakood. See tähendab: tere! Koputa vastu!',
    toddlerReindeer: 'Välk koputab sõrgaga: kopp, kopp! See on tema salakood. Ta tahab porgandit!',
  },
  {
    id: 'chess',
    label: 'Male',
    group: 'puzzles',
    match: /\bmale\b|\bmalet\b|malend|šahh|šahm/i,
    mentions: /\bmale\b|\bmalet\b|malenup|malend/i,
    tryout:
      'Õppisin malet mängima. Ratsu käib nagu L-täht, ettur ainult otse ja kuningas väga ettevaatlikult. Mängisin Jõuluvanaga ja kaotasin kolme käiguga. Ta ütles, et sada aastat harjutamist aitab.',
    reindeer:
      'Ta seisab malelaua kõrval ja lükkab ninaga ratsut. Ainult ratsut, sest see on ainus nupp, millel on nina. Kui ratsu kukub, vaatab ta mind, nagu oleks see minu süü.',
    toddlerTryout: 'Malelaual on mustad ja valged ruudud. Hüppan ruudult ruudule: hopp, hopp!',
    toddlerReindeer: 'Välk vaatas malelauda ja lükkas ninaga ühe nupu ümber. Kukk! Nüüd on sinu kord.',
  },
  {
    id: 'boardgames',
    label: 'Lauamängud',
    group: 'puzzles',
    match: /lauamäng|täring|kaardimäng|monopol|alias/i,
    mentions: /lauamäng|täring/i,
    tryout:
      'Mängisime päkapikkudega lauamängu. Viskasin täringuga kolm kuut järjest ja jõudsin peaaegu lõppu. Siis astusin mao peale ja pidin algusesse tagasi minema. Mäng kestis südaööni.',
    reindeer:
      'Ta on õppinud täringut veeretama. Kui tuleb kuus, hüppab ta rõõmust. Kui tuleb üks, keerab ta täringu salaja ümber. Mina nägin seda, aga ei öelnud kellelegi.',
    toddlerTryout: 'Täring veereb: rull-rull-rull. Mitu täppi? Loeme koos: üks, kaks, kolm!',
    toddlerReindeer: 'Välk veeretas täringut ninaga. Täring hüppas: hopp! Tuli kuus täppi. Hurraa!',
  },

  // Ehitamine ja teadus
  {
    id: 'lego',
    label: 'Klotsid ja LEGO',
    group: 'science',
    match: /lego|klots/i,
    mentions: /klotsimeist|klotsiehit/i,
    tryout:
      'Ehitasin klotsidest Jõuluvanale uue kelgu: katuse, tulede ja isegi kohvitopsihoidjaga. Kõik oli valmis, ainult üks klots jäi üle. Nüüd ma ei tea, kust see puudu on, ja kelk natuke kõigub.',
    reindeer:
      'Ta on õppinud klotse kokku panema – ninaga. Eile ehitas ta torni, mis oli peaaegu sama kõrge kui tema ise. Siis aevastas. Klotse korjasime kahekesi õhtuni.',
    toddlerTryout: 'Ma ehitan klotsidest torni: üks, kaks, kolm klotsi. Torn kõigub … ja kukub: põmm!',
    toddlerReindeer: 'Välk pani klotsi klotsi peale. Torn läks kõrgeks! Siis tuli aevastus: põmm!',
  },
  {
    id: 'space',
    label: 'Kosmos',
    group: 'science',
    match: /kosmos|planeet|raket|astronau/i,
    mentions: /astronau|planeedi/i,
    tryout:
      'Ehitasin pappkastist raketi ja kirjutasin küljele „Põhjanael 1“. Lugesin kümnest nullini – ja ei midagi. Rakett jäi lumme seisma, aga mina tundsin end täitsa astronaudina.',
    reindeer:
      'Igal õhtul seisab ta lauda katusel ja vaatab tähti. Eile näitas ta sarvega ühte eredat täppi. Jõuluvana ütles, et see on planeet Veenus. Välk arvab siiani, et see on tema kadunud kelluke.',
    toddlerTryout: 'Taevas on tähed. Rakett lendab: vuuuh! Üles-üles, Kuu juurde. Lehvita tähtedele!',
    toddlerReindeer: 'Välk vaatas taevasse. Seal oli Kuu, suur ja ümmargune. Välk ütles Kuule: tere!',
  },
  {
    id: 'science',
    label: 'Katsed ja teadus',
    group: 'science',
    match: /katse|teadus|eksperiment|keemi/i,
    mentions: /teadlas|teaduskatse/i,
    tryout:
      'Tegin töökojas teaduskatse: kas lumi sulab kiiremini taskus või mütsi all? Taskus sulas kiiremini. Nüüd on mul märg tasku ja Jõuluvana ütles, et teadlased kannavad katse ajal kitlit.',
    reindeer:
      'Ta on hakanud teadlaseks. Ta paneb samblatükke lumme ja vaatab, mis juhtub. Seni pole juhtunud midagi, aga ta vaatab väga tõsise näoga ja teeb sõrgaga lumme märke.',
    toddlerTryout: 'Panin lumepalli kaussi. Vaatame: lumepall läks väiksemaks … ja sai veeks! Oi!',
    toddlerReindeer: 'Välk pani nina lumme. Külm! Siis pani nina sooja vette. Soe! Välk on teadlane.',
  },
  {
    id: 'robots',
    label: 'Robotid',
    group: 'science',
    match: /robot/i,
    mentions: /robot/i,
    tryout:
      'Ehitasin robotabilise, kes pidi kingipakke pakkima. Ta pakkis ära kaks pakki, ühe saapa ja lõpuks iseenda. Nüüd seisab ta nurgas, ilus punane pael ümber.',
    reindeer:
      'Ta kõnnib nüüd kangete jalgadega ja teeb iga sammuga „piip“. Arvan, et ta mängib robotit. Kui küsisin, mida ta teeb, vastas ta: „Piip. Porgand. Piip.“',
    toddlerTryout: 'Robot kõnnib: kõks, kõks, kõks. Robot ütleb: piip-piip! Kõnnime nagu robot!',
    toddlerReindeer: 'Välk mängib robotit. Ta kõnnib kangelt: kõks, kõks. Ütleb: piip! Siis naerab.',
  },
  {
    id: 'dinosaurs',
    label: 'Dinosaurused',
    group: 'science',
    match: /dino|türannosaur/i,
    mentions: /dinosau/i,
    tryout:
      'Tegin lumest dinosauruse: pikk kael, hiiglaslik saba ja selg täis teravaid jääpurikaid. Hommikuks oli ta pooleldi sulanud ja nägi välja nagu suur lumine part. Jõuluvana kiitis ikkagi.',
    reindeer:
      'Ta käib ringi suurte sammudega ja möirgab. Ta arvab, et on dinosaurus. Kõige naljakam on see, et päkapikud jooksevad tõesti peitu – kuni ta ise naerma hakkab.',
    toddlerTryout: 'Dinosaurus teeb suuri samme: tömps, tömps! Ja möirgab: ruaah! Möirga sina ka!',
    toddlerReindeer: 'Välk mängis dinosaurust. Ta astus: tömps, tömps! Ja möirgas: ruaah! Hirmus?',
  },

  // Loomad ja loodus
  {
    id: 'animals',
    label: 'Loomad',
    group: 'nature',
    match: /loom/i,
    mentions: /loomasõb/i,
    tryout:
      'Käisin metsas loomade jälgi otsimas. Leidsin jänese, rebase ja ühe väga suure jälje. Ajasin seda tükk aega taga, kuni selgus, et see oli minu enda saapajälg.',
    reindeer:
      'Ta on kutsunud metsloomad lauta külla: jänese, oravapere ja ühe uudishimuliku rebase. Kõik söövad tema heina ja tema on väga õnnelik. Jõuluvana ütles, et laut on nüüd loomaaed.',
    toddlerTryout: 'Metsas elab jänes. Jänes hüppab: hopp, hopp! Hüppame nagu jänes!',
    toddlerReindeer: 'Välgul olid külas jänes ja orav. Jänes sõi heina. Orav sõi käbi. Krõmps!',
  },
  {
    id: 'cats',
    label: 'Kassid',
    group: 'nature',
    match: /kass|kiisu/i,
    mentions: /kassisõb|kasside\b/i,
    tryout:
      'Töökoja kass Nurr magab alati kõige soojemas kohas. Eile proovisin ka nagu kass ahju peal magada. Nurr vaatas mind ühe silmaga, nurrus ja lükkas mu käpaga maha.',
    reindeer:
      'Töökoja kass Nurr on tal külas. Nüüd magavad nad koos heinas: suur põhjapõder ja väike kass tema sarvede vahel. Välk ei julge liigutadagi, et kassi mitte äratada.',
    toddlerTryout: 'Kass ütleb: mjäu! Kass nurrub: nurr-nurr. Silitame kassi: pai-pai.',
    toddlerReindeer: 'Väike kass magab Välgu sarvede vahel. Nurr-nurr! Välk ei liiguta. Tsss!',
  },
  {
    id: 'dogs',
    label: 'Koerad',
    group: 'nature',
    match: /koer|kutsu|kutsik/i,
    mentions: /kutsik/i,
    tryout:
      'Naabertalu kutsikas tuli eile töökotta. Proovisin teda õpetada: „Istu!“ Tema heitis pikali. „Lama!“ Tema hüppas mulle sülle ja lakkus nina. Arvan, et tegelikult õpetas tema mind.',
    reindeer:
      'Ta on leidnud endale sõbra – naabertalu kutsika. Nad jooksevad koos ümber lauda ja kutsikas haugub, kui Välk liiga kiiresti jookseb. Pärast on mõlemad väsinud ja väga õnnelikud.',
    toddlerTryout: 'Kutsikas ütleb: auh-auh! Kutsikas liputab saba: vits-vits. Liputa sina ka!',
    toddlerReindeer: 'Välk ja kutsikas jooksevad ringi. Kutsikas: auh! Välk: hõh! Mõlemad on väsinud.',
  },
  {
    id: 'horses',
    label: 'Hobused',
    group: 'nature',
    match: /hobu|poni|ratsuta/i,
    mentions: /ratsuta|\bponi|hobusesõb/i,
    tryout:
      'Proovisin ratsutada. Hobust töökojas pole, seega istusin Välgu selga. Välk arvas, et see on uus mäng, ja pani galoppi. Hoidsin sarvedest kinni ja hüüdsin: „Ptruu!“ Ta ei teadnud, mida see tähendab.',
    reindeer:
      'Ta on käinud naabertalu ponisid vaatamas. Nüüd proovib ta ise traavida nagu hobune: kõpsti-kõpsti, pea püsti. Põhjapõdral tuleb see välja päris naljakalt.',
    toddlerTryout: 'Hobune teeb: ihahaa! Hobune traavib: kõpsti-kõpsti. Sõidame koos!',
    toddlerReindeer: 'Välk traavib nagu hobune: kõpsti, kõpsti! Ja hirnub: ihahaa! Kas ta on hobune?',
  },
  {
    id: 'nature',
    label: 'Mets ja matkamine',
    group: 'nature',
    match: /mets|loodus|matk/i,
    mentions: /matkal|matkaja|loodusesõb/i,
    tryout:
      'Käisin metsas matkal. Võtsin kaasa termose, kompassi ja kolm võileiba. Kompass näitas kogu aeg põhja, aga meie töökoda ongi põhjas – nii et kõndisin ringiratast ja jõudsin tagasi koju.',
    reindeer:
      'Ta käib igal hommikul metsas ja toob midagi kaasa: käbi, samblatüki või puukoore. Kõik need on ta lauda seina äärde ritta pannud. Arvan, et ta teeb muuseumi.',
    toddlerTryout: 'Metsas on kuused ja käbid. Käbi on pruun ja krobeline. Leiame koos ühe käbi!',
    toddlerReindeer: 'Välk tõi metsast käbi. Ja samblat. Ja oksa. Nüüd on laudas oma väike mets!',
  },

  // Sport ja liikumine
  {
    id: 'football',
    label: 'Jalgpall',
    group: 'sport',
    match: /jalgpall|futbol/i,
    mentions: /jalgpall/i,
    tryout:
      'Tegin lumest värava ja proovisin jalgpalli. Esimene löök läks üle värava, teine üle kuuse ja kolmas otse Välgu sarvede vahele. Välk arvas, et see on tema pall, ja jooksis sellega minema.',
    reindeer:
      'Ta on hakanud jalgpalli mängima. Ta ajab ninaga palli mööda õue ja väravaks on kaks kuuske. Väravavahiks pandi lumememm. Lumememm pole veel ühtki palli kinni püüdnud.',
    toddlerTryout: 'Pall veereb: rull-rull! Ma löön palli: põmm! Pall lendab kaugele. Löö sina ka!',
    toddlerReindeer: 'Välk lükkas ninaga palli. Pall veeres lumme. Välk jooksis järele: hopp-hopp!',
  },
  {
    id: 'swimming',
    label: 'Ujumine',
    group: 'sport',
    match: /ujumi|ujuma|bassein/i,
    mentions: /ujuja|ujumi|bassein/i,
    tryout:
      'Proovisin ujuda. Talvel on järv jääs, seega täitsin pesukausi sooja veega ja tegin seal kolm tõmmet. Pärast oli pool töökoda märg ja Jõuluvana küsis, kas meil on uus bassein.',
    reindeer:
      'Ta on kuulnud, et põhjapõdrad oskavad ujuda. Nüüd harjutab ta lumes: lamab kõhuli ja liigutab jalgu nagu ujuja. Lumi lendab igas suunas, aga edasi ta ei liigu.',
    toddlerTryout: 'Kalake ujub: lips-lops. Mina ujun ka: käed ette ja jalad sulpsti-sulpsti!',
    toddlerReindeer: 'Välk tahtis ujuda. Aga järv oli jääs! Välk libises kõhuli üle jää: vuhh!',
  },
  {
    id: 'cycling',
    label: 'Rattasõit',
    group: 'sport',
    match: /jalgratas|jalgratta|rattasõi|tõukeratas/i,
    mentions: /jalgratta|rattasõi/i,
    tryout:
      'Proovisin jalgrattaga sõita. Lumes see eriti hästi ei lähe: ratas sõitis edasi, aga mina jäin hange istuma. Järgmine kord ootan kevadet ja kuiva teed.',
    reindeer:
      'Ta seisis eile tükk aega töökoja jalgratta kõrval ja nuusutas pedaale. Siis proovis ta ise peale ronida. Neli jalga ja kaks pedaali – see ei läinud kokku. Nüüd vaatab ta ratast austusega.',
    toddlerTryout: 'Ratas veereb: vurr-vurr! Kell teeb: tilin-tilin! Sõidame koos: vurr!',
    toddlerReindeer: 'Välk nägi jalgratast. Kell tegi: tilin! Välk ehmus ja hüppas: hopp!',
  },
  {
    id: 'skating',
    label: 'Uisutamine',
    group: 'sport',
    match: /uisu|hoki/i,
    mentions: /\buisu|\buisk/i,
    tryout:
      'Proovisin järvel uisutada. Esimesed kolm sammu läksid hästi, neljanda ajal sõitsid jalad eri suundadesse. Istusin jääl ja vaatasin, kuidas Välk mööda libises – ilma uiskudeta ja palju osavamalt.',
    reindeer:
      'Ta käib igal hommikul järvel uisutamas. Uiske tal pole, aga sõrad libisevad niisama. Eile tegi ta piruetti – vähemalt nii ta arvab. Mina nägin, et ta keerles selili.',
    toddlerTryout: 'Jää on libe. Ma libisen: vuhh! Ja kukun: plumps! Tõusen ja libisen uuesti.',
    toddlerReindeer: 'Välk libises jääl: vuhh! Ta keerles ringi nagu vurr. Uisutaja Välk!',
  },
  {
    id: 'skiing',
    label: 'Suusatamine',
    group: 'sport',
    match: /suusa|suusk/i,
    mentions: /suusata/i,
    tryout:
      'Proovisin suusatada. Mäest alla läks väga kiiresti, mäest üles väga aeglaselt. Kolmandal korral sõitsin otse hange ja välja paistsid ainult suusaotsad ja minu müts.',
    reindeer:
      'Ta tahab ka suusatada. Proovisime talle panna neli suuska – igale jalale ühe. Ta sõitis mäest alla nagu kelk ja peatus alles lauda ukse ees.',
    toddlerTryout: 'Suusad libisevad: suhh, suhh! Mäest alla: vuhh! Ja hange: pläts!',
    toddlerReindeer: 'Välk sõitis mäest alla: vuhh! Ilma suuskadeta. Ja otse hange: pläts!',
  },
  {
    id: 'dance',
    label: 'Tantsimine',
    group: 'sport',
    match: /tants|ballett/i,
    mentions: /tantsija|ballett/i,
    tryout:
      'Proovisin tantsida. Üks päkapikk mängis viiulit ja mina keerutasin, kuni kõik pöörles – ka siis, kui olin juba seisma jäänud. Päkapikud plaksutasid. Tantsija jaoks oli see hea algus.',
    reindeer:
      'Ta on hakanud tantsijaks. Kui keegi töökojas viiulit mängib, tõstab ta ühe esijala ja keerutab. Jõuluvana ütles, et põhjapõdrabaletti pole ta oma pika elu jooksul veel näinud.',
    toddlerTryout: 'Trall-lall-lall! Ma tantsin: keerutan ringi ja hüppan: hopp! Tantsime koos!',
    toddlerReindeer: 'Välk kuulis viiulit ja hakkas tantsima: keerutas ja hüppas. Tantsija Välk!',
  },

  // Loovus
  {
    id: 'drawing',
    label: 'Joonistamine',
    group: 'creative',
    match: /joonist|maali|kunst/i,
    mentions: /kunstnik/i,
    tryout:
      'Proovisin joonistada Jõuluvana portree. Nina tuli liiga suur ja habe liiga lühike. Jõuluvana vaatas pilti tükk aega ja ütles: „Väga ilus põhjapõder.“ Nüüd ripub see lauda seinal.',
    reindeer:
      'Ta on hakanud kunstnikuks. Eile joonistas ta sõrgaga lumme suure ringi ja kaks täppi. Ta väidab, et see olen mina. Ma pole kindel, aga täpid on tõesti minu moodi.',
    toddlerTryout: 'Mul on punane pliiats. Joonistan ringi: ring-ring-ring. Ja täpi: täpp! Joonista sina ka!',
    toddlerReindeer: 'Välk joonistas sõrgaga lumme ringi. Ring! Ja kaks silma. See on päike!',
  },
  {
    id: 'music',
    label: 'Muusika ja laulmine',
    group: 'creative',
    match: /muusik|laul|klaver|pill|kitarr|trumm/i,
    mentions: /muusik/i,
    tryout:
      'Proovisin töökojas klaverit mängida. Kõrged noodid kõlasid nagu kellukesed, madalad nagu Jõuluvana norskamine. Lõpuks mängisin mõlemat korraga ja kõik päkapikud tulid vaatama, mis lahti on.',
    reindeer:
      'Ta laulab. Iga õhtu, kui tähed välja tulevad, ajab ta pea kuklasse ja teeb: hõõõõh. Jõuluvana ütles, et see on põhjapõtrade jõululaul. Päkapikud panevad vaikselt mütsid kõrvadele.',
    toddlerTryout: 'Ma laulan: la-la-laa! Trumm teeb: bumm-bumm! Laulame koos: la-la-laa!',
    toddlerReindeer: 'Välk laulab: hõõõh! See on tema jõululaul. Laula sina ka Välgule!',
  },
  {
    id: 'crafts',
    label: 'Meisterdamine',
    group: 'creative',
    match: /meisterd|voolim|plastiliin|käsitöö/i,
    mentions: /meisterda/i,
    tryout:
      'Meisterdasin paberist lumehelbe. Voltisin, lõikasin ja voltisin veel. Kui lahti tegin, oli see hoopis paberist põhjapõder – kolme sarve ja kahe sabaga. Jõuluvana pani selle ikkagi aknale.',
    reindeer:
      'Ta toob mulle igal hommikul midagi meisterdamiseks: oksa, sulekese, väikese kivi. Arvan, et ta tahab endale midagi ilusat. Täna meisterdasin talle oksadest krooni.',
    toddlerTryout: 'Ma lõikan paberist tähe. Kleebin tähe aknale: klõps! Täht särab!',
    toddlerReindeer: 'Välk tõi oksa ja sulekese. Me tegime neist krooni. Nüüd on Välk kuningas!',
  },
  {
    id: 'baking',
    label: 'Küpsetamine',
    group: 'creative',
    match: /küpseta|kook|muffin/i,
    mentions: /pagari|pagar\b|kondiitri/i,
    tryout:
      'Proovisin küpsetada kooki nagu päris pagar. Taina segamise ajal lendas jahu igale poole – lakke, aknale ja Jõuluvana habemesse. Kook tuli hea, aga Jõuluvana on nüüd veel valgem kui enne.',
    reindeer:
      'Ta seisab iga päev köögiukse taga ja nuusutab. Kui ma kooki küpsetan, tuleb ta nii lähedale, et nina on peaaegu ahjus. Eile sai ta esimese tüki ja nüüd peab ta end peapagariks.',
    toddlerTryout: 'Me teeme kooki: segame, segame! Ahjus kook kasvab. Mmm, kook lõhnab!',
    toddlerReindeer: 'Välk nuusutas köögis: nuuts-nuuts! Kook! Välk sai ka ühe väikese tüki.',
  },

  // Mängud ja lood
  {
    id: 'books',
    label: 'Raamatud',
    group: 'play',
    match: /raamat/i,
    mentions: /raamatusõb|raamatukoi/i,
    tryout:
      'Lugesin terve öö raamatut ühest väga vaprast päkapikust. Nii põnev oli, et küünal põles lõpuni ja viimased leheküljed lugesin taskulambiga. Hommikul tundsin, et olen ka ise natuke vapram.',
    reindeer:
      'Ta on avastanud töökoja raamatukogu. Ta keerab ninaga lehti ja vaatab pilte. Kõige rohkem meeldib talle raamat põhjapõtradest, sest seal on tema arvates tema sugulased.',
    toddlerTryout: 'Mul on raamat. Keerame lehte: siin on kuusk. Keerame veel: siin on jänku!',
    toddlerReindeer: 'Välk vaatab raamatut. Keerab ninaga lehte. Pildil on põhjapõder! Välk naerab.',
  },
  {
    id: 'comics',
    label: 'Miki Hiir ja koomiksid',
    group: 'play',
    match: /miki|mickey|koomiks|donald/i,
    mentions: /miki hii|koomiksisõb|koomiksilugeja/i,
    tryout:
      'Proovisin joonistada koomiksi nagu Miki Hiire raamatus: kolm pilti ja jutumullid. Esimesel pildil oli päkapikk, teisel päkapikk ja kolmandal samuti päkapikk. Lugu jäi igavaks, aga jutumullid olid ilusad.',
    reindeer:
      'Ta on leidnud Miki Hiire koomiksi ja vaatab seda iga päev. Lugeda ta ei oska, aga pildid meeldivad. Kõige naljakamas kohas norskab ta naerda nii, et hein lendab.',
    toddlerTryout: 'Miki Hiir naerab: hi-hi! Miki Hiir lehvitab. Lehvitame Mikile!',
    toddlerReindeer: 'Välk vaatas pilti, kus on Miki Hiir. Miki naeratas. Välk naeratas ka!',
  },
  {
    id: 'cars',
    label: 'Autod',
    group: 'play',
    match: /auto|traktor|veok/i,
    mentions: /võidusõiduauto|sahaga auto/i,
    tryout:
      'Ehitasin Jõuluvana kelgule mootori, et see sõidaks nagu võidusõiduauto. Mootor käivitus, tegi „vrumm“ – ja kelk sõitis tagurpidi otse lauta. Välk ei olnud sellest üldse vaimustuses.',
    reindeer:
      'Ta nägi, kuidas suur sahaga auto teelt lund lükkas. Nüüd lükkab ta ise ninaga lund ja teeb: vrumm-vrumm. Pidurdamine tal veel hästi välja ei tule.',
    toddlerTryout: 'Auto sõidab: vrumm-vrumm! Auto teeb: piip-piip! Sõidame koos!',
    toddlerReindeer: 'Välk mängis autot. Ta jooksis ringi ja tegi: vrumm! Piip-piip, Välk tuleb!',
  },
  {
    id: 'trains',
    label: 'Rongid',
    group: 'play',
    match: /rong|vedur/i,
    mentions: /\brong|vedur/i,
    tryout:
      'Ehitasin töökotta väikese rongi: vedur ees ja vagunites kingipakid. Rong tegi „tuut-tuut“ ja sõitis ümber kuuse. Kolmandal ringil jäi ta seisma, sest keegi oli rööbastele piparkoogi jätnud.',
    reindeer:
      'Ta on hakanud vedurit mängima. Ta jookseb ees ja kolm päkapikku sõidavad kelguga järel. Iga kord, kui ta peatub, teeb ta: tuut! Päkapikud tahavad juba pileteid ka.',
    toddlerTryout: 'Rong sõidab: tšuhh-tšuhh! Rong vilistab: tuut-tuut! Sõidame rongiga!',
    toddlerReindeer: 'Välk on vedur. Tšuhh-tšuhh! Päkapikud sõidavad taga. Tuut-tuut!',
  },
  {
    id: 'dolls',
    label: 'Nukud ja kaisukarud',
    group: 'play',
    match: /nukk|nuku|kaisu|mängukaru/i,
    mentions: /\bnukk|nukumaja|nukuvank/i,
    tryout:
      'Õmblesin töökoja vanale kaisukarule uue kampsuni. Varrukad tulid eri pikkusega ja kaelaauk jäi liiga väikeseks. Nüüd kannab karu kampsunit peas nagu mütsi ja näeb väga rahul välja.',
    reindeer:
      'Ta on leidnud endale kaisukaru. Ta kannab seda suus igale poole kaasa ja õhtul paneb selle enda kõrvale heinale magama. Kui keegi karu puudutab, vaatab Välk väga tõsiselt.',
    toddlerTryout: 'Kaisukaru on pehme. Kallistame karu: kalli-kalli! Karu jääb magama: tsss.',
    toddlerReindeer: 'Välgul on kaisukaru. Välk paneb karu heinale magama. Head ööd, karu!',
  },
  {
    id: 'pirates',
    label: 'Piraadid',
    group: 'play',
    match: /piraat/i,
    mentions: /piraa/i,
    tryout:
      'Mängisin töökojas piraati: silmaklapp ees, papist mõõk vöö vahel. Ronisin kingikuhja otsa ja hüüdsin: „Laev paistab!“ Laeva ei paistnud, aga Jõuluvana tuli vaatama, mis lärm see on.',
    reindeer:
      'Ta on hakanud piraadiks. Ta kaevas lumme augu ja peitis sinna porgandi – oma aarde. Siis unustas, kus see oli. Nüüd kaevab ta terve õue läbi ja kõik päkapikud aitavad.',
    toddlerTryout: 'Piraat ütleb: ahoi! Piraadil on laev. Laev õõtsub: kiik-kõik. Ahoi!',
    toddlerReindeer: 'Välk peitis porgandi lumme. See on piraadi aare! Kus see on? Kaevame!',
  },
  {
    id: 'knights',
    label: 'Rüütlid ja lossid',
    group: 'play',
    match: /rüütel|rüütli|loss|draak/i,
    mentions: /rüütel|rüütli/i,
    tryout:
      'Ehitasin lumest lossi: neli torni, müür ja vallikraav. Olin seal rüütel, potikaas kilbiks. Lossi tuli ründama Välk. Ta ei rünnanud – ta heitis kraavi pikali ja jäi magama.',
    reindeer:
      'Ta mängib nüüd rüütli ratsut. Mina istun tema seljas, potikaas kilbiks ja puulusikas mõõgaks, ja me kaitseme töökoda draakoni eest. Draakonit pole veel tulnud, aga me oleme valmis.',
    toddlerTryout: 'Lossil on torn. Rüütel valvab torni. Rüütel küsib: kes tuleb? Mina tulen!',
    toddlerReindeer: 'Välk valvab lumelossi nagu rüütel. Keegi ei tohi sisse! Ainult sina.',
  },
  {
    id: 'princesses',
    label: 'Printsessid',
    group: 'play',
    match: /printsess|haldja/i,
    mentions: /printsess/i,
    tryout:
      'Proovisin olla printsess: panin pähe paberist krooni ja kõndisin väga sirgelt. Kroon kukkus kolm korda supi sisse. Jõuluvana ütles, et päris printsessidel on kroonid paremini kinni.',
    reindeer:
      'Ta käis eile ringi, laudlina seljas nagu printsessi mantel ja käbi sarvede vahel. Kõik pidid talle kummardama. Mina kummardasin ja tema kummardas vastu – nii sügavalt, et kukkus.',
    toddlerTryout: 'Printsessil on kroon. Kroon särab ja sädeleb. Paneme krooni pähe!',
    toddlerReindeer: 'Välk pani pähe krooni. Nüüd on Välk printsess! Ta kummardab: kummar!',
  },
  {
    id: 'superheroes',
    label: 'Superkangelased',
    group: 'play',
    match: /superkangel|ämblikmees|batman|superman/i,
    mentions: /superkangel/i,
    tryout:
      'Proovisin olla superkangelane. Panin selga punase keebi ja hüppasin kingikuhja otsast alla – lendama. Lendamine kestis umbes pool sekundit. Aga maandumine oli väga kangelaslik.',
    reindeer:
      'Ta usub, et on superkangelane. Tal on punane sall nagu keep ja igal hommikul päästab ta kedagi: eile ühe kinnijäänud kindapaari, täna ühe lumme kukkunud mütsi.',
    toddlerTryout: 'Superkangelane lendab: vuhh! Käed üles ja lendame koos: vuuuh!',
    toddlerReindeer: 'Välgul on punane keep. Ta on superkangelane! Välk päästis kinda. Hurraa!',
  },

  // Multikategelased
  {
    id: 'peppa',
    label: 'Põrsas Peppa',
    group: 'characters',
    match: /peppa|põrsa/i,
    mentions: /peppa/i,
    tryout:
      'Proovisin naerda täpselt nagu Põrsas Peppa: röh-röh-röh. Päkapikud arvasid, et laudast on põrsas välja pääsenud, ja otsisid terve õhtu. Mina ei julgenud öelda, et see olin mina.',
    reindeer:
      'Ta hüppab Põrsas Peppa moodi heinakuhjas ja röhib: röh-röh! Hein lendab igale poole ja kõik päkapikud naeravad. Laudas pole kunagi nii lõbus olnud.',
    toddlerTryout: 'Peppa ütleb: röh-röh! Peppa hüppab: hüpp! Hüppame nagu Peppa!',
    toddlerReindeer: 'Välk hüppas heinas nagu Peppa: hüpp-hüpp! Ja ütles: röh-röh! Naljakas Välk!',
  },
  {
    id: 'pawpatrol',
    label: 'Käpapatrull',
    group: 'characters',
    match: /käpapatrull|paw patrol/i,
    mentions: /käpapatrull/i,
    tryout:
      'Mängisime töökojas Käpapatrulli. Mina olin päästja, kes otsib kadunud asju. Leidsin kaks kinnast, ühe sussi ja Jõuluvana prillid – need olid tal kogu aeg peas.',
    reindeer:
      'Ta on loonud oma Käpapatrulli. Kui kuskil midagi juhtub, kihutab ta kohale. Eile päästis ta päkapiku, kes oli kingikuhja alla jäänud. Päkapikk otsis seal tegelikult lihtsalt pliiatsit.',
    toddlerTryout: 'Käpapatrull tuleb appi! Jookseme: tipa-tapa. Appi, appi – hurraa!',
    toddlerReindeer: 'Välk mängib Käpapatrulli. Ta jookseb appi: tipa-tapa! Kõik on päästetud!',
  },
  {
    id: 'frozen',
    label: 'Lumekuninganna ja Elsa',
    group: 'characters',
    match: /elsa|frozen|lumekuninganna|olaf/i,
    mentions: /\belsa|lumekuninganna|\bolaf/i,
    tryout:
      'Proovisin teha lund nagu Elsa – kätega. Ajasin käed laiali ja ootasin. Lund ei tulnud, aga tuli tuuleiil ja puhus mütsi peast. Siis hakkas ikkagi sadama – arvan, et natuke aitasin.',
    reindeer:
      'Ta on kuulnud lugu Elsast, kes teeb jääst lossi. Nüüd lamab ta iga päev järve ääres ja vaatab jääd. Ta ootab, millal jää hakkab lossiks kasvama. Ta on väga kannatlik.',
    toddlerTryout: 'Elsa teeb lund: lumehelbed langevad ja sädelevad! Keerleme nagu helbed!',
    toddlerReindeer: 'Välk vaatas lumehelbeid nagu Elsa. Helbed keerlesid. Välk keerles ka!',
  },

  // Lemmiktoidud
  {
    id: 'porridge',
    label: 'Riisipuder',
    group: 'food',
    match: /riisipu/i,
    mentions: /riisipu/i,
    tryout:
      'Keetsin hommikusöögiks riisiputru. Segasin ja segasin, siis unustasin hetkeks segamise. Puder kasvas üle poti ääre ja peaaegu ukseni. Päkapikud ütlesid, et nii palju putru pole nad kunagi näinud.',
    reindeer:
      'Ta on avastanud riisipudru. Igal hommikul seisab ta köögiukse taga ja ootab, kas jääb üle. Kui jääb, lakub ta kausi nii puhtaks, et seda pole vaja pestagi.',
    toddlerTryout: 'Puder on soe. Puhume: fuu-fuu! Võtame lusikaga: amps! Mmm, riisipuder!',
    toddlerReindeer: 'Välk sai riisiputru. Amps-amps! Kauss on tühi. Välgul on puder ninal!',
  },
  {
    id: 'pancakes',
    label: 'Pannkoogid',
    group: 'food',
    match: /pannkoo|pannkook|pannkuk/i,
    mentions: /pannkoogihommik|pannkoogisõb|pannkoogitorn/i,
    tryout:
      'Ehitasin pannkookidest torni: kaksteist pannkooki üksteise otsas ja iga kihi vahel moos. Pannkoogitorn oli peaaegu sama pikk kui mina. Siis tuli köögist läbi Välk – ja nüüd on torn tunduvalt madalam.',
    reindeer:
      'Ta valvab pannkoogihommikutel köögis. Kui pannkook pannil ümber lendab, avab ta suu – lootuses, et see lendab otse sinna. Eile lendaski.',
    toddlerTryout: 'Pannkook on ümmargune. Pannkook hüppab pannil: hopp! Amps – maitsev!',
    toddlerReindeer: 'Pannkook lendas üles. Välk avas suu – amps! Pannkook on Välgu kõhus!',
  },
  {
    id: 'icecream',
    label: 'Jäätis',
    group: 'food',
    match: /jäätis/i,
    mentions: /jäätis[et]/i,
    tryout:
      'Tegin talvel jäätist: lumi, natuke moosi ja tilk piima. Panin kausi aknalauale külmuma. Hommikul oli kauss tühi ja Välgu ninal oli moosi. Ta väitis, et ei tea midagi.',
    reindeer:
      'Ta on avastanud, et jäätise kausi saab väga puhtaks lakkuda. Nüüd seisab ta iga kord köögis, kui keegi jäätist teeb. Kui ta mõnikord ootamatult aevastab, on tal nina peal vahukoort.',
    toddlerTryout: 'Jäätis on külm. Limps-limps! Jäätis on magus. Mmm, jäätis!',
    toddlerReindeer: 'Välk limpsis lund: limps! Ta arvas, et see on jäätis. Lumi on külm!',
  },
]

export function getTopic(id: TopicId): Topic {
  const topic = TOPICS.find((candidate) => candidate.id === id)
  if (!topic) throw new Error(`Unknown topic ${id}`)
  return topic
}

export function isTopicId(value: string): value is TopicId {
  return TOPICS.some((topic) => topic.id === value)
}

/** Topics the parent picked on the profile (older profiles have none). */
export function pickedTopics(child: Pick<ChildProfile, 'topics'>): Topic[] {
  return (child.topics ?? []).filter(isTopicId).map(getTopic)
}

/** Interests as text for the short-letter templates: picked topics first, then free text. */
export function interestTexts(child: ChildProfile): string[] {
  const topics = pickedTopics(child).filter((topic) => topic.group !== 'food')
  return unique([...topics.map((topic) => topic.label), ...child.interests, ...child.favorites])
}

/** Favourite foods as text: picked food topics first, then free text. */
export function foodTexts(child: ChildProfile): string[] {
  const topics = pickedTopics(child).filter((topic) => topic.group === 'food')
  return unique([...topics.map((topic) => topic.label.toLocaleLowerCase('et-EE')), ...child.foods])
}

function unique(texts: string[]): string[] {
  const seen = new Set<string>()
  return texts.filter((text) => {
    const key = text.trim().toLocaleLowerCase('et-EE')
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}
