import type { ChildProfile } from '../models'
import { pickedTopics, TOPICS } from '../../data/topics'
import type { HookId } from './types'

/**
 * A personalization hook: a profile fact a scenario can build its story around.
 * `match` finds it in the profile; `mentions` finds it in a written letter, so the
 * validator can report a letter that talks about an interest the plan did not choose
 * (or the child does not have).
 */
export interface PersonalHook {
  id: HookId
  label: string
  match: RegExp
  /** Profile fields searched for the hook. */
  fields: (keyof Pick<ChildProfile, 'interests' | 'favorites' | 'foods' | 'details'>)[]
  mentions: RegExp
}

/** Every topic of the list is a hook; food topics are looked for among foods. */
export const PERSONAL_HOOKS: PersonalHook[] = TOPICS.map((topic) => ({
  id: topic.id,
  label: topic.label,
  match: topic.match,
  fields: topic.group === 'food' ? ['foods', 'details'] : ['interests', 'favorites', 'details'],
  mentions: topic.mentions,
}))

export function getHook(id: HookId): PersonalHook {
  const hook = PERSONAL_HOOKS.find((candidate) => candidate.id === id)
  if (!hook) throw new Error(`Unknown hook ${id}`)
  return hook
}

/**
 * Hooks supported by the child's profile: the picked topics, and topics found in the
 * free-text fields. Only these may be used in the child's letters.
 */
export function profileHooks(child: ChildProfile): Set<HookId> {
  const result = new Set<HookId>(pickedTopics(child).map((topic) => topic.id))
  for (const hook of PERSONAL_HOOKS) {
    const texts = hook.fields.flatMap((field) => {
      const value = child[field]
      return Array.isArray(value) ? value : [value]
    })
    if (texts.some((text) => hook.match.test(text))) result.add(hook.id)
  }
  return result
}
