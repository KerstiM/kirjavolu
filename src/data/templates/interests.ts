/** Chooses between singular ("sina") and plural ("teie") address. */
export type Say = (singular: string, plural: string) => string

export interface InterestHook {
  id: string
  match: RegExp
  /** Nominative topic phrase for parent-facing summaries. */
  topic: string
  letterLines: ((v: Say) => string)[]
  /** Magical object for stories, nominative case. */
  storyObject: string
  /** A remark the child makes after solving something; fits any obstacle. */
  storyReflection: (name: string) => string
  mission: (v: Say) => string
}

export const INTEREST_HOOKS: InterestHook[] = [
  {
    id: 'rubik',
    match: /rubik|kuubik/i,
    topic: 'Rubiku kuubik',
    letterLines: [
      (v) =>
        `Proovisin ka ise Rubiku kuubikut keerata, aga sain korda ainult ühe nurga. Kuidas ${v('sul', 'teil')} see nii hästi välja tuleb?`,
      (v) =>
        `Kas ${v('tead', 'teate')}, et Rubiku kuubikul on üle 43 triljoni erineva asendi? Ja ikkagi ${v('leiad sa', 'leiate te')} õige tee!`,
      (v) =>
        `Mulle meeldib, et ${v('sa ei anna', 'te ei anna')} alla, kui kuubik kohe lahti ei tule. See on tõelise nuputaja tunnus.`,
      (v) =>
        `Kuulsin, et ${v('sa oskad', 'te oskate')} Rubiku kuubikut lahendada. Meie juures peetakse seda peaaegu võlukunstiks!`,
      (v) =>
        `Mul on üks küsimus: mitu minutit kulub ${v('sul', 'teil')} praegu kuubiku lahendamiseks? ${v('Kirjuta', 'Kirjutage')} oma aeg paberile ja ${v('jäta', 'jätke')} see mulle.`,
    ],
    storyObject: 'võlukuubik, mille iga keeramine avas uue ukse',
    storyReflection: (name) =>
      `„See oli nagu Rubiku kuubik – tuli lihtsalt leida õige järjekord,“ ütles ${name} rahulolevalt.`,
    mission: (v) =>
      `${v('Keera', 'Keerake')} Rubiku kuubikul üks tahk ühevärviliseks ja ${v('võta', 'võtke')} aega. Homme ${v('proovi', 'proovige')} oma rekordit ületada!`,
  },
  {
    id: 'comics',
    match: /miki|mickey|koomiks|donald/i,
    topic: 'Miki Hiire koomiksid',
    letterLines: [
      (v) =>
        `Kas ${v('sul', 'teil')} on mõni lemmikkoomiks, mida ${v('võiksid', 'võiksite')} mulle soovitada? Lugemisaega mul jagub.`,
      () =>
        `Kuulsin, et Miki Hiire koomiksites juhtub alati midagi ootamatut. Täpselt nagu minu juures!`,
      (v) =>
        `Ma tean, et ${v('sulle', 'teile')} meeldivad Miki Hiire koomiksid. Minu lemmikud on need lood, kus kõik läheb natuke viltu, aga lõpuks laheneb nutikalt – täpselt nagu päriselus.`,
      (v) =>
        `Kui ${v('sa järgmine kord koomiksit loed, otsi', 'te järgmine kord koomiksit loete, otsige')} üles kõige naljakam pilt ja ${v('näita', 'näidake')} seda kellelegi, kes vajab head naeru.`,
    ],
    storyObject: 'vana koomiksiraamat, mille pildid oskasid liikuda',
    storyReflection: (name) =>
      `„Täpselt nagu Miki Hiire koomiksis!“ naeris ${name}. „Kui midagi läheb viltu, tuleb lihtsalt nutikas plaan välja mõelda.“`,
    mission: (v) =>
      `${v('Joonista', 'Joonistage')} oma koomiks kolmest pildist: algus, sekeldus ja lõpp. Peategelane võib olla keegi ${v('sinu', 'teie')} perest.`,
  },
  {
    id: 'lego',
    match: /lego|klots/i,
    topic: 'LEGO klotsid',
    letterLines: [
      (v) =>
        `Klotsidest saab ehitada kõike, mida pea välja mõtleb. Mis on ${v('sinu', 'teie')} kõige uhkem ehitis?`,
      (v) =>
        `Kuulsin, et ${v('sa oled', 'te olete')} osav ehitaja. Kas ${v('sa suudaksid', 'te suudaksite')} ehitada klotsidest maja ka ühele väikesele võlurile?`,
    ],
    storyObject: 'klotsidest ehitatud lennumasin',
    storyReflection: (name) =>
      `„Kõik on nagu klotsid – kui tükid õigesti kokku panna, saab hakkama,“ arvas ${name}.`,
    mission: (v) =>
      `${v('Ehita', 'Ehitage')} klotsidest kõige kõrgem torn, mis ise püsti püsib. ${v('Mõõda', 'Mõõtke')} see ära ja ${v('pane', 'pange')} tulemus kirja!`,
  },
  {
    id: 'ball',
    match: /jalgpall|korvpall|pall|sport|trenn|jooks/i,
    topic: 'pallimängud ja sport',
    letterLines: [
      (v) =>
        `Kas ${v('tead', 'teate')}, et ka liblikad mängivad palli? Nemad kasutavad selleks võililleseemneid.`,
      (v) =>
        `Mulle räägiti, et ${v('sa oled', 'te olete')} väga osav liikuja. Meiegi harjutame palli mängida – ainult et meie pall on pisike nagu hernes ja kipub ära kaduma.`,
    ],
    storyObject: 'kuldne pall, mis põrkas alati õiges suunas',
    storyReflection: (name) =>
      `„See oli nagu hea pallimäng: tuli sihtida, julgelt proovida ja mitte alla anda,“ ütles ${name}.`,
    mission: (v) =>
      `${v('Korralda', 'Korraldage')} täna väike pallivõistlus: mitu korda järjest ${v('suudad', 'suudate')} palli üles visata ja kinni püüda?`,
  },
  {
    id: 'dinosaurs',
    match: /dino/i,
    topic: 'dinosaurused',
    letterLines: [
      (v) =>
        `Kui dinosaurused elaksid praegu, tahaksin ühega sõbraks saada. Millise ${v('sina valiksid', 'teie valiksite')}?`,
      (v) =>
        `Ma tean, et ${v('sa tead', 'te teate')} dinosaurustest palju. Kas ${v('sa oskad', 'te oskate')} öelda, milline neist oli kõige pikema kaelaga?`,
    ],
    storyObject: 'väike sõbralik dinosaurus, kes mahtus taskusse',
    storyReflection: (name) =>
      `„Isegi kõige suurem dinosaurus pidi kunagi esimest sammu õppima,“ meenutas ${name} ja naeratas.`,
    mission: (v) =>
      `${v('Ehita', 'Ehitage')} patjadest ja tekkidest dinosauruse pesa ja ${v('peida', 'peitke')} sinna kolm „muna“.`,
  },
  {
    id: 'space',
    match: /kosmos|planeet|tähed|tähistaevas|raket|astronaut/i,
    topic: 'kosmos ja tähed',
    letterLines: [
      (v) =>
        `Mõnikord loen öösiti tähti. Kui ${v('sinust saab', 'teist saavad')} kunagi ${v('astronaut', 'astronaudid')}, ${v('lehvita', 'lehvitage')} mulle!`,
      (v) =>
        `Kuulsin, et ${v('sind', 'teid')} huvitavad tähed ja planeedid. Täna õhtul ${v('vaata', 'vaadake')} aknast taevasse – võib-olla ${v('märkad', 'märkate')} ka mind.`,
    ],
    storyObject: 'hõbedane rakett, mis käivitus naeru peale',
    storyReflection: (name) =>
      `„Astronaudid ütlevad, et rahulik pea on kõige parem tööriist,“ meenutas ${name}.`,
    mission: (v) =>
      `${v('Meisterda', 'Meisterdage')} papist või paberist rakett ja ${v('anna', 'andke')} sellele uhke nimi.`,
  },
  {
    id: 'art',
    match: /joonist|maali|kunst|värvi|meisterd/i,
    topic: 'joonistamine ja meisterdamine',
    letterLines: [
      (v) =>
        `Kui ${v('sa', 'te')} täna midagi ${v('joonistad', 'joonistate')}, ${v('pane', 'pange')} see aknale – tahaksin seda väga näha.`,
      (v) =>
        `Mulle räägiti, et ${v('sinu', 'teie')} joonistused on imeilusad. Kas ${v('sa joonistaksid', 'te joonistaksite')} mulle pildi minu kodust? Ma pole seda kunagi pildil näinud!`,
    ],
    storyObject: 'võlupliiats, mille joonistused ärkasid ellu',
    storyReflection: (name) =>
      `„Kui mul oleks pliiats käepärast, joonistaksin selle hetke kohe üles,“ ütles ${name}.`,
    mission: (v) =>
      `${v('Joonista', 'Joonistage')} pilt kõige naljakamast loomast, keda ${v('suudad', 'suudate')} välja mõelda, ja ${v('anna', 'andke')} talle nimi.`,
  },
  {
    id: 'music',
    match: /muusik|laul|klaver|kitarr|viiul|tants/i,
    topic: 'muusika ja tants',
    letterLines: [
      (v) =>
        `Lindudel on sel nädalal lauluproov. Kui ${v('sa', 'te')} nendega kaasa ${v('laulad', 'laulate')}, tuleb sellest tõeline koor.`,
      (v) =>
        `Kuulsin, et ${v('sa armastad', 'te armastate')} muusikat. Kui ${v('sa täna midagi laulad', 'te täna midagi laulate')}, siis ${v('tea', 'teadke')}, et tuul kannab selle ka minuni.`,
    ],
    storyObject: 'pisike kelluke, mille hääl pani kõik tantsima',
    storyReflection: (name) =>
      `${name} ümises rõõmsalt üht lemmiklaulu – see andis alati julgust juurde.`,
    mission: (v) =>
      `${v('Mõtle', 'Mõelge')} välja lühike laul oma lemmiktoidust ja ${v('esita', 'esitage')} see õhtusöögi ajal.`,
  },
  {
    id: 'animals',
    match: /loom|koer|kass|hobu|kutsu|kiisu|lind/i,
    topic: 'loomad',
    letterLines: [
      (v) =>
        `Siil palus öelda, et ta on ${v('sinu', 'teie')} suur austaja. Kass tahtis ka midagi öelda, aga jäi magama.`,
      (v) =>
        `Ma tean, et ${v('sa hoolid', 'te hoolite')} loomadest. Metsaloomad saatsid ${v('sulle', 'teile')} tervitusi – orav lausa kaks korda!`,
    ],
    storyObject: 'targa pilguga kass, kes oskas rääkida',
    storyReflection: (name) =>
      `„Loomad teavad, et kõige tähtsam on rahu ja kannatlikkus,“ ütles ${name}. „Nüüd tean seda mina ka.“`,
    mission: (v) =>
      `${v('Mängi', 'Mängige')} loomade äraarvamist: üks näitab looma ilma sõnadeta, teised arvavad.`,
  },
  {
    id: 'books',
    match: /raamat|lugemi|lugeda/i,
    topic: 'raamatud',
    letterLines: [
      (v) =>
        `Milline on ${v('sinu', 'teie')} lemmikraamat? Mina loen praegu raamatut, mille igal leheküljel on üks saladus.`,
      (v) =>
        `Kuulsin, et ${v('sa loed', 'te loete')} hea meelega. Raamatud on nagu uksed – iga kord avaneb uus maailm.`,
    ],
    storyObject: 'raamat, mille lehtedel sõnad särasid',
    storyReflection: (name) =>
      `„See on nagu raamatus,“ mõtles ${name}. „Ja raamatutes lõpeb kõik lõpuks hästi.“`,
    mission: (v) =>
      `${v('Vali', 'Valige')} riiulist raamat ja ${v('loe', 'lugege')} sellest üks lehekülg ette mõnele mänguasjale.`,
  },
  {
    id: 'codes',
    match: /mõistat|salakood|kood|nuputa|pusle|ristsõna|male/i,
    topic: 'salakoodid ja mõistatused',
    letterLines: [
      (v) =>
        `Kuulsin, et ${v('sulle', 'teile')} meeldivad salakoodid. Siin on üks väike: 21-4-16-4. Vihje: A=1, B=2, D=3, E=4 ja nii edasi.`,
      (v) =>
        `Mõistatused teevad aju tugevaks nagu trenn teeb jalad tugevaks. ${v('Sinu', 'Teie')} aju on vist juba päris muskliline!`,
      (v) =>
        `Mulle sosistati, et ${v('sa oled', 'te olete')} mõistatuste lahendamises tõeline meister. Seepärast võin ${v('sinult', 'teilt')} varsti abi paluda ühe väga keerulise ülesandega.`,
    ],
    storyObject: 'salakirjaga kaetud kaart',
    storyReflection: (name) =>
      `„Iga mõistatus on nagu salakood – tuleb lihtsalt leida võti,“ lisas ${name} naeratades.`,
    mission: (v) =>
      `${v('Mõtle', 'Mõelge')} välja oma salakiri ja ${v('kirjuta', 'kirjutage')} sellega üks lause. Kas keegi perest suudab selle lahendada?`,
  },
  {
    id: 'water',
    match: /uju|meri|rand|kala/i,
    topic: 'ujumine ja vesi',
    letterLines: [
      (v) =>
        `Kui ${v('sa', 'te')} järgmine kord vees ${v('oled', 'olete')}, ${v('proovi', 'proovige')} teha vee all kõige suurem mull.`,
      (v) =>
        `Kuulsin, et ${v('sulle', 'teile')} meeldib vees sulistada. Kalad räägivad, et ${v('sa oled', 'te olete')} peaaegu sama osav kui nemad!`,
    ],
    storyObject: 'karbike, mille sees kohises meri',
    storyReflection: (name) =>
      `„See oli peaaegu sama põnev kui esimene sukeldumine,“ naeris ${name}.`,
    mission: (v) =>
      `${v('Korralda', 'Korraldage')} kausi juures paberpaatide võistlus – milline paat jõuab puhumisega kõige kaugemale?`,
  },
  {
    id: 'vehicles',
    match: /auto|rong|traktor|lennuk|buss/i,
    topic: 'autod ja rongid',
    letterLines: [
      (v) =>
        `Kui ${v('sa saaksid', 'te saaksite')} juhtida ükskõik millist sõidukit, mis see oleks? Mina valiksin pilvede peal sõitva rongi.`,
      (v) =>
        `Mulle räägiti, et ${v('sa tead', 'te teate')} autodest ja rongidest väga palju. Meie juures sõidab üks pisike rong, mis teeb „tuut-tuut“ ainult reedeti.`,
    ],
    storyObject: 'pisike rong, mis sõitis pilvede peal',
    storyReflection: (name) =>
      `„Täpselt nagu rongiga – kui rööpad on õiged, läheb kõik ladusalt,“ ütles ${name}.`,
    mission: (v) =>
      `${v('Ehita', 'Ehitage')} toolidest rong ja ${v('sõida', 'sõitke')} sellega väljamõeldud linna. Mida seal näha on?`,
  },
  {
    id: 'nature',
    match: /loodus|mets|seen|marja|matk/i,
    topic: 'loodus',
    letterLines: [
      () =>
        `Mets on nagu suur raamat – iga kivi ja lehe all on peidus mõni lugu.`,
      (v) =>
        `Ma tean, et ${v('sulle', 'teile')} meeldib loodust avastada. Järgmisel jalutuskäigul ${v('otsi', 'otsige')} kivi, mis näeb välja nagu süda.`,
    ],
    storyObject: 'kompass, mis näitas alati metsa saladuste poole',
    storyReflection: (name) =>
      `„Loodus annab alati vihjeid, kui oskad vaadata,“ ütles ${name} targalt.`,
    mission: (v) =>
      `${v('Korja', 'Korjake')} õuest viis erinevat lehte või kivi ja ${v('sea', 'seadke')} need suuruse järjekorda.`,
  },
]

