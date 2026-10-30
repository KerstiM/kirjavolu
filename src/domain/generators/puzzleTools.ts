import type { Rng } from '../text/random'

/** Estonian alphabet without rarely used foreign letters (c, q, w, x, y). */
export const ESTONIAN_ALPHABET = [
  'A', 'B', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
  'P', 'R', 'S', 'Š', 'Z', 'Ž', 'T', 'U', 'V', 'Õ', 'Ä', 'Ö', 'Ü',
] as const

const INDEX = new Map<string, number>(ESTONIAN_ALPHABET.map((letter, i) => [letter, i]))

export function normalize(text: string): string {
  return text.toLocaleUpperCase('et-EE').trim()
}

/** Number code: A=1, B=2 … Words separated by " / ", letters by "-". */
export function encodeNumbers(text: string): string {
  return normalize(text)
    .split(/\s+/)
    .map((word) =>
      [...word]
        .map((char) => {
          const index = INDEX.get(char)
          return index === undefined ? char : String(index + 1)
        })
        .join('-'),
    )
    .join(' / ')
}

export function decodeNumbers(code: string): string {
  return code
    .split(' / ')
    .map((word) =>
      word
        .split('-')
        .map((token) => {
          const n = Number(token)
          return Number.isInteger(n) && n >= 1 ? (ESTONIAN_ALPHABET[n - 1] ?? token) : token
        })
        .join(''),
    )
    .join(' ')
}

/** Caesar shift within the Estonian alphabet. */
export function shiftText(text: string, shift: number): string {
  const size = ESTONIAN_ALPHABET.length
  return [...normalize(text)]
    .map((char) => {
      const index = INDEX.get(char)
      if (index === undefined) return char
      return ESTONIAN_ALPHABET[(((index + shift) % size) + size) % size] ?? char
    })
    .join('')
}

export function alphabetKey(): string {
  return ESTONIAN_ALPHABET.map((letter, i) => `${letter}=${i + 1}`).join('  ')
}

export function scramble(word: string, rng: Rng): string {
  const letters = [...normalize(word)]
  if (new Set(letters).size < 2) return letters.join('')
  for (let attempt = 0; attempt < 20; attempt++) {
    const shuffled = rng.shuffle(letters).join('')
    if (shuffled !== letters.join('')) return shuffled
  }
  return [...letters].reverse().join('')
}

export function reverseWord(word: string): string {
  return [...normalize(word)].reverse().join('')
}

/** True when `candidate` uses exactly the same letters as `word`. */
export function isAnagram(word: string, candidate: string): boolean {
  const sort = (value: string) => [...normalize(value)].sort().join('')
  return sort(word) === sort(candidate)
}
