import type { AgeBand, Length, OccasionId, Tone } from '../models'
import type { NameCase } from '../text/estonian'

/**
 * Scenario-based story model. A scenario is one complete, hand-written event
 * (setup → incident → development → resolution) with explicit variation points.
 * Variation happens inside a scenario, never by mixing paragraphs of different
 * scenarios. See docs/scenario-engine.md.
 */

export type Band = AgeBand

/** Personalization hooks a scenario can carry; matched from the child profile (see hooks.ts). */
export type HookId =
  | 'rubik'
  | 'codes'
  | 'riddles'
  | 'comics'
  | 'porridge'
  | 'peppa'
  | 'animals'
  | 'lego'
  | 'space'
  | 'drawing'
  | 'music'

/**
 * The other helpers of the shared world, by role. In a family series these are the
 * siblings' own helpers; otherwise workshop elves who stand in for them.
 */
export interface Cast {
  /** The old, thoughtful elf (the oldest reader's helper). */
  older: string
  /** The young, lively elf (a younger reader's helper). */
  young: string
  /** The tiniest elf (a toddler's helper). */
  tiny: string
}

/** Everything a scenario variant may use. Built by the renderer from the plan. */
export interface ScenarioContext {
  /** Child's name, nominative. */
  name: string
  /** Child's name in another case: n('genitive') → "Rubeni". */
  n: (form: NameCase) => string
  /** The narrator: this child's own helper. */
  helper: string
  cast: Cast
  /** Brothers and sisters, nominative, joined: "Ruben ja Jasper". Empty when none. */
  siblings: string
  siblingCount: number
  /** True when the plan activated this personalization hook for this letter. */
  uses: (hook: HookId) => boolean
  /** True when this child has already been told this fact in an earlier letter. */
  knows: (fact: string) => boolean
  /** True when the fact happened in the shared world before today (told to any child). */
  happened: (fact: string) => boolean
  /** Stable choice of a minor detail; changes only when the item is regenerated. */
  pick: <T>(options: readonly T[]) => T
  length: Length
  frame: FrameContext
}

/** Facts only the opening and closing letters need. */
export interface FrameContext {
  /** Helper's title, e.g. "Kuubikuvõlur"; empty in a single-child series. */
  title: string
  /** Who the helper is, e.g. "Jõuluvana töökoja kõige vanem päkapikk"; may be empty. */
  origin: string
  /** "Jasperi juures Tipp-Topp Riisiterake ja Brita juures Pisi-Pätsi Roosaninake"; empty without siblings. */
  siblingHelpers: string
  /** "Kõpsu-Mõpsu, Tipp-Topp ja Pisi-Pätsi"; empty in a single-child series. */
  allHelpers: string
  /** The letter is dated 24 December. */
  eve: boolean
}

export type Paragraph = string | false | null | undefined
export type Variant = (c: ScenarioContext) => Paragraph[]
export type Text = (c: ScenarioContext) => string

/** Optional activity that belongs to the scenario's story. */
export interface Activity {
  text: Text
  /** Solution for the parent sheet. */
  answer?: string
  /** Postscript for the next letter. Must never claim the child answered. */
  reveal?: Text
  /** What the parent prepares. */
  prep?: string
  /** Part of the story itself (e.g. the coded note): always included. */
  essential?: boolean
  /** Self-check for puzzles: true when the answer really solves the puzzle. */
  check?: () => boolean
}

export type NarrativeRole =
  | 'introduction'
  | 'standalone'
  | 'discovery'
  | 'development'
  | 'complication'
  | 'climax'
  | 'resolution'
  | 'farewell'

export interface Scenario {
  id: string
  title: string
  occasions: OccasionId[]
  role: NarrativeRole
  /** One complete text per age band. A missing band means the scenario does not suit it. */
  variants: Partial<Record<Band, Variant>>
  /**
   * Longer toddler text for a child of about 3, read aloud by an adult: a few short
   * paragraphs instead of one card line. Without it the toddler variant is used.
   */
  readAloud?: Variant
  activities?: Partial<Record<Band, Activity>>
  /** Hooks that can make this scenario personal. */
  hooks?: HookId[]
  /** Only for children who have one of the hooks (the story is about that interest). */
  onlyWithHook?: boolean
  /** Motifs used to avoid similar letters on neighbouring days: 'reindeer', 'kitchen' … */
  tags: string[]
  tones?: Tone[]
  /**
   * A canonical event of the shared world: told on one day only, to every child who
   * hears it (each from their own helper's perspective).
   */
  world?: boolean
  /** Needs brothers or sisters (the letter talks about them). */
  needsSiblings?: boolean
  /** World facts that must be established before this letter. */
  requires?: string[]
  /** Not valid once this fact is established (e.g. "star still missing" after it is found). */
  until?: string
  /** World facts this letter establishes. */
  establishes?: string[]
  /** Earliest day index (the child first gets to know their own helper). */
  earliest?: number
}

export interface ArcStage {
  id: string
  scenarioId: string
  /** Target position in the series, 0…1. */
  at: number
  /** Kept in short (7-day) series. */
  required?: boolean
  /** Told to every child on the same day (one canonical event). */
  shared?: boolean
}

/** A story told across several letters, stage by stage, in a fixed order. */
export interface StoryArc {
  id: string
  title: string
  occasions: OccasionId[]
  stages: ArcStage[]
  /** Fact that resolves the arc; validation reports an arc that never reaches it. */
  resolves: string
}
