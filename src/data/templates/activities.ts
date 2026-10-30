import type { OccasionId } from '../../domain/models'
import type { Say } from './interests'

export type MaterialId =
  | 'paper'
  | 'colors'
  | 'scissors'
  | 'glue'
  | 'blocks'
  | 'ball'
  | 'kitchen'
  | 'books'
  | 'blankets'
  | 'nature'

export const MATERIAL_LABELS: Record<MaterialId, string> = {
  paper: 'paber',
  colors: 'pliiatsid või värvid',
  scissors: 'käärid',
  glue: 'liim',
  blocks: 'klotsid',
  ball: 'pall',
  kitchen: 'köögitarbed ja toiduained',
  books: 'raamatud',
  blankets: 'tekid ja padjad',
  nature: 'looduslik materjal',
}

export interface Activity {
  id: string
  title: string
  text: (v: Say) => string
  setting: 'indoor' | 'outdoor' | 'any'
  materials: MaterialId[]
  minutes: number
  minAge: number
  occasions?: OccasionId[]
}

export const ACTIVITIES: Activity[] = [
  // Jõulud
  { id: 'gingerbread', title: 'Piparkoogitöökoda', text: (v) => `${v('Küpseta', 'Küpsetage')} koos täiskasvanuga piparkooke ja ${v('kaunista', 'kaunistage')} need glasuuriga. Kes teeb kõige naljakama kujuga koogi?`, setting: 'indoor', materials: ['kitchen'], minutes: 45, minAge: 3, occasions: ['christmas'] },
  { id: 'snowflakes', title: 'Paberist lumehelbed', text: (v) => `${v('Voldi', 'Voldige')} paber kolmnurgaks, ${v('lõika', 'lõigake')} servadesse mustreid ja ${v('ava', 'avage')} – iga lumehelves tuleb ainulaadne!`, setting: 'indoor', materials: ['paper', 'scissors'], minutes: 20, minAge: 5, occasions: ['christmas'] },
  { id: 'xmas-card', title: 'Jõulukaart vanavanematele', text: (v) => `${v('Joonista', 'Joonistage')} jõulukaart ja ${v('kirjuta', 'kirjutage')} sinna üks soe soov. Kaardi võib postiga saata või ise üle anda.`, setting: 'indoor', materials: ['paper', 'colors'], minutes: 20, minAge: 3, occasions: ['christmas'] },
  { id: 'ornaments', title: 'Kuuseehete loendus', text: (v) => `${v('Loe', 'Lugege')} kokku, mitu punast ehet on kuusel. Aga mitu kuldset? Kumba on rohkem?`, setting: 'indoor', materials: [], minutes: 10, minAge: 3, occasions: ['christmas'] },
  { id: 'carols', title: 'Jõululaulude õhtu', text: (v) => `${v('Vali', 'Valige')} kolm lemmikut jõululaulu ja ${v('laula', 'laulge')} need koos perega. Kes oskab kõige rohkem salme peast?`, setting: 'indoor', materials: [], minutes: 20, minAge: 1, occasions: ['christmas'] },
  { id: 'elf-deed', title: 'Salajane päkapikutegu', text: (v) => `${v('Tee', 'Tehke')} täna kellelegi heategu nii, et ta ei saa teada, kes see oli – täpselt nagu päkapikud.`, setting: 'any', materials: [], minutes: 10, minAge: 4, occasions: ['christmas'] },
  { id: 'snowman', title: 'Lumememm või padjamemm', text: (v) => `Kui õues on lund, ${v('ehita', 'ehitage')} lumememm. Kui lund pole, ${v('ehita', 'ehitage')} toas patjadest „padjamemm“ ja ${v('pane', 'pange')} talle müts pähe.`, setting: 'any', materials: [], minutes: 45, minAge: 2, occasions: ['christmas', 'vastlapaev'] },
  { id: 'candle-stories', title: 'Küünlavalgel jutud', text: (v) => `Täiskasvanu süütab küünla. ${v('Räägi', 'Rääkige')} kordamööda, mis oli sel aastal kõige toredam hetk.`, setting: 'indoor', materials: [], minutes: 20, minAge: 3, occasions: ['christmas'] },
  { id: 'wrapping', title: 'Pakkimistöökoda', text: (v) => `${v('Paki', 'Pakkige')} paberisse mõni pisike asi ja ${v('kaunista', 'kaunistage')} pakk ise joonistatud mustritega.`, setting: 'indoor', materials: ['paper', 'colors'], minutes: 20, minAge: 4, occasions: ['christmas', 'birthday'] },
  // Lihavõtted
  { id: 'onion-eggs', title: 'Munade värvimine', text: (v) => `${v('Värvi', 'Värvige')} täiskasvanuga mune sibulakoortega. Enne keetmist ${v('aseta', 'asetage')} muna peale väike leht või lill – sellest jääb ilus muster.`, setting: 'indoor', materials: ['kitchen', 'nature'], minutes: 45, minAge: 3, occasions: ['easter'] },
  { id: 'egg-hunt', title: 'Toa munajaht', text: (v) => `Täiskasvanu peidab tuppa kümme muna või munakujulist asja. Kui kiiresti ${v('leiad', 'leiate')} kõik üles?`, setting: 'indoor', materials: [], minutes: 20, minAge: 2, occasions: ['easter'] },
  { id: 'willow', title: 'Pajuoksad vette', text: (v) => `${v('Pane', 'Pange')} vaasi paar pajuoksa ja ${v('jälgi', 'jälgige')} iga päev, kuidas pungad avanevad.`, setting: 'any', materials: ['nature'], minutes: 10, minAge: 2, occasions: ['easter'] },
  // Halloween
  { id: 'pumpkin', title: 'Kõrvitsalatern', text: (v) => `${v('Joonista', 'Joonistage')} kõrvitsale nägu. Täiskasvanu lõikab selle välja ja ${v('sina', 'teie')} ${v('kraabid', 'kraabite')} lusikaga seemned välja.`, setting: 'indoor', materials: ['kitchen'], minutes: 45, minAge: 4, occasions: ['halloween'] },
  { id: 'flashlight', title: 'Taskulambijutud', text: (v) => `${v('Pane', 'Pange')} tuled kustu, ${v('võta', 'võtke')} taskulamp ja ${v('räägi', 'rääkige')} kordamööda kõhedalt naljakaid jutte.`, setting: 'indoor', materials: [], minutes: 20, minAge: 4, occasions: ['halloween'] },
  // Mardi- ja kadripäev
  { id: 'sant-costume', title: 'Sandiriietus', text: (v) => `${v('Meisterda', 'Meisterdage')} endale sandiriietus. Mardisandid kandsid tumedaid riideid ja tagurpidi kasukat, kadrisandid valgeid riideid.`, setting: 'indoor', materials: ['blankets'], minutes: 45, minAge: 3, occasions: ['mardi-kadri'] },
  { id: 'wishes', title: 'Õnnesoovid sandina', text: (v) => `${v('Mõtle', 'Mõelge')} välja kolm head soovi, mida sandina perele öelda – näiteks soe kodu, rõõmus meel või kõrge lõngakera.`, setting: 'any', materials: [], minutes: 10, minAge: 4, occasions: ['mardi-kadri'] },
  { id: 'nut-game', title: 'Pähklite peitmine', text: (v) => `Täiskasvanu peidab tuppa peotäie pähkleid või õunu – sandipäeva maiustusi. ${v('Otsi', 'Otsige')} need üles ja ${v('jaga', 'jagage')} võrdselt.`, setting: 'indoor', materials: [], minutes: 20, minAge: 3, occasions: ['mardi-kadri'] },
  { id: 'grandparents', title: 'Vanaema ja vanaisa lood', text: (v) => `${v('Küsi', 'Küsige')} vanavanematelt, kuidas nemad lapsena mardi- või kadrisandiks käisid ja mida nad laulsid.`, setting: 'any', materials: [], minutes: 20, minAge: 4, occasions: ['mardi-kadri'] },
  // Vastlapäev
  { id: 'sledding', title: 'Pikk liug', text: (v) => `${v('Mine', 'Minge')} liumäele! Vana kombe järgi tuleb lasta võimalikult pikk liug, et lina kasvaks pikk.`, setting: 'outdoor', materials: [], minutes: 45, minAge: 2, occasions: ['vastlapaev'] },
  { id: 'vurr', title: 'Vastlavurr', text: (v) => `${v('Aja', 'Ajage')} suurest nööbist läbi nöör, ${v('seo', 'siduge')} otsad kokku ja ${v('keeruta', 'keerutage')} – vurr hakkab vurisema nagu vanasti!`, setting: 'indoor', materials: [], minutes: 20, minAge: 5, occasions: ['vastlapaev'] },
  { id: 'buns', title: 'Vastlakuklid', text: (v) => `${v('Täida', 'Täitke')} koos täiskasvanuga kuklid vahukoore ja moosiga. Kes teeb kõige kõrgema kukli?`, setting: 'indoor', materials: ['kitchen'], minutes: 45, minAge: 3, occasions: ['vastlapaev'] },
  // Sõbrapäev
  { id: 'friend-card', title: 'Sõbrakaart', text: (v) => `${v('Meisterda', 'Meisterdage')} kaart ühele sõbrale ja ${v('kirjuta', 'kirjutage')} sinna, mis on temas kõige toredam.`, setting: 'indoor', materials: ['paper', 'colors'], minutes: 20, minAge: 3, occasions: ['valentines'] },
  { id: 'compliments', title: 'Komplimendiring', text: (v) => `${v('Istu', 'Istuge')} perega ringi ja ${v('ütle', 'öelge')} igaühele üks siiras kompliment.`, setting: 'any', materials: [], minutes: 10, minAge: 3, occasions: ['valentines'] },
  { id: 'kindness', title: 'Heategude päev', text: (v) => `${v('Proovi', 'Proovige')} täna teha kolm heategu. Õhtul ${v('räägi', 'rääkige')}, kuidas see tundus.`, setting: 'any', materials: [], minutes: 10, minAge: 4, occasions: ['valentines', 'everyday'] },
  // Kooliaasta
  { id: 'school-dream', title: 'Minu kooliaasta unistus', text: (v) => `${v('Joonista', 'Joonistage')}, mida ${v('tahaksid', 'tahaksite')} sel kooliaastal õppida või teha.`, setting: 'indoor', materials: ['paper', 'colors'], minutes: 20, minAge: 5, occasions: ['school-start'] },
  { id: 'pack-bag', title: 'Koolikoti võistlus', text: (v) => `Kui kiiresti ${v('suudad', 'suudate')} koolikoti õigesti pakkida? Täiskasvanu ütleb asjad ette, ${v('sina', 'teie')} ${v('otsid', 'otsite')} need üles.`, setting: 'indoor', materials: [], minutes: 10, minAge: 6, occasions: ['school-start'] },
  // Suvi
  { id: 'nature-bingo', title: 'Loodusbingo', text: (v) => `${v('Otsi', 'Otsige')} õuest: käbi, sulg, kollane lill, sammal, sile kivi, sipelgas, linnulaul, kolme lehega taim ja midagi punast. Iga leiu eest üks rist!`, setting: 'outdoor', materials: ['nature'], minutes: 45, minAge: 3, occasions: ['summer'] },
  { id: 'paper-boats', title: 'Paberpaatide regatt', text: (v) => `${v('Voldi', 'Voldige')} paberist paadid ja ${v('lase', 'laske')} need vette – kausis, lombis või ojas. Kelle paat sõidab kõige kaugemale?`, setting: 'any', materials: ['paper'], minutes: 20, minAge: 4, occasions: ['summer'] },
  { id: 'picnic', title: 'Pere piknik', text: (v) => `${v('Valmista', 'Valmistage')} koos võileivad, ${v('võta', 'võtke')} tekk kaasa ja ${v('mine', 'minge')} piknikule kasvõi oma hoovi.`, setting: 'outdoor', materials: ['kitchen', 'blankets'], minutes: 45, minAge: 1, occasions: ['summer'] },
  { id: 'clouds', title: 'Pilvede vaatlus', text: (v) => `${v('Heida', 'Heitke')} murule pikali ja ${v('otsi', 'otsige')} pilvede seast loomi, laevu ja nägusid.`, setting: 'outdoor', materials: [], minutes: 10, minAge: 2, occasions: ['summer'] },
  { id: 'stones', title: 'Kivimaalid', text: (v) => `${v('Korja', 'Korjake')} siledaid kive ja ${v('maali', 'maalige')} neile mustrid, loomad või naerunäod.`, setting: 'any', materials: ['nature', 'colors'], minutes: 20, minAge: 3, occasions: ['summer'] },
  { id: 'tent', title: 'Telgilaager', text: (v) => `${v('Ehita', 'Ehitage')} tekkidest telk – toas või õues – ja ${v('loe', 'lugege')} seal taskulambi valgel üks lugu.`, setting: 'any', materials: ['blankets'], minutes: 45, minAge: 2, occasions: ['summer', 'everyday'] },
  { id: 'herbarium', title: 'Lillede herbaarium', text: (v) => `${v('Korja', 'Korjake')} viis erinevat lille, ${v('pane', 'pange')} need raamatu vahele kuivama ja ${v('kirjuta', 'kirjutage')} nädala pärast nimed juurde.`, setting: 'outdoor', materials: ['nature', 'books'], minutes: 20, minAge: 5, occasions: ['summer'] },
  { id: 'bugs', title: 'Putukasafari', text: (v) => `${v('Võta', 'Võtke')} luup või tühi purk ja ${v('otsi', 'otsige')} aiast viis eri putukat. Pärast ${v('lase', 'laske')} nad vabaks!`, setting: 'outdoor', materials: [], minutes: 20, minAge: 3, occasions: ['summer'] },
  // Piimahammas
  { id: 'brush-song', title: 'Hambapesulaul', text: (v) => `${v('Mõtle', 'Mõelge')} välja lühike laul, mida hambaid pestes ümiseda. Laul peab kestma kaks minutit – täpselt nii kaua, kui hambaid peab pesema.`, setting: 'indoor', materials: [], minutes: 10, minAge: 3, occasions: ['lost-tooth'] },
  // Igal ajal
  { id: 'fort', title: 'Patjadest kindlus', text: (v) => `${v('Ehita', 'Ehitage')} patjadest ja tekkidest kindlus. ${v('Anna', 'Andke')} kindlusele nimi ja ${v('mõtle', 'mõelge')} välja salasõna, millega sisse pääseb.`, setting: 'indoor', materials: ['blankets'], minutes: 45, minAge: 2 },
  { id: 'tower', title: 'Torniehitus', text: (v) => `Kes ehitab klotsidest kõige kõrgema torni, mis ise püsti püsib? ${v('Mõõda', 'Mõõtke')} tulemus!`, setting: 'indoor', materials: ['blocks'], minutes: 20, minAge: 2 },
  { id: 'shadow', title: 'Varjuteater', text: (v) => `${v('Suuna', 'Suunake')} taskulamp seinale ja ${v('tee', 'tehke')} kätega varjuloomi. Kas keegi arvab ära, mis loom see on?`, setting: 'indoor', materials: [], minutes: 20, minAge: 3 },
  { id: 'drawing-chain', title: 'Joonistuse jätkulugu', text: (v) => `Üks alustab joonistust, teine jätkab ja kolmas lõpetab. Mis tuli välja? ${v('Mõtle', 'Mõelge')} pildile pealkiri.`, setting: 'indoor', materials: ['paper', 'colors'], minutes: 20, minAge: 3 },
  { id: 'sandwich-art', title: 'Võileivakunst', text: (v) => `${v('Tee', 'Tehke')} võileivale nägu kurgi, tomati ja juustu abil. Kes teeb kõige naljakama näo?`, setting: 'indoor', materials: ['kitchen'], minutes: 20, minAge: 3 },
  { id: 'reading', title: 'Raamatuõhtu', text: (v) => `${v('Vali', 'Valige')} raamat ja ${v('loe', 'lugege')} koos. Pärast ${v('joonista', 'joonistage')} oma lemmikkoht loost.`, setting: 'indoor', materials: ['books'], minutes: 20, minAge: 1 },
  { id: 'dance', title: 'Tantsupidu', text: (v) => `${v('Pane', 'Pange')} mängima lemmikmuusika ja ${v('tantsi', 'tantsige')}. Kui muusika peatub, tuleb tarduda nagu kuju!`, setting: 'indoor', materials: [], minutes: 10, minAge: 1 },
  { id: 'listening', title: 'Kuulamismäng', text: (v) => `${v('Pane', 'Pange')} silmad kinni ja ${v('kuula', 'kuulake')} üks minut. Mitu erinevat häält ${v('kuulsid', 'kuulsite')}?`, setting: 'any', materials: [], minutes: 10, minAge: 2 },
  { id: 'mirror', title: 'Peegelmäng', text: (v) => `Üks teeb liigutusi, teine kordab nagu peegel. ${v('Vaheta', 'Vahetage')} rolle!`, setting: 'any', materials: [], minutes: 10, minAge: 2 },
  { id: 'riddles', title: 'Mõistatuste õhtu', text: (v) => `${v('Mõtle', 'Mõelge')} välja kolm mõistatust kodus leiduvate asjade kohta ja ${v('lase', 'laske')} teistel ära arvata.`, setting: 'any', materials: [], minutes: 20, minAge: 5 },
  { id: 'planes', title: 'Paberlennukite võistlus', text: (v) => `${v('Voldi', 'Voldige')} paberlennukid ja ${v('vaata', 'vaadake')}, kelle oma lendab kõige kaugemale. ${v('Proovi', 'Proovige')} erinevaid voltimisviise!`, setting: 'any', materials: ['paper'], minutes: 20, minAge: 4 },
  { id: 'obstacle', title: 'Takistusrada', text: (v) => `${v('Ehita', 'Ehitage')} toast takistusrada: üle padja, laua alt läbi, ümber tooli. Täiskasvanu võtab aega!`, setting: 'indoor', materials: ['blankets'], minutes: 20, minAge: 2 },
  { id: 'ball-games', title: 'Pallimängud', text: (v) => `${v('Mängi', 'Mängige')} õues palli: viska, püüa ja ${v('loe', 'lugege')}, mitu korda järjest õnnestub.`, setting: 'outdoor', materials: ['ball'], minutes: 20, minAge: 2 },
  { id: 'color-walk', title: 'Värvijaht', text: (v) => `${v('Mine', 'Minge')} jalutama ja ${v('otsi', 'otsige')} kõigi vikerkaarevärvide asju: punane, oranž, kollane, roheline, sinine ja lilla.`, setting: 'outdoor', materials: [], minutes: 20, minAge: 2 },
  { id: 'collage', title: 'Unistuste kollaaž', text: (v) => `${v('Lõika', 'Lõigake')} vanadest ajakirjadest pilte ja ${v('kleebi', 'kleepige')} neist kokku pilt oma unistuste päevast.`, setting: 'indoor', materials: ['paper', 'scissors', 'glue'], minutes: 45, minAge: 5 },
  { id: 'gratitude', title: 'Tänulikkuse purk', text: (v) => `${v('Kirjuta', 'Kirjutage')} või ${v('joonista', 'joonistage')} paberile üks asi, mille eest ${v('oled', 'olete')} täna tänulik, ja ${v('pane', 'pange')} see purki.`, setting: 'indoor', materials: ['paper'], minutes: 10, minAge: 4 },
  { id: 'memory', title: 'Isetehtud mälumäng', text: (v) => `${v('Joonista', 'Joonistage')} kaheksale kaardile neli paari pilte ja ${v('mängi', 'mängige')} nendega mälumängu.`, setting: 'indoor', materials: ['paper', 'colors', 'scissors'], minutes: 20, minAge: 4 },
  { id: 'concert', title: 'Kodune kontsert', text: (v) => `${v('Korralda', 'Korraldage')} perele kontsert: laulud, pillid potikaantest ja kummardus lõpus!`, setting: 'indoor', materials: [], minutes: 20, minAge: 1 },
  { id: 'i-spy', title: 'Ma näen midagi…', text: (v) => `${v('Mängi', 'Mängige')} mängu „Ma näen midagi, mis on…“ ja ${v('ütle', 'öelge')} ainult värv või kuju. Teised arvavad.`, setting: 'any', materials: [], minutes: 10, minAge: 3 },
  { id: 'puppets', title: 'Nukuteater', text: (v) => `${v('Vali', 'Valige')} lemmikmuinasjutt ja ${v('mängi', 'mängige')} see mänguasjadega ette. Lõpp võib olla täiesti uus!`, setting: 'indoor', materials: [], minutes: 45, minAge: 3 },
  { id: 'chalk', title: 'Kriidikunst', text: (v) => `${v('Joonista', 'Joonistage')} kriitidega asfaldile suur pilt või keksukast ja ${v('kutsu', 'kutsuge')} teised mängima.`, setting: 'outdoor', materials: ['colors'], minutes: 20, minAge: 2 },
  { id: 'bubbles', title: 'Seebimullid', text: (v) => `${v('Sega', 'Segage')} vett ja nõudepesuvahendit ning ${v('puhu', 'puhuge')} mulle. Kes teeb kõige suurema mulli?`, setting: 'outdoor', materials: ['kitchen'], minutes: 10, minAge: 1 },
  { id: 'leaves', title: 'Lehtede kogu', text: (v) => `${v('Korja', 'Korjake')} õuest erineva kujuga lehti ja ${v('sea', 'seadke')} need suuruse järgi ritta.`, setting: 'outdoor', materials: ['nature'], minutes: 20, minAge: 2 },
  { id: 'breakfast', title: 'Pere hommikusöök', text: (v) => `${v('Aita', 'Aidake')} valmistada pere hommikusöök: ${v('kata', 'katke')} laud ja ${v('pane', 'pange')} igale taldrikule väike üllatus.`, setting: 'indoor', materials: ['kitchen'], minutes: 20, minAge: 3 },
]
