export type ReadingLevel = 'read-aloud' | 'beginner' | 'independent' | 'advanced'

export interface ChildProfile {
  id: string
  name: string
  /** Optional genitive form of the name for irregular names (e.g. "Mart" → "Mardi"). */
  nameGenitive?: string
  age: number
  readingLevel: ReadingLevel
  personality: string
  interests: string[]
  favorites: string[]
  foods: string[]
  family: string[]
  achievements: string[]
  details: string
  parentNotes: string
  createdAt: string
  updatedAt: string
}

export type ChildProfileDraft = Omit<ChildProfile, 'id' | 'createdAt' | 'updatedAt'>

/** Language and difficulty band derived from age and reading ability. */
export type AgeBand = 'toddler' | 'young' | 'older'

export const READING_LEVEL_LABELS: Record<ReadingLevel, string> = {
  'read-aloud': 'Täiskasvanu loeb ette',
  beginner: 'Alles õpib lugema',
  independent: 'Loeb iseseisvalt',
  advanced: 'Loeb vabalt ja palju',
}
