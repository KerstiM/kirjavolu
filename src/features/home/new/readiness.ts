import type { ContentTypeId } from '../../../domain/models'

/**
 * Which kinds of creation the new design offers yet. The rest are shown gray with a label, so
 * it is plain what still needs work; their wizard links stay off until they are ready.
 */
export const READY_TYPES: readonly ContentTypeId[] = ['letter', 'story']

export const isReady = (type: ContentTypeId) => READY_TYPES.includes(type)

/** The label on a gray card. */
export const NOT_READY_LABEL = 'Töös'

/**
 * What the Jõulupass adds, marked on the cards; everything else is free and unmarked.
 * "only": just with the pass; "extra": free from templates, personal with the pass.
 */
export const PASS_MARK: Partial<Record<ContentTypeId, 'only' | 'extra'>> = { letter: 'extra', story: 'only' }

/** Coming with the Jõulupass: shown as a gray card on the home page, not in the wizard. */
export const COMING_SOON = [
  {
    id: 'santa-greeting',
    title: 'Jõuluvana tervitus',
    tagline: 'Isiklik tervitus jõuluvanalt, Jõulupassiga',
    description: 'Jõuluvana pöördub lapse poole nimepidi ja teab, mida ta sel aastal õppis ja tegi.',
    icon: 'Gift',
    label: 'Varsti',
  },
] as const
