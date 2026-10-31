import type { Scenario } from '../../../domain/story/types'

/**
 * Cards from the tiniest elf, read aloud by an adult to a child of about 1–3.
 * One little thing per card: a sound, a movement, something to look at together.
 */

const card = (
  id: string,
  title: string,
  tags: string[],
  text: Scenario['variants']['toddler'],
  extra: Partial<Scenario> = {},
): Scenario => ({
  id,
  title,
  occasions: ['christmas'],
  role: 'standalone',
  tags,
  variants: { toddler: text },
  ...extra,
})

export const TODDLER_SCENARIOS: Scenario[] = [
  card('peekaboo-hat', 'Müts silmadel', ['hide'], (c) => [
    `Mul on punane müts. Müts vajus silmadele. Kus on ${c.helper}? Ei ole! … Kuku – siin ma olen!`,
  ]),
  card('sleigh-bells', 'Kellukesed', ['bells', 'sounds'], () => [
    'Kelgul on kellukesed. Kellukesed teevad: kõlin-kõlin! Raputa käsi ka: kõlin-kõlin!',
  ]),
  card('snow-crunch', 'Krõbe lumi', ['snow', 'move'], () => [
    'Lumi on valge. Lumi teeb krõps-krõps. Astume koos: krõps, krõps, krõps!',
  ]),
  card('mandarin', 'Mandariin', ['smell', 'food'], () => [
    'Mul on mandariin. Mandariin on oranž ja ümmargune. Nuusuta: mmm! Mandariin on nagu väike päike.',
  ]),
  card('tree-lights', 'Kuusetuled', ['lights', 'count'], () => [
    'Kuusel põlevad tuled. Üks, kaks, kolm! Loeme koos: mitu tuld sinu kodus põleb?',
  ]),
  card('two-mittens', 'Kaks kinnast', ['clothes', 'clap'], () => [
    'Mul on kaks kinnast. Üks kinnas, teine kinnas. Kus on sinu käed? Siin! Plaks-plaks!',
  ]),
  card('footprints', 'Jäljed lumel', ['snow', 'animals'], () => [
    'Lumel on jäljed. Kelle jäljed need on? Jänku jäljed! Jänku teeb: hopp-hopp.',
  ]),
  card('owl-night', 'Öökull', ['night', 'animals', 'sounds'], () => [
    'Öösel on pime. Puu otsas istub öökull. Öökull ütleb: huu-huu! Kas sina oskad ka nii?',
  ]),
  card('squirrel', 'Orav', ['animals', 'food'], () => [
    'Orav hüppab oksal. Hüpp! Oraval on pähkel. Krõbin-krõbin. Orav sööb.',
  ]),
  card('teddy-hug', 'Kaisukaru', ['cozy'], () => [
    'Ma kallistasin kaisukaru. Kaisukaru on pehme ja soe. Kallista sina ka oma kaisulooma!',
  ]),
  card('so-big', 'Nii suur!', ['move'], (c) => [
    `Kui suur on ${c.name}? Nii suur! Sirutame käed üles – kõrgele, kõrgele! Ja nüüd kükki: pisike!`,
  ]),
  card(
    'peppa-puddle',
    'Peppa ja lombid',
    ['peppa', 'snow', 'move'],
    () => [
      'Põrsas Peppa armastab lompe. Plärts! Talvel on lombid jääs, siis hüppame hoopis lumme: pläts! Hüppame koos!',
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
    { hooks: ['peppa'], onlyWithHook: true },
  ),
  card('snowman', 'Lumememm', ['snow', 'building'], () => [
    'Me tegime lumememme. Suur pall, väike pall ja porgandnina. Lumememm naeratab!',
  ]),
  card('heart-cookie', 'Südamega piparkook', ['kitchen', 'food'], () => [
    'Ma küpsetasin piparkoogi. Piparkook on südame kujuga. Süda on sulle! Mõnus-mõnus.',
  ]),
  card('sledding', 'Kelgusõit', ['sled', 'move'], () => [
    'Kelk sõidab mäest alla: vuhh! Hoia kinni! Ja jälle üles: tõmba-tõmba.',
  ]),
  card('bubbles', 'Mullid', ['bath'], () => [
    'Ma käisin vannis. Mullid! Puhu mulli: puhh! Mull lendab ära.',
  ]),
  card('goodnight-moon', 'Head ööd, kuu', ['night', 'sky'], () => [
    'Õhtul paistab kuu. Kuu on ümmargune ja kollane. Lehvita kuule: head ööd, kuu!',
  ]),
  card('pot-drum', 'Potitrumm', ['music', 'sounds'], () => [
    'Mul on pott ja lusikas. Bumm-bumm! Kas sina oskad ka trummi lüüa? Bumm-bumm-bumm!',
  ]),
  card('frost-flowers', 'Jäälilled', ['weather'], () => [
    'Aknal on jäälilled. Need on valged ja sätendavad. Puhu aknale: hhhh! Nüüd on aken udune.',
  ]),
  card('reindeer-nose', 'Välgu nina', ['reindeer'], () => [
    'Põhjapõder Välk sööb samblikku. Matsu-matsu. Välgul on suur nina. Näita, kus on sinu nina!',
  ]),
  card(
    'siblings-big',
    'Suured õed-vennad',
    ['siblings'],
    (c) => [`${c.siblings} on suured. Ja ${c.name}? ${c.name} on ka juba suur! Nii suur!`],
    { needsSiblings: true },
  ),
  card(
    'siblings-wave',
    'Lehvita',
    ['siblings'],
    (c) => [
      `Kus on ${c.siblings}? Lehvita: tšau-tšau! ${c.siblings} ${c.siblingCount > 1 ? 'lehvitavad' : 'lehvitab'} ka.`,
    ],
    { needsSiblings: true },
  ),
  card(
    'siblings-face',
    'Naljakas nägu',
    ['siblings'],
    (c) => [
      `${c.siblings} ${c.siblingCount > 1 ? 'teevad' : 'teeb'} naljaka näo. Tee sina ka! Hi-hi-hii.`,
    ],
    { needsSiblings: true },
  ),
  card(
    'siblings-hide',
    'Peitus',
    ['siblings', 'hide'],
    (c) => [`Mängime peitust! Silmad kinni: üks, kaks, kolm. Kus on ${c.siblings}? Leidsime!`],
    { needsSiblings: true },
  ),
]
