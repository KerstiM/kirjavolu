import type { ChildProfile } from '../models'

const VOWEL_END = /[aeiouõäöüy]$/i
const VOWELS = /[aeiouõäöüy]+/gi

/**
 * Estonian names whose genitive no rule gives (Mikk → Miku, Mart → Mardi). Lower case.
 * Names here and those the parent typed in are "sure"; see `genitiveIsSure`.
 */
const IRREGULAR_GENITIVES: Record<string, string> = {
  mikk: 'Miku',
  mart: 'Mardi',
  ott: 'Oti',
  jaak: 'Jaagu',
  priit: 'Priidu',
  tiit: 'Tiidu',
  siim: 'Siimu',
  rait: 'Raidu',
  hans: 'Hansu',
  ants: 'Antsu',
  toomas: 'Tooma',
  peeter: 'Peetri',
  sander: 'Sandri',
  aleksander: 'Aleksandri',
  mihkel: 'Mihkli',
  kaarel: 'Kaarli',
  indrek: 'Indreku',
  erik: 'Eriku',
  henrik: 'Henriku',
  patrik: 'Patriku',
  jaagup: 'Jaagupi',
  tõnu: 'Tõnu',
}

/**
 * Consonant-final names that take "-i" without doubt (Karl → Karli). Other consonant-final
 * names also get "-i", but that is a guess: Estonian names such as Mikk or Mart do not.
 */
const REGULAR_I = new Set([
  'karl', 'paul', 'jaan', 'oskar', 'robin', 'martin', 'kevin', 'kristjan', 'kristofer', 'daniel', 'jakob',
  'joosep', 'georg', 'oliver', 'william', 'artur', 'aron', 'stefan', 'gustav', 'romet', 'kaspar', 'karmen',
  'kirsten', 'ingrid', 'liisbet', 'elisabet', 'karin', 'kerstin', 'johan', 'juhan', 'taavet', 'ruben',
  'jasper', 'kaur', 'jan', 'tristan', 'sebastian', 'adrian', 'ralf', 'roland', 'herman', 'nikolai', 'eerik',
  'liis', 'jaanika', 'ellen', 'helen', 'kristin', 'marten', 'marleen', 'evelin', 'kätlin', 'merilin',
])

const syllables = (word: string) => word.match(VOWELS)?.length ?? 0

/** Genitive of one word of a name, and whether it follows a rule that does not fail. */
function wordGenitive(word: string): { form: string; sure: boolean } {
  const lower = word.toLowerCase()
  const irregular = IRREGULAR_GENITIVES[lower]
  if (irregular) return { form: word.charAt(0) + irregular.slice(1), sure: true }
  // Mari, Jüri, Pääru: a name ending in a vowel stays the same.
  if (VOWEL_END.test(word)) return { form: word, sure: true }
  // Rasmus → Rasmuse, Tõnis → Tõnise, Lukas → Lukase, Andres → Andrese.
  if (/[aeiu]s$/i.test(word) && syllables(word) >= 2) return { form: `${word}e`, sure: true }
  return { form: `${word}i`, sure: REGULAR_I.has(lower) }
}

/**
 * Genitive (omastav) form of a first name. A name ending in a vowel stays the same,
 * Rasmus → Rasmuse, the common irregular Estonian names come from a list (Mikk → Miku,
 * Mart → Mardi) and other names get "-i". In "Mari-Liis" and "Anna Maria" only the last
 * part changes. The form the parent typed in the profile always wins.
 */
export function genitive(name: string, override?: string): string {
  const trimmed = name.trim()
  if (override && override.trim()) return override.trim()
  const { head, last } = splitName(trimmed)
  return head + wordGenitive(last).form
}

/**
 * Whether the genitive is certain: typed in by the parent, or given by a rule that holds.
 * Where it is not, letters prefer a sentence that keeps the name in the nominative
 * ("Sina ja Mart võite …") to a guessed form ("Martiga").
 */
export function genitiveIsSure(child: Pick<ChildProfile, 'name' | 'nameGenitive'>): boolean {
  if (child.nameGenitive?.trim()) return true
  return wordGenitive(splitName(child.name.trim()).last).sure
}

/** "Mari-Liis" → "Mari-" + "Liis"; "Anna Maria" → "Anna " + "Maria". */
function splitName(name: string): { head: string; last: string } {
  const at = Math.max(name.lastIndexOf('-'), name.lastIndexOf(' '))
  return { head: name.slice(0, at + 1), last: name.slice(at + 1) }
}

