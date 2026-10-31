import type { ChildProfile } from '../models'
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

export const PERSONAL_HOOKS: PersonalHook[] = [
  {
    id: 'rubik',
    label: 'Rubiku kuubik',
    match: /rubik|kuubik/i,
    fields: ['interests', 'favorites'],
    mentions: /(?<!jää)kuubik/i,
  },
  {
    id: 'codes',
    label: 'salakoodid',
    match: /salakood|kood|šifr|salakiri/i,
    fields: ['interests', 'favorites'],
    mentions: /salakoodi|koodimeist/i,
  },
  {
    id: 'riddles',
    label: 'mõistatused',
    match: /mõistatus|nuputa|nuputamis/i,
    fields: ['interests', 'favorites', 'details'],
    mentions: /mõistatusesõb|nuputaja/i,
  },
  {
    id: 'comics',
    label: 'Miki Hiire koomiksid',
    match: /miki|mickey|koomiks|donald/i,
    fields: ['interests', 'favorites'],
    mentions: /miki hii|koomiksisõb|koomiksilugeja/i,
  },
  {
    id: 'porridge',
    label: 'riisipuder',
    match: /riisipu/i,
    fields: ['foods', 'details'],
    mentions: /riisipu/i,
  },
  {
    id: 'peppa',
    label: 'Põrsas Peppa',
    match: /peppa|põrsa/i,
    fields: ['interests', 'favorites'],
    mentions: /peppa/i,
  },
  {
    id: 'animals',
    label: 'loomad',
    match: /loom|kass|koer|hobu/i,
    fields: ['interests', 'favorites'],
    mentions: /loomasõb/i,
  },
  {
    id: 'lego',
    label: 'klotsid',
    match: /lego|klots/i,
    fields: ['interests', 'favorites'],
    mentions: /klotsimeist|klotsiehit/i,
  },
  {
    id: 'space',
    label: 'kosmos',
    match: /kosmos|planeet|raket|astronau/i,
    fields: ['interests', 'favorites'],
    mentions: /astronau|planeedi/i,
  },
  {
    id: 'drawing',
    label: 'joonistamine',
    match: /joonist|maali|kunst/i,
    fields: ['interests', 'favorites'],
    mentions: /kunstnik/i,
  },
  {
    id: 'music',
    label: 'muusika',
    match: /muusik|laul|klaver|pill/i,
    fields: ['interests', 'favorites'],
    mentions: /muusik/i,
  },
]

export function getHook(id: HookId): PersonalHook {
  const hook = PERSONAL_HOOKS.find((candidate) => candidate.id === id)
  if (!hook) throw new Error(`Unknown hook ${id}`)
  return hook
}

/** Hooks supported by the child's profile. Only these may be used in the child's letters. */
export function profileHooks(child: ChildProfile): Set<HookId> {
  const result = new Set<HookId>()
  for (const hook of PERSONAL_HOOKS) {
    const texts = hook.fields.flatMap((field) => {
      const value = child[field]
      return Array.isArray(value) ? value : [value]
    })
    if (texts.some((text) => hook.match.test(text))) result.add(hook.id)
  }
  return result
}
