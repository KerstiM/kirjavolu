import type { ChildProfileDraft, GenerationRequest, ReadingLevel } from './models'
import { isContentTypeId } from './contentTypes'
import { isOccasionId } from './occasions/occasions'

const READING_LEVELS: ReadingLevel[] = ['read-aloud', 'beginner', 'independent', 'advanced']

export type FieldErrors = Partial<Record<keyof ChildProfileDraft, string>>

export function validateChildProfile(draft: ChildProfileDraft): FieldErrors {
  const errors: FieldErrors = {}
  const name = draft.name.trim()
  if (!name) errors.name = 'Palun sisesta lapse nimi.'
  else if (name.length > 40) errors.name = 'Nimi võib olla kuni 40 tähemärki.'
  else if (!/^[\p{L}][\p{L}' -]*$/u.test(name)) errors.name = 'Nimi võib sisaldada ainult tähti, tühikuid ja sidekriipse.'

  if (!Number.isInteger(draft.age) || draft.age < 0 || draft.age > 17) {
    errors.age = 'Vanus peab olema täisarv vahemikus 0–17.'
  }
  if (!READING_LEVELS.includes(draft.readingLevel)) errors.readingLevel = 'Vali lugemisoskus.'
  if (draft.nameGenitive && draft.nameGenitive.trim().length > 40) {
    errors.nameGenitive = 'Omastava kääne võib olla kuni 40 tähemärki.'
  }
  return errors
}

export function isValidChildProfile(draft: ChildProfileDraft): boolean {
  return Object.keys(validateChildProfile(draft)).length === 0
}

export const MAX_LETTERS = 24
/** The shortest Christmas series that tells a whole story; fewer days give one letter. */
export const MIN_SERIES = 7

/**
 * How many daily Christmas letters fit from the start date to Christmas Eve, at most 24. The
 * letters end on 24 December at the latest: after it, "the presents are on the sleigh" would
 * no longer be true. A start before December gives the full 24 (the series ends earlier).
 */
export function christmasLettersUntilEve(startDate: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(startDate)
  if (!match) return MAX_LETTERS
  const start = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  const eve = Date.UTC(Number(match[1]), 11, 24)
  if (start > eve) return 1
  return Math.min(MAX_LETTERS, Math.round((eve - start) / 86_400_000) + 1)
}

export function validateGenerationRequest(request: GenerationRequest): string[] {
  const errors: string[] = []
  if (!isContentTypeId(request.contentType)) errors.push('Tundmatu sisutüüp.')
  if (!isOccasionId(request.occasionId)) errors.push('Vali sündmus või tähtpäev.')
  if (request.children.length === 0) errors.push('Vali vähemalt üks laps.')
  for (const child of request.children) {
    if (!isValidChildProfile(child)) errors.push(`Lapse „${child.name || 'nimetu'}“ profiil vajab parandamist.`)
  }

  switch (request.contentType) {
    case 'letter':
      const count = request.options.count
      if (!Number.isInteger(count) || count < 1 || count > MAX_LETTERS) errors.push(`Kirjade arv peab olema 1–${MAX_LETTERS}.`)
      if (request.options.startDate && !/^\d{4}-\d{2}-\d{2}$/.test(request.options.startDate)) {
        errors.push('Kuupäev on vigane.')
      }
      if (request.occasionId === 'christmas' && count > 1) {
        const fits = christmasLettersUntilEve(request.options.startDate)
        if (count > fits) {
          errors.push(
            fits >= MIN_SERIES
              ? `Jõulukirjad lõpevad jõululaupäeval: selle alguskuupäevaga mahub sarja kuni ${fits} kirja.`
              : 'Jõulukirjad lõpevad jõululaupäeval: selle alguskuupäevaga jõuab teha ühe kirja.',
          )
        }
      }
      break
    case 'treasure-hunt':
      if (request.options.clueCount < 3 || request.options.clueCount > 12) {
        errors.push('Vihjeid peab olema 3 kuni 12.')
      }
      break
    case 'puzzle':
      if (request.options.challengeCount < 1 || request.options.challengeCount > 12) {
        errors.push('Ülesandeid peab olema 1 kuni 12.')
      }
      if (request.options.secretCode.length > 40) errors.push('Salakood võib olla kuni 40 tähemärki.')
      break
    case 'calendar':
      if (request.options.days < 3 || request.options.days > 31) errors.push('Päevi peab olema 3 kuni 31.')
      break
    case 'story':
    case 'certificate':
      break
  }
  return errors
}
