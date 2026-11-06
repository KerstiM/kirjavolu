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
      'Hommik on õhtust targem.',
      'Tere-tere! Päkapikk astus korraks läbi.',
      'Kes vara tõuseb, see päkapikku näeb!',
    ],
    [
      '{nimi}, sulle on kiri!',
      'Loe kohe, {nimi}, kuni kiri on veel soe!',
      'Posti ma ei kaota, olen ju päkapikk!',
      'Postiljon päkapikk on kohal!',
      'Koputan, koputan: kiri tuli!',
    ],
    [
      '{nimi}, sa oled päkapiku lemmik!',
      '{nimi}, sinuga on päkapikul hea olla!',
      'Hea sõna ei maksa midagi, aga soojendab!',
      'Vana arm ei roosteta, ka päkapiku oma!',
      'Süda on suur, kuigi päkapikk on väike!',
    ],
    [
      'Kirjutan just sinust, {nimi}!',
      '{nimi}, kas sa märkasid mu kauneid tähti?',
      'Mu sulg kriibib, aga lugu on hea!',
      'Sulg, tint ja natuke maagiat!',
      'Kirjutan ilusasti, et sa lugeda jõuaksid!',
    ],
    [
      '{nimi}, see üllatus on sinu jaoks!',
      '{nimi}, arva ära, mis on sees!',
      'Kes ootab, see saab. Ka kingituse!',
      'Üllatus on peidus, aga mitte kauaks!',
      'Pakkisin selle ise, ainult veidi viltu!',
    ],
    [
      'Sh! {nimi}, head ööd!',
      'Ka päkapikud vajavad und, {nimi}.',
      'Hea uni on kuld, ütleb päkapikk.',
      'Hea uni annab hommikul jaksu!',
      'Veel viis minutit, siis ärkan!',
    ],
    [
      'Hurraa, {nimi}! Täna on tore päev!',
      'Hurraa sulle, {nimi}, sa oled tubli!',
      'Mis siis, et müts kukkus maha: hurraa!',
      'Päkapikud ei oska vaikselt rõõmustada!',
      'Hüpe, plaks ja hurraa!',
    ],
    [
      'Hmm… mida {nimi} täna teeb?',
      '{nimi}, mis sa arvad, kas see on hea mõte?',
      'Mõtle kaks korda, tee üks kord.',
      'Mõtted on nagu päkapikud: väiksed, aga tublid.',
      'Hmm… kas pähklid või piparkoogid?',
    ],
  ],
  umbrik: [
    [
      'Tere, {nimi}! Mina olen see ümbrik!',
      'Tere, {nimi}, siin sinu ümbrik!',
      'Postimarki mul pole, aga naeratus on!',
      'Postkastist otse sinuni!',
      'Mind pole vaja kleepida, tulin ise!',
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
      'Kas ma kleebin end kinni või jätan lahti?',
      'Mõtlen: kuhu ma küll liimi jätsin?',
    ],
    [
      'Oi, {nimi}! Mis seal sees küll on?',
      '{nimi}, kas sa ka ehmusid?',
      'Kirjas on alati midagi põnevat!',
      'Oi! Mind avati, aga ma ei ole valmis!',
      'Oi-oi, mul hakkas süda põksuma!',
    ],
    [
      'Zzz… {nimi}, ma ootan postkastis.',
      'Head ööd, {nimi}!',
      'Postkastis on pime, aga mõnus.',
      'Kirjadki vajavad puhkust.',
      'Zzz… mul on selline pehme paber.',
    ],
    [
      'Armastan sind, {nimi}, kleepuvalt!',
      '{nimi}, sa oled mu lemmiklugeja!',
      'Armastus on alati kirjas – ka siin!',
      'Kiri ja mina oleme lahutamatud!',
      'Südamega kirjutatud, südamega suletud!',
    ],
    [
      '{nimi}, sinu täht on siin!',
      '{nimi}, sa särad nagu see täht!',
      'Iga hea päev väärib kirja.',
      'Täht kirjas, täht taevas!',
      'Üks täht päevas ajab mure ära.',
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
      'Kes hüppab, see jõuab!',
      'Hop! Tere, kallis lugeja!',
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
      'Porgand päevas hoiab silmad terased!',
      'Porgand on parem kui komm. Peaaegu!',
      'Krõmps, krõmps! Maitseb nagu suvi!',
    ],
    [
      'See lill on sulle, {nimi}!',
      '{nimi}, ma noppisin selle sulle!',
      'Kevad tuleb sinu naeratusest.',
      'Lilled räägivad, mina kuulan.',
      'Üks lill peidab sees terve suve.',
    ],
    [
      '{nimi}, tule kallistan sind!',
      'Tule siia, {nimi}, kallistame!',
      'Kallistus on parim rohi, ilma retseptita.',
      'Kallistused on pehmed nagu jänesekasukas.',
      'Käed laiali, süda lahti!',
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
      'Kus mu pikad kõrvad küll jälle on?',
      'Kas ma sõin selle porgandi juba ära?',
      'Mõtlemisest lähevad kõrvad kikki!',
    ],
    [
      'Aitäh, {nimi}, sa oled kullatükk!',
      '{nimi}, sa oled parim!',
      'Aitäh! Mu kõrvad lausa punastavad.',
      'Aitäh kuulamast, mu kõrvad on rõõmsad!',
      'Süda on täis, kõht ka peaaegu!',
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
