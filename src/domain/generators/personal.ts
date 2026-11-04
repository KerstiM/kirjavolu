import type { ChildProfile } from '../models'
import {
  findInterestHooks,
  foodLines,
  genericInterestLine,
  INTEREST_HOOKS,
  type Say,
} from '../../data/templates/interests'
import { allNoteTexts, foodTexts, interestTexts, storyTopics, TOPICS } from '../../data/topics'
import type { Audience } from './audience'
import { ageBand } from './audience'
import { lowerFirst } from './context'

const singular: Say = (s) => s

function unmatched(texts: string[]): string[] {
  return texts.filter((text) => !INTEREST_HOOKS.some((hook) => hook.match.test(text)))
}

/**
 * Personal sentences for one child, written in singular address. A picked topic
 * the templates have no lines for brings its own little story from the topic list
 * (the narrower one when the parent named it, e.g. Peppa under the cartoons);
 * those are told in the helper's own voice, so they are kept out of shared letters
 * (`named`), where every line starts with the child's name.
 */
export function childLines(child: ChildProfile, named = false): string[] {
  const topics = storyTopics(child)
  // The parent's words under a topic that no story knows ("Uno") are quoted like free text.
  const looseNotes = allNoteTexts(child).filter(
    (text) => !TOPICS.some((topic) => topic.within && topic.match.test(text)),
  )
  const free = [...child.favorites, ...child.interests, ...looseNotes]
  if (ageBand(child) === 'toddler') {
    const lines = named ? [] : topics.map((topic) => topic.toddlerTryout)
    const quoted = named ? [...topics.map((topic) => topic.label), ...free] : free
    return [...lines, ...quoted.map((favorite) => `Kuulsin sinu lemmikust: „${favorite}“. See meeldib mulle ka!`)]
  }
  const hooks = findInterestHooks(interestTexts(child))
  const ownStory = topics.filter((topic) => findInterestHooks([topic.label]).length === 0)
  return [
    ...hooks.flatMap((hook) => hook.letterLines.map((line) => line(singular))),
    ...(named
      ? ownStory.map((topic) => genericInterestLine(topic.label, singular))
      : ownStory.map((topic) => topic.tryout)),
    ...unmatched(free).map((text) => genericInterestLine(text, singular)),
    ...foodTexts(child).flatMap((food) => foodLines(food, singular)),
    ...child.achievements.map(
      (achievement) =>
        `Kuulsin ka ühest saavutusest, mille üle võid väga uhke olla: „${achievement}“. Palju õnne!`,
    ),
  ]
}

/**
 * Personal sentences for the whole audience. In a shared experience every line
 * is addressed to one child by name ("Markus, kuulsin, et …").
 */
export function audienceLines(audience: Audience): string[] {
  return audience.children.flatMap((child) =>
    childLines(child, audience.plural).map((line) =>
      audience.plural ? `${child.name}, ${lowerFirst(line)}` : line,
    ),
  )
}
