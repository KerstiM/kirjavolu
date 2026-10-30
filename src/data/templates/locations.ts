import type { Setting } from '../../domain/models'
import type { Say } from './interests'

export interface HuntLocation {
  id: string
  /** Nominative name shown to parents ("Peida kaart: külmkapp"). */
  name: string
  aliases: RegExp
  setting: Setting
  young: ((v: Say) => string)[]
  older: ((v: Say) => string)[]
  /** Read aloud by an adult to a toddler: "Kus on …?" */
  toddler: string
}

export const HUNT_LOCATIONS: HuntLocation[] = [
  {
    id: 'fridge',
    name: 'külmkapp',
    aliases: /külmkapp|külmik/i,
    setting: 'indoor',
    young: [
      () => 'Seal sees on alati külm, isegi suvel. Seal elavad piim, juust ja moos.',
      () => 'Olen suur ja valge. Kui mu ukse avad, süttib minu sees tuli.',
    ],
    older: [
      () => 'Hoian toitu jahedas ja minu sees süttib tuli ainult siis, kui keegi ukse avab.',
      () => 'Öösiti sumisen vaikselt. Minu juures kestab talv aasta läbi.',
    ],
    toddler: 'koht, kus hoitakse piima',
  },
  {
    id: 'sofa',
    name: 'diivan',
    aliases: /diivan|sohva/i,
    setting: 'indoor',
    young: [
      (v) => `Seal istub terve pere, kui vaadatakse multikaid. ${v('Otsi', 'Otsige')} patjade vahelt!`,
      () => 'Olen pehme ja lai. Minu peal on mõnus pikutada ja raamatut lugeda.',
    ],
    older: [
      () => 'Mul on seljatugi, aga mul ei ole selga. Minu patjade vahele kaovad sageli mündid ja pultid.',
      (v) => `Õhtuti olen pere kogunemiskoht. ${v('Uuri', 'Uurige')} hoolikalt minu patjade vahelt.`,
    ],
    toddler: 'pehme koht, kus me koos istume',
  },
  {
    id: 'bookshelf',
    name: 'raamaturiiul',
    aliases: /raamat|riiul/i,
    setting: 'indoor',
    young: [
      () => 'Seal ootavad lood ja muinasjutud, kõik ilusti reas.',
      (v) => `Seal on palju raamatuid. ${v('Vaata', 'Vaadake')} nende vahele!`,
    ],
    older: [
      () => 'Mul on palju selgasid, aga ükski neist ei ole minu oma. Vihje peitub nende vahel.',
      (v) => `Hoian endas sadu maailmu, kuid ise seisan paigal. ${v('Otsi', 'Otsige')} kahe raamatu vahelt.`,
    ],
    toddler: 'koht, kus elavad raamatud',
  },
  {
    id: 'bed',
    name: 'voodi (padja alla)',
    aliases: /voodi|padi/i,
    setting: 'indoor',
    young: [
      (v) => `Seal magatakse igal ööl. ${v('Vaata', 'Vaadake')} padja alla!`,
      () => 'Seal on pehme tekk ja padi. Seal nähakse unenägusid.',
    ],
    older: [
      () => 'Minuga sõidetakse igal ööl unenägude maale, kuigi ma ei liigu paigast. Vihje on padja all.',
      () => 'Mul on neli jalga, aga ma ei kõnni kunagi. Minu peal puhatakse igal ööl.',
    ],
    toddler: 'koht, kus me magame',
  },
  {
    id: 'bathroom',
    name: 'vannitoa kraanikauss',
    aliases: /vanni|kraanikauss|dušš/i,
    setting: 'indoor',
    young: [
      () => 'Seal pestakse hambaid ja käsi. Kraanist tuleb vesi – sulin-sulin!',
      () => 'Seal on seep, hambahari ja peegel. Vihje ootab kraanikausi juures.',
    ],
    older: [
      () => 'Hommikul ja õhtul seisad minu ees, hambahari käes. Peegel näitab, kes vihje leiab.',
      () => 'Minu toru kaudu jookseb vesi, aga ma ise ei jänune kunagi.',
    ],
    toddler: 'koht, kus me käsi peseme',
  },
  {
    id: 'shoes',
    name: 'jalatsiriiul',
    aliases: /king|jalats|esik/i,
    setting: 'indoor',
    young: [
      (v) => `Seal ootavad saapad ja tossud, kuni keegi õue läheb. ${v('Vaata', 'Vaadake')} jalanõude juurde!`,
      () => 'Seal seisavad kingad paarikaupa reas. Üks neist peidab saladust.',
    ],
    older: [
      () => 'Minu juures puhkavad need, kes kannavad sind igale poole. Vihje võib olla mõne saapa sees.',
      () => 'Siin seisavad paarid, kes ei tantsi kunagi koos – ainult kõnnivad.',
    ],
    toddler: 'koht, kus on meie saapad',
  },
  {
    id: 'window',
    name: 'aknalaud',
    aliases: /aken|akna/i,
    setting: 'indoor',
    young: [
      () => 'Sealt paistab õue ja päike tuleb tuppa. Vihje ootab akna all.',
      () => 'Seal kasvavad toalilled ja sealt saab vaadata, kas sajab vihma.',
    ],
    older: [
      () => 'Läbi minu näeb kogu maailma, aga ise olen ma läbipaistev. Otsi minu all olevalt laualt.',
      () => 'Päike koputab igal hommikul minu klaasile. Vihje ootab seal, kus taimed päikest võtavad.',
    ],
    toddler: 'koht, kust paistab õue',
  },
  {
    id: 'toybox',
    name: 'mänguasjakast',
    aliases: /mängu|kast/i,
    setting: 'indoor',
    young: [
      () => 'Seal elavad nukud, autod ja klotsid. Vihje peitis end nende vahele.',
      () => 'Seal on palju mänguasju – vihje on peidus kõige põhjas.',
    ],
    older: [
      () => 'Minu sees magavad kangelased, kuni keegi nad üles äratab. Vihje on nende vahel.',
      () => 'Mind avatakse ikka siis, kui on mängimise aeg. Kaeva sügavale!',
    ],
    toddler: 'koht, kus elavad mänguasjad',
  },
  {
    id: 'table',
    name: 'söögilaua all',
    aliases: /laud|laua/i,
    setting: 'indoor',
    young: [
      () => 'Seal süüakse hommikusööki, lõunat ja õhtusööki. Vihje on peidus laua all.',
      (v) => `Mul on neli jalga ja mu peal on taldrikud. ${v('Piilu', 'Piiluge')} minu alla!`,
    ],
    older: [
      () => 'Minu ümber kogunetakse kolm korda päevas, aga ise ma ei söö kunagi. Vihje on minu all.',
      () => 'Ma kannan iga päev suppi, leiba ja tasse, kuid ei kurda kunagi. Vaata alla.',
    ],
    toddler: 'koht, kus me sööme',
  },
  {
    id: 'wardrobe',
    name: 'riidekapp',
    aliases: /riide|kapp|garderoob/i,
    setting: 'indoor',
    young: [
      () => 'Seal ripuvad särgid ja püksid. Vihje on kapis riiete vahel.',
      () => 'Seal hoitakse sokke, kampsuneid ja mütse.',
    ],
    older: [
      () => 'Minu sees ootavad riided oma järjekorda. Vihje võib olla mõne kampsuni all.',
      () => 'Minu uksed avanevad igal hommikul, kui keegi otsustab, mida selga panna.',
    ],
    toddler: 'koht, kus on meie riided',
  },
  {
    id: 'curtain',
    name: 'kardina taga',
    aliases: /kardin/i,
    setting: 'indoor',
    young: [
      () => 'Õhtul tõmmatakse mind ette, et pimedus tuppa ei piiluks. Vihje on minu taga.',
    ],
    older: [
      () => 'Ma ei ole sein ega uks, aga ma suudan valguse välja jätta. Piilu minu taha.',
    ],
    toddler: 'koht, kus saab peitust mängida',
  },
  {
    id: 'washing',
    name: 'pesumasin',
    aliases: /pesumasin/i,
    setting: 'indoor',
    young: [
      () => 'Seal keerutatakse riideid vees ja vahus – nurr-nurr! Vihje on masina peal.',
    ],
    older: [
      () => 'Mina pööran ringi ja ringi, kuni mustast saab puhas. Vihje on minu peal, mitte sees!',
    ],
    toddler: 'koht, kus riided puhtaks saavad',
  },
  {
    id: 'mailbox',
    name: 'postkast',
    aliases: /postkast/i,
    setting: 'outdoor',
    young: [
      () => 'Sinna tuuakse kirju ja ajalehti. Vihje ootab seal nagu päris kiri.',
    ],
    older: [
      () => 'Mul on suu, aga ma ei räägi. Iga päev neelan paberit, aga ei söö kunagi.',
    ],
    toddler: 'koht, kuhu tuuakse kirju',
  },
  {
    id: 'tree',
    name: 'suur puu',
    aliases: /puu/i,
    setting: 'outdoor',
    young: [
      () => 'Ma olen kõrge ja minu okstel istuvad linnud. Vihje on minu tüve juures.',
      () => 'Mul on lehed, oksad ja juured. Leia minu juurest järgmine vihje.',
    ],
    older: [
      () => 'Mu juured on sügaval maas ja võra ulatub taeva poole. Otsi minu tüve ümbert.',
      () => 'Igal aastal saan juurde ühe rõnga, kuigi keegi ei näe seda. Vihje ootab mu jalamil.',
    ],
    toddler: 'suur puu õues',
  },
  {
    id: 'sandbox',
    name: 'liivakast',
    aliases: /liiva/i,
    setting: 'outdoor',
    young: [
      () => 'Seal ehitatakse liivalosse ja küpsetatakse liivakooke.',
    ],
    older: [
      () => 'Minu sees on terve kõrb, aga ma mahun õue ära. Vihje on minu serval.',
    ],
    toddler: 'koht, kus me liivaga mängime',
  },
  {
    id: 'swing',
    name: 'kiik',
    aliases: /kiik/i,
    setting: 'outdoor',
    young: [
      () => 'Minuga saab lennata edasi-tagasi, edasi-tagasi. Vihje on minu juures.',
    ],
    older: [
      () => 'Ma viin sind üles taeva poole ja toon kohe tagasi. Otsi minu alt.',
    ],
    toddler: 'koht, kus saab kiikuda',
  },
  {
    id: 'gate',
    name: 'värav',
    aliases: /värav/i,
    setting: 'outdoor',
    young: [
      () => 'Minust astutakse läbi, kui tullakse koju või minnakse välja. Vihje on minu juures.',
    ],
    older: [
      () => 'Ma olen hoovi uks, kuigi mul pole maja ümber. Otsi minu posti juurest.',
    ],
    toddler: 'koht, kust me õue läheme',
  },
  {
    id: 'flowerbed',
    name: 'lillepeenar',
    aliases: /lill|peenar/i,
    setting: 'outdoor',
    young: [
      () => 'Seal kasvavad värvilised lilled ja sumisevad mesilased.',
    ],
    older: [
      () => 'Minu juures käivad mesilased külas ja liblikad puhkamas. Vihje on lillede vahel.',
    ],
    toddler: 'koht, kus kasvavad lilled',
  },
  {
    id: 'shed',
    name: 'kuur või aiamaja',
    aliases: /kuur|aiamaja|garaaž/i,
    setting: 'outdoor',
    young: [
      () => 'Seal hoitakse rehasid, labidaid ja jalgrattaid. Vihje on ukse juures.',
    ],
    older: [
      () => 'Ma olen väike maja, kus ei ela keegi – ainult tööriistad. Otsi minu ukse eest.',
    ],
    toddler: 'koht, kus on labidad ja rattad',
  },
  {
    id: 'steps',
    name: 'välistrepp',
    aliases: /trepp/i,
    setting: 'outdoor',
    young: [
      () => 'Minu peal kõnnitakse üles ja alla, kui tullakse koju. Vihje on astme all.',
    ],
    older: [
      () => 'Mind mööda tõustakse, kuigi ma ise ei liigu kuhugi. Kontrolli alumist astet.',
    ],
    toddler: 'koht, kus on astmed',
  },
  {
    id: 'bench',
    name: 'pink',
    aliases: /pink/i,
    setting: 'outdoor',
    young: [
      () => 'Minu peal saab istuda ja puhata. Vihje on minu all.',
    ],
    older: [
      () => 'Ma ootan õues väsinud jalgu ja pakun neile puhkust. Vihje on minu istme all.',
    ],
    toddler: 'koht, kus saab õues istuda',
  },
]

export function findLocation(name: string): HuntLocation | undefined {
  return HUNT_LOCATIONS.find((location) => location.aliases.test(name))
}
