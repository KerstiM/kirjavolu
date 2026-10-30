import type { ContentTypeId } from './content'

export type OccasionId =
  | 'christmas'
  | 'easter'
  | 'birthday'
  | 'halloween'
  | 'mardi-kadri'
  | 'vastlapaev'
  | 'valentines'
  | 'school-start'
  | 'summer'
  | 'lost-tooth'
  | 'everyday'

export interface OccasionVocabulary {
  /** Nouns in nominative singular used in clues, anagrams and stories. */
  words: string[]
  /** Short atmosphere phrases that can stand as full sentences. */
  moods: string[]
  /** Phrase used as "Head ___!" or similar greeting. */
  greeting: string
  /** Default magical sender, e.g. "Päkapikk Tuduja". */
  sender: string
  /** Short description of the sender's home, used in letters. */
  senderHome: string
  /** Default prize for treasure hunts. */
  prize: string
}

export interface OccasionIdea {
  label: string
  type: ContentTypeId
}

export interface Occasion {
  id: OccasionId
  name: string
  /** Hint when the occasion happens. */
  when: string
  description: string
  icon: string
  /** Content types ordered by relevance; first ones are highlighted. */
  suggested: ContentTypeId[]
  /** Quick-start ideas shown on the homepage. */
  ideas: OccasionIdea[]
  vocabulary: OccasionVocabulary
}
