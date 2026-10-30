import type { ChildProfile } from '../models'
import {
  findInterestHooks,
  foodLine,
  genericInterestLine,
  INTEREST_HOOKS,
  type Say,
} from '../../data/templates/interests'
import type { Audience } from './audience'
import { ageBand } from './audience'
import { lowerFirst } from './context'

const singular: Say = (s) => s

function unmatched(texts: string[]): string[] {
  return texts.filter((text) => !INTEREST_HOOKS.some((hook) => hook.match.test(text)))
}

/** Personal sentences for one child, written in singular address. */
export function childLines(child: ChildProfile): string[] {
  if (ageBand(child) === 'toddler') {
    return [
      ...[...child.favorites, ...child.interests].map((favorite) => `Kuulsin sinu lemmikust: „${favorite}“. See meeldib mulle ka!`),
    ]
  }
  const hooks = findInterestHooks([...child.interests, ...child.favorites])
  return [
    ...hooks.flatMap((hook) => hook.letterLines.map((line) => line(singular))),
    ...unmatched([...child.interests, ...child.favorites]).map((text) => genericInterestLine(text, singular)),
    ...child.foods.map((food) => foodLine(food, singular)),
    ...child.achievements.map(
      (achievement) =>
        `Kuulsin ka ühest saavutusest, mille üle võid väga uhke olla: „${achievement}“. Palju õnne!`,
    ),
  ]
}

/**
 * Personal sentences for the whole audience. In a shared experience every line
 * is addressed to one child by name ("Ruben, kuulsin, et …").
 */
export function audienceLines(audience: Audience): string[] {
  return audience.children.flatMap((child) =>
    childLines(child).map((line) => (audience.plural ? `${child.name}, ${lowerFirst(line)}` : line)),
  )
}
