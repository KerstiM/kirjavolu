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
/** Letters offer "short" and "long"; "medium" is kept for creations made before. */
export type Length = 'short' | 'medium' | 'long'
/** Letters use `LetterOptions.language` instead; "easier" and "harder" remain in older creations. */
export type Difficulty = 'easier' | 'auto' | 'harder'
/**
 * How a letter is written for one child: "simple" has shorter sentences and familiar words,
 * "rich" more words, description and dialogue. Both are meant to be read aloud as well.
 */
export type LanguageLevel = 'simple' | 'rich'

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

export type EventKind = 'forest' | 'ski' | 'visit' | 'performance' | 'hobby' | 'baking' | 'party' | 'custom'

/** A real family event the letters should know about, e.g. a trip to the forest on 12 December. */
export interface FamilyEvent {
  id: string
  date: string
  kind: EventKind
  /** Optional detail written by the parent, e.g. "vanaema juurde Valka" or "judotrenn". */
  title: string
  /** Children taking part; empty = everybody. */
  participants: string[]
}

export type ChallengeKind = 'no-sweets' | 'tidy' | 'custom'

/** A personal challenge for one child over a few days, e.g. a sweets-free weekend. */
export interface ChildChallenge {
  id: string
  childId: string
  kind: ChallengeKind
  start: string
  end: string
  /** For "custom": what the challenge is, e.g. "magan oma voodis". */
  title: string
}

/** "shared": one letter for all children; "linked": each child gets their own series, coordinated with siblings. */
export type LetterMode = 'shared' | 'linked'

export interface LetterOptions {
  sender: string
  startDate: string
  /** 1–24 letters; 7 or more are written by the scenario engine as one series. */
  count: number
  connected: boolean
  /**
   * false: the letters show no date, only their number ("3. kiri"). The start date still counts
   * for Sundays, family events and Christmas Eve. Missing means dated, as before.
   */
  dated?: boolean
  /** Only used with several children. Missing in creations made before this feature. */
  mode?: LetterMode
  /** Helper per child id in linked mode; missing entries are suggested automatically. */
  personas?: Record<string, ElfPersona>
  /** Family events on specific dates; the letter of that day talks about them. */
  events?: FamilyEvent[]
  /** House rule: sweets only on Sundays – the Sunday letters say so. */
  sundaySweets?: boolean
  /** Personal challenges for one child each. */
  challenges?: ChildChallenge[]
  /**
   * Language per child id; a child without an entry gets `defaultLanguage`, else the one
   * suggested by age and reading ability (`languageFor`). Missing in creations made before this choice.
   */
  language?: Record<string, LanguageLevel>
  /**
   * Language of a child without an entry in `language`. New creations write "rich", so the first
   * letters are full ones even for a toddler; missing in older creations, which keep the
   * suggestion by age and reading ability.
   */
  defaultLanguage?: LanguageLevel
  /**
   * The parent's own choice: the oldest reader becomes the elves' secret helper with missions
   * for the younger ones, and supports a sibling's challenge in secret. Off unless chosen.
   */
  secretHelper?: boolean
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