export type NameCase = 'nominative' | 'genitive' | 'allative' | 'comitative' | 'adessive' | 'elative'

const SUFFIX: Record<Exclude<NameCase, 'nominative' | 'genitive'>, string> = {
  allative: 'le',
  comitative: 'ga',
  adessive: 'l',
  elative: 'st',
}

export function nameCase(child: Pick<ChildProfile, 'name' | 'nameGenitive'>, form: NameCase): string {
  if (form === 'nominative') return child.name.trim()
  const gen = genitive(child.name, child.nameGenitive)
  if (form === 'genitive') return gen
  return gen + SUFFIX[form]
}

/** Joins words with commas and "ja": "Markus, Pääru ja Kai". */
export function joinList(words: string[]): string {
  const clean = words.map((word) => word.trim()).filter(Boolean)
  if (clean.length <= 1) return clean[0] ?? ''
  return `${clean.slice(0, -1).join(', ')} ja ${clean[clean.length - 1]}`
}

/**
 * Names in a grammatical case. Comitative ("-ga") is attached only to the last
 * word in Estonian lists ("Markuse ja Pääruga"), other cases to every word.
 */
export function namesInCase(
  children: Pick<ChildProfile, 'name' | 'nameGenitive'>[],
  form: NameCase,
): string {
  if (form === 'comitative' && children.length > 1) {
    const head = children.slice(0, -1).map((child) => nameCase(child, 'genitive'))
    const last = children[children.length - 1]
    return joinList([...head, last ? nameCase(last, 'comitative') : ''])
  }
  return joinList(children.map((child) => nameCase(child, form)))
}

/** Whether every name's case forms are certain (see `genitiveIsSure`). */
export function namesAreSure(children: Pick<ChildProfile, 'name' | 'nameGenitive'>[]): boolean {
  return children.every(genitiveIsSure)
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

const MONTHS = [
  'jaanuar',
  'veebruar',
  'märts',
  'aprill',
  'mai',
  'juuni',
  'juuli',
  'august',
  'september',
  'oktoober',
  'november',
  'detsember',
]

const WEEKDAYS = ['pühapäev', 'esmaspäev', 'teisipäev', 'kolmapäev', 'neljapäev', 'reede', 'laupäev']

/** Weekday of an ISO date (YYYY-MM-DD), e.g. "teisipäev". */
export function weekdayName(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return ''
  const day = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))).getUTCDay()
  return WEEKDAYS[day] ?? ''
}

/** Day and month without the year: "1. detsember". */
export function formatDayMonth(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return ''
  return `${Number(match[3])}. ${MONTHS[Number(match[2]) - 1] ?? ''}`
}

/** Formats an ISO date (YYYY-MM-DD) as "1. detsember 2026". */
export function formatDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return ''
  const [, year, month, day] = match
  return `${Number(day)}. ${MONTHS[Number(month) - 1] ?? ''} ${year}`
}

export function addDays(iso: string, days: number): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return iso
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

/** Age with the correct form: "1-aastane", "10-aastane". */
export function ageLabel(age: number): string {
  return `${age}-aastane`
}

const ORDINALS = [
  'esimene',
  'teine',
  'kolmas',
  'neljas',
  'viies',
  'kuues',
  'seitsmes',
  'kaheksas',
  'üheksas',
  'kümnes',
]

export function ordinal(n: number): string {
  return ORDINALS[n - 1] ?? `${n}.`
}

const NUMBER_WORDS = ['null', 'üks', 'kaks', 'kolm', 'neli', 'viis', 'kuus', 'seitse', 'kaheksa', 'üheksa', 'kümme']

export function numberWord(n: number): string {
  return NUMBER_WORDS[n] ?? String(n)
}

/** Local calendar date as YYYY-MM-DD (not UTC, so late-night use gives the right day). */
export function todayIso(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

const MONTH_GENITIVE = [
  'jaanuari',
  'veebruari',
  'märtsi',
  'aprilli',
  'mai',
  'juuni',
  'juuli',
  'augusti',
  'septembri',
  'oktoobri',
  'novembri',
  'detsembri',
]

/** "kuni 13. detsembrini": the terminative case of a date. */
export function untilDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return ''
  return `${Number(match[3])}. ${MONTH_GENITIVE[Number(match[2]) - 1] ?? ''}ni`
}
