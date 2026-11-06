import type { CompanionId } from '../../../domain/models'
import { hashSeed } from '../../../domain/text/random'

export type { CompanionId }

/**
 * The companion a parent can put under a long letter: three characters, eight poses each, and
 * short exclamations per pose. The parent only picks the character; the pose and the line
 * follow from the letter (see `companionFor`), so every letter in a series looks a little
 * different while the same letter always keeps its own.
 */
export const COMPANIONS: { id: CompanionId; name: string }[] = [
  { id: 'pakapikk', name: 'Päkapikk' },
  { id: 'umbrik', name: 'Ümbrik' },
  { id: 'janes', name: 'Jänes' },
]

export const POSES_PER_COMPANION = 8

export function isCompanionId(value: unknown): value is CompanionId {
  return COMPANIONS.some((companion) => companion.id === value)
}

/** `{nimi}` is the child's name. A line without it is a joke or a proverb that suits anyone. */
const NAME = '{nimi}'

/**
 * Five lines per pose, in the order of the poses in art.ts: two greet the child by name, three
 * suit anyone. A series of 24 letters shows each pose three times, so a pose needs at least
 * three lines that work without a name (when no child is known) to never say the same twice.
 */
const LINES: Record<CompanionId, string[][]> = {
  pakapikk: [
    [
      'Tere, {nimi}! Päkapikk ütleb tere!',
      'Tervitus sulle, {nimi}, otse Põhjamaalt!',
      'Tere! Mis põnevat täna teeme?',
      'Tere-tere! Päkapikk astus korraks läbi.',
      'Täna sain mütsi esimese korraga pähe!',
    ],
    [
      '{nimi}, sulle on kiri!',
      'Loe kohe, {nimi}, kuni kiri on veel soe!',
      'Posti ma ei kaota, olen ju päkapikk!',
      'Postiljon päkapikk on kohal!',
      'Koputan, koputan: kiri tuli!',
    ],
    [
      '{nimi}, mul on sulle üks saladus!',
      '{nimi}, sinuga on alati lõbus!',
      'Mul tuli kohe naeratus näole!',
      'Sinuga oli täitsa tore seiklus!',
      'Olen küll väike, aga mul on suured plaanid!',
    ],
    [
      'Kirjutan just sinust, {nimi}!',
      '{nimi}, kas sa märkasid mu kauneid tähti?',
      'Mu sulg kriibib, aga lugu on hea!',
      'Sulg, tint ja natuke maagiat!',
      'Püüdsin kirjutada eriti ilusate tähtedega!',
    ],
    [
      '{nimi}, see üllatus on sinu jaoks!',
      '{nimi}, arva ära, mis on sees!',
      'Ma ei jõua ära oodata, millal sa üllatust näed!',
      'Üllatus on peidus, aga mitte kauaks!',
      'Pakkisin selle ise, ainult veidi viltu!',
    ],
    [
      'Sh! {nimi}, head ööd!',
      'Ka päkapikud vajavad und, {nimi}.',
      'Nägin unes, et mu müts jooksis ära.',
      'Haigutan nii, et müts vajub silmile.',
      'Veel viis minutit, siis ärkan!',
    ],
    [
      'Hurraa, {nimi}! Täna on tore päev!',
      '{nimi}, vaata, ma hüppasin üle oma varju!',
      'Mis siis, et müts kukkus maha: hurraa!',
      'Päkapikud ei oska vaikselt rõõmustada!',
      'Hüpe, plaks ja hurraa!',
    ],
    [
      'Hmm… mida {nimi} täna teeb?',
      '{nimi}, mis sa arvad, kas see on hea mõte?',
      'Hmm… kus ma küll oma lusika jätsin?',
      'Mõtlen nii kõvasti, et müts kiigub.',
      'Hmm… kas pähklid või piparkoogid?',
    ],
  ],
  umbrik: [
    [
      'Tere, {nimi}! Mul on sulle midagi!',
      'Tere, {nimi}, siin sinu ümbrik!',
      'Postimarki mul pole, aga naeratus on!',
      'Postkastist otse sinuni!',
      'Tulin sulle kirja tooma!',
    ],
    [
      'Hurraa, {nimi}! Kiri jõudis kohale!',
      '{nimi}, täna on kirjapäev!',
      'Olen ümbrik, aga hüppan rõõmust!',
      'Hurraa! Jõudsin kohale ilma eksimata!',
      'Rõõm on suur, ümbrik on väike!',
    ],
    [
      'Hmm… mida {nimi} sellest kirjast arvab?',
      '{nimi}, kas sina tead, mis on kirjas?',
      'Kuhu ma küll oma postmargi panin?',
      'Kas keegi oskab mind lahti teha?',
      'Hmm… kas mu nurgad on ikka sirged?',
    ],
    [
      'Oi, {nimi}! Mis seal sees küll on?',
      '{nimi}, kas sa ka ehmusid?',
      'Kirjas on alati midagi põnevat!',
      'Oi! Mind avati, aga ma ei ole valmis!',
      'Oi-oi! Mu paber lausa krabiseb!',
    ],
    [
      'Zzz… {nimi}, ma ootan postkastis.',
      'Head ööd, {nimi}!',
      'Postkastis on pime, aga mõnus.',
      'Kirjadki vajavad puhkust.',
      'Zzz… keeran oma nurgad teki alla.',
    ],
    [
      '{nimi}, mul on saladus: ma lõhnan liimi järele!',
      '{nimi}, mul on sulle üks uudis: kiri on valmis!',
      'Selle kirja sees on üks suur aitäh!',
      'Kiri ja mina oleme lahutamatud!',
      'Ma krõbisen uudishimust!',
    ],
    [
      '{nimi}, sinu täht on siin!',
      '{nimi}, püüdsin selle tähe taevast kinni!',
      'Sain tähe külge, aga postmargi unustasin!',
      'Täht kirjas, täht taevas!',
      'Üks täht kleepus mulle külge ega lähe lahti!',
    ],
    [
      '{nimi}, kiirusta! Post ei oota!',
      'Jookse kaasa, {nimi}!',
      'Ma jooksen, sest olen kiirpost!',
      'Kiirem kui postiauto, aga väiksem!',
      'Jooksen, sest kirjad ei oota!',
    ],
  ],
  janes: [
    [
      'Tere, {nimi}! Hüppasin sind vaatama!',
      'Tere, {nimi}, siin jänes!',
      'Hop! Hüppasin kogu tee siia!',
      'Tere! Kas nägid mind hüppamas?',
      'Minu kõrvad kuulsid, et sa loed!',
    ],
    [
      'Sh, {nimi}, jänes näeb unes porgandeid.',
      '{nimi}, uinume koos?',
      'Jänesele sobib uni ja porgand.',
      'Pehme padi, pikad kõrvad. Zzz…',
      'Jänes magab, aga kõrv kuulab.',
    ],
    [
      '{nimi}, kas sulle ka porgandit?',
      '{nimi}, ära ütle kellelegi, aga see on mu viimane!',
      'Mu porgand on täna eriti oranž!',
      'Porgand on parem kui komm. Peaaegu!',
      'Krõmps, krõmps! Maitseb nagu suvi!',
    ],
    [
      'See lill on sulle, {nimi}!',
      '{nimi}, ma noppisin selle sulle!',
      'Ma ei söönud seda lille ära, kuigi tahtsin.',
      'Tahtsin lille tuua, aga nuusutasin seda pool tundi!',
      'See lill lõhnab nii hästi, et aevastasin!',
    ],
    [
      '{nimi}, tule, ma teen sulle pai!',
      'Tule siia, {nimi}, kallistame!',
      'Kas teeme ühe jänkukalli?',
      'Kallistused on pehmed nagu jänesekasukas.',
      'Käed laiali, kõrvad ka!',
    ],
    [
      'Hop-hop, {nimi}! Hüppame koos!',
      '{nimi}, hüppa minuga kaasa!',
      'Ma ei jookse, ma hüppan!',
      'Üks hüpe, kaks hüpet, kolm hüpet!',
      'Hüppan nii kõrgele, et näen kuud!',
    ],
    [
      'Hmm… {nimi}, kas sa nägid mu porgandit?',
      '{nimi}, mis sina arvad?',
      'Kas mu kõrvad mahuvad selle mütsi alla?',
      'Kas ma sõin selle porgandi juba ära?',
      'Mõtlemisest lähevad kõrvad kikki!',
    ],
    [
      'Aitäh, {nimi}! Sa olid mulle suureks abiks!',
      '{nimi}, sinuga on vahva koos hüpata!',
      'Aitäh! Mu kõrvad lausa punastavad.',
      'Aitäh, et sa mind kuulasid!',
      'Kõht on täis, porgandid otsas!',
    ],
  ],
}

/**
 * Which pose and which line a letter gets. The series seed (the creation's id) shifts where
 * the poses start, and every step of three is a different pose, so up to eight letters in a
 * row never repeat one. A pose comes back every eight letters, and then with the next line
 * of its pool, so that 24 letters never repeat a line.
 */
export function companionFor(seed: string, index: number): { pose: number; line: number } {
  const pose = (hashSeed(seed) + index * 3) % POSES_PER_COMPANION
  return { pose, line: hashSeed(seed, 'line', pose) + Math.floor(index / POSES_PER_COMPANION) }
}

/**
 * The exclamation of one pose; `line` counts through the pose's pool and wraps around.
 * Without a name only the lines that do not need one are used, so that nobody is greeted
 * as "{nimi}".
 */
export function companionLine(id: CompanionId, pose: number, line: number, name?: string): string {
  const all = LINES[id][pose % POSES_PER_COMPANION]!
  const pool = name ? all : all.filter((text) => !text.includes(NAME))
  return pool[line % pool.length]!.replaceAll(NAME, name ?? '').trim()
}
