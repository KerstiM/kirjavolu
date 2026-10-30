import type { ContentType, ContentTypeId } from './models'

export const CONTENT_TYPES: ContentType[] = [
  {
    id: 'letter',
    title: 'Maagiline kiri',
    tagline: 'Päkapikult, jänkult või hambahaldjalt',
    description: 'Üks kiri või terve sari, mis teab lapse lemmikuid ja tegemisi.',
    icon: 'Mail',
    defaultLayout: 'page',
  },
  {
    id: 'treasure-hunt',
    title: 'Aardejaht',
    tagline: 'Vihjekaardid toas või õues',
    description: 'Vihjete ahel, mis viib kohast kohta ja lõpeb üllatusega.',
    icon: 'Map',
    defaultLayout: 'cards',
  },
  {
    id: 'story',
    title: 'Personaalne lugu',
    tagline: 'Unejutt, kus peategelane on sinu laps',
    description: 'Muinasjutt või seiklus lapse huvide, lemmiktegelaste ja pereliikmetega.',
    icon: 'BookOpen',
    defaultLayout: 'page',
  },
  {
    id: 'puzzle',
    title: 'Mõistatus või salamissioon',
    tagline: 'Salakoodid, mõistatused ja nuputamine',
    description: 'Eakohased ülesanded koos vastustega lapsevanemale.',
    icon: 'KeyRound',
    defaultLayout: 'half',
  },
  {
    id: 'calendar',
    title: 'Tegevuskalender',
    tagline: 'Advendikalender või suvine seiklus',
    description: 'Iga päeva jaoks üks tegevus, mis sobib teie kodu ja võimalustega.',
    icon: 'CalendarDays',
    defaultLayout: 'cards',
  },
  {
    id: 'certificate',
    title: 'Diplom või õnnitluskaart',
    tagline: 'Tunnustus suurte ja väikeste saavutuste eest',
    description: 'Pidulik diplom või soe õnnitlus, mida saab kohe välja printida.',
    icon: 'Award',
    defaultLayout: 'page',
  },
]

export function getContentType(id: ContentTypeId): ContentType {
  const found = CONTENT_TYPES.find((type) => type.id === id)
  if (!found) throw new Error(`Unknown content type: ${id}`)
  return found
}

export function isContentTypeId(value: unknown): value is ContentTypeId {
  return CONTENT_TYPES.some((type) => type.id === value)
}