export function findInterestHooks(texts: string[]): InterestHook[] {
  const found: InterestHook[] = []
  for (const text of texts) {
    for (const hook of INTEREST_HOOKS) {
      if (hook.match.test(text) && !found.includes(hook)) found.push(hook)
    }
  }
  return found
}

/** Sentence for an interest that has no dedicated hook. Uses quotes to keep the nominative. */
export function genericInterestLine(interest: string, v: Say): string {
  return `Mulle räägiti ${v('sinu', 'teie')} lemmikutest: „${interest}“. See teeb mind väga uudishimulikuks!`
}

export function foodLines(food: string, v: Say): string[] {
  if (/riisipu/i.test(food)) {
    return [
      `Kuulsin, et kõigist pudrudest ${v('sööd sa', 'sööte te')} kõige meelsamini riisiputru. Minu arvates on see ka kõige maagilisem puder – sellest saab jõudu terveks päevaks!`,
      `Täna keetsin endale riisiputru ja mõtlesin kohe ${v('sinule', 'teile')}. Kas ${v('sina', 'teie')} paned sinna ka moosi või kaneeli?`,
      `Mul on üks saladus: kui riisipudrule natuke kaneeli puistata, maitseb see nagu pidupäev. ${v('Proovi', 'Proovige')}!`,
    ]
  }
  return [
    `Mulle räägiti, et ${v('sinu', 'teie')} lemmiktoit on „${food}“. Mmm, see kõlab nii maitsvalt, et kõht hakkas korisema!`,
    `Kui ma kunagi ${v('sinu', 'teie')} juurde külla tulen, kas ${v('pakuksid', 'pakuksite')} mulle ka oma lemmiktoitu – „${food}“?`,
  ]
}
