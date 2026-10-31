import type { ChildProfile } from './child'
import type { OccasionId } from './occasion'
import type { Decoration } from './decoration'

export type ContentTypeId = 'letter' | 'treasure-hunt' | 'story' | 'puzzle' | 'calendar' | 'certificate'

export interface ContentType {
  id: ContentTypeId
  title: string
  tagline: string
  description: string
  icon: string
  defaultLayout: PrintableLayout
}

export type Tone = 'humorous' | 'magical' | 'adventurous' | 'heartwarming'
export type Length = 'short' | 'medium' | 'long'
export type Difficulty = 'easier' | 'auto' | 'harder'

export interface GeneralOptions {
  tone: Tone
  length: Length
  difficulty: Difficulty
  notes: string
}

/** Helper character writing to one child in a linked family series. */
export interface ElfPersona {
  name: string
  title: string
  origin: string
}

/** "shared": one letter for all children; "linked": each child gets their own series, coordinated with siblings. */
export type LetterMode = 'shared' | 'linked'

export interface LetterOptions {
  sender: string
  startDate: string
  count: 1 | 3 | 7 | 24
  connected: boolean
  /** Only used with several children. Missing in creations made before this feature. */
  mode?: LetterMode
  /** Helper per child id in linked mode; missing entries are suggested automatically. */
  personas?: Record<string, ElfPersona>
}

export type Setting = 'indoor' | 'outdoor'

export interface TreasureHuntOptions {
  clueCount: number
  setting: Setting
  /** Free-form locations the parent has available; empty = use defaults. */
  locations: string[]
  cooperative: boolean
  prize: string
}

export type StoryGenre = 'fairytale' | 'adventure' | 'detective' | 'space' | 'animals' | 'funny'
export type EducationalTheme = 'none' | 'friendship' | 'courage' | 'sharing' | 'nature' | 'honesty' | 'patience'

export interface StoryOptions {
  genre: StoryGenre
  extraCharacters: string[]
  theme: EducationalTheme
}

export type PuzzleKind = 'mixed' | 'cipher' | 'riddle' | 'anagram' | 'math' | 'sequence'

export interface PuzzleOptions {
  kind: PuzzleKind
  challengeCount: number
  /** Secret phrase revealed by the final cipher; empty = no secret code. */
  secretCode: string
}

export type CalendarSetting = Setting | 'both'

export interface CalendarOptions {
  days: number
  setting: CalendarSetting
  materials: string[]
  minutes: 10 | 20 | 45
}

export type CertificateStyle = 'classic' | 'magical' | 'playful'
export type CertificateFormat = 'diploma' | 'greeting'

export interface CertificateOptions {
  format: CertificateFormat
  achievement: string
  style: CertificateStyle
  message: string
  issuer: string
}

export interface ContentOptionsMap {
  letter: LetterOptions
  'treasure-hunt': TreasureHuntOptions
  story: StoryOptions
  puzzle: PuzzleOptions
  calendar: CalendarOptions
  certificate: CertificateOptions
}

interface BaseRequest {
  children: ChildProfile[]
  occasionId: OccasionId
  general: GeneralOptions
  seed: number
}

export type GenerationRequest = {
  [K in ContentTypeId]: BaseRequest & { contentType: K; options: ContentOptionsMap[K] }
}[ContentTypeId]

export type RequestFor<K extends ContentTypeId> = Extract<GenerationRequest, { contentType: K }>

export type PrintableLayout = 'page' | 'half' | 'cards' | 'poster' | 'mini'

export type ItemKind = 'letter' | 'clue' | 'story-page' | 'puzzle' | 'activity' | 'certificate'

export interface GeneratedItem {
  id: string
  kind: ItemKind
  /** Small label above the heading, e.g. "Vihje 2" or "1. detsember". */
  label: string
  heading: string
  /** Child-facing body; paragraphs separated by a blank line. */
  body: string
  /** Signature or closing line, e.g. "Sinu päkapikk Tuduja". */
  signature?: string
  /** Calendar date (YYYY-MM-DD) for dated items such as daily letters. */
  date?: string
  /** Child the item is addressed to in a shared experience. */
  forChild?: string
  /** Child id for items of a linked family series (one series per child). */
  childId?: string
  /** Solution, kept out of child-facing print. */
  answer?: string
  /** Parent-only remark about this item (e.g. where to hide it). */
  parentNote?: string
  variant: number
  edited: boolean
}

export interface ParentInstruction {
  title: string
  steps: string[]
}

export interface GeneratedContent {
  id: string
  title: string
  subtitle: string
  createdAt: string
  request: GenerationRequest
  items: GeneratedItem[]
  instructions: ParentInstruction[]
  layout: PrintableLayout
  /** Optional backgrounds and picture puzzle; missing in creations made before this feature. */
  decoration?: Decoration
  generator: { id: string; label: string }
}
