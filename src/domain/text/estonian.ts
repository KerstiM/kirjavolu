import type { ChildProfile } from '../models'

const VOWEL_END = /[aeiouõäöüy]$/i

/**
 * Genitive (omastav) form of a first name. Names ending in a vowel stay the same,
 * names ending in a consonant get "-i" (Ruben → Rubeni). Irregular names can be
 * overridden in the child profile.
 */
export function genitive(name: string, override?: string): string {
  const trimmed = name.trim()
  if (override && override.trim()) return override.trim()
  return VOWEL_END.test(trimmed) ? trimmed : `${trimmed}i`
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

/** Joins words with commas and "ja": "Ruben, Jasper ja Brita". */
export function joinList(words: string[]): string {
  const clean = words.map((word) => word.trim()).filter(Boolean)
  if (clean.length <= 1) return clean[0] ?? ''
  return `${clean.slice(0, -1).join(', ')} ja ${clean[clean.length - 1]}`
}

/**
 * Names in a grammatical case. Comitative ("-ga") is attached only to the last
 * word in Estonian lists ("Rubeni ja Jasperiga"), other cases to every word.
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
