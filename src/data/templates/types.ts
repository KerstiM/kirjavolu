import type { OccasionId, OccasionVocabulary, Tone } from '../../domain/models'
import type { Say } from './interests'

export interface LineContext {
  v: Say
  sender: string
  vocab: OccasionVocabulary
}

export type Line = (t: LineContext) => string

export type ToneLines = Record<Tone, Line[]>

export type OccasionLines = Partial<Record<OccasionId, Line[]>>
