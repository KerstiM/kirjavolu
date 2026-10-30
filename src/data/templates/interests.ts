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
  /** Story sentence where the child uses this interest to solve a problem. */
  storySolve: (name: string) => string
  mission: (v: Say) => string
}

export const INTEREST_HOOKS: InterestHook[] = [
  {
    id: 'rubik',
    match: /rubik|kuubik/i,
    topic: 'Rubiku kuubik',
    letterLines: [
      (v) =>
        `Kuulsin, et ${v('sa oskad', 'te oskate')} Rubiku kuubikut lahendada. Meie juures peetakse seda peaaegu võlukunstiks!`,
      (v) =>
        `Mul on üks küsimus: mitu minutit kulub ${v('sul', 'teil')} praegu kuubiku lahendamiseks? ${v('Kirjuta', 'Kirjutage')} oma aeg paberile ja ${v('jäta', 'jätke')} see mulle.`,
    ],
    storyObject: 'võlukuubik, mille iga keeramine avas uue ukse',
    storySolve: (name) =>
      `${name} võttis võlukuubiku, keeras seda paar korda ja – klõps! – kõik värvid loksusid paika. Samal hetkel avanes salauks.`,
    mission: (v) =>
      `${v('Keera', 'Keerake')} Rubiku kuubikul üks tahk ühevärviliseks ja ${v('võta', 'võtke')} aega. Homme ${v('proovi', 'proovige')} oma rekordit ületada!`,
  },
  {
    id: 'comics',
    match: /miki|mickey|koomiks|donald/i,
    topic: 'Miki Hiire koomiksid',
    letterLines: [
      (v) =>
        `Ma tean, et ${v('sulle', 'teile')} meeldivad Miki Hiire koomiksid. Minu lemmikud on need lood, kus kõik läheb natuke viltu, aga lõpuks laheneb nutikalt – täpselt nagu päriselus.`,
      (v) =>
        `Kui ${v('sa järgmine kord koomiksit loed, otsi', 'te järgmine kord koomiksit loete, otsige')} üles kõige naljakam pilt ja ${v('näita', 'näidake')} seda kellelegi, kes vajab head naeru.`,
    ],
    storyObject: 'vana koomiksiraamat, mille pildid oskasid liikuda',
    storySolve: (name) =>
      `${name} meenutas üht Miki Hiire koomiksit, kus kangelane lahendas sekelduse nutika plaaniga. „Teeme sama!“ hüüdis ${name}.`,
    mission: (v) =>
      `${v('Joonista', 'Joonistage')} oma koomiks kolmest pildist: algus, sekeldus ja lõpp. Peategelane võib olla keegi ${v('sinu', 'teie')} perest.`,
  },
  {
    id: 'lego',
    match: /lego|klots/i,
    topic: 'LEGO klotsid',
    letterLines: [
      (v) =>
        `Kuulsin, et ${v('sa oled', 'te olete')} osav ehitaja. Kas ${v('sa suudaksid', 'te suudaksite')} ehitada klotsidest maja ka ühele väikesele võlurile?`,
    ],
    storyObject: 'klotsidest ehitatud lennumasin',
    storySolve: (name) =>
      `${name} hakkas kiiresti klotse ühendama. Varsti seisis kõigi ees sild, mis oli täpselt paraja pikkusega, et üle kuristiku minna.`,
    mission: (v) =>
      `${v('Ehita', 'Ehitage')} klotsidest kõige kõrgem torn, mis ise püsti püsib. ${v('Mõõda', 'Mõõtke')} see ära ja ${v('pane', 'pange')} tulemus kirja!`,
  },
  {
    id: 'ball',
    match: /jalgpall|korvpall|pall|sport|trenn|jooks/i,
    topic: 'pallimängud ja sport',
    letterLines: [
      (v) =>
        `Mulle räägiti, et ${v('sa oled', 'te olete')} väga osav liikuja. Meiegi harjutame palli mängida – ainult et meie pall on pisike nagu hernes ja kipub ära kaduma.`,
    ],
    storyObject: 'kuldne pall, mis põrkas alati õiges suunas',
    storySolve: (name) =>
      `${name} võttis hoogu, sihtis ja lõi palli täpselt läbi kitsa ava. Kõlas kõlin ja värav avanes.`,
    mission: (v) =>
      `${v('Korralda', 'Korraldage')} täna väike pallivõistlus: mitu korda järjest ${v('suudad', 'suudate')} palli üles visata ja kinni püüda?`,
  },
  {
    id: 'dinosaurs',
    match: /dino/i,
    topic: 'dinosaurused',
    letterLines: [
      (v) =>
        `Ma tean, et ${v('sa tead', 'te teate')} dinosaurustest palju. Kas ${v('sa oskad', 'te oskate')} öelda, milline neist oli kõige pikema kaelaga?`,
    ],
    storyObject: 'väike sõbralik dinosaurus, kes mahtus taskusse',
    storySolve: (name) =>
      `${name} tundis porisel rajal kohe jäljed ära. „Need on dinosauruse jäljed!“ ütles ${name} ja juhatas teised õigele teele.`,
    mission: (v) =>
      `${v('Ehita', 'Ehitage')} patjadest ja tekkidest dinosauruse pesa ja ${v('peida', 'peitke')} sinna kolm „muna“.`,
  },
  {
    id: 'space',
    match: /kosmos|planeet|tähed|tähistaevas|raket|astronaut/i,
    topic: 'kosmos ja tähed',
    letterLines: [
      (v) =>
        `Kuulsin, et ${v('sind', 'teid')} huvitavad tähed ja planeedid. Täna õhtul ${v('vaata', 'vaadake')} aknast taevasse – võib-olla ${v('märkad', 'märkate')} ka mind.`,
    ],
    storyObject: 'hõbedane rakett, mis käivitus naeru peale',
    storySolve: (name) =>
      `${name} vaatas taevasse ja leidis tähtede seast tuttava tähtkuju. „Sinna poole peame minema!“ hüüdis ${name}.`,
    mission: (v) =>
      `${v('Meisterda', 'Meisterdage')} papist või paberist rakett ja ${v('anna', 'andke')} sellele uhke nimi.`,
  },
  {
    id: 'art',
    match: /joonist|maali|kunst|värvi|meisterd/i,
    topic: 'joonistamine ja meisterdamine',
    letterLines: [
      (v) =>
        `Mulle räägiti, et ${v('sinu', 'teie')} joonistused on imeilusad. Kas ${v('sa joonistaksid', 'te joonistaksite')} mulle pildi minu kodust? Ma pole seda kunagi pildil näinud!`,
    ],
    storyObject: 'võlupliiats, mille joonistused ärkasid ellu',
    storySolve: (name) =>
      `${name} võttis võlupliiatsi ja joonistas õhku ukse. Joonistus muutus päris ukseks ja avanes kriuksudes.`,
    mission: (v) =>
      `${v('Joonista', 'Joonistage')} pilt kõige naljakamast loomast, keda ${v('suudad', 'suudate')} välja mõelda, ja ${v('anna', 'andke')} talle nimi.`,
  },
  {
    id: 'music',
    match: /muusik|laul|klaver|kitarr|viiul|tants/i,
    topic: 'muusika ja tants',
    letterLines: [
      (v) =>
        `Kuulsin, et ${v('sa armastad', 'te armastate')} muusikat. Kui ${v('sa täna midagi laulad', 'te täna midagi laulate')}, siis ${v('tea', 'teadke')}, et tuul kannab selle ka minuni.`,
    ],
    storyObject: 'pisike kelluke, mille hääl pani kõik tantsima',
    storySolve: (name) =>
      `${name} hakkas laulma. Viis oli nii lõbus, et isegi pahur väravavalvur hakkas jalga keerutama ja unustas, miks ta tee oli sulgenud.`,
    mission: (v) =>
      `${v('Mõtle', 'Mõelge')} välja lühike laul oma lemmiktoidust ja ${v('esita', 'esitage')} see õhtusöögi ajal.`,
  },
  {
    id: 'animals',
    match: /loom|koer|kass|hobu|kutsu|kiisu|lind/i,
    topic: 'loomad',
    letterLines: [
      (v) =>
        `Ma tean, et ${v('sa hoolid', 'te hoolite')} loomadest. Metsaloomad saatsid ${v('sulle', 'teile')} tervitusi – orav lausa kaks korda!`,
    ],
    storyObject: 'targa pilguga kass, kes oskas rääkida',
    storySolve: (name) =>
      `${name} kükitas maha ja rääkis väikese loomaga nii rahulikult, et too julges lõpuks lähemale tulla ja näitas teed.`,
    mission: (v) =>
      `${v('Mängi', 'Mängige')} loomade äraarvamist: üks näitab looma ilma sõnadeta, teised arvavad.`,
  },
  {
    id: 'books',
    match: /raamat|lugemi|lugeda/i,
    topic: 'raamatud',
    letterLines: [
      (v) =>
        `Kuulsin, et ${v('sa loed', 'te loete')} hea meelega. Raamatud on nagu uksed – iga kord avaneb uus maailm.`,
    ],
    storyObject: 'raamat, mille lehtedel sõnad särasid',
    storySolve: (name) =>
      `${name} mäletas üht raamatut, kus oli täpselt samasugune mure. Lahendus oli kogu aeg olnud otse nina all!`,
    mission: (v) =>
      `${v('Vali', 'Valige')} riiulist raamat ja ${v('loe', 'lugege')} sellest üks lehekülg ette mõnele mänguasjale.`,
  },
  {
    id: 'codes',
    match: /mõistat|salakood|kood|nuputa|pusle|ristsõna|male/i,
    topic: 'salakoodid ja mõistatused',
    letterLines: [
      (v) =>
        `Mulle sosistati, et ${v('sa oled', 'te olete')} mõistatuste lahendamises tõeline meister. Seepärast võin ${v('sinult', 'teilt')} varsti abi paluda ühe väga keerulise ülesandega.`,
    ],
    storyObject: 'salakirjaga kaetud kaart',
    storySolve: (name) =>
      `${name} uuris salakirja hoolikalt ja märkas, et iga täht oli nihkunud ühe võrra edasi. Mõne hetkega oli kood lahendatud!`,
    mission: (v) =>
      `${v('Mõtle', 'Mõelge')} välja oma salakiri ja ${v('kirjuta', 'kirjutage')} sellega üks lause. Kas keegi perest suudab selle lahendada?`,
  },
  {
    id: 'water',
    match: /uju|meri|rand|kala/i,
    topic: 'ujumine ja vesi',
    letterLines: [
      (v) =>
        `Kuulsin, et ${v('sulle', 'teile')} meeldib vees sulistada. Kalad räägivad, et ${v('sa oled', 'te olete')} peaaegu sama osav kui nemad!`,
    ],
    storyObject: 'karbike, mille sees kohises meri',
    storySolve: (name) =>
      `${name} ei kartnud vett. Paari julge tõmbega jõudis ${name} teisele kaldale ja tõi sealt köie, mis aitas kõik üle.`,
    mission: (v) =>
      `${v('Korralda', 'Korraldage')} kausi juures paberpaatide võistlus – milline paat jõuab puhumisega kõige kaugemale?`,
  },
  {
    id: 'vehicles',
    match: /auto|rong|traktor|lennuk|buss/i,
    topic: 'autod ja rongid',
    letterLines: [
      (v) =>
        `Mulle räägiti, et ${v('sa tead', 'te teate')} autodest ja rongidest väga palju. Meie juures sõidab üks pisike rong, mis teeb „tuut-tuut“ ainult reedeti.`,
    ],
    storyObject: 'pisike rong, mis sõitis pilvede peal',
    storySolve: (name) =>
      `${name} märkas, et rööpad olid valesti pööratud. Üks tugev tõmme kangist ja rong sai jälle õigele teele.`,
    mission: (v) =>
      `${v('Ehita', 'Ehitage')} toolidest rong ja ${v('sõida', 'sõitke')} sellega väljamõeldud linna. Mida seal näha on?`,
  },
  {
    id: 'nature',
    match: /loodus|mets|seen|marja|matk/i,
    topic: 'loodus',
    letterLines: [
      (v) =>
        `Ma tean, et ${v('sulle', 'teile')} meeldib loodust avastada. Järgmisel jalutuskäigul ${v('otsi', 'otsige')} kivi, mis näeb välja nagu süda.`,
    ],
    storyObject: 'kompass, mis näitas alati metsa saladuste poole',
    storySolve: (name) =>
      `${name} märkas samblal pisikesi jälgi, mida keegi teine polnud tähele pannud. Need viisid otse peidetud rajale.`,
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

export function foodLine(food: string, v: Say): string {
  if (/riisipu/i.test(food)) {
    return `Kuulsin, et kõigist pudrudest ${v('sööd sa', 'sööte te')} kõige meelsamini riisiputru. Minu arvates on see ka kõige maagilisem puder – sellest saab jõudu terveks päevaks!`
  }
  return `Mulle räägiti, et ${v('sinu', 'teie')} lemmiktoit on „${food}“. Mmm, see kõlab nii maitsvalt, et kõht hakkas korisema!`
}
