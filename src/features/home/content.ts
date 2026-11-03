import type { ContentTypeId, GeneratedItem } from '../../domain/models'

/**
 * The words of the home page in one place, so they can be changed without touching the
 * layout. The seasonal block has its own list in seasonal.ts.
 */
export const HERO = {
  eyebrow: 'KIRJAD · LOOD · SEIKLUSED',
  titleStart: 'Väikesed üllatused. Suured ',
  titleAccent: 'imelised hetked',
  titleEnd: '.',
  lead: 'Loo oma lapsele isiklikke kirju, aardejahte ja vahvaid lugusid. Just tema huvide ja lemmikute järgi. Kohanda ja prindi kodus.',
  primary: 'Loo esimene üllatus',
  secondary: 'Vaata näidist',
  // Each claim holds: no account, every text can be edited, everything is printed at home.
  trust: ['Ilma kasutajakontota', 'Muuda ise', 'Prindi kodus'],
} as const

export const TYPES_SECTION = {
  title: 'Mida soovid luua?',
  lead: 'Vali, millega soovid oma last üllatada.',
} as const

/** The six cards, in this order; each opens the wizard with its type chosen. */
export const TYPE_CARDS: { id: ContentTypeId; title: string; subtitle: string; description: string }[] = [
  { id: 'letter', title: 'Maagiline kiri', subtitle: 'Päkapikult, jänkult või hambahaldjalt', description: 'Isiklik kiri, mis rõõmustab sinu last.' },
  { id: 'treasure-hunt', title: 'Aardejaht', subtitle: 'Vihjest vihjeni', description: 'Põnev otsimismäng kodus või õues.' },
  { id: 'story', title: 'Personaalne lugu', subtitle: 'Sinu laps on peategelane', description: 'Muinasjutud ja seiklused tema lemmikutega.' },
  { id: 'puzzle', title: 'Salamissioon', subtitle: 'Väikestele nuputajatele', description: 'Mõistatused, salakoodid ja põnevad ülesanded.' },
  { id: 'calendar', title: 'Tegevuskalender', subtitle: 'Iga päev uus avastus', description: 'Lõbusad tegevused terveks kuuks või vaheajaks.' },
  {
    id: 'certificate',
    title: 'Diplom ja õnnitluskaart',
    subtitle: 'Väikestest võitudest suurte saavutusteni',
    description: 'Tähista lapse erilisi hetki.',
  },
]

export const EXAMPLES_SECTION = {
  title: 'Vaata, milline võlu välja näeb',
  lead: 'Väike pilguheit kirjadele, lugudele ja seiklustele, mida saad oma lapsele luua.',
  more: 'Ava terve näidis',
} as const

const sample = (item: Omit<GeneratedItem, 'variant' | 'edited'>): GeneratedItem => ({ ...item, variant: 0, edited: false })

/** Three printable samples, drawn the same way as a parent's own creations. */
export const EXAMPLES: { caption: string; item: GeneratedItem }[] = [
  {
    caption: 'Päkapikukiri',
    item: sample({
      id: 'home-letter',
      kind: 'letter',
      label: '1. detsember',
      heading: 'Kallis Jasper!',
      body: 'Tere! Mina olen päkapikk Tuduja ja kolisin eile õhtul teie raamaturiiuli taha. Kuulsin, et sulle meeldivad mõistatused. Mulle ka!\n\nHomme hommikul peidan su sussi juurde väikese saladuse. Kas leiad selle enne hommikusööki?',
      signature: 'Sinu päkapikk Tuduja',
    }),
  },
  {
    caption: 'Aardejahi vihje',
    item: sample({
      id: 'home-clue',
      kind: 'clue',
      label: 'Vihje 2',
      heading: 'Kuum jälg!',
      body: 'Ma olen külm, aga mitte jäine.\nMu uksel on magnetid ja sees ootab piim.\n\nVaata alumisele riiulile, Jasper!',
    }),
  },
  {
    caption: 'Isiklik lugu',
    item: sample({
      id: 'home-story',
      kind: 'story-page',
      label: 'Lk 1',
      heading: 'Jasper ja kadunud täht',
      body: 'Õhtu oli vaikne ja lumi sadas aeglaselt, kui Jasper märkas aknalaual kuldset täpikest. See oli täht: väike, soe ja natuke kurb.\n\n„Ma kukkusin taevast,“ sosistas täht. „Ilma minuta ei leia põhjapõder Välk koduteed.“ Jasper tõmbas saapad jalga. Täna öösel oli tal tähtis töö.',
    }),
  },
]

export const STEPS_SECTION = {
  title: 'Kolm sammu väikese võluhetkeni',
  steps: [
    { title: 'Lisa laps', text: 'Sisesta lapse nimi, vanus ja huvid.' },
    { title: 'Vali seiklus', text: 'Vali kiri, lugu, aardejaht või muu üllatus.' },
    { title: 'Kohanda ja prindi', text: 'Vaata tulemus üle, muuda soovi korral ja prindi välja.' },
  ],
} as const

/**
 * True to what the app does: profiles and creations live in the browser (localStorage,
 * pictures in IndexedDB). Personal letters, stories and the sample letter send the child's first
 * name, age and what the parent typed to be written; the privacy page says this in full.
 */
export const PRIVACY = {
  title: 'Lapse andmed jäävad sinu brauserisse.',
  text: 'Kirjavõlu ei nõua kasutajakonto loomist. Laste profiilid ja salvestatud loomingud hoitakse sinu brauseris. Kui lased päkapikul kirjad või loo päriselt lapse järgi kirjutada, saadetakse selleks lapse eesnimi, vanus ja see, mida ise kirjutasid. Neid ei salvestata.',
  link: 'Loe privaatsuse kohta',
} as const
